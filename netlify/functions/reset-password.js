import { query } from './_lib/db.js';
import { hashPassword, passwordPolicy } from './_lib/auth.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const { token, password } = JSON.parse(event.body || '{}');
  if (!token || !passwordPolicy(password)) return json(400, { message: 'Invalid token or password' });

  const hash = await hashPassword(password);
  const result = await query(
    `UPDATE users
     SET password_hash = $1,
         password_reset_token = NULL,
         password_reset_expires_at = NULL
     WHERE password_reset_token = $2 AND password_reset_expires_at > NOW()
     RETURNING id`,
    [hash, token]
  );

  if (!result.rowCount) return json(400, { message: 'Reset token expired' });
  return json(200, { message: 'Password updated' });
}
