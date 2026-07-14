-- ============================================================
-- Ajout recette : Brochettes de viande et semoule
-- Coller dans : Supabase Dashboard → SQL Editor → Run
-- Ajoutée sous le compte enzo.bellenguez@gmail.com
-- ============================================================

INSERT INTO public.recipes (id, user_id, data, updated_at)
SELECT
  (r.data::jsonb->>'id')::uuid,
  u.id,
  r.data::jsonb,
  now()
FROM auth.users u
CROSS JOIN (VALUES

  ('{"id":"af46feca-7a74-443e-ac6b-25836af7917d","name":"Brochettes de viande et semoule","category":"Viandes","basePeople":4,"prepTime":15,"cookTime":15,"description":"Des brochettes de viande marinées aux épices, grillées à la poêle ou au barbecue, servies avec une semoule moelleuse.","ingredients":[{"name":"Viande à brochettes (boeuf ou agneau)","qty":600,"unit":"g"},{"name":"Poivron","qty":2,"unit":"pièce(s)"},{"name":"Oignon","qty":1,"unit":"pièce(s)"},{"name":"Huile d''olive","qty":2,"unit":"cuil. à soupe"},{"name":"Cumin","qty":1,"unit":"cuil. à café"},{"name":"Paprika","qty":1,"unit":"cuil. à café"},{"name":"Sel","qty":1,"unit":"pincée"},{"name":"Poivre","qty":1,"unit":"pincée"},{"name":"Semoule","qty":300,"unit":"g"},{"name":"Beurre","qty":20,"unit":"g"},{"name":"Eau","qty":300,"unit":"ml"}],"steps":[{"text":"Couper la viande en cubes et la mélanger avec l''huile d''olive, le cumin, le paprika, le sel et le poivre. Laisser mariner 15 min si possible.","image":null},{"text":"Couper les poivrons et l''oignon en morceaux. Enfiler la viande et les légumes en alternance sur les brochettes.","image":null},{"text":"Cuire les brochettes à la poêle ou au barbecue 8 à 10 min en les retournant régulièrement.","image":null},{"text":"Porter l''eau à ébullition avec le beurre et une pincée de sel. Verser sur la semoule, couvrir et laisser gonfler 5 min.","image":null},{"text":"Égrainer la semoule à la fourchette et servir avec les brochettes bien chaudes.","image":null}],"coverImage":null,"images":[],"tags":["grillade","rapide","semoule"],"createdAt":"2026-07-14T12:00:00.000Z","updatedAt":"2026-07-14T12:00:00.000Z"}'::text)

) AS r(data)
WHERE u.email = 'enzo.bellenguez@gmail.com'
ON CONFLICT (id) DO NOTHING;
