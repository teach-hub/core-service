-- Deploy teachhub:add_group_property_to_assignment to pg

BEGIN;

  ALTER TABLE teachhub.assignments
  ADD is_group BOOLEAN NOT NULL DEFAULT false;

COMMIT;
