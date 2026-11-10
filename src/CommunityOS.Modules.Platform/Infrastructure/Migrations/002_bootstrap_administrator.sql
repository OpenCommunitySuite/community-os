BEGIN;

CREATE TABLE platform_provisioning.bootstrap_administrator (
    operation_id uuid PRIMARY KEY REFERENCES platform_provisioning.community_reservation (operation_id),
    granted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    revoked_at timestamptz,
    revoked_by_account_id uuid,
    CHECK ((revoked_at IS NULL) = (revoked_by_account_id IS NULL))
);

COMMIT;
