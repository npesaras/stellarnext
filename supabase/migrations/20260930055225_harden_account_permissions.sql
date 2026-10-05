-- The browser-facing authenticated role must not be able to promote itself,
-- verify its own company, or advance an application. RLS chooses rows; these
-- grants choose the columns that an owner may write.
-- The connected project's legacy ACLs granted ALL (including TRUNCATE) on
-- every app table to both API roles. Reset each table explicitly before
-- restoring only the operations used by the application.
REVOKE ALL PRIVILEGES ON
  public.jobs, public.job_skills, public.experience, public.education,
  public.skills, public.certifications, public.saved_jobs
  FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.jobs, public.job_skills TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON
  public.experience, public.education, public.skills, public.certifications
  TO authenticated;
GRANT SELECT, INSERT, DELETE ON public.saved_jobs TO authenticated;

-- Revoke ALL first: TRUNCATE, TRIGGER, REFERENCES, and MAINTAIN are not
-- row-scoped by RLS, and the connected project's legacy ACLs granted them.
REVOKE ALL PRIVILEGES ON public.profiles FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT UPDATE (
  display_name, headline, city, phone, avatar_url, summary, min_salary,
  work_model_prefs, locations, cv_url, cv_updated_at, first_name, last_name,
  country, street_address, postal_code, onboarding_completed_at
) ON public.profiles TO authenticated;

-- Profiles are created by the auth.users trigger, never by a Data API caller.
DROP POLICY IF EXISTS "profiles: insert own" ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_own ON public.profiles;

REVOKE ALL PRIVILEGES ON public.companies FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.companies TO anon, authenticated;
GRANT INSERT (
  owner_id, name, slug, company_type, country, state_province, address
) ON public.companies TO authenticated;
GRANT UPDATE (
  name, company_type, country, state_province, address, website, size, about,
  onboarding_completed_at
) ON public.companies TO authenticated;

-- The July schemas used different policy names locally and on the connected
-- project. Any old public-read policy would OR with the restricted policy.
DROP POLICY IF EXISTS "companies: public read" ON public.companies;
DROP POLICY IF EXISTS companies_select_all ON public.companies;
DROP POLICY IF EXISTS companies_select_verified_or_owner ON public.companies;
CREATE POLICY companies_select_verified_or_owner ON public.companies
  FOR SELECT TO anon, authenticated
  USING (verified = true OR owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "companies: owner insert" ON public.companies;
CREATE POLICY "companies: owner insert" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles AS profile
      WHERE profile.id = owner_id AND profile.account_type = 'employer'
    )
  );

DROP POLICY IF EXISTS "companies: owner update" ON public.companies;
CREATE POLICY "companies: owner update" ON public.companies
  FOR UPDATE TO authenticated
  USING (
    owner_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles AS profile
      WHERE profile.id = owner_id AND profile.account_type = 'employer'
    )
  )
  WITH CHECK (
    owner_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles AS profile
      WHERE profile.id = owner_id AND profile.account_type = 'employer'
    )
  );

DROP POLICY IF EXISTS "companies: owner delete" ON public.companies;

REVOKE ALL PRIVILEGES ON public.applications FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.applications TO authenticated;
GRANT INSERT (user_id, job_id, note) ON public.applications TO authenticated;

DROP POLICY IF EXISTS "applications: insert own" ON public.applications;
DROP POLICY IF EXISTS applications_insert_own ON public.applications;
CREATE POLICY "applications: insert own" ON public.applications
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles AS profile
      WHERE profile.id = user_id
        AND profile.account_type = 'applicant'
        AND profile.onboarding_completed_at IS NOT NULL
        AND NULLIF(BTRIM(profile.first_name), '') IS NOT NULL
        AND NULLIF(BTRIM(profile.last_name), '') IS NOT NULL
        AND NULLIF(BTRIM(profile.city), '') IS NOT NULL
        AND NULLIF(BTRIM(profile.country), '') IS NOT NULL
    )
  );

DROP POLICY IF EXISTS "applications: update own" ON public.applications;
DROP POLICY IF EXISTS "applications: delete own" ON public.applications;
DROP POLICY IF EXISTS applications_update_own ON public.applications;
DROP POLICY IF EXISTS applications_delete_own ON public.applications;

-- Completion remains a permitted column write because the existing wizard
-- uses the signed-in user's Supabase client. The trigger enforces the actual
-- transition against persisted data and substitutes database time. This makes
-- a direct REST write no more powerful than the wizard's final action.
CREATE OR REPLACE FUNCTION public.enforce_applicant_onboarding_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF current_user <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF NEW.account_type IS DISTINCT FROM OLD.account_type THEN
    RAISE EXCEPTION 'Account type cannot be changed'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.onboarding_completed_at IS NOT NULL
     AND NEW.onboarding_completed_at IS NULL THEN
    RAISE EXCEPTION 'Completed onboarding cannot be cleared'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.onboarding_completed_at IS NOT NULL THEN
    IF NEW.account_type <> 'applicant'
       OR NULLIF(pg_catalog.BTRIM(NEW.first_name), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.last_name), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.city), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.country), '') IS NULL THEN
      RAISE EXCEPTION 'Complete your name and location before finishing onboarding'
        USING ERRCODE = '23514';
    END IF;

    NEW.onboarding_completed_at := COALESCE(
      OLD.onboarding_completed_at,
      pg_catalog.now()
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_applicant_onboarding_completion()
  FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS profiles_enforce_onboarding_completion ON public.profiles;
CREATE TRIGGER profiles_enforce_onboarding_completion
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_applicant_onboarding_completion();

CREATE OR REPLACE FUNCTION public.enforce_company_onboarding_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  IF current_user <> 'authenticated' THEN
    RETURN NEW;
  END IF;

  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id
     OR NEW.verified IS DISTINCT FROM OLD.verified THEN
    RAISE EXCEPTION 'Company ownership and verification are managed separately'
      USING ERRCODE = '42501';
  END IF;

  IF OLD.onboarding_completed_at IS NOT NULL
     AND NEW.onboarding_completed_at IS NULL THEN
    RAISE EXCEPTION 'Completed onboarding cannot be cleared'
      USING ERRCODE = '42501';
  END IF;

  IF NEW.onboarding_completed_at IS NOT NULL THEN
    IF NULLIF(pg_catalog.BTRIM(NEW.name), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.company_type), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.country), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.state_province), '') IS NULL
       OR NULLIF(pg_catalog.BTRIM(NEW.address), '') IS NULL THEN
      RAISE EXCEPTION 'Complete your company details before finishing onboarding'
        USING ERRCODE = '23514';
    END IF;

    NEW.onboarding_completed_at := COALESCE(
      OLD.onboarding_completed_at,
      pg_catalog.now()
    );
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.enforce_company_onboarding_completion()
  FROM PUBLIC, anon, authenticated;
DROP TRIGGER IF EXISTS companies_enforce_onboarding_completion ON public.companies;
CREATE TRIGGER companies_enforce_onboarding_completion
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.enforce_company_onboarding_completion();
