-- Revert teachhub:add_reviewee_id_reviewers from pg

BEGIN;

ALTER TABLE teachhub.reviewers

-- Droppear la columna tambien dropea
-- las constraints asociadas.
DROP COLUMN reviewee_id,
ADD COLUMN reviewee_user_id INTEGER REFERENCES teachhub.users(id),
ADD COLUMN reviewee_group_id INTEGER REFERENCES teachhub.groups(id);

COMMIT;
