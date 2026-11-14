BEGIN;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN expense_allocation_basis text CHECK (btrim(expense_allocation_basis) <> '');
ALTER TABLE platform_provisioning.budget_admission
    DROP CONSTRAINT budget_admission_action_check,
    ADD CONSTRAINT budget_admission_action_check
        CHECK (action IN ('register-budget', 'recognize-expense', 'allocate-expense'));
COMMIT;
