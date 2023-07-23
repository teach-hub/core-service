-- Revert teachhub:uniqueness_course_user_user_roles from pg

BEGIN;

ALTER TABLE teachhub.user_roles
DROP CONSTRAINT unique_course_user;

COMMIT;
