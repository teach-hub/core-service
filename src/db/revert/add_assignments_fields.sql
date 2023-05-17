-- Revert teachhub:add_assignments_fields from pg

BEGIN;

ALTER TABLE teachhub.assignments DROP COLUMN allow_late_submissions;
ALTER TABLE teachhub.assignments DROP COLUMN description;
ALTER TABLE teachhub.assignments DROP COLUMN active;

COMMIT;
