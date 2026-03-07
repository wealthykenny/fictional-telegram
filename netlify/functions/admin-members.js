import { query } from './_lib/db.js';
import { requireAuth } from './_lib/authorization.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') return methodNotAllowed();
  const auth = requireAuth(event, ['admin', 'super_admin']);
  if (auth.error) return auth.error;

  const result = await query(
    `SELECT u.id, u.real_name, u.knight_title, u.current_rank, u.role, u.is_revoked,
            o.name AS organization_name
     FROM users u
     LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'active'
     LEFT JOIN organizations o ON o.id = m.organization_id
     ORDER BY u.created_at DESC
     LIMIT 500`
  );

  return json(200, { members: result.rows });
}
