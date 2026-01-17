-- Account Deletion Support Migration
-- Run this SQL directly in Supabase SQL Editor
-- This implements Apple/Meta account deletion requirements

-- Step 1: Add new columns to profiles table (if not exist)
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "supabase_user_id" uuid;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "archived_at" timestamp with time zone;

-- Step 2: Migrate existing data - set supabase_user_id to current id for existing profiles
-- This preserves the link between existing profiles and auth.users
UPDATE "profiles" SET "supabase_user_id" = "id" WHERE "supabase_user_id" IS NULL;

-- Step 3: Create index on supabase_user_id for efficient lookups
CREATE INDEX IF NOT EXISTS "profiles_supabase_user_id_idx" ON "profiles" USING btree ("supabase_user_id");

-- Step 4: Create index on status for filtering active profiles
CREATE INDEX IF NOT EXISTS "profiles_status_idx" ON "profiles" USING btree ("status");

-- Step 5: Update the trigger function to use new schema
-- The trigger now creates profiles with a separate supabase_user_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, supabase_user_id, email, full_name, avatar_url, status, created_at, updated_at)
  VALUES (
    gen_random_uuid(),  -- Generate new UUID for profile id
    new.id,             -- Store auth.users.id in supabase_user_id
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

-- Step 6: Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
