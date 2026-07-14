// Edge Function Supabase : envoi de l'email d'invitation team via Resend.
// Remplace l'ancienne fonction Vercel (le site est hébergé sur GitHub Pages, statique).
//
// Déploiement : supabase functions deploy send-invite --project-ref bafdwjwdtadpxqnbtpas
// Secrets     : supabase secrets set RESEND_API_KEY=re_xxx [RESEND_FROM="Gustos <invitations@...>"] [SITE_URL=https://enzoblgz.github.io/gustos]
//
// Sans RESEND_API_KEY → 501 : le front bascule sur le lien copiable.
// Sécurité : on lit l'invitation avec le JWT de l'appelant → la RLS
// garantit qu'il est bien membre de la team, aucun service role nécessaire.

import { createClient } from 'npm:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });

const esc = (s: unknown) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inviteEmailHtml({ teamName, inviter, link }: { teamName: string; inviter: string; link: string }) {
  return `<!DOCTYPE html>
<html lang="fr"><body style="margin:0;padding:0;background:#FEFAF5;font-family:Georgia,serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#FEFAF5;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 2px 16px rgba(44,24,16,0.07);">
        <tr><td style="background:#C7522A;padding:28px 32px;text-align:center;">
          <span style="font-size:26px;font-weight:700;color:#FFFFFF;letter-spacing:0.5px;">Gustos</span>
        </td></tr>
        <tr><td style="padding:36px 32px 12px;">
          <h1 style="margin:0 0 16px;font-size:22px;color:#2C1810;font-weight:700;">Tu es invité·e à rejoindre une team 🍽️</h1>
          <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#7A5C4E;font-family:Arial,Helvetica,sans-serif;">
            <strong style="color:#2C1810;">${esc(inviter)}</strong> t'invite à rejoindre la team
            <strong style="color:#C7522A;">${esc(teamName)}</strong> sur Gustos.
          </p>
          <p style="margin:0 0 28px;font-size:15px;line-height:1.6;color:#7A5C4E;font-family:Arial,Helvetica,sans-serif;">
            Vous partagerez un planning de repas et une liste de courses commune pour vous organiser ensemble.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:0 auto 28px;">
            <tr><td style="border-radius:50px;background:#C7522A;">
              <a href="${esc(link)}" style="display:inline-block;padding:14px 36px;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;font-family:Arial,Helvetica,sans-serif;border-radius:50px;">Rejoindre la team</a>
            </td></tr>
          </table>
          <p style="margin:0 0 8px;font-size:12px;line-height:1.5;color:#B0A090;font-family:Arial,Helvetica,sans-serif;">
            Ou copie ce lien dans ton navigateur :<br>
            <a href="${esc(link)}" style="color:#C7522A;word-break:break-all;">${esc(link)}</a>
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px 28px;border-top:1px solid #F0E4D4;">
          <p style="margin:0;font-size:11px;color:#B0A090;font-family:Arial,Helvetica,sans-serif;">
            Tu reçois cet email parce que quelqu'un t'a invité·e sur Gustos. Si tu n'es pas concerné·e, ignore simplement ce message.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) return json(501, { error: 'email_not_configured' });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json(401, { error: 'Missing authorization' });

  let inviteId = '', origin = '';
  try { ({ inviteId, origin } = await req.json()); } catch { /* ignore */ }
  if (!inviteId || !/^[0-9a-f-]{36}$/i.test(inviteId)) return json(400, { error: 'Invalid inviteId' });

  // Lecture avec le JWT de l'appelant — la RLS vérifie l'appartenance à la team
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: invite, error } = await supabase
    .from('team_invites')
    .select('id,email,accepted_at,teams(name),profiles!team_invites_invited_by_fkey(username,email)')
    .eq('id', inviteId)
    .maybeSingle();
  if (error) return json(502, { error: 'Supabase error: ' + error.message });
  if (!invite) return json(404, { error: 'Invitation introuvable' });
  if (invite.accepted_at) return json(409, { error: 'Invitation déjà utilisée' });

  const site = (Deno.env.get('SITE_URL') || origin || 'https://enzoblgz.github.io/gustos').replace(/\/+$/, '');
  const link = `${site}/?invite=${invite.id}`;
  const teamName = (invite.teams as { name?: string } | null)?.name || 'Gustos';
  const inviterProfile = invite.profiles as { username?: string; email?: string } | null;
  const inviter = inviterProfile?.username || (inviterProfile?.email || '').split('@')[0] || 'Un membre';

  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: Deno.env.get('RESEND_FROM') || 'Gustos <onboarding@resend.dev>',
      to: [invite.email],
      subject: `${inviter} t'invite à rejoindre la team ${teamName} sur Gustos`,
      html: inviteEmailHtml({ teamName, inviter, link }),
    }),
  });

  if (!sendRes.ok) {
    const detail = await sendRes.text().catch(() => '');
    console.error('[send-invite] Resend error', sendRes.status, detail);
    return json(502, { error: 'send_failed' });
  }
  return json(200, { ok: true });
});
