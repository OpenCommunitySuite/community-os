BEGIN;

ALTER TABLE community_register.ownership
    ADD COLUMN revision uuid NOT NULL DEFAULT uuidv7();

CREATE TABLE community_register.ownership_correction (
    community_id uuid NOT NULL,
    plot_id uuid NOT NULL,
    previous_revision uuid NOT NULL,
    previous_subject_id uuid NOT NULL,
    corrected_subject_id uuid NOT NULL,
    reason text NOT NULL CHECK (btrim(reason) <> ''),
    recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    PRIMARY KEY (community_id, plot_id, previous_revision),
    FOREIGN KEY (community_id, plot_id) REFERENCES community_register.plot (community_id, id),
    FOREIGN KEY (community_id, previous_subject_id) REFERENCES community_register.subject (community_id, id),
    FOREIGN KEY (community_id, corrected_subject_id) REFERENCES community_register.subject (community_id, id),
    CHECK (previous_subject_id <> corrected_subject_id)
);

COMMIT;
