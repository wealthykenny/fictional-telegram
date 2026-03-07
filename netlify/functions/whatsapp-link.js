import { requireAuth } from './_lib/authorization.js';
import { query } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const auth = requireAuth(event, ['member', 'admin', 'super_admin']);
  if (auth.error) return auth.error;

  const { consent, template = 'general_support' } = JSON.parse(event.body || '{}');
  if (!consent) return json(400, { message: 'Consent is required before WhatsApp connect.' });

  await query('UPDATE users SET whatsapp_consent = TRUE WHERE id = $1', [auth.payload.sub]);
  await query('INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)', [
    auth.payload.sub,
    'whatsapp_consent',
    { template }
  ]);

  const templates = {
    general_support: 'Greetings from The Knight of Order. I request support with my account.',
    guild_event: 'Hail! Please send updates on upcoming guild missions.',
    admin_broadcast_optin: 'I consent to receive order announcements via WhatsApp.'
  };

  const text = encodeURIComponent(templates[template] || templates.general_support);
  return json(200, { link: `https://wa.me/${process.env.WHATSAPP_NUMBER}?text=${text}` });
}
