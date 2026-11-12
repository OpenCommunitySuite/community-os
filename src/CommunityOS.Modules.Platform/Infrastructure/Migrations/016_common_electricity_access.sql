BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN can_setup_common_electricity boolean NOT NULL DEFAULT false,
    ADD COLUMN common_electricity_setup_basis text CHECK (btrim(common_electricity_setup_basis) <> '');

ALTER TABLE platform_provisioning.electricity_admission
    DROP CONSTRAINT electricity_admission_action_check,
    ADD CHECK (action IN ('setup', 'recognize', 'replace', 'setup-common'));

ALTER TABLE platform_provisioning.electricity_admission
    DROP CONSTRAINT electricity_admission_check1,
    ADD CONSTRAINT electricity_admission_setup_mode_check
        CHECK ((action IN ('setup', 'setup-common')) = (register_mode IS NOT NULL));

COMMIT;
