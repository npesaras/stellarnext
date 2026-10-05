BEGIN;
CREATE EXTENSION IF NOT EXISTS pgtap WITH SCHEMA extensions;
SET LOCAL search_path = public, extensions;

-- Auth's signup trigger creates the profile rows. The transaction rolls all
-- fixtures back; run this only against a local database after the migration.
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
    'security-applicant@test.invalid',
    '{"account_type":"applicant"}'::jsonb
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
    'security-employer@test.invalid',
    '{"account_type":"employer"}'::jsonb
  );

-- A real job row lets the application policy be tested end-to-end, including
-- its FK and server-side status default. These fixtures are rolled back below.
INSERT INTO public.companies (id, name, slug) VALUES (
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  'Security job fixture',
  'security-job-fixture'
);
INSERT INTO public.jobs (
  id, company_id, title, category, city, work_model, employment_type
) VALUES (
  'dddddddd-dddd-4ddd-8ddd-ddddddddddd4',
  'cccccccc-cccc-4ccc-8ccc-ccccccccccc3',
  'Security policy test job', 'Engineering', 'Remote', 'remote', 'full_time'
);

SELECT plan(55);

-- TRUNCATE bypasses RLS; neither browser-facing role may have it on any app
-- table, even if the table's row policies are otherwise correct.
SELECT ok(
  NOT has_table_privilege(api_role, table_name, 'TRUNCATE'),
  format('%s cannot truncate %s', api_role, table_name)
)
FROM (VALUES ('anon'), ('authenticated')) AS roles(api_role)
CROSS JOIN (VALUES
  ('public.applications'), ('public.certifications'), ('public.companies'),
  ('public.education'), ('public.experience'), ('public.job_skills'),
  ('public.jobs'), ('public.profiles'), ('public.saved_jobs'), ('public.skills')
) AS tables(table_name);

SELECT ok(NOT has_column_privilege('authenticated', 'public.profiles', 'account_type', 'UPDATE'), 'role is not owner-editable');
SELECT ok(has_column_privilege('authenticated', 'public.profiles', 'onboarding_completed_at', 'UPDATE'), 'guarded applicant completion is writable');
SELECT ok(NOT has_table_privilege('authenticated', 'public.profiles', 'INSERT'), 'profiles come only from signup trigger');
SELECT ok(NOT has_table_privilege('authenticated', 'public.profiles', 'DELETE'), 'applicants cannot delete their profile row');
SELECT ok(NOT has_column_privilege('authenticated', 'public.companies', 'verified', 'UPDATE'), 'owners cannot verify companies');
SELECT ok(NOT has_column_privilege('authenticated', 'public.companies', 'verified', 'INSERT'), 'owners cannot insert verified companies');
SELECT ok(has_column_privilege('authenticated', 'public.companies', 'owner_id', 'INSERT'), 'employers can create owned company drafts');
SELECT ok(NOT has_column_privilege('authenticated', 'public.companies', 'owner_id', 'UPDATE'), 'owners cannot transfer a company');
SELECT ok(NOT has_column_privilege('authenticated', 'public.applications', 'status', 'UPDATE'), 'applicants cannot advance status');
SELECT ok(NOT has_column_privilege('authenticated', 'public.applications', 'status', 'INSERT'), 'new applications use the default status');
SELECT ok(has_column_privilege('authenticated', 'public.applications', 'note', 'INSERT'), 'applicants may submit a note');
SELECT ok(NOT has_table_privilege('authenticated', 'public.applications', 'DELETE'), 'applicants cannot delete submitted applications');

SELECT is(
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND cmd = 'SELECT'),
  1::bigint,
  'verified-or-owner is the only company select policy'
);
SELECT is(
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = 'applications' AND cmd = 'INSERT'),
  1::bigint,
  'the restrictive application insert policy cannot be OR-bypassed'
);
SELECT ok(EXISTS (
  SELECT 1 FROM pg_trigger
  WHERE tgrelid = 'public.profiles'::regclass
    AND tgname = 'profiles_enforce_onboarding_completion'
    AND tgenabled = 'O'
), 'applicant completion trigger is enabled');
SELECT ok(EXISTS (
  SELECT 1 FROM pg_trigger
  WHERE tgrelid = 'public.companies'::regclass
    AND tgname = 'companies_enforce_onboarding_completion'
    AND tgenabled = 'O'
), 'company completion trigger is enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.profiles'::regclass), 'profile RLS remains enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.companies'::regclass), 'company RLS remains enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.applications'::regclass), 'application RLS remains enabled');

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';

SELECT throws_ok(
  $$INSERT INTO public.applications (user_id, job_id, note) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4', 'Too early')$$,
  '42501', NULL, 'incomplete applicant cannot apply'
);
SELECT throws_ok(
  $$UPDATE public.profiles SET onboarding_completed_at = '2100-01-01' WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,
  '23514', NULL, 'applicant cannot finish with incomplete persisted details'
);
SELECT lives_ok(
  $$UPDATE public.profiles SET first_name = 'Ada', last_name = 'Lovelace', city = 'London', country = 'United Kingdom' WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,
  'applicant can save editable profile basics'
);
SELECT lives_ok(
  $$UPDATE public.profiles SET onboarding_completed_at = '2100-01-01' WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,
  'applicant may finish after saving required fields'
);
SELECT ok((
  SELECT onboarding_completed_at BETWEEN now() - interval '1 minute' AND now()
  FROM public.profiles WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
), 'applicant completion uses database time, not client timestamp');
SELECT throws_ok(
  $$UPDATE public.profiles SET onboarding_completed_at = NULL WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,
  '42501', NULL, 'completed applicant timestamp cannot be cleared'
);
SELECT throws_ok(
  $$UPDATE public.profiles SET city = NULL WHERE id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'$$,
  '23514', NULL, 'completed applicant cannot invalidate required details'
);
SELECT lives_ok(
  $$INSERT INTO public.applications (user_id, job_id, note) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4', 'Ready to apply')$$,
  'completed applicant can apply'
);
SELECT is(
  (SELECT status::text FROM public.applications
   WHERE user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1'
     AND job_id = 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4'),
  'applied',
  'new application receives the server default status'
);

SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2';

SELECT throws_ok(
  $$INSERT INTO public.applications (user_id, job_id, note) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'dddddddd-dddd-4ddd-8ddd-ddddddddddd4', 'Employer attempt')$$,
  '42501', NULL, 'employer cannot apply'
);
SELECT lives_ok(
  $$INSERT INTO public.companies (owner_id, name, slug) VALUES ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2', 'Security fixture', 'security-hardening-fixture')$$,
  'employer can create an owned company draft'
);
SELECT throws_ok(
  $$UPDATE public.companies SET onboarding_completed_at = '2100-01-01' WHERE owner_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'$$,
  '23514', NULL, 'company cannot finish without required persisted details'
);
SELECT lives_ok(
  $$UPDATE public.companies SET company_type = 'Direct employer', country = 'Philippines', state_province = 'Metro Manila', address = '123 Main Street', onboarding_completed_at = '2100-01-01' WHERE owner_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'$$,
  'employer can finish after saving valid company details'
);
SELECT ok((
  SELECT onboarding_completed_at BETWEEN now() - interval '1 minute' AND now()
  FROM public.companies WHERE owner_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'
), 'company completion uses database time, not client timestamp');
SELECT throws_ok(
  $$UPDATE public.companies SET onboarding_completed_at = NULL WHERE owner_id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2'$$,
  '42501', NULL, 'completed company timestamp cannot be cleared'
);

SET LOCAL request.jwt.claim.sub = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
SELECT throws_ok(
  $$INSERT INTO public.companies (owner_id, name, slug) VALUES ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Not an employer', 'security-invalid-employer')$$,
  '42501', NULL, 'applicant cannot create a company via the Data API'
);

SELECT * FROM finish();
ROLLBACK;
