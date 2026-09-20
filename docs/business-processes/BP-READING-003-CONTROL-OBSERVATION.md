# BP-READING-003 — Контрольное снятие показаний

**Статус:** Draft
**Контекст:** Ресурсный и инженерный учёт
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий процесс определяет организованное контрольное снятие показаний по заранее определённой области учёта и временному окну.

Контрольное снятие формирует исторически объяснимый набор наблюдений/Reading и информацию о полноте обхода, но само по себе не выполняет Control Reconciliation и не создаёт Calculated Imbalance.

Базовая последовательность:

```text
control scope + expected Accounting Points + time window
→ planned/actual observation effort
→ observed/reported values
→ BP-READING-001 recognition
→ recognized control Readings + missing/unresolved points
→ completeness / quality context
→ later Control Reconciliation
```

## 2. Ключевые границы

```text
Control Observation
≠ Reading
≠ set of all Readings
≠ Control Reconciliation
≠ Calculated Imbalance
≠ Operational Loss
```

Контрольное снятие — это процесс получения/фиксации данных в определённой области, а Reading остаётся самостоятельным признанным фактом.

## 3. Что входит

- определение контрольной области;
- expected Accounting Points;
- applicable topology context;
- контрольное временное окно;
- planned/actual observation time;
- acting person/team where applicable;
- доступность точки;
- observed values;
- recognition через BP-READING-001;
- missing/unresolved values;
- причины пропуска where known;
- replacement/gap context;
- completeness;
- provenance;
- correction of observation record.

## 4. Что не входит

- расчёт Consumption;
- Control Reconciliation;
- Calculated Imbalance;
- Operational Loss recognition;
- финансовые последствия;
- автоматический импорт как transport process;
- universal route/field-service workflow;
- Work Order;
- universal inspection entity;
- UI/map/navigation.

## 5. Control scope

Control scope определяет, какие Accounting Points ожидаются в конкретном контрольном снятии.

Scope может быть задан через:

- инженерную ветвь;
- часть topology;
- улицу как пилотную организационную метку, если она соответствует нужной области;
- набор Accounting Points;
- группу объектов;
- другую предметно обоснованную область.

Scope не превращается автоматически в ownership hierarchy или fixed tree.

## 6. Expected Accounting Points

До или во время контрольного снятия должен быть объясним expected set Accounting Points.

```text
expected points
≠ actually observed points
```

Отсутствующая точка должна оставаться видимой как missing/not observed, а не исчезать из набора.

## 7. Expected set и историческая topology

Expected set должен соответствовать topology/relations, применимым к контрольному окну.

Current topology не должна молча использоваться для historical control observation, если сеть была изменена.

## 8. Observation window

Контрольное снятие выполняется в предметно определённый временной срез или окно.

Абсолютно одновременные readings не требуются.

```text
control window
≠ single exact timestamp necessarily
```

Window должен быть достаточно узким для последующего сопоставления согласно применимому reconciliation process.

## 9. Planned time ≠ actual measurement time

План обхода или назначенная дата не являются measurement time.

Каждый Reading сохраняет собственное measurement time/precision по BP-READING-001.

## 10. Manual control observation

Типовой сценарий:

```text
authorized technician / commission member
→ observes Meter
→ captures value/evidence
→ BP-READING-001
→ control Reading
```

Статус контрольного Reading определяется process provenance/role, а не отдельным фундаментальным типом Reading.

## 11. Automated value inside control observation

Контрольное снятие может использовать автоматическое значение, если оно попадает в нужное окно и допустимо правилами.

```text
telemetry Reading
→ may participate in control observation
```

Это не превращает telemetry в control truth автоматически.

## 12. Owner-provided value inside control window

Owner-reported Reading может быть доступен в том же окне.

Его наличие не означает, что точка считается контрольным образом проверенной, если policy требует независимое observation.

Но конкретный policy может разрешать использование такого Reading как substitute/participating input.

## 13. Control Reading не отдельная fundamental entity

Не вводится сущность Control Reading.

Контрольный характер определяется relation/context:

```text
Reading
+ participation in control observation
→ control-role Reading in this process
```

## 14. Acting person / team

Контрольное снятие может выполнять один человек или группа.

Не вводится universal Control Commission entity.

Where relevant, сохраняются acting Subject(s), User Account/access context и authority/basis.

## 15. Authority

Technical ability to enter a value ≠ authority to perform/recognize control observation.

Применимое сообщество определяет, кто вправе выполнять контрольное снятие.

## 16. Unavailable Accounting Point

Причины отсутствия observation могут включать:

- нет доступа;
- Meter недоступен;
- объект закрыт;
- Meter повреждён;
- точка временно без Meter;
- значение не читается;
- иное.

Missing observation не заменяется fictitious Reading.

## 17. Access denied / no access

Если контролёр не смог получить доступ, это operational outcome конкретной точки.

```text
no access
≠ zero Reading
≠ previous Reading copied automatically
```

## 18. Meter removed/replaced within window

Если Meter replacement происходит в control window, могут участвовать:

- old final Reading;
- new initial Reading;
- later new-Meter Reading;
- missing interval.

Control observation не должна смешивать old/new Meter Installation.

## 19. Point without active Meter

Accounting Point может существовать без active Meter Installation.

Такая точка остаётся expected, если входит в scope, но meter-based Reading для неё не выдумывается.

## 20. Multi-channel Meter

Для day/night или других channels completeness может оцениваться отдельно по materially required channels.

Наличие одного channel value не означает автоматически полноту Meter observation.

## 21. Evidence

Control observation может сопровождаться:

- фото;
- актом;
- подписью;
- geolocation metadata where allowed;
- device timestamp;
- комментариями.

Evidence не заменяет Reading и не определяет measurement time автоматически.

## 22. Photo

Photo may support:

- Meter identity;
- displayed value;
- seal/state;
- context;
- observed time evidence.

Photo timestamp ≠ factual measurement time automatically.

## 23. Duplicate observations

Два контролёра могут независимо снять одно и то же значение.

Это не обязательно duplicate.

Если observations самостоятельны, BP-READING-001 может признать несколько Readings.

## 24. Conflicting control observations

Если control observations конфликтуют, process не выбирает latest/largest автоматически.

Conflict остаётся явным и передаётся на applicable resolution/reconciliation logic.

## 25. Same-day non-simultaneous values

Для пилотного СТ показания могут сниматься в течение 1–2 часов.

Такое окно допустимо как operational policy, если дальнейшая Control Reconciliation явно учитывает несовпадение времени и ограничения качества.

Настоящий BP не фиксирует universal 1–2 hour tolerance для всех Community.

## 26. Completeness

После контрольного снятия должна быть объяснима полнота относительно expected set.

Минимально различаются:

- expected;
- observed/recognized;
- observed but unresolved/rejected;
- not observed;
- excluded on explicit basis.

## 27. Exclusion

Accounting Point может быть исключена из конкретного observation scope только на explicit basis.

Exclusion не должна использоваться для скрытия missing data.

## 28. Completeness ≠ data quality

100% observed points не означает, что все Reading качественные.

И наоборот, неполная coverage не делает признанные Reading недействительными.

## 29. Quality limitations

Могут быть существенны:

- wide observation window;
- inconsistent timestamps;
- missing channels;
- changed topology;
- replacement during window;
- substitute values;
- unresolved conflicts.

Quality limitations должны быть доступны downstream reconciliation.

## 30. Correction of observation record

Если позднее выясняется, что point была ошибочно отмечена missing/observed/excluded, correction сохраняется прослеживаемо.

Это не переписывает Reading автоматически.

## 31. Reading correction

Если control Reading исправляется, применяется BP-READING-001 correction semantics.

Observation completeness/result revalidates separately.

## 32. Control observation correction ≠ Reading correction

Ошибочная отметка участия точки и ошибочное значение Reading — разные corrections.

## 33. Late evidence

Фото/акт может поступить после завершения обхода.

Late evidence может подтвердить observation/Reading, но не переносит measurement time на дату загрузки.

## 34. Pilot ST — street reconciliation preparation

Street/group scope:

```text
street/group meter
+ individual plot Accounting Points
→ control observation window
```

Control observation собирает available Reading и completeness, но ещё не считает difference.

## 35. Pilot ST — several independent electricity branches

Если в СТ несколько независимых branches/general meters, каждое control observation scope должно явно указывать нужную topology area.

Readings из другой branch не подмешиваются автоматически.

## 36. Pilot ST — transformer branches

Если одна улица/группа питается через определённую engineering branch, expected set определяется topology, а не только названием улицы.

## 37. Pilot ST — pump/common meter

Pump/common-use Accounting Point может участвовать в control observation как отдельная point, если входит в balance scope.

Её Reading не является individual consumption.

## 38. Pilot ST — water

Для water контрольное снятие использует ту же process model.

Resource-specific precision/access rules могут отличаться.

## 39. Pilot ST — missing plot reading

Если один plot Meter недоступен:

```text
expected = yes
observed = no
```

Control observation остаётся неполным; later Control Reconciliation должна видеть missing point.

## 40. Pilot ST — replacement during control day

Old Meter removed morning, new Meter installed afternoon.

Control observation сохраняет оба installation contexts и не сравнивает значения как один register.

## 41. Pilot ST — telemetry used for one point

Если один group meter имеет reliable telemetry Reading в окне, а остальные снимаются вручную, observation может использовать mixed acquisition sources.

Source heterogeneity не создаёт разные Reading types.

## 42. Pilot ST — owner value differs from control observation

Owner Reading и control observation могут конфликтовать.

Control observation не исправляет owner Reading автоматически.

Conflict становится input дальнейшего resolution/reconciliation.

## 43. Pilot ST — no exact common timestamp

Readings сняты с 09:00 до 10:40.

Observation сохраняет actual measurement times и window.

Не создаётся fictitious common timestamp 10:00.

## 44. Pilot ST — excluded disconnected plot

Plot physically disconnected and explicitly excluded from this balance scope under applicable topology/policy.

Exclusion must have basis; it is not the same as missing observation.

## 45. Outcomes

### 45.1. Complete observation

All expected points sufficiently observed/recognized according applicable policy.

### 45.2. Partial observation

Some expected points missing/unresolved/rejected.

### 45.3. Observation with exclusions

Some points explicitly excluded on sufficient basis.

### 45.4. Observation requiring resolution

Conflicts/topology/replacement issues prevent reliable completeness interpretation.

## 46. Provenance

Where materially relevant, should be determinable:

- observation identity;
- scope/area;
- expected point set/basis;
- topology/version/context;
- observation window;
- acting Subject(s);
- authority/basis;
- participating Reading identities;
- per-point outcome;
- missing/exclusion reason;
- evidence;
- corrections;
- quality limitations.

## 47. Инварианты

1. Control Observation ≠ Reading.
2. Control Observation ≠ Control Reconciliation.
3. Control Observation ≠ Calculated Imbalance.
4. Control-role Reading is ordinary Reading with process context.
5. Expected points ≠ observed points.
6. Missing point must remain visible.
7. Missing observation ≠ zero Reading.
8. No access ≠ previous Reading copied automatically.
9. Excluded point ≠ missing point.
10. Exclusion requires explicit basis.
11. Current topology must not silently replace historical topology.
12. Control window ≠ exact common timestamp.
13. Each Reading keeps actual measurement time/precision.
14. 100% completeness ≠ perfect quality.
15. Partial observation does not invalidate recognized Readings.
16. Control Reading does not automatically override owner Reading.
17. Telemetry Reading does not automatically override manual Reading.
18. Conflicting observations are not resolved by latest/largest rule.
19. Meter replacement within window preserves old/new installation distinction.
20. Point without Meter may remain expected without fictitious Reading.
21. Multi-channel completeness may require multiple channel values.
22. Evidence ≠ Reading.
23. Photo timestamp ≠ measurement time automatically.
24. Observation correction ≠ Reading correction.
25. Reading correction requires separate observation revalidation where relevant.
26. Control observation does not create Consumption automatically.
27. Control observation does not create Calculated Imbalance automatically.
28. Control observation does not create Operational Loss automatically.
29. Control observation does not create Accrual automatically.
30. Universal route/inspection/work-order entity is not introduced.

## 48. Решения internal review

1. A standalone control-observation process is justified because it owns expected scope, completeness and observation provenance not owned by BP-READING-001.
2. No new Control Reading fundamental entity is needed.
3. No universal Inspection/Route/Commission entity is needed.
4. Observation identity is useful as a historical process result/referent for downstream Control Reconciliation.
5. Exact simultaneity is not required; applicable observation window/policy controls quality.
6. Expected Accounting Points must be explicit/explainable.
7. Missing, excluded and unresolved outcomes remain distinct.
8. Mixed manual/telemetry sources are allowed.
9. Control observation does not resolve Reading conflicts universally.
10. Control observation does not calculate imbalance.
11. Replacement/topology changes inside window remain explicit quality/context facts.
12. Pilot-ST 1–2 hour observation window is local practice, not universal invariant.

Блокирующих предметных вопросов после internal review не осталось.

## 49. Нормативная синхронизация

Новый ADR и новые fundamental measurement entities не требуются.

В текущей Draft-ветке выполнена точечная синхронизация:

- ADR-007 — explicit Control Observation ≠ Control Reconciliation, expected/completeness semantics, missing/excluded points и observation window;
- DOMAIN_MODEL → 0.22 — Control Observation добавлен как исторически значимый process/referent, participating values остаются обычными Reading;
- TERMINOLOGY → 0.19 — добавлен термин Control Observation; соседние локальные подпункты 64.x перенумерованы;
- REFERENCE_CANDIDATE_MATRIX — REF-METER-003 переведён в Partial: control observation закрыто, Control Reconciliation остаётся следующим BP.

BP-READING-001/002 не требуют изменения: recognition и automatic intake semantics уже достаточны.

## 50. Текущее состояние и следующий шаг

BP прошёл internal consistency review against ADR-007 and BP-READING-001/002.

Проверены expected scope, historical topology, manual/telemetry mix, missing/excluded/unresolved points, multi-channel values, replacement in observation window, no-access, evidence/photo timing, duplicate/conflict и pilot-ST 1–2 hour operational window.

Блокирующих предметных вопросов после internal review не осталось.

Следующий процесс Stage 7 после принятия/merge BP-READING-003:

**BP-RECON-001 — Control Reconciliation**.

Он должен использовать Control Observation/Reading inputs, explicit topology/window/completeness and produce reconciliation result including Calculated Imbalance where applicable, но не превращать imbalance в Operational Loss автоматически.

После него — отдельный process Calculated Imbalance semantics where needed / Operational Loss recognition.

Дополнительный внешний review BP-READING-003 сейчас не инициируется.
