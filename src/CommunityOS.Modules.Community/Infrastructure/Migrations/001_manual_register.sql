BEGIN;

CREATE SCHEMA community_register;

CREATE TABLE community_register.subject (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    display_name text NOT NULL CHECK (btrim(display_name) <> ''),
    PRIMARY KEY (community_id, id)
);

CREATE TABLE community_register.plot (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    number text NOT NULL CHECK (btrim(number) <> ''),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, number)
);

CREATE TABLE community_register.ownership (
    community_id uuid NOT NULL,
    plot_id uuid NOT NULL,
    subject_id uuid NOT NULL,
    recorded_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, plot_id, subject_id),
    FOREIGN KEY (community_id, plot_id) REFERENCES community_register.plot (community_id, id),
    FOREIGN KEY (community_id, subject_id) REFERENCES community_register.subject (community_id, id)
);

CREATE TABLE community_register.personal_account (
    community_id uuid NOT NULL,
    id uuid NOT NULL,
    plot_id uuid NOT NULL,
    number text NOT NULL CHECK (btrim(number) <> ''),
    PRIMARY KEY (community_id, id),
    UNIQUE (community_id, plot_id),
    UNIQUE (community_id, number),
    FOREIGN KEY (community_id, plot_id) REFERENCES community_register.plot (community_id, id)
);

COMMIT;
