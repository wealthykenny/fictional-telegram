import { readToken, verifySession } from './auth.js';
import { json } from './http.js';

export function requireAuth(event, allowedRoles = []) {
  try {
    const token = readToken(event.headers);
    if (!token) {
      return { error: json(401, { message: 'Unauthorized' }) };
    }
    const payload = verifySession(token);
    if (allowedRoles.length && !allowedRoles.includes(payload.role)) {
      return { error: json(403, { message: 'Forbidden' }) };
    }
    return { payload };
  } catch {
    return { error: json(401, { message: 'Unauthorized' }) };
  }
}
