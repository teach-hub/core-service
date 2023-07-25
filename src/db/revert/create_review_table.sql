-- Revert teachhub:create_review_table from pg

BEGIN;

  DROP TABLE teachhub.reviews;

COMMIT;
