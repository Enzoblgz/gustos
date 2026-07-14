-- ============================================================
-- MIGRATION : Teams — planning et liste de courses partagés
-- À exécuter dans : Supabase Dashboard → SQL Editor → Run
-- Tout le monde a les mêmes droits dans une team (pas de hiérarchie).
-- ============================================================

-- 1. TABLES

CREATE TABLE IF NOT EXISTS teams (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 1 AND 50),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS team_members (
  team_id   UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

-- L'id sert aussi de token secret dans le lien d'invitation
CREATE TABLE IF NOT EXISTS team_invites (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id     UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  invited_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS team_meal_plans (
  team_id    UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  week_of    DATE NOT NULL,
  plan       JSONB NOT NULL DEFAULT '{}',
  shopping   JSONB NOT NULL DEFAULT '[]',
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, week_of)
);

-- 2. HELPER (SECURITY DEFINER pour éviter la récursion RLS)

CREATE OR REPLACE FUNCTION public.is_team_member(t UUID)
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM team_members WHERE team_id = t AND user_id = auth.uid());
$$;

-- 3. RLS

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members read team" ON teams;
CREATE POLICY "Members read team" ON teams
  FOR SELECT USING (is_team_member(id));

DROP POLICY IF EXISTS "Members rename team" ON teams;
CREATE POLICY "Members rename team" ON teams
  FOR UPDATE USING (is_team_member(id));

DROP POLICY IF EXISTS "Members read members" ON team_members;
CREATE POLICY "Members read members" ON team_members
  FOR SELECT USING (is_team_member(team_id));

-- Quitter une team : chacun peut supprimer sa propre ligne
DROP POLICY IF EXISTS "Members leave" ON team_members;
CREATE POLICY "Members leave" ON team_members
  FOR DELETE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Members read invites" ON team_invites;
CREATE POLICY "Members read invites" ON team_invites
  FOR SELECT USING (is_team_member(team_id));

DROP POLICY IF EXISTS "Members create invites" ON team_invites;
CREATE POLICY "Members create invites" ON team_invites
  FOR INSERT WITH CHECK (is_team_member(team_id) AND invited_by = auth.uid());

DROP POLICY IF EXISTS "Members cancel invites" ON team_invites;
CREATE POLICY "Members cancel invites" ON team_invites
  FOR DELETE USING (is_team_member(team_id));

DROP POLICY IF EXISTS "Members manage team plans" ON team_meal_plans;
CREATE POLICY "Members manage team plans" ON team_meal_plans
  FOR ALL USING (is_team_member(team_id)) WITH CHECK (is_team_member(team_id));

-- 4. RPC : créer une team (insère la team + le créateur comme membre)

CREATE OR REPLACE FUNCTION public.create_team(team_name TEXT)
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE new_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF team_name IS NULL OR char_length(trim(team_name)) = 0 THEN RAISE EXCEPTION 'Name required'; END IF;
  INSERT INTO teams (name, created_by) VALUES (trim(team_name), auth.uid()) RETURNING id INTO new_id;
  INSERT INTO team_members (team_id, user_id) VALUES (new_id, auth.uid());
  RETURN new_id;
END;
$$;

-- 5. RPC : mes teams avec membres + invitations en attente

CREATE OR REPLACE FUNCTION public.get_my_teams()
RETURNS JSON LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) FROM (
    SELECT te.id, te.name, te.created_at,
      (SELECT COALESCE(json_agg(json_build_object(
          'id', p.id, 'username', p.username, 'email', p.email) ORDER BY m.joined_at), '[]'::json)
        FROM team_members m JOIN profiles p ON p.id = m.user_id
        WHERE m.team_id = te.id) AS members,
      (SELECT COALESCE(json_agg(json_build_object('id', i.id, 'email', i.email) ORDER BY i.created_at), '[]'::json)
        FROM team_invites i
        WHERE i.team_id = te.id AND i.accepted_at IS NULL) AS invites
    FROM team_members tm JOIN teams te ON te.id = tm.team_id
    WHERE tm.user_id = auth.uid()
    ORDER BY te.created_at
  ) t;
$$;

-- 6. RPC : infos publiques d'une invitation (le token secret suffit)

CREATE OR REPLACE FUNCTION public.get_invite_info(invite_token UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE result JSON;
BEGIN
  SELECT json_build_object(
    'team_id', i.team_id,
    'team_name', te.name,
    'email', i.email,
    'inviter', COALESCE(p.username, split_part(p.email, '@', 1), ''),
    'accepted', i.accepted_at IS NOT NULL,
    'already_member', is_team_member(i.team_id)
  ) INTO result
  FROM team_invites i
  JOIN teams te ON te.id = i.team_id
  LEFT JOIN profiles p ON p.id = i.invited_by
  WHERE i.id = invite_token;
  RETURN result; -- NULL si le token n'existe pas
END;
$$;

-- 7. RPC : accepter une invitation

CREATE OR REPLACE FUNCTION public.accept_team_invite(invite_token UUID)
RETURNS JSON LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE inv RECORD;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT i.*, te.name AS team_name INTO inv
  FROM team_invites i JOIN teams te ON te.id = i.team_id
  WHERE i.id = invite_token;
  IF inv IS NULL THEN RAISE EXCEPTION 'Invitation introuvable'; END IF;
  IF inv.accepted_at IS NOT NULL THEN RAISE EXCEPTION 'Invitation déjà utilisée'; END IF;
  INSERT INTO team_members (team_id, user_id) VALUES (inv.team_id, auth.uid())
    ON CONFLICT DO NOTHING;
  UPDATE team_invites SET accepted_at = NOW() WHERE id = invite_token;
  RETURN json_build_object('team_id', inv.team_id, 'team_name', inv.team_name);
END;
$$;

-- 8. RPC : quitter une team (supprime la team si dernier membre)

CREATE OR REPLACE FUNCTION public.leave_team(t UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  DELETE FROM team_members WHERE team_id = t AND user_id = auth.uid();
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = t) THEN
    DELETE FROM teams WHERE id = t;
  END IF;
END;
$$;

-- 9. REALTIME : sync live du planning partagé entre membres

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE team_meal_plans;
EXCEPTION WHEN duplicate_object THEN NULL;
END;
$$;
