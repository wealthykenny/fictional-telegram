import { json, methodNotAllowed } from './_lib/http.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const { username, password } = JSON.parse(event.body || '{}');

  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;

  if (!expectedUser || !expectedPass) {
    return json(500, { message: 'Admin secrets are not configured.' });
  }

  if (username !== expectedUser || password !== expectedPass) {
    return json(401, { message: 'Invalid admin credentials.' });
  }

  return json(200, { message: 'Admin access granted.' });
}
