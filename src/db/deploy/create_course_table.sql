-- Deploy teachhub:create_course_table to pg

BEGIN;

  CREATE TYPE PERIOD AS ENUM ('1', '2');

  CREATE TABLE teachhub.courses (
    id                    SERIAL PRIMARY KEY,
    name                  TEXT NOT NULL,
    github_organization   TEXT,

    -- Cuatrimetres: 1 / 2
    period                PERIOD NOT NULL DEFAULT '1',
    year                  INTEGER,
    active                BOOLEAN DEFAULT false,
    subject_id            INTEGER REFERENCES teachhub.subjects(id)
  );
COMMIT;
