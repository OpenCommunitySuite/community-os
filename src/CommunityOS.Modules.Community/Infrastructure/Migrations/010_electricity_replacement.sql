BEGIN;

ALTER TABLE community_electricity.installation
    DROP CONSTRAINT installation_community_id_point_id_key,
    ADD COLUMN ends_before date CHECK (ends_before > starts_on),
    ADD UNIQUE (community_id, point_id, id);

CREATE UNIQUE INDEX electricity_one_open_installation
    ON community_electricity.installation (community_id, point_id)
    WHERE ends_before IS NULL;

CREATE TABLE community_electricity.replacement (
    community_id uuid NOT NULL,
    request_id uuid NOT NULL,
    point_id uuid NOT NULL,
    old_installation_id uuid NOT NULL,
    new_installation_id uuid NOT NULL,
    effective_on date NOT NULL,
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, request_id),
    UNIQUE (community_id, old_installation_id),
    UNIQUE (community_id, new_installation_id),
    FOREIGN KEY (community_id, point_id, old_installation_id)
        REFERENCES community_electricity.installation (community_id, point_id, id),
    FOREIGN KEY (community_id, point_id, new_installation_id)
        REFERENCES community_electricity.installation (community_id, point_id, id),
    CHECK (old_installation_id <> new_installation_id)
);

ALTER TABLE community_electricity.replacement ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_electricity.replacement FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_electricity.replacement
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
