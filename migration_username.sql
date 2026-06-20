-- ============================================================
-- Migration : Ajout colonne username (pseudo unique) dans profiles
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;
