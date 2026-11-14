BEGIN;
ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN water_replacement_basis text CHECK (btrim(water_replacement_basis) <> '');
ALTER TABLE platform_provisioning.water_admission
    DROP CONSTRAINT water_admission_action_check,
    ADD COLUMN request_id uuid,
    ADD CHECK (action IN ('setup', 'recognize', 'publish-topology', 'replace')),
    ADD CHECK ((action = 'replace') = (request_id IS NOT NULL));
COMMIT;
