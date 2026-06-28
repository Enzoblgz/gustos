-- ============================================================
-- SCHEMA SUPABASE — Mes Recettes
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- 1. TABLE PROFILES (créée automatiquement à l'inscription)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email      TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: own profile only" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Admin: read all profiles" ON profiles
  FOR SELECT USING (
    auth.uid() = id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 2. TABLE RECIPES
CREATE TABLE IF NOT EXISTS recipes (
  id         TEXT PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  data       JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users: own recipes only" ON recipes
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Admin: read all recipes" ON recipes
  FOR SELECT USING (
    auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. TRIGGER : crée un profil à chaque inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. FONCTION ADMIN : stats tous les utilisateurs
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE result JSON;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT json_agg(row_to_json(t)) INTO result
  FROM (
    SELECT
      p.id, p.email, p.role, p.created_at,
      COUNT(r.id)::INT AS recipe_count
    FROM profiles p
    LEFT JOIN recipes r ON r.user_id = p.id
    GROUP BY p.id, p.email, p.role, p.created_at
    ORDER BY p.created_at DESC
  ) t;

  RETURN COALESCE(result, '[]'::JSON);
END;
$$;

-- ============================================================
-- APRÈS AVOIR EXÉCUTÉ CE SCHEMA :
-- 1. Crée un compte sur le site avec enzo.bellenguez@gmail.com
-- 2. Lance cette requête pour le passer admin :
-- ============================================================
-- UPDATE profiles SET role = 'admin' WHERE email = 'enzo.bellenguez@gmail.com';
