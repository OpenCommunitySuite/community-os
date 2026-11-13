BEGIN;

CREATE TABLE community_billing.member_fee_advance_release (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    advance_id uuid NOT NULL,
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    reason text NOT NULL CHECK (char_length(btrim(reason)) BETWEEN 1 AND 500),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id),
    FOREIGN KEY (community_id,advance_id) REFERENCES community_billing.member_fee_advance (community_id,id)
);

CREATE INDEX member_fee_advance_release_source ON community_billing.member_fee_advance_release (community_id,advance_id);

ALTER TABLE community_billing.member_fee_advance_release ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.member_fee_advance_release FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.member_fee_advance_release
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid)
    WITH CHECK (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);

CREATE VIEW community_billing.member_fee_advance_remainder WITH (security_invoker = true) AS
SELECT a.community_id,a.id,a.amount_uah - coalesce(r.amount,0) AS reserved_uah,
    a.amount_uah - coalesce(u.amount,0) - coalesce(r.amount,0) AS available_uah
FROM community_billing.member_fee_advance a
LEFT JOIN LATERAL (
    SELECT sum(amount_uah) amount FROM community_billing.member_fee_advance_application
    WHERE (community_id,advance_id)=(a.community_id,a.id)
) u ON true
LEFT JOIN LATERAL (
    SELECT sum(amount_uah) amount FROM community_billing.member_fee_advance_release
    WHERE (community_id,advance_id)=(a.community_id,a.id)
) r ON true;

CREATE OR REPLACE VIEW community_billing.payment_remainder WITH (security_invoker = true) AS
SELECT p.community_id,p.id,p.payer_id,coalesce(c.new_amount,p.amount_uah) AS amount_uah,
    coalesce(c.new_amount,p.amount_uah) - coalesce(used.amount_uah,0) - coalesce(reserved.amount_uah,0) AS available_uah
FROM community_billing.payment p
LEFT JOIN LATERAL (
    SELECT new_amount FROM community_billing.payment_correction c
    WHERE (c.community_id,c.payment_id)=(p.community_id,p.id) ORDER BY revision DESC LIMIT 1
) c ON true
LEFT JOIN LATERAL (
    SELECT sum(a.amount_uah) AS amount_uah FROM community_billing.allocation_batch b
    JOIN community_billing.allocation a ON (a.community_id,a.batch_id)=(b.community_id,b.id)
    WHERE (b.community_id,b.payment_id)=(p.community_id,p.id)
) used ON true
LEFT JOIN LATERAL (
    SELECT sum(r.reserved_uah) AS amount_uah FROM community_billing.member_fee_advance a
    JOIN community_billing.member_fee_advance_remainder r USING (community_id,id)
    WHERE (a.community_id,a.payment_id)=(p.community_id,p.id)
) reserved ON true;

COMMIT;
