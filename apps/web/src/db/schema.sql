-- StellarJob — canonical schema
-- Source of truth: src/db/erd.md and the product data model
--
-- This file is NOT auto-applied. Copy relevant blocks into a versioned
-- Supabase migration and apply it through the migration workflow.
--
-- Rules encoded here (must stay true if you edit):
--   • Every CREATE TABLE in public.* is followed by explicit GRANTs.
--   • RLS is enabled on every user-data table.
--   • Public listings (companies, jobs, job_skills) grant SELECT to anon.
--   • Owner-scoped tables scope every policy to auth.uid().
--   • Roles, if/when added, live in a separate user_roles table with a
--     has_role(uuid, app_role) security-definer function — never a column
--     on profiles.

-- =========================================================================
-- 1. ENUMS
-- =========================================================================

create type public.work_model as enum ('remote', 'hybrid', 'onsite');

create type public.employment_type as enum (
  'full_time', 'part_time', 'contract', 'internship'
);

create type public.application_status as enum (
  'applied', 'reviewing', 'interview', 'offer', 'not_selected', 'closed'
);

-- =========================================================================
-- 2. PROFILES  (1:1 with auth.users, created via trigger on signup)
-- =========================================================================

create table public.profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text,
  headline           text,
  city               text,
  phone              text,
  avatar_url         text,
  summary            text,
  min_salary         integer,
  work_model_prefs   public.work_model[] default '{}',
  locations          text[]              default '{}',
  cv_url             text,
  cv_updated_at      timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

grant select, insert, update, delete on public.profiles to authenticated;
grant all on public.profiles to service_role;

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "profiles: insert own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data ->> 'display_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================================
-- 3. COMPANIES  (public read)
-- =========================================================================

create table public.companies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  logo_url    text,
  verified    boolean not null default false,
  about       text,
  size        text,
  industries  text[] default '{}',
  created_at  timestamptz not null default now()
);

grant select on public.companies to anon;
grant select on public.companies to authenticated;
grant all    on public.companies to service_role;

alter table public.companies enable row level security;

create policy "companies: public read"
  on public.companies for select
  to anon, authenticated
  using (true);

-- =========================================================================
-- 4. JOBS  (public read)
-- =========================================================================

create table public.jobs (
  id               uuid primary key default gen_random_uuid(),
  company_id       uuid not null references public.companies(id) on delete cascade,
  title            text not null,
  category         text not null,
  city             text not null,
  work_model       public.work_model not null,
  employment_type  public.employment_type not null,
  salary_min       integer,
  salary_max       integer,
  perks            text[] default '{}',
  about            text,
  responsibilities text[] default '{}',
  requirements     text[] default '{}',
  nice_to_have     text[] default '{}',
  promoted         boolean not null default false,
  posted_at        timestamptz not null default now(),
  created_at       timestamptz not null default now()
);

create index jobs_company_id_idx  on public.jobs(company_id);
create index jobs_posted_at_idx   on public.jobs(posted_at desc);
create index jobs_city_idx        on public.jobs(city);
create index jobs_category_idx    on public.jobs(category);

grant select on public.jobs to anon;
grant select on public.jobs to authenticated;
grant all    on public.jobs to service_role;

alter table public.jobs enable row level security;

create policy "jobs: public read"
  on public.jobs for select
  to anon, authenticated
  using (true);

-- =========================================================================
-- 5. JOB_SKILLS  (public read; for filtering)
-- =========================================================================

create table public.job_skills (
  id      uuid primary key default gen_random_uuid(),
  job_id  uuid not null references public.jobs(id) on delete cascade,
  skill   text not null,
  unique (job_id, skill)
);

create index job_skills_job_id_idx on public.job_skills(job_id);
create index job_skills_skill_idx  on public.job_skills(skill);

grant select on public.job_skills to anon;
grant select on public.job_skills to authenticated;
grant all    on public.job_skills to service_role;

alter table public.job_skills enable row level security;

create policy "job_skills: public read"
  on public.job_skills for select
  to anon, authenticated
  using (true);

-- =========================================================================
-- 6. APPLICATIONS  (owner-only)
-- =========================================================================

create table public.applications (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null references auth.users(id) on delete cascade,
  job_id             uuid not null references public.jobs(id) on delete cascade,
  cv_url             text,
  note               text,
  status             public.application_status not null default 'applied',
  submitted_at       timestamptz not null default now(),
  next_action_at     timestamptz,
  next_action_label  text,
  unique (user_id, job_id)
);

create index applications_user_id_idx on public.applications(user_id);
create index applications_job_id_idx  on public.applications(job_id);
create index applications_status_idx  on public.applications(status);

grant select, insert, update, delete on public.applications to authenticated;
grant all on public.applications to service_role;

alter table public.applications enable row level security;

create policy "applications: read own"
  on public.applications for select
  to authenticated
  using (auth.uid() = user_id);

create policy "applications: insert own"
  on public.applications for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "applications: update own"
  on public.applications for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "applications: delete own"
  on public.applications for delete
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================================
-- 7. SAVED_JOBS  (owner-only)
-- =========================================================================

create table public.saved_jobs (
  id        uuid primary key default gen_random_uuid(),
  user_id   uuid not null references auth.users(id) on delete cascade,
  job_id    uuid not null references public.jobs(id) on delete cascade,
  saved_at  timestamptz not null default now(),
  unique (user_id, job_id)
);

create index saved_jobs_user_id_idx on public.saved_jobs(user_id);

grant select, insert, delete on public.saved_jobs to authenticated;
grant all on public.saved_jobs to service_role;

alter table public.saved_jobs enable row level security;

create policy "saved_jobs: read own"
  on public.saved_jobs for select
  to authenticated
  using (auth.uid() = user_id);

create policy "saved_jobs: insert own"
  on public.saved_jobs for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "saved_jobs: delete own"
  on public.saved_jobs for delete
  to authenticated
  using (auth.uid() = user_id);

-- =========================================================================
-- 8. EXPERIENCE / EDUCATION / SKILLS  (all owner-only)
-- =========================================================================

create table public.experience (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  company      text not null,
  title        text not null,
  city         text,
  start_date   date,
  end_date     date,
  description  text,
  sort_order   integer not null default 0
);

create index experience_user_id_idx on public.experience(user_id);

grant select, insert, update, delete on public.experience to authenticated;
grant all on public.experience to service_role;

alter table public.experience enable row level security;

create policy "experience: read own"   on public.experience for select to authenticated using (auth.uid() = user_id);
create policy "experience: insert own" on public.experience for insert to authenticated with check (auth.uid() = user_id);
create policy "experience: update own" on public.experience for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "experience: delete own" on public.experience for delete to authenticated using (auth.uid() = user_id);

create table public.education (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  degree       text not null,
  school       text not null,
  city         text,
  start_year   integer,
  end_year     integer
);

create index education_user_id_idx on public.education(user_id);

grant select, insert, update, delete on public.education to authenticated;
grant all on public.education to service_role;

alter table public.education enable row level security;

create policy "education: read own"   on public.education for select to authenticated using (auth.uid() = user_id);
create policy "education: insert own" on public.education for insert to authenticated with check (auth.uid() = user_id);
create policy "education: update own" on public.education for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "education: delete own" on public.education for delete to authenticated using (auth.uid() = user_id);

create table public.skills (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  label       text not null,
  sort_order  integer not null default 0,
  unique (user_id, label)
);

create index skills_user_id_idx on public.skills(user_id);

grant select, insert, update, delete on public.skills to authenticated;
grant all on public.skills to service_role;

alter table public.skills enable row level security;

create policy "skills: read own"   on public.skills for select to authenticated using (auth.uid() = user_id);
create policy "skills: insert own" on public.skills for insert to authenticated with check (auth.uid() = user_id);
create policy "skills: update own" on public.skills for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "skills: delete own" on public.skills for delete to authenticated using (auth.uid() = user_id);
