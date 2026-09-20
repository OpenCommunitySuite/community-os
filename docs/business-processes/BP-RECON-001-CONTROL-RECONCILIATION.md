# BP-RECON-001 — Контрольная сверка связанных точек учёта

**Статус:** Draft
**Контекст:** Ресурсный и инженерный учёт
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий процесс определяет предметную семантику Control Reconciliation — сопоставления связанных данных учёта в определённой области инженерной системы и временном окне.

Базовая модель:

```text
reconciliation scope + applicable topology + time window
→ participating inputs
→ completeness / quality assessment
→ normalization / transformation
→ reconciliation calculation
→ reconciliation result
→ Calculated Imbalance where applicable
→ later Operational Loss recognition if separately justified
```

Главная граница:

```text
Control Observation
≠ Control Reconciliation
≠ Calculated Imbalance
≠ Operational Loss
```

## 2. Нормативная основа

BP развивает ADR-007 и использует:

- BP-READING-001 — Reading recognition;
- BP-READING-002 — automatic import;
- BP-READING-003 — Control Observation.

Уже приняты:

- Reading ≠ Consumption;
- Control Observation ≠ Control Reconciliation;
- Calculated Imbalance ≠ Operational Loss;
- engineering topology исторична;
- missing data must remain visible;
- absolutely identical timestamps are not required;
- resource correction ≠ financial correction.

## 3. Что входит

Процесс охватывает:

- reconciliation scope;
- applicable Resource / engineering system;
- historical topology;
- relevant Accounting Points and roles;
- reconciliation time window;
- participating Reading/Consumption/substitute inputs;
- expected vs participating points;
- completeness;
- units/scaling/conversion;
- alignment to applicable intervals/window;
- treatment of missing inputs;
- treatment of exclusions;
- calculation rule/version;
- reconciliation result;
- Calculated Imbalance where applicable;
- quality limitations;
- provenance;
- correction/recalculation.

## 4. Что не входит

BP не определяет:

- recognition Reading;
- автоматический import;
- Control Observation;
- universal Consumption calculation;
- universal technical-loss formula;
- Operational Loss recognition;
- allocation of losses to owners;
- Accrual/Financial Obligation;
- supplier settlement transformation-loss coefficient;
- UI/report implementation;
- universal topology engine;
- universal graph algorithm.

## 5. Control Reconciliation как самостоятельный process result

Control Reconciliation является исторически значимым process/result referent, потому что downstream analysis должен объяснять:

- какую область сравнивали;
- за какое окно;
- с какой topology;
- какие inputs участвовали;
- чего не хватало;
- какие rules/conversions использовались;
- какой result получен;
- с какими quality limitations.

Отдельная fundamental measurement entity не вводится.

## 6. Reconciliation scope

Scope определяет предметную область сопоставления.

Например:

- branch after one group/general Meter;
- transformer branch;
- street distribution branch;
- water branch;
- pump/common-use branch;
- arbitrary topology sub-area.

Scope не выводится автоматически из ownership, street label или Personal Account.

## 7. Historical topology

Reconciliation использует topology, действовавшую для relevant time/window.

```text
current topology
≠ historical reconciliation topology automatically
```

Переключения, переподключения, переносы Accounting Points и изменения ветвей должны учитываться согласно historical applicability.

## 8. Accounting Point roles

В reconciliation могут участвовать points с контекстными ролями:

- incoming/general;
- intermediate/group;
- outgoing/individual;
- common-use;
- control;
- other.

Роль определяется конкретным reconciliation scope/topology, а не физическим типом Meter.

## 9. Reconciliation window

Control Reconciliation выполняется за предметно определённый time slice/window.

Window может совпадать с Control Observation window либо быть более широким/иным, если это допустимо process semantics.

Абсолютное равенство Reading timestamps не требуется.

## 10. Observation window vs reconciliation window

```text
Control Observation window
≠ Reconciliation window automatically
```

Например, Reading сняты в течение 2 часов, а reconciliation оценивает состояние на этот контрольный интервал с явной quality limitation.

## 11. Participating inputs

В зависимости от process могут участвовать:

- recognized Reading;
- derived Consumption;
- substitute/estimated values;
- known injections/withdrawals;
- common-use consumption;
- technical adjustments;
- other explicit resource-domain inputs.

Input type должен быть предметно объясним.

## 12. Reading inputs

Reading используется как Reading, а не как Consumption автоматически.

Если reconciliation требует volume over interval, соответствующий Consumption/derivation должен быть получен owning resource semantics.

## 13. Consumption inputs

Consumption может участвовать напрямую, если его scope/period соответствует reconciliation semantics.

Разные Consumption results не объединяются только потому, что выражены в одной unit.

## 14. Substitute / estimated input

Substitute/estimated input допускается, если process rule это разрешает.

Но:

```text
substitute input
≠ observed Reading
```

Его использование должно отражаться в quality/provenance.

## 15. Expected points

Reconciliation должен иметь explainable expected set Accounting Points / flows.

Он может наследоваться от BP-READING-003 Control Observation либо определяться собственным rule/topology basis.

## 16. Participating points

Expected point может:

- participate with valid input;
- participate with substitute input;
- be missing;
- be unresolved;
- be excluded on explicit basis.

Эти outcomes не смешиваются.

## 17. Excluded points

Point excluded from reconciliation должен иметь explicit basis.

Exclusion не должна использоваться для улучшения результата или скрытия missing data.

## 18. Missing point

Missing expected input остаётся видимым.

```text
missing
≠ zero
≠ excluded
≠ previous value copied automatically
```

## 19. Completeness

Reconciliation должен иметь explainable completeness.

Completeness может быть:

- complete;
- partial;
- insufficient for quantitative imbalance;
- complete by applicable rule despite explicit exclusions;
- other process-specific outcome.

Universal percentage formula не вводится.

## 20. Completeness threshold

Concrete policy может задавать threshold/minimum completeness для расчёта imbalance.

Это не universal invariant Community OS.

## 21. Quantitative reconciliation may be impossible

Если missing/invalid inputs materially prevent reliable comparison:

```text
Control Reconciliation result exists
Calculated Imbalance may be absent
```

Нельзя invent zero imbalance только потому, что calculation impossible.

## 22. Units

Participating quantitative inputs должны быть совместимы либо приводимы по explicit conversion semantics.

Одно числовое значение без unit/semantics недостаточно.

## 23. Scaling / coefficients

Reconciliation может использовать historically applicable:

- Meter Installation coefficients;
- Rule conversions;
- unit transformations;
- other explicit coefficients.

Current coefficient не применяется ретроактивно автоматически.

## 24. Supplier-side coefficients

Supplier-calculated transformation-loss coefficient из финансово-settlement context не становится reconciliation coefficient Community OS автоматически.

Он может быть отдельным external input/reference, но не переписывает resource-domain calculation semantics.

## 25. Time alignment

Если Reading timestamps различаются, applicable process может:

- accept window with limitation;
- interpolate/extrapolate по explicit rule;
- use nearest eligible Reading;
- require Consumption over aligned interval;
- reject quantitative imbalance as insufficient.

Universal alignment algorithm не вводится.

## 26. Interpolation / extrapolation

Interpolation/extrapolation не выполняется молча.

Если используется, должны быть объяснимы:

- rule/version;
- source values;
- target time/window;
- limitations.

## 27. Topology flow direction

Reconciliation может различать incoming/outgoing/consumption flows according topology semantics.

Flow direction не выводится только из Meter sign или naming без applicable mapping.

## 28. Intermediate meters

Промежуточные/group Meter могут формировать nested reconciliation scopes.

Например:

```text
general Meter
→ street/group Meter
→ individual Accounting Points
```

Наличие intermediate Meter не требует flattening всего дерева/графа в одну формулу.

## 29. Nested reconciliation

Допускаются независимые reconciliation results по уровням/branches.

```text
general → group
group → individual
```

Их results не обязаны быть одним Calculated Imbalance.

## 30. Several independent branches

Если один Resource имеет несколько independent engineering branches, reconciliation выполняется per relevant scope.

Inputs из независимых branches не объединяются автоматически.

## 31. Several general meters

Community может иметь несколько general Accounting Points одного Resource.

Это не требует одного universal top-level reconciliation.

## 32. Common-use consumption

Pump/common-use Accounting Point или other Community consumption может участвовать как explicit outgoing/consumption component.

Он не должен исчезать из balance equation только потому, что не связан с plot.

## 33. Calculated Imbalance

Если applicable rule и достаточные inputs позволяют количественное сравнение, возникает Calculated Imbalance.

```text
reconciliation inputs + rule
→ Calculated Imbalance
```

Calculated Imbalance является количественным resource result со своей объяснимой identity/context.

## 34. Sign

Calculated Imbalance может быть:

- positive;
- negative;
- zero.

Знак интерпретируется согласно конкретной formula/flow convention.

Universal meaning positive=loss не вводится.

## 35. Absolute and percentage representation

Reconciliation может представлять imbalance в absolute unit и/или percentage.

Percentage base должна быть explicit.

```text
imbalance %
≠ universal formula
```

## 36. Zero imbalance

Zero result не доказывает отсутствие ошибок/потерь.

Он только означает zero according used inputs/rule/context.

## 37. Negative imbalance

Negative imbalance не означает автоматически generation, fraud или meter error.

Возможные причины остаются предметом дальнейшего анализа.

## 38. Imbalance cause

Control Reconciliation не обязана устанавливать cause.

Possible causes may include:

- timing mismatch;
- missing/estimated input;
- meter error;
- topology mismatch;
- real resource loss;
- unaccounted consumption;
- data error;
- conversion issue;
- other.

Closed universal reason taxonomy не вводится.

## 39. Calculated Imbalance ≠ Operational Loss

```text
Calculated Imbalance
≠ Operational Loss
≠ theft
≠ debt
≠ unaccounted owner consumption automatically
```

Operational Loss требует отдельного recognition process/basis.

## 40. Calculated Imbalance ≠ supplier transformation-loss quantity

Supplier-calculated loss quantity and internal Calculated Imbalance are different facts.

Они могут сравниваться аналитически, но не заменяют друг друга.

## 41. Reconciliation result without imbalance

Process result may state:

- insufficient completeness;
- incompatible inputs;
- unresolved topology;
- unresolved conflicts;
- other inability to calculate.

Это полноценный reconciliation outcome, а не system failure.

## 42. Quality limitations

Quality limitations may include:

- wide timing window;
- partial coverage;
- substitute data;
- mixed acquisition times;
- changed topology;
- meter replacement;
- unresolved Reading conflicts;
- uncertain coefficients;
- incomplete channels.

## 43. Correction

Если input/topology/rule позднее исправлен, original reconciliation result не переписывается молча.

Создаётся traceable recalculation/new effective result according applicable semantics.

## 44. Recalculation

```text
source correction
→ reconciliation revalidation
→ recalculation where required
```

Original result remains explainable.

## 45. Reading correction

Reading correction may require reconciliation recalculation.

Reading context does not directly mutate Calculated Imbalance silently.

## 46. Topology correction

Historical topology correction may materially change expected flows/points.

Reconciliation must be recalculated explicitly if necessary.

## 47. Rule/version change

New reconciliation rule/version does not rewrite prior results automatically.

Historical result retains the rule/version actually used.

## 48. Financial boundary

Control Reconciliation / Calculated Imbalance:

```text
≠ Accrual
≠ Financial Obligation
≠ Payment
≠ Expense
```

Financial processes may later use recognized resource results according own rules.

## 49. Loss allocation boundary

Allocation of resource loss to owners/objects is not owned by BP-RECON-001.

Даже recognized Operational Loss не создаёт owner Accrual автоматически.

## 50. Pilot ST — street/group electricity reconciliation

Example scope:

```text
group/street incoming Accounting Point
→ individual plot Accounting Points
+ common-use point where applicable
```

Control Observation provides readings/completeness.

Control Reconciliation compares relevant volumes for the window.

## 51. Pilot ST — two-hour snapshot

Readings were taken within 1–2 hours.

Reconciliation may proceed if local rule accepts the window, but result records timing limitation.

Universal exact simultaneity is not required.

## 52. Pilot ST — missing one plot

One expected plot lacks Reading.

Possible outcomes:

- no quantitative imbalance because completeness insufficient;
- use explicit substitute input under policy;
- calculate partial result with clear limitation.

System must not silently use zero.

## 53. Pilot ST — pump consumption

Pump/common-use point belongs to branch scope.

```text
incoming volume
- individual volumes
- pump/common volume
→ residual imbalance where formula applies
```

Pump use is not loss.

## 54. Pilot ST — multiple transformer branches

Each transformer/branch may have separate reconciliation.

Same Resource electricity does not imply one combined formula.

## 55. Pilot ST — upper/lower traverse meters

Where branch topology includes several traverses/intermediate meters, reconciliation may be nested or per segment.

Do not double-count the same flow through multiple nested meters in one flat formula without explicit rule.

## 56. Pilot ST — meter replacement during period

If Meter replaced inside reconciliation window, derived volume uses applicable installation segments.

Old/new register values are not directly subtracted across Meter identities.

## 57. Pilot ST — supplier loss addition

Supplier adds transformation-loss kWh by coefficient.

Internal reconciliation result remains independently calculated from Community OS inputs/rules.

Supplier addition may be compared later but is not inserted as internal loss automatically.

## 58. Pilot ST — water branch

Same process applies to water with applicable units/topology and resource-specific rules.

## 59. Pilot ST — negative residual

Sum of outgoing/consumption values exceeds measured incoming volume.

Negative result is preserved with quality/provenance; system does not force zero or declare fraud automatically.

## 60. Pilot ST — topology changed mid-window

Branch was switched/reconfigured during observation/reconciliation window.

Process may:

- split window;
- use explicit topology segments;
- mark result insufficient;
- apply specific rule.

Current topology alone must not be used silently.

## 61. Outcomes

### 61.1. Complete quantitative reconciliation

Sufficient inputs/topology/rule → reconciliation result + Calculated Imbalance.

### 61.2. Quantitative reconciliation with limitations

Imbalance calculated but completeness/quality limitations preserved.

### 61.3. Non-quantitative / insufficient reconciliation

Process result exists, but Calculated Imbalance is absent because inputs/topology/rule insufficient.

### 61.4. Corrected/recalculated reconciliation

Prior result remains historical; new result references correction/recalculation basis.

## 62. Provenance

Where materially relevant, should be determinable:

- reconciliation identity;
- Resource / engineering system;
- scope/area;
- topology/version/context;
- time window;
- expected points/flows;
- participating inputs;
- missing/excluded/substitute inputs;
- Control Observation identity where used;
- units/conversions/coefficients;
- alignment/interpolation rules;
- reconciliation rule/version;
- completeness;
- Calculated Imbalance identity/value/unit/sign/percentage base where applicable;
- quality limitations;
- correction/recalculation relation.

## 63. Инварианты

1. Control Observation ≠ Control Reconciliation.
2. Control Reconciliation ≠ Calculated Imbalance.
3. Calculated Imbalance ≠ Operational Loss.
4. Reconciliation uses historical applicable topology.
5. Current topology must not silently replace historical topology.
6. Expected inputs ≠ participating inputs.
7. Missing ≠ zero.
8. Missing ≠ excluded.
9. Exclusion requires explicit basis.
10. Substitute input ≠ observed Reading.
11. Absolute timestamp equality is not required universally.
12. Time alignment algorithm is process-specific.
13. Interpolation/extrapolation must be explicit if used.
14. Unit/scaling/conversion must be explainable.
15. Current coefficient must not be applied retroactively automatically.
16. Supplier settlement coefficient ≠ resource reconciliation coefficient automatically.
17. Incomplete reconciliation may exist without Calculated Imbalance.
18. No imbalance value must be invented when calculation is impossible.
19. Intermediate meters do not imply one flat universal formula.
20. Nested reconciliation results may remain separate.
21. Independent branches are not merged automatically.
22. Common-use consumption must not be treated as loss automatically.
23. Calculated Imbalance may be positive/negative/zero.
24. Sign does not have universal cause semantics.
25. Percentage base must be explicit.
26. Zero imbalance does not prove zero physical loss.
27. Negative imbalance does not prove fraud/error automatically.
28. Calculated Imbalance does not prove Operational Loss.
29. Calculated Imbalance does not prove theft/unaccounted owner consumption.
30. Supplier-calculated transformation-loss quantity ≠ Calculated Imbalance.
31. Reconciliation correction does not silently rewrite prior result.
32. Reading/topology/rule correction triggers explicit revalidation/recalculation where needed.
33. Control Reconciliation does not create Accrual/Obligation/Payment/Expense automatically.
34. Loss allocation to owners is not owned by this BP.

## 64. Решения internal review

1. Control Reconciliation needs its own historical process/result identity because scope/topology/window/inputs/rule/result must remain reproducible.
2. Calculated Imbalance is a separate quantitative result produced by reconciliation where possible.
3. Reconciliation may complete without Calculated Imbalance when inputs are insufficient.
4. Exact simultaneity is not required universally.
5. Completeness is explicit but no universal percentage formula/threshold is introduced.
6. Missing, excluded and substitute inputs remain distinct.
7. Nested/intermediate-meter reconciliation is supported without flattening topology.
8. No universal imbalance formula is introduced.
9. No universal percentage base is introduced.
10. Supplier-calculated transformation loss remains separate from internal imbalance.
11. Operational Loss recognition remains a separate next process.
12. No new universal Reconciliation Entry/Balance Line entity is required.

Блокирующих предметных вопросов после internal review не осталось.

## 65. Предварительные нормативные последствия

ADR-007 already contains Control Reconciliation and Calculated Imbalance concepts.

Expected point synchronization:

- ADR-007 — clarify reconciliation identity/outcomes, incomplete result without imbalance, nested scopes, correction semantics;
- DOMAIN_MODEL — Control Reconciliation result + Calculated Imbalance relation;
- TERMINOLOGY — refine existing Control Reconciliation / Calculated Imbalance definitions;
- REFERENCE_CANDIDATE_MATRIX — close REF-METER-003 and make Operational Loss recognition next after imbalance semantics.

## 66. Следующий шаг

1. final consistency check;
2. normative synchronization;
3. close REF-METER-003;
4. open Draft PR;
5. next: explicit Operational Loss recognition process.