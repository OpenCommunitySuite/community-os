BEGIN;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN payment_correct_basis text CHECK (btrim(payment_correct_basis) <> '');
ALTER TABLE platform_provisioning.payment_admission
    DROP CONSTRAINT payment_admission_action_check,
    ADD CHECK (action IN ('record','allocate','accept-cash','import-bank','recognize-bank','reallocate','correct'));
COMMIT;
