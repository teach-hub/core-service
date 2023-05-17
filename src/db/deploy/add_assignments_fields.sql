-- Deploy teachhub:add_assignments_fields to pg

BEGIN;

ALTER TABLE teachhub.assignments ADD COLUMN allow_late_submissions BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE teachhub.assignments ADD COLUMN description TEXT DEFAULT NULL;
ALTER TABLE teachhub.assignments ADD COLUMN active BOOLEAN DEFAULT TRUE NOT NULL;

COMMIT;
