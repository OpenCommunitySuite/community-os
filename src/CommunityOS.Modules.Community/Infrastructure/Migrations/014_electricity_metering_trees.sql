BEGIN;

CREATE TABLE community_electricity.substation (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    designation text NOT NULL CHECK (char_length(btrim(designation)) BETWEEN 1 AND 128),
    PRIMARY KEY (community_id, id)
);

CREATE TABLE community_electricity.topology_revision (
    community_id uuid NOT NULL,
    starts_on date NOT NULL,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    admission_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, starts_on)
);

CREATE TABLE community_electricity.topology_point (
    community_id uuid NOT NULL,
    starts_on date NOT NULL,
    point_id uuid NOT NULL,
    depth smallint NOT NULL,
    substation_id uuid,
    parent_point_id uuid,
    parent_depth smallint GENERATED ALWAYS AS ((depth - 1)::smallint) STORED,
    PRIMARY KEY (community_id, starts_on, point_id),
    UNIQUE (community_id, starts_on, point_id, depth),
    FOREIGN KEY (community_id, starts_on)
        REFERENCES community_electricity.topology_revision (community_id, starts_on),
    FOREIGN KEY (community_id, point_id)
        REFERENCES community_electricity.accounting_point (community_id, id),
    FOREIGN KEY (community_id, substation_id)
        REFERENCES community_electricity.substation (community_id, id),
    FOREIGN KEY (community_id, starts_on, parent_point_id, parent_depth)
        REFERENCES community_electricity.topology_point (community_id, starts_on, point_id, depth),
    CHECK (
        (depth = 0 AND substation_id IS NOT NULL AND parent_point_id IS NULL)
        OR
        (depth IN (1, 2) AND substation_id IS NULL AND parent_point_id IS NOT NULL)
    )
);

DO $$
DECLARE
    relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY['substation', 'topology_revision', 'topology_point']
    LOOP
        EXECUTE format('ALTER TABLE community_electricity.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_electricity.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format(
            'CREATE POLICY community_scope ON community_electricity.%I
                USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)
                WITH CHECK (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)',
            relation);
    END LOOP;
END $$;

COMMIT;
