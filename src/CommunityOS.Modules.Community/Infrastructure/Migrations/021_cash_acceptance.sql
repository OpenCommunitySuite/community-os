BEGIN;

CREATE TABLE community_billing.cash_acceptance (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    payment_id uuid NOT NULL,
    payer_id uuid NOT NULL,
    accepted_on date NOT NULL,
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    reason text NOT NULL CHECK (btrim(reason) <> ''),
    cashier_account_id uuid NOT NULL,
    cashier_subject_id uuid NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, payment_id),
    FOREIGN KEY (community_id, payment_id) REFERENCES community_billing.payment (community_id, id),
    FOREIGN KEY (community_id, payer_id) REFERENCES community_register.subject (community_id, id)
);

ALTER TABLE community_billing.cash_acceptance ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.cash_acceptance FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.cash_acceptance
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

COMMIT;
