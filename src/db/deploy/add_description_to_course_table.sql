-- Deploy teachhub:add_description_to_course_table to pg

BEGIN;


  ALTER TABLE teachhub.courses
  ADD description TEXT DEFAULT null;

COMMIT;
