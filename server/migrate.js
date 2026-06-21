import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { pool } from './db.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Tables owned by THIS app. `--reset` drops only these (CASCADE) so the schema
// can be re-created cleanly over an older/incompatible DB (e.g. a prior
// prototype). Other tables in the database are left untouched.
const APP_TABLES = ['messages', 'notifications', 'payouts', 'payments', 'activity_logs', 'documents', 'counters', 'users'];

async function main() {
  const reset = process.argv.includes('--reset');
  if (reset) {
    console.log('[migrate] --reset: dropping app tables…');
    await pool.query(APP_TABLES.map((t) => `DROP TABLE IF EXISTS ${t} CASCADE;`).join('\n'));
  }
  const sql = readFileSync(join(__dirname, 'schema.sql'), 'utf8');
  console.log('[migrate] applying schema…');
  await pool.query(sql);
  console.log('[migrate] done.');
  await pool.end();
}

main().catch((e) => {
  console.error('[migrate] failed:', e.message);
  process.exit(1);
});
