-- Deploy teachhub:create_subjects_table to pg

BEGIN;

CREATE TABLE teachhub.subjects (
  id                    SERIAL PRIMARY KEY,
  name                  TEXT NOT NULL,
  code                  TEXT NOT NULL,
  active                BOOLEAN DEFAULT false
);

COMMIT;
