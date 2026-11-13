BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN bank_import_basis text CHECK (btrim(bank_import_basis) <> ''),
    ADD COLUMN bank_recognition_basis text CHECK (btrim(bank_recognition_basis) <> '');

ALTER TABLE platform_provisioning.payment_admission
    DROP CONSTRAINT payment_admission_action_check,
    ADD CHECK (action IN ('record', 'allocate', 'accept-cash', 'import-bank', 'recognize-bank'));

COMMIT;
