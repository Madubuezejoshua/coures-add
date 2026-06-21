import { Router } from 'express';
import multer from 'multer';
import { query } from '../db.js';
import { authMiddleware, requireRole, requireActive, verifyToken } from '../lib/auth.js';
import { ah } from '../lib/helpers.js';
import { log as serLog } from '../lib/serialize.js';
import { storageUpload, storagePresignGet, storageConfigured } from '../lib/integrations.js';

const router = Router();

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ---- Activity logs (admin) ----
router.get('/logs', authMiddleware, requireRole('admin'), ah(async (_req, res) => {
  const { rows } = await query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 250');
  res.json(rows.map(serLog));
}));

// ---- File upload: proxied to Backblaze B2 (no browser CORS needed) ----
router.post('/uploads', authMiddleware, requireActive, upload.single('file'), ah(async (req, res) => {
  if (!storageConfigured) return res.status(503).json({ error: 'File storage is not configured.' });
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  const safe = req.file.originalname.replace(/[^a-zA-Z0-9.\-]/g, '_');
  const key = `documents/${req.user.id}/${Date.now()}_${safe}`;
  await storageUpload(key, req.file.buffer, req.file.mimetype);

  // `key` is stored on the document and resolved to a temporary URL on download.
  res.json({ key, fileName: req.file.originalname, fileType: req.file.mimetype, size: req.file.size });
}));

// ---- File download: presigned GET redirect (private bucket).
// Auth via ?token= because plain <a> links can't send an Authorization header.
router.get('/uploads/download', ah(async (req, res) => {
  const key = req.query.key;
  const token = req.query.token;
  if (!key) return res.status(400).json({ error: 'key required' });
  if (!verifyToken(String(token || ''))) return res.status(401).json({ error: 'Not authenticated' });
  const url = await storagePresignGet(String(key));
  if (!url) return res.status(503).json({ error: 'Storage not configured' });
  res.redirect(url);
}));

export default router;
