-- Verify teachhub:make_groups_assignment_aware on pg

BEGIN;

  SELECT assignment_id FROM teachhub.groups WHERE false;

ROLLBACK;
