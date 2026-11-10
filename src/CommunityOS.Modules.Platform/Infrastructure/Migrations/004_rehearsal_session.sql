BEGIN;

CREATE TABLE platform_provisioning.rehearsal_session (
    token_digest bytea PRIMARY KEY CHECK (octet_length(token_digest) = 32),
    account_id uuid NOT NULL,
    expires_at timestamptz NOT NULL
);

COMMIT;
