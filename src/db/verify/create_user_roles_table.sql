-- Verify teachhub:create_user_roles_table on pg

BEGIN;

SELECT
    id,
    role_id,
    user_id,
    course_id,
    active
    FROM teachhub.user_roles;

ROLLBACK;
