-- ============================================================
-- MIGRATION : Planning semaine + Liste de courses
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

CREATE TABLE IF NOT EXISTS meal_plans (
  user_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_of    DATE NOT NULL,
  plan       JSONB NOT NULL DEFAULT '{}',
  shopping   JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, week_of)
);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own meal plans" ON meal_plans
  FOR ALL USING (auth.uid() = user_id);
