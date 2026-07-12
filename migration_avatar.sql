-- ============================================================
-- Migration : Ajout avatar_url dans profiles
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;
