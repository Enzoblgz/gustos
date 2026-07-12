-- ============================================================
-- MIGRATION : Système social — Likes + Saves
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. TABLE LIKES
CREATE TABLE IF NOT EXISTS likes (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Likes visibles de tous" ON likes
  FOR SELECT USING (true);

CREATE POLICY "Utilisateur : insérer ses likes" ON likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Utilisateur : supprimer ses likes" ON likes
  FOR DELETE USING (auth.uid() = user_id);


-- 2. TABLE SAVES (recettes sauvegardées/bookmarks)
CREATE TABLE IF NOT EXISTS saves (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipe_id  TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, recipe_id)
);

ALTER TABLE saves ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Utilisateur : gérer ses saves" ON saves
  FOR ALL USING (auth.uid() = user_id);
