import { Router } from 'express';
import { query } from '../db.js';
import { authMiddleware, requireRole, requireActive } from '../lib/auth.js';
import { logActivity, notify, notifyAdmins, notifyRole, ah } from '../lib/helpers.js';
import { doc as serDoc } from '../lib/serialize.js';

const router = Router();

const list = async (sql, params = []) => (await query(sql, params)).rows.map(serDoc);
const getDoc = async (id) => (await query('SELECT * FROM documents WHERE id=$1', [id])).rows[0];

// ---- reads -----------------------------------------------------------------
router.get('/published', ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='published' ORDER BY published_at DESC NULLS LAST`))));

router.use(authMiddleware);

router.get('/mine', ah(async (req, res) =>
  res.json(await list('SELECT * FROM documents WHERE contributor_id=$1 ORDER BY created_at DESC', [req.user.id]))));

router.get('/corrections', ah(async (req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE contributor_id=$1 AND status IN ('rejected','needs_correction') ORDER BY updated_at DESC`, [req.user.id]))));

router.get('/review-queue', requireRole('editor', 'reviewer', 'admin'), ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='submitted' ORDER BY created_at`))));

router.get('/editor-queue', requireRole('editor', 'admin'), ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status IN ('submitted','under_review','needs_correction','approved','ready_for_publishing') ORDER BY updated_at DESC`))));

router.get('/reviewers', requireRole('editor', 'admin'), ah(async (_req, res) => {
  const { rows } = await query(`SELECT id, full_name, email FROM users WHERE role='reviewer' AND status='active' ORDER BY full_name ASC`);
  res.json(rows);
}));

router.get('/my-reviews', requireRole('reviewer'), ah(async (req, res) =>
  res.json(await list('SELECT * FROM documents WHERE reviewer_id=$1 ORDER BY updated_at DESC', [req.user.id]))));

router.get('/for-publishing', requireRole('editor', 'publisher', 'admin'), ah(async (_req, res) =>
  res.json(await list(`SELECT * FROM documents WHERE status='approved' ORDER BY updated_at DESC`))));

router.get('/ready', requireRole('publisher', 'admin'), ah(async (req, res) => {
  if (req.user.role === 'publisher') {
    res.json(await list(
      `SELECT * FROM documents WHERE status='ready_for_publishing' AND publisher_id=$1 ORDER BY updated_at DESC`,
      [req.user.id]
    ));
    return;
  }

  res.json(await list(`SELECT * FROM documents WHERE status='ready_for_publishing' ORDER BY updated_at DESC`));
}));

router.get('/all', requireRole('admin'), ah(async (_req, res) =>
  res.json(await list('SELECT * FROM documents ORDER BY created_at DESC'))));

router.get('/:id', ah(async (req, res) => {
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  res.json(serDoc(d));
}));

router.put('/:id', requireRole('admin'), requireActive, ah(async (req, res) => {
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });

  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : d.title;
  const description = typeof req.body?.description === 'string' ? req.body.description : d.description;
  const content = typeof req.body?.content === 'string' ? req.body.content : d.content;

  if (!title) return res.status(400).json({ error: 'Title is required' });

  const { rows } = await query(
    `UPDATE documents
     SET title=$1, description=$2, content=$3, updated_at=now()
     WHERE id=$4
     RETURNING *`,
    [title, description || null, content, d.id]
  );

  await logActivity(
    'DOCUMENT_UPDATED_BY_ADMIN',
    req.user.full_name,
    req.user.id,
    'admin',
    `Updated "${title}"`,
    title,
    rows[0].id,
    rows[0].id
  );

  res.json(serDoc(rows[0]));
}));

// ---- writes ----------------------------------------------------------------
router.post('/', requireRole('author'), requireActive, ah(async (req, res) => {
  const { title, content, description, fileUrl, fileName, fileType } = req.body || {};
  if (!title?.trim()) return res.status(400).json({ error: 'Title is required' });
  const { rows } = await query(
    `INSERT INTO documents (title, description, content, status, contributor_id, contributor_name, file_url, file_name, file_type)
     VALUES ($1,$2,$3,'submitted',$4,$5,$6,$7,$8) RETURNING *`,
    [title.trim(), description || null, content || 'See attached file', req.user.id, req.user.full_name, fileUrl || null, fileName || null, fileType || null]
  );
  await logActivity('DOCUMENT_SUBMITTED', req.user.full_name, req.user.id, req.user.role, `Submitted "${title}"`, title, rows[0].id, rows[0].id);
  await notifyRole('editor', 'DOCUMENT_SUBMITTED', 'New manuscript submitted', `"${title}" is ready for editorial review.`, '/editor/dashboard');
  await notifyAdmins('DOCUMENT_SUBMITTED', 'New manuscript submitted', `"${title}" was submitted by ${req.user.full_name}.`, '/dashboard');
  res.json(serDoc(rows[0]));
}));

router.post('/:id/assign-reviewer', requireRole('editor', 'admin'), requireActive, ah(async (req, res) => {
  const { reviewerId, reviewerName } = req.body || {};
  if (!reviewerId || !reviewerName) return res.status(400).json({ error: 'Reviewer details are required' });

  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  if (!['submitted', 'under_review', 'needs_correction'].includes(d.status)) {
    return res.status(400).json({ error: 'Only submissions awaiting review can be assigned to a reviewer' });
  }

  await query(
    `UPDATE documents
     SET reviewer_id=$1, reviewer_name=$2, status='under_review', updated_at=now()
     WHERE id=$3`,
    [reviewerId, reviewerName, d.id]
  );

  await logActivity('REVIEWER_ASSIGNED', req.user.full_name, req.user.id, req.user.role, `Assigned reviewer ${reviewerName} to "${d.title}"`, d.title, d.id, d.id);
  await notify(reviewerId, 'REVIEW_ASSIGNED', 'New manuscript assigned', `You have been assigned "${d.title}" for review.`, '/reviewer/dashboard');
  res.json({ success: true });
}));

router.post('/:id/decide', requireRole('reviewer'), requireActive, ah(async (req, res) => {
  const { decision } = req.body || {};
  const rawComments =
    req.body?.comments ??
    req.body?.reviewComments ??
    req.body?.rejectionReason ??
    req.body?.correctionNotes ??
    '';
  const comments = String(rawComments).trim();
  const map = { approve: 'approved', reject: 'rejected', corrections: 'needs_correction' };
  const status = map[decision];
  if (!status) return res.status(400).json({ error: 'Invalid decision' });
  if (!comments) return res.status(400).json({ error: 'Please provide comments' });

  const d = await getDoc(req.params.id);
  const canDecide = req.user.role === 'admin' || (!d?.reviewer_id || d.reviewer_id === req.user.id);
  if (!d || d.status !== 'under_review' || !canDecide) {
    return res.status(403).json({ error: 'Only the assigned reviewer can submit this decision.' });
  }

  const col = decision === 'approve' ? 'review_comments' : decision === 'reject' ? 'rejection_reason' : 'correction_notes';
  await query(`UPDATE documents SET status=$1, ${col}=$2, updated_at=now() WHERE id=$3`, [status, comments, d.id]);
  await logActivity(`REVIEW_${decision.toUpperCase()}`, req.user.full_name, req.user.id, req.user.role, `${decision} "${d.title}"`, d.title, d.id, d.id);
  await notifyRole('editor', `REVIEW_${decision.toUpperCase()}`, 'Review completed', `The review for "${d.title}" is now ready for editorial action.`, '/editor/dashboard');
  res.json({ success: true });
}));

router.post('/:id/return-to-author', requireRole('editor', 'admin'), requireActive, ah(async (req, res) => {
  const { comments } = req.body || {};
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  if (!['needs_correction'].includes(d.status)) return res.status(400).json({ error: 'Only manuscripts needing revision can be returned to the author' });

  const note = String(comments || d.correction_notes || '').trim();
  await query(`UPDATE documents SET correction_notes=$1, status='needs_correction', updated_at=now() WHERE id=$2`, [note || null, d.id]);
  if (d.contributor_id) {
    await notify(d.contributor_id, 'DOCUMENT_RETURNED_FOR_REVISION', 'Revision requested', `The editor has returned "${d.title}" for revisions.`, '/dashboard');
  }
  await logActivity('DOCUMENT_RETURNED_TO_AUTHOR', req.user.full_name, req.user.id, req.user.role, `Returned "${d.title}" to the author`, d.title, d.id, d.id);
  res.json({ success: true });
}));

router.post('/:id/resubmit', requireRole('author'), requireActive, ah(async (req, res) => {
  const { content } = req.body || {};
  const d = await getDoc(req.params.id);
  if (!d || d.contributor_id !== req.user.id || !['rejected', 'needs_correction'].includes(d.status))
    return res.status(400).json({ error: 'Not allowed' });
  await query(`UPDATE documents SET status='submitted', reviewer_id=NULL, reviewer_name=NULL, review_comments=NULL, rejection_reason=NULL, correction_notes=NULL, content=$1, updated_at=now() WHERE id=$2`, [content ?? d.content, d.id]);
  await logActivity('DOCUMENT_RESUBMITTED', req.user.full_name, req.user.id, req.user.role, `Resubmitted "${d.title}"`, d.title, d.id, d.id);
  await notifyRole('editor', 'DOCUMENT_RESUBMITTED', 'Manuscript resubmitted', `"${d.title}" was corrected and is ready for reassignment.`, '/editor/dashboard');
  res.json({ success: true });
}));

router.post('/:id/forward-to-publisher', requireRole('editor', 'admin'), requireActive, ah(async (req, res) => {
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  if (d.status !== 'approved') return res.status(400).json({ error: 'Only approved manuscripts can be forwarded to the publisher' });

  await query(`UPDATE documents SET status='ready_for_publishing', updated_at=now() WHERE id=$1`, [d.id]);
  await logActivity('DOCUMENT_FORWARDED_TO_PUBLISHER', req.user.full_name, req.user.id, req.user.role, `Forwarded "${d.title}" to publisher`, d.title, d.id, d.id);
  await notifyRole('publisher', 'DOCUMENT_READY_FOR_PUBLISHING', 'Manuscript ready for publishing', `"${d.title}" is ready for publication.`, '/publisher/dashboard');
  res.json({ success: true });
}));

router.post('/:id/assign-publisher', requireRole('editor', 'admin'), requireActive, ah(async (req, res) => {
  const { publisherId, publisherName } = req.body || {};
  const d = await getDoc(req.params.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  if (!publisherId || !publisherName) {
    return res.status(400).json({ error: 'Publisher details are required' });
  }
  if (!['approved', 'ready_for_publishing'].includes(d.status)) {
    return res.status(400).json({ error: 'Only approved documents can be assigned to publishers' });
  }

  await query(
    `UPDATE documents
     SET publisher_id=$1, publisher_name=$2, status='ready_for_publishing', updated_at=now()
     WHERE id=$3`,
    [publisherId, publisherName, d.id]
  );

  await logActivity(
    'DOCUMENT_ASSIGNED_TO_PUBLISHER',
    req.user.full_name,
    req.user.id,
    req.user.role,
    `Assigned "${d.title}" to ${publisherName}`,
    publisherName,
    publisherId,
    d.id
  );
  await notify(
    publisherId,
    'DOCUMENT_ASSIGNED',
    'Document assigned to you',
    `"${d.title}" has been assigned to you for publishing.`,
    '/publisher/dashboard'
  );
  if (d.contributor_id) {
    await notify(d.contributor_id, 'DOCUMENT_FORWARDED', 'Document forwarded to publisher', `"${d.title}" was forwarded for publication.`, '/dashboard');
  }
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
