BEGIN;
CREATE TABLE community_water.meter_verification (
    community_id uuid NOT NULL,
    meter_id uuid NOT NULL,
    verified_on date NOT NULL,
    due_on date NOT NULL CHECK (due_on > verified_on),
    evidence text NOT NULL CHECK (char_length(btrim(evidence)) BETWEEN 1 AND 500),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, meter_id, verified_on),
    FOREIGN KEY (community_id, meter_id) REFERENCES community_water.meter
);
ALTER TABLE community_water.meter_verification ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_water.meter_verification FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_water.meter_verification
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);
COMMIT;
