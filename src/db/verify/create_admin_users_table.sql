-- Verify teachhub:create_admin_users_table on pg

BEGIN;

SELECT
  id, email, password, name, last_name
FROM teachhub.admin_users
WHERE false;

ROLLBACK;
