BEGIN;

ALTER TABLE community_billing.bank_account ADD COLUMN iban text CHECK (iban ~ '^UA[0-9]{27}$');
ALTER TABLE community_billing.bank_transaction ADD COLUMN source_format text NOT NULL DEFAULT 'csv'
    CHECK (source_format IN ('csv', 'p24-dbf'));

COMMIT;
