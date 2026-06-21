// Map snake_case DB rows to the camelCase shapes the frontend already uses.
// Dates are returned as ISO strings (the frontend's formatDate handles them).

export const doc = (r) => r && ({
  id: r.id,
  title: r.title,
  description: r.description,
  content: r.content,
  status: r.status,
  contributorId: r.contributor_id,
  contributorName: r.contributor_name,
  reviewerId: r.reviewer_id || undefined,
  reviewerName: r.reviewer_name || undefined,
  publisherId: r.publisher_id || undefined,
  publisherName: r.publisher_name || undefined,
  reviewComments: r.review_comments || undefined,
  rejectionReason: r.rejection_reason || undefined,
  correctionNotes: r.correction_notes || undefined,
  fileUrl: r.file_url || undefined,
  fileName: r.file_name || undefined,
  fileType: r.file_type || undefined,
  price: r.price != null ? Number(r.price) : undefined,
  feePaid: r.fee_paid,
  feePaidAt: r.fee_paid_at || undefined,
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  publishedAt: r.published_at || undefined,
});

export const payment = (r) => r && ({
  id: r.id,
  type: r.type,
  userId: r.user_id,
  userName: r.user_name,
  documentId: r.document_id,
  documentTitle: r.document_title,
  amount: Number(r.amount),
  status: r.status,
  reference: r.reference || undefined,
  createdAt: r.created_at,
});

export const payout = (r) => r && ({
  id: r.id,
  userId: r.user_id,
  userName: r.user_name,
  userRole: r.user_role,
  amount: Number(r.amount),
  status: r.status,
  notes: r.notes || undefined,
  processedBy: r.processed_by || undefined,
  processedAt: r.processed_at || undefined,
  requestedAt: r.requested_at,
});

export const notification = (r) => r && ({
  id: r.id,
  userId: r.user_id || undefined,
  forRole: r.for_role || undefined,
  type: r.type,
  title: r.title,
  body: r.body,
  link: r.link || undefined,
  read: r.read,
  createdAt: r.created_at,
});

export const message = (r) => r && ({
  id: r.id,
  fromId: r.from_id,
  fromName: r.from_name,
  fromRole: r.from_role,
  toId: r.to_id,
  toName: r.to_name,
  body: r.body,
  read: r.read,
  createdAt: r.created_at,
});

export const log = (r) => r && ({
  id: r.id,
  action: r.action,
  actor: r.actor,
  actorId: r.actor_id,
  actorRole: r.actor_role,
  target: r.target || undefined,
  targetId: r.target_id || undefined,
  details: r.details,
  documentId: r.document_id || undefined,
  timestamp: r.created_at,
});
