import { json, methodNotAllowed } from './_lib/http.js';
import { deleteDraftById } from './_lib/flex-store.js';

export async function handler(event) {
  if (event.httpMethod !== 'DELETE') return methodNotAllowed();
  const id = event.queryStringParameters?.id;
  if (!id) return json(400, { message: 'Draft id is required.' });

  deleteDraftById(id);
  return json(200, { message: 'Draft deleted.' });
}
