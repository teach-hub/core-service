-- Revert teachhub:add_group_id_reviewers from pg

BEGIN;

ALTER TABLE teachhub.reviewers

-- Droppear la columna tambien dropea
-- las constraints asociadas.
DROP COLUMN reviewee_id,
ADD COLUMN reviewee_user_id INTEGER REFERENCES teachhub.users(id) NOT NULL;


DROP INDEX teachhub.assignment_idx;

COMMIT;
