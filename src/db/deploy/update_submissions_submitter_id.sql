-- Deploy teachhub:update_submissions_submitter_id to pg

BEGIN;

ALTER TABLE teachhub.submissions
DROP COLUMN user_id,
ADD COLUMN submitter_id INTEGER NOT NULL,

-- Solo 1 submission por submitter.
ADD CONSTRAINT unique_assignment_submitter
UNIQUE (assignment_id, submitter_id);

CREATE FUNCTION check_submitter_is_user_or_group() RETURNS trigger AS $check_is_group_or_user$
    BEGIN
        IF NEW.submitter_id NOT IN (
          SELECT id
          FROM teachhub.users
          UNION
          SELECT id
          FROM teachhub.groups
        ) THEN
            RAISE EXCEPTION 'submitter_id must belong to groups or users';
        END IF;
        RETURN NEW;
    END;
$check_is_group_or_user$ LANGUAGE plpgsql;

CREATE TRIGGER check_is_group_or_user
BEFORE INSERT OR UPDATE ON teachhub.submissions
FOR EACH ROW EXECUTE PROCEDURE check_submitter_is_user_or_group();

COMMIT;
