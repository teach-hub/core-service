-- Revert teachhub:create_user_roles_table from pg

BEGIN;

DROP TABLE teachhub.user_roles;

COMMIT;
