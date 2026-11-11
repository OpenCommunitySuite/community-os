BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_prepare_import boolean NOT NULL DEFAULT false;

CREATE TABLE platform_provisioning.register_import_draft_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
