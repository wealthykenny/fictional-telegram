import { query } from './_lib/db.js';

const PROMOTION_DAYS = 30;

export async function handler() {
  const candidates = await query(
    `SELECT u.id, u.current_rank, u.gender, u.branch_choice, u.last_promotion_at
     FROM users u
     WHERE u.is_revoked = FALSE
       AND u.last_promotion_at <= NOW() - ($1 || ' days')::interval`,
    [PROMOTION_DAYS]
  );

  for (const user of candidates.rows) {
    let targetRank = user.current_rank + 1;

    if (user.gender === 'male' && user.current_rank === 11 && !user.branch_choice) {
      continue;
    }

    if (user.gender === 'male' && user.current_rank === 11) {
      targetRank = user.branch_choice === 'Bourgeoisie' ? 12 : 12;
    }

    if (user.gender === 'female' && user.current_rank === 4 && user.branch_choice === 'skip_to_9') {
      targetRank = 9;
    }

    if ((user.gender === 'male' && targetRank > 13) || (user.gender === 'female' && targetRank > 10)) {
      continue;
    }

    await query('UPDATE users SET current_rank = $1, last_promotion_at = NOW(), updated_at = NOW() WHERE id = $2', [targetRank, user.id]);
    await query(
      `INSERT INTO rank_history (user_id, previous_rank, new_rank, reason, actor_user_id)
       VALUES ($1, $2, $3, $4, NULL)`,
      [user.id, user.current_rank, targetRank, 'scheduled_time_promotion']
    );

    if (user.gender === 'female' && targetRank === 8) {
      await query('INSERT INTO activity_log (user_id, action, metadata) VALUES ($1,$2,$3)', [
        user.id,
        'rank_8_confetti_earned',
        { flair: 'confetti' }
      ]);
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ processed: candidates.rowCount })
  };
}
