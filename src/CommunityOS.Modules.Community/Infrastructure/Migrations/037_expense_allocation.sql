BEGIN;
CREATE TABLE community_billing.expense_distribution (
    community_id uuid NOT NULL,
    expense_id uuid NOT NULL,
    id uuid NOT NULL,
    previous_id uuid,
    digest text NOT NULL CHECK (digest ~ '^[0-9A-F]{64}$'),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, expense_id, id),
    CONSTRAINT expense_distribution_revision UNIQUE NULLS NOT DISTINCT (community_id, expense_id, previous_id),
    FOREIGN KEY (community_id, expense_id) REFERENCES community_billing.expense,
    FOREIGN KEY (community_id, expense_id, previous_id)
        REFERENCES community_billing.expense_distribution (community_id, expense_id, id),
    CHECK (previous_id IS DISTINCT FROM id)
);
CREATE TABLE community_billing.expense_distribution_part (
    community_id uuid NOT NULL,
    distribution_id uuid NOT NULL,
    budget_item_id uuid NOT NULL,
    amount numeric NOT NULL CHECK (amount > 0 AND amount <= 999999999 AND amount = round(amount, 2)),
    PRIMARY KEY (community_id, distribution_id, budget_item_id),
    FOREIGN KEY (community_id, distribution_id) REFERENCES community_billing.expense_distribution,
    FOREIGN KEY (community_id, budget_item_id) REFERENCES community_billing.budget_item
);
DO $$
DECLARE relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['expense_distribution', 'expense_distribution_part'] LOOP
        EXECUTE format('ALTER TABLE community_billing.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_billing.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format('CREATE POLICY community_scope ON community_billing.%I
            USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)', relation);
    END LOOP;
END $$;
COMMIT;
