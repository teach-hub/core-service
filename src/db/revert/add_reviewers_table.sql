-- Revert teachhub:add_reviewers_table from pg

BEGIN;

DROP TABLE teachhub.reviewers;

COMMIT;
