BEGIN;

CREATE TABLE community_billing.overpayment_recognition (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    obligation_id uuid NOT NULL,
    recalculation_id uuid NOT NULL,
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id),
    FOREIGN KEY (community_id,obligation_id) REFERENCES community_billing.obligation (community_id,id),
    FOREIGN KEY (community_id,recalculation_id) REFERENCES community_billing.recalculation (community_id,id)
);

CREATE INDEX overpayment_by_obligation ON community_billing.overpayment_recognition (community_id,obligation_id);
ALTER TABLE community_billing.overpayment_recognition ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.overpayment_recognition FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.overpayment_recognition
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
