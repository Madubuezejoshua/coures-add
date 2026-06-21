import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole, requireActive } from '../lib/auth.js';
import { logActivity, ah } from '../lib/helpers.js';
import { payout as serPayout } from '../lib/serialize.js';

const router = Router();
router.use(authMiddleware);

router.post('/', requireRole('editor', 'reviewer'), requireActive, ah(async (req, res) => {
  const amount = Number(req.body?.amount);
  if (!amount || amount <= 0) return res.status(400).json({ error: 'Enter a valid amount' });
  const { rows } = await query(
    `INSERT INTO payouts (user_id, user_name, user_role, amount, status) VALUES ($1,$2,$3,$4,'pending') RETURNING *`,
    [req.user.id, req.user.full_name, req.user.role, amount]
  );
  await logActivity('PAYOUT_REQUESTED', req.user.full_name, req.user.id, req.user.role, `Requested payout of $${amount}`, req.user.full_name, req.user.id);
  res.json(serPayout(rows[0]));
}));

router.get('/mine', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM payouts WHERE user_id=$1 ORDER BY requested_at DESC', [req.user.id]);
  res.json(rows.map(serPayout));
}));

router.get('/all', requireRole('admin'), ah(async (_req, res) => {
  const { rows } = await query('SELECT * FROM payouts ORDER BY requested_at DESC');
  res.json(rows.map(serPayout));
}));

router.post('/:id/status', requireRole('admin'), ah(async (req, res) => {
  const { status, notes } = req.body || {};
  if (!['approved', 'paid', 'rejected'].includes(status)) return res.status(400).json({ error: 'Invalid status' });
  const { rows } = await query(
    `UPDATE payouts SET status=$1, notes=$2, processed_by=$3, processed_at=now() WHERE id=$4 RETURNING *`,
    [status, notes || null, req.user.full_name, req.params.id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'Payout not found' });
  await logActivity(`PAYOUT_${status.toUpperCase()}`, req.user.full_name, req.user.id, 'admin', `${status} payout of $${rows[0].amount} for ${rows[0].user_name}`, rows[0].user_name, rows[0].user_id);
  res.json({ success: true });
}));

export default router;
