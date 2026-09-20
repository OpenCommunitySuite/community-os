# BP-FIN-005 — Отмена, исправление и перерасчёт начисления

**Статус:** Draft  
**Контекст:** Финансовые отношения  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий бизнес-процесс определяет изменение финансового эффекта ранее подтверждённого `Accrual`, когда после confirmation требуется:

- исправить ошибочный результат;
- выполнить перерасчёт;
- отменить финансовый эффект начисления;
- учесть изменение предметного основания или исходных данных;
- определить последствия для Financial Obligation, Debt, Overpayment, Payment Allocation и других зависимых финансовых результатов.

Ключевая модель:

```text
confirmed Accrual
+ sufficient change basis
+ historical context
→ correction / recalculation / cancellation action
→ new effective financial result
→ revalidation of dependent financial state
```

Original Accrual не переписывается и не удаляется.

## 2. Основная граница

```text
Accrual correction / recalculation / cancellation
≠ silent edit
≠ negative Accrual / storno
≠ Payment correction
≠ Payment Reallocation
≠ Refund
≠ source fact correction
≠ universal Financial Correction
```

Настоящий BP начинается только после существования historically significant confirmed Accrual либо его target-specific result.

Если Accrual ранее вообще не существовал и требуется первая поздняя фиксация корректного результата, применяется `BP-FIN-004`.

## 3. Режимы изменения

Настоящий BP различает как минимум:

1. **исправление Accrual** — исправление ошибочного исторического финансового результата либо его materially significant attributes на достаточном основании;
2. **перерасчёт (Recalculation)** — новое применение соответствующего rule к исторически определённому context;
3. **отмена финансового эффекта Accrual** — прекращение действующего financial effect ранее подтверждённого результата на достаточном основании;
4. **review without change** — повторная оценка может завершиться подтверждением, что effective result менять не требуется.

Это process semantics, а не универсальный lifecycle/state machine Accrual.

## 4. Original Accrual сохраняется

Confirmed Accrual является историческим фактом.

После correction/recalculation/cancellation должны оставаться объяснимы:

- original Accrual;
- original basis;
- original rule/version;
- original significant inputs;
- original result;
- reason for change;
- subsequent action/result;
- current effective financial result.

```text
old Accrual DELETE + new values
```

не является допустимой предметной моделью.

## 5. Source correction ≠ Accrual change

Если ошибка находится в исходном owning context, сначала исправляется исходный факт соответствующим процессом.

Примеры:

- Reading/Consumption — resource context;
- Object Area — object context;
- Ownership/Use/Membership — owning relation context;
- Management Decision/competence — governance context;
- external bank/source data — соответствующий integration/source process.

```text
source fact correction
≠ automatic Accrual recalculation
```

После source correction настоящий BP применяется только если applicable context-owned financial policy/rule/process semantics требует или допускает изменение ранее подтверждённого Accrual.

## 6. Новая версия rule сама по себе не пересчитывает прошлое

Появление нового Tariff/Rule/version не является достаточным основанием автоматически пересчитать historical Accrual.

Следует различать:

```text
new current rule
≠ corrected historical rule
≠ retroactive applicability
≠ mandatory recalculation
```

Для применения другой версии к historical Accrual должно существовать отдельное предметное основание и applicable policy согласно ADR-003/ADR-005.

## 7. Recalculation

Recalculation является новым исторически значимым применением rule к historical context.

```text
original Accrual
+ recalculation basis
+ applicable historical/corrected inputs
+ applicable rule/version
→ Recalculation result
```

Original calculation сохраняется.

Recalculation result может:

- совпасть с original result;
- уменьшить financial result;
- увеличить financial result;
- привести к zero/no-obligation effect;
- показать, что original target/result должен быть replaced;
- потребовать специализированного dependent disposition.

## 8. Correction без полного Recalculation

Не каждое исправление Accrual требует повторного запуска расчётного rule.

Например, исторически значимая classification/article либо reference к source fact может быть ошибочной при неизменном amount и obligation semantics.

Такая correction:

- должна быть traceable;
- не переписывает original Accrual silently;
- не становится Recalculation только ради унификации;
- не меняет amount/obligation автоматически, если исправляемый факт на них не влияет.

## 9. Cancellation

Cancellation означает прекращение действующего финансового эффекта Accrual на установленном основании с сохранением истории original result.

```text
Cancellation
≠ deletion
≠ Refund
≠ negative Accrual
```

Cancellation Accrual не отменяет Financial Obligation автоматически, если obligation имеет самостоятельное достаточное основание.

Если Accrual был единственным основанием/механизмом признания соответствующего obligation effect, cancellation может потребовать прекращения или изменения effective obligation согласно owning financial semantics.

## 10. Review может завершиться без изменения

Повторная проверка historical Accrual не обязана приводить к financial change.

Например:

- source fact исправлен, но calculated amount не изменился;
- новая rule version не применима к historical period;
- спор по target разрешён в пользу original result.

В таком случае historically significant review/revalidation может быть объясним, но новый financial result не создаётся только ради технической фиксации.

## 11. Accrual action ≠ mutable Accrual record

Original Accrual identity/history сохраняется.

Correction/Recalculation/Cancellation являются последующими historically significant actions/results, связанными с original Accrual.

Настоящий BP не требует универсальных:

- Accrual Revision entity;
- Adjustment entity;
- Correction Event;
- Storno record;
- Accrual Status state machine.

Технический способ хранения versions/history не определяется.

## 12. Financial Obligation consequences

Accrual change и Financial Obligation change различаются.

Настоящий BP должен определить, где применимо:

- сохраняется ли то же domain Financial Obligation;
- изменяется ли его effective amount;
- прекращается ли его effective obligation effect;
- требуется ли replacement obligation;
- остаётся ли obligation независимым от изменяемого Accrual;
- как меняются Debt/Overdue и исполнение.

Universal cascade `Accrual changed → rewrite Obligation` не вводится.

## 13. Continuity того же Financial Obligation

Если evidence подтверждает continuity того же domain Financial Obligation, correction/recalculation может изменить его effective financial result без создания нового obligation identity.

Пример:

```text
same liable party
same entitled party
same claim/basis
same obligation referent
old effective amount = 1000
recalculated effective amount = 800
```

Это может оставаться тем же Financial Obligation с исторически прослеживаемым изменением effective amount.

Набор атрибутов выше не является универсальным identity key. Решение основывается на continuity того же реального financial claim.

## 14. Replacement obligation

Если correction показывает, что original result относился к другому domain obligation, нельзя сохранять identity только ради удобства.

Типовые признаки возможного replacement:

- фактически другой liable Subject;
- другой entitled party;
- иной business basis/claim;
- другой period, если period образует отдельный claim;
- иной target, создающий самостоятельное obligation;
- original obligation вообще не должно было существовать.

В таком случае:

```text
old obligation/result
→ effective cancellation/correction
→ history preserved

correct domain claim
→ new/replacement obligation identity
→ initial Accrual/recognition by applicable owning process
```

Universal rule `change party = always new identity` не вводится; решающей является domain continuity.

## 15. Replacement Accrual

Если correct target/result ранее не имел собственного Accrual, replacement result не создаётся путём переписывания original Accrual.

Применимая модель:

```text
BP-FIN-005
→ removes/corrects effective result of erroneous Accrual

BP-FIN-004 / applicable initial accrual process
→ recognizes replacement Accrual where required
```

Replacement Accrual имеет собственную historically significant identity/provenance.

Если correct claim предметно существовал в прошлом, а correct Accrual ранее не был признан в Community OS, replacement может быть late initial Accrual по semantics BP-FIN-004 с отдельными recording time и historical/effective context.

Old Payment Allocations не relink к нему автоматически.

## 16. Wrong liable party

Если Accrual/Obligation был ошибочно отнесён к Subject A, а достаточный historical basis показывает Subject B:

- Subject A не заменяется silent edit;
- original Accrual/Obligation history сохраняется;
- continuity/replacement определяется согласно §13–§15;
- Debt A корректируется только через effective obligation semantics;
- obligation B создаётся/признаётся отдельно, если это другой domain claim;
- существующие Payments/Allocations не переносятся на B автоматически.

## 17. Wrong Personal Account / Object context

Personal Account/Object context может быть ошибочным без изменения liable Subject или самого obligation.

Если correction context не меняет domain financial claim:

- obligation identity может сохраниться;
- contextual link исправляется traceably;
- Payment Allocation не меняется автоматически.

Если изменение context показывает, что Accrual относился к другому target/claim, применяется replacement semantics.

## 18. Wrong Article / classification

Accrual Article не является basis или obligation identity автоматически.

Correction Article может:

- не менять amount/obligation;
- потребовать Budget/Funding/other dependent revalidation;
- показать более глубокую ошибку basis, если classification была симптомом неправильного claim.

Article не переписывается silently.

## 19. Amount decrease

Если same domain obligation после correction/recalculation уменьшается:

```text
old effective obligation amount = 1000
new effective obligation amount = 800
```

Current unpaid part и Debt пересчитываются из нового effective obligation state.

Если ранее было применено 1000 Payment amount, excess applied amount = 200 требует дальнейшего financial disposition согласно §24–§27.

Decrease не создаётся как `Accrual -200` только ради arithmetic balancing.

## 20. Amount increase

Если same domain obligation увеличивается:

```text
old effective amount = 1000
new effective amount = 1200
already fulfilled = 1000
→ current unpaid part = 200
```

Original Payment/Allocation остаются historical facts.

Increase не требует искусственного `new Accrual +200`, если предметно это Recalculation того же claim.

Если новый amount является отдельным claim, применяется new/replacement obligation semantics.

## 21. Cancellation to zero

Cancellation/recalculation может привести к effective obligation amount = 0 либо прекращению obligation effect.

Это не означает:

- physical deletion obligation;
- deletion original Accrual;
- invalidation реального Payment;
- Refund automatically.

Если Payment amount ранее был применён к этому obligation, весь или часть applied amount может стать excessive and require disposition.

## 22. Payment сохраняется

Accrual change никогда не изменяет реальный Payment автоматически.

```text
Accrual correction
≠ Payment correction
```

Если Payment recognition само было ошибочным, применяется `BP-FIN-002`.

Если Payment был реальным и корректным, он сохраняет identity, amount, direction, parties и provenance независимо от последующего Accrual change.

## 23. Payment Allocation сохраняется исторически

Confirmed Payment Allocation не удаляется и не переписывается из-за Accrual recalculation.

Если obligation уменьшается:

- historical Allocation остаётся explainable;
- amount, который больше не может исполнять current effective obligation, перестаёт выполнять именно fulfillment-функцию этого obligation;
- confirmed Allocation продолжает удерживать соответствующую часть Payment в current effective financial use до отдельного допустимого disposition/reallocation;
- excess part не становится Unallocated Remainder автоматически;
- это dependent financial consequence Accrual change, а не Reallocation само по себе.

Если требуется направить средства на другое obligation, применяется `BP-FIN-001`.

## 24. Excess applied amount

**Excess applied amount** в настоящем BP — derived process value: часть ранее applied Payment amount, которая после effective decrease/cancellation obligation больше не требуется для его исполнения.

Это не новая fundamental entity/state.

```text
excess applied amount
≠ Payment
≠ new Payment Allocation
≠ Overpayment automatically
≠ Advance automatically
≠ Refund automatically
```

Она является входом для дальнейшего disposition.

Пока disposition не изменил financial meaning, excess applied amount не считается свободной суммой для нового Initial Payment Allocation. Existing confirmed Allocation/current effective financial use предотвращают повторное использование той же части Payment.

## 25. Overpayment

Согласно ADR-006 Overpayment — **признанное** финансовое состояние, при котором ранее применённая к исполнению сумма в current effective financial state оказывается избыточной согласно applicable domain semantics.

Следует различать:

```text
excess applied amount
= derived process condition/value

Overpayment
= recognized financial meaning/state of that excess
```

Поэтому само возникновение `excess applied amount` не создаёт Overpayment автоматически.

Если applicable financial semantics признаёт excess как Overpayment, такой state становится текущим финансовым смыслом соответствующей суммы и сохраняет provenance причины возникновения.

Если excess в том же coherent business resolution сразу получает другой допустимый смысл — например Reallocation, purpose-specific Advance или Refund basis — отдельный промежуточный факт recognition Overpayment не является универсально обязательным.

Уже признанная Overpayment может позднее уменьшиться, прекратиться или изменить текущий объём согласно subsequent effective financial state и owning semantics, но это не делает Overpayment purely arithmetic derived state.

## 26. Advance

Excess amount не становится Advance автоматически.

Для Advance требуется отдельный meaningful future purpose согласно ADR-006.

Например:

```text
excess = 200
future electricity purpose explicitly recognized
→ Advance 200
```

Без такого basis excess не объявляется Advance только для закрытия arithmetic balance.

## 27. Refund

Refund не является автоматическим следствием reduced/cancelled Accrual.

Если возникает достаточный refund basis:

```text
excess / Overpayment / other refundable state
→ BP-FIN-003
→ Financial Obligation to return
→ new Refund Payment
```

Original incoming Payment остаётся unchanged.

## 28. Reallocation after recalculation

Если корректный Payment остаётся valid и часть его ранее confirmed Allocation должна быть направлена на другое obligation:

```text
Accrual/Obligation change
→ excess/releasable applied amount
→ BP-FIN-001 Reallocation
```

BP-FIN-005 не выполняет Payment Reallocation скрыто.

## 29. No automatic disposition

После decrease/cancellation система не выбирает универсально:

- Overpayment;
- Advance;
- Refund;
- Reallocation;
- иной permitted financial meaning.

Выбор зависит от sufficient basis, rules/policy, authority и current financial context.

Если disposition не определим однозначно:

```text
→ Requires Decision
```

## 30. Existing Unallocated Remainder

Unallocated Remainder другого/того же Payment не поглощается автоматически новым Debt или increased obligation.

Если его нужно применить:

- выполняется Initial Payment Allocation согласно `BP-FIN-ALLOCATION-001`;
- либо иной specialized process согласно existing financial meaning.

Accrual recalculation не заменяет Allocation.

## 31. Existing Advance after amount increase

Если obligation увеличилось, существующий purpose-compatible Advance может быть применён согласно applicable policy/rule.

Даже если это происходит автоматически в одном business interaction:

```text
Recalculation result
+
separate Advance application / Payment Allocation
```

остаются разными domain actions/results.

## 32. Previously recognized Overpayment after later increase

Если previous recalculation привёл к **признанной** Overpayment, а subsequent valid recalculation увеличивает obligation:

- historical recognition Overpayment и его provenance не переписываются;
- current effective amount/state признанной Overpayment может уменьшиться или прекратиться согласно owning semantics;
- это не означает, что любая арифметически избыточная сумма автоматически была Overpayment до recognition;
- applied funds не relink автоматически без applicable process;
- если средства уже refunded, Refund Payment остаётся реальным historical fact.

## 33. Refund already executed before later increase

Сценарий:

```text
original obligation 1000
paid 1000
recalculated to 800
refund 200 executed
later valid recalculation to 1000
```

Later increase:

- не отменяет historical Refund Payment;
- не создаёт reverse Refund;
- может создать current Debt 200, если obligation again requires 1000 and no other fulfillment exists;
- дальнейшее погашение выполняется обычными Payment semantics.

## 34. Refund obligation exists but not yet paid

Если prior recalculation создало refund basis и Financial Obligation to return, но later valid Accrual change изменяет source financial state до фактического Refund Payment:

- return obligation не переписывается молча;
- refund basis и outstanding return obligation проходят revalidation;
- applicable owning process изменяет/cancels return obligation traceably where justified;
- BP-FIN-003 не исполняет stale refund obligation.

## 35. Debt and Overdue

Accrual change может изменить current unpaid part Financial Obligation и поэтому Debt.

```text
effective obligation amount
- effective fulfillment
→ current unpaid part / Debt
```

Overdue зависит также от Due Date.

Historical periods, в которых Debt/Overdue ранее отображались иначе, не переписываются как будто original state никогда не существовало.

## 36. Due Date change

Due Date относится к Financial Obligation, а не к Accrual автоматически.

Если тот же sufficient change basis, из-за которого выполняется Accrual correction/recalculation, также изменяет Due Date соответствующего obligation:

- change of Due Date остаётся отдельным historically significant obligation consequence;
- historical due date остаётся explainable;
- Overdue state revalidates accordingly.

Самостоятельная correction Due Date, не связанная с изменением Accrual result/basis, не становится BP-FIN-005 только ради отсутствия другого workflow; она принадлежит applicable owning obligation process.

Настоящий BP не считает любое amount recalculation достаточным основанием автоматически менять Due Date.

## 37. Penalty

Изменение source obligation не переписывает historical penalty автоматически.

```text
base obligation changed
≠ penalty silently recalculated
```

Если penalty consequences должны измениться:

- применяется specialized penalty recalculation/correction semantics;
- original penalty calculation/history сохраняются;
- используемые base/rate/period/rule остаются explainable.

Настоящий BP может координировать need for penalty revalidation, но не задаёт universal penalty cascade.

Детальная penalty recalculation/correction требует специализированной process/policy semantics. Отдельный BP для неё может быть определён позднее при проработке реальных сценариев; его отсутствие не разрешает silent recalculation и не вводит universal manual-only правило.

## 38. Source Consumption / Reading correction

Если Accrual основан на resource data:

1. Reading/Consumption correction выполняется owning resource process;
2. corrected resource fact не переписывает Accrual автоматически;
3. applicable financial policy/rule определяет need for Recalculation;
4. BP-FIN-005 applies correct historical tariff/rule/input context;
5. dependent financial consequences revalidate separately.

Resource fact остаётся distinct from Accrual.

## 39. Ownership / Membership / Use correction

Если correction historical relation влияет на liable party/eligibility:

1. relation correction belongs to owning relation context;
2. BP-FIN-005 revalidates original target/result;
3. continuity/replacement obligation determined according to domain claim;
4. Payment/Allocation do not move between Subjects automatically.

Technical current ownership/member state не заменяет historical corrected context.

## 40. Governance decision change

Изменение, отмена или correction Management Decision belongs to ADR-008 governance semantics.

Такое изменение:

```text
governance decision changed
≠ Accrual automatically changed
```

Financial context определяет последствия через BP-FIN-005 согласно applicability/effective time of decision and applicable financial rules.

Prospective decision change не считается retroactive cancellation historical Accrual автоматически.

## 41. Duplicate Accrual

Если confirmed Accrual признан duplicate:

- duplicate не удаляется;
- duplicate classification/basis сохраняется;
- его effective financial effect может быть cancelled через настоящий BP;
- dependent obligation/debt/payment consequences revalidate;
- technical retry не создаёт ещё одну cancellation.

Если duplicate уже paid, applied amount получает disposition according to §§24–29.

## 42. Group correction scope

Для group Accrual correction/recalculation scope определяется предметной зависимостью target results.

Различаются:

1. **independent target results** — correction одного target не требует изменения остальных;
2. **interdependent calculation scope** — изменение одного input/target влияет на aggregate distribution или results других targets.

Universal `always recalculate whole batch` не вводится.

## 43. Aggregate redistribution

Если original Accrual распределял fixed aggregate amount по группе:

```text
total 10 000
→ proportional distribution among targets
```

и correction target membership/area изменяет distribution basis, recalculation может требовать пересчитать весь interdependent scope.

Нельзя:

- исправить один target amount изолированно;
- оставить aggregate total/remainder rule нарушенными;
- silently preserve stale results остальных targets.

Для **каждого** target-specific result, сумма которого изменилась внутри interdependent recalculation scope, независимо revalidate соответствующие downstream consequences:

- current fulfillment / Payment Allocations;
- excess applied amount;
- Debt / Overdue;
- Due Date, если change basis её затрагивает;
- Advance / recognized Overpayment / Refund state;
- Penalty/dependent results;
- другие materially affected financial consequences.

Group recalculation не превращает эти target-specific последствия в один общий баланс или один общий excess.

Historical original distribution сохраняется.

## 44. Partial group correction

Если target results independent:

- corrected targets may be processed separately;
- unaffected results remain effective;
- stable target-specific referents from BP-FIN-004 are used;
- retry does not repeat already confirmed correction.

Если original decision requires atomic/interdependent set, partial correction «as-is» запрещена.

## 44.1. Period and claim continuity

Accrual Period сам по себе не является universal obligation identity key.

Period образует самостоятельный monetary claim только если applicable owning financial process/rule определяет каждый такой period как отдельный предметный повод возникновения Financial Obligation.

Например:

- monthly regular charge может создавать отдельный claim для каждого месяца;
- one-off project contribution может иметь period как contextual/informational characteristic одного claim.

Поэтому correction Period требует проверки domain continuity, а не механического правила `period changed → replacement`.

## 45. Rule/version for Recalculation

Перед Recalculation определяются:

- original rule/version;
- historical applicability;
- corrected source inputs;
- rule/version actually applicable to recalculation;
- basis for using same or different version.

Current/latest rule не используется retroactively by default.

Если later decision explicitly changes historical rule applicability, это основание сохраняется in provenance.

## 46. Rounding / calculation order

Recalculation uses historically/applicably determined precision, rounding and calculation-order semantics.

Если change basis требует new rule:

- used new rounding semantics are preserved;
- difference from original semantics remains explainable.

For aggregate recalculation, rounding remainder handling is part of effective rule/result.

## 47. Correction delta

Для explainability process может вычислять:

```text
delta = new effective amount - previous effective amount
```

Delta является derived value, а не обязательным отдельным Accrual.

```text
delta -200
≠ Accrual -200 automatically

delta +200
≠ new Accrual +200 automatically
```

Если domain semantics требует separate new claim, применяется replacement/new Accrual rather than arithmetic delta adjustment.

## 48. Zero result

Recalculation result = 0 может означать:

- same obligation effective amount becomes zero;
- original obligation/result should be cancelled;
- no current Debt;
- full previously applied amount may require disposition.

Fake zero Payment или negative Accrual не создаются.

## 49. Preparation / proposal

До confirmation system may prepare change proposal:

- original result;
- corrected inputs;
- rule/version;
- proposed new result;
- delta;
- obligation continuity/replacement;
- dependent Payments/Allocations;
- expected Debt/Overpayment/Advance/Refund impacts;
- warnings/Requires Decision.

Proposal:

```text
≠ confirmed correction/recalculation/cancellation
```

До confirmation proposal may be recomputed/discarded.

Universal `Accrual Change Proposal` entity не вводится.

## 50. Revalidation before confirmation

Перед confirmation revalidate where applicable:

- original Accrual still effective/relevant;
- source correction/basis;
- rule/version applicability;
- target/result referent;
- obligation continuity;
- current obligation amount/state;
- Payments and current effective allocations;
- Advance/Overpayment/Refund state;
- penalty/dependent results;
- authority;
- concurrent corrections/recalculations.

Stale proposal не подтверждается.

## 51. Concurrent changes

Если два процесса одновременно изменяют same Accrual/obligation:

- оба не могут silently establish conflicting effective results;
- later confirmation must revalidate current effective state;
- duplicate retry does not create duplicate correction;
- technical locking mechanism не задаётся настоящим BP.

## 52. Authority

Correction/Recalculation/Cancellation Accrual являются financial significant actions.

Domain authority требуется, где применимо, чтобы:

- initiate review;
- confirm correction/recalculation/cancellation;
- choose applicable rule/version where discretionary choice allowed;
- confirm replacement semantics;
- decide disposition excess amount;
- approve cross-target/group change;
- confirm retroactive applicability where policy allows.

Governance competence source decision remains separate under ADR-008.

Technical access role/right ≠ financial authority.

Automatic confirmation допускается только по explicitly applicable context-owned financial policy/rule, sufficiently determined inputs and explainable consequences.

Otherwise:

```text
→ Requires Decision
```

## 53. Provenance

Для confirmed change должны быть explainable where applicable:

- original Accrual identity/referent;
- original target-specific result;
- original Financial Obligation;
- immediately preceding effective result/change action, который настоящий action пересматривает или изменяет;
- ordered chain предыдущих Correction/Recalculation/Cancellation/Review actions, достаточная для восстановления переходов между effective states;
- change type: correction/recalculation/cancellation/review-no-change;
- change basis;
- corrected source fact and owning process, if any;
- original and used rule/version;
- original and corrected significant inputs;
- original and new effective result;
- derived delta;
- obligation continuity/replacement decision;
- old/new liable parties where applicable;
- period/due date effects;
- affected Payment Allocations;
- excess applied amount;
- chosen dependent disposition or Requires Decision;
- affected Advance/Overpayment/Refund/penalty;
- actor/authority or automatic policy;
- calculation/confirmation/effective times;
- relation to subsequent replacement Accrual where applicable.

Связь с immediately preceding effective result/action является provenance/referential requirement и не требует universal Accrual Revision, Correction Chain или Adjustment entity.

Provenance не требует universal Correction/Adjustment entity.

## 54. Temporal semantics

Следует различать:

- original Accrual calculation/confirmation time;
- original Accrual Period;
- original obligation inception;
- source fact correction time;
- time каждого preceding change action в ordered chain;
- correction/recalculation/review decision time;
- recalculation calculation time;
- confirmation/recording time;
- effective-from time of changed financial result, if applicable;
- Payment movement/allocation times;
- Refund/reallocation times.

Каждый subsequent change должен позволять определить, какое immediately preceding effective state он изменял, даже если все изменения ultimately refer to the same original Accrual.

Retroactive effective change does not backdate the correction action itself.

Historical state must remain explainable for times before and after each change.

## 55. Idempotency / repeated processing

Repeated technical delivery of same correction/recalculation command/evidence does not create multiple equivalent changes.

```text
retry
≠ new recalculation
≠ second cancellation
≠ duplicate replacement Accrual
```

New evidence, new source correction or new applicable decision may justify a new distinct change action.

## 56. Основной сценарий: уменьшение уже оплаченного начисления

1. Original Accrual = 1000.
2. Financial Obligation = 1000.
3. Payment 1000 recognized.
4. Payment Allocation 1000 fulfills obligation.
5. Source fact is corrected by owning process.
6. BP-FIN-005 Recalculation determines correct amount = 800.
7. Original Accrual 1000 remains historical.
8. Same obligation continuity is confirmed; effective amount becomes 800.
9. Original Payment 1000 remains unchanged.
10. Original Allocation remains historical; only 800 continues to fulfill current effective obligation.
11. Excess applied amount = 200.
12. 200 does not automatically become Refund/Advance/Reallocation.
13. Applicable policy/basis determines Overpayment or another permitted disposition.
14. Provenance links source correction, Recalculation and dependent result.

## 57. Проверочные сценарии

### 57.1. Amount decrease, unpaid

Obligation 1000, no Payment.

Recalculation → 800.

```text
Debt 1000 → current Debt 800
Payment changes = none
```

### 57.2. Amount increase, partially paid

Obligation 1000, Payment Allocation 600.

Recalculation → 1200.

```text
fulfilled = 600
current Debt = 600
```

Payment/Allocation unchanged.

### 57.3. Fully paid then decrease

Obligation 1000, fulfilled 1000.

Recalculation → 800.

```text
current fulfillment needed = 800
excess applied amount = 200
```

Further disposition required.

### 57.4. Cancellation fully paid Accrual

Accrual/Obligation 1000 fully paid.

Valid cancellation → effective obligation 0.

Original Payment remains.

Applied 1000 becomes excessive relative to current obligation and requires disposition; Refund is not automatic.

### 57.5. Wrong liable Subject

Accrual assigned to Owner A, correct historical liable party is Member B.

Correction does not replace A with B silently.

Old result loses/changes effective effect; replacement obligation/Accrual for B is recognized separately where applicable.

Existing Payment A is not automatically allocated to B obligation.

### 57.6. Wrong Personal Account, same claim

Liable Subject and obligation are correct; PA context is wrong.

Correction fixes PA link traceably.

Payment Allocation remains if still semantically valid.

### 57.7. Wrong Article only

Accrual amount/basis/obligation remain correct; Article classification is wrong.

Article correction is traceable.

No amount Recalculation or Payment action required unless dependent Budget/Funding semantics are affected.

### 57.8. Corrected Reading

Reading correction changes Consumption 120 → 100 kWh.

Resource process corrects Reading/Consumption first.

Historical tariff = 5 UAH/kWh.

BP-FIN-005:

```text
600 → 500
delta = -100
```

No `Accrual -100` is created automatically.

### 57.9. New tariff version not retroactive

Original August Accrual uses Tariff v3.

September Tariff v4 appears.

No historical Recalculation occurs only because v4 exists.

### 57.10. Explicit retroactive rule decision

Competent valid decision establishes that corrected Tariff v3.1 applies to August.

Recalculation records:

- original v3;
- new v3.1;
- decision/basis;
- corrected August result.

### 57.11. Duplicate Accrual unpaid

Same one-off decision accidentally confirmed twice.

Duplicate result cancellation preserves both historical Accruals but only legitimate result remains effective.

No negative Accrual is created.

### 57.12. Duplicate Accrual paid

Duplicate obligation 500 was paid.

After duplicate cancellation:

- Payment remains real;
- Allocation history remains;
- 500 becomes excess applied amount;
- disposition requires applicable semantics.

### 57.13. Original obligation independent of Accrual

Accrual classification is cancelled, but Financial Obligation has independent contractual basis.

Cancellation Accrual does not cancel obligation automatically.

### 57.14. Recalculation result unchanged

Corrected source input changes intermediate value but final rounded amount remains 500.

Review/Recalculation may be historically explainable, but no new effective amount change is required.

### 57.15. Aggregate group redistribution

Total 10 000 distributed by area among 10 plots.

One historical area is corrected.

Because target results are interdependent, whole distribution scope is recalculated while aggregate total remains according to rule.

Original per-target results remain historical.

### 57.16. Independent target correction

Group fixed 500 per plot.

One target was incorrectly included.

Its result can be corrected/cancelled independently if rule says target cases are independent.

Others remain unchanged.

### 57.17. Partial group retry

3 independent target corrections confirmed; technical retry repeats command.

No duplicate correction actions/results are created.

### 57.18. Penalty exists after obligation decrease

Obligation 1000 overdue; Penalty 50 calculated historically.

Obligation recalculated to 800.

Penalty 50 is not silently changed.

Specialized penalty recalculation/review required.

### 57.19. Existing Advance after increase

Obligation 500 fulfilled; Advance 300 exists for same purpose.

Recalculation increases obligation to 700.

Advance may be applied by separate applicable allocation/advance process; Accrual change itself does not consume it.

### 57.20. Overpayment followed by later increase

First Recalculation 1000 → 800 after full payment creates recognized Overpayment 200.

Later valid Recalculation 800 → 900.

Current Overpayment may reduce according to owning semantics, but historical first Recalculation and Overpayment remain explainable.

### 57.21. Refund already executed then increase

After 1000 → 800, 200 Refund was executed.

Later obligation returns to 1000.

Refund Payment remains history; current Debt may become 200.

### 57.22. Refund obligation pending then basis changes

Refund Obligation 200 exists but not paid.

Later valid Recalculation reduces refundable excess to 50.

Refund obligation is revalidated/changed traceably; stale 200 refund is not executed.

### 57.23. Due date correction only

Amount 1000 unchanged.

Due Date corrected 1 Sep → 15 Sep on sufficient basis.

Historical Overdue state revalidates; Accrual amount does not change.

Penalty, if any, requires separate review.

### 57.24. Wrong period changes claim identity

Monthly Accrual was mistakenly recorded as August but evidence shows it is September and monthly periods represent separate claims.

Do not mutate August obligation into September merely for convenience.

Original result corrected/cancelled; September replacement Accrual/obligation recognized separately.

### 57.25. Wrong period but same claim

One-off project contribution has informational Period misclassified, while basis/claim/parties remain same.

Traceable period correction may preserve obligation continuity.

No universal `period change = replacement` rule.

### 57.26. Source correction does not require financial change

Object Area 600 → corrected 599.6, but applicable rounding leads to same Accrual 6000.

No financial delta required.

### 57.27. Cancellation decision prospective only

Governance decision cancels contribution for future periods from October.

Historical September Accrual remains effective unless decision/rule explicitly has retroactive effect.

### 57.28. Wrong target replacement with prior payment

Owner A was wrongly charged/paid 500; correct obligation belongs to B.

A's real Payment remains.

Old allocation cannot be silently transferred to B.

Correct obligation B is separately recognized; A's applied amount needs disposition.

### 57.29. Recalculation plus immediate Reallocation

Recalculation 1000 → 800 creates excess 200.

Applicable policy and authority immediately reallocate 200 to another valid obligation.

One business interaction may coordinate:

```text
BP-FIN-005 Recalculation
+
BP-FIN-001 Reallocation
```

but they remain separate domain actions/results.

### 57.30. Recalculation to zero without Payment

Obligation 500 unpaid.

Recalculation → 0.

No Debt remains; no Refund/Overpayment exists because no money was applied.

### 57.31. Different currency suggested by correction

Original obligation = 1000 UAH.

Correction evidence suggests 1000 EUR.

BP-FIN-005 does not perform implicit currency conversion or assume same obligation identity automatically.

If original obligation already has confirmed Payment Allocation in UAH, the currency mismatch does not authorize implicit conversion, relink or preservation of obligation identity merely for convenience. Existing Payment/Allocation history remains unchanged until a separate supported decision/process resolves the currency/claim semantics.

Requires Decision / separate multi-currency semantics.

### 57.32. Excess is not available for duplicate Initial Allocation

Payment 1000 had confirmed Allocation 1000 to Obligation A.

Recalculation A: 1000 → 800.

```text
fulfillment A = 800
excess applied amount = 200
```

Before any Reallocation/Refund/Advance disposition, another process tries Initial Allocation 200 to Obligation B.

This is rejected:

```text
confirmed Allocation/current effective financial use still accounts for 1000
→ available amount for new Initial Allocation = 0
```

To direct 200 to B, use BP-FIN-001 Reallocation or another explicitly applicable disposition.

### 57.33. Replacement as late initial Accrual

Original August Accrual was assigned to wrong target and is corrected/cancelled.

Correct August claim for another target never had an Accrual in Community OS.

BP-FIN-004 may recognize replacement as late initial:

```text
historical/effective context = August
recording/confirmation = later date
new Accrual identity
```

Original erroneous Accrual remains history.

### 57.34. Aggregate recalculation with mixed payment states

Aggregate contribution 10 000 is distributed among three targets.

Before correction:

- Target A is fully paid;
- Target B is partially paid;
- Target C is unpaid.

Corrected area of one target changes all three amounts.

Interdependent Recalculation recomputes the whole target set.

Then each target is processed independently for downstream consequences:

- A may produce excess applied amount;
- B may produce either additional Debt or excess depending on new amount;
- C changes Debt only;
- any existing Penalty/recognized Overpayment/Advance/Refund consequences are revalidated per target.

No group-wide synthetic Overpayment or group-wide Payment disposition is created.

### 57.35. Sequential Recalculations form an ordered chain

Original Accrual effective amount = 1000.

Successive valid Recalculations produce:

```text
R1: 1000 → 800
R2: 800 → 900
R3: 900 → 750
```

Each action preserves:

- link to original Accrual;
- link to immediately preceding effective result/action;
- own basis/rule/inputs/time;
- own downstream disposition state.

R3 must not be explainable only as `original 1000 → current 750`; transitions through 800 and 900 remain reconstructible.

### 57.36. Excess from one allocation of a multi-obligation Payment

Payment 1500 has confirmed Allocations:

```text
1000 → Obligation A
500  → Obligation B
```

Recalculation changes A from 1000 → 800.

```text
excess applied amount for Allocation A = 200
Allocation B remains effective 500
```

Excess is scoped to the affected Allocation/use, not to the whole Payment.

Until separate disposition/Reallocation, total current effective financial use still accounts for the full 1500 and prevents duplicate Initial Allocation of the same 200.

### 57.37. Correction of erroneous Cancellation vs new claim after valid Cancellation

Case 1 — Cancellation itself was erroneous:

```text
Accrual A valid
→ erroneous Cancellation C1
→ Correction of C1
```

A subsequent correction may restore the effective financial effect of the original Accrual while preserving A, C1 and correction history. New Accrual identity is not required merely because an erroneous Cancellation temporarily removed effect.

Case 2 — Cancellation was valid, later a new business basis creates a new claim:

```text
Accrual A
→ valid Cancellation
→ later new decision/basis
→ new claim
```

The later claim is evaluated as new/replacement Accrual according to BP-FIN-004/owning semantics; the old Accrual is not silently "uncancelled".

## 58. Инварианты

1. Confirmed Accrual is never silently overwritten/deleted.
2. Accrual Correction ≠ Recalculation ≠ Cancellation ≠ Review.
3. Source fact correction ≠ Accrual change automatically.
4. New current Rule/Tariff version ≠ retroactive Recalculation automatically.
5. Recalculation preserves original calculation history.
6. Cancellation preserves original Accrual history.
7. Negative Accrual/Storno is not a universal correction mechanism.
8. Accrual change ≠ Payment correction.
9. Accrual change ≠ Payment Reallocation.
10. Accrual change ≠ Refund.
11. Accrual change and Financial Obligation change are distinct but may be coordinated.
12. Same domain Financial Obligation may preserve identity across amount correction when continuity is supported.
13. Obligation identity is not preserved merely for implementation convenience.
14. Replacement claim receives new obligation/Accrual identity where domain continuity is absent.
15. Wrong liable party does not silently transfer obligation or Payment.
16. Wrong PA/Object context does not automatically imply new obligation.
17. Article correction does not automatically change amount/obligation.
18. Amount decrease does not create negative Accrual.
19. Amount increase does not require delta Accrual when it is same claim Recalculation.
20. Payment remains unchanged by Accrual change.
21. Confirmed Payment Allocation remains historical after obligation change.
22. Excess applied amount is a derived process value, not a new fundamental entity.
23. Excess applied amount ≠ Overpayment/Advance/Refund/Reallocation automatically.
24. Excess applied amount does not become Unallocated Remainder or available Initial Allocation while existing confirmed Allocation/current effective financial use still accounts for it.
25. Overpayment may arise from changed effective financial state.
26. Advance requires meaningful future purpose.
27. Refund requires separate BP-FIN-003 semantics.
28. Reallocation requires separate BP-FIN-001 semantics.
29. No universal excess disposition order exists.
30. Unallocated Remainder is not automatically consumed by increased obligation.
31. Existing Advance is not automatically consumed by increased obligation.
32. Historical Refund Payment is never reversed silently by later Accrual change.
33. Debt derives from current effective obligation and fulfillment.
34. Due Date change requires sufficient basis and does not follow amount change automatically.
35. Penalty is not silently recalculated after base obligation change.
36. Resource/relationship/governance source corrections occur in owning contexts first.
37. Current/latest rule is not retroactively applied by default.
38. Group recalculation scope follows dependency semantics, not batch implementation.
39. Aggregate interdependent distribution is recalculated consistently.
40. Independent target correction need not change unaffected results.
41. Delta is derived, not necessarily a separate Accrual.
42. Zero result does not create fake Payment/negative Accrual.
43. Proposal ≠ confirmed correction/recalculation/cancellation.
44. Confirmation revalidates materially significant current state.
45. Technical retry ≠ new financial change.
46. Domain authority ≠ technical access.
47. Retroactive financial effect does not backdate correction action.
48. Excess applied amount does not create Overpayment automatically; Overpayment remains a recognized financial state according to applicable semantics.
49. Each subsequent change links both to original Accrual and to the immediately preceding effective result/change required to reconstruct the ordered history.
50. Interdependent group recalculation revalidates downstream financial consequences separately for every affected target.
51. Period participates in claim identity only when the owning financial semantics defines periods as separate claims.
52. Erroneous Cancellation may itself be corrected without forcing a new Accrual identity; a later new claim after valid Cancellation is not a silent un-cancel.
53. No universal Correction/Adjustment/Storno/Accrual Revision entity is introduced.

## 59. Что намеренно не решается

Настоящий BP не определяет:

- correction исходных resource/object/governance facts;
- regular Accrual workflow;
- initial Accrual (BP-FIN-004);
- Payment recognition correction;
- Payment Allocation/Reallocation internals;
- Refund internals;
- penalty formula;
- universal Overpayment/Advance disposition workflow;
- settlement/set-off/netting;
- multi-currency conversion;
- accounting storno/postings;
- BAS/BAF document generation;
- tax treatment;
- legal rules retroactivity/cancellation for specific jurisdiction;
- technical transactions/locking;
- UI.

## 60. Связанные документы

- `docs/DOMAIN_MODEL.md`;
- `docs/TERMINOLOGY.md`;
- ADR-003;
- ADR-004;
- ADR-005;
- ADR-006;
- ADR-008;
- ADR-010;
- ADR-011;
- `BP-FIN-004-ONE-OFF-ACCRUAL.md`;
- `BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md`;
- `BP-FIN-001-PAYMENT-REALLOCATION.md`;
- `BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md`;
- `BP-FIN-003-REFUND.md`;
- REFERENCE_CANDIDATE_MATRIX;
- OSBBX_REFERENCE_ANALYSIS.

## 61. Нормативные последствия

Предварительно новый ADR и новая fundamental entity не требуются.

После review следует проверить необходимость точечной синхронизации DOMAIN_MODEL/TERMINOLOGY по:

- Recalculation как новое применение rule с сохранением original Accrual;
- Cancellation Accrual effect without deletion;
- obligation continuity/replacement;
- excess applied amount as process-derived value;
- consequences for already paid obligations;
- group/interdependent Recalculation scope.

Если действующие ADR-006/DOMAIN_MODEL already sufficient, нормативную модель не следует дублировать только ради BP.

После принятия BP-FIN-005 можно окончательно закрыть `REF-FIN-006`.

## 62. Открытые вопросы для review

Перед принятием Draft независимо проверить:

1. достаточно ли distinction Correction / Recalculation / Cancellation / Review;
2. корректна ли same-domain-obligation continuity model;
3. нужны ли более строгие criteria для replacement obligation;
4. корректно ли replacement Accrual возвращать в BP-FIN-004;
5. достаточно ли model excess applied amount without new entity;
6. должен ли Overpayment возникать автоматически whenever applied amount > effective obligation;
7. корректно ли не менять confirmed Payment Allocation при obligation decrease;
8. достаточно ли BP-FIN-001 для subsequent movement of excess to another obligation;
9. как связать recognized Advance/Overpayment with later opposite Recalculation without universal cascade;
10. достаточна ли Refund obligation revalidation boundary;
11. нужен ли отдельный BP для penalty Recalculation;
12. достаточно ли group correction scope model;
13. как трактовать Article/Period corrections относительно identity;
14. нужна ли нормативная фиксация Obligation continuity/replacement в DOMAIN_MODEL;
15. нужен ли mirror note в BP-FIN-001/ALLOCATION-001;
16. какие части REF-FIN-006 можно считать полностью закрытыми после BP-FIN-005.

## 63. Следующий шаг

1. internal review против ADR-003/004/005/006/008/010/011 и соседних financial BP;
2. pilot-ST scenario review;
3. independent Claude review;
4. point fixes;
5. normative synchronization and close REF-FIN-006;
6. перейти к BP-CASH-001.
