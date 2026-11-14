BEGIN;
ALTER TABLE community_billing.accrual
    DROP CONSTRAINT accrual_check,
    ADD CONSTRAINT accrual_kind_period_check CHECK (
        (kind IN ('electricity','member-fee','water') AND period_id IS NOT NULL AND one_off_id IS NULL)
        OR (kind='one-off' AND period_id IS NULL AND one_off_id IS NOT NULL));
COMMIT;
