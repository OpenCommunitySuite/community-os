BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_approve_import boolean NOT NULL DEFAULT false,
    ADD COLUMN import_approval_basis text CHECK (btrim(import_approval_basis) <> '');

CREATE TABLE platform_provisioning.register_import_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    draft_id uuid NOT NULL,
    revision integer NOT NULL CHECK (revision > 0),
    plan_id text NOT NULL CHECK (plan_id ~ '^[0-9A-F]{64}$'),
    action text NOT NULL CHECK (action IN ('submit', 'approve')),
    basis text CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    CHECK ((action = 'approve') = (basis IS NOT NULL))
);

COMMIT;
