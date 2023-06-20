-- Deploy teachhub:add_pr_url_submissions to pg

BEGIN;

  ALTER TABLE teachhub.submissions
    ADD COLUMN pull_request_url TEXT DEFAULT 'http://github.com' NOT NULL;

  ALTER TABLE teachhub.submissions
    ALTER COLUMN pull_request_url DROP DEFAULT;

COMMIT;
