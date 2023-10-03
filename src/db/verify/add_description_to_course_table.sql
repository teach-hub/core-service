-- Verify teachhub:add_description_to_course_table on pg

BEGIN;

  SELECT description
  FROM teachhub.courses
  WHERE false;

ROLLBACK;
