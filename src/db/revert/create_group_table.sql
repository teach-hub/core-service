-- Revert teachhub:create_group_table from pg

BEGIN;

  DROP TABLE teachhub.groups;

COMMIT;
