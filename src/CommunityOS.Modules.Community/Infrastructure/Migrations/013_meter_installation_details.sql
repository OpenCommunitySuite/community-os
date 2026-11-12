BEGIN;

ALTER TABLE community_electricity.meter
    ADD COLUMN model text CHECK (char_length(btrim(model)) BETWEEN 1 AND 128),
    ADD COLUMN serial_number text CHECK (char_length(btrim(serial_number)) BETWEEN 1 AND 128);

ALTER TABLE community_electricity.installation
    ADD COLUMN location text CHECK (char_length(btrim(location)) BETWEEN 1 AND 500),
    ADD COLUMN mounted_on date CHECK (mounted_on <= starts_on),
    ADD COLUMN seal_serial_number text CHECK (char_length(btrim(seal_serial_number)) BETWEEN 1 AND 128),
    ADD COLUMN reading_multiplier numeric NOT NULL DEFAULT 1
        CHECK (reading_multiplier > 0 AND reading_multiplier <= 1000000
            AND reading_multiplier = round(reading_multiplier, 6));

COMMIT;
