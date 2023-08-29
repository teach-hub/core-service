-- Verify teachhub:change_invites_to_expire_after_time on pg

BEGIN;

  SELECT expires_at
  FROM teachhub.invites
  WHERE false;

ROLLBACK;
