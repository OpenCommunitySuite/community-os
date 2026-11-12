BEGIN;

ALTER TABLE community_electricity.reading
    DROP CONSTRAINT reading_source_check,
    ADD CHECK (source IN ('manual-observation', 'csv-import'));

COMMIT;
