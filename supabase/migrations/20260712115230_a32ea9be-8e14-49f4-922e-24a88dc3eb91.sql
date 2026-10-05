-- Account type for profiles (applicant vs employer)
CREATE TYPE public.account_type AS ENUM ('applicant', 'employer');

ALTER TABLE public.profiles
  ADD COLUMN account_type public.account_type NOT NULL DEFAULT 'applicant';

-- Update the new-user trigger to honor account_type from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  meta_type text;
  final_type public.account_type;
BEGIN
  meta_type := new.raw_user_meta_data ->> 'account_type';
  IF meta_type = 'employer' THEN
    final_type := 'employer';
  ELSE
    final_type := 'applicant';
  END IF;

  INSERT INTO public.profiles (id, display_name, avatar_url, account_type)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url',
    final_type
  );
  RETURN new;
END;
$$;