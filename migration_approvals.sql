-- ============================================================
-- Migration : Système d'approbations et certification des recettes
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Table des approbations
CREATE TABLE IF NOT EXISTS public.recipe_approvals (
  recipe_id   TEXT        NOT NULL,
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_admin    BOOLEAN     NOT NULL DEFAULT FALSE,
  approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (recipe_id, user_id)
);

ALTER TABLE public.recipe_approvals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Read approvals authenticated"
  ON public.recipe_approvals FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Insert own approval"
  ON public.recipe_approvals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Delete own approval"
  ON public.recipe_approvals FOR DELETE
  USING (auth.uid() = user_id);

-- S'assurer que trial_ends_at et plan existent dans profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

NOTIFY pgrst, 'reload schema';
