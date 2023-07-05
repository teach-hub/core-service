-- Verify teachhub:create_group_participant_table on pg

BEGIN;

SELECT
  id, assignment_id, user_role_id, group_id, active
FROM teachhub.group_participants
WHERE false;

ROLLBACK;
