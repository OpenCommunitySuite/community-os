# BP-OPS-001 — Операционная работа / Work Order

**Статус:** Draft / architecture accepted / normative synchronization performed
**Контекст:** Операционная деятельность (Community Operations) — принят нормативно
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий BP определяет предметную семантику конкретной операционной работы Community: от recognition operational need до assignment, execution и результата.

Базовая модель:

```text
one or more sufficient bases
→ Operational Work recognized
→ planning / authorization where applicable
→ Work Assignment(s)
→ execution
→ completion/result
→ verification/acceptance where applicable
→ follow-up or new Work where required
```

## 2. Ключевые границы

```text
Appeal
≠ Operational Work
≠ Work Assignment
≠ Management Decision
≠ Document
≠ Expense
≠ Financial Obligation
```

## 3. Operational Work

**Operational Work** — исторически значимый предметный referent конкретной работы, которую Community намерено выполнить, выполняет либо выполнило для достижения определённого operational purpose/result.

Work имеет собственную stable identity.

Её identity определяется coherent operational purpose/scope, а не:

- Appeal ID;
- Document ID;
- executor;
- Expense;
- Supplier contract;
- Management Decision.

## 4. Work Order terminology

Канонический предметный термин Community OS — **Operational Work / Операционная работа**.

`Work Order` допускается только как secondary UX/localization label для управляемой единицы Work и не является отдельным нормативным понятием.

```text
Operational Work
≠ formal written order / permit / work-act Document
```

Если конкретный процесс требует юридически или технически значимый наряд, приказ, допуск, акт либо иной формальный документ, он остаётся `Document`, связанным с Operational Work. Терминология интерфейса не должна стирать эту границу.

## 5. Что входит

- basis/source;
- purpose;
- operational scope;
- target/reference to affected domain objects where applicable;
- priority/deadline where meaningful;
- authorization/decision basis where required;
- responsible/executor assignment;
- planned vs actual time;
- execution history;
- completion assertion;
- result/outcome;
- verification/acceptance where required;
- cancellation;
- follow-up/reopen/new work semantics;
- related documents/evidence;
- related financial/resource/communication facts;
- provenance/corrections.

## 6. Что не входит

- Appeal lifecycle;
- governance decision-making;
- employment relationship;
- Supplier/Contractual Relationship creation;
- inventory/material stock accounting;
- payroll calculation;
- Expense/Payment/Obligation recognition;
- Resource recognition;
- universal incident/problem management;
- universal project-management system;
- UI/kanban/calendar;
- DB/API implementation.

## 7. Основание Work

Operational Work может иметь одно или несколько bases.

Примеры:

- Appeal;
- Management Decision;
- Operational Loss;
- Control Reconciliation result;
- scheduled maintenance rule;
- Contractual Relationship requirement;
- employee observation;
- emergency situation;
- document/evidence;
- other sufficient basis.

Ни один basis не становится Work автоматически без applicable recognition semantics.

## 8. Work без Appeal

Допустимы:

- плановое обслуживание;
- аварийная работа;
- работа по решению правления;
- периодическая проверка;
- contractor work;
- работа по resource result.

Следовательно Appeal не является обязательным owner/lifecycle parent Work.

## 9. Appeal → Work

Appeal может быть одним из bases Work.

```text
Appeal → 0..N Works
Work → 0..N Appeals
```

Несколько Appeals о том же фонаре могут вести к одной Work.

Work completion не закрывает Appeals автоматически; communication process отдельно определяет response/completion.

## 10. Recognized operational need

Отдельная universal entity `Operational Problem` или `Issue` не вводится.

Если конкретный future process требует самостоятельного incident/problem referent, он должен быть обоснован отдельно.

## 11. Purpose

Work должна иметь sufficiently defined purpose, например:

- восстановить освещение;
- устранить утечку;
- заменить повреждённый участок трубы;
- выполнить плановое обслуживание;
- убрать территорию.

Generic text «сделать что-нибудь» не является достаточной domain semantics.

## 12. Target

Work может относиться к предметам других contexts:

- Property/Object;
- common property;
- Engineering System;
- branch/topology element;
- Accounting Point/Meter;
- Community as a whole;
- another supported target.

Universal `Work Target` entity не вводится.

Target relation должна быть typed/contextual и ссылаться на предметную identity, предоставляемую owning context. Она не переносит ownership target в Community Operations и не разрешает этому context изменять target semantics напрямую.

Не вводится universal technical `Target Reference`, `ContextId + EntityId` contract или единый polymorphic storage pattern: конкретная DB/API/integration addressation относится к implementation/contract design, а не к Stage 8 domain model.

## 13. Text location

Свободное описание места может использоваться как evidence/context.

Если structured domain target уже известен, text location не должен подменять его identity.

## 14. Work recognition

Work возникает как отдельный предметный referent после признания достаточного operational basis/purpose.

```text
Appeal received
≠ Work created automatically
```

Likewise:

```text
Management Decision
≠ Work created automatically
```

unless applicable rule/process explicitly creates it.

## 15. Authority

Следует различать:

- authority to recognize/create Work;
- authority to authorize execution;
- authority to assign performer;
- authority to report completion;
- authority to accept/verify result.

Они не обязаны принадлежать одному Subject.

Согласно ADR-010 предметная допустимость конкретного operational action может зависеть от Domain Power, Representation, должности, employment/service relation, участия в органе управления, решения, applicable rule и других достаточных оснований.

Community Operations владеет semantics допустимости собственных operational actions, но не присваивает ownership исходных оснований:

- Subject identity остаётся в контексте Subjects;
- Representation — в контексте «Полномочия и представительство»;
- employment/service/Contractual Relationship — в контексте Subject↔Community relations;
- Management Decision — в Governance;
- technical access — cross-cutting responsibility.

```text
Technical access
≠ Representation
≠ Domain Power
≠ operational action admissibility automatically
```

Work Assignment также не создаёт universal Domain Power автоматически.

## 16. Emergency work

Emergency Work может начаться без предварительного Management Decision, если applicable authority/rule это допускает.

Post-factum Document/Decision может зафиксировать, подтвердить или одобрить последствия там, где этого требует конкретный процесс, но не переписывает actual start time.

Emergency Work либо Work Result может быть одним из bases/evidence для последующего финансового recognition, однако:

```text
Emergency Work
≠ Financial Obligation automatically
≠ Expense automatically
```

Финансовый контекст самостоятельно определяет sufficient basis по своей семантике. Универсальное правило «сначала interim financial fact, затем обязательное post-factum approval» не вводится.

## 17. Planned Work

Planned Work и actual execution различаются.

```text
planned start/end
≠ actual start/end
```

Планирование не доказывает выполнение.

## 18. Recurring maintenance

Recurring rule/schedule может порождать отдельные Work instances.

Не следует моделировать год планового обслуживания как одну бесконечную Work только ради recurring UI.

## 19. Priority

Priority may be configured/process-specific.

Universal severity/priority taxonomy не вводится.

## 20. Deadline

Deadline/SLA может быть применим, но overdue semantics определяется конкретной policy.

Missed deadline не означает Work failure автоматически.

## 21. Work Assignment

**Work Assignment** — исторически значимое отношение конкретного Subject к конкретной Operational Work в contextual role на применимом интервале/временном контексте.

Установление, изменение и прекращение Assignment являются исторически значимыми действиями/provenance этого отношения. Отдельная universal `Assignment Event` entity не вводится.

Possible roles:

- responsible;
- executor;
- coordinator;
- verifier;
- other process-specific role.

Closed universal role list не вводится.

## 22. Internal employee

Employee may be assigned as executor.

Assignment:

```text
≠ employment relation
≠ remuneration accrual
```

Existing employee/service relation remains owned by its context.

## 23. External contractor

External Subject may perform Work.

Execution role does not automatically make Subject Supplier.

Supplier/Contractual Relationship may separately exist in financial/relationship contexts.

```text
Work executor role
≠ Supplier role automatically
```

### 23.1. Community member / volunteer executor

Community member, resident, board member or another Subject may perform Work voluntarily or without employment/Supplier relationship, when applicable rules and authority permit it.

```text
volunteer/community-member executor
≠ Employee automatically
≠ Supplier automatically
≠ Contractual Relationship automatically
```

Work Assignment must not require creation of fictitious employment or contractor relations merely to record real execution.

## 24. Multiple performers

One Work may have several concurrent/sequential performers.

Universal one-assignee invariant not introduced.

## 25. Assignment history

Reassignment does not overwrite previous assignment.

Should remain explainable:

- who was assigned;
- role;
- applicable interval/time;
- who/what basis changed assignment.

## 26. Execution

Actual work execution is distinct from assignment.

```text
assigned
≠ started
≠ performed
≠ completed
```

## 27. Start

Actual start time may differ from planned start or assignment time.

Record time ≠ actual start time.

## 28. Pause/block

Work may be blocked/paused, e.g.:

- no access;
- waiting material;
- waiting contractor;
- weather;
- safety;
- dependency on another Work;
- other.

Universal blocked-reason taxonomy not introduced.

## 29. Dependency between Works

Works may be related:

- follow-up;
- prerequisite;
- caused-by;
- replacement;
- other local relation.

Universal project/task graph model not introduced.

## 30. Scope change

Scope correction сохраняет identity Work только пока сохраняется coherent operational purpose и target/intervention identity.

Практический ориентир:

- уточнение деталей, объёма или способа выполнения при сохранении той же цели и target может быть explicit scope correction;
- изменение operational purpose;
- замена target на другой самостоятельный domain object;
- новая occurrence;
- самостоятельная дополнительная intervention

обычно требуют новой linked Work.

Это не universal automatic algorithm, но изменение purpose/target не должно использоваться для бесконечного расширения identity старой Work.

Silent rewriting of started/completed Work scope is not allowed.

## 31. Completion assertion

Performer/responsible Subject may assert that execution is complete.

```text
completion assertion
≠ accepted result automatically
```

Some Work types need independent verification/acceptance, others do not.

## 32. Work Result

**Work Result** — historically significant outcome of execution/completion in context of the Work.

Possible semantics include:

- completed as intended;
- partially completed;
- failed/no result;
- no action required;
- unable to complete;
- other process-specific outcome.

Closed universal result taxonomy not introduced.

Каждый признанный Work Result сохраняется как исторически объяснимый факт. Позднейшая доработка, reopen, correction или acceptance не удаляет предыдущий result молча.

Work Result ≠ Document.

## 33. Result evidence

Evidence may include:

- photo;
- act/report;
- telemetry/Reading;
- test result;
- comment;
- contractor document;
- other.

Evidence does not become Work Result automatically.

## 34. Verification / acceptance

Where required, Work Result may be verified/accepted separately.

Acceptance:

- may be by different Subject;
- may have evidence/document;
- may fail/reject completion;
- does not automatically create Payment/Expense.

## 35. Completed but not accepted

Valid state:

```text
execution complete
result awaiting verification
```

Do not force one universal `closed` state.

## 36. Completed work does not imply issue resolved

Work can be technically completed but original Appeal/problem may remain unresolved.

Example: lamp replaced, but power line fault remains.

Appeal/operational basis re-evaluates separately.

## 37. Cancellation

Work may be cancelled on sufficient basis.

Cancellation does not delete history and does not mean source Appeal was invalid.

## 38. No longer required

Work can become unnecessary because:

- condition disappeared;
- another Work solved it;
- scope changed;
- decision reversed;
- other.

This outcome remains distinct from successful execution.

## 39. Reopen vs new Work

After completion, a need may reappear.

Reopen той же Work допустим, когда есть sufficient basis считать прежнее completion premature/incorrect/incomplete и при этом сохраняется identity той же intervention:

- тот же operational purpose;
- тот же materially relevant target;
- продолжение/исправление той же работы, а не новая occurrence.

Reopen является исторически значимым действием с basis/provenance и не удаляет предыдущие completion assertions, Work Results или acceptance history. Если прежний result признан ошибочным/преждевременным, это фиксируется traceably; после дополнительного execution может возникнуть новый Work Result.

A new Work is preferred when:

- new occurrence;
- materially new scope/target;
- independent intervention;
- new operational objective.

Universal automatic reopen rule не вводится.

## 40. Follow-up Work

Result can generate one or more follow-up Works.

Parent/follow-up relation does not merge identities.

## 41. Document boundary

Documents may:

- authorize Work;
- describe assignment;
- record completion;
- evidence result;
- formalize acceptance;
- record contractor obligations.

But:

```text
Document ≠ Operational Work
Document ≠ Work Result
```

## 42. Photo boundary

Photo is evidence/representation and not Work Result or Work identity.

Photo timestamp ≠ actual execution time automatically.

## 43. Management Decision boundary

Management Decision may authorize/require Work.

One Decision may produce several Works.

One Work may rely on several decisions/bases.

Decision remains owned by governance context.

## 44. Expense boundary

Operational Work itself is not Expense.

Examples:

- employee performs work within salary;
- contractor generates Expense;
- material purchase generates Expense;
- no monetary consequence.

```text
Work completed
≠ Expense automatically
```

## 45. Financial Obligation boundary

Contractor acceptance may be one basis for Financial Obligation according financial/contract semantics.

Work Result does not create Obligation automatically.

## 46. Payment boundary

Payment may occur before, during or after Work.

Payment does not establish actual completion.

## 47. Estimate / planned cost

Estimated/planned Work cost:

```text
≠ Expense
≠ Financial Obligation
≠ Payment
```

It may support planning/budgeting.

## 48. Materials

Community OS is not inventory/TMC accounting system.

BP does not introduce stock/material-balance entities.

Execution/Work Result evidence may record actually used materials/components and quantities where this is relevant to explain the work, including a structured descriptive list in a concrete process.

Such evidence:

- does not create universal Material/Stock Item identity automatically;
- does not maintain warehouse balance;
- does not perform accounting write-off;
- does not create Expense automatically.

Material purchase/use may additionally be linked through Documents and separately recognized financial facts where needed.

## 49. Resource boundary

Work may act on engineering infrastructure and produce evidence that later affects resource facts.

Example:

```text
repair leak
→ work result
→ later resource observation/reconciliation
```

Work Result does not rewrite Operational Loss/Reading/Consumption directly.

## 50. Operational Loss → Work

Recognized Operational Loss may be basis Work.

Work completion does not automatically close/correct Operational Loss; resource process evaluates later evidence.

## 51. Communication back to initiator

Work progress/result may be basis for communication/notification/response.

Operational context does not own the Appeal response lifecycle.

## 52. Duplicate Appeals

Multiple Appeals about same issue do not require multiple Works.

Link all relevant Appeals to one coherent Work where appropriate.

## 53. Duplicate Work detection

Same target/title/date does not prove duplicate Work.

Duplicate resolution requires purpose/scope/basis/provenance.

## 54. Correction

Incorrect Work target, assignment, time or result is corrected traceably.

Silent deletion/overwrite of historical execution is not allowed.

Universal Correction entity not introduced.

## 55. Pilot ST — street lamp

```text
owner Appeal: lamp not working
→ Work: restore street lamp L-17
→ electrician assigned
→ actual repair
→ result/evidence
→ separate Appeal response
```

Expense may or may not arise separately.

## 56. Pilot ST — water leak

```text
Operational Loss / employee observation
→ emergency Work
→ plumber assigned
→ pipe repair
→ result
→ later resource verification
```

Work does not rewrite quantified/unquantified Operational Loss automatically.

## 57. Pilot ST — planned pump maintenance

Scheduled maintenance rule:

```text
schedule/basis
→ Work without Appeal
→ assigned employee/contractor
→ result
```

## 58. Pilot ST — contractor road repair

```text
Management Decision / approved need
→ Operational Work
→ external contractor assigned
→ contractor documents
→ work result/acceptance
→ separate Expense/Obligation/Payment processes
```

## 59. Pilot ST — multiple Appeals, one Work

Five owners report the same broken water pipe.

```text
5 Appeals
→ 1 coherent Operational Work
```

Completion/result may support responses to all five Appeals.

## 60. Pilot ST — one Appeal, several Works

Appeal reports low pressure.

Investigation leads to:

- inspect pump;
- repair valve;
- flush section.

These may be separate Works with explicit relations.

## 61. Pilot ST — failed first repair

First Work completed with result 'repair attempted', but fault persists.

Depending on real semantics:

- correct/reopen same Work if completion was premature;
- or create follow-up Work for a new intervention.

No universal automatic rule.

## 62. Pilot ST — emergency work before board decision

Pipe bursts at night.

Authorized emergency executor begins Work immediately.

Later board/document action may formalize consequences without moving actual start time.

### 62.1. Pilot ST — volunteer/community-member work

Several members voluntarily clear fallen branches from a common road.

```text
recognized operational need
→ one Operational Work
→ several community-member Subjects assigned as executors
→ execution/result evidence
```

No Employee, Supplier or Contractual Relationship is invented solely for this Work.

### 62.2. Pilot — access to privately controlled premises/object

Work on common engineering infrastructure may require access through a privately controlled object.

The access/right basis remains owned by applicable Object/Subject/authority semantics. Operational Work records the dependency/block/evidence but does not create a property/use/access right.

### 62.3. Pilot — multi-stage long work

A road repair may include preparation, contractor execution and verification over several days.

These may remain one Work if they preserve one coherent purpose/target/intervention with several Assignments/execution facts, or become linked Works when stages have independent purposes/targets/results. Universal project-task decomposition is not introduced.

## 63. Work Result semantics and current-state projection

### 63.1. Completed and accepted result

Execution completed; applicable verification accepts result.

### 63.2. Completed without separate acceptance requirement

Result itself is sufficient under process policy.

### 63.3. Partial / follow-up required result

Work produced partial result and may create linked follow-up Work.

### 63.4. Failed / unable result

Execution attempted but intended result not achieved.

### 63.5. Cancelled / no longer required termination

Work ends without successful execution; this is not a successful Work Result.

### 63.6. Current state projection

`ongoing`, `blocked`, `awaiting verification`, `completed`, `cancelled` and similar operational labels may be projections over historical Work facts/actions according applicable process policy.

```text
current state projection
≠ Work Result
≠ universal status-machine entity
```

Community OS does not require one rigid state-transition graph for all Work types. Projection must nevertheless respect recognized facts: for example, acceptance cannot silently exist without an applicable result/completion basis.

## 64. Provenance

Where materially relevant, should be determinable:

- Work identity;
- Community;
- basis/bases;
- purpose/scope;
- typed target relations;
- recognition time;
- planned times;
- actual start/end;
- authorization basis;
- assignment history;
- responsible/executor Subjects;
- execution/result history;
- verification/acceptance actions;
- related Appeals;
- related Management Decisions;
- related Resource facts;
- Documents/evidence;
- financial links where separately recognized;
- cancellation/reopen/follow-up relations;
- corrections.

## 65. Инварианты

1. Appeal ≠ Operational Work.
2. Operational Work may exist without Appeal.
3. One Appeal may relate to several Works.
4. Several Appeals may relate to one Work.
5. Management Decision ≠ Operational Work.
6. Document ≠ Operational Work.
7. Work Assignment ≠ employment relation.
8. Work executor role ≠ Supplier role automatically.
9. Assigned ≠ started ≠ completed.
10. Completion assertion ≠ acceptance automatically.
11. Work Result ≠ Document.
12. Work completion ≠ Appeal closure automatically.
13. Work completion ≠ Expense automatically.
14. Work Result ≠ Financial Obligation automatically.
15. Payment ≠ evidence of completion automatically.
16. Planned cost ≠ Expense.
17. Work does not own inventory/TMC accounting.
18. Operational Loss may be basis Work, but Work does not rewrite loss automatically.
19. Resource result may be basis Work, but Work does not own resource fact.
20. Emergency Work may exist without prior Management Decision under applicable authority.
21. Reassignment does not erase assignment history.
22. Cancellation does not erase Work history.
23. Reopen and new follow-up Work are distinct possibilities.
24. Same title/target/date ≠ duplicate proof.
25. Universal Problem/Incident entity is not introduced.
26. Universal Work Request entity is not introduced.
27. Universal Work Target entity is not introduced.
28. Universal material inventory entity is not introduced.
29. Universal status machine is not introduced.
30. Target relation does not transfer target ownership to Community Operations.
31. Work Assignment does not create Representation or universal Domain Power automatically.
32. Volunteer/community-member execution does not require fictitious employment/Supplier relation.
33. Emergency Work does not create Expense/Financial Obligation automatically.
34. Reopen does not erase prior Work Result/acceptance history.
35. Materials usage evidence does not create inventory/TMC accounting automatically.

## 66. Internal review conclusions

1. A standalone Operational Work referent is justified.
2. Work and Appeal must remain many-to-many capable and independently identified.
3. Work can originate from non-communication bases.
4. Work Assignment is a specialized historical Subject↔Work relation with role/temporal provenance; establishment/change/end are historical actions but do not require a universal Assignment Event entity.
5. Internal employee and external contractor use the same execution-role semantics while preserving their own relations.
6. Work Result is distinct from documents and financial consequences.
7. Completion and acceptance are separate where process requires.
8. No universal rigid status machine is required; current state can be a projection over significant actions/outcomes.
9. No universal Problem/Incident/Work Request/Inventory entities are required now.
10. Existing top-level contexts do not provide a clean owner for Operational Work.
11. Proposed new context `Операционная деятельность (Community Operations)` is the preferred architecture option.
12. Because #11 changes ADR-002 top-level context map, it remains a proposal pending architecture acceptance/review.

## 67. Normative synchronization status

**Performed.**

Project owner accepted option A after frozen independent multi-review Round 1.

Synchronized:

- ADR-002 — 11th top-level context `Операционная деятельность (Community Operations)`, including responsibility/boundary/dependencies/results;
- ADR-009 — explicit Appeal ↔ Operational Work boundary;
- DOMAIN_MODEL → **0.25**;
- TERMINOLOGY → **0.22**;
- REFERENCE_CANDIDATE_MATRIX — REF-OPS-001 closed; Stage 8 completed; Stage 9 next.

VISION intentionally unchanged: its existing product-level scope already includes management of internal Community processes and does not need a duplicate capability statement.

## 68. Review

Frozen Round 1 completed with Claude Chat, DeepSeek and Gemini against the same package.

Consolidated result:

- standalone Operational Work referent — supported;
- no existing context provides clean ownership without boundary distortion;
- option A / Community Operations — accepted by project owner;
- review findings not requiring redesign were incorporated;
- second review round is not required because accepted option A was not materially redesigned.

See `STAGE-8-OPERATIONAL-WORK-MULTI-REVIEW-CONSOLIDATION.md`.

## 69. Следующий шаг

1. final consistency check against current `main`;
2. mark PR ready and merge Stage 8;
3. proceed to **Stage 9 — финансовая прозрачность и раскрытие финансовой информации**.

Implementation of operational work does not start merely because Stage 8 documentation is accepted; Documentation First sequence continues through requirements/specification before code.
