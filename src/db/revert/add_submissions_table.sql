-- Revert teachhub:add_submissions_table from pg

BEGIN;

  DROP TABLE teachhub.assignments;

COMMIT;

