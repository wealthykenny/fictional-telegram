import { query } from './_lib/db.js';
import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'GET') return methodNotAllowed();
  const serial = event.queryStringParameters?.serial;
  if (!serial) return json(400, { message: 'Missing serial' });

  const result = await query(
    `SELECT c.serial_number, c.issue_date, c.status, u.real_name, u.knight_title
     FROM certificates c
     JOIN users u ON u.id = c.user_id
     WHERE c.serial_number = $1`,
    [serial]
  );

  if (!result.rowCount) return json(404, { valid: false, message: 'Certificate not found' });

  return json(200, { valid: true, certificate: result.rows[0] });
}
