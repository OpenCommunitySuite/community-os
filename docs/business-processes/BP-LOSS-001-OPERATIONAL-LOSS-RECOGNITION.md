# BP-LOSS-001 — Признание эксплуатационной потери ресурса

**Статус:** Draft
**Контекст:** Ресурсный и инженерный учёт
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий процесс определяет, когда Community OS может признать Operational Loss — реальное предметное явление утраты ресурса в инженерной системе.

Базовая модель:

```text
loss evidence / engineering basis / reconciliation context
→ identification of Resource + engineering scope + period/event
→ validation / authority / applicable rule
→ Operational Loss recognition
→ quantification where sufficiently established
→ later allocation / financial consequences only in separate processes
```

Ключевая граница:

```text
Calculated Imbalance
≠ Operational Loss automatically
≠ supplier-calculated loss quantity
≠ theft
≠ owner debt
```

## 2. Нормативная основа

BP развивает ADR-007 и опирается на:

- BP-READING-001 — Reading recognition;
- BP-READING-003 — Control Observation;
- BP-RECON-001 — Control Reconciliation / Calculated Imbalance;
- BP-EXPENSE-001 — financial boundary Resource Loss ≠ Expense automatically.

## 3. Что входит

Процесс охватывает:

- loss scope;
- Resource / engineering system;
- incident/period context;
- direct evidence;
- Calculated Imbalance as possible evidence, but not proof by itself;
- technical/engineering calculation;
- estimated loss where allowed;
- recognition authority/rule;
- cause where known;
- quantity/unit where known;
- unquantified recognized loss;
- quality/uncertainty;
- relation to reconciliation/incident/document/evidence;
- correction/re-estimation;
- duplicate/overlap/double-counting protection;
- provenance.

## 4. Что не входит

BP не определяет:

- Control Reconciliation;
- universal technical-loss formula;
- supplier settlement calculations;
- loss allocation to owners/objects;
- Accrual/Financial Obligation;
- Expense recognition;
- theft/fraud investigation;
- maintenance Work Order;
- incident-management workflow;
- universal cause taxonomy;
- regulatory accounting treatment.

## 5. Operational Loss как самостоятельный предметный факт

Operational Loss имеет самостоятельную resource-domain identity.

Она не определяется автоматически:

- Calculated Imbalance identity;
- Meter identity;
- incident document;
- supplier invoice;
- Expense;
- owner Accrual.

Один reconciliation result может быть evidence для нуля, одной или нескольких recognized losses; одна Operational Loss может использовать несколько evidence sources.

## 6. Loss existence и quantification могут возникать не одновременно

Реальная loss может быть установлена раньше, чем её объём.

Например:

```text
confirmed pipe rupture
→ Operational Loss recognized
→ quantity still unresolved
```

Система не должна придумывать количество ради самого факта признания.

Поздняя quantification дополняет/уточняет recognized loss traceably.

## 7. Quantified Operational Loss

Когда количество достаточно установлено, должны быть объяснимы:

- quantity;
- unit;
- method/basis;
- period/event scope;
- uncertainty/quality where significant.

Operational Loss quantity не должна быть отрицательной. Zero assessment сам по себе не создаёт факт утраты ресурса.

## 8. Direct physical evidence

Operational Loss может быть признана без Calculated Imbalance, если есть sufficient direct evidence.

Примеры:

- визуально подтверждённая утечка воды;
- разрыв трубопровода;
- аварийный сброс;
- измеренный/рассчитанный нагревательный/технический loss in electrical equipment;
- иное физически/инженерно подтверждённое выбытие ресурса.

## 9. Engineering calculation

Loss может быть определена инженерным расчётом, если applicable rule допускает такой basis.

Должны быть объяснимы:

- method;
- inputs;
- coefficients;
- scope;
- period;
- version/rule where material.

Наличие математической формулы не превращает любой result в Operational Loss без domain recognition.

## 10. Calculated Imbalance as evidence

Calculated Imbalance может быть evidence для Operational Loss.

Но:

```text
Calculated Imbalance 120 kWh
→ possible loss evidence
≠ Operational Loss 120 kWh automatically
```

Дополнительные rules/evidence могут быть нужны для признания nature и quantity loss.

## 11. Imbalance cause may remain unknown

Calculated Imbalance может существовать с неизвестной причиной.

```text
unexplained imbalance
≠ recognized Operational Loss automatically
```

Неизвестность причины не должна маскироваться фиктивным label «technical loss».

## 12. Loss may exist with zero/low Calculated Imbalance

Zero or small reconciliation imbalance не исключает physical loss автоматически.

Например, ошибки/компенсирующие отклонения могут скрывать её в aggregate result.

Direct evidence может поддерживать Operational Loss независимо от aggregate imbalance.

## 13. Technical loss

Технические потери электроэнергии, воды или другого Resource могут быть Operational Loss, если они отражают реальную утрату/рассеивание ресурса в engineering system и признаны на достаточном basis.

Термин «technical loss» не является универсальным автоматическим classification rule.

## 14. Supplier-calculated transformation loss

Supplier-calculated transformation-loss quantity:

```text
≠ Operational Loss automatically
≠ Calculated Imbalance
```

Он остаётся external settlement input до тех пор, пока resource context не получит sufficient basis для признания соответствующей Operational Loss.

Если quantity поставщика совпадает с later recognized loss, identities всё равно различаются: supplier calculation и Operational Loss остаются разными facts.

## 15. Supplier coefficient as evidence

Supplier coefficient/formula может быть одним из evidence/reference inputs.

Но Community OS не принимает его автоматически как internal engineering truth.

## 16. Consumption ≠ loss

Resource, реально использованный по назначению, не является Operational Loss.

Например:

- pump electricity;
- street lighting;
- common water use;
- individual plot consumption.

Даже если этот Resource не был индивидуально начислен владельцу, это не делает его loss.

## 17. Unauthorized/unaccounted consumption ≠ loss automatically

Если Resource был фактически потреблён человеком/объектом, но не учтён или не разрешён:

```text
unaccounted / unauthorized consumption
≠ Operational Loss automatically
```

Он может объяснять Calculated Imbalance, но semantic nature требует отдельного basis.

## 18. Theft ≠ Operational Loss automatically

Хищение — отдельная правовая/фактическая квалификация.

Operational Loss process не делает вывод о theft только из imbalance или missing resource.

## 19. Meter error ≠ Operational Loss

Ошибка Meter/Reading может создавать apparent imbalance without physical resource loss.

После correction imbalance may change/disappear.

Не следует признавать loss, если достаточное основание указывает лишь на measurement error.

## 20. Topology/model error ≠ Operational Loss

Incorrect topology/mapping can create reconciliation residual.

Исправление topology является correction source model, а не признанием потери.

## 21. Timing mismatch ≠ Operational Loss

Несовпадающие measurement windows могут создавать imbalance.

Timing limitation itself does not establish Operational Loss.

## 22. Missing data ≠ Operational Loss

Missing Reading/input does not mean resource was lost.

Substitute/estimated data may support later analysis but remains distinguishable.

## 23. Loss scope

Operational Loss should have sufficiently defined engineering scope:

- whole system;
- branch;
- transformer segment;
- pipeline segment;
- facility;
- incident area;
- other applicable scope.

Scope should not be inferred solely from ownership/Personal Account.

## 24. Historical topology

Loss is related to topology/context applicable to incident/period.

Current topology does not rewrite historical loss scope.

## 25. Time semantics

Loss may relate to:

- incident time;
- interval;
- accounting period;
- estimated window;
- other sufficient temporal semantics.

Recognition time and record time remain distinct.

## 26. Continuous/periodic losses

Some losses may be continuous or recurring rather than incident-based.

Example: technical electricity loss over a billing period.

Process may recognize period loss without inventing one discrete incident.

## 27. Incident-based loss

Other losses are tied to an event, e.g. pipe rupture.

Incident/evidence may support Operational Loss but is not the same entity.

Universal Loss Incident entity is not introduced.

## 28. Cause

Cause may be:

- known;
- partially known;
- unknown.

Closed universal cause taxonomy is not introduced.

Cause is not required for recognition if the loss phenomenon itself is sufficiently established.

## 29. Classification

Community-specific classifications may exist for analysis:

- technical;
- аварийная;
- leakage;
- other.

They do not redefine fundamental Operational Loss semantics.

## 30. Estimated quantity

Operational Loss quantity may be estimated where direct measurement is impossible and applicable rule allows it.

Estimate must retain method/provenance/uncertainty where significant.

Estimated Operational Loss remains Operational Loss if phenomenon is recognized; estimated refers to quantification method.

## 31. Range/uncertainty

Where exact quantity is unavailable, process may preserve uncertainty/range if supported by domain needs.

No universal confidence score is introduced.

## 32. Multiple evidence sources

One loss may be supported by:

- reconciliation result;
- photos/documents;
- technician observation;
- engineering calculation;
- telemetry;
- incident data;
- supplier/reference data.

No single source has universal priority.

## 33. Authority / recognition

Recognition may be:

- explicit action by authorized Subject;
- automatic under applicable rule where sufficiently deterministic;
- result of specialized resource process.

Technical data access ≠ authority to recognize Operational Loss.

## 34. Automatic recognition

Automatic recognition may be allowed for a specific well-defined case.

Example: explicit engineering rule calculates recurring transformer technical loss from validated inputs.

Such automation requires applicable rule/version and sufficient provenance.

## 35. Unresolved suspected loss

Suspicion of loss does not create Operational Loss.

```text
suspected leak / suspicious imbalance
≠ recognized Operational Loss
```

Owning operational/investigation process may retain suspicion separately without inventing loss fact.

## 36. Duplicate / overlapping loss facts

System must avoid double-counting the same physical loss through:

- reconciliation-derived estimate;
- incident estimate;
- supplier estimate;
- later refined calculation.

Numeric equality alone does not prove duplicate, but overlapping scope/period/evidence requires resolution.

## 37. Refinement / re-estimation

Later evidence may refine quantity.

Original result remains explainable; new effective estimate/quantification is traceable.

Silent overwrite is not allowed.

## 38. Correction

If loss was recognized incorrectly, correction preserves:

- original recognition;
- basis;
- correction reason;
- corrected/effective outcome;
- downstream impact references where material.

Universal Correction entity is not introduced.

## 39. Loss disproved

A previously recognized Operational Loss may later be disproved by better evidence.

Do not delete history silently.

Result may be superseded/corrected while prior decisions remain explainable.

## 40. Financial boundary

Operational Loss:

```text
≠ Expense
≠ Accrual
≠ Financial Obligation
≠ Payment
```

Financial processes may use loss as input/basis under their own rules.

## 41. Expense boundary

If Community bears monetary cost of recognized loss, a separate Expense may arise under BP-EXPENSE-001.

```text
Operational Loss quantity
→ possible financial basis
→ Expense only under applicable financial semantics
```

Resource context does not create Expense automatically.

## 42. Owner allocation boundary

Recognized Operational Loss does not identify who must bear it.

```text
Operational Loss
≠ owner allocation
≠ owner Accrual
```

Allocation uses a separate applicable rule/process.

## 43. Distribution of Calculated Imbalance vs Operational Loss

Existing terminology allows distribution of Calculated Imbalance or Operational Loss where applicable.

These remain distinct source facts.

Distribution of imbalance does not convert it into Operational Loss.

## 44. Pilot ST — transformer technical losses

Supplier adds calculated transformation-loss kWh by coefficient.

Pilot resource model:

```text
supplier-calculated loss quantity
→ external settlement input

internal engineering/reconciliation evidence
+ applicable recognition rule
→ Operational Loss where sufficiently established
```

Do not equate the two quantities automatically.

## 45. Pilot ST — line losses

Technical loss in 0.4 kV lines may be estimated/calculated for a branch.

If recognized under sufficient engineering basis, it is Operational Loss for that branch/period.

## 46. Pilot ST — pump electricity

Electricity actually consumed by pump:

```text
Community Consumption
≠ Operational Loss
```

Even though it reduces amount available downstream, it is purposeful consumption.

## 47. Pilot ST — missing plot Reading

Missing individual Reading causing reconciliation residual:

```text
missing Reading
≠ Operational Loss
```

Do not label residual as technical loss merely to close balance.

## 48. Pilot ST — unauthorized connection suspicion

Unexpected imbalance suggests unauthorized consumption.

Until sufficient evidence exists:

```text
suspicion
≠ Operational Loss
≠ theft fact
≠ owner debt
```

## 49. Pilot ST — water leak with unknown amount

Pipe rupture is confirmed, but volume is unknown.

Valid result:

```text
Operational Loss recognized
quantity = unresolved
```

Later estimation may quantify the same loss.

## 50. Pilot ST — water leak estimated from flow

Telemetry/engineering calculation estimates 18 m³ loss during incident.

If basis is sufficient:

```text
same Operational Loss
quantity = estimated 18 m³
method/provenance preserved
```

## 51. Pilot ST — negative reconciliation imbalance

Outgoing values exceed incoming measured volume.

Negative imbalance does not create negative Operational Loss.

First resolve measurement/topology/timing/other causes.

## 52. Pilot ST — zero imbalance but known leak

Known water leak exists while aggregate reconciliation happens to be near zero because of offsetting errors.

Direct evidence may still support Operational Loss.

## 53. Pilot ST — supplier quantity later corroborated

Supplier estimated 2% transformer loss. Independent engineering evidence later supports a quantified technical loss.

Operational Loss may then be recognized, with supplier estimate retained as one evidence source rather than identity/source of truth.

## 54. Pilot ST — common meter error

Reconciliation shows large residual; meter test proves general Meter under-registers.

Correction/recalculation may eliminate imbalance.

No Operational Loss is recognized solely from prior residual.

## 55. Outcomes

### 55.1. Recognized quantified Operational Loss

Loss phenomenon and quantity sufficiently established.

### 55.2. Recognized unquantified Operational Loss

Loss phenomenon established; quantity unresolved.

### 55.3. Suspected / unresolved loss

Evidence insufficient for recognition; no Operational Loss fact yet.

### 55.4. Not a loss

Evidence establishes another explanation such as Consumption, measurement/topology error or other non-loss fact.

### 55.5. Corrected / re-estimated loss

Prior recognition remains historical; effective result updated traceably.

## 56. Provenance

Where materially relevant, should be determinable:

- Operational Loss identity;
- Resource / engineering system;
- scope/topology;
- incident/period/time context;
- recognition basis;
- related Calculated Imbalance / reconciliation identities;
- direct evidence;
- method/rule/version;
- quantity/unit where established;
- estimated/measured/calculated nature where meaningful;
- uncertainty/quality limitations;
- cause where known;
- recognizing Subject or automatic rule;
- correction/re-estimation history;
- links to allocation/financial processes where later created.

## 57. Инварианты

1. Calculated Imbalance ≠ Operational Loss automatically.
2. Supplier-calculated transformation-loss quantity ≠ Operational Loss automatically.
3. Operational Loss may exist without Calculated Imbalance.
4. Operational Loss may be recognized before quantity is known.
5. Unquantified loss must not receive fictitious quantity.
6. Operational Loss quantity must not be negative.
7. Zero assessment does not by itself create loss phenomenon.
8. Consumption ≠ Operational Loss.
9. Community Consumption ≠ Operational Loss.
10. Unauthorized/unaccounted Consumption ≠ Operational Loss automatically.
11. Theft ≠ Operational Loss automatically.
12. Meter error ≠ Operational Loss.
13. Topology/mapping error ≠ Operational Loss.
14. Timing mismatch ≠ Operational Loss.
15. Missing data ≠ Operational Loss.
16. Suspicion ≠ recognized Operational Loss.
17. Cause need not be known if loss phenomenon is sufficiently established.
18. No universal cause taxonomy is introduced.
19. Estimated quantity may be valid with explicit basis/provenance.
20. Supplier coefficient is evidence/reference at most until domain recognition.
21. Same numeric quantity does not merge supplier calculation and Operational Loss.
22. Overlapping loss facts must not double-count the same physical loss silently.
23. Re-estimation/correction does not silently overwrite history.
24. Operational Loss ≠ Expense.
25. Operational Loss ≠ owner Accrual/Financial Obligation.
26. Loss allocation is a separate process.
27. Distribution of Calculated Imbalance does not convert it into Operational Loss.
28. Automatic recognition requires explicit applicable rule/provenance.
29. Current topology must not rewrite historical loss scope.
30. Financial context does not redefine resource loss truth.

## 58. Решения internal review

1. Operational Loss has its own resource-domain identity.
2. Recognition of loss existence and quantification are separable; quantity may remain unresolved.
3. Quantified Operational Loss requires explainable quantity/unit/method/context.
4. Operational Loss can be recognized from direct evidence or engineering calculation without a Calculated Imbalance.
5. Calculated Imbalance can remain unexplained without any recognized Operational Loss.
6. Cause is optional for recognition if the loss phenomenon itself is sufficiently established.
7. No universal Loss Incident entity is introduced.
8. No universal cause taxonomy or confidence score is introduced.
9. Supplier-calculated transformation loss remains an external settlement fact until independently recognized in resource context.
10. Unauthorized/unaccounted consumption and theft are not folded into Operational Loss automatically.
11. Resource loss recognition does not allocate the loss or create financial consequences.
12. Existing term 'Распределение небаланса или потерь' remains a separate follow-on process; it is not implemented by this BP.

Блокирующих предметных вопросов после internal review не осталось.

## 59. Нормативная синхронизация

Новый ADR и новые fundamental entities не требуются.

В текущей Draft-ветке выполнена точечная синхронизация:

- ADR-007 — explicit Operational Loss recognition basis, quantified/unquantified semantics, cause/quantity separation, correction and allocation/financial boundaries;
- DOMAIN_MODEL → 0.24 — Operational Loss закреплена как самостоятельный resource-domain fact с отдельными recognition/quantification semantics;
- TERMINOLOGY → 0.21 — уточнены `Потери ресурса` и `Operational Loss`; распределение потерь остаётся отдельным процессом;
- REFERENCE_CANDIDATE_MATRIX — Stage 7 resource fact chain отмечен завершённым; следующим основным этапом становится Stage 8 / BP-OPS-001.

Новые universal Loss Incident, cause taxonomy, confidence score, loss-allocation entity или financial-loss entity не введены.

## 60. Текущее состояние и следующий шаг

BP прошёл internal consistency review against ADR-007, BP-RECON-001, BP-EXPENSE-001 и current DOMAIN_MODEL/TERMINOLOGY.

Проверены:

- transformer technical losses;
- 0.4 kV line losses;
- pump/common consumption boundary;
- missing plot Reading;
- unauthorized-consumption suspicion;
- water leak with unknown quantity;
- later estimated leak quantity;
- negative Calculated Imbalance;
- zero imbalance with independently known loss;
- supplier loss quantity later corroborated;
- common Meter error;
- correction/re-estimation and double-counting risk.

Блокирующих предметных вопросов после internal review не осталось.

После принятия/merge BP-LOSS-001 Stage 7 считается завершённым на уровне resource-domain facts.

Следующий основной этап — **Stage 8 / BP-OPS-001: Appeal → Operational Work / Work Order**.

`Распределение небаланса или потерь` и финансовые последствия не включаются автоматически в Stage 8 и должны вернуться в работу только при конкретной pilot/business policy.

Дополнительный внешний review BP-LOSS-001 сейчас не инициируется.
