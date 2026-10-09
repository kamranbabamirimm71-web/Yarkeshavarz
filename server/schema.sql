-- YarKeshavarz online subscriptions and AI usage foundation (Cloudflare D1)
-- Run only in a NEW D1 database. Do not run against an existing database without backup.
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  phone TEXT UNIQUE,
  email TEXT UNIQUE,
  display_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'farmer' CHECK (role IN ('farmer','admin')),
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  disabled_at TEXT
);

CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  revoked_at TEXT
);
CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_code TEXT NOT NULL CHECK (plan_code IN ('economic','professional')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('inactive','active','expired','cancelled','suspended')),
  starts_at TEXT,
  ends_at TEXT,
  payment_provider TEXT,
  payment_reference TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS subscriptions_user_status_idx ON subscriptions(user_id,status,ends_at);
CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_payment_reference_unique
  ON subscriptions(payment_provider,payment_reference)
  WHERE payment_reference IS NOT NULL;

CREATE TABLE IF NOT EXISTS usage_monthly (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  month_key TEXT NOT NULL,
  chat_count INTEGER NOT NULL DEFAULT 0 CHECK (chat_count >= 0),
  vision_count INTEGER NOT NULL DEFAULT 0 CHECK (vision_count >= 0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY(user_id,month_key)
);

CREATE TABLE IF NOT EXISTS ai_usage_log (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('chat','vision')),
  model TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success','error','rejected')),
  provider_request_id TEXT,
  duration_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS ai_usage_log_user_date_idx ON ai_usage_log(user_id,created_at);

CREATE TABLE IF NOT EXISTS payment_events (
  id TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  provider_event_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  UNIQUE(provider,provider_event_id)
);
