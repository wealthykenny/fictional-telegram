import PDFDocument from 'pdfkit';
import { query } from './_lib/db.js';
import { requireAuth } from './_lib/authorization.js';
import { json, methodNotAllowed } from './_lib/http.js';
import crypto from 'crypto';

export async function handler(event) {
  if (event.httpMethod !== 'POST') return methodNotAllowed();
  const auth = requireAuth(event, ['member', 'admin', 'super_admin']);
  if (auth.error) return auth.error;

  const userResult = await query('SELECT real_name, knight_title FROM users WHERE id = $1', [auth.payload.sub]);
  if (!userResult.rowCount) return json(404, { message: 'User not found' });

  const user = userResult.rows[0];
  const serial = `KOO-${Date.now()}-${crypto.randomInt(1000, 9999)}`;

  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  doc.rect(0, 0, 595, 842).fill('#F9F1DD');
  doc.fillColor('#1E3A8A').fontSize(32).text('THE KNIGHT OF ORDER', 120, 80);
  doc.fillColor('#111827').fontSize(18).text('Certificate of Membership', 170, 140);
  doc.fontSize(14).text(`Granted to: ${user.real_name}`, 120, 230);
  doc.text(`Knight Title: ${user.knight_title}`, 120, 260);
  doc.text(`Serial: ${serial}`, 120, 290);
  doc.text(`Issued: ${new Date().toISOString().slice(0, 10)}`, 120, 320);
  doc.fillColor('#7F1D1D').circle(470, 700, 36).fill();
  doc.fillColor('#F9F1DD').fontSize(11).text('WAX SEAL', 446, 697);
  doc.fillColor('#111827').fontSize(16).text('Signed by The KING', 120, 700);
  doc.end();

  await new Promise((resolve) => doc.on('end', resolve));
  const pdfBuffer = Buffer.concat(chunks);

  await query(
    `INSERT INTO certificates (user_id, serial_number, pdf_blob, issue_date, status)
     VALUES ($1, $2, $3, NOW(), 'pending_approval')`,
    [auth.payload.sub, serial, pdfBuffer]
  );

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${serial}.pdf"`
    },
    body: pdfBuffer.toString('base64'),
    isBase64Encoded: true
  };
}
