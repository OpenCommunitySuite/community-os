BEGIN;

ALTER TABLE community_electricity.accounting_point
    ALTER COLUMN plot_id DROP NOT NULL,
    ADD COLUMN common_designation text,
    ADD COLUMN measurement_boundary text,
    ADD CHECK (
        (plot_id IS NOT NULL AND common_designation IS NULL AND measurement_boundary IS NULL)
        OR
        (plot_id IS NULL AND common_designation IS NOT NULL AND measurement_boundary IS NOT NULL
            AND char_length(btrim(common_designation)) BETWEEN 1 AND 128
            AND char_length(btrim(measurement_boundary)) BETWEEN 1 AND 500)
    );

CREATE UNIQUE INDEX common_electricity_designation
    ON community_electricity.accounting_point (community_id, lower(common_designation))
    WHERE plot_id IS NULL;

COMMIT;
