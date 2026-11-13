BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN billing_recalculate_basis text CHECK (btrim(billing_recalculate_basis) <> '');

CREATE TABLE platform_provisioning.recalculation_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    accrual_id uuid NOT NULL,
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
