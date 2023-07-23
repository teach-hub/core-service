-- Deploy teachhub:uniqueness_course_user_user_roles to pg

BEGIN;


-- Un alumno no puede tener mas de un rol en el mismo curso.

ALTER TABLE teachhub.user_roles
ADD CONSTRAINT unique_course_user UNIQUE (course_id, user_id);

COMMIT;
