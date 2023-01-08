-- Deploy teachhub:create_user_roles_table to pg

BEGIN;

  CREATE TABLE teachhub.user_roles (
    id                    SERIAL PRIMARY KEY,
    role_id        INTEGER REFERENCES teachhub.roles(id),
    user_id        INTEGER REFERENCES teachhub.users(id),
    course_id        INTEGER REFERENCES teachhub.courses(id),
    active                BOOLEAN DEFAULT false
  );

COMMIT;
