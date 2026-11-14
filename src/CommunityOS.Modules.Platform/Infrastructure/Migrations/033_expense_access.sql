BEGIN;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN expense_recognition_basis text CHECK (btrim(expense_recognition_basis) <> '');
ALTER TABLE platform_provisioning.budget_admission
    ADD COLUMN action text NOT NULL DEFAULT 'register-budget'
        CHECK (action IN ('register-budget', 'recognize-expense'));
COMMIT;
