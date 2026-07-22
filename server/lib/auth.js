import jwt from 'jsonwebtoken';
import { query } from '../db.js';

const JWT_SECRET = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'dev-secret-change-me';
if (JWT_SECRET === 'dev-secret-change-me') {
  console.warn('[auth] Using a default JWT secret — set JWT_SECRET in .env for production.');
}

function normalizeRole(role) {
  return role === 'user' ? 'author' : role;
}

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: normalizeRole(user.role) }, JWT_SECRET, { expiresIn: '30d' });
}

/** Verify a raw JWT string; returns the payload or null. */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

/** Serialize a DB user row into the shape the frontend expects (camelCase). */
export function publicUser(row) {
  if (!row) return null;
  return {
    uid: row.id,
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    displayName: row.full_name,
    role: normalizeRole(row.role),
    registrationNumber: row.registration_number,
    status: row.status,
    walletBalance: Number(row.wallet_balance ?? 0),
    suspensionReason: row.suspension_reason || undefined,
    rejectionReason: row.rejection_reason || undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** Verifies the Bearer token and loads the current user. */
export async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });

    const payload = jwt.verify(token, JWT_SECRET);
    const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    if (!rows[0]) return res.status(401).json({ error: 'Account not found' });

    req.user = rows[0]; // raw row
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    const normalizedRole = normalizeRole(req.user?.role);
    if (!req.user || !roles.includes(normalizedRole)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
}

/**
 * No approval system: every signed-in user may act. Only explicitly
 * suspended / rejected (banned) accounts are blocked.
 */
export function requireActive(req, res, next) {
  if (req.user?.role === 'admin') return next();
  if (req.user?.status === 'suspended' || req.user?.status === 'rejected') {
    return res.status(403).json({ error: 'Your account has been blocked. Please contact support.' });
  }
  next();
}
