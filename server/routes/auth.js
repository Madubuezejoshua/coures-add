import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../db.js';
import { signToken, publicUser, authMiddleware } from '../lib/auth.js';
import { nextRegistrationNumber, logActivity, notifyAdmins, ah } from '../lib/helpers.js';

const router = Router();
const PUBLIC_ROLES = ['author', 'editor', 'reviewer', 'publisher', 'user'];

router.post('/register', ah(async (req, res) => {
  const { role, fullName, email, password } = req.body || {};
  if (!PUBLIC_ROLES.includes(role)) return res.status(400).json({ error: 'Invalid role selected' });
  if (!fullName?.trim() || !email?.trim() || !password) return res.status(400).json({ error: 'Please fill in all fields' });
  if (password.length < 6) return res.status(400).json({ error: 'Password should be at least 6 characters' });

  const exists = await query('SELECT 1 FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  if (exists.rows[0]) return res.status(409).json({ error: 'An account with this email already exists' });

  const passwordHash = await bcrypt.hash(password, 10);
  const registrationNumber = await nextRegistrationNumber(role);

  // Free, instant sign-up: new accounts are active immediately (no approval).
  let rows;
  try {
    ({ rows } = await query(
      `INSERT INTO users (email, password_hash, full_name, role, registration_number, status)
       VALUES ($1,$2,$3,$4,$5,'active') RETURNING *`,
      [email.trim().toLowerCase(), passwordHash, fullName.trim(), role, registrationNumber]
    ));
  } catch (error) {
    const message = error?.message || '';
    if (message.includes('role') && message.includes('check')) {
      ({ rows } = await query(
        `INSERT INTO users (email, password_hash, full_name, role, registration_number, status)
         VALUES ($1,$2,$3,$4,$5,'active') RETURNING *`,
        [email.trim().toLowerCase(), passwordHash, fullName.trim(), role === 'author' ? 'author' : role, registrationNumber]
      ));
    } else {
      throw error;
    }
  }
  const user = rows[0];

  await logActivity('USER_REGISTERED', fullName.trim(), user.id, role, `Registered as ${role} (${registrationNumber})`, registrationNumber);
  await notifyAdmins('USER_REGISTERED', 'New user', `${fullName.trim()} joined as ${role} (${registrationNumber}).`, '/dashboard');

  res.json({ success: true, registrationNumber, token: signToken(user), user: publicUser(user) });
}));

router.post('/login', ah(async (req, res) => {
  const { email, password } = req.body || {};
  if (!email?.trim() || !password) return res.status(400).json({ error: 'Email and password are required' });

  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email.trim().toLowerCase()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  res.json({ success: true, token: signToken(user), user: publicUser(user) });
}));

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

export default router;
