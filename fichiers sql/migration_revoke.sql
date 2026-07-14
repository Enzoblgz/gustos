-- ============================================================
-- Migration : Policy admin pour retirer une certification
-- Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Permet à un admin de supprimer n'importe quelle approbation
-- (nécessaire pour retirer la certification d'une recette)
CREATE POLICY "Admin can delete any approval"
  ON public.recipe_approvals FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

NOTIFY pgrst, 'reload schema';
