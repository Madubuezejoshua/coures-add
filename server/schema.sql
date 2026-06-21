-- DocReview schema (Neon/Postgres). Run via `npm run db:migrate`.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin','editor','reviewer','publisher','user')),
  registration_number TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('pending','active','suspended','rejected')),
  wallet_balance NUMERIC NOT NULL DEFAULT 0,
  suspension_reason TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sequential per-role registration numbers (atomic via ON CONFLICT).
CREATE TABLE IF NOT EXISTS counters (
  role TEXT PRIMARY KEY,
  value INT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('draft','submitted','under_review','approved','ready_for_publishing','published','rejected','needs_correction')),
  contributor_id UUID,
  contributor_name TEXT,
  reviewer_id UUID,
  reviewer_name TEXT,
  publisher_id UUID,
  publisher_name TEXT,
  review_comments TEXT,
  rejection_reason TEXT,
  correction_notes TEXT,
  file_url TEXT,
  file_name TEXT,
  file_type TEXT,
  price NUMERIC,
  fee_paid BOOLEAN NOT NULL DEFAULT false,
  fee_paid_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  actor TEXT,
  actor_id UUID,
  actor_role TEXT,
  target TEXT,
  target_id TEXT,
  details TEXT,
  document_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL CHECK (type IN ('publication_fee','purchase')),
  user_id UUID,
  user_name TEXT,
  document_id UUID,
  document_title TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  reference TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  user_name TEXT,
  user_role TEXT,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid','rejected')),
  notes TEXT,
  processed_by TEXT,
  processed_at TIMESTAMPTZ,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  for_role TEXT,
  type TEXT,
  title TEXT,
  body TEXT,
  link TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_id UUID,
  from_name TEXT,
  from_role TEXT,
  to_id TEXT,
  to_name TEXT,
  body TEXT,
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_contributor ON documents(contributor_id);
CREATE INDEX IF NOT EXISTS idx_documents_reviewer ON documents(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_logs_created ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to ON messages(to_id);
CREATE INDEX IF NOT EXISTS idx_messages_from ON messages(from_id);
