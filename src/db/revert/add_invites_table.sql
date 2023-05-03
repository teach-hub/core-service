-- Revert teachhub:add_invites_table from pg

BEGIN;

DROP TABLE teachhub.invites;

COMMIT;
