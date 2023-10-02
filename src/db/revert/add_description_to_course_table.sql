-- Revert teachhub:add_description_to_course_table from pg

BEGIN;

  ALTER TABLE teachhub.courses
  DROP COLUMN description;

COMMIT;
