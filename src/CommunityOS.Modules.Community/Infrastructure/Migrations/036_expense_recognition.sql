BEGIN;
CREATE TABLE community_billing.expense (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    incurred_on date NOT NULL,
    purpose text NOT NULL CHECK (btrim(purpose) <> ''),
    amount numeric NOT NULL CHECK (amount > 0 AND amount <= 999999999 AND amount = round(amount, 2)),
    evidence text NOT NULL CHECK (btrim(evidence) <> ''),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id)
);
ALTER TABLE community_billing.expense ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.expense FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.expense
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);
COMMIT;
