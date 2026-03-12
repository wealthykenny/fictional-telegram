import { json, methodNotAllowed } from './_lib/http.js';
import { addProfileSave } from './_lib/flex-store.js';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const payload = JSON.parse(event.body || '{}');
  if (!payload.imageUrl) return json(400, { message: 'imageUrl is required.' });

  const saved = addProfileSave({ ...payload, savedAt: new Date().toISOString() });
  return json(201, { message: 'Saved to account profile.', saved });
}
