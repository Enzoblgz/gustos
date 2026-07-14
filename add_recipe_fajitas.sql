-- ============================================================
-- Ajout recette : Fajitas au poulet et aux poivrons
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

  ('{"id":"c2c0b0a1-1b11-473e-aff4-df9f6cce8950","name":"Fajitas au poulet et aux poivrons","category":"Viandes","basePeople":4,"prepTime":20,"cookTime":15,"description":"Des fajitas généreuses composées de lamelles de poulet marinées aux épices, de poivrons et d''oignons légèrement croquants, servies dans des tortillas de blé. Marinade facultative de 15 à 30 min pour plus de saveur.","ingredients":[{"name":"Blancs de poulet","qty":500,"unit":"g"},{"name":"Poivrons (rouge, jaune, vert)","qty":3,"unit":"pièce(s)"},{"name":"Oignon","qty":1,"unit":"pièce(s)"},{"name":"Tortillas de blé","qty":8,"unit":"pièce(s)"},{"name":"Huile d''olive","qty":2,"unit":"cuil. à soupe"},{"name":"Paprika","qty":1,"unit":"cuil. à café"},{"name":"Cumin","qty":1,"unit":"cuil. à café"},{"name":"Ail en poudre","qty":0.5,"unit":"cuil. à café"},{"name":"Origan séché","qty":0.5,"unit":"cuil. à café"},{"name":"Piment en poudre","qty":0.5,"unit":"cuil. à café"},{"name":"Sel","qty":1,"unit":"pincée"},{"name":"Poivre","qty":1,"unit":"pincée"}],"steps":[{"text":"Couper le poulet en fines lamelles et le mélanger avec l''huile d''olive et les épices (paprika, cumin, ail en poudre, origan, piment). Laisser mariner 15 à 30 min si possible.","image":null},{"text":"Émincer l''oignon et couper les poivrons en fines lamelles.","image":null},{"text":"Faire chauffer une grande poêle à feu vif. Cuire le poulet 5 à 7 min jusqu''à ce qu''il soit bien doré, puis le réserver.","image":null},{"text":"Faire revenir l''oignon 2 min, ajouter les poivrons et cuire 5 à 7 min jusqu''à ce qu''ils soient tendres mais encore légèrement croquants.","image":null},{"text":"Remettre le poulet dans la poêle et mélanger 1 à 2 min.","image":null},{"text":"Réchauffer les tortillas environ 30 secondes de chaque côté dans une poêle chaude, ou quelques secondes au micro-ondes.","image":null},{"text":"Déposer le mélange poulet-poivrons sur une tortilla, ajouter les garnitures souhaitées (guacamole, salsa, crème fraîche ou yaourt grec, fromage râpé, salade, coriandre fraîche, citron vert), rouler et servir immédiatement.","image":null}],"coverImage":null,"images":[],"tags":["mexicain","poulet","rapide","tortillas"],"createdAt":"2026-07-14T12:00:00.000Z","updatedAt":"2026-07-14T12:00:00.000Z"}'::text)

) AS r(data)
WHERE u.email = 'enzo.bellenguez@gmail.com'
ON CONFLICT (id) DO NOTHING;
