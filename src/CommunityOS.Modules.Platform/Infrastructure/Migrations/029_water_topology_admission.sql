BEGIN;
ALTER TABLE platform_provisioning.water_admission
    DROP CONSTRAINT water_admission_action_check,
    ADD CHECK (action IN ('setup', 'recognize', 'publish-topology'));
COMMIT;
