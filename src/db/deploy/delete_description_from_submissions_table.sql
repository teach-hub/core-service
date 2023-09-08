-- Deploy teachhub:delete_description_from_submissions_table to pg

BEGIN;

    ALTER TABLE teachhub.submissions DROP COLUMN description;


COMMIT;
