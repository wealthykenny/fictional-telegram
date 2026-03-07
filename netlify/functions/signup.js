import { query } from './_lib/db.js';
import { hashPassword, passwordPolicy, randomToken } from './_lib/auth.js';
import { checkRateLimit } from './_lib/rate-limit.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const limiter = checkRateLimit(`signup:${event.headers['x-nf-client-connection-ip'] || 'unknown'}`, 5);
  if (!limiter.allowed) return json(429, { message: 'Too many signup attempts' });

  const { email, password, realName, gender, organizationId } = JSON.parse(event.body || '{}');
  if (!email || !password || !realName || !gender) return json(400, { message: 'Missing required fields' });
  if (!passwordPolicy(password)) return json(400, { message: 'Password does not meet policy requirements' });

  const hashed = await hashPassword(password);
  const verificationToken = randomToken();

  const result = await query(
    `INSERT INTO users (email, password_hash, real_name, gender, knight_title, current_rank, role, email_verification_token)
     VALUES ($1, $2, $3, $4, CONCAT('Sir/Dame ', split_part($3, ' ', 1), ' of the Dawn'), 1, 'member', $5)
     RETURNING id, email`,
    [email.toLowerCase(), hashed, realName, gender, verificationToken]
  );

  if (organizationId) {
    await query(
      `INSERT INTO memberships (user_id, organization_id, status)
       VALUES ($1, $2, 'active')`,
      [result.rows[0].id, organizationId]
    );
  }

  await query('INSERT INTO activity_log (user_id, action, metadata) VALUES ($1, $2, $3)', [
    result.rows[0].id,
    'signup',
    { email: result.rows[0].email }
  ]);

  return json(201, { message: 'Account created. Verify email to continue.' });
}
