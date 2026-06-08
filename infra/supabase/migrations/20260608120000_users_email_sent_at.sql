-- ===========================================================================
-- Users: email_sent_at (S60)
--
-- S60 wires Resend + React Email to deliver the HURL invitation at email
-- capture. `email_sent_at` records the last successful send so re-submitting
-- the same email within an hour does NOT re-send (idempotence). NULL = never
-- sent; set on a successful send (live or mocked). Idempotent.
-- ===========================================================================

alter table users add column if not exists email_sent_at timestamptz; -- last HURL-invitation send; NULL = never
