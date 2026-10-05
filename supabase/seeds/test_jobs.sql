-- One-time, repeatable TEST data for the StellarJob jobs UI and application flow.
-- Run in the SQL editor of the Supabase project configured by apps/web/.env.
-- Do not use supabase/config.toml to target this project: its legacy project_id differs.
-- These rows live in Supabase, not in application code. The fixed IDs make reruns safe.

begin;

insert into public.companies (id, name, slug, verified, about, size, industries)
values (
  '65f2b115-636e-41d3-aae6-c20fd71a99e6',
  'StellarJob Test Company',
  'stellarjob-test-company-65f2b115',
  false,
  'Fictional company used only to test StellarJob job browsing and applications.',
  '1-10',
  array['Testing']::text[]
)
on conflict (id) do nothing;

insert into public.jobs (
  id, company_id, title, category, city, work_model, employment_type,
  salary_min, salary_max, about, responsibilities, requirements,
  nice_to_have, perks, promoted
)
values
  (
    '276a58d7-0d63-47bd-9384-4c23027866a8',
    '65f2b115-636e-41d3-aae6-c20fd71a99e6',
    '[TEST] Frontend Developer', 'Engineering', 'Metro Manila',
    'remote', 'full_time', 50000, 80000,
    'Fictional role for testing the complete job application flow. This is not a real vacancy.',
    array['Build accessible interfaces', 'Review pull requests', 'Collaborate with designers']::text[],
    array['React and TypeScript experience', 'Understanding of responsive layouts']::text[],
    array['Experience with TanStack Router']::text[],
    array['Flexible schedule', 'Remote work']::text[],
    false
  ),
  (
    'b8ae1a8b-70a6-46f2-9bfe-79a84db22277',
    '65f2b115-636e-41d3-aae6-c20fd71a99e6',
    '[TEST] Product Designer', 'Design', 'Cebu City',
    'hybrid', 'full_time', 45000, 70000,
    'Fictional role for testing job details, saving, and applications. This is not a real vacancy.',
    array['Create user flows and prototypes', 'Run usability reviews', 'Maintain design components']::text[],
    array['Portfolio of product design work', 'Experience with accessible design']::text[],
    array['Figma design system experience']::text[],
    array['Hybrid schedule', 'Learning budget']::text[],
    false
  ),
  (
    '756281a6-037a-4a17-abf4-3ba661275852',
    '65f2b115-636e-41d3-aae6-c20fd71a99e6',
    '[TEST] Customer Support Specialist', 'Customer Support', 'Davao City',
    'onsite', 'full_time', 28000, 38000,
    'Fictional role for testing search filters and application status. This is not a real vacancy.',
    array['Respond to customer questions', 'Document common issues', 'Escalate complex cases']::text[],
    array['Clear written communication', 'Comfort with support tools']::text[],
    array['Previous SaaS support experience']::text[],
    array['Training provided', 'Health coverage']::text[],
    false
  ),
  (
    'bf00b73b-bda2-4d29-99fb-14cc69aa34d2',
    '65f2b115-636e-41d3-aae6-c20fd71a99e6',
    '[TEST] Data Analyst', 'Data', 'Makati',
    'hybrid', 'contract', 40000, 65000,
    'Fictional contract role for testing different employment types. This is not a real vacancy.',
    array['Build reports and dashboards', 'Validate data quality', 'Explain insights to stakeholders']::text[],
    array['SQL proficiency', 'Spreadsheet analysis']::text[],
    array['Experience with PostgreSQL']::text[],
    array['Hybrid schedule']::text[],
    false
  ),
  (
    '3f2ab27b-2616-46ce-a00d-41ffb09bd703',
    '65f2b115-636e-41d3-aae6-c20fd71a99e6',
    '[TEST] Marketing Intern', 'Marketing', 'Quezon City',
    'remote', 'internship', 15000, 20000,
    'Fictional internship for testing entry-level applications. This is not a real vacancy.',
    array['Draft campaign content', 'Track campaign results', 'Support social media planning']::text[],
    array['Strong writing skills', 'Interest in digital marketing']::text[],
    array['Basic analytics experience']::text[],
    array['Mentorship', 'Remote work']::text[],
    false
  )
on conflict (id) do nothing;

commit;

-- Verification after running: the result should contain exactly five rows.
select id, title, city, work_model, employment_type
from public.jobs
where id in (
  '276a58d7-0d63-47bd-9384-4c23027866a8',
  'b8ae1a8b-70a6-46f2-9bfe-79a84db22277',
  '756281a6-037a-4a17-abf4-3ba661275852',
  'bf00b73b-bda2-4d29-99fb-14cc69aa34d2',
  '3f2ab27b-2616-46ce-a00d-41ffb09bd703'
)
order by title;
