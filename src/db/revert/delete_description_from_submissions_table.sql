-- Revert teachhub:delete_description_from_submissions_table from pg

BEGIN;

    ALTER TABLE teachhub.submissions ADD COLUMN description TEXT;

COMMIT;
