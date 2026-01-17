-- Rollback to Simple Archive Approach
-- This removes the supabase_user_id column and keeps only archived_at
-- Profile.id will be the same as auth.users.id

-- Step 1: Drop the supabase_user_id column and its index
DROP INDEX IF EXISTS profiles_supabase_user_id_idx;
ALTER TABLE profiles DROP COLUMN IF EXISTS supabase_user_id;

-- Step 2: Ensure archived_at column exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS archived_at timestamp with time zone;

-- Step 3: Ensure status column and index exist
CREATE INDEX IF NOT EXISTS profiles_status_idx ON profiles USING btree (status);

-- Step 4: Restore original trigger - profile.id = auth.users.id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, status, created_at, updated_at)
  VALUES (
    new.id,  -- Use auth.users.id directly as profile.id
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url',
    'active',
    now(),
    now()
  );
  RETURN new;
END;
$$;

-- Step 5: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
