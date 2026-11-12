BEGIN;

ALTER TABLE platform_provisioning.register_availability
    ADD COLUMN electricity_enabled boolean NOT NULL DEFAULT false;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_read_electricity boolean NOT NULL DEFAULT false,
    ADD COLUMN can_setup_electricity boolean NOT NULL DEFAULT false,
    ADD COLUMN can_recognize_electricity boolean NOT NULL DEFAULT false,
    ADD COLUMN electricity_setup_basis text CHECK (btrim(electricity_setup_basis) <> ''),
    ADD COLUMN electricity_recognition_basis text CHECK (btrim(electricity_recognition_basis) <> '');

CREATE TABLE platform_provisioning.electricity_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    action text NOT NULL CHECK (action IN ('setup', 'recognize')),
    target_id uuid NOT NULL,
    effective_on date NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
