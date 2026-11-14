BEGIN;

ALTER TABLE community_water.installation
    ADD COLUMN ends_before date CHECK (ends_before > starts_on),
    DROP CONSTRAINT installation_community_id_point_id_key,
    ADD UNIQUE (community_id, point_id, starts_on);

CREATE UNIQUE INDEX water_one_open_installation
    ON community_water.installation (community_id, point_id)
    WHERE ends_before IS NULL;

CREATE TABLE community_water.replacement (
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
    FOREIGN KEY (community_id, point_id) REFERENCES community_water.accounting_point,
    FOREIGN KEY (community_id, old_installation_id) REFERENCES community_water.installation,
    FOREIGN KEY (community_id, new_installation_id) REFERENCES community_water.installation
);

ALTER TABLE community_water.replacement ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_water.replacement FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_water.replacement
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
