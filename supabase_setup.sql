-- ============================================================
-- YS Group Admissions — Supabase Setup with pgvector RAG
-- Run this ONCE in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Step 1: Enable pgvector extension (for RAG embeddings)
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================
-- Step 2: Main leads table
-- ============================================================
CREATE TABLE IF NOT EXISTS admission_leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id       TEXT UNIQUE NOT NULL,
  parent_name   TEXT NOT NULL,
  student_name  TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  class_applying TEXT NOT NULL,
  academic_year TEXT NOT NULL DEFAULT '2025-26',
  source        TEXT,
  message       TEXT,
  status        TEXT NOT NULL DEFAULT 'New',
  priority      TEXT NOT NULL DEFAULT 'Normal',
  assigned_to   TEXT,
  follow_up_due TIMESTAMPTZ,
  submitted_at  TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER admission_leads_updated_at
  BEFORE UPDATE ON admission_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- Step 3: Embeddings table for RAG (pgvector)
-- 1536 dimensions = OpenAI text-embedding-3-small
-- ============================================================
CREATE TABLE IF NOT EXISTS lead_embeddings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id     TEXT NOT NULL REFERENCES admission_leads(lead_id) ON DELETE CASCADE,
  content     TEXT NOT NULL,        -- the text that was embedded
  embedding   VECTOR(1536),         -- pgvector column
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- IVFFlat index for fast approximate nearest-neighbor search
CREATE INDEX IF NOT EXISTS lead_embeddings_idx
  ON lead_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- ============================================================
-- Step 4: RAG match function — finds N most similar past leads
-- Called from n8n after generating embedding for new lead
-- ============================================================
CREATE OR REPLACE FUNCTION match_leads(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count     INT DEFAULT 3
)
RETURNS TABLE (
  lead_id        TEXT,
  parent_name    TEXT,
  student_name   TEXT,
  class_applying TEXT,
  source         TEXT,
  message        TEXT,
  status         TEXT,
  priority       TEXT,
  assigned_to    TEXT,
  similarity     FLOAT
)
LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT
    al.lead_id,
    al.parent_name,
    al.student_name,
    al.class_applying,
    al.source,
    al.message,
    al.status,
    al.priority,
    al.assigned_to,
    1 - (le.embedding <=> query_embedding) AS similarity
  FROM lead_embeddings le
  JOIN admission_leads al ON al.lead_id = le.lead_id
  WHERE 1 - (le.embedding <=> query_embedding) > match_threshold
  ORDER BY le.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- ============================================================
-- Step 5: Daily report stats function (used by Daily Report page)
-- ============================================================
CREATE OR REPLACE FUNCTION get_daily_stats(report_date DATE DEFAULT CURRENT_DATE)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_leads',         COUNT(*),
    'new_today',           COUNT(*) FILTER (WHERE DATE(submitted_at) = report_date),
    'contacted',           COUNT(*) FILTER (WHERE status = 'Contacted'),
    'admitted',            COUNT(*) FILTER (WHERE status = 'Admitted'),
    'follow_up_pending',   COUNT(*) FILTER (WHERE status = 'Follow-up Pending'),
    'not_interested',      COUNT(*) FILTER (WHERE status = 'Not Interested'),
    'high_priority',       COUNT(*) FILTER (WHERE priority = 'High'),
    'top_source',          (
      SELECT source FROM admission_leads
      GROUP BY source ORDER BY COUNT(*) DESC LIMIT 1
    )
  )
  INTO result
  FROM admission_leads;
  RETURN result;
END;
$$;

-- ============================================================
-- Step 6: Row Level Security — anon key can only read
--          service_role key can do everything
-- ============================================================
ALTER TABLE admission_leads    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_embeddings    ENABLE ROW LEVEL SECURITY;

-- Allow anon/authenticated to SELECT (for dashboard reads)
CREATE POLICY "read_leads" ON admission_leads
  FOR SELECT USING (true);

CREATE POLICY "read_embeddings" ON lead_embeddings
  FOR SELECT USING (true);

-- Only service_role can INSERT/UPDATE/DELETE (n8n uses service_role)
CREATE POLICY "service_insert_leads" ON admission_leads
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "service_update_leads" ON admission_leads
  FOR UPDATE USING (auth.role() = 'service_role');

CREATE POLICY "service_insert_embeddings" ON lead_embeddings
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

-- ============================================================
-- Step 7: Seed 5 sample leads for demo
-- ============================================================
INSERT INTO admission_leads (lead_id, parent_name, student_name, phone, email, class_applying, academic_year, source, message, status, priority, assigned_to)
VALUES
  ('LEAD-DEMO001', 'Rajesh Kumar',   'Priya Kumar',   '9876543210', 'rajesh@example.com',  'Class 6',           '2025-26', 'Google Search',           'Interested in science stream',      'New',             'Normal', 'Sunita Sharma'),
  ('LEAD-DEMO002', 'Meena Patel',    'Arjun Patel',   '8765432109', 'meena@example.com',   'Class 10',          '2025-26', 'Friend/Family Referral',  'Urgent admission needed',           'Contacted',       'High',   'Vikram Singh'),
  ('LEAD-DEMO003', 'Suresh Nair',    'Kavya Nair',    '7654321098', 'suresh@example.com',  'Nursery',           '2026-27', 'Social Media',            '',                                  'New',             'Normal', 'Sunita Sharma'),
  ('LEAD-DEMO004', 'Anjali Singh',   'Rohan Singh',   '6543210987', 'anjali@example.com',  'Class 12 (Science)','2025-26', 'Walk-in',                 'Needs scholarship info',            'Admitted',        'High',   'Vikram Singh'),
  ('LEAD-DEMO005', 'Prakash Joshi',  'Ananya Joshi',  '9988776655', 'prakash@example.com', 'Class 3',           '2025-26', 'Newspaper Advertisement', '',                                  'Follow-up Pending','Medium','Sunita Sharma')
ON CONFLICT (lead_id) DO NOTHING;

-- ============================================================
-- Verify setup
-- ============================================================
SELECT 'Tables created' as status, COUNT(*) as leads_count FROM admission_leads;
