# BP-READING-002 — Автоматическое получение и импорт показаний

**Статус:** Draft
**Контекст:** интеграционная граница + ресурсный и инженерный учёт
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий процесс определяет, как внешние или автоматически получаемые сведения о значениях приборов попадают в Community OS и передаются в единую предметную модель признания Reading, установленную BP-READING-001.

Базовая последовательность:

```text
external / automatic source
→ received external information
→ identification / mapping
→ validation
→ BP-READING-001 domain recognition
→ Reading OR unresolved/rejected result
```

Ключевая граница:

```text
automatic receipt/import
≠ Reading
≠ Consumption
≠ Accrual
```

## 2. Нормативная основа

BP развивает ADR-011 и использует BP-READING-001 как единственную domain recognition model для Reading.

Сохраняются различия:

- external representation ≠ received information ≠ Reading;
- external device ID ≠ Meter identity ≠ Accounting Point identity;
- redelivery ≠ duplicate ≠ correction ≠ new information;
- migration import ≠ manual bulk import ≠ regular synchronization ≠ operational integration;
- integration mapping ≠ domain recognition;
- automated mechanism ≠ Subject.

## 3. Что входит

Процесс охватывает:

- CSV/XLS/other structured batch import показаний;
- регулярную синхронизацию через API;
- polling external meter/service;
- streaming/telemetry intake;
- MQTT/Modbus/Home Assistant/АСКОЕ как возможные integration examples, но не обязательную архитектуру;
- external source/device identification;
- historical mapping external device → Meter / Meter Installation / Accounting Point;
- channel/register mapping where applicable;
- units/scaling/timezone/time mapping;
- validation;
- redelivery/duplicate handling;
- late/out-of-order delivery;
- partial success batch;
- external correction/replacement;
- mapping/version changes;
- re-import/re-recognition;
- source gaps/outages;
- provenance.

## 4. Что не входит

BP не определяет:

- transport implementation;
- broker/queue/worker architecture;
- retry/backoff algorithms;
- database inbox/outbox;
- concrete MQTT topics/Modbus registers/API schemas;
- credentials/security implementation;
- universal raw telemetry store;
- UI;
- Consumption calculation;
- Control Reconciliation;
- Calculated Imbalance;
- Operational Loss;
- Accrual/financial consequences.

## 5. Automatic import не создаёт отдельный Reading type

Manual, imported и telemetry-derived Readings используют одну предметную сущность Reading.

```text
manual Reading
imported Reading
telemetry-derived Reading
→ same Reading domain model
```

Происхождение сохраняется в provenance, но не создаёт отдельные фундаментальные типы Reading.

## 6. Integration input не является Reading Candidate entity

Конкретная интеграция может иметь technical message/row/sample, но universal Reading Candidate / Imported Reading / Telemetry Reading entity не вводится.

До recognition это полученная внешняя информация конкретного integration process.

## 7. Integration source

Для автоматического процесса должен быть достаточно определим источник/внешняя сторона integration semantics.

Источник может быть:

- оператор/поставщик;
- АСКОЕ/АСТОЕ;
- Home Assistant;
- MQTT gateway;
- локальный контроллер;
- сторонний SaaS;
- файл, сформированный внешней системой;
- иной источник.

Источник не становится Subject автоматически.

## 8. External device identifier

External device ID является qualified integration identifier, а не Meter identity.

Mapping должен учитывать integration namespace/source и historical applicability.

```text
external device ID
→ integration mapping
→ Meter / Meter Installation where sufficiently established
```

Смена external ID не создаёт новый Meter автоматически.

## 9. Historical mapping

Mapping должен быть исторически корректным.

Если external device ID сегодня связан с Meter M2, это не означает, что late sample за прошлый месяц относится к M2.

Применимый mapping определяется measurement time и историей Meter Installation / integration mapping.

## 10. Mapping на Accounting Point

Если источник передаёт только external meter/device identity, Accounting Point определяется через validated Meter/Meter Installation mapping.

Нельзя напрямую считать external device ID идентичностью Accounting Point.

## 11. Channel/register mapping

External source может передавать:

- day/night;
- import/export;
- active/reactive;
- phases;
- multiple registers;
- другие channels.

External channel code не является domain semantics автоматически.

Mapping должен явно интерпретировать channel в measurement semantics, достаточную для BP-READING-001.

Universal Meter Register entity не вводится.

## 12. Unit and scaling mapping

Source может передавать raw value, scaled value или значение в другой unit.

Integration semantic contract должен определять, где применимо:

- source unit;
- scale;
- decimal interpretation;
- conversion;
- whether incoming value is cumulative register or interval value;
- historical version of mapping/conversion.

Current mapping не применяется ретроактивно к historical input без explicit re-recognition.

## 13. Measurement time mapping

Необходимо различать:

```text
source measurement time
≠ source send time
≠ received time
≠ processing time
≠ recognition time
```

Если источник не передаёт точный measurement time, integration contract должен описывать допустимую temporal semantics. Нельзя автоматически подставлять received time как factual measurement time.

## 14. Timezone / clock semantics

Timezone, clock offset и device clock quality могут быть частью integration mapping.

Clock skew не исправляется молча без explainable rule.

Если exact measurement time ненадёжен, input может быть unresolved/rejected либо признан с ограниченной temporal precision согласно BP-READING-001.

## 15. Validation layers

Автоматический intake различает:

1. transport/representation validity;
2. integration schema validity;
3. source/device mapping validity;
4. unit/channel/time mapping validity;
5. domain recognition validity.

Успех первых четырёх уровней не гарантирует признание Reading.

## 16. Automatic recognition

Automatic recognition допустимо, если integration semantic contract и applicable resource rule дают достаточные основания.

```text
successful automated validation/mapping
+ applicable recognition rule
→ BP-READING-001 automatic recognition
```

Automated mechanism не становится Subject.

## 17. Human review path

Некоторые входы могут требовать manual resolution:

- unknown device;
- ambiguous mapping;
- conflicting channel;
- impossible time;
- suspicious value;
- external correction;
- historical mapping conflict.

Manual resolution не создаёт отдельный вид Reading.

## 18. Batch import

Batch import может обрабатывать множество input rows/items.

Допускается partial success, если это разрешено конкретным process.

Для каждого значимого item должен быть объясним outcome:

- recognized;
- rejected;
- unresolved;
- duplicate/redelivery;
- requires correction/remapping.

Universal all-or-nothing import не требуется.

## 19. Safe re-import

Повторный импорт того же файла/набора не должен автоматически создавать duplicate Readings.

Одновременно filename/hash всего файла сам по себе не обязан быть domain identity каждого measurement fact.

Re-import должен использовать item-level provenance и integration semantics.

## 20. Regular synchronization

Regular synchronization периодически получает новые/изменённые external values.

Sync cursor/last timestamp/sequence может быть техническим механизмом, но не является domain fact.

Потеря cursor не должна оправдывать создание duplicate Readings; повторно полученные данные проходят normal redelivery/deduplication semantics.

## 21. Streaming / telemetry

Streaming source может давать очень высокую частоту samples.

Не каждый telemetry sample обязан становиться Reading.

Integration contract может определять:

- which samples are eligible for recognition;
- sampling/aggregation/filtering semantics;
- significant change rules;
- periodic snapshots;
- other intake policy.

Эти правила не превращают transport samples в Reading без domain recognition.

## 22. Raw telemetry retention

Community OS не обязана хранить все raw samples бессрочно.

Retention raw telemetry относится к конкретной integration/operational policy.

Для recognized Reading сохраняется sufficient provenance, даже если raw stream хранится ограниченно.

## 23. Redelivery

Повторная доставка одной и той же external information не создаёт новый Reading автоматически.

```text
redelivery
≠ new measurement fact
```

Критерии могут использовать external event/sample ID, sequence, source timestamp, payload semantics и другие признаки.

Universal idempotency key не вводится.

## 24. Duplicate

Совпадающие value/time/device не гарантируют duplicate.

Два реально разных observations могут иметь одинаковые значения.

Deduplication должна быть основана на integration semantic contract + BP-READING-001 identity semantics.

## 25. Out-of-order delivery

Input может прийти не в chronological measurement order.

```text
received order
≠ measurement order
```

Late data маппится к исторически применимому Meter Installation.

## 26. Burst after outage

После восстановления связи источник может прислать накопленный backlog.

Backlog не относится автоматически к моменту reconnect.

Каждый item сохраняет own measurement time semantics and passes recognition.

## 27. Missing interval / source outage

Отсутствие automatic data не создаёт Reading со значением zero и не создаёт Consumption automatically.

Gap может быть input для monitoring/data-quality process, но substitute Consumption belongs to another resource process.

## 28. Unknown device

External value from unknown device:

```text
unknown external device
→ unresolved/rejected mapping
→ no Reading
```

Нельзя автоматически создавать Meter только ради принятия telemetry.

## 29. Ambiguous device mapping

Если external identifier может соответствовать нескольким Meter/Installations, system не выбирает arbitrary current Meter.

Input остаётся unresolved до sufficient mapping resolution.

## 30. Meter replacement

При Meter replacement automatic source может:

- сменить external device ID;
- сохранить gateway ID;
- изменить channel mapping;
- некоторое время присылать late samples старого Meter.

Integration mapping должен сохранять historical distinction old/new Meter Installations.

## 31. External correction

External source may correct previously sent value.

```text
external correction
≠ Reading correction automatically
```

Integration layer identifies relation to prior external information, then BP-READING-001/resource context determines domain impact.

Original recognized Reading is not silently rewritten.

## 32. Mapping correction

Если обнаружено, что external device/channel был mapped incorrectly:

- original mapping/provenance remains explainable;
- mapping correction is recorded;
- previously recognized Readings are not silently reassigned;
- re-recognition/correction is explicit where needed.

## 33. Mapping version change

New integration mapping may affect future inputs only or require explicit re-recognition of historical data.

Version change alone does not rewrite historical Readings.

Applicable mapping version should be historically determinable where materially significant.

## 34. Re-recognition

Historical external information may be reprocessed using corrected mapping/rules.

```text
re-import
≠ re-recognition
≠ Reading correction automatically
```

Re-recognition outcome must be linked to original external provenance and prior domain result where relevant.

## 35. Provider/source authority

Being an authenticated source does not mean every value is authoritative or valid.

Source authority is integration/process-specific.

Provider identity/authentication ≠ domain truth.

## 36. Conflicts between sources

Telemetry, owner report and supplier value may conflict.

Integration layer must not globally choose telemetry/provider as winner.

BP-READING-001/control process applies relevant recognition/conflict rules.

## 37. Same value from two sources

Same numeric value from telemetry and manual report may be:

- independent observations;
- corroborating evidence;
- duplicate/redelivery only if provenance supports it.

Numeric equality alone does not collapse them.

## 38. Failure to reach source

Source unavailable / API failure:

```text
no received information
→ no Reading created
```

Operational monitoring/retry is Stage K concern.

## 39. Partial external response

API/provider may return only subset of expected meters.

Missing items do not become zero values or rejected Readings automatically.

Completeness/reconciliation of expected source coverage is separate integration/data-quality concern.

## 40. Unknown processing outcome

If technical processing outcome is uncertain, system must not assume Reading was or was not recognized merely from transport uncertainty.

Reconciliation against persisted integration/domain result may be required.

Exact technical idempotency/retry mechanism is not defined here.

## 41. Security/authentication boundary

Authentication of source confirms technical identity/credentials, not correctness of payload.

Authorization to send does not replace validation/mapping/domain recognition.

## 42. Multi-tenant boundary

External identifiers and mappings are interpreted within applicable Community/integration scope.

Same external device ID in two Communities does not imply same Meter.

Cross-tenant mapping is not inferred automatically.

## 43. Pilot ST — Home Assistant / MQTT electricity meter

Example:

```text
MQTT/HA entity reports 12540.2 kWh at T
→ source/entity mapping
→ Meter Installation AP-42
→ unit/channel/time validation
→ BP-READING-001
→ Reading where recognized
```

HA entity ID is not Meter identity.

## 44. Pilot ST — Tuya/PC321 telemetry

Telemetry may contain voltage/current/energy values.

Not every telemetry metric is a cumulative billing Reading.

Mapping must distinguish measurement semantics; voltage/current sample does not become electricity-consumption register Reading automatically.

## 45. Pilot ST — two-zone meter

Automatic source sends T1/T2 channels.

Channel codes are mapped explicitly to applicable measurement semantics.

Swapped channels must not be silently accepted as valid merely because both values are numeric.

## 46. Pilot ST — water meter file import

CSV rows contain meter ID, date and m³ value.

Each row maps through historical Meter Installation and BP-READING-001.

Unknown/ambiguous rows may fail independently if partial success is allowed.

## 47. Pilot ST — replaced meter still sends late telemetry

Old gateway/source sends backlog from old Meter after new Meter is installed.

Measurement time + historical mapping determine old Meter Installation.

Do not attach backlog to current new Meter.

## 48. Pilot ST — external device ID changed

Gateway reconfiguration changes entity/device ID but physical Meter is unchanged.

Correct mapping continues same Meter identity; no fictitious replacement.

## 49. Pilot ST — duplicate file upload

Same monthly import file is uploaded twice.

Already processed measurement facts do not create duplicate Readings; corrected/new rows are handled according item semantics.

## 50. Pilot ST — corrected provider file

Provider issues corrected file for same period.

Corrected external information is linked to prior source information. It does not silently overwrite already recognized Readings.

## 51. Pilot ST — outage then backlog

Telemetry unavailable for 6 hours, then sends historical buffered values.

Values retain historical measurement times; reconnect time is not substituted.

## 52. Pilot ST — source sends interval consumption instead of register reading

Provider/API sends 15-minute consumption delta rather than cumulative register value.

Do not recognize it as Reading merely because unit is kWh.

It may belong to Consumption/input semantics of a different process.

## 53. Pilot ST — supplier transformation-loss addition

Supplier sends meter register plus calculated transformation-loss quantity.

Register component may be eligible for Reading recognition; calculated loss component remains supplier settlement input and is not Reading automatically.

## 54. Pilot ST — clock skew

Device timestamp is consistently +2h due to timezone/configuration.

Correction/mapping rule may normalize time if sufficiently justified and versioned. Do not silently alter timestamps without explainable semantics.

## 55. Pilot ST — unknown meter appears in telemetry

New device appears in MQTT/API feed but is not registered/mapped.

No Meter/Accounting Point/Reading is auto-created solely from telemetry.

## 56. Pilot ST — source reports same register each hour

Same cumulative value hourly can represent distinct observations.

Do not deduplicate all equal values solely by number.

## 57. Outcomes

### 57.1. Received and recognized

Input is received, mapped, validated and BP-READING-001 recognizes Reading.

### 57.2. Received but rejected

Input cannot be recognized under applicable semantics; no Reading.

### 57.3. Received but unresolved

Input awaits mapping/conflict/manual resolution; no Reading yet.

### 57.4. Redelivery / duplicate

Input corresponds to already processed same source information/measurement fact; no duplicate Reading.

### 57.5. External correction

Corrected source information is received; domain impact is separately evaluated.

### 57.6. Partial batch success

Some items recognized, others rejected/unresolved without inventing all-or-nothing semantics.

## 58. Provenance

Where materially relevant, automatic import should make determinable:

- integration source/side;
- external source/device identifier;
- external item/event identifier if available;
- raw/external value representation where required;
- source measurement time;
- received time;
- mapping version;
- semantic contract version;
- Meter/Meter Installation/Accounting Point mapping;
- channel/unit/scaling mapping;
- validation result;
- BP-READING-001 recognition outcome;
- resulting Reading identity where recognized;
- redelivery/duplicate relation;
- correction/re-import/re-recognition relation;
- manual resolution basis where applicable.

This is not a universal DB schema.

## 59. Инварианты

1. Automatic receipt/import ≠ Reading.
2. Imported/telemetry Reading uses the same Reading domain model as manual Reading.
3. External device ID ≠ Meter identity.
4. External device ID ≠ Accounting Point identity.
5. Integration source ≠ Subject automatically.
6. Authenticated source ≠ trusted payload automatically.
7. Mapping ≠ domain recognition.
8. Technical validation success ≠ Reading recognition.
9. Current device mapping must not capture historical input automatically.
10. Redelivery ≠ new Reading automatically.
11. Equal value/time ≠ duplicate proof.
12. Re-import ≠ re-recognition.
13. External correction ≠ Reading correction automatically.
14. Mapping correction does not silently rewrite existing Readings.
15. Mapping version change does not silently rewrite history.
16. Unknown device does not auto-create Meter.
17. Unknown device does not auto-create Accounting Point.
18. Unknown device does not auto-create Reading.
19. Missing source data ≠ zero Reading.
20. Source outage ≠ zero Consumption.
21. Backlog after reconnect preserves measurement time.
22. Received order ≠ measurement order.
23. Partial batch success may be valid.
24. Batch filename/hash ≠ identity of each measurement fact.
25. Automatic recognition may occur without Subject under applicable rule.
26. Automated mechanism ≠ Subject.
27. Raw telemetry need not be retained universally.
28. External channel code ≠ domain channel semantics automatically.
29. External unit/scale must be mapped explicitly where needed.
30. Interval consumption value ≠ cumulative Reading automatically.
31. Supplier-calculated transformation-loss quantity ≠ Reading.
32. Same external ID across tenants ≠ same Meter.
33. Unknown technical outcome must not be guessed as success/failure.
34. Provider/source authority is local to integration semantics.
35. Technical retry/idempotency implementation is not defined by this BP.
36. Automatic import does not create Consumption/Accrual automatically.

## 60. Решения internal review

1. Automatic import is a separate integration BP because it owns source/mapping/redelivery/correction semantics, but it does not own Reading identity/recognition rules.
2. No universal Imported Reading or Telemetry Reading entity is introduced.
3. No universal Reading Candidate entity is introduced.
4. Batch, synchronization and streaming are distinct integration modes using one semantic boundary.
5. Partial success is allowed where the concrete integration contract permits it.
6. External device mapping must be historical, not merely current.
7. Automatic recognition without human Subject is valid where rule/semantic contract permits.
8. Source authentication does not imply payload truth.
9. Raw telemetry retention is integration policy, not domain requirement.
10. Re-import and re-recognition remain distinct.
11. Mapping corrections are traceable and do not silently remap recognized Reading history.
12. External correction triggers domain re-evaluation, not automatic overwrite.
13. Unknown devices remain unresolved/rejected; Meter/AP are not auto-created.
14. No universal source priority between telemetry, owner and supplier is introduced.
15. Missing automatic data does not create zero values.
16. Integration-specific channel/register semantics do not require a universal Meter Register entity.
17. REF-METER-002 is fully covered by this BP once accepted and synchronized.

Блокирующих предметных вопросов после internal review не осталось.

## 61. Предварительные нормативные последствия

ADR-011 already contains the fundamental integration semantics.

New ADR and new fundamental entities are not required.

Expected point synchronization:

- ADR-011 — explicit Reading-import mirror note for historical mapping, partial success and correction/re-recognition;
- DOMAIN_MODEL — short integration boundary note;
- TERMINOLOGY — no new fundamental term required, optional clarification in Reading;
- REFERENCE_CANDIDATE_MATRIX — close REF-METER-002 and make control-reading/reconciliation next.

## 62. Следующий шаг

1. perform final consistency check against ADR-007/011 and BP-READING-001;
2. synchronize normative docs;
3. close REF-METER-002;
4. open Draft PR;
5. next: control reading / control observation process, then Control Reconciliation.