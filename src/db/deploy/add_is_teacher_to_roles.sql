-- Deploy teachhub:add_is_teacher_to_roles to pg

BEGIN;

  ALTER TABLE teachhub.roles
  ADD is_teacher BOOLEAN NOT NULL DEFAULT false;

COMMIT;
