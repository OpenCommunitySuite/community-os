BEGIN;

ALTER TABLE community_electricity.meter
    ADD COLUMN register_mode text NOT NULL DEFAULT 'total' CHECK (register_mode IN ('total', 'dual'));

ALTER TABLE community_electricity.reading
    ADD COLUMN channel text NOT NULL DEFAULT 'total' CHECK (channel IN ('total', 'day', 'night')),
    DROP CONSTRAINT reading_community_id_installation_id_measured_on_key,
    ADD UNIQUE (community_id, installation_id, channel, measured_on);

COMMIT;
