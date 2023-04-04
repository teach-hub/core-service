-- Revert teachhub:add_assignments_table from pg

BEGIN;

DROP TABLE teachhub.assignments;

COMMIT;
