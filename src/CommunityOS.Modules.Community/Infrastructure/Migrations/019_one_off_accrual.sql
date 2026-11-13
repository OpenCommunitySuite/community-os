BEGIN;

CREATE TABLE community_billing.one_off_batch (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    posted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id)
);

ALTER TABLE community_billing.one_off_batch ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.one_off_batch FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.one_off_batch
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

ALTER TABLE community_billing.accrual
    ALTER COLUMN period_id DROP NOT NULL,
    DROP CONSTRAINT accrual_kind_check,
    ADD COLUMN one_off_id uuid,
    ADD FOREIGN KEY (community_id, one_off_id) REFERENCES community_billing.one_off_batch (community_id,id),
    ADD UNIQUE (community_id, one_off_id, personal_account_id),
    ADD CHECK ((kind IN ('electricity','member-fee') AND period_id IS NOT NULL AND one_off_id IS NULL)
        OR (kind='one-off' AND period_id IS NULL AND one_off_id IS NOT NULL));

COMMIT;
