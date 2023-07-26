-- Deploy teachhub:update_submissions_submitee_id to pg

BEGIN;

ALTER TABLE teachhub.submissions
DROP COLUMN user_id,
ADD COLUMN submitee_id INTEGER NOT NULL,

-- Solo 1 submission por submitee.
ADD CONSTRAINT unique_assignment_submitee
UNIQUE (assignment_id, submitee_id);

CREATE FUNCTION check_submitee_is_user_or_group() RETURNS trigger AS $check_is_group_or_user$
    BEGIN
        IF NEW.submitee_id NOT IN (
          SELECT id
          FROM teachhub.users
          UNION
          SELECT id
          FROM teachhub.groups
        ) THEN
            RAISE EXCEPTION 'submitee_id must belong to groups or users';
        END IF;
        RETURN NEW;
    END;
$check_is_group_or_user$ LANGUAGE plpgsql;

CREATE TRIGGER check_is_group_or_user
BEFORE INSERT OR UPDATE ON teachhub.submissions
FOR EACH ROW EXECUTE PROCEDURE check_submitee_is_user_or_group();

COMMIT;
