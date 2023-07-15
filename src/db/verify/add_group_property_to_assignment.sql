-- Verify teachhub:add_group_property_to_assignment on pg

BEGIN;

  SELECT is_group
  FROM teachhub.assignments
  WHERE false;

ROLLBACK;
