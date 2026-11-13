BEGIN;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN advance_basis text CHECK (btrim(advance_basis) <> '');
ALTER TABLE platform_provisioning.payment_admission
    DROP CONSTRAINT payment_admission_action_check,
    ADD CHECK (action IN ('record','allocate','accept-cash','import-bank','recognize-bank','reallocate','correct',
        'recognize-overpayment','member-fee-advance'));
COMMIT;
