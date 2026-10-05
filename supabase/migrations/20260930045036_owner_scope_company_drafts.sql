-- Keep unfinished company registration details private to their owner.
-- Public company cards continue to read verified companies.
DROP POLICY IF EXISTS companies_select_all ON public.companies;

CREATE POLICY companies_select_verified_or_owner ON public.companies
  FOR SELECT TO public
  USING (verified = true OR owner_id = (SELECT auth.uid()));
