-- Deploy teachhub:update_repositories_for_groups to pg

BEGIN;

  ALTER TABLE teachhub.repositories ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE teachhub.repositories ADD group_id INTEGER REFERENCES teachhub.groups(id);

COMMIT;
