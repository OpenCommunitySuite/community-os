BEGIN;

CREATE TABLE community_billing.recalculation (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    accrual_id uuid NOT NULL,
    revision bigint GENERATED ALWAYS AS IDENTITY,
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    prior_amount numeric NOT NULL CHECK (prior_amount >= 0),
    new_amount numeric NOT NULL CHECK (new_amount >= 0),
    snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, accrual_id, digest),
    FOREIGN KEY (community_id, accrual_id) REFERENCES community_billing.accrual (community_id, id)
);

CREATE INDEX recalculation_history ON community_billing.recalculation (community_id, accrual_id, revision DESC);
ALTER TABLE community_billing.recalculation ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.recalculation FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.recalculation
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

CREATE VIEW community_billing.effective_obligation WITH (security_invoker = true) AS
SELECT o.community_id, o.id, o.accrual_id, coalesce(r.new_amount, a.amount_uah) AS amount_uah
FROM community_billing.obligation o
JOIN community_billing.accrual a ON (a.community_id, a.id) = (o.community_id, o.accrual_id)
LEFT JOIN LATERAL (
    SELECT new_amount FROM community_billing.recalculation r
    WHERE (r.community_id, r.accrual_id) = (a.community_id, a.id) AND r.prior_amount <> r.new_amount
    ORDER BY r.revision DESC LIMIT 1
) r ON true;

COMMIT;
