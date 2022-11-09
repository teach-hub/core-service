-- Revert teachhub:create_users_table from pg

BEGIN;

  DROP TABLE teachhub.users;

COMMIT;
