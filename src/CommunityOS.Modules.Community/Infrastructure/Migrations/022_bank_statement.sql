BEGIN;

CREATE TABLE community_billing.bank_account (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    name text NOT NULL CHECK (btrim(name) <> ''),
    source text NOT NULL CHECK (btrim(source) <> ''),
    PRIMARY KEY (community_id,id)
);

CREATE TABLE community_billing.bank_transaction (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    bank_account_id uuid NOT NULL,
    source text NOT NULL,
    external_id text NOT NULL,
    booked_on date NOT NULL,
    direction text NOT NULL CHECK (direction IN ('incoming','outgoing')),
    amount_uah numeric NOT NULL CHECK (amount_uah > 0 AND amount_uah = round(amount_uah, 2)),
    currency text NOT NULL CHECK (currency = 'UAH'),
    raw_line text NOT NULL,
    line_number integer NOT NULL CHECK (line_number >= 2),
    file_digest text NOT NULL,
    admission_id uuid NOT NULL,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id),
    CONSTRAINT bank_transaction_identity UNIQUE (community_id,bank_account_id,source,external_id),
    FOREIGN KEY (community_id,bank_account_id) REFERENCES community_billing.bank_account (community_id,id)
);

CREATE TABLE community_billing.bank_payment (
    community_id uuid NOT NULL,
    bank_transaction_id uuid NOT NULL,
    payment_id uuid NOT NULL,
    PRIMARY KEY (community_id,bank_transaction_id),
    UNIQUE (community_id,payment_id),
    FOREIGN KEY (community_id,bank_transaction_id) REFERENCES community_billing.bank_transaction (community_id,id),
    FOREIGN KEY (community_id,payment_id) REFERENCES community_billing.payment (community_id,id)
);

DO $$
DECLARE relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['bank_account','bank_transaction','bank_payment'] LOOP
        EXECUTE format('ALTER TABLE community_billing.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_billing.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format('CREATE POLICY community_scope ON community_billing.%I
            USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)
            WITH CHECK (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)', relation);
    END LOOP;
END $$;

COMMIT;
