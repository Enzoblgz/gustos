-- ============================================================
-- Migration : compteur public d'utilisateurs (stat page d'accueil)
-- Supabase Dashboard → SQL Editor → Run (déjà appliqué le 12/07/2026)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT count(*)::int FROM public.profiles;
$$;

REVOKE ALL ON FUNCTION public.get_user_count() FROM public;
GRANT EXECUTE ON FUNCTION public.get_user_count() TO authenticated;

NOTIFY pgrst, 'reload schema';
