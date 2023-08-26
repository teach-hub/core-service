-- Deploy teachhub:change_invites_to_expire_after_time to pg

BEGIN;

    ALTER TABLE teachhub.invites DROP COLUMN used_at;
    ALTER TABLE teachhub.invites ADD COLUMN expires_at TIMESTAMP WITH TIME ZONE;

COMMIT;
