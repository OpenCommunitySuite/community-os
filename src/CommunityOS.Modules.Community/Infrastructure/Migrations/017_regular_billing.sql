BEGIN;

CREATE SCHEMA community_billing;

CREATE TABLE community_billing.tariff (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    applicable_from date NOT NULL,
    applicable_until date,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    rates jsonb NOT NULL CHECK (jsonb_typeof(rates) = 'object'),
    PRIMARY KEY (community_id, id),
    CHECK (applicable_until IS NULL OR applicable_from < applicable_until)
);

CREATE TABLE community_billing.member_fee (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    applicable_from date NOT NULL,
    applicable_until date,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    amount_uah numeric NOT NULL CHECK (amount_uah >= 0 AND amount_uah = round(amount_uah, 2)),
    PRIMARY KEY (community_id, id),
    CHECK (applicable_until IS NULL OR applicable_from < applicable_until)
);

CREATE TABLE community_billing.posted_period (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL,
    calculated_on date NOT NULL,
    due_on date NOT NULL,
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    snapshot jsonb NOT NULL CHECK (jsonb_typeof(snapshot) = 'object'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    posted_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, starts_on, ends_on),
    CHECK (starts_on < ends_on AND ends_on <= calculated_on AND calculated_on <= due_on)
);

CREATE TABLE community_billing.accrual (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    period_id uuid NOT NULL,
    personal_account_id uuid NOT NULL,
    debtor_id uuid NOT NULL,
    kind text NOT NULL CHECK (kind IN ('electricity', 'member-fee')),
    amount_uah numeric NOT NULL CHECK (amount_uah >= 0 AND amount_uah = round(amount_uah, 2)),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, period_id, personal_account_id, kind),
    FOREIGN KEY (community_id, period_id) REFERENCES community_billing.posted_period (community_id, id),
    FOREIGN KEY (community_id, personal_account_id) REFERENCES community_register.personal_account (community_id, id),
    FOREIGN KEY (community_id, debtor_id) REFERENCES community_register.subject (community_id, id)
);

CREATE TABLE community_billing.obligation (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    accrual_id uuid NOT NULL,
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, accrual_id),
    FOREIGN KEY (community_id, accrual_id) REFERENCES community_billing.accrual (community_id, id)
);

DO $$
DECLARE relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['tariff', 'member_fee', 'posted_period', 'accrual', 'obligation'] LOOP
        EXECUTE format('ALTER TABLE community_billing.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_billing.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format('CREATE POLICY community_scope ON community_billing.%I
            USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)
            WITH CHECK (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)', relation);
    END LOOP;
END $$;

COMMIT;
