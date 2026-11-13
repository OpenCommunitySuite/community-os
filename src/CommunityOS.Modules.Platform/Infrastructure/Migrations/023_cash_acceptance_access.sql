BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN cash_acceptance_basis text CHECK (btrim(cash_acceptance_basis) <> '');

ALTER TABLE platform_provisioning.payment_admission
    DROP CONSTRAINT payment_admission_action_check,
    ADD CHECK (action IN ('record', 'allocate', 'accept-cash'));

COMMIT;
