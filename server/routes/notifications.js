import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../lib/auth.js';
import { ah } from '../lib/helpers.js';
import { notification as serNotif } from '../lib/serialize.js';

const router = Router();
router.use(authMiddleware);

router.get('/', ah(async (req, res) => {
  const isAdmin = req.user.role === 'admin';
  const { rows } = await query(
    `SELECT * FROM notifications WHERE user_id=$1 ${isAdmin ? "OR for_role='admin'" : ''} ORDER BY created_at DESC LIMIT 50`,
    [req.user.id]
  );
  res.json(rows.map(serNotif));
}));

router.post('/:id/read', ah(async (req, res) => {
  await query('UPDATE notifications SET read=true WHERE id=$1', [req.params.id]);
  res.json({ success: true });
}));

router.post('/read-all', ah(async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids : [];
  if (ids.length) await query('UPDATE notifications SET read=true WHERE id = ANY($1::uuid[])', [ids]);
  res.json({ success: true });
}));

export default router;
