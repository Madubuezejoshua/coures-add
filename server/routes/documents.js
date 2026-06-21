import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole, requireActive } from '../lib/auth.js';
import { logActivity, notify, ah } from '../lib/helpers.js';
import { doc as serDoc } from '../lib/serialize.js';

const router = Router();
router.use(authMiddleware);

const list = async (sql, params = []) => (await query(sql, params)).rows.map(serDoc);
const getDoc = async (id) => (await query('SELECT * FROM documents WHERE id=$1', [id])).rows[0];

// ---- reads -----------------------------------------------------------------
router.get('/mine', ah(async (req, res) =>
  res.json(await list('SELECT * FROM documents WHERE contributor_id=$1 ORDER BY created_at DESC', [req.user.id]))));

router.get('/corrections', ah(async (req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE contributor_id=$1 AND status IN ('rejected','needs_correction') ORDER BY updated_at DESC`, [req.user.id]))));

router.get('/review-queue', requireRole('reviewer'), ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='submitted' ORDER BY created_at`))));

router.get('/my-reviews', requireRole('reviewer'), ah(async (req, res) =>
  res.json(await list('SELECT * FROM documents WHERE reviewer_id=$1 ORDER BY updated_at DESC', [req.user.id]))));

router.get('/for-publishing', requireRole('admin'), ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='approved' ORDER BY updated_at DESC`))));

router.get('/ready', requireRole('publisher', 'admin'), ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='ready_for_publishing' ORDER BY updated_at DESC`))));

router.get('/published', ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='published' ORDER BY published_at DESC NULLS LAST`))));

router.get('/all', requireRole('admin'), ah(async (_req, res) =>
  res.json(await list('SELECT * FROM documents ORDER BY created_at DESC'))));

router.get('/:id', ah(async (req, res) => {
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json(serDoc(d));
}));

// ---- writes ----------------------------------------------------------------
router.post('/', requireRole('editor'), requireActive, ah(async (req, res) => {
  const { title, content, description, fileUrl, fileName, fileType } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
  const { rows } = await query(
    `INSERT INTO documents (title, description, content, status, contributor_id, contributor_name, file_url, file_name, file_type)
     VALUES ($1,$2,$3,'submitted',$4,$5,$6,$7,$8) RETURNING *`,
    [title.trim(), description || null, content || 'See attached file', req.user.id, req.user.full_name, fileUrl || null, fileName || null, fileType || null]
  );
  await logActivity('DOCUMENT_SUBMITTED', req.user.full_name, req.user.id, 'editor', `Submitted "${title}"`, title, rows[0].id, rows[0].id);
  res.json(serDoc(rows[0]));
}));

router.post('/:id/claim', requireRole('reviewer'), requireActive, ah(async (req, res) => {
  const d = await getDoc(req.params.id);
  if (!d || d.status !== 'submitted') return res.status(400).json({ error: 'Document is not available to claim' });
  await query(`UPDATE documents SET status='under_review', reviewer_id=$1, reviewer_name=$2, updated_at=now() WHERE id=$3`,
    [req.user.id, req.user.full_name, d.id]);
  await logActivity('REVIEW_CLAIMED', req.user.full_name, req.user.id, 'reviewer', `Claimed "${d.title}"`, d.title, d.id, d.id);
  res.json({ success: true });
}));

router.post('/:id/decide', requireRole('reviewer'), requireActive, ah(async (req, res) => {
  const { decision, comments } = req.body || {};
  const map = { approve: 'approved', reject: 'rejected', corrections: 'needs_correction' };
  const status = map[decision];
  if (!status) return res.status(400).json({ error: 'Invalid decision' });
  if (!comments?.trim()) return res.status(400).json({ error: 'Please provide comments' });

  const d = await getDoc(req.params.id);
  if (!d || d.status !== 'under_review' || d.reviewer_id !== req.user.id) return res.status(400).json({ error: 'Not allowed' });

  const col = decision === 'approve' ? 'review_comments' : decision === 'reject' ? 'rejection_reason' : 'correction_notes';
  await query(`UPDATE documents SET status=$1, ${col}=$2, updated_at=now() WHERE id=$3`, [status, comments, d.id]);
  await logActivity(`REVIEW_${decision.toUpperCase()}`, req.user.full_name, req.user.id, 'reviewer', `${decision} "${d.title}"`, d.title, d.id, d.id);
  if (d.contributor_id) {
    const t = decision === 'approve' ? 'Document approved' : decision === 'reject' ? 'Document rejected' : 'Revision requested';
    await notify(d.contributor_id, `REVIEW_${decision.toUpperCase()}`, t, `"${d.title}": see the reviewer's notes.`, '/editor/dashboard');
  }
  res.json({ success: true });
}));

router.post('/:id/resubmit', requireRole('editor'), requireActive, ah(async (req, res) => {
  const { content } = req.body || {};
  const d = await getDoc(req.params.id);
  if (!d || d.contributor_id !== req.user.id || !['rejected', 'needs_correction'].includes(d.status))
    return res.status(400).json({ error: 'Not allowed' });
  await query(`UPDATE documents SET status='submitted', content=$1, updated_at=now() WHERE id=$2`, [content ?? d.content, d.id]);
  await logActivity('DOCUMENT_RESUBMITTED', req.user.full_name, req.user.id, 'editor', `Resubmitted "${d.title}"`, d.title, d.id, d.id);
  if (d.reviewer_id) await notify(d.reviewer_id, 'DOCUMENT_RESUBMITTED', 'Document resubmitted', `"${d.title}" was corrected and resubmitted.`, '/reviewer/dashboard');
  res.json({ success: true });
}));

router.post('/:id/assign-publisher', requireRole('admin'), ah(async (req, res) => {
  const { publisherId, publisherName } = req.body || {};
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  await query(`UPDATE documents SET publisher_id=$1, publisher_name=$2, updated_at=now() WHERE id=$3`, [publisherId, publisherName, d.id]);
  await logActivity('DOCUMENT_ASSIGNED_TO_PUBLISHER', 'Admin', req.user.id, 'admin', `Assigned "${d.title}" to ${publisherName}`, publisherName, publisherId, d.id);
  await notify(publisherId, 'DOCUMENT_ASSIGNED', 'Document assigned to you', `"${d.title}" has been assigned to you for publishing.`, '/publisher/dashboard');
  res.json({ success: true });
}));

router.post('/:id/publish', requireRole('publisher'), requireActive, ah(async (req, res) => {
  const d = await getDoc(req.params.id);
  if (!d || d.status !== 'ready_for_publishing') return res.status(400).json({ error: 'Document is not ready to publish' });
  await query(`UPDATE documents SET status='published', publisher_id=$1, publisher_name=$2, published_at=now(), updated_at=now() WHERE id=$3`,
    [req.user.id, req.user.full_name, d.id]);
  await logActivity('DOCUMENT_PUBLISHED', req.user.full_name, req.user.id, 'publisher', `Published "${d.title}"`, d.title, d.id, d.id);
  if (d.contributor_id) await notify(d.contributor_id, 'DOCUMENT_PUBLISHED', 'Document published', `"${d.title}" is now live for readers.`, '/editor/dashboard');
  res.json({ success: true });
}));

export default router;
