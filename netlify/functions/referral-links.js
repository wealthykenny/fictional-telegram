import { json, methodNotAllowed } from './_lib/http.js';

const links = globalThis.__flexRefLinks || [];
globalThis.__flexRefLinks = links;

export async function handler(event) {
  if (event.httpMethod === 'GET') {
    return json(200, { links });
  }
  if (event.httpMethod !== 'POST') return methodNotAllowed();

  const { label, url } = JSON.parse(event.body || '{}');
  if (!label || !url) return json(400, { message: 'label and url are required.' });

  const referral = { id: crypto.randomUUID(), label, url, createdAt: new Date().toISOString() };
  links.push(referral);
  return json(201, { message: 'Referral link added.', referral });
}
