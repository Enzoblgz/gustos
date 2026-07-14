-- ============================================================
-- Migration : bucket de stockage pour les photos de recettes
-- Les photos sont compressées côté client puis uploadées ici ;
-- le JSON de la recette ne contient plus que l'URL publique.
-- Supabase Dashboard → SQL Editor → Run (déjà appliqué le 12/07/2026)
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('recipe-images', 'recipe-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "recipe-images upload" ON storage.objects;
CREATE POLICY "recipe-images upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS "recipe-images read" ON storage.objects;
CREATE POLICY "recipe-images read" ON storage.objects
  FOR SELECT USING (bucket_id = 'recipe-images');

DROP POLICY IF EXISTS "recipe-images delete own" ON storage.objects;
CREATE POLICY "recipe-images delete own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'recipe-images' AND owner = auth.uid());
