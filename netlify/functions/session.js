import { query } from './_lib/db.js';
import { readToken, verifySession } from './_lib/auth.js';
import { MALE_RANKS, FEMALE_RANKS } from './_lib/constants.js';
import { json } from './_lib/http.js';

export async function handler(event) {
  try {
    const token = readToken(event.headers);
    if (!token) return json(401, { message: 'No active session' });
    const payload = verifySession(token);
    const result = await query(
      `SELECT u.id, u.email, u.knight_title, u.current_rank, u.gender, o.name AS organization_name
       FROM users u
       LEFT JOIN memberships m ON m.user_id = u.id AND m.status = 'active'
       LEFT JOIN organizations o ON o.id = m.organization_id
       WHERE u.id = $1`,
      [payload.sub]
    );

    const user = result.rows[0];
    if (!user) return json(404, { message: 'User not found' });

    const ladder = user.gender === 'female' ? FEMALE_RANKS : MALE_RANKS;

    return json(200, {
      id: user.id,
      email: user.email,
      knightTitle: user.knight_title,
      currentRank: user.current_rank,
      currentRankLabel: ladder[user.current_rank - 1] || 'Unranked',
      organizationName: user.organization_name
    });
  } catch {
    return json(401, { message: 'Invalid session' });
  }
}
