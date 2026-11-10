BEGIN;

CREATE TABLE platform_provisioning.bootstrap_security_event (
    operation_id uuid NOT NULL REFERENCES platform_provisioning.bootstrap_administrator (operation_id),
    event_kind text NOT NULL CHECK (event_kind IN ('granted', 'revoked')),
    community_id uuid NOT NULL,
    administrator_account_id uuid NOT NULL,
    initiating_account_id uuid NOT NULL,
    recorded_at timestamptz NOT NULL,
    PRIMARY KEY (operation_id, event_kind)
);

COMMIT;
