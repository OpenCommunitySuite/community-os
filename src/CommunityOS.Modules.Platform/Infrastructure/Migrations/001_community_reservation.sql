BEGIN;

CREATE SCHEMA platform_provisioning;

CREATE TABLE platform_provisioning.community_reservation (
    operation_id uuid PRIMARY KEY,
    community_id uuid NOT NULL UNIQUE,
    creator_account_id uuid NOT NULL,
    request_id uuid NOT NULL,
    initial_administrator_account_id uuid NOT NULL,
    display_name text NOT NULL CHECK (btrim(display_name) <> ''),
    reserved_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    UNIQUE (creator_account_id, request_id)
);

COMMIT;
