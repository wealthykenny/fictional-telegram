import { query } from './_lib/db.js';
import { requireAuth } from './_lib/authorization.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const auth = requireAuth(event, ['admin', 'super_admin']);
  if (auth.error) return auth.error;

  const { userId, newRank, reason } = JSON.parse(event.body || '{}');
  if (!userId || !newRank) return json(400, { message: 'userId and newRank are required' });

  const before = await query('SELECT current_rank FROM users WHERE id = $1', [userId]);
  if (!before.rowCount) return json(404, { message: 'User not found' });

  await query('UPDATE users SET current_rank = $1, updated_at = NOW() WHERE id = $2', [newRank, userId]);
  await query(
    `INSERT INTO rank_history (user_id, previous_rank, new_rank, reason, actor_user_id)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, before.rows[0].current_rank, newRank, reason || 'manual_admin', auth.payload.sub]
  );

  await query('INSERT INTO admin_actions (admin_user_id, action, target_user_id, metadata) VALUES ($1,$2,$3,$4)', [
    auth.payload.sub,
    'rank_update',
    userId,
    { newRank, reason: reason || 'manual_admin' }
  ]);

  return json(200, { message: 'Rank updated' });
}
