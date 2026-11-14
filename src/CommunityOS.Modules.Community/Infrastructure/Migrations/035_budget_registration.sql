BEGIN;
CREATE TABLE community_billing.budget (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    starts_on date NOT NULL,
    ends_on date NOT NULL CHECK (ends_on >= starts_on),
    title text NOT NULL CHECK (btrim(title) <> ''),
    evidence text NOT NULL CHECK (btrim(evidence) <> ''),
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id,id)
);
CREATE TABLE community_billing.budget_item (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    budget_id uuid NOT NULL,
    designation text NOT NULL CHECK (btrim(designation) <> ''),
    amount numeric NOT NULL CHECK (amount >= 0 AND amount = round(amount,2)),
    PRIMARY KEY (community_id,id),
    UNIQUE (community_id,budget_id,designation),
    FOREIGN KEY (community_id,budget_id) REFERENCES community_billing.budget
);
DO $$
DECLARE relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['budget', 'budget_item'] LOOP
        EXECUTE format('ALTER TABLE community_billing.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_billing.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format('CREATE POLICY community_scope ON community_billing.%I
            USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)', relation);
    END LOOP;
END $$;
COMMIT;
