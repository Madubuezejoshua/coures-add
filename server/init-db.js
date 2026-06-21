import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * On startup: create any missing tables (idempotent CREATE IF NOT EXISTS) and
 * warn loudly if an OLD/incompatible `users` table is present (needs db:reset).
 * Non-fatal — the server still starts if the DB is briefly unreachable.
 */
export async function ensureSchema() {
  try {
    const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);

    const { rows } = await pool.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = 'users' AND column_name = 'registration_number' LIMIT 1`
    );
    if (!rows[0]) {
      console.warn('\n[db] ⚠  Your "users" table is missing expected columns (old/incompatible schema).');
      console.warn('[db] ⚠  Fix it:  npm run db:reset   then restart the server.\n');
    } else {
      console.log('[db] schema OK');
    }
  } catch (e) {
    console.warn('[db] could not verify/create schema:', e.code || e.message);
    console.warn('[db] If sign-up fails, run:  npm run db:reset');
  }
}
