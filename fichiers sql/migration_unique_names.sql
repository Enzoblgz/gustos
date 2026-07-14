-- ============================================================
-- Migration : unicité des noms de recettes par utilisateur
--             + droit de suppression admin
-- Supabase Dashboard → SQL Editor → Run (déjà appliqué le 12/07/2026)
-- ============================================================

-- 1. Nettoyage des doublons existants (garde la version la plus récente)
DELETE FROM public.recipes r
USING (
  SELECT id, row_number() OVER (
    PARTITION BY user_id, lower(data->>'name')
    ORDER BY updated_at DESC, created_at DESC
  ) AS rn
  FROM public.recipes
) d
WHERE r.id = d.id AND d.rn > 1;

-- 2. Un même utilisateur ne peut pas avoir deux recettes du même nom
CREATE UNIQUE INDEX IF NOT EXISTS recipes_user_name_unique
  ON public.recipes (user_id, lower(data->>'name'));

-- 3. L'admin peut supprimer n'importe quelle recette
--    (le bouton existait dans l'UI mais la RLS bloquait silencieusement)
DROP POLICY IF EXISTS "Admin: delete any recipe" ON public.recipes;
CREATE POLICY "Admin: delete any recipe" ON public.recipes
  FOR DELETE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

NOTIFY pgrst, 'reload schema';
