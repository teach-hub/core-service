-- Verify teachhub:create_users_table on pg

BEGIN;
  SELECT
    id,
    github_id,
    name,
    last_name,
    file,
    active
  FROM teachhub.users
  WHERE false;
ROLLBACK;
