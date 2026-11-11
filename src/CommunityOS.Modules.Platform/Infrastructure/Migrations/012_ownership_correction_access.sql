BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_correct_ownership boolean NOT NULL DEFAULT false,
    ADD COLUMN ownership_correction_basis text CHECK (btrim(ownership_correction_basis) <> '');

CREATE TABLE platform_provisioning.ownership_correction_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    plot_id uuid NOT NULL,
    previous_revision uuid NOT NULL,
    owner_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
