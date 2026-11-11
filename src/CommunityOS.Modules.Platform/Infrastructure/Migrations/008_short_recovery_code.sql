BEGIN;

ALTER TABLE platform_provisioning.recovery_delivery
    ADD COLUMN short_code boolean NOT NULL DEFAULT false;
CREATE INDEX recovery_delivery_short_verifier
    ON platform_provisioning.recovery_delivery (account_id, code_digest) WHERE short_code;

CREATE TABLE platform_provisioning.recovery_short_failure (
    account_id uuid NOT NULL REFERENCES platform_provisioning.platform_account (id),
    attempted_at timestamptz NOT NULL
);
CREATE INDEX recovery_short_failure_account_time
    ON platform_provisioning.recovery_short_failure (account_id, attempted_at);

CREATE FUNCTION platform_provisioning.request_short_recovery(account_login text, job uuid, digest bytea)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
BEGIN
    IF EXISTS (SELECT 1 FROM platform_provisioning.recovery_delivery WHERE id = job) THEN
        RETURN;
    END IF;
    PERFORM platform_provisioning.request_recovery_delivery(account_login, job, digest);
    UPDATE platform_provisioning.recovery_delivery SET short_code = true WHERE id = job;
END;
$$;

CREATE FUNCTION platform_provisioning.short_recovery_issuance(account_login text)
RETURNS uuid LANGUAGE sql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
    SELECT d.id
    FROM platform_provisioning.platform_account a
    JOIN platform_provisioning.platform_password_recovery r ON r.account_id = a.id
    JOIN platform_provisioning.recovery_delivery d ON d.account_id = a.id AND d.code_digest = r.code_digest
    WHERE a.login = account_login AND a.disabled_at IS NULL
        AND d.short_code AND r.expires_at > clock_timestamp();
$$;

CREATE FUNCTION platform_provisioning.apply_password_recovery(account_login text, digest bytea, expected_hash text, new_hash text)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
    target uuid;
BEGIN
    SELECT id INTO target FROM platform_provisioning.platform_account
    WHERE login = account_login AND password_hash = expected_hash AND disabled_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    DELETE FROM platform_provisioning.platform_password_recovery
    WHERE account_id = target AND code_digest = digest AND expires_at > clock_timestamp();
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    UPDATE platform_provisioning.platform_account SET password_hash = new_hash WHERE id = target;

    WITH revoked AS (
        UPDATE platform_provisioning.platform_session SET revoked_at = clock_timestamp()
        WHERE account_id = target AND revoked_at IS NULL
        RETURNING account_id
    )
    INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id)
    SELECT 'session-revoked', account_id FROM revoked;

    INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id)
    VALUES ('recovery-used', target);
    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION platform_provisioning.consume_password_recovery(
    account_login text, digest bytea, expected_hash text, new_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE target uuid;
BEGIN
    SELECT id INTO target FROM platform_provisioning.platform_account
    WHERE login = account_login AND disabled_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RETURN false; END IF;

    IF EXISTS (
        SELECT 1 FROM platform_provisioning.platform_password_recovery r
        JOIN platform_provisioning.recovery_delivery d ON d.account_id = r.account_id AND d.code_digest = r.code_digest
        WHERE r.account_id = target AND d.short_code
    ) THEN RETURN false; END IF;

    RETURN platform_provisioning.apply_password_recovery(account_login, digest, expected_hash, new_hash);
END;
$$;

CREATE FUNCTION platform_provisioning.consume_short_recovery(
    account_login text, issuance uuid, digest bytea, expected_hash text, new_hash text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path = pg_catalog, pg_temp AS $$
DECLARE target uuid;
DECLARE verifier bytea;
DECLARE cutoff timestamptz;
BEGIN
    SELECT id INTO target FROM platform_provisioning.platform_account
    WHERE login = account_login AND disabled_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN RETURN false; END IF;

    SELECT r.code_digest INTO verifier
    FROM platform_provisioning.platform_password_recovery r
    JOIN platform_provisioning.recovery_delivery d ON d.account_id = r.account_id AND d.code_digest = r.code_digest
    WHERE r.account_id = target AND d.id = issuance AND d.short_code AND r.expires_at > clock_timestamp();
    IF NOT FOUND THEN RETURN false; END IF;

    cutoff := clock_timestamp() - interval '15 minutes';
    DELETE FROM platform_provisioning.recovery_short_failure
    WHERE account_id = target AND attempted_at <= cutoff;
    IF (SELECT count(*) FROM platform_provisioning.recovery_short_failure WHERE account_id = target) >= 5 THEN
        RETURN false;
    END IF;

    IF digest IS DISTINCT FROM verifier THEN
        INSERT INTO platform_provisioning.recovery_short_failure VALUES (target, clock_timestamp());
        RETURN false;
    END IF;

    RETURN platform_provisioning.apply_password_recovery(account_login, digest, expected_hash, new_hash);
END;
$$;

REVOKE ALL ON FUNCTION platform_provisioning.apply_password_recovery(text, bytea, text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.request_short_recovery(text, uuid, bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.short_recovery_issuance(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.consume_short_recovery(text, uuid, bytea, text, text) FROM PUBLIC;

COMMIT;
