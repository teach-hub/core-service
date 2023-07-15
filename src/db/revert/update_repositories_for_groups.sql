-- Revert teachhub:update_repositories_for_groups from pg

BEGIN;

    ALTER TABLE teachhub.repositories ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE teachhub.repositories DROP COLUMN group_id;

COMMIT;
