BEGIN;

CREATE TABLE platform_provisioning.platform_account (
    id uuid PRIMARY KEY,
    login text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    can_create_community boolean NOT NULL,
    disabled_at timestamptz
);

CREATE TABLE platform_provisioning.platform_session (
    token_digest bytea PRIMARY KEY CHECK (octet_length(token_digest) = 32),
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    expires_at timestamptz NOT NULL,
    revoked_at timestamptz
);

CREATE INDEX platform_session_expiry ON platform_provisioning.platform_session (expires_at);

CREATE TABLE platform_provisioning.platform_auth_security_event (
    id uuid PRIMARY KEY DEFAULT uuidv7(),
    event_kind text NOT NULL CHECK (event_kind IN ('login-denied', 'session-started', 'session-revoked', 'bootstrap-audit-read')),
    account_id uuid REFERENCES platform_provisioning.platform_account (id),
    community_id uuid,
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

COMMIT;
