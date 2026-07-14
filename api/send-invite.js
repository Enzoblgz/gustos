// Envoi de l'email d'invitation team via Resend.
// Env vars Vercel requises : RESEND_API_KEY (+ optionnel RESEND_FROM).
// Sans RESEND_API_KEY → 501 : le front bascule sur le lien copiable.
// Sécurité : on lit l'invitation avec le JWT de l'appelant → la RLS
// garantit qu'il est bien membre de la team, aucun service role nécessaire.

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://bafdwjwdtadpxqnbtpas.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJhZmR3andkdGFkcHhxbmJ0cGFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODQzNDcsImV4cCI6MjA5NzQ2MDM0N30.TNC0FVxMoNI1qpLIJ0Pb1Qu2-gY2ks9fAQYH9Gzhc30';

const esc = s => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function inviteEmailHtml({ teamName, inviter, link }) {
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

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(501).json({ error: 'email_not_configured' });

  const jwt = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!jwt) return res.status(401).json({ error: 'Missing authorization' });

  const { inviteId } = req.body || {};
  if (!inviteId || !/^[0-9a-f-]{36}$/i.test(inviteId)) return res.status(400).json({ error: 'Invalid inviteId' });

  // Lecture de l'invitation avec le JWT de l'appelant — la RLS vérifie l'appartenance à la team
  const sbHeaders = { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${jwt}` };
  const inviteRes = await fetch(
    `${SUPABASE_URL}/rest/v1/team_invites?id=eq.${inviteId}&select=id,email,accepted_at,teams(name),profiles!team_invites_invited_by_fkey(username,email)`,
    { headers: sbHeaders }
  );
  if (!inviteRes.ok) return res.status(502).json({ error: 'Supabase error' });
  const rows = await inviteRes.json();
  const invite = rows[0];
  if (!invite) return res.status(404).json({ error: 'Invitation introuvable' });
  if (invite.accepted_at) return res.status(409).json({ error: 'Invitation déjà utilisée' });

  const origin = req.headers.origin || `https://${req.headers.host}`;
  const link = `${origin}/?invite=${invite.id}`;
  const teamName = invite.teams?.name || 'Gustos';
  const inviter = invite.profiles?.username || (invite.profiles?.email || '').split('@')[0] || 'Un membre';

  const sendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || 'Gustos <onboarding@resend.dev>',
      to: [invite.email],
      subject: `${inviter} t'invite à rejoindre la team ${teamName} sur Gustos`,
      html: inviteEmailHtml({ teamName, inviter, link }),
    }),
  });

  if (!sendRes.ok) {
    const detail = await sendRes.text().catch(() => '');
    console.error('[send-invite] Resend error', sendRes.status, detail);
    return res.status(502).json({ error: 'send_failed' });
  }
  return res.status(200).json({ ok: true });
}
