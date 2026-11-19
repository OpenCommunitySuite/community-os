"""Synthetic one-account facts for water preview and period posting."""

import time
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


def seed_period(sql, community, account, subject):
    water_tariff = seed(sql, community, account, subject)
    point, meter, installation = (str(uuid.uuid4()) for _ in range(3))
    sql(f"""
        BEGIN;
        INSERT INTO community_electricity.accounting_point (community_id,id,plot_id)
            SELECT community_id,'{point}',plot_id FROM community_register.personal_account
            WHERE community_id='{community}' AND number='WATER-001';
        INSERT INTO community_electricity.meter (community_id,id,designation,register_mode)
            VALUES ('{community}','{meter}','Synthetic billing electricity meter','total');
        INSERT INTO community_electricity.installation
            (community_id,id,point_id,meter_id,starts_on,admission_id,account_id,subject_id,basis,reading_multiplier)
            VALUES ('{community}','{installation}','{point}','{meter}','2026-01-01',
                    gen_random_uuid(),'{account}','{subject}','Synthetic fixture',40);
        INSERT INTO community_electricity.reading
            (community_id,id,installation_id,measured_on,value_kwh,channel,source,recognition_rule,admission_id,account_id,subject_id,basis)
        SELECT '{community}',gen_random_uuid(),'{installation}',day::date,value,'total','manual-observation',
            'synthetic-fixture',gen_random_uuid(),'{account}','{subject}','Synthetic fixture'
        FROM (VALUES ('2026-01-01',100),('2026-01-03',103),('2026-01-05',104)) fixture(day,value);
        INSERT INTO community_billing.tariff (community_id,id,applicable_from,basis,rates)
            VALUES ('{community}',gen_random_uuid(),'2026-01-01','Synthetic electricity tariff','{{"total":4}}');
        INSERT INTO community_billing.member_fee (community_id,id,applicable_from,basis,amount_uah)
            VALUES ('{community}',gen_random_uuid(),'2026-01-01','Synthetic membership fee',25);
        COMMIT;""")
    return water_tariff


def seed_billing_peer(register, platform, community, account, subject, basis):
    platform(f"""
        BEGIN;
        INSERT INTO platform_provisioning.community_reservation
            (operation_id,community_id,creator_account_id,request_id,initial_administrator_account_id,display_name)
        VALUES (gen_random_uuid(),'{community}','{account}',gen_random_uuid(),'{account}','{basis} peer');
        INSERT INTO platform_provisioning.register_availability
            (community_id,community_active,register_enabled,electricity_enabled,water_enabled,billing_enabled)
        VALUES ('{community}',true,true,true,true,true);
        INSERT INTO platform_provisioning.register_operator
            (community_id,account_id,subject_id,linked,can_read,can_read_electricity,can_read_water)
        VALUES ('{community}','{account}','{subject}',true,true,true,true);
        COMMIT;
    """)
    seed_period(register, community, account, subject)


def posted_periods(register, community):
    return [row.split('|') for row in register(f"""
        SELECT id,admission_id,digest,starts_on,ends_on,calculated_on,due_on,
            coalesce(snapshot->>'includeWater','false'),account_id,subject_id,basis
        FROM community_billing.posted_period WHERE community_id='{community}' ORDER BY starts_on;""").splitlines()]


def verify_period_accruals(register, community, subject, *, include_dry=False, water_amount=50):
    rows = register(f"""
        SELECT p.starts_on,a.kind,trim_scale(a.amount_uah),pa.number,a.debtor_id,
            (o.id IS NOT NULL)::text
        FROM community_billing.accrual a
        JOIN community_billing.posted_period p ON (p.community_id,p.id)=(a.community_id,a.period_id)
        JOIN community_register.personal_account pa ON (pa.community_id,pa.id)=(a.community_id,a.personal_account_id)
        LEFT JOIN community_billing.obligation o ON (o.community_id,o.accrual_id)=(a.community_id,a.id)
        WHERE a.community_id='{community}' ORDER BY p.starts_on,a.kind;""").splitlines()
    expected = [
        f'2026-01-01|electricity|480|WATER-001|{subject}|true',
        f'2026-01-01|member-fee|25|WATER-001|{subject}|true',
        f'2026-01-01|water|{water_amount}|WATER-001|{subject}|true',
    ]
    if include_dry:
        expected.extend([
            f'2026-01-03|electricity|160|WATER-001|{subject}|true',
            f'2026-01-03|member-fee|25|WATER-001|{subject}|true',
        ])
    if rows != expected:
        raise RuntimeError('Unexpected accruals or obligations after posting')
    for table in ('accrual', 'obligation'):
        if register(f"SELECT count(*) FROM community_billing.{table} WHERE community_id='{community}';") != str(len(expected)):
            raise RuntimeError(f'Unexpected {table} count in the synthetic community')


def billing_admissions(platform, community):
    return [row.split('|') for row in platform(f"""
        SELECT id,digest,starts_on,ends_on,account_id,subject_id,basis
        FROM platform_provisioning.billing_admission WHERE community_id='{community}';""").splitlines()]


def verify_periods(register, platform, community, account, subject, basis):
    periods = posted_periods(register, community)
    if [row[3:] for row in periods] != [
        ['2026-01-01', '2026-01-03', '2026-01-04', '2026-01-15', 'true', account, subject, basis],
        ['2026-01-03', '2026-01-05', '2026-01-06', '2026-01-16', 'false', account, subject, basis],
    ]:
        raise RuntimeError('Expected two attributed snapshots with distinct water inclusion')
    wet, dry = periods
    verify_period_accruals(register, community, subject, include_dry=True)
    admissions = billing_admissions(platform, community)
    if len(admissions) != 4 or any(row[4:] != [account, subject, basis] for row in admissions):
        raise RuntimeError('Expected four attributed Platform admissions before access revocation')
    for period in periods:
        if period[1:5] not in [row[:4] for row in admissions]:
            raise RuntimeError('Posted snapshot does not reference its exact Platform admission')
    remaining = [row[1:4] for row in admissions if row[0] not in {wet[1], dry[1]}]
    replay = wet[2:5]
    if replay not in remaining:
        raise RuntimeError('Expected admission for the identical wet-period replay')
    remaining.remove(replay)
    if len(remaining) != 1 or remaining[0][0] == wet[2] or remaining[0][1:] != wet[3:5]:
        raise RuntimeError('Expected one conflicting digest on the same period bounds')


def reserve_period(community, account, subject):
    # The uncommitted fixture row reserves only this synthetic community's period key.
    return f"""
        INSERT INTO community_billing.posted_period
            (community_id,id,starts_on,ends_on,calculated_on,due_on,digest,snapshot,admission_id,account_id,subject_id,basis)
        VALUES ('{community}',gen_random_uuid(),'2026-01-01','2026-01-03','2026-01-04','2026-01-15',
            repeat('0',64),'{{}}',gen_random_uuid(),'{account}','{subject}','Synthetic concurrency guard')
        RETURNING 'LOCKED|' || pg_backend_pid();
    """


def wait_for_postings(register, holder, expected):
    deadline = time.monotonic() + 10
    while True:
        count = int(register(f"""
            WITH RECURSIVE blocked(pid) AS (
                SELECT {holder}
                UNION
                SELECT activity.pid FROM pg_stat_activity activity
                JOIN blocked ON blocked.pid = ANY(pg_blocking_pids(activity.pid))
                WHERE activity.datname = current_database() AND activity.wait_event_type = 'Lock'
            )
            SELECT count(*) FROM blocked JOIN pg_stat_activity activity USING (pid)
            WHERE pid <> {holder} AND activity.query LIKE '%INSERT INTO community_billing.posted_period%';
        """))
        if count == expected:
            return
        if count > expected:
            raise RuntimeError('Unexpected number of synthetic billing inserts waiting on the period')
        if time.monotonic() >= deadline:
            raise RuntimeError(f'Expected {expected} synthetic billing inserts before release, observed {count}')
        time.sleep(0.1)


def verify_posting_admissions(platform, community, account, subject, basis):
    admissions = billing_admissions(platform, community)
    if len(admissions) != 2 or any(row[2:] != ['2026-01-01', '2026-01-03', account, subject, basis] for row in admissions):
        raise RuntimeError('Expected two attributed Platform admissions for the same synthetic period')
    if admissions[0][1] != admissions[1][1]:
        raise RuntimeError('Both admissions must have the same billing digest')
    return admissions


def verify_posting_race(register, platform, community, account, subject, basis):
    periods = posted_periods(register, community)
    if [row[3:] for row in periods] != [['2026-01-01', '2026-01-03', '2026-01-04', '2026-01-15', 'true', account, subject, basis]]:
        raise RuntimeError('Expected one attributed water snapshot after the concurrent posts')
    [posted] = periods
    verify_period_accruals(register, community, subject)
    admissions = verify_posting_admissions(platform, community, account, subject, basis)
    if posted[1:5] not in [row[:4] for row in admissions]:
        raise RuntimeError('The saved snapshot must reference the admission that posted it')


def verify_rejected_posting(register, platform, community, account, subject, basis):
    for table in ('posted_period', 'accrual', 'obligation'):
        if register(f"SELECT count(*) FROM community_billing.{table} WHERE community_id='{community}';") != '0':
            raise RuntimeError(f'Stale confirmation must leave {table} empty')
    admissions = billing_admissions(platform, community)
    if len(admissions) != 1 or admissions[0][2:] != ['2026-01-01', '2026-01-03', account, subject, basis]:
        raise RuntimeError('Expected only the admitted stale confirmation before recalculation')
    return admissions[0]


def verify_refreshed_posting(register, platform, community, account, subject, basis, stale_admission):
    periods = posted_periods(register, community)
    if [row[3:] for row in periods] != [
        ['2026-01-01', '2026-01-03', '2026-01-04', '2026-01-15', 'true', account, subject, basis],
    ]:
        raise RuntimeError('Expected one attributed snapshot for the refreshed water project')
    verify_period_accruals(register, community, subject, water_amount=60)
    admissions = billing_admissions(platform, community)
    if len(admissions) != 2 or stale_admission not in admissions:
        raise RuntimeError('Expected one admission for each confirmation')
    admissions.remove(stale_admission)
    [fresh] = admissions
    if fresh[1] == stale_admission[1] or fresh[2:] != stale_admission[2:] or periods[0][1:5] != fresh[:4]:
        raise RuntimeError('The only posted period must reference the refreshed project admission')


def verify_scoped_period(register, platform, community, account, subject, basis):
    periods = posted_periods(register, community)
    if [row[3:] for row in periods] != [
        ['2026-01-01', '2026-01-03', '2026-01-04', '2026-01-15', 'true', account, subject, basis],
    ]:
        raise RuntimeError('Expected one attributed period in this synthetic community')
    verify_period_accruals(register, community, subject)
    [posted] = periods
    expected = posted[1:5] + [account, subject, basis]
    if billing_admissions(platform, community) != [expected]:
        raise RuntimeError('The community must have only the admission referenced by its posted period')


def verify_partial_payment(register, platform, community, account, subject, basis):
    for table, count in (('posted_period', 1), ('accrual', 3), ('obligation', 3),
                         ('payment', 1), ('allocation_batch', 1), ('allocation', 1)):
        if register(f"SELECT count(*) FROM community_billing.{table} WHERE community_id='{community}';") != str(count):
            raise RuntimeError(f'Unexpected {table} count after payment and replay')

    balances = register(f"""
        SELECT a.kind, trim_scale(a.amount_uah), trim_scale(r.outstanding_uah)
        FROM community_billing.accrual a
        JOIN community_billing.obligation_remainder r ON (r.community_id,r.accrual_id)=(a.community_id,a.id)
        WHERE a.community_id='{community}' ORDER BY a.kind;""").splitlines()
    if balances != ['electricity|480|480', 'member-fee|25|25', 'water|50|20']:
        raise RuntimeError('Only the water obligation must decrease by 30 UAH')

    payment = register(f"""
        SELECT p.id,p.admission_id,p.digest,trim_scale(r.available_uah),p.payer_id,p.received_on,
            trim_scale(p.amount_uah),p.reason,p.account_id,p.subject_id,p.basis
        FROM community_billing.payment p
        JOIN community_billing.payment_remainder r ON (r.community_id,r.id)=(p.community_id,p.id)
        WHERE p.community_id='{community}';""").split('|')
    if payment[3:] != ['0', subject, '2026-01-07', '30', 'Synthetic water payment', account, subject, basis]:
        raise RuntimeError('Expected one fully allocated and attributed synthetic payment')

    allocation = register(f"""
        SELECT b.id,b.admission_id,b.payment_id,a.kind,trim_scale(l.amount_uah),b.reason,b.account_id,b.subject_id,b.basis
        FROM community_billing.allocation_batch b
        JOIN community_billing.allocation l ON (l.community_id,l.batch_id)=(b.community_id,b.id)
        JOIN community_billing.obligation o ON (o.community_id,o.id)=(l.community_id,l.obligation_id)
        JOIN community_billing.accrual a ON (a.community_id,a.id)=(o.community_id,o.accrual_id)
        WHERE b.community_id='{community}';""").split('|')
    if allocation[2:] != [payment[0], 'water', '30', 'Synthetic water allocation', account, subject, basis]:
        raise RuntimeError('Expected one attributed allocation to the water obligation')

    admissions = [row.split('|') for row in platform(f"""
        SELECT action,id,request_id,digest,account_id,subject_id,basis
        FROM platform_provisioning.payment_admission WHERE community_id='{community}';""").splitlines()]
    recorded = ['record', payment[1], payment[0], payment[2], account, subject, basis]
    if len(admissions) != 3 or recorded not in admissions:
        raise RuntimeError('Expected a matching record admission and two allocation admissions')
    admissions.remove(recorded)
    if any(row[0] != 'allocate' or row[2] != allocation[0] or row[4:] != [account, subject, basis]
           for row in admissions):
        raise RuntimeError('Unexpected allocation admission after replay and revocation')
    if allocation[1] not in [row[1] for row in admissions] or admissions[0][3] != admissions[1][3]:
        raise RuntimeError('Allocation and exact replay must have the same admitted digest')
