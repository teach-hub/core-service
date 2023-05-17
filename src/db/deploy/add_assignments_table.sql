-- Deploy teachhub:add_assignments_table to pg

BEGIN;

  CREATE TABLE teachhub.assignments (
    id                    SERIAL PRIMARY KEY,
    course_id             INTEGER REFERENCES teachhub.courses(id) NOT NULL,
    start_date            TIMESTAMP WITH TIME ZONE,
    end_date              TIMESTAMP WITH TIME ZONE,
    link                  TEXT,
    title                 TEXT
  );

COMMIT;
