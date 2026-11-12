BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_replace_electricity boolean NOT NULL DEFAULT false,
    ADD COLUMN electricity_replacement_basis text CHECK (btrim(electricity_replacement_basis) <> '');

ALTER TABLE platform_provisioning.electricity_admission
    DROP CONSTRAINT electricity_admission_action_check,
    ADD COLUMN request_id uuid,
    ADD CHECK (action IN ('setup', 'recognize', 'replace')),
    ADD CHECK ((action = 'replace') = (request_id IS NOT NULL));

COMMIT;
