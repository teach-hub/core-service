-- Revert teachhub:create_subjects_table from pg

BEGIN;

DROP TABLE teachhub.subjects;

COMMIT;
