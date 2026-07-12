-- ============================================================
-- Migration : Recettes visibles par tous les utilisateurs connectés
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Supprime l'ancienne politique SELECT restrictive (user voit seulement ses recettes)
DROP POLICY IF EXISTS "Users can view own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Users can select own recipes" ON public.recipes;
DROP POLICY IF EXISTS "Enable read access for own recipes" ON public.recipes;

-- Nouvelle politique : tout utilisateur connecté peut lire toutes les recettes
CREATE POLICY "All authenticated users can view all recipes"
  ON public.recipes
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Les autres politiques (INSERT / UPDATE / DELETE) restent inchangées :
-- chaque user ne peut modifier/supprimer que ses propres recettes.
