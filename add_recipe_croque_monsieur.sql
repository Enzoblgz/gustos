-- ============================================================
-- Ajout recette : Croque-monsieur
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

  ('{"id":"bd284492-96e2-41eb-834b-3d45494be6de","name":"Croque-monsieur","category":"Snacks","basePeople":4,"prepTime":5,"cookTime":8,"description":"Le classique du goûter ou du repas rapide : pain de mie doré, jambon fondant et fromage gratiné.","ingredients":[{"name":"Pain de mie","qty":8,"unit":"tranche(s)"},{"name":"Jambon blanc","qty":4,"unit":"tranche(s)"},{"name":"Emmental râpé","qty":150,"unit":"g"},{"name":"Beurre","qty":30,"unit":"g"},{"name":"Moutarde","qty":1,"unit":"cuil. à soupe"}],"steps":[{"text":"Beurrer une face de chaque tranche de pain de mie.","image":null},{"text":"Sur la face non beurrée de 4 tranches, tartiner un peu de moutarde puis déposer une tranche de jambon et une partie du fromage râpé.","image":null},{"text":"Refermer avec les 4 tranches restantes, côté beurré vers l''extérieur, et parsemer le dessus du reste de fromage.","image":null},{"text":"Cuire à la poêle 3 à 4 min de chaque côté (ou 8 min au four à 200°C) jusqu''à ce que le pain soit doré et le fromage fondu.","image":null}],"coverImage":null,"images":[],"tags":["rapide","goûter","fromage"],"createdAt":"2026-07-14T12:00:00.000Z","updatedAt":"2026-07-14T12:00:00.000Z"}'::text)

) AS r(data)
WHERE u.email = 'enzo.bellenguez@gmail.com'
ON CONFLICT (id) DO NOTHING;
