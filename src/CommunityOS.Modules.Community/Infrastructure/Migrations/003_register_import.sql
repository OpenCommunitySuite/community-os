BEGIN;

CREATE TABLE community_register.register_import (
    community_id uuid NOT NULL,
    plan_id text NOT NULL,
    confirmed_by text NOT NULL CHECK (btrim(confirmed_by) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, plan_id)
);

CREATE TABLE community_register.register_import_item (
    community_id uuid NOT NULL,
    plan_id text NOT NULL,
    source_row integer NOT NULL,
    plot_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    PRIMARY KEY (community_id, plan_id, source_row),
    FOREIGN KEY (community_id, plan_id) REFERENCES community_register.register_import (community_id, plan_id),
    FOREIGN KEY (community_id, plot_id) REFERENCES community_register.plot (community_id, id),
    FOREIGN KEY (community_id, subject_id) REFERENCES community_register.subject (community_id, id)
);

COMMIT;
