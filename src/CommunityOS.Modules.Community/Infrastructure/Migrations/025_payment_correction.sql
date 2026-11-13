BEGIN;

CREATE TABLE community_billing.payment_correction (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    payment_id uuid NOT NULL,
    revision bigint GENERATED ALWAYS AS IDENTITY,
    prior_amount numeric NOT NULL CHECK (prior_amount > 0),
    new_amount numeric NOT NULL CHECK (new_amount > 0 AND new_amount = round(new_amount, 2) AND new_amount <> prior_amount),
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id),
    FOREIGN KEY (community_id,payment_id) REFERENCES community_billing.payment (community_id,id)
);

CREATE INDEX payment_correction_history ON community_billing.payment_correction (community_id,payment_id,revision DESC);
ALTER TABLE community_billing.payment_correction ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.payment_correction FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.payment_correction
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

CREATE OR REPLACE VIEW community_billing.payment_remainder WITH (security_invoker = true) AS
SELECT p.community_id,p.id,p.payer_id,coalesce(c.new_amount,p.amount_uah) AS amount_uah,
    coalesce(c.new_amount,p.amount_uah) - coalesce(used.amount_uah,0) AS available_uah
FROM community_billing.payment p
LEFT JOIN LATERAL (
    SELECT new_amount FROM community_billing.payment_correction c
    WHERE (c.community_id,c.payment_id)=(p.community_id,p.id)
    ORDER BY revision DESC LIMIT 1
) c ON true
LEFT JOIN LATERAL (
    SELECT sum(a.amount_uah) AS amount_uah FROM community_billing.allocation_batch b
    JOIN community_billing.allocation a ON (a.community_id,a.batch_id)=(b.community_id,b.id)
    WHERE (b.community_id,b.payment_id)=(p.community_id,p.id)
) used ON true;

COMMIT;
