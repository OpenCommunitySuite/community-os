BEGIN;

CREATE TABLE community_billing.payment (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    payer_id uuid NOT NULL,
    received_on date NOT NULL,
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id),
    FOREIGN KEY (community_id, payer_id) REFERENCES community_register.subject (community_id, id)
);

CREATE TABLE community_billing.allocation_batch (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    payment_id uuid NOT NULL,
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id),
    FOREIGN KEY (community_id, payment_id) REFERENCES community_billing.payment (community_id, id)
);

CREATE TABLE community_billing.allocation (
    community_id uuid NOT NULL,
    batch_id uuid NOT NULL,
    obligation_id uuid NOT NULL,
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    PRIMARY KEY (community_id, batch_id, obligation_id),
    FOREIGN KEY (community_id, batch_id) REFERENCES community_billing.allocation_batch (community_id, id),
    FOREIGN KEY (community_id, obligation_id) REFERENCES community_billing.obligation (community_id, id)
);

CREATE INDEX allocation_by_obligation ON community_billing.allocation (community_id, obligation_id);
CREATE INDEX allocation_by_payment ON community_billing.allocation_batch (community_id, payment_id);

CREATE VIEW community_billing.payment_remainder WITH (security_invoker = true) AS
SELECT p.community_id, p.id, p.payer_id, p.amount_uah,
    p.amount_uah - coalesce(used.amount_uah, 0) AS available_uah
FROM community_billing.payment p
LEFT JOIN LATERAL (
    SELECT sum(a.amount_uah) AS amount_uah
    FROM community_billing.allocation_batch b
    JOIN community_billing.allocation a ON (a.community_id, a.batch_id) = (b.community_id, b.id)
    WHERE (b.community_id, b.payment_id) = (p.community_id, p.id)
) used ON true;

CREATE VIEW community_billing.obligation_remainder WITH (security_invoker = true) AS
SELECT o.community_id, o.id, o.accrual_id, o.amount_uah,
    o.amount_uah - coalesce(used.amount_uah, 0) AS outstanding_uah
FROM community_billing.effective_obligation o
LEFT JOIN LATERAL (
    SELECT sum(a.amount_uah) AS amount_uah
    FROM community_billing.allocation a
    WHERE (a.community_id, a.obligation_id) = (o.community_id, o.id)
) used ON true;

DO $$
DECLARE relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['payment', 'allocation_batch', 'allocation'] LOOP
        EXECUTE format('ALTER TABLE community_billing.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_billing.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format('CREATE POLICY community_scope ON community_billing.%I
            USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)
            WITH CHECK (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)', relation);
    END LOOP;
END $$;

COMMIT;
