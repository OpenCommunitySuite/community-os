BEGIN;

ALTER TABLE platform_provisioning.platform_auth_security_event
    ADD COLUMN delivery_channel text CHECK (delivery_channel IN ('email', 'telegram')),
    DROP CONSTRAINT platform_auth_security_event_event_kind_check,
    ADD CHECK (event_kind IN (
        'login-denied', 'session-started', 'session-revoked', 'bootstrap-audit-read',
        'recovery-issued', 'recovery-used', 'recovery-channel-confirmed', 'recovery-channel-revoked',
        'recovery-delivery-sent', 'recovery-delivery-retry', 'recovery-delivery-failed'
    ));

CREATE INDEX recovery_issuance_recent ON platform_provisioning.platform_auth_security_event (account_id, recorded_at)
WHERE event_kind = 'recovery-issued';

CREATE TABLE platform_provisioning.recovery_channel (
    account_id uuid PRIMARY KEY REFERENCES platform_provisioning.platform_account (id),
    revision uuid NOT NULL,
    channel text NOT NULL CHECK (channel IN ('email', 'telegram')),
    destination text NOT NULL CHECK (length(destination) BETWEEN 1 AND 320)
);

CREATE TABLE platform_provisioning.recovery_delivery (
    id uuid PRIMARY KEY,
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    binding_revision uuid NOT NULL,
    code_digest bytea NOT NULL CHECK (octet_length(code_digest) = 32),
    available_at timestamptz NOT NULL DEFAULT clock_timestamp(),
    attempts integer NOT NULL DEFAULT 0,
    finished boolean NOT NULL DEFAULT false
);
CREATE INDEX recovery_delivery_pending ON platform_provisioning.recovery_delivery (available_at) WHERE NOT finished;

CREATE FUNCTION platform_provisioning.set_recovery_channel(target uuid, kind text, address text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE previous text;
BEGIN
    PERFORM 1 FROM platform_provisioning.platform_account WHERE id = target FOR UPDATE;
    IF NOT FOUND THEN RETURN false; END IF;
    IF kind IS NULL THEN
        DELETE FROM platform_provisioning.recovery_channel WHERE account_id = target
        RETURNING channel INTO previous;
        IF NOT FOUND THEN RETURN false; END IF;
    ELSE
        INSERT INTO platform_provisioning.recovery_channel (account_id, revision, channel, destination)
        VALUES (target, uuidv7(), kind, address)
        ON CONFLICT (account_id) DO UPDATE SET revision = EXCLUDED.revision,
            channel = EXCLUDED.channel, destination = EXCLUDED.destination;
    END IF;
    DELETE FROM platform_provisioning.platform_password_recovery WHERE account_id = target;
    UPDATE platform_provisioning.recovery_delivery SET finished = true
    WHERE account_id = target AND NOT finished;
    INSERT INTO platform_provisioning.platform_auth_security_event
        (event_kind, account_id, technical_actor, delivery_channel)
    VALUES (CASE WHEN kind IS NULL THEN 'recovery-channel-revoked' ELSE 'recovery-channel-confirmed' END,
        target, session_user, coalesce(kind, previous));
    RETURN true;
END;
$$;

CREATE FUNCTION platform_provisioning.request_recovery_delivery(account_login text, job uuid, digest bytea)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE target uuid;
DECLARE binding uuid;
DECLARE kind text;
BEGIN
    SELECT id INTO target FROM platform_provisioning.platform_account
    WHERE login = account_login AND disabled_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RETURN; END IF;
    SELECT revision, channel INTO binding, kind FROM platform_provisioning.recovery_channel WHERE account_id = target;
    IF NOT FOUND OR EXISTS (SELECT 1 FROM platform_provisioning.platform_auth_security_event
        WHERE account_id = target AND event_kind = 'recovery-issued'
          AND recorded_at > clock_timestamp() - interval '60 seconds')
        OR EXISTS (SELECT 1 FROM platform_provisioning.platform_password_recovery
        WHERE account_id = target AND expires_at > clock_timestamp()) THEN RETURN; END IF;
    INSERT INTO platform_provisioning.platform_password_recovery (account_id, code_digest, expires_at)
    VALUES (target, digest, clock_timestamp() + interval '15 minutes')
    ON CONFLICT (account_id) DO UPDATE SET code_digest = EXCLUDED.code_digest, expires_at = EXCLUDED.expires_at;
    INSERT INTO platform_provisioning.recovery_delivery (id, account_id, binding_revision, code_digest)
    VALUES (job, target, binding, digest);
    INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id, delivery_channel)
    VALUES ('recovery-issued', target, kind);
END;
$$;

CREATE FUNCTION platform_provisioning.claim_recovery_delivery()
RETURNS TABLE(job_id uuid, attempt integer, channel text, destination text, digest bytea)
LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
    WITH candidate AS (
        SELECT d.id, b.channel, b.destination
        FROM platform_provisioning.recovery_delivery d
        JOIN platform_provisioning.recovery_channel b ON b.account_id = d.account_id AND b.revision = d.binding_revision
        JOIN platform_provisioning.platform_password_recovery r ON r.account_id = d.account_id
            AND r.code_digest = d.code_digest AND r.expires_at > clock_timestamp()
        JOIN platform_provisioning.platform_account a ON a.id = d.account_id AND a.disabled_at IS NULL
        WHERE NOT d.finished AND d.attempts < 3 AND d.available_at <= clock_timestamp()
        ORDER BY d.available_at, d.id
        LIMIT 1 FOR UPDATE OF d SKIP LOCKED
    )
    UPDATE platform_provisioning.recovery_delivery d
    SET attempts = d.attempts + 1, available_at = clock_timestamp() + interval '60 seconds'
    FROM candidate c WHERE d.id = c.id
    RETURNING d.id, d.attempts, c.channel, c.destination, d.code_digest;
$$;

CREATE FUNCTION platform_provisioning.finish_recovery_delivery(job uuid, attempt_number integer, outcome text, retry_seconds integer)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
    WITH changed AS (
        UPDATE platform_provisioning.recovery_delivery d
        SET finished = outcome <> 'retry' OR d.attempts >= 3,
            available_at = clock_timestamp() + make_interval(secs => greatest(30, least(retry_seconds, 900)))
        FROM platform_provisioning.recovery_channel b
        WHERE d.id = job AND d.attempts = attempt_number AND NOT d.finished
            AND d.available_at > clock_timestamp()
            AND b.account_id = d.account_id AND b.revision = d.binding_revision
            AND outcome IN ('sent', 'retry', 'failed')
        RETURNING d.account_id, d.finished, b.channel
    )
    INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id, delivery_channel)
    SELECT CASE WHEN outcome = 'sent' THEN 'recovery-delivery-sent'
        WHEN finished THEN 'recovery-delivery-failed' ELSE 'recovery-delivery-retry' END, account_id, channel
    FROM changed;
$$;

REVOKE ALL ON FUNCTION platform_provisioning.set_recovery_channel(uuid, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.request_recovery_delivery(text, uuid, bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.claim_recovery_delivery() FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.finish_recovery_delivery(uuid, integer, text, integer) FROM PUBLIC;

COMMIT;
