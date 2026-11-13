BEGIN;

CREATE TABLE community_billing.reallocation (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    payment_id uuid NOT NULL,
    source_batch_id uuid NOT NULL,
    source_is_transfer boolean NOT NULL,
    source_obligation_id uuid NOT NULL,
    target_obligation_id uuid NOT NULL,
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id),
    CHECK (source_obligation_id <> target_obligation_id),
    FOREIGN KEY (community_id,payment_id) REFERENCES community_billing.payment (community_id,id),
    FOREIGN KEY (community_id,source_obligation_id) REFERENCES community_billing.obligation (community_id,id),
    FOREIGN KEY (community_id,target_obligation_id) REFERENCES community_billing.obligation (community_id,id)
);

ALTER TABLE community_billing.reallocation ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.reallocation FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.reallocation
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

CREATE INDEX reallocation_source ON community_billing.reallocation (community_id, payment_id, source_batch_id, source_obligation_id);

CREATE VIEW community_billing.effective_allocation WITH (security_invoker = true) AS
SELECT entry.community_id, entry.payment_id, entry.batch_id, entry.obligation_id,
    entry.amount_uah - coalesce(moved.amount_uah, 0) AS amount_uah, entry.is_transfer
FROM (
    SELECT a.community_id,b.payment_id,a.batch_id,a.obligation_id,a.amount_uah,false AS is_transfer
    FROM community_billing.allocation a
    JOIN community_billing.allocation_batch b ON (b.community_id,b.id)=(a.community_id,a.batch_id)
    UNION ALL
    SELECT community_id,payment_id,id,target_obligation_id,amount_uah,true FROM community_billing.reallocation
) entry
LEFT JOIN LATERAL (
    SELECT sum(r.amount_uah) AS amount_uah FROM community_billing.reallocation r
    WHERE (r.community_id,r.payment_id,r.source_batch_id,r.source_obligation_id) =
        (entry.community_id,entry.payment_id,entry.batch_id,entry.obligation_id)
        AND r.source_is_transfer=entry.is_transfer
) moved ON true;

CREATE OR REPLACE VIEW community_billing.obligation_remainder WITH (security_invoker = true) AS
SELECT o.community_id,o.id,o.accrual_id,o.amount_uah,
    o.amount_uah - coalesce(used.amount_uah,0) AS outstanding_uah
FROM community_billing.effective_obligation o
LEFT JOIN LATERAL (
    SELECT sum(a.amount_uah) AS amount_uah FROM community_billing.effective_allocation a
    WHERE (a.community_id,a.obligation_id)=(o.community_id,o.id)
) used ON true;

COMMIT;
