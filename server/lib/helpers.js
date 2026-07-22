import { query } from '../db.js';

const PREFIX = { admin: 'ADM', author: 'AUT', editor: 'EDT', reviewer: 'REV', publisher: 'PUB', user: 'USR' };

/** Atomically allocate the next sequential registration number for a role. */
export async function nextRegistrationNumber(role) {
  const prefix = PREFIX[role] || 'USR';
  const { rows } = await query(
    `INSERT INTO counters (role, value) VALUES ($1, 1)
     ON CONFLICT (role) DO UPDATE SET value = counters.value + 1
     RETURNING value`,
    [role]
  );
  return `${prefix}-${String(rows[0].value).padStart(6, '0')}`;
}

export async function logActivity(action, actor, actorId, actorRole, details, target, targetId, documentId) {
  try {
    await query(
      `INSERT INTO activity_logs (action, actor, actor_id, actor_role, details, target, target_id, document_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [action, actor, actorId, actorRole, details, target || null, targetId || null, documentId || null]
    );
  } catch (e) {
    console.error('logActivity error', e.message);
  }
}

export async function notify(userId, type, title, body, link) {
  try {
    await query(
      `INSERT INTO notifications (user_id, type, title, body, link) VALUES ($1,$2,$3,$4,$5)`,
      [userId, type, title, body, link || null]
    );
  } catch (e) {
    console.error('notify error', e.message);
  }
}

export async function notifyAdmins(type, title, body, link) {
  try {
    await query(
      `INSERT INTO notifications (for_role, type, title, body, link) VALUES ('admin',$1,$2,$3,$4)`,
      [type, title, body, link || null]
    );
  } catch (e) {
    console.error('notifyAdmins error', e.message);
  }
}

export async function notifyRole(role, type, title, body, link) {
  try {
    const { rows } = await query('SELECT id FROM users WHERE role=$1', [role]);
    await Promise.all(rows.map((row) => notify(row.id, type, title, body, link)));
  } catch (e) {
    console.error('notifyRole error', e.message);
  }
}

/** Express async handler wrapper that forwards errors. */
export const ah = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
