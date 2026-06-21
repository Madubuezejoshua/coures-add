import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole, publicUser } from '../lib/auth.js';
import { logActivity, notify, ah } from '../lib/helpers.js';

const router = Router();
router.use(authMiddleware, requireRole('admin'));

router.get('/', ah(async (_req, res) => {
  const { rows } = await query('SELECT * FROM users ORDER BY created_at DESC');
  res.json(rows.map(publicUser));
}));

async function setStatus(req, res, status, action, extra = {}) {
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [req.params.id]);
  const u = rows[0];
  if (!u) return res.status(404).json({ error: 'User not found' });

  await query(
    `UPDATE users SET status=$1, suspension_reason=$2, rejection_reason=$3, updated_at=now() WHERE id=$4`,
    [status, extra.suspensionReason ?? null, extra.rejectionReason ?? null, u.id]
  );
  await logActivity(action, 'Admin', req.user.id, 'admin', `${action} for ${u.full_name} (${u.email})`, u.full_name, u.id);

  const notice = {
    active: { t: 'Account approved', b: 'Your account has been approved — you now have full access.' },
    suspended: { t: 'Account suspended', b: 'Your account has been suspended. Please contact support.' },
    rejected: { t: 'Registration not approved', b: 'Your registration was not approved. Please contact support.' },
  }[status];
  if (notice) await notify(u.id, `ACCOUNT_${status.toUpperCase()}`, notice.t, notice.b, '/dashboard');

  res.json({ success: true });
}

router.post('/:id/approve', ah((req, res) => setStatus(req, res, 'active', 'USER_APPROVED')));
router.post('/:id/reactivate', ah((req, res) => setStatus(req, res, 'active', 'USER_REACTIVATED')));
router.post('/:id/reject', ah((req, res) => setStatus(req, res, 'rejected', 'USER_REJECTED', { rejectionReason: req.body?.reason })));
router.post('/:id/suspend', ah((req, res) => setStatus(req, res, 'suspended', 'USER_SUSPENDED', { suspensionReason: req.body?.reason })));

router.post('/:id/role', ah(async (req, res) => {
  const role = req.body?.role;
  if (!['editor', 'reviewer', 'publisher', 'user'].includes(role)) return res.status(400).json({ error: 'Invalid role' });
  const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.params.id]);
  const u = rows[0];
  if (!u) return res.status(404).json({ error: 'User not found' });
  await query('UPDATE users SET role=$1, updated_at=now() WHERE id=$2', [role, u.id]);
  await logActivity('ROLE_CHANGED', 'Admin', req.user.id, 'admin', `Changed role of ${u.full_name} from ${u.role} to ${role}`, u.full_name, u.id);
  res.json({ success: true });
}));

router.delete('/:id', ah(async (req, res) => {
  const { rows } = await query('SELECT * FROM users WHERE id=$1', [req.params.id]);
  const u = rows[0];
  if (!u) return res.status(404).json({ error: 'User not found' });
  await query('DELETE FROM activity_logs WHERE actor_id=$1', [u.id]);
  await query('DELETE FROM users WHERE id=$1', [u.id]);
  await logActivity('USER_DELETED', 'Admin', req.user.id, 'admin', `Deleted user ${u.full_name}`, u.full_name, u.id);
  res.json({ success: true });
}));

export default router;
