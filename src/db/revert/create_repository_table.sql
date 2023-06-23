-- Revert teachhub:create_repository_table from pg

BEGIN;

  DROP TABLE teachhub.repositories;

COMMIT;
