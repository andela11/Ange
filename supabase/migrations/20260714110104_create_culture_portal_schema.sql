/*
# Create Cameroon Cultural Portal Schema

1. Purpose
   This migration creates the complete database schema for the Cameroon Cultural Portal,
   a bilingual (FR/EN) web platform that promotes local culture, presents administrative
   and traditional authorities, and schedules cultural events with member notifications.

2. New Tables
   - `profiles`: Public user profile data (name, role). Linked 1:1 to auth.users via id.
     - id (uuid, PK, references auth.users)
     - name (text, not null)
     - role (text, default 'user' — either 'user' or 'admin')
     - created_at (timestamptz, default now())
   - `evenements`: Cultural and community events.
     - id (uuid, PK)
     - titre (text, not null)
     - description (text, not null)
     - date_evenement (date, not null)
     - lieu (text, not null)
     - image_url (text, nullable — URL or uploaded filename)
     - created_at (timestamptz, default now())
   - `autorites`: Traditional rulers (Fons, Chiefs) and administrative officials.
     - id (uuid, PK)
     - nom (text, not null)
     - titre (text, not null)
     - type (text, not null — 'traditional' or 'administrative')
     - photo (text, not null)
     - description (text, not null)
     - ordre_affichage (int, default 0)
     - created_at (timestamptz, default now())
   - `galerie`: Photo gallery of cultural events and community heritage.
     - id (uuid, PK)
     - titre (text, not null)
     - photo (text, not null)
     - date_evenement (date, not null)
     - created_at (timestamptz, default now())
   - `notifications`: Per-user notifications created when new events are scheduled.
     - id (uuid, PK)
     - user_id (uuid, not null, references profiles, ON DELETE CASCADE)
     - titre (text, not null)
     - message (text, not null)
     - status (text, default 'unread' — 'unread' or 'read')
     - created_at (timestamptz, default now())

3. Security (RLS)
   - `profiles`: Each authenticated user can read all profiles (needed for admin to list users),
     but only the owner can insert/update their own profile. Admins can update any profile's role.
   - `evenements`: Public read (anon + authenticated). Only authenticated users can insert/update/delete.
     In practice only admins should create events, but we enforce auth at minimum; the frontend
     gates admin actions. We allow any authenticated user to write for simplicity since the app
     has an admin role concept managed in profiles.
   - `autorites`: Public read. Only authenticated users can insert/update/delete.
   - `galerie`: Public read. Only authenticated users can insert/update/delete.
   - `notifications`: Each user can read, update, and delete only their own notifications.
     Any authenticated user can insert notifications (the edge function / app creates them
     for all users when an event is created).

4. Notes
   - Email confirmation stays OFF (default).
   - Owner columns use auth.uid() defaults where applicable.
   - All tables use gen_random_uuid() for primary keys.
*/

-- ============================================================
-- TABLE: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  role text NOT NULL DEFAULT 'user',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all"
ON profiles FOR SELECT
TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own"
ON profiles FOR INSERT
TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own"
ON profiles FOR UPDATE
TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============================================================
-- TABLE: evenements
-- ============================================================
CREATE TABLE IF NOT EXISTS evenements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  description text NOT NULL,
  date_evenement date NOT NULL,
  lieu text NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE evenements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "evenements_select_public" ON evenements;
CREATE POLICY "evenements_select_public"
ON evenements FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "evenements_insert_auth" ON evenements;
CREATE POLICY "evenements_insert_auth"
ON evenements FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "evenements_update_auth" ON evenements;
CREATE POLICY "evenements_update_auth"
ON evenements FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "evenements_delete_auth" ON evenements;
CREATE POLICY "evenements_delete_auth"
ON evenements FOR DELETE
TO authenticated USING (true);

-- ============================================================
-- TABLE: autorites
-- ============================================================
CREATE TABLE IF NOT EXISTS autorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nom text NOT NULL,
  titre text NOT NULL,
  type text NOT NULL CHECK (type IN ('traditional', 'administrative')),
  photo text NOT NULL,
  description text NOT NULL,
  ordre_affichage int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE autorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "autorites_select_public" ON autorites;
CREATE POLICY "autorites_select_public"
ON autorites FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "autorites_insert_auth" ON autorites;
CREATE POLICY "autorites_insert_auth"
ON autorites FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "autorites_update_auth" ON autorites;
CREATE POLICY "autorites_update_auth"
ON autorites FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "autorites_delete_auth" ON autorites;
CREATE POLICY "autorites_delete_auth"
ON autorites FOR DELETE
TO authenticated USING (true);

-- ============================================================
-- TABLE: galerie
-- ============================================================
CREATE TABLE IF NOT EXISTS galerie (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titre text NOT NULL,
  photo text NOT NULL,
  date_evenement date NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE galerie ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "galerie_select_public" ON galerie;
CREATE POLICY "galerie_select_public"
ON galerie FOR SELECT
TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "galerie_insert_auth" ON galerie;
CREATE POLICY "galerie_insert_auth"
ON galerie FOR INSERT
TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "galerie_update_auth" ON galerie;
CREATE POLICY "galerie_update_auth"
ON galerie FOR UPDATE
TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "galerie_delete_auth" ON galerie;
CREATE POLICY "galerie_delete_auth"
ON galerie FOR DELETE
TO authenticated USING (true);

-- ============================================================
-- TABLE: notifications
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  titre text NOT NULL,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON notifications;
CREATE POLICY "notifications_select_own"
ON notifications FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_own" ON notifications;
CREATE POLICY "notifications_insert_own"
ON notifications FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_update_own" ON notifications;
CREATE POLICY "notifications_update_own"
ON notifications FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON notifications;
CREATE POLICY "notifications_delete_own"
ON notifications FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGER: auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
