-- Verify teachhub:add_invites_table on pg

BEGIN;

SELECT id, course_id, role_id, used_at
FROM teachhub.invites
WHERE false;


ROLLBACK;
