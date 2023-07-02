-- Revert teachhub:create_group_participant_table from pg

BEGIN;

  DROP TABLE teachhub.group_participants;

COMMIT;
