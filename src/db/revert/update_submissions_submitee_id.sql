-- Revert teachhub:update_submissions_submitee_id from pg

BEGIN;

ALTER TABLE teachhub.submissions

-- Droppear la columna tambien dropea
-- las constraints asociadas.
DROP COLUMN submitee_id,
ADD COLUMN user_id INTEGER REFERENCES teachhub.users(id);

DROP TRIGGER IF EXISTS check_is_group_or_user ON teachhub.submissions;
DROP FUNCTION IF EXISTS check_submitee_is_user_or_group;

COMMIT;
