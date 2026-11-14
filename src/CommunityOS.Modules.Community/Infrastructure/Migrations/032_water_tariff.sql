BEGIN;
CREATE TABLE community_billing.water_tariff (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    applicable_from date NOT NULL,
    applicable_until date,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    rate_uah numeric NOT NULL CHECK (rate_uah BETWEEN 0 AND 999999 AND rate_uah = round(rate_uah, 6)),
    PRIMARY KEY (community_id, id),
    CHECK (applicable_until IS NULL OR applicable_from < applicable_until)
);
ALTER TABLE community_billing.water_tariff ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_billing.water_tariff FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_billing.water_tariff
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);
COMMIT;
