BEGIN;
CREATE TABLE community_water.topology_revision (
    community_id uuid NOT NULL,
    starts_on date NOT NULL,
    admission_id uuid NOT NULL UNIQUE,
    account_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    basis text NOT NULL CHECK (btrim(basis) <> ''),
    PRIMARY KEY (community_id,starts_on)
);
CREATE TABLE community_water.topology_point (
    community_id uuid NOT NULL,
    starts_on date NOT NULL,
    point_id uuid NOT NULL,
    parent_id uuid,
    PRIMARY KEY (community_id,starts_on,point_id),
    FOREIGN KEY (community_id,starts_on) REFERENCES community_water.topology_revision,
    FOREIGN KEY (community_id,point_id) REFERENCES community_water.accounting_point,
    FOREIGN KEY (community_id,starts_on,parent_id) REFERENCES community_water.topology_point
);
ALTER TABLE community_water.topology_revision ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_water.topology_revision FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_water.topology_revision
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);
ALTER TABLE community_water.topology_point ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_water.topology_point FORCE ROW LEVEL SECURITY;
CREATE POLICY community_scope ON community_water.topology_point
    USING (community_id = nullif(current_setting('community_os.community_id', true), '')::uuid);
COMMIT;
