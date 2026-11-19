"""Synthetic one-account facts for a real, read-only water charge preview."""

import uuid


def seed(sql, community, account, subject):
    plot, point, old_meter, new_meter, old, new, tariff, second_tariff, admission = (
        str(uuid.uuid4()) for _ in range(9)
    )
    sql(f"""
        BEGIN;
        INSERT INTO community_register.plot VALUES ('{community}','{plot}','Synthetic billing plot');
        INSERT INTO community_register.subject VALUES ('{community}','{subject}','Synthetic water payer');
        INSERT INTO community_register.ownership (community_id,plot_id,subject_id)
            VALUES ('{community}','{plot}','{subject}');
        INSERT INTO community_register.personal_account
            VALUES ('{community}',gen_random_uuid(),'{plot}','WATER-001');
        INSERT INTO community_water.accounting_point (community_id,id,plot_id,designation)
            VALUES ('{community}','{point}','{plot}','Synthetic billing plot');
        INSERT INTO community_water.meter (community_id,id,designation) VALUES
            ('{community}','{old_meter}','Synthetic previous meter'),
            ('{community}','{new_meter}','Synthetic current meter');
        INSERT INTO community_water.installation
            (community_id,id,point_id,meter_id,starts_on,ends_before,admission_id,account_id,subject_id,basis)
        VALUES
            ('{community}','{old}','{point}','{old_meter}','2026-01-01','2026-01-20',gen_random_uuid(),'{account}','{subject}','Synthetic fixture'),
            ('{community}','{new}','{point}','{new_meter}','2026-01-20',NULL,'{admission}','{account}','{subject}','Synthetic fixture');
        INSERT INTO community_water.replacement
            (community_id,request_id,point_id,old_installation_id,new_installation_id,effective_on,reason,admission_id,account_id,subject_id,basis)
        VALUES ('{community}',gen_random_uuid(),'{point}','{old}','{new}','2026-01-20',
            'Synthetic fixture','{admission}','{account}','{subject}','Synthetic fixture');
        INSERT INTO community_water.reading
            (community_id,id,installation_id,measured_on,value_m3,source,recognition_rule,admission_id,account_id,subject_id,basis)
        SELECT '{community}',gen_random_uuid(),installation::uuid,day::date,value,'manual-observation',
            'synthetic-fixture',gen_random_uuid(),'{account}','{subject}','Synthetic fixture'
        FROM (VALUES
            ('{old}','2026-01-01',10), ('{old}','2026-01-03',12.5), ('{old}','2026-01-05',12.5),
            ('{old}','2026-01-08',14), ('{old}','2026-01-10',15), ('{old}','2026-01-11',16),
            ('{old}','2026-01-19',17), ('{new}','2026-01-20',1), ('{new}','2026-01-22',2)
        ) fixture(installation,day,value);
        INSERT INTO community_billing.water_tariff (community_id,id,applicable_from,applicable_until,basis,rate_uah)
        VALUES
            ('{community}','{tariff}','2026-01-01','2026-01-06','Synthetic water tariff A',20),
            ('{community}','{second_tariff}','2026-01-08','2026-01-11','Synthetic water tariff B',30);
        COMMIT;""")
    return tariff


def source_fingerprint(sql, community):
    tables = ('community_register.personal_account', 'community_register.ownership',
              'community_water.accounting_point', 'community_water.meter', 'community_water.installation',
              'community_water.replacement', 'community_water.reading', 'community_billing.water_tariff')
    parts = ' UNION ALL '.join(f"SELECT to_jsonb(t)::text AS value FROM {table} t WHERE community_id='{community}'"
                               for table in tables)
    return sql(f"SELECT md5(string_agg(value,'|' ORDER BY value)) FROM ({parts}) records;")
