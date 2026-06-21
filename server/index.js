import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { pool } from './db.js';
import { ensureSchema } from './init-db.js';
import authRoutes from './routes/auth.js';
import usersRoutes from './routes/users.js';
import documentsRoutes from './routes/documents.js';
import paymentsRoutes from './routes/payments.js';
import payoutsRoutes from './routes/payouts.js';
import notificationsRoutes from './routes/notifications.js';
import messagesRoutes from './routes/messages.js';
import miscRoutes from './routes/misc.js';

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }));
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/documents', documentsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/payouts', payoutsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api', miscRoutes);

// Unknown API route -> JSON 404.
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Central error handler — turns low-level failures into actionable messages.
const NET_CODES = ['ETIMEDOUT', 'ECONNREFUSED', 'ENOTFOUND', 'EAI_AGAIN', 'ECONNRESET'];
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request format' });
  }
  if (NET_CODES.includes(err?.code)) {
    console.error('[api error] database unreachable:', err.code);
    return res.status(503).json({ error: 'Cannot reach the database. Check your internet / DATABASE_URL and try again.' });
  }
  // Postgres: undefined table (42P01) / column (42703) => schema not set up.
  if (err?.code === '42P01' || err?.code === '42703') {
    console.error('[api error] schema not initialized:', err.message);
    return res.status(500).json({ error: 'The database is not set up. Run "npm run db:reset", then restart the server.' });
  }
  console.error('[api error]', err);
  res.status(500).json({ error: 'Server error. Check the API server terminal for details.' });
});

process.on('uncaughtException', (e) => console.error('[uncaughtException]', e));
process.on('unhandledRejection', (e) => console.error('[unhandledRejection]', e));
pool.on('error', (e) => console.error('[pg pool error]', e.message));

if (!process.env.DATABASE_URL) {
  console.warn('[server] DATABASE_URL is not set — the API will start but DB calls will fail.');
}

const PORT = Number(process.env.PORT) || 5050;
const HOST = process.env.HOST || '127.0.0.1';
const server = app.listen(PORT, HOST, () => {
  console.log(`[server] API listening on http://${HOST}:${PORT}`);
  ensureSchema(); // auto-create missing tables + warn on stale schema
});
server.on('error', (e) => {
  console.error('[server error]', e.message);
  if (e.code === 'EADDRINUSE') {
    console.error(`[server] Port ${PORT} is in use. Set PORT=<free port> in .env (avoid Windows-reserved ranges).`);
    process.exit(1);
  }
});
