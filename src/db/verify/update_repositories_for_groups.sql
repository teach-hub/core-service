-- Verify teachhub:update_repositories_for_groups on pg

BEGIN;

  SELECT group_id
  FROM teachhub.repositories
  WHERE false;

ROLLBACK;
