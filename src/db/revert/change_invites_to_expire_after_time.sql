-- Revert teachhub:change_invites_to_expire_after_time from pg

BEGIN;

    ALTER TABLE teachhub.invites DROP COLUMN expires_at;
    ALTER TABLE teachhub.invites ADD COLUMN used_at TIMESTAMP WITH TIME ZONE;

COMMIT;
