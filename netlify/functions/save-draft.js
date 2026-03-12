import { json, methodNotAllowed } from './_lib/http.js';
import { addDraft, listDrafts } from './_lib/flex-store.js';

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    return json(200, { drafts: listDrafts() });
  }
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const draft = JSON.parse(event.body || '{}');
  if (!draft.id || !draft.imageUrl) {
    return json(400, { message: 'Draft id and imageUrl are required.' });
  }

  addDraft(draft);
  return json(201, { message: 'Draft saved.', draft });
}
