-- Verify teachhub:add_pr_url_submissions on pg

BEGIN;

  SELECT pull_request_url
  FROM teachhub.submissions;

ROLLBACK;
