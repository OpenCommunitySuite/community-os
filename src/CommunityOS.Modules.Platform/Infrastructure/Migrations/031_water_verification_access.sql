BEGIN;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN water_verification_basis text CHECK (btrim(water_verification_basis) <> '');
ALTER TABLE platform_provisioning.water_admission
    DROP CONSTRAINT water_admission_action_check,
    ADD CHECK (action IN ('setup', 'recognize', 'publish-topology', 'replace', 'verify-meter'));
COMMIT;
