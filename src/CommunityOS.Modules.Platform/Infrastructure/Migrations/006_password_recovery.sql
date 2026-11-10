BEGIN;

ALTER TABLE platform_provisioning.platform_auth_security_event
    ADD COLUMN technical_actor text,
    DROP CONSTRAINT platform_auth_security_event_event_kind_check,
    ADD CHECK (event_kind IN (
        'login-denied', 'session-started', 'session-revoked', 'bootstrap-audit-read',
        'recovery-issued', 'recovery-used'
    ));

CREATE TABLE platform_provisioning.platform_password_recovery (
    account_id uuid PRIMARY KEY REFERENCES platform_provisioning.platform_account (id),
    code_digest bytea NOT NULL CHECK (octet_length(code_digest) = 32),
    expires_at timestamptz NOT NULL
);

CREATE FUNCTION platform_provisioning.issue_password_recovery(target uuid, digest bytea)
RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
    PERFORM 1 FROM platform_provisioning.platform_account
    WHERE id = target AND disabled_at IS NULL FOR UPDATE;
    IF NOT FOUND THEN
        RETURN false;
    END IF;

    INSERT INTO platform_provisioning.platform_password_recovery (account_id, code_digest, expires_at)
    VALUES (target, digest, clock_timestamp() + interval '15 minutes')
    ON CONFLICT (account_id) DO UPDATE
    SET code_digest = EXCLUDED.code_digest, expires_at = EXCLUDED.expires_at;

    INSERT INTO platform_provisioning.platform_auth_security_event (event_kind, account_id, technical_actor)
    VALUES ('recovery-issued', target, session_user);
    RETURN true;
END;
$$;

CREATE FUNCTION platform_provisioning.consume_password_recovery(account_login text, digest bytea, expected_hash text, new_hash text)
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

REVOKE ALL ON FUNCTION platform_provisioning.issue_password_recovery(uuid, bytea) FROM PUBLIC;
REVOKE ALL ON FUNCTION platform_provisioning.consume_password_recovery(text, bytea, text, text) FROM PUBLIC;

COMMIT;
