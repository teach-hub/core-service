-- Deploy teachhub:create_review_table to pg

BEGIN;

CREATE TABLE teachhub.reviews (
    id                    SERIAL PRIMARY KEY,
    submission_id         INTEGER REFERENCES teachhub.submissions(id) NOT NULL,
    reviewer_id           INTEGER REFERENCES teachhub.reviewers(id) NOT NULL,
    grade                 INTEGER,
    revision_requested    BOOLEAN,
    created_at            TIMESTAMP WITH TIME ZONE,
    updated_at            TIMESTAMP WITH TIME ZONE
  );

COMMIT;
