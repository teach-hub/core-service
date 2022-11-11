-- Revert teachhub:create_admin_users_table from pg

BEGIN;

DROP TABLE teachhub.admin_users;

COMMIT;
