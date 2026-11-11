BEGIN;

CREATE TABLE community_register.import_submission (
    community_id uuid NOT NULL,
    draft_id uuid NOT NULL,
    revision integer NOT NULL CHECK (revision > 0),
    plan_id text NOT NULL CHECK (plan_id ~ '^[0-9A-F]{64}$'),
    submit_admission_id uuid NOT NULL UNIQUE,
    prepared_by_account uuid NOT NULL,
    prepared_by_subject uuid NOT NULL,
    submitted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    applied_plan_id text,
    PRIMARY KEY (community_id, draft_id, revision),
    FOREIGN KEY (community_id, draft_id) REFERENCES community_register.import_draft (community_id, id),
    FOREIGN KEY (community_id, applied_plan_id) REFERENCES community_register.register_import (community_id, plan_id),
    UNIQUE (community_id, applied_plan_id),
    CHECK (applied_plan_id IS NULL OR applied_plan_id = plan_id)
);

CREATE TABLE community_register.import_approval_event (
    community_id uuid NOT NULL,
    admission_id uuid NOT NULL,
    draft_id uuid NOT NULL,
    revision integer NOT NULL,
    approved_by_account uuid NOT NULL,
    approved_by_subject uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    outcome text NOT NULL CHECK (outcome IN ('applied', 'replayed', 'conflict', 'stale', 'plan-already-applied')),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, admission_id),
    FOREIGN KEY (community_id, draft_id, revision)
        REFERENCES community_register.import_submission (community_id, draft_id, revision)
);

ALTER TABLE community_register.import_submission ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_register.import_submission FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_register.import_submission
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

ALTER TABLE community_register.import_approval_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_register.import_approval_event FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_register.import_approval_event
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
