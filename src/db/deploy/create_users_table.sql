-- Deploy teachhub:create_users_table to pg

BEGIN;

CREATE TABLE teachhub.users (
  id                    SERIAL PRIMARY KEY,
  github_id             TEXT NOT NULL,
  notification_email    TEXT NOT NULL,
  name                  TEXT NOT NULL,
  last_name             TEXT NOT NULL,

  -- Padron
  file                  TEXT,
  active                BOOLEAN DEFAULT false NOT NULL
);

COMMIT;
