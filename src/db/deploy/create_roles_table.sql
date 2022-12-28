-- Deploy teachhub:create_roles_table to pg

BEGIN;

  CREATE TABLE teachhub.roles (
    id                    SERIAL PRIMARY KEY,
    name                  TEXT NOT NULL,
    parent_role_id        INTEGER REFERENCES teachhub.roles(id),
    permissions           TEXT NOT NULL,
    active                BOOLEAN DEFAULT false
  );

COMMIT;
