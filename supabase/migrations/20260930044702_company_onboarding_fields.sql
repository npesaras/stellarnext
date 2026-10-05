
-- Extend companies with owner + registration fields
ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS owner_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS company_type text,
  ADD COLUMN IF NOT EXISTS country text,
  ADD COLUMN IF NOT EXISTS state_province text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

CREATE INDEX IF NOT EXISTS companies_owner_id_idx ON public.companies(owner_id);

-- Allow slug to be nullable during onboarding drafts (kept unique when set)
ALTER TABLE public.companies ALTER COLUMN slug DROP NOT NULL;

-- Owner-scoped RLS in addition to existing public read
DROP POLICY IF EXISTS "companies: owner insert" ON public.companies;
CREATE POLICY "companies: owner insert" ON public.companies
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "companies: owner update" ON public.companies;
CREATE POLICY "companies: owner update" ON public.companies
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

DROP POLICY IF EXISTS "companies: owner delete" ON public.companies;
CREATE POLICY "companies: owner delete" ON public.companies
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

GRANT INSERT, UPDATE, DELETE ON public.companies TO authenticated;

-- updated_at trigger
DROP TRIGGER IF EXISTS companies_set_updated_at ON public.companies;
CREATE TRIGGER companies_set_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
