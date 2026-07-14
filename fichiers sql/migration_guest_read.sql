-- ============================================================
-- Migration : mode invité — lecture publique sans compte
-- Les visiteurs non connectés peuvent parcourir les recettes ;
-- créer/planifier/liker exige toujours un compte (policies INSERT/
-- UPDATE/DELETE inchangées).
-- Supabase Dashboard → SQL Editor → Run (déjà appliqué le 12/07/2026)
-- ============================================================

-- Recettes lisibles par tous (y compris anonymes)
DROP POLICY IF EXISTS "All authenticated users can view all recipes" ON public.recipes;
DROP POLICY IF EXISTS "Public read recipes" ON public.recipes;
CREATE POLICY "Public read recipes" ON public.recipes
  FOR SELECT USING (true);

-- Certifications visibles par tous (badge "Certifiée")
DROP POLICY IF EXISTS "Read approvals authenticated" ON public.recipe_approvals;
DROP POLICY IF EXISTS "Read approvals public" ON public.recipe_approvals;
CREATE POLICY "Read approvals public" ON public.recipe_approvals
  FOR SELECT USING (true);

-- Compteurs de likes visibles par tous
DROP POLICY IF EXISTS "Likes visibles de tous" ON public.likes;
CREATE POLICY "Likes visibles de tous" ON public.likes
  FOR SELECT USING (true);

-- Compteur d'utilisateurs sur la page d'accueil invité
GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon;

NOTIFY pgrst, 'reload schema';
