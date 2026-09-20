
# BP-READING-001 — Приём и признание показания

**Статус:** Draft  
**Контекст:** Ресурсный и инженерный учёт  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет, как наблюдаемое, сообщённое, импортированное или иным образом полученное количественное значение может стать предметно признанным Reading Community OS.

Ключевая модель:

~~~text
observed / reported / received value
→ identification / mapping
→ validation
→ applicable authority / recognition rule
→ recognized Reading
   OR unresolved / rejected value
→ later Consumption / reconciliation processes where applicable
~~~

Главная граница:

~~~text
received value
≠ Reading
≠ Consumption
≠ Accrual
≠ Financial Obligation
~~~

BP не предполагает, что любое число от Meter, пользователя, файла или телеметрии автоматически становится Reading.

## 2. Нормативная основа

BP развивает уже принятые решения ADR-007, ADR-010 и ADR-011:

- Reading — предметно признанное значение;
- observed/received value и Reading различаются;
- external/telemetry value требует validation/mapping/domain recognition;
- automated source не является Subject;
- technical access ≠ предметное полномочие;
- Reading ≠ Consumption;
- correction source data ≠ recalculation derived result;
- Meter replacement сохраняет installation context и не переносит Reading между Meter.

Новый универсальный Measurement Event не вводится.

## 3. Что входит в процесс

BP охватывает:

- ручное наблюдение;
- сообщение значения пользователем/собственником/уполномоченным лицом;
- контрольное снятие как источник входного значения;
- значение поставщика;
- значение из файла/import flow;
- значение из API/телеметрии после integration mapping;
- идентификацию Accounting Point / Meter / Meter Installation;
- measurement semantics / channel where materially relevant;
- measurement time и temporal precision;
- unit;
- validation;
- recognition/rejection/unresolved outcome;
- authority / recognition rule;
- duplicate / redelivery;
- conflicting values;
- late/out-of-order value;
- correction recognized Reading;
- provenance;
- quality limitations where applicable.

## 4. Что не входит

BP не определяет:

- transport/API/MQTT/Modbus/АСКОЕ;
- batch-import UX;
- Meter replacement;
- универсальную формулу Consumption;
- Calculated Imbalance;
- Control Reconciliation;
- Operational Loss recognition;
- финансовое начисление;
- тарификацию;
- Payment/Obligation;
- универсальный confidence score;
- универсальный lifecycle/state machine Reading;
- universal Measurement Event;
- universal Meter Register entity;
- структуру БД/API/UI.

Автоматический импорт показаний будет отдельным process поверх настоящего recognition BP.

## 5. Reading как признанный предметный факт

Reading — не строка формы, не сообщение и не telemetry sample.

Для признанного Reading должна существовать достаточная предметная семантика, позволяющая понять:

- что измерено;
- к какой Accounting Point относится значение;
- к какому Meter / Meter Installation относится значение, если измерение выполняется конкретным Meter;
- value;
- unit либо иная достаточная measurement semantics;
- measurement time / applicable temporal precision;
- provenance;
- basis/recognition rule where materially relevant.

Это не означает один универсальный обязательный набор полей для всех ресурсов и Meter.

## 6. Reading identity

Recognized Reading имеет собственную исторически различимую предметную identity.

Её нельзя определять только как:

~~~text
Accounting Point + date + numeric value
~~~

или:

~~~text
Meter serial + value
~~~

Совпадающие значения могут относиться к разным measurement facts, channels, времени или источникам.

Одновременно повторная доставка сведений об одном и том же факте не должна создавать новый Reading автоматически.

Reading identity и duplicate resolution определяются sufficient provenance и предметным смыслом конкретного measurement fact; universal hash/idempotency key не вводится.

## 7. Received value не является новой universal entity

BP может работать со значением, которое:

- увидел человек;
- сообщил пользователь;
- передал поставщик;
- прислал внешний сервис;
- передал Meter/шлюз;
- содержит документ;
- содержит CSV/XLS;
- получено при обходе.

Не требуется вводить универсальные Reading Candidate, Measurement Submission, Meter Message или Imported Reading Row.

Конкретный intake/integration process может хранить технические сведения о получении, но предметная модель признаёт Reading только после соответствующей проверки.

## 8. Accounting Point

Reading относится к Accounting Point как устойчивой предметной границе учёта.

Meter replacement не меняет Accounting Point автоматически.

Если входное значение содержит только Meter serial/device ID, этого недостаточно для автоматического вывода Accounting Point без надёжного mapping к historically applicable Meter Installation.

## 9. Meter и Meter Installation

Для meter-based Reading должна быть достаточно определима Meter Installation, к которой относится measurement time.

~~~text
Reading measurement time
→ applicable Meter Installation
→ Accounting Point
~~~

Нельзя привязывать historical Reading к текущему Meter только потому, что значение введено сегодня.

Late Reading может относиться к уже завершённой Meter Installation.

## 10. Reading без конкретного Meter

Не вся предметная measurement semantics обязана фундаментально требовать Meter identity.

Если применимый процесс допускает признанное значение непосредственно относительно Accounting Point или другого достаточного измерительного основания без конкретного Meter, Reading может быть признан без фиктивного Meter.

Однако для обычного meter-based сценария пилотного СТ Meter Installation должна быть определима.

## 11. Значение на границе замены Meter

Boundary Reading, признанный в BP-METER-001, использует ту же семантику Reading.

Значение в момент снятия/установки относится к old или new Meter Installation согласно фактическому measurement context.

Old final Reading не переносится в new Meter.

## 12. Measurement semantics / channel

Некоторые Meter дают несколько materially distinct values:

- day/night;
- import/export;
- phases;
- registers;
- другие channels.

Reading должен иметь достаточный context, чтобы значение можно было интерпретировать.

Настоящий BP не создаёт универсальную Meter Register entity.

Если channel semantics предметно значима, она сохраняется в достаточной форме конкретного resource/meter process.

## 13. Unit

Одного числа недостаточно.

Reading должен иметь определимую unit либо иную достаточную measurement semantics.

Число 12540 без понимания, например, kWh, m³ или применимого scaled register недостаточно для recognition.

Unit Reading не обязана совпадать с unit будущего Consumption.

## 14. Raw register value и conversion

Reading может представлять raw register value либо уже интерпретированное значение, если applicable semantics это допускает.

Если для понимания Reading нужен coefficient/scaling/conversion, должно быть объяснимо:

- относится ли коэффициент к Meter;
- Meter Installation;
- Rule;
- external representation.

Нельзя молча применять текущий coefficient к historical Reading.

Raw и converted representation не обязаны быть двумя самостоятельными Readings, если это две формы одного признанного measurement fact.

## 15. Measurement time

Reading имеет предметно значимое measurement time либо достаточную temporal precision.

~~~text
measurement time
≠ reported time
≠ received time
≠ recognition time
≠ record time
~~~

Если известна только дата, нельзя изобретать точное время.

## 16. Applicable period ≠ measurement time

Иногда значение сообщается как показание за месяц либо относится к контрольному окну.

Period/context может быть важен, но не заменяет measurement time автоматически.

Если точный момент неизвестен, сохраняется реальная temporal precision/semantics, а не искусственный timestamp.

## 17. Manual observation

Уполномоченное лицо может непосредственно снять значение Meter.

~~~text
physical observation
→ validation/context
→ recognition
→ Reading
~~~

Факт наблюдения человеком не гарантирует корректность автоматически; Meter identity, installation, unit/time и authority могут требовать проверки.

## 18. Owner/user reported value

Собственник, пользователь или иное лицо может сообщить значение.

~~~text
reported value
≠ Reading automatically
~~~

Должны различаться:

- Subject, которым/от имени которого сообщено значение;
- User Account, через который выполнено действие;
- technical access;
- предметное основание/полномочие сообщить данные;
- recognition rule.

Ownership само по себе не обязано давать любое resource authority; Access Grant не создаёт его автоматически.

## 19. Unknown/unverified reporter

Если значение получено, но reporter не может быть надёжно установлен, это не обязательно означает, что физически значение неверно.

Однако система не должна подменять неизвестного reporter фиктивным Subject.

Recognition зависит от applicable rule и достаточности других evidence.

## 20. Supplier-provided value

Поставщик может сообщить meter value либо supplier-side settlement value.

Эти понятия нельзя смешивать.

~~~text
supplier-provided meter value
→ may become Reading after recognition

supplier-calculated settlement quantity
≠ Reading automatically
~~~

Например, расчётная добавка трансформационных потерь поставщика из BP-EXPENSE-001 не является Meter Reading только потому, что выражена в kWh.

## 21. Imported value

CSV/XLS/API row не является Reading.

~~~text
external representation
→ mapping
→ validation
→ domain recognition
→ Reading where accepted
~~~

Ошибочная строка не должна создавать fictitious Reading ради успешного завершения batch.

## 22. Telemetry value

Telemetry sample:

~~~text
≠ Reading automatically
≠ Consumption
~~~

Автоматическое recognition допустимо, если applicable rule/semantic contract позволяет надёжно выполнить identification, mapping, validation и recognition.

Это не делает automated system Subject.

## 23. Validation layers

Следует различать:

1. representation/format validation;
2. mapping/identity validation;
3. resource/measurement semantic validation;
4. subject-matter recognition/admissibility.

Например, числовое значение может быть технически валидным JSON, но относиться к неизвестному external device ID.

Или Meter может быть известен, но measurement time попадать вне его Meter Installation interval.

## 24. Recognition rule

Recognition может быть:

- явным действием уполномоченного Subject;
- автоматическим по applicable rule;
- результатом специализированного process.

Ни UI action, ни import, ни telemetry receipt сами по себе не являются recognition rule.

Если rule/version materially влияет на acceptance, она должна быть исторически определима согласно ADR-005.

## 25. Accepted Reading

При successful recognition возникает Reading с собственной domain identity и sufficient provenance.

Recognition Reading:

- не создаёт Consumption автоматически;
- не выбирает tariff;
- не создаёт Accrual;
- не создаёт Financial Obligation.

Downstream processes используют Reading как input.

## 26. Rejected value

Полученное/сообщённое значение может быть rejected.

Причины могут включать:

- невозможно определить Accounting Point;
- невозможно определить Meter Installation в meter-based case;
- несовместимая unit;
- measurement time вне допустимого context;
- недостаточное authority/basis;
- invalid/out-of-domain value;
- конфликт, который нельзя разрешить автоматически.

Rejected value не становится Reading.

Исторически значимый rejection может сохранять достаточный provenance; universal Rejection entity не вводится.

## 27. Unresolved value

Иногда данных недостаточно для recognition или окончательного rejection.

Например:

- известен Meter serial, но ambiguous mapping;
- неясно measurement time;
- два источника сообщают разные values;
- временно отсутствует подтверждение authority.

Такое значение может оставаться unresolved в owning intake/integration process.

Unresolved value ≠ Reading.

BP не вводит универсальный статусный workflow для всех каналов.

## 28. Value lower than previous Reading

Новое числовое значение меньше предыдущего не означает автоматически ошибку.

Возможные причины:

- Meter replacement;
- register rollover/wrap;
- reset;
- другой channel;
- correction prior Reading;
- ошибочный value.

~~~text
new value < previous value
≠ invalid automatically
≠ negative Consumption automatically
~~~

Recognition требует applicable context.

## 29. Value equal to previous Reading

Одинаковое значение может означать:

- отсутствие изменения;
- повторное наблюдение;
- duplicate;
- отдельный Reading в другой момент;
- problem/stuck Meter.

Равенство чисел не доказывает duplicate.

## 30. Large jump / anomaly

Аномальный скачок может быть основанием:

- warning;
- дополнительной проверки;
- unresolved outcome;
- rejection по explicit rule;
- recognition с quality limitation where applicable.

Аномальность не должна автоматически переписывать прошлое или создавать Operational Loss.

## 31. Future-dated / implausible time

Если measurement time противоречит допустимому предметному времени, значение не признаётся молча.

Technical clock skew, timezone/mapping issue или ошибочный ввод могут требовать resolution/correction.

BP не вводит universal tolerance window.

## 32. Late Reading

Reading может быть признан спустя значительное время после measurement time.

~~~text
measurement time < recognition time
~~~

Late recognition не переносит Reading на дату ввода.

Reading может относиться к historical Meter Installation.

## 33. Out-of-order Reading

Более поздно полученное значение может иметь более ранний measurement time, чем уже существующие Readings.

~~~text
receipt order
≠ measurement-time order
~~~

История не должна предполагать, что последний введённый Reading является самым поздним по предметному времени.

## 34. Current Reading projection

Текущее/последнее показание является projection/read model, а не отдельным source-of-truth фактом.

Какой Reading считается current/latest зависит от:

- measurement semantics;
- measurement time;
- channel;
- correction state/relations;
- applicable projection rule.

Record creation order сам по себе недостаточен.

## 35. Duplicate / redelivery

Повторная доставка одного external/report event не создаёт новый Reading автоматически.

Но совпадение value/date/Meter/reporter не является достаточным универсальным доказательством duplicate.

Используются provenance и semantic identity исходной информации/measurement fact.

## 36. Несколько источников сообщают одинаковое значение

Owner report и telemetry могут сообщить одинаковое число.

В зависимости от evidence они могут:

- подтверждать один measurement fact;
- представлять два самостоятельных observations;
- один быть redelivery/duplicate другого;
- иметь разные measurement times.

BP не вводит automatic merge solely by numeric equality.

## 37. Conflicting values

Для одной Accounting Point/Meter Installation и близкого measurement context могут быть получены разные values.

~~~text
reported 12540
control observation 12570
~~~

Нельзя автоматически выбрать последнее или большее.

Applicable process/rule должен определить:

- можно ли признать одно;
- остаются ли оба evidence;
- требуется ли correction;
- требуется ли control/reconciliation process.

Conflicting received values не обязаны становиться двумя одновременно effective Readings одного measurement fact.

## 38. Несколько признанных Readings в один день

Универсальная уникальность one Reading per Accounting Point per day не вводится.

Допустимы:

- разные measurement times;
- разные channels;
- контрольное и обычное observation;
- начало/конец installation;
- другие materially distinct contexts.

Конкретные ограничения определяет resource/process semantics.

## 39. Correction recognized Reading

Если признанное Reading позднее признано ошибочным, оно не переписывается/удаляется молча.

Сохраняются:

- original Reading;
- correction basis;
- corrected/replacement recognized value where applicable;
- correction/recognition time;
- provenance;
- downstream recalculation links where materially important.

Универсальная Correction entity не вводится.

## 40. Correction ≠ new observation

Исправление typo/неверной интерпретации старого fact и новое физическое измерение — разные semantics.

~~~text
correction of Reading
≠ later new Reading
~~~

Не следует изображать correction как новое измерение сейчас.

## 41. Source correction

Если внешний provider/integration исправляет ранее переданную информацию:

~~~text
external correction
≠ Reading correction automatically
~~~

Resource context заново оценивает domain impact согласно ADR-011.

Ранее признанное Reading не переписывается молча.

## 42. Reading correction and Consumption

Correction Reading может потребовать перерасчёт Consumption.

Но:

~~~text
Reading correction
≠ automatic silent Consumption rewrite
~~~

Consumption owning process создаёт отдельный traceable recalculation/result where required.

## 43. Reading correction and finance

Даже если corrected Consumption меняет начисление:

~~~text
Reading correction
→ resource recalculation
→ financial recalculation/correction
~~~

Каждый шаг принадлежит своему owning context/process.

Reading correction не изменяет Accrual/Financial Obligation напрямую.

## 44. Reading without Consumption

Reading может существовать без немедленного Consumption.

Например:

- контрольное промежуточное Reading;
- boundary Reading при замене;
- диагностика;
- Reading внутри периода;
- значение общего Meter.

Не любой Reading автоматически порождает Consumption.

## 45. Consumption without direct pair of Readings

Согласно ADR-007 Consumption может быть установлен по Reading, calculation, estimate, norm, substitute data или иному sufficient basis.

Поэтому:

~~~text
Consumption
≠ mandatory difference of exactly two Readings
~~~

Настоящий BP не определяет Consumption formula.

## 46. Pilot ST — owner submits electricity Reading

Owner/user сообщает:

~~~text
AP-Plot-42
Meter M2
Reading 12540 kWh
measurement date 25 Sep
~~~

System validates applicable permission, AP/Meter Installation mapping, unit, measurement time, value semantics и duplicate/conflict conditions.

После recognition возникает Reading.

Accrual за электроэнергию не возникает самим этим действием.

## 47. Pilot ST — owner has two Accounting Points

Один участок может иметь основной ввод и отдельную Accounting Point другого места потребления.

~~~text
AP-A Reading = 400
AP-B Reading = 80
~~~

Readings сохраняются раздельно.

Consumption/financial aggregation принадлежит downstream rules.

## 48. Pilot ST — general/street Meter

Reading общего/группового/промежуточного Meter признаётся для соответствующей Accounting Point.

Его роль не делает Reading отдельным типом и не создаёт Calculated Imbalance автоматически.

Control Reconciliation — отдельный process.

## 49. Pilot ST — water Reading

Для water Meter применяется та же recognition model.

Resource-specific unit/precision/rollover semantics могут отличаться, но не требуют отдельной fundamental Reading entity.

## 50. Pilot ST — two-zone Meter

Пользователь сообщает day/night values.

Если оба channels materially distinct, каждый value должен сохранять достаточную channel semantics.

Их нельзя складывать или переставлять местами на intake без applicable rule.

Financial tariff usage остаётся downstream policy.

## 51. Pilot ST — late old-Meter Reading after replacement

После Meter replacement сегодня поступает Reading, реально снятый вчера со старого Meter.

Если measurement time попадает в old Meter Installation и evidence достаточен:

~~~text
late receipt today
→ Reading of old installation yesterday
~~~

Нельзя привязывать его к new Meter только потому, что new Meter сейчас current.

## 52. Pilot ST — owner reports wrong Meter

User случайно выбирает AP-B, но photo/evidence/value относится к AP-A.

До resolution значение не должно создавать Reading для AP-B.

Correction mapping/intake ≠ Reading correction, если Reading ещё не был признан.

## 53. Pilot ST — control reading differs from owner report

Owner reports 12540; technician control observation близко по времени says 12570.

Ни последнее, ни control value не побеждает универсально.

Applicable control process/rules определяют recognition/correction consequences.

## 54. Pilot ST — telemetry and manual value

Telemetry gives 10012 at 12:00; manual observation gives 10012 at 12:05.

Numeric equality alone does not prove duplicate.

Они могут быть independent observations with different measurement times.

## 55. Pilot ST — supplier settlement quantity

Supplier invoice содержит measured settlement volume плюс transformation-loss coefficient.

Calculated supplier volume:

~~~text
≠ Reading
~~~

если соответствующий компонент не является фактическим recognized meter value с достаточным context.

## 56. Pilot ST — lower value after replacement

Old Meter last Reading 18452.

New Meter initial 17, later 120.

~~~text
120 < 18452
~~~

не означает negative Consumption, потому что values принадлежат разным Meter Installations.

## 57. Pilot ST — date known, exact time unknown

Owner states Meter was read on 25 Sep, exact time unknown.

Reading может использовать date-level temporal precision, если этого достаточно applicable process.

System не изобретает 00:00 или 12:00 как factual measurement time.

## 58. Pilot ST — incorrect Reading already used financially

Recognized Reading 12540 был использован для Consumption и Accrual.

Позже sufficient evidence устанавливает correct Reading 12450.

~~~text
original Reading preserved
→ Reading correction
→ Consumption recalculation where required
→ Accrual recalculation/correction where required
~~~

No silent update cascade.

## 58.1. Pilot ST — photo timestamp differs from declared reading time

Owner submits a meter photo taken at 18:42 but manually declares measurement time 18:00.

Photo metadata, declared time and received time are different evidence. Community OS must not silently replace one with another. Applicable recognition rules decide which temporal fact is sufficiently supported.

## 58.2. Pilot ST — decimal precision / display semantics

Water or electricity meter may expose decimals or scaled digits.

~~~text
displayed digits
≠ universally assumed engineering unit/precision
~~~

Recognition preserves applicable unit/scale semantics; truncation or rounding belongs to explicit resource/rule semantics, not implicit UI formatting.

## 58.3. Pilot ST — estimated value supplied instead of physical observation

Supplier/operator provides an estimated or substitute value for a period without a physical meter observation.

Such value does not become Reading merely because it resembles a reading. It may remain substitute/calculated input for Consumption or settlement under the owning process.

## 58.4. Pilot ST — value during an unmetered gap

Accounting Point has no active Meter Installation between replacement intervals. A meter-based value reported for that gap cannot be mapped to a fictitious Meter Installation.

If another legitimate measurement basis exists, it may be recognized under its own semantics; otherwise input stays rejected/unresolved.

## 59. Outcomes

### 59.1. Recognized

Value sufficiently identified, validated and recognized → Reading exists.

### 59.2. Rejected

Value cannot/should not be recognized under applicable semantics → no Reading.

### 59.3. Unresolved

Recognition cannot yet be determined → no Reading until resolution.

### 59.4. Duplicate / redelivery

Input refers to already processed same underlying information/measurement fact → no additional Reading unless subject-matter semantics indicates distinct observation.

### 59.5. Correction

Existing recognized Reading is historically corrected/replaced/qualified on sufficient basis; original Reading remains explainable.

## 60. Provenance

For recognized Reading, where materially relevant, should be determinable:

- Reading identity;
- Resource;
- Accounting Point;
- Meter;
- Meter Installation;
- measurement semantics/channel;
- value;
- unit;
- raw vs interpreted representation where meaningful;
- measurement time / temporal precision;
- reported/transmitted/received time where meaningful;
- source;
- reporting Subject where applicable;
- acting User Account/access context where applicable;
- recognition Subject or automatic rule/process;
- basis/Rule Version where applicable;
- integration source/external identifier where applicable;
- evidence/document/photo where applicable;
- duplicate/conflict/correction relationships;
- known quality limitations.

Это список предметной объяснимости, а не universal DB schema.

## 61. Инварианты

1. Received/observed value ≠ Reading.
2. Reading ≠ Consumption.
3. Reading ≠ Accrual.
4. Reading ≠ Financial Obligation.
5. Telemetry sample ≠ Reading automatically.
6. CSV/XLS/API row ≠ Reading automatically.
7. Supplier settlement quantity ≠ Reading automatically.
8. Reading recognition belongs to resource context.
9. Automated system ≠ Subject.
10. User Account ≠ reporting Subject automatically.
11. Technical access ≠ предметное authority automatically.
12. Ownership ≠ universal Reading-submission authority.
13. Reading must have sufficient measurement semantics, not only numeric value.
14. Reading measurement time ≠ received/record/recognition time.
15. Limited temporal precision must not be replaced by fictitious precision.
16. Historical meter-based Reading maps to historically applicable Meter Installation.
17. Current Meter must not capture late historical Reading automatically.
18. Meter replacement does not transfer Reading history to new Meter.
19. Old final Reading ≠ new initial Reading.
20. Multi-channel values require sufficient channel semantics.
21. Unit must be sufficiently determinable.
22. Current coefficient must not be applied retroactively automatically.
23. Value lower than previous ≠ invalid automatically.
24. Value lower than previous ≠ negative Consumption automatically.
25. Equal numeric value ≠ duplicate automatically.
26. Large jump ≠ Operational Loss automatically.
27. Latest recorded Reading ≠ latest measurement-time Reading automatically.
28. Current Reading is projection, not separate source-of-truth entity.
29. Duplicate/redelivery does not create Reading automatically.
30. Same Meter/date/value ≠ universal duplicate proof.
31. Conflicting values are not resolved by latest/largest universal rule.
32. Universal one-Reading-per-day constraint is not introduced.
33. Rejected/unresolved input ≠ Reading.
34. Correction does not silently rewrite original Reading.
35. Reading correction ≠ new observation.
36. External source correction ≠ Reading correction automatically.
37. Reading correction ≠ silent Consumption rewrite.
38. Reading correction ≠ direct financial correction.
39. Reading may exist without Consumption.
40. Consumption may exist without exactly two Readings.
41. General/group/control role does not create separate Reading type.
42. Reading recognition does not create Calculated Imbalance automatically.
43. Reading recognition does not create Operational Loss automatically.
44. Reading recognition does not create Accrual automatically.
45. Numeric equality across telemetry/manual sources does not prove same measurement fact.
46. Supplier-calculated transformation-loss quantity ≠ Reading.
47. Fake Subject must not be created for unknown reporter.
48. Recognition rules/versions remain explainable where materially significant.
49. Reading need not universally require Meter identity if applicable measurement semantics is not meter-based.
50. Raw and converted representation do not automatically create two Reading identities.
51. Photo/document metadata ≠ measurement time automatically.
52. Display precision/format ≠ resource precision automatically.
53. Estimated/substitute value ≠ Reading automatically.
54. Meter-based value during a gap must not create fictitious Meter Installation.

## 62. Решения internal review

1. **Reading имеет собственную предметную identity.** Tuple Accounting Point/time/channel/value недостаточен как универсальная identity: совпадение tuple не доказывает один и тот же measurement fact, а correction/history должны оставаться различимыми.
2. **Universal Reading Candidate / Submission entity не нужна.** Received/observed values принадлежат intake/integration semantics соответствующего канала до domain recognition.
3. **Meter Installation не обязательна для любого возможного Reading фундаментально.** Она обязательна для обычного meter-based Reading, но модель допускает иной sufficiently defined measurement basis относительно Accounting Point без фиктивного Meter.
4. **Reading только на Accounting Point без Meter допустим лишь при explicit applicable non-meter measurement semantics.** Для пилотных счётчиков Meter Installation должна быть определима.
5. **Universal one Reading per Accounting Point per day constraint не вводится.** Возможны разные times/channels/observations.
6. **Lower-than-previous value не блокирует recognition автоматически.** Replacement, rollover, reset, channel semantics и correction требуют контекста.
7. **Duplicate отделяется от повторного observation через provenance/semantic identity.** Numeric equality/date equality недостаточны.
8. **Owner-reported value может признаваться автоматически**, если applicable authority/access/rule и validation это позволяют. Сам факт ownership/reporting такого права не создаёт.
9. **Control Reading не получает universal higher priority.** Приоритет/коррекция определяются control process/rule и evidence.
10. **Telemetry Reading может признаваться без Subject**, если automatic recognition разрешено rule/semantic contract. Automated system остаётся не-Subject; provenance source сохраняется отдельно.
11. **Universal quality/confidence score не вводится.** Конкретный process может хранить quality flags/limitations, если они имеют предметный смысл.
12. **Unresolved/conflicting values остаются вне Reading до resolution**, если нельзя признать самостоятельные measurement facts. Universal conflict state machine не вводится.
13. **Отдельная Correction entity не нужна.** Reading correction исторически связывает original и corrected/effective recognition на sufficient basis.
14. **Reading correction не меняет Consumption автоматически.** Resource recalculation — отдельное owning action/result.
15. **Consumption correction не меняет Accrual автоматически.** Financial recalculation/correction принадлежит financial context.
16. **Raw и converted representations не образуют два Reading автоматически.** Если это две формы одного measurement fact, identity одна; если они выражают materially different measurement semantics, решение принимает конкретный process.
17. **Universal Meter Register entity для day/night сейчас не нужна.** Достаточна explicit channel/measurement semantics в Reading/process context.
18. **Неизвестное точное время хранится с реально доступной temporal precision.** Нельзя придумывать HH:MM.
19. **Reporter identity не обязательна для Reading универсально.** Для manual report она может быть существенно важна; для telemetry/document/provider source provenance может быть достаточным без создания fake Subject.
20. **Pilot-ST scenarios достаточны для стабилизации базовой recognition model.** Дополнительно проверены photo/time conflict, display precision, substitute estimate и meter-gap value.

Блокирующих предметных вопросов по базовому Reading recognition после internal review не осталось.

## 63. Нормативная синхронизация

Новый ADR и новые fundamental entities не требуются.

В текущей Draft-ветке выполнена точечная синхронизация:

- ADR-007 — Reading identity, recognition outcomes, historical Meter Installation mapping, duplicate/conflict/correction boundaries, late/out-of-order semantics и telemetry/provider boundary;
- DOMAIN_MODEL → 0.20 — Reading закреплён как самостоятельный recognized fact с identity, temporal/provenance semantics и correction boundary;
- TERMINOLOGY → 0.18 — термин Reading уточнён для manual/import/telemetry/provider scenarios;
- REFERENCE_CANDIDATE_MATRIX — Stage 7 переведён в состояние «выполняется», BP-READING-001 зафиксирован как foundation, REF-METER-002 остаётся следующим.

Новые universal Reading Candidate, Measurement Submission, Measurement Event, Meter Register, Rejection или Correction entities не введены.

ADR-010 и ADR-011 не требуют изменения: existing authority/access и external-information recognition semantics уже покрывают manual/automatic Reading recognition.

## 64. Текущее состояние и следующий шаг

BP прошёл:

- internal review against ADR-004/005/007/010/011;
- pilot-ST scenario check по electricity/water, individual/group/two-zone Meter, replacement boundary, late Reading, conflicting owner/control values, telemetry/manual duplication, supplier settlement quantity, temporal precision и correction;
- нормативную синхронизацию ADR-007 / DOMAIN_MODEL / TERMINOLOGY / REFERENCE_CANDIDATE_MATRIX.

Блокирующих предметных вопросов по базовому Reading recognition не осталось.

Следующий процесс Stage 7 после принятия/merge BP-READING-001:

**REF-METER-002 — automatic Reading import/recognition**.

Он должен использовать BP-READING-001 как единую domain recognition model и добавить только integration semantics: external source/device mapping, delivery/redelivery, batch/stream behavior, unknown outcome, conflict and re-recognition where needed.

После automatic import последовательность Stage 7 продолжается: control reading → Control Reconciliation → Calculated Imbalance → Operational Loss recognition.

Дополнительный внешний review BP-READING-001 сейчас не инициируется: Draft не вводит новой фундаментальной сущности и не меняет уже принятую границу resource/finance/integration contexts.
