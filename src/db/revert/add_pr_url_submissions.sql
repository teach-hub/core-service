-- Revert teachhub:add_pr_url_submissions from pg

BEGIN;
  ALTER TABLE teachhub.submissions
  DROP COLUMN pull_request_url;

COMMIT;
