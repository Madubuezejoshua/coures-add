import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole, requireActive } from '../lib/auth.js';
import { logActivity, notify, notifyAdmins, ah } from '../lib/helpers.js';
import { payment as serPayment } from '../lib/serialize.js';
import { paystackInit } from '../lib/integrations.js';

const router = Router();
router.use(authMiddleware);

export const PUBLICATION_FEE = 20;
export const DEFAULT_DOCUMENT_PRICE = 5;

const getDoc = async (id) => (await query('SELECT * FROM documents WHERE id=$1', [id])).rows[0];

// Editor pays the publication fee → document becomes ready_for_publishing.
router.post('/pay-fee', requireRole('editor'), requireActive, ah(async (req, res) => {
  const d = await getDoc(req.body?.documentId);
  if (!d || d.contributor_id !== req.user.id) return res.status(404).json({ error: 'Document not found' });
  if (d.status !== 'approved') return res.status(400).json({ error: 'Document is not awaiting payment' });

  const reference = `fee_${d.id}_${Date.now()}`;
  await paystackInit({ email: req.user.email, amountKobo: PUBLICATION_FEE * 100, reference, metadata: { documentId: d.id } });

  await query(
    `INSERT INTO payments (type, user_id, user_name, document_id, document_title, amount, reference)
     VALUES ('publication_fee',$1,$2,$3,$4,$5,$6)`,
    [req.user.id, req.user.full_name, d.id, d.title, PUBLICATION_FEE, reference]
  );
  await query(`UPDATE documents SET status='ready_for_publishing', fee_paid=true, fee_paid_at=now(), updated_at=now() WHERE id=$1`, [d.id]);
  await logActivity('PUBLICATION_FEE_PAID', req.user.full_name, req.user.id, 'editor', `Paid $${PUBLICATION_FEE} publication fee for "${d.title}"`, d.title, d.id, d.id);
  if (d.publisher_id) await notify(d.publisher_id, 'READY_FOR_PUBLISHING', 'Ready for publishing', `"${d.title}" is paid and ready to publish.`, '/publisher/dashboard');
  await notifyAdmins('PUBLICATION_FEE_PAID', 'Publication fee paid', `${req.user.full_name} paid the fee for "${d.title}".`, '/dashboard');
  res.json({ success: true });
}));

// Reader purchases a published document → unlocks full read/download.
router.post('/purchase', requireRole('user'), requireActive, ah(async (req, res) => {
  const d = await getDoc(req.body?.documentId);
  if (!d || d.status !== 'published') return res.status(404).json({ error: 'Document not available' });
  const amount = d.price != null ? Number(d.price) : DEFAULT_DOCUMENT_PRICE;
  const reference = `buy_${d.id}_${Date.now()}`;
  await paystackInit({ email: req.user.email, amountKobo: amount * 100, reference, metadata: { documentId: d.id } });

  await query(
    `INSERT INTO payments (type, user_id, user_name, document_id, document_title, amount, reference)
     VALUES ('purchase',$1,$2,$3,$4,$5,$6)`,
    [req.user.id, req.user.full_name, d.id, d.title, amount, reference]
  );
  await logActivity('DOCUMENT_PURCHASED', req.user.full_name, req.user.id, 'user', `Purchased "${d.title}"`, d.title, d.id, d.id);
  if (d.contributor_id) await notify(d.contributor_id, 'DOCUMENT_PURCHASED', 'Your document was purchased', `"${d.title}" was purchased by a reader.`, '/editor/dashboard');
  res.json({ success: true });
}));

router.get('/mine', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM payments WHERE user_id=$1 ORDER BY created_at DESC LIMIT 200', [req.user.id]);
  res.json(rows.map(serPayment));
}));

router.get('/all', requireRole('admin'), ah(async (_req, res) => {
  const { rows } = await query('SELECT * FROM payments ORDER BY created_at DESC LIMIT 500');
  res.json(rows.map(serPayment));
}));

export default router;
