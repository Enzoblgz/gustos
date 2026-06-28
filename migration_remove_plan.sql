-- Migration : suppression du système de plans (tout gratuit)
-- À exécuter dans Supabase Dashboard → SQL Editor → Run

ALTER TABLE profiles DROP COLUMN IF EXISTS plan;
ALTER TABLE profiles DROP COLUMN IF EXISTS trial_ends_at;

DROP FUNCTION IF EXISTS public.admin_set_plan(UUID, TEXT);

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
