-- Verify teachhub:create_roles_table on pg

BEGIN;

  SELECT
    id,
    name,
    parent_role_id,
    permissions,
    active
  FROM teachhub.roles;

ROLLBACK;
