BEGIN;

CREATE TABLE community_register.manual_addition (
    community_id uuid NOT NULL,
    plot_id uuid NOT NULL,
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, plot_id),
    FOREIGN KEY (community_id, plot_id) REFERENCES community_register.plot (community_id, id)
);

ALTER TABLE community_register.manual_addition ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_register.manual_addition FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_register.manual_addition
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
