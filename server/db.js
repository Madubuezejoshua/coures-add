import 'dotenv/config';
import pkg from 'pg';

const { Pool } = pkg;

const raw = process.env.DATABASE_URL || '';
if (!raw) {
  console.warn('[db] DATABASE_URL is not set — database features will fail.');
}

// Strip `channel_binding` (unsupported by node-postgres) and `sslmode` (we set
// TLS explicitly via the `ssl` option below, which also silences a pg warning).
const connectionString = raw
  .replace(/[&?]channel_binding=[^&]*/i, '')
  .replace(/[&?]sslmode=[^&]*/i, '');

export const pool = new Pool({
  connectionString,
  // Neon uses publicly-trusted certificates — verify them (no MITM).
  ssl: connectionString ? { rejectUnauthorized: true } : undefined,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
});

// Don't let a transient idle-client error crash the whole API.
pool.on('error', (e) => console.error('[pg idle error]', e.message));

export const query = (text, params) => pool.query(text, params);

export async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}
