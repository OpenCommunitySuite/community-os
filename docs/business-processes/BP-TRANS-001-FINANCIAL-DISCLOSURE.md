# BP-TRANS-001 — Финансовая прозрачность и раскрытие финансовой информации

**Статус:** Draft
**Контексты:** Финансовые отношения + Документы и формализация + Коммуникации и обращения + сквозные Access/Rules/History
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий BP определяет предметные границы финансовой прозрачности Community OS:

- какие финансовые сведения могут быть представлены разным аудиториям;
- чем личный финансовый просмотр отличается от раскрытия финансов Community;
- чем контрольный/ревизионный доступ отличается от публичного раскрытия;
- как current projection отличается от исторически значимого опубликованного отчёта;
- как сохраняются provenance, freshness, corrections и disputed semantics;
- почему раскрытие/проекция не становятся вторым источником финансовой истины.

Базовая модель:

```text
authoritative financial facts
+ applicable locally owned disclosure rules
+ viewer/visibility scope
+ explicit temporal semantics
→ disclosure selection / aggregation / redaction
→ Read Model / Projection
→ authorized dynamic view
```

Если требуется исторически зафиксированное официальное раскрытие, действует отдельная ветвь:

```text
authoritative financial facts
+ applicable locally owned rules
+ report-generation semantics
→ Document / Revision / Representation
→ approval/signing where applicable
→ Publication to Audience
```

Dynamic projection и formal Publication используют одни authoritative source facts, но одна ветвь не является обязательным источником другой.

Ключевая граница:

```text
financial fact
≠ disclosure rule
≠ Read Model / Projection
≠ Document
≠ Publication
≠ technical access
```

## 2. Нормативная основа

BP развивает уже принятые решения:

- ADR-006 — Financial Obligation, Accrual, Payment, Bank Transaction, Expense, Budget, Funding Source и другие финансовые facts имеют собственную identity/semantics;
- ADR-004/005 — историчность, corrections и применимые версии правил не переписываются молча;
- ADR-009 — Document, Revision, Representation, Publication и Audience различаются;
- ADR-010 — Domain Power, subject-matter admissibility, Access Role/Right и technical access различаются;
- ADR-013 / TERMINOLOGY — Read Model / Projection является derived representation, не source of truth и не основанием command-side mutation;
- DOMAIN_MODEL / TERMINOLOGY — technical access к Personal Account не означает автоматически право видеть всю его финансовую историю.

Внешний референс DAH подтверждает практическую потребность в финансовой прозрачности для жителей и отдельном рабочем сценарии ревизионной комиссии, но не является источником требований.

## 3. Что входит

BP охватывает:

- персональную финансовую видимость Subject / Personal Account;
- финансовую прозрачность Community для owner/member audience;
- oversight/revision access;
- публичное раскрытие;
- текущие и исторические представления;
- aggregation;
- redaction/minimization;
- disputed/corrected facts;
- provenance/explainability;
- freshness/as-of;
- formal reports/publications;
- динамические Read Models;
- export/download representation;
- связь с Documents и supporting evidence;
- правила disclosure eligibility.

## 4. Что не входит

BP не определяет:

- UI/dashboard design;
- конкретные графики;
- SQL/OLAP/BI technology;
- cache/storage implementation;
- конкретный RBAC/ABAC mechanism;
- privacy/legal requirements конкретной юрисдикции;
- обязательный состав финансовой отчётности;
- бухгалтерскую/налоговую отчётность;
- план счетов BAS/BAF;
- новый financial ledger;
- новый universal Audit context;
- публичный список должников;
- universal report taxonomy;
- конкретные сроки публикации;
- legal retention periods.

## 5. Никакого второго финансового source of truth

Раскрываемая информация строится из authoritative facts owning contexts.

```text
Financial Obligation
Accrual
Payment
Payment Allocation
Bank Transaction
Expense
Budget / Budget Item
Funding Source
Expense Financing
...
→ disclosure projection/report
```

Projection/report не заменяет исходные facts.

Исправление отображения не должно использоваться как способ исправить Financial Obligation, Payment, Expense или иной source fact.

## 6. Не вводится универсальная Financial Transparency entity

Финансовая прозрачность — процесс selection/presentation/disclosure, а не новый фундаментальный финансовый факт.

Не вводятся universal:

- Financial Transparency;
- Financial Disclosure Record;
- Transparency Transaction;
- Public Finance Entity;
- Financial Snapshot entity.

Если требуется исторически значимое официальное раскрытие, существующие Document/Revision/Representation/Publication semantics используются явно.

Если требуется живой просмотр, используется derived Read Model / Projection.

## 7. Основные сценарии видимости

Не следует объединять в один смысл:

1. **Personal financial view** — Subject видит допустимые сведения, связанные с его отношениями и с Personal Accounts, относящимися к соответствующим объектам/финансовым отношениям;
2. **Community transparency view** — допустимый participant/viewer scope сообщества видит раскрываемые сведения о финансах Community; таким viewer может быть owner, member, resident/tenant либо иной Subject только при наличии поддерживаемого отношения и applicable rule;
3. **Governance/management view** — правление, управляющий орган или другой Subject получает operational financial scope по собственной предметной компетенции и access rules;
4. **Oversight/revision view** — уполномоченный контрольный орган/Subject получает более детальный scope для проверки;
5. **Public disclosure** — сведения доступны широкой/анонимной аудитории по отдельному правилу.

Для dynamic views используется термин **viewer/visibility scope**. Термин **Audience** в смысле ADR-009 сохраняется для formal Publication semantics и не создаётся автоматически для каждой technical viewer group.

Один и тот же financial fact может иметь разную допустимую детализацию в этих сценариях.

## 8. Personal financial view

Personal view может включать, если применимые правила допускают:

- Financial Obligations;
- Accruals;
- Payments;
- Payment Allocations;
- Debt / Overpayment;
- Personal Account state;
- related Documents/Representations.

Но:

```text
User Account access
≠ ownership
≠ Personal Account relationship
≠ universal right to all historical finance
```

Visibility определяется применимыми Subject/Object/Community relations, Domain Power и applicable disclosure/access rules.

Personal Account относится к объекту/группе объектов, а не к конкретному owner. Поэтому при смене собственника следует различать:

- current Personal Account state / object-related financial state, который может быть доступен новому Subject только по применимому rule;
- person-identifiable historical Payments/Accruals/other facts прежнего Subject, которые не становятся видимыми автоматически;
- Financial Obligations, identity которых не переносится на нового owner только из-за смены ownership.

Смена owner/user не даёт автоматически право видеть чужую прежнюю историю и не переносит финансовые обязательства.

## 9. Community transparency view

Community-level transparency может показывать:

- поступления Community;
- расходы;
- исполнение Budget;
- Budget Items;
- Funding Sources;
- Expense Financing;
- движения по раскрываемым Bank Accounts;
- агрегированные Supplier/contractor expenditures;
- approved projects/Operational Works with financial links;
- другие explicitly disclosed categories.

Не существует universal перечня обязательных показателей для всех Community types.

Community transparency может иметь более узкий domain scope внутри Community — например, конкретный дом, корпус, подъезд, группа объектов, инженерная ветвь или иной already-modeled scope — если такой scope существует в owning context и applicable rule связывает viewer с ним. Stage 9 не вводит universal `Disclosure Scope` entity.

Resident/tenant/use-right relation может участвовать в visibility rule, но не делает такого Subject owner/member и не создаёт одинаковый scope для всех жителей.

## 10. Oversight / revision access

Ревизионная комиссия либо другой контрольный орган не становится hardcoded Access Role.

Сценарий строится на:

```text
Subject
+ participation/position/relationship
+ applicable Domain Power
+ disclosure/access rule
→ permitted oversight scope
```

Контрольный scope может быть шире member transparency и включать детализированные source facts/documents.

Но техническая роль `auditor` сама по себе не создаёт предметное полномочие.

Обычное открытие dynamic oversight view не является Document Publication или отдельным financial disclosure fact. Technical access/audit logging остаётся cross-cutting responsibility. Если требуется исторически доказуемая formal передача конкретного набора сведений контрольному органу, используется применимая Document/Publication/Communication semantics.

## 11. Public disclosure

Public disclosure требует отдельного applicable rule.

```text
exists in finance
≠ public automatically
```

Public view не должен автоматически включать:

- personal debtor identity;
- personal payment history;
- private bank details;
- confidential contractual terms;
- remuneration details tied to identifiable persons;
- other restricted/personal information.

Конкретная legal/privacy policy определяется отдельно.

## 12. Applicable disclosure rules

Stage 9 не вводит один универсальный `Disclosure Rule`.

Согласно ADR-005 disclosure semantics складывается из locally owned rules/versions, каждый из которых принадлежит context, владеющему его предметным смыслом. Например:

- Finance владеет правилами financial selection, classification, aggregation и metric semantics;
- Documents владеет formal Publication/Revision/Representation semantics;
- context, владеющий предметным действием/отношением, определяет его subject-matter admissibility;
- cross-cutting access responsibility применяет Access Rights/Roles и technical authorization без присвоения ownership предметным правилам;
- cross-cutting Rules responsibility задаёт общие требования identity/version/history, но не является централизованным owner.

Applicable rule composition может определять:

- viewer conditions / formal Audience where applicable;
- financial scope;
- period;
- aggregation level and additivity semantics;
- allowed dimensions;
- redaction/minimization;
- drill-down;
- freshness and temporal axis;
- requirement for formal historical fixation;
- handling disputed/corrected facts;
- document/evidence visibility.

Applicable disclosure rules не являются новыми financial facts.

Если rule/version materially влияет на historical formal disclosure, фактически использованные версии и существенные параметры должны быть зафиксированы либо однозначно определимы из historical context согласно ADR-005/009.

## 13. Audience vs Access

`Audience` из ADR-009 и technical Access не тождественны.

Для формального Document Publication audience является предметно значимой частью publication semantics.

Для dynamic Read Model visibility может определяться authorization/access scope без создания отдельной Audience entity.

Нельзя автоматически превращать каждую technical viewer group в domain Audience.

## 14. Read Model / Projection

Dynamic financial dashboard/list/report view может быть Read Model / Projection.

Каждая конкретная projection должна иметь declared producer/owner согласно ADR-013. Universal owner всех financial disclosure projections не вводится.

Если view требует данных нескольких modules/contexts:

- используются public application query contracts и/или explicitly published projections owning modules;
- direct cross-module read internal tables не допускается;
- composition layer/BFF/reporting projection не присваивает ownership исходных domain facts или local rules.

Для projection должны быть определимы:

- producer/owner;
- source fact scope;
- Community/sub-scope where applicable;
- visibility semantics;
- freshness;
- explicit temporal semantics.

```text
Read Model
≠ financial source of truth
≠ command model
≠ correction mechanism
≠ owner of source-domain rules
```

## 15. Formal report / official disclosure

Если Community должен зафиксировать конкретное содержание отчёта и факт его раскрытия определённой аудитории, используется existing document model:

```text
financial facts
→ report content generation
→ Document / Revision / Representation
→ approval/signing where applicable
→ Publication to Audience
```

Document не становится владельцем финансовых facts.

Если composition/aggregation/redaction materially определили content formal report, historical context должен позволять установить фактически использованные rule versions/parameters без требования создавать новый Financial Disclosure entity.

## 16. Dynamic view ≠ formal publication

Открытие страницы/dashboard не создаёт Publication автоматически.

```text
authorized dynamic view
≠ Document Publication
≠ legal disclosure fact automatically
```

Если требуется доказательство того, что конкретный набор сведений был официально раскрыт в конкретный момент, это должно иметь explicit historical semantics, например через Document Publication.

## 17. Current view

Current view строится из current effective financial semantics.

Например, если Accrual был corrected/recalculated, current view может показывать effective current result, но не стирает исходную историю.

Current projection должна отличать current state от historical source facts.

## 18. Historical financial reconstruction

Historical view может означать разные вещи:

1. financial state effective for a historical subject period/time;
2. what Community OS knew/recognized at a historical record time;
3. what was actually published/shown in a historically fixed report.

Эти semantics не взаимозаменяемы.

Возможность реконструировать вариант 2 ограничена historical guarantee owning context по ADR-004. Stage 9 не создаёт дополнительную bitemporal/history guarantee поверх source facts.

Universal bitemporal dashboard не вводится.

## 19. Historical publication snapshot

Нельзя утверждать, что сегодняшняя projection точно воспроизводит содержание старого официального отчёта, если этот отчёт/Revision/Representation не был исторически сохранён.

Formal historical disclosure должен опираться на его actual Document/Revision/Publication history.

## 20. Freshness and as-of

Каждая materially current или historical projection должна иметь определимые freshness и temporal semantics.

Термин `as-of` не используется без указания его временной оси. Конкретная projection должна явно определять, означает ли её historical parameter, например:

- effective state at subject time using current known/corrected facts;
- system-recognized/recording state at historical time, если owner context действительно поддерживает такую history guarantee;
- другой explicitly defined temporal view.

Например:

```text
effective data through 2026-09-21 08:00
generated at 2026-09-21 08:05
```

не являются одним фактом автоматически.

Formal historically published content определяется Publication/Revision history, а не реконструируется молча из текущей projection.

Термин `real-time` не вводится как universal guarantee.

## 21. Delayed source/import

Если банковские сведения импортированы с задержкой:

- projection не должна изображать missing transactions как zero activity;
- freshness/as-of должна оставаться понятной;
- later import обновляет current projection;
- old formal publication не переписывается молча.

## 22. Aggregation

Aggregation может выполняться по:

- Budget Item;
- Funding Source;
- Expense category;
- Bank Account;
- period;
- Operational Work/project relation;
- other supported dimensions.

Aggregation использует только существующую semantics.

Для каждой metric/dimension должна быть определима aggregation semantics: additive/mutually-exclusive либо overlapping/non-additive where applicable. Одновременная группировка по нескольким independent many-to-many dimensions не считается additive-safe автоматически.

Нельзя создавать фиктивные Budget Items/Funding Sources/categories ради красивого отчёта.

## 23. Amount consistency

Если projection агрегирует monetary amounts, её результат должен быть объясним через included source facts и transformation/aggregation rule.

Одна monetary portion не должна double-count silently из-за:

- Expense↔Payment link;
- Expense Budget Distribution;
- Funding Source relation;
- Payment Allocation;
- repeated correction versions;
- simultaneous use of several overlapping analytical dimensions.

Bank-account movement totals и classified Expense/Payment totals являются разными metrics/scopes и не суммируются друг с другом автоматически.

## 24. Bank Account transparency

Community может раскрывать balance/movements отдельных Bank Accounts.

Но нужно различать:

- recognized Bank Transactions in Community OS;
- external bank balance/state received from an external source;
- provenance/confirmation time of that external information;
- imported statement completeness;
- derived internal balance from recognized facts.

External bank balance/state является external information и не становится authoritative internal financial fact автоматически.

Bank Transaction ↔ Payment/Expense/other financial operation не имеет universal 1:1 cardinality. Поэтому:

- bank-movement projection и classified financial projection имеют отдельные metric semantics;
- их суммы могут легитимно не совпадать;
- unclassified Bank Transactions остаются representable как unclassified bank movement and must not disappear solely for report neatness.

Если external bank balance не получен/не подтверждён, projection не должна выдавать derived value за подтверждённый bank balance.

## 25. Bank Transaction detail

Раскрытие Bank Transaction может потребовать minimization/redaction:

- counterparty details;
- account numbers;
- payment purpose;
- personal information;
- provider identifiers.

Наличие Bank Transaction не означает, что full raw bank data должно быть видно каждой audience.

## 26. Payments and owner privacy

Individual Payment facts могут быть видимы самому связанному Subject или authorized oversight scope.

Они не должны автоматически попадать в member/public transparency с идентификацией payer.

Community aggregate receipt может строиться без раскрытия personal payer identity.

## 27. Debt and debtor data

Debt является financial state, но:

```text
Debt exists
≠ debtor list public
```

Публичное раскрытие identifiable debtor information требует отдельного privacy/legal/business basis.

Member/owner/resident visibility также не означает automatic right to identifiable debtor list. Такое раскрытие требует explicit applicable rule/basis для соответствующего viewer scope.

Stage 9 не делает identifiable debtor list стандартной функцией ни для public, ни для Community participant view.

## 28. Expenses

Expense transparency может показывать:

- amount;
- purpose;
- period;
- Budget distribution;
- Funding Source coverage;
- Supplier where permitted;
- linked Work/project;
- related Document representations where permitted.

Expense disclosure не означает, что каждый linked Financial Obligation/Payment/Bank Transaction должен быть раскрыт в той же детализации.

## 29. Budget plan vs actual

Transparency должна сохранять:

```text
Budget
≠ Expense
≠ Payment
```

План-факт view может показывать Budget Item plan, recognized Expenses, Payments и другие explicitly defined actual metrics, но metric `исполнение сметы` должен иметь explicit calculation semantics и явно называть basis факта (например, Expense-based, Payment-based либо иной defined basis).

Stage 9 не вводит universal правило, что «факт» сметы всегда считается только по Expense или только по Payment.

## 30. Funding Sources

Funding Source показывает origin/classification of funds, а не технический reserve.

Transparency не должна изображать Funding Source balance/reserve, если такого предметного факта/расчёта нет.

Допустима derived metric целевого накопления/программы только если:

- исходные targeted accrual/receipt/funding classifications и financed Expenses представлены существующими financial facts;
- formula и period явно определены;
- metric не называется «зарезервированными/заблокированными средствами», если отдельная finance semantics такого ограничения не установила.

Если конкретному типу Community нужен юридически/предметно самостоятельный restricted reserve/fund, не представимый текущей Finance model, это отдельный Finance-domain вопрос, а не новая сущность Stage 9.

## 31. Financial Obligations

Financial Obligation может быть показано как payable/receivable scope согласно disclosure rules.

Не следует выдавать:

- obligation as Payment;
- debt as obligation identity;
- planned amount as actual Expense.

## 32. Remuneration and payroll-related data

Community OS может иметь remuneration Accrual/Payment facts.

Member/public transparency обычно должна использовать aggregation/minimization unless specific rules permit identifiable detail.

Stage 9 не определяет payroll/legal disclosure requirements.

## 33. Supplier and contract information

Supplier Expense/Obligation may be disclosed, но Contract Document и confidential terms сохраняют собственные visibility rules.

```text
Expense visible
≠ Contract fully visible automatically
```

## 34. Supporting Documents

Related Document can be linked from projection only when viewer has applicable visibility/access to that Document/Revision/Representation.

Financial projection может показывать только document metadata, разрешённые соответствующим public/query contract и applicable Document visibility semantics. Она не должна читать/раскрывать restricted raw metadata только потому, что сам financial fact видим.

Доступ к Document/Representation проверяется его owning context независимо от financial projection.

Нельзя обходить Document access через financial dashboard.

## 35. Operational Work / project linkage

Stage 8 Work may be shown with related Expenses/Budget usage when useful.

Но:

```text
Work
≠ Expense
```

Projection must not infer cost from Work completion unless financial facts exist.

## 36. Disputed financial facts

Финансовый факт может быть disputed without being invalidated/corrected.

Disclosure rule может:

- show it with disputed marker;
- exclude it from a specific metric only if metric semantics explicitly says so;
- provide separate disputed amount.

Нельзя silently hide disputed facts simply to make report look clean.

Если оспаривается correction/recalculation, именно owning Finance process определяет current effective financial result. Disclosure показывает current effective result согласно source semantics и separately preserves/discloses dispute marker where applicable; Stage 9 не выбирает, какая correction «побеждает».

## 37. Correction and recalculation

When source financial fact changes through valid correction/recalculation/cancellation:

- current projection is rebuilt from current effective semantics;
- historical source history remains;
- previous formal publication remains historical;
- corrected official report requires explicit new Revision/Document/Publication semantics where applicable;
- where correction/replacement/withdrawal of a prior formal publication is materially significant, traceable relation to the affected Revision/Publication must be preserved according ADR-009.

```text
financial correction
≠ edit old publication silently
```

## 38. Projection correction

Bug/error in projection logic is not financial correction.

It should be corrected in projection/report generation while preserving ability to explain affected historical formal publications if they were materially wrong.

No universal Projection Correction entity is introduced.

## 39. Redaction / minimization

Redaction may remove or transform information for a specific audience while source facts remain unchanged.

Examples:

- hide personal name;
- mask account number;
- aggregate individual payments;
- omit confidential contract clause.

Redacted representation ≠ corrected financial fact.

## 40. Drill-down

Drill-down from aggregate to source detail is optional and scope-dependent.

A member may see:

```text
Budget Item total → disclosed Expenses
```

while audit scope may allow:

```text
Expense → Obligation → Payment → Bank Transaction → supporting Document
```

provided each linked fact/document is individually visible under applicable rules.

## 41. Explainability / provenance

A disclosed figure should be explainable to the extent appropriate for its audience.

For aggregate metrics, should be determinable where materially relevant:

- source fact types;
- included scope/period;
- applied aggregation rule;
- effective correction state;
- as-of/freshness;
- excluded/redacted categories;
- applicable disclosure rule/version.

Explainability does not require exposing restricted raw data to every audience.

## 42. Export / download

CSV/XLS/PDF export from transparency view is a representation/export operation.

It is not automatically:

- Document;
- Publication;
- source of truth.

If exported content is formally adopted/published as a report, existing Document/Publication semantics apply.

## 43. Screenshot / cached page

Screenshot/browser cache/download does not automatically create historical official financial statement.

Technical artifacts do not define domain publication semantics.

## 44. Access denial

If viewer loses applicable relation/access:

- future dynamic access may cease;
- historical financial facts are not deleted;
- prior official Publication history remains;
- whether previously downloaded representation can be revoked technically is not a domain rewrite.

## 45. Community boundary / multi-tenant

Disclosure never crosses Community boundary merely because same User Account/Subject participates in several Communities.

Each projection/report has one explicit Community scope unless a separate cross-community product scenario is defined.

Within one Community, projection/report may also have narrower domain scope only when such scope is already modeled by owning contexts and historically determinable where relevant. Stage 9 does not invent a universal sub-Community hierarchy or Scope entity merely for reporting.

## 46. Pilot ST — owner personal account

Plot owner sees:

- own Accruals;
- Payments;
- Payment Allocations;
- Debt/Overpayment;
- related receipts/documents allowed by rules.

He does not receive automatic access to all historical data of prior owner merely because current Object relation exists.

Current Personal Account/object-related state may be visible only under applicable rule and does not transfer prior owner's obligations or expose person-identifiable prior-owner Payment history automatically.

## 47. Pilot ST — member community transparency

Member sees for selected period:

- total recognized member receipts;
- recognized Community Expenses by Budget Item;
- Budget plan vs actual;
- Funding Source usage where semantically defined;
- related Operational Works/projects if disclosed.

Individual payer identity is not required for this aggregate view.

If Community collects owner Payments related to individual resource consumption and separately settles supplier Obligations, transparency keeps these facts distinct:

```text
owner Accrual/Obligation/Payment
≠ Community Expense
≠ supplier Financial Obligation/Payment
```

A displayed `pass-through / reimbursable / transit` grouping is allowed only as an explicitly defined classification/metric supported by existing finance semantics; Stage 9 does not create a universal Transit Payment entity.

## 48. Pilot ST — revision commission

Member of revision commission with valid participation/authority/access can inspect:

- detailed Expenses;
- linked Supplier Obligations;
- Payments;
- Bank Transactions;
- Budget distributions;
- supporting Documents where independently accessible.

Removal from commission does not rewrite historical control actions/documents where they exist; current dynamic access can cease.

Opening the dynamic oversight view itself remains technical access/audit by default, not a new domain Financial Disclosure fact.

## 49. Pilot ST — public website

Community publishes annual summary:

- total receipts;
- total expenses by category;
- Budget execution;
- selected project spending.

No identifiable individual debts/payments are included by default.

If this is an official annual report, it should be a Document/Revision/Publication rather than only a volatile dashboard.

### 49.1. Pilot ОСББ — resident/tenant limited transparency

Resident/tenant with a recognized right-of-use or other supported relation may receive a limited Community transparency scope if applicable rules allow it.

```text
resident/tenant
≠ owner
≠ member automatically
≠ public viewer
```

Access is derived from the actual Subject↔Object/Community relation plus applicable visibility/access rules.

### 49.2. Pilot ОСББ — multi-building / entrance scope

For a Community managing several buildings or entrances, a transparency view may disclose expenses for one building/entrance only to viewers with applicable relation to that already-modeled scope.

Stage 9 does not create a new Building/Entrance hierarchy if the Object/organizational model does not already represent it.

### 49.3. Pilot ОСББ/ЖСК — target accumulation / capital repair

Community wants to show a capital-repair or other target accumulation position.

Projection may show a derived metric such as defined targeted inflows minus defined financed expenses only when source classifications and formula are explicit.

The displayed position is not a bank reserve or legally blocked fund automatically.

### 49.4. Pilot — governance/board financial view

Board member/authorized manager sees operational finance analytics according to participation/position, Domain Power and Access rules.

This scope is distinct from ordinary member transparency and from independent revision/oversight scope.

### 49.5. Pilot — assembly rejects annual financial report

Draft annual report is generated as Document Revision and submitted for applicable approval.

If assembly/governing procedure rejects it:

```text
rejected Revision
→ correction/new Revision
→ new approval attempt
→ Publication only when applicable approval semantics are satisfied
```

Rejected draft is not silently rewritten; prior historical Publications, if any, remain historical.

## 50. Pilot ST — delayed bank statement

On 5 October projection says bank data current through 3 October.

Statement for 4 October arrives later.

Projection updates its current figures but must not claim that old report was based on data unavailable at its original as-of time.

## 51. Pilot ST — corrected expense

September report included Expense 50,000.

Later Expense is validly corrected to 45,000.

Current transparency reflects 45,000 according effective semantics.

Previously published September report remains historically identifiable; corrected official report is new Revision/Publication where required.

## 52. Pilot ST — disputed contractor expense

Recognized Expense is disputed by audit body but not corrected.

Member view may show 20,000 with `disputed` marker or separately disclosed disputed amount according rule.

The system must not silently reduce actual Expense to zero.

## 53. Pilot ST — remuneration

Community pays caretaker/electrician remuneration.

Member transparency may show aggregated `remuneration expense` without person identity.

Revision scope may see detailed facts if applicable authority/access permits.

## 54. Pilot ST — debtor list request

Board asks to show list of debtors publicly.

Stage 9 cannot infer legality/appropriateness from existence of Debt.

Request requires separate privacy/legal/business decision and applicable audience/disclosure rule.

## 55. Pilot ST — cash expenses

Cash Disbursement, Payment and Expense remain distinct.

Transparency may show recognized Expense; cash-channel source may be available for oversight but does not replace Expense semantics.

## 56. Pilot ST — common pump electricity

Recognized Community Expense for pump electricity may be shown in common-use electricity category.

Individual plot electricity Consumption/owner Accrual is not automatically added to Community Expense transparency.

## 57. Outcomes

### 57.1. Authorized dynamic projection

Viewer receives current/as-of derived information in permitted scope.

### 57.2. Formal report generated

A report representation may be created; if recognized as Document, Document semantics apply.

### 57.3. Formal publication

Specific Revision/Representation is published to defined Audience.

### 57.4. Restricted / denied

Viewer does not receive data outside permitted scope.

### 57.5. Redacted / aggregated

Viewer receives reduced/aggregated representation while source facts remain unchanged.

## 58. Provenance

Where materially relevant, disclosure result should make determinable:

- Community;
- viewer/audience semantics;
- financial scope;
- period/as-of;
- source fact classes;
- applied locally owned rule/version set and material parameters;
- aggregation/transformation and additivity semantics;
- redaction/minimization;
- freshness/generated time;
- explicit temporal axis/meaning of historical parameter;
- Document/Revision/Representation where formal;
- Publication/Audience where formal;
- correction/dispute semantics;
- source provenance references appropriate for allowed drill-down.

Это не universal DB schema.

## 59. Инварианты

1. Financial disclosure ≠ new financial source of truth.
2. Read Model / Projection ≠ financial fact.
3. Projection cannot mutate source financial facts.
4. Document ≠ financial fact.
5. Publication ≠ technical access.
6. Dynamic view ≠ formal Publication automatically.
7. Exists in finance ≠ visible to every audience.
8. User Account access ≠ right to all financial history.
9. Current Object relation ≠ right to prior owner's private financial data automatically.
10. Revision commission ≠ hardcoded universal Access Role.
11. Technical Access Role ≠ Domain Power.
12. Public audience ≠ member audience ≠ oversight scope.
13. Debt exists ≠ debtor identity public automatically.
14. Expense visible ≠ linked Document visible automatically.
15. Expense visible ≠ linked Bank Transaction full raw details visible automatically.
16. Budget ≠ Expense ≠ Payment.
17. Funding Source ≠ reserve automatically.
18. Work ≠ Expense.
19. Disputed ≠ corrected ≠ invalidated.
20. Disputed fact must not be silently removed from source-of-truth.
21. Financial correction ≠ silent edit of old publication.
22. Projection bug correction ≠ financial correction.
23. Redaction ≠ financial correction.
24. Aggregation must not silently double-count one monetary portion.
25. Missing/late source data ≠ zero activity.
26. Derived balance ≠ externally confirmed bank balance automatically.
27. Real-time is not a universal freshness guarantee.
28. Historical financial state ≠ historical publication content automatically.
29. Export ≠ Document automatically.
30. Screenshot/cache ≠ official report automatically.
31. Cross-community access is not inferred.
32. Formal disclosure uses existing Document/Publication semantics when historical fixation matters.
33. No universal Financial Transparency/Disclosure entity is introduced.
34. No universal Disclosure Rule/Rule Context is introduced; rule ownership remains local under ADR-005.
35. Every projection has declared producer/owner; composition does not transfer source-domain ownership.
36. Bare ambiguous `as-of` semantics are not allowed; temporal axis must be declared.
37. Bank movement totals ≠ classified Expense/Payment totals and are not automatically additive.
38. Unclassified Bank Transactions remain representable.
39. Member/resident scope ≠ identifiable debtor disclosure automatically.
40. Resident/tenant ≠ owner/member/public viewer automatically.
41. Sub-Community disclosure scope must come from existing domain scope, not a reporting-only invented hierarchy.
42. Current Personal Account state ≠ prior person's identifiable financial history.
43. Overlapping analytical dimensions are not additive-safe automatically.
44. Target-fund position ≠ reserved/blocked funds automatically.
45. Pass-through/transit display classification ≠ new Payment/Expense type.
46. Dynamic oversight access ≠ formal Publication/domain disclosure fact automatically.

## 60. Internal review conclusions

1. Stage 9 does not require a new top-level context.
2. Finance remains owner of financial facts.
3. Documents/Communications remain owners of their publication/communication facts.
4. Read Model/Projection remains a derived technical/application representation.
5. Personal view, Community transparency, oversight access and public disclosure must stay distinct.
6. A universal Financial Disclosure entity is not justified.
7. Formal historical disclosure should use Document/Revision/Representation/Publication rather than a new snapshot entity.
8. Dynamic dashboard does not create Publication.
9. No universal Disclosure Rule is introduced; disclosure semantics compose locally owned rules under ADR-005.
10. Public/member/resident identifiable debtor disclosure is not granted automatically by this BP; it requires explicit applicable rule/basis.
11. Audit/revision body scenario uses existing participation/Domain Power/access model, not hardcoded role.
12. Governance/management view is separate from ordinary member and independent oversight scopes.
13. Current projection may reflect effective corrections; old formal publications remain historical.
14. Source-fact visibility and supporting-Document visibility are checked independently.
15. Every concrete projection requires declared producer/owner and explicit temporal semantics under ADR-013.
16. Sub-Community and resident/tenant scopes reuse existing domain relations/scopes; no new universal reporting hierarchy is introduced.
17. Target accumulation and pass-through utility scenarios are reportable only from existing Finance semantics; Stage 9 does not invent reserve/transit facts.
18. No new ADR is required if existing context boundaries remain sufficient.
19. Independent multi-review Round 1 was required before normative sync and has been completed; no full Round 2 is required after the accepted clarifications.

## 61. Предварительные нормативные последствия

Round 1 подтвердил, что новый ADR и новая fundamental entity не требуются.

Требуется точечная нормативная синхронизация:

- ADR-005 — не менять фундаментальную модель; при необходимости добавить mirror-note, что disclosure использует composition locally owned rules, а не universal Disclosure Rule;
- ADR-006 — financial disclosure/projection source-of-truth boundary, aggregation/additivity, bank-movement vs classified-finance distinction;
- ADR-009 — dynamic view vs formal publication и correction/replacement traceability where needed;
- ADR-010 — изменение не требуется; existing access/admissibility semantics sufficient;
- ADR-013 — изменение минимальное/необязательное, если BP достаточно ссылается на declared projection producer/owner and public-contract composition;
- DOMAIN_MODEL — financial disclosure/current-vs-historical projection boundaries;
- TERMINOLOGY — stable term may be added as process/view semantics only, not entity;
- REFERENCE_CANDIDATE_MATRIX — close REF-TRANS-001 / Stage 9.

VISION does not require change.

## 62. Review status

Frozen Independent Multi-Review Round 1 completed with Claude Chat, DeepSeek and Gemini against `STAGE9-TRANS-001-R1-FINAL`.

Consolidation is recorded in:

`docs/architecture/STAGE-9-FINANCIAL-DISCLOSURE-MULTI-REVIEW-CONSOLIDATION.md`

Result:

- BLOCKER: none;
- new top-level context: not required;
- new universal Financial Disclosure/Transparency entity: not required;
- singular universal Disclosure Rule: explicitly rejected in favor of ADR-005 locally owned rule composition;
- accepted clarifications incorporated into this Draft;
- no unresolved fundamental project-owner decision remains;
- full Round 2 is not required.

## 63. Следующий шаг

1. perform normative synchronization against ADR-005/006/009/013, DOMAIN_MODEL/TERMINOLOGY and REFERENCE_CANDIDATE_MATRIX;
2. final consistency check against current `main`;
3. mark PR #69 ready and merge Stage 9 if clean;
4. proceed to Stage 10 — informal poll.
