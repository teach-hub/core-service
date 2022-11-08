-- Deploy teachhub:create_admin_users_table to pg

BEGIN;

CREATE TABLE teachhub.admin_users (
  id                    SERIAL PRIMARY KEY,
  email                 TEXT NOT NULL,
  password              TEXT NOT NULL,
  name                  TEXT NOT NULL,
  last_name             TEXT
);

COMMIT;
