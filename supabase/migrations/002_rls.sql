-- ============================================================
-- Sarkar Sahayak — Row Level Security Policies
-- Run AFTER 001_initial.sql
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE users                ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages             ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents            ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_results  ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_requests         ENABLE ROW LEVEL SECURITY;

-- ── users: own row only ───────────────────────────────────
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- ── chat_sessions: own sessions only ─────────────────────
CREATE POLICY "sessions_select_own" ON chat_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "sessions_insert_own" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "sessions_update_own" ON chat_sessions
  FOR UPDATE USING (auth.uid() = user_id);

-- ── messages: via session ownership ──────────────────────
CREATE POLICY "messages_select_own" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = messages.session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

CREATE POLICY "messages_insert_own" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_sessions s
      WHERE s.id = messages.session_id
      AND (s.user_id = auth.uid() OR s.user_id IS NULL)
    )
  );

-- ── documents: own + preloaded ───────────────────────────
CREATE POLICY "documents_select_own_or_preloaded" ON documents
  FOR SELECT USING (
    is_preloaded = TRUE OR auth.uid() = user_id
  );

CREATE POLICY "documents_insert_own" ON documents
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "documents_delete_own" ON documents
  FOR DELETE USING (auth.uid() = user_id);

-- ── eligibility_results: own results only ────────────────
CREATE POLICY "results_select_own" ON eligibility_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "results_insert_own" ON eligibility_results
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ── schemes: public read, no write ───────────────────────
CREATE POLICY "schemes_public_read" ON schemes
  FOR SELECT USING (is_active = TRUE);

-- ── otp_requests: insert only (server-side rate limiting) ─
CREATE POLICY "otp_insert_anon" ON otp_requests
  FOR INSERT WITH CHECK (TRUE);
