BEGIN;

ALTER TABLE platform_provisioning.electricity_admission
    ADD COLUMN register_mode text CHECK (register_mode IN ('total', 'dual')),
    ADD COLUMN channel text CHECK (channel IN ('total', 'day', 'night'));

UPDATE platform_provisioning.electricity_admission SET register_mode = 'total' WHERE action = 'setup';
UPDATE platform_provisioning.electricity_admission SET channel = 'total' WHERE action = 'recognize';

ALTER TABLE platform_provisioning.electricity_admission
    ADD CHECK ((action = 'setup') = (register_mode IS NOT NULL)),
    ADD CHECK ((action = 'recognize') = (channel IS NOT NULL));

COMMIT;
