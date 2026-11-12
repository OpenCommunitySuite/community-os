BEGIN;

ALTER TABLE platform_provisioning.register_operator
    ADD COLUMN topology_publication_basis text CHECK (btrim(topology_publication_basis) <> '');

ALTER TABLE platform_provisioning.electricity_admission
    DROP CONSTRAINT electricity_admission_action_check,
    ADD CHECK (action IN ('setup', 'recognize', 'replace', 'setup-common', 'publish-topology'));

COMMIT;
