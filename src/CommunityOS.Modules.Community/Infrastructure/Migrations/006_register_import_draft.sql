BEGIN;

CREATE TABLE community_register.import_draft (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    operator_account_id uuid NOT NULL,
    operator_subject_id uuid NOT NULL,
    source_sha256 bytea NOT NULL CHECK (octet_length(source_sha256) = 32),
    source_rows jsonb NOT NULL CHECK (jsonb_typeof(source_rows) = 'array'),
    decisions jsonb NOT NULL DEFAULT '[]' CHECK (jsonb_typeof(decisions) = 'array'),
    revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
    updated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id)
);

CREATE INDEX import_draft_operator ON community_register.import_draft
    (community_id, operator_account_id, operator_subject_id, updated_at DESC, id);

ALTER TABLE community_register.import_draft ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_register.import_draft FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_register.import_draft
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
