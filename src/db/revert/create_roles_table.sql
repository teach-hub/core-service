-- Revert teachhub:create_roles_table from pg

BEGIN;

  DROP TABLE teachhub.roles;

COMMIT;
