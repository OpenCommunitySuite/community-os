BEGIN;

DO $$
DECLARE
    relation text;
BEGIN
    FOREACH relation IN ARRAY ARRAY[
        'subject', 'plot', 'ownership', 'personal_account',
        'ownership_correction', 'register_import', 'register_import_item'
    ]
    LOOP
        EXECUTE format('ALTER TABLE community_register.%I ENABLE ROW LEVEL SECURITY', relation);
        EXECUTE format('ALTER TABLE community_register.%I FORCE ROW LEVEL SECURITY', relation);
        EXECUTE format(
            'CREATE POLICY community_scope ON community_register.%I
                USING (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)
                WITH CHECK (community_id = nullif(current_setting(''community_os.community_id'', true), '''')::uuid)',
            relation
        );
    END LOOP;
END $$;

COMMIT;
