-- Deploy teachhub:create_repository_table to pg

BEGIN;

  CREATE TABLE teachhub.repositories (
    id                    SERIAL PRIMARY KEY,
    course_id             INTEGER REFERENCES teachhub.courses(id) NOT NULL,
    user_id               INTEGER REFERENCES teachhub.users(id) NOT NULL,
    githubId                  INTEGER NOT NULL,
    name                  TEXT NOT NULL,
    active                  BOOLEAN NOT NULL
  );

COMMIT;
