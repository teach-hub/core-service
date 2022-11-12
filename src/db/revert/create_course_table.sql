-- Revert teachhub:create_course_table from pg

BEGIN;

DROP TABLE teachhub.courses;
DROP TYPE PERIOD;

COMMIT;
