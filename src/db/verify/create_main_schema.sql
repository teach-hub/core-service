-- Verify teachhub:create_main_schema on pg

SELECT 1/COUNT(*) FROM information_schema.schemata WHERE schema_name = 'teachhub';
