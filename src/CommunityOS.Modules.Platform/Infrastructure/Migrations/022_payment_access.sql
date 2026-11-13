BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN payment_record_basis text CHECK (btrim(payment_record_basis) <> ''),
    ADD COLUMN payment_allocate_basis text CHECK (btrim(payment_allocate_basis) <> '');

CREATE TABLE platform_provisioning.payment_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('record', 'allocate')),
    request_id uuid NOT NULL,
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
