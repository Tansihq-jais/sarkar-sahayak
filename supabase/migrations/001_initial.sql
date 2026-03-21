-- ============================================================
-- Sarkar Sahayak — Initial Database Migration
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── Extensions ───────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── ENUMs ────────────────────────────────────────────────
CREATE TYPE doc_status AS ENUM ('uploading', 'parsing', 'indexed', 'failed');
CREATE TYPE verdict_type AS ENUM ('ELIGIBLE', 'NOT_ELIGIBLE', 'LIKELY_ELIGIBLE', 'NEED_MORE_INFO');
CREATE TYPE scheme_category AS ENUM ('housing', 'health', 'agriculture', 'finance', 'education', 'other');

-- ── Table 1: users ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone         TEXT UNIQUE NOT NULL,
  name          TEXT,
  state         TEXT,
  district      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

-- ── Table 2: chat_sessions ───────────────────────────────
CREATE TABLE IF NOT EXISTS chat_sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID REFERENCES users(id) ON DELETE SET NULL,
  guest_session TEXT,                          -- anonymous session cookie value
  scheme_id     TEXT,
  scheme_name   TEXT,
  turn_count    INT NOT NULL DEFAULT 0,
  verdict       verdict_type,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table 3: messages ────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id    UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role          TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content       TEXT NOT NULL,
  sequence_num  INT NOT NULL DEFAULT 0,
  token_count   INT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table 4: documents ───────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
  name              TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  mime_type         TEXT NOT NULL,
  size_bytes        INT NOT NULL DEFAULT 0,
  char_count        INT NOT NULL DEFAULT 0,
  chunk_count       INT NOT NULL DEFAULT 0,
  status            doc_status NOT NULL DEFAULT 'uploading',
  is_preloaded      BOOLEAN NOT NULL DEFAULT FALSE,
  language          TEXT NOT NULL DEFAULT 'en',
  s3_key            TEXT,                      -- for Phase 2 server-side storage
  error_message     TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table 5: eligibility_results ─────────────────────────
CREATE TABLE IF NOT EXISTS eligibility_results (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id        UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id           UUID REFERENCES users(id) ON DELETE SET NULL,
  scheme_id         TEXT NOT NULL,
  scheme_name       TEXT,
  verdict           verdict_type NOT NULL,
  confidence_score  FLOAT,
  criteria_met      JSONB NOT NULL DEFAULT '[]',
  documents_needed  JSONB NOT NULL DEFAULT '[]',
  application_steps JSONB NOT NULL DEFAULT '[]',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table 6: schemes ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS schemes (
  id                  TEXT PRIMARY KEY,
  name                TEXT NOT NULL,
  slug                TEXT UNIQUE NOT NULL,
  category            scheme_category NOT NULL DEFAULT 'other',
  ministry            TEXT,
  description         TEXT,
  eligibility_summary TEXT,
  icon                TEXT,
  official_url        TEXT,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  last_policy_update  DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Table 7: otp_requests ────────────────────────────────
-- Tracks OTP send attempts for rate limiting
CREATE TABLE IF NOT EXISTS otp_requests (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone      TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Indexes ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id      ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_guest        ON chat_sessions(guest_session);
CREATE INDEX IF NOT EXISTS idx_chat_sessions_created_at   ON chat_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_session_id        ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at        ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_user_id          ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_is_preloaded     ON documents(is_preloaded);
CREATE INDEX IF NOT EXISTS idx_eligibility_session        ON eligibility_results(session_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_user           ON eligibility_results(user_id);
CREATE INDEX IF NOT EXISTS idx_eligibility_scheme         ON eligibility_results(scheme_id);
CREATE INDEX IF NOT EXISTS idx_otp_requests_phone         ON otp_requests(phone, created_at DESC);

-- ── updated_at trigger ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
