import { query } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const { token } = JSON.parse(event.body || '{}');
  if (!token) return json(400, { message: 'Missing verification token' });

  const result = await query(
    `UPDATE users
     SET email_verified_at = NOW(), email_verification_token = NULL
     WHERE email_verification_token = $1
     RETURNING id`,
    [token]
  );

  if (!result.rowCount) return json(400, { message: 'Invalid or expired token' });
  return json(200, { message: 'Email verified' });
}
