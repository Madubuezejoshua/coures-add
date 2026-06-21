import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
import { ah } from '../lib/helpers.js';
import { message as serMsg } from '../lib/serialize.js';

const router = Router();
router.use(authMiddleware);

router.get('/inbox', ah(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const { rows } = await query(
    `SELECT * FROM messages
     WHERE to_id=$1 OR to_id='all' ${isAdmin ? "OR to_id='admins'" : ''}
     ORDER BY created_at DESC LIMIT 100`,
    [req.user.id]
  );
  res.json(rows.map(serMsg));
}));

router.get('/sent', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM messages WHERE from_id=$1 ORDER BY created_at DESC LIMIT 100', [req.user.id]);
  res.json(rows.map(serMsg));
}));

router.post('/', ah(async (req, res) => {
  const { toId, toName, body } = req.body || {};
  if (!toId || !body?.trim()) return res.status(400).json({ error: 'Recipient and message are required' });
  if (toId === 'all' && req.user.role !== 'admin') return res.status(403).json({ error: 'Only admins can broadcast' });
  const { rows } = await query(
    `INSERT INTO messages (from_id, from_name, from_role, to_id, to_name, body)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [req.user.id, req.user.full_name, req.user.role, toId, toName || '', body.trim()]
  );
  res.json(serMsg(rows[0]));
}));

router.post('/:id/read', ah(async (req, res) => {
  await query('UPDATE messages SET read=true WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

export default router;
