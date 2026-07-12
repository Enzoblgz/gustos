-- ============================================================
-- MIGRATION : Ajout colonne name dans profiles
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Mise à jour du trigger pour stocker le prénom dès l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE
    SET name = EXCLUDED.name
    WHERE profiles.name IS NULL;
  RETURN NEW;
END;
$$;
