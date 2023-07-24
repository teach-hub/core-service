-- Deploy teachhub:add_reviewee_id_reviewers to pg

BEGIN;

ALTER TABLE teachhub.reviewers
DROP COLUMN reviewee_user_id,
DROP COLUMN reviewee_group_id,
ADD COLUMN reviewee_id INTEGER NOT NULL,

-- No podemos tener un reviewee con dos reviewers.
ADD CONSTRAINT unique_assigment_reviewee UNIQUE (assignment_id, reviewee_id);

CREATE FUNCTION check_reviewee_is_user_or_group() RETURNS trigger AS $check_is_group_or_user$
    BEGIN
        IF NEW.reviewee_id NOT IN (SELECT id FROM teachhub.users UNION SELECT id FROM teachhub.groups) THEN
            RAISE EXCEPTION 'reviewe_id must belong to groups or users';
        END IF;
        RETURN NEW;
    END;
$check_is_group_or_user$ LANGUAGE plpgsql;

CREATE TRIGGER check_is_group_or_user
BEFORE INSERT OR UPDATE ON teachhub.reviewers
FOR EACH ROW EXECUTE PROCEDURE check_reviewee_is_user_or_group();

COMMIT;
