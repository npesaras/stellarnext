-- Evaluate the signed-in user once per statement in owner-scoped policies.
DROP POLICY IF EXISTS "companies: owner insert" ON public.companies;
CREATE POLICY "companies: owner insert" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "companies: owner update" ON public.companies;
CREATE POLICY "companies: owner update" ON public.companies
  FOR UPDATE TO authenticated
  USING (owner_id = (SELECT auth.uid()))
  WITH CHECK (owner_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "companies: owner delete" ON public.companies;
CREATE POLICY "companies: owner delete" ON public.companies
  FOR DELETE TO authenticated
  USING (owner_id = (SELECT auth.uid()));
