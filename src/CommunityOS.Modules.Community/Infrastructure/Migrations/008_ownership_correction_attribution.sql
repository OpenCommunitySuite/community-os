BEGIN;

CREATE TABLE community_register.ownership_correction_event (
    community_id uuid NOT NULL,
    admission_id uuid NOT NULL,
    plot_id uuid NOT NULL,
    previous_revision uuid NOT NULL,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    outcome text NOT NULL CHECK (outcome IN ('corrected', 'stale', 'invalid-owner', 'unchanged')),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, admission_id)
);

CREATE UNIQUE INDEX ownership_correction_success
    ON community_register.ownership_correction_event (community_id, plot_id, previous_revision)
    WHERE outcome = 'corrected';

ALTER TABLE community_register.ownership_correction_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_register.ownership_correction_event FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_register.ownership_correction_event
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
