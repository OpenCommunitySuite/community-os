BEGIN;

CREATE SCHEMA community_water;

CREATE TABLE community_water.accounting_point (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    plot_id uuid,
    designation text NOT NULL CHECK (char_length(btrim(designation)) BETWEEN 1 AND 128),
    measurement_boundary text,
    CHECK ((plot_id IS NULL AND measurement_boundary IS NOT NULL
        AND char_length(btrim(measurement_boundary)) BETWEEN 1 AND 500)
        OR (plot_id IS NOT NULL AND measurement_boundary IS NULL)),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, plot_id),
    FOREIGN KEY (community_id, plot_id) REFERENCES community_register.plot (community_id, id)
);

CREATE UNIQUE INDEX water_common_designation
    ON community_water.accounting_point (community_id, lower(designation)) WHERE plot_id IS NULL;

CREATE TABLE community_water.meter (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    designation text NOT NULL CHECK (char_length(btrim(designation)) BETWEEN 1 AND 128),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, designation)
);

CREATE TABLE community_water.installation (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    point_id uuid NOT NULL,
    meter_id uuid NOT NULL,
    starts_on date NOT NULL,
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    lock_marker boolean,
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, point_id),
    UNIQUE (community_id, meter_id),
    FOREIGN KEY (community_id, point_id) REFERENCES community_water.accounting_point (community_id, id),
    FOREIGN KEY (community_id, meter_id) REFERENCES community_water.meter (community_id, id)
);

CREATE TABLE community_water.reading (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    installation_id uuid NOT NULL,
    measured_on date NOT NULL,
    value_m3 numeric NOT NULL CHECK (value_m3 BETWEEN 0 AND 999999999999.999 AND value_m3 = round(value_m3, 3)),
    source text NOT NULL CHECK (source = 'manual-observation'),
    recognition_rule text NOT NULL CHECK (btrim(recognition_rule) <> ''),
    recognized_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, installation_id, measured_on),
    FOREIGN KEY (community_id, installation_id) REFERENCES community_water.installation (community_id, id)
);

DO $$
DECLARE
    relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['accounting_point', 'meter', 'installation', 'reading'] LOOP
        EXECUTE format('ALTER TABLE community_water.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_water.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format(
            'CREATE POLICY community_scope ON community_water.%I
                USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)
                WITH CHECK (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)',
            relation
        );
    END LOOP;
END $$;

COMMIT;
