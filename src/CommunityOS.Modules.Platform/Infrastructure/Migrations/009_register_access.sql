BEGIN;

CREATE TABLE platform_provisioning.register_availability (
    community_id uuid PRIMARY KEY REFERENCES platform_provisioning.community_reservation (community_id),
    community_active boolean NOT NULL DEFAULT false,
    register_enabled boolean NOT NULL DEFAULT false,
    lock_marker boolean
);

CREATE TABLE platform_provisioning.register_operator (
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    linked boolean NOT NULL DEFAULT false,
    can_read boolean NOT NULL DEFAULT false,
    can_add boolean NOT NULL DEFAULT false,
    addition_basis text CHECK (btrim(addition_basis) <> ''),
    lock_marker boolean,
    PRIMARY KEY (community_id, account_id)
);

CREATE TABLE platform_provisioning.register_addition_admission (
    id uuid PRIMARY KEY,
    community_id uuid NOT NULL REFERENCES platform_provisioning.register_availability (community_id),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
