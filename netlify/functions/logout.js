import { clearCookie } from './_lib/auth.js';
import { json } from './_lib/http.js';

export async function handler() {
  return json(204, null, { 'Set-Cookie': clearCookie() });
}
