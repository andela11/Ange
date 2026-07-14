/*
# Tighten RLS: admin-only writes + lock down trigger function

1. Security Changes
   - `evenements`, `autorites`, `galerie`: INSERT/UPDATE/DELETE policies now require
     the authenticated user to have role='admin' in the `profiles` table.
     Previously these used `USING (true)` / `WITH CHECK (true)`, allowing ANY
     authenticated user to modify or delete all rows — effectively bypassing RLS.
   - `handle_new_user()` trigger function: REVOKE EXECUTE from `anon` and
     `authenticated`. This function is SECURITY DEFINER and should only be
     invoked by the `on_auth_user_created` trigger, not via the REST API
     (`/rest/v1/rpc/handle_new_user`). Public execution has been removed.

2. Notes
   - SELECT policies on these tables remain public (anon + authenticated) —
     the data is intentionally shared/public for read access.
   - The admin check uses an EXISTS subquery against `profiles` so only users
     with role='admin' can write.
*/

-- ============================================================
-- EVENEMENTS: restrict writes to admins
-- ============================================================
DROP POLICY IF EXISTS "evenements_insert_auth" ON evenements;
CREATE POLICY "evenements_insert_auth"
ON evenements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "evenements_update_auth" ON evenements;
CREATE POLICY "evenements_update_auth"
ON evenements FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "evenements_delete_auth" ON evenements;
CREATE POLICY "evenements_delete_auth"
ON evenements FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================================
-- AUTORITES: restrict writes to admins
-- ============================================================
DROP POLICY IF EXISTS "autorites_insert_auth" ON autorites;
CREATE POLICY "autorites_insert_auth"
ON autorites FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "autorites_update_auth" ON autorites;
CREATE POLICY "autorites_update_auth"
ON autorites FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "autorites_delete_auth" ON autorites;
CREATE POLICY "autorites_delete_auth"
ON autorites FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================================
-- GALERIE: restrict writes to admins
-- ============================================================
DROP POLICY IF EXISTS "galerie_insert_auth" ON galerie;
CREATE POLICY "galerie_insert_auth"
ON galerie FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "galerie_update_auth" ON galerie;
CREATE POLICY "galerie_update_auth"
ON galerie FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
) WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

DROP POLICY IF EXISTS "galerie_delete_auth" ON galerie;
CREATE POLICY "galerie_delete_auth"
ON galerie FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);

-- ============================================================
-- Lock down handle_new_user() trigger function
-- ============================================================
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
