BEGIN;

ALTER TABLE platform_provisioning.register_availability ADD COLUMN billing_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_read_billing boolean NOT NULL DEFAULT false,
    ADD COLUMN billing_post_basis text CHECK (btrim(billing_post_basis) <> '');

CREATE TABLE platform_provisioning.billing_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL CHECK (ends_on > starts_on),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
