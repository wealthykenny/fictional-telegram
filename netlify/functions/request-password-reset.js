import { query } from './_lib/db.js';
import { randomToken } from './_lib/auth.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const { email } = JSON.parse(event.body || '{}');
  if (!email) return json(200, { message: 'If account exists, reset email sent.' });

  const token = randomToken();
  await query(
    `UPDATE users
     SET password_reset_token = $1,
         password_reset_expires_at = NOW() + INTERVAL '30 minutes'
     WHERE email = $2`,
    [token, email.toLowerCase()]
  );

  return json(200, { message: 'If account exists, reset email sent.', tokenPreview: token.slice(0, 6) });
}
