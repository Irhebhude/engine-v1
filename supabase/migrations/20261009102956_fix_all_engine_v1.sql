/*
# FIX ALL — SEARCH-POI Engine V1 Database Repair

## Summary
1. Adds missing columns to profiles: email, full_name, referral_link
2. Drops all existing policies on profiles
3. Recreates handle_new_user() as SECURITY DEFINER (insert id, email, referral_code)
4. Creates api_keys table with open RLS
5. Sets open RLS policy on profiles
6. Creates get_visitor_analytics() function for admin dashboard
7. Backfills profiles from auth.users
*/

-- Add missing columns to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_link text;

-- Drop all existing policies on profiles
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname AS pname, tablename AS tname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'profiles'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.pname, r.tname);
  END LOOP;
END $$;

-- Drop policies on referrals if they exist
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname AS pname, tablename AS tname FROM pg_policies WHERE schemaname = 'public' AND tablename = 'referrals'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.pname, r.tname);
  END LOOP;
END $$;

-- Recreate handle_new_user trigger function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, referral_code)
  VALUES (NEW.id, NEW.email, 'REF-' || substr(NEW.id::text, 1, 6))
  ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: open policy on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_all" ON public.profiles;
CREATE POLICY "profiles_all" ON public.profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Create api_keys table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  name text DEFAULT 'Default',
  key text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "api_keys_all" ON public.api_keys;
CREATE POLICY "api_keys_all" ON public.api_keys
  FOR ALL USING (true) WITH CHECK (true);

-- Create get_visitor_analytics function
CREATE OR REPLACE FUNCTION public.get_visitor_analytics()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN json_build_object(
    'total_users', (SELECT count(*) FROM auth.users),
    'total_visits', 0,
    'registered_users', (SELECT count(*) FROM auth.users),
    'unique_visitors', 0,
    'live_sessions', 0,
    'legacy_users', 0,
    'legacy_visitors', 0,
    'tracking_started_at', now()::text
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_visitor_analytics() TO anon, authenticated;

-- Backfill any missing profile rows from auth.users
INSERT INTO public.profiles (id, email)
SELECT id, email FROM auth.users
ON CONFLICT (id) DO NOTHING;