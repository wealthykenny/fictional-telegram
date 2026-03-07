import { query } from './_lib/db.js';
import { comparePassword, signSession, buildCookie } from './_lib/auth.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const limiter = checkRateLimit(`login:${event.headers['x-nf-client-connection-ip'] || 'unknown'}`, 10);
  if (!limiter.allowed) return json(429, { message: 'Too many login attempts' });

  const { email, password } = JSON.parse(event.body || '{}');
  const result = await query('SELECT * FROM users WHERE email = $1', [email?.toLowerCase()]);
  const user = result.rows[0];

  if (!user || !(await comparePassword(password, user.password_hash))) {
    return json(401, { message: 'Invalid credentials' });
  }

  if (!user.email_verified_at) {
    return json(403, { message: 'Email address not verified' });
  }

  const token = signSession(user);
  await query('INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)', [
    user.id,
    'login',
    { sourceIp: event.headers['x-nf-client-connection-ip'] || null }
  ]);

  return json(
    200,
    {
      id: user.id,
      email: user.email,
      role: user.role
    },
    { 'Set-Cookie': buildCookie(token) }
  );
}
