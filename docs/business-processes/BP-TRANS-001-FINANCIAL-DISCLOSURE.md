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
+ applicable disclosure rules
+ viewer/audience context
+ time/as-of semantics
→ disclosure selection / aggregation / redaction
→ Read Model / report representation
→ authorized view
   OR formal Document/Publication where required
```

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

## 7. Четыре разных сценария видимости

Не следует объединять в один смысл:

1. **Personal financial view** — Subject видит допустимые сведения, связанные с его отношениями/Personal Accounts;
2. **Community transparency view** — member/owner audience видит допустимые сведения о финансах Community;
3. **Oversight/revision view** — уполномоченный контрольный орган/Subject получает более детальный scope для проверки;
4. **Public disclosure** — сведения доступны широкой/анонимной аудитории по отдельному правилу.

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

Visibility определяется применимыми Subject/Object/Community relations, Domain Power и disclosure/access rules.

Смена owner/user не даёт автоматически право видеть чужую прежнюю историю.

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

## 12. Disclosure rule

Disclosure semantics может определять:

- audience/viewer conditions;
- financial scope;
- period;
- aggregation level;
- allowed dimensions;
- redaction/minimization;
- whether drill-down is allowed;
- freshness/as-of requirements;
- whether historical snapshot/publication is required;
- handling disputed/corrected facts;
- document/evidence visibility.

Disclosure rule не является новым financial fact.

Исторически значимая версия rule должна быть определима, если она влияет на formal historical disclosure.

## 13. Audience vs Access

`Audience` из ADR-009 и technical Access не тождественны.

Для формального Document Publication audience является предметно значимой частью publication semantics.

Для dynamic Read Model visibility может определяться authorization/access scope без создания отдельной Audience entity.

Нельзя автоматически превращать каждую technical viewer group в domain Audience.

## 14. Read Model / Projection

Dynamic financial dashboard/list/report view может быть Read Model / Projection.

Для него должны быть определимы:

- producer/owner;
- source fact scope;
- visibility semantics;
- freshness;
- applicable current/as-of semantics.

```text
Read Model
≠ financial source of truth
≠ command model
≠ correction mechanism
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

Universal bitemporal dashboard не вводится.

## 19. Historical publication snapshot

Нельзя утверждать, что сегодняшняя projection точно воспроизводит содержание старого официального отчёта, если этот отчёт/Revision/Representation не был исторически сохранён.

Formal historical disclosure должен опираться на его actual Document/Revision/Publication history.

## 20. Freshness and as-of

Каждая materially current projection должна иметь определимую freshness/as-of semantics.

Например:

```text
data as of 2026-09-21 08:00
generated at 2026-09-21 08:05
```

не являются одним фактом автоматически.

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

Нельзя создавать фиктивные Budget Items/Funding Sources/categories ради красивого отчёта.

## 23. Amount consistency

Если projection агрегирует monetary amounts, её результат должен быть объясним через included source facts и transformation/aggregation rule.

Одна monetary portion не должна double-count silently из-за:

- Expense↔Payment link;
- Expense Budget Distribution;
- Funding Source relation;
- Payment Allocation;
- repeated correction versions.

## 24. Bank Account transparency

Community может раскрывать balance/movements отдельных Bank Accounts.

Но нужно различать:

- recognized Bank Transactions in Community OS;
- external bank current balance;
- imported statement completeness;
- derived internal balance.

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

Stage 9 не делает public debtor list стандартной функцией.

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

План-факт view может показывать Budget Item plan, recognized Expenses и другие explicitly defined actual metrics, но metric `исполнение сметы` должен иметь explicit calculation semantics.

## 30. Funding Sources

Funding Source показывает origin/classification of funds, а не технический reserve.

Transparency не должна изображать Funding Source balance/reserve, если такого предметного факта/расчёта нет.

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

## 37. Correction and recalculation

When source financial fact changes through valid correction/recalculation/cancellation:

- current projection is rebuilt from current effective semantics;
- historical source history remains;
- previous formal publication remains historical;
- corrected official report requires explicit new Revision/Document/Publication semantics where applicable.

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

## 46. Pilot ST — owner personal account

Plot owner sees:

- own Accruals;
- Payments;
- Payment Allocations;
- Debt/Overpayment;
- related receipts/documents allowed by rules.

He does not receive automatic access to all historical data of prior owner merely because current Object relation exists.

## 47. Pilot ST — member community transparency

Member sees for selected period:

- total recognized member receipts;
- recognized Community Expenses by Budget Item;
- Budget plan vs actual;
- Funding Source usage where semantically defined;
- related Operational Works/projects if disclosed.

Individual payer identity is not required for this aggregate view.

## 48. Pilot ST — revision commission

Member of revision commission with valid participation/authority/access can inspect:

- detailed Expenses;
- linked Supplier Obligations;
- Payments;
- Bank Transactions;
- Budget distributions;
- supporting Documents where independently accessible.

Removal from commission does not rewrite historical audit activity; current access can cease.

## 49. Pilot ST — public website

Community publishes annual summary:

- total receipts;
- total expenses by category;
- Budget execution;
- selected project spending.

No identifiable individual debts/payments are included by default.

If this is an official annual report, it should be a Document/Revision/Publication rather than only a volatile dashboard.

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
- applied disclosure rule/version;
- aggregation/transformation;
- redaction/minimization;
- freshness/generated time;
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

## 60. Internal review conclusions

1. Stage 9 does not require a new top-level context.
2. Finance remains owner of financial facts.
3. Documents/Communications remain owners of their publication/communication facts.
4. Read Model/Projection remains a derived technical/application representation.
5. Personal view, Community transparency, oversight access and public disclosure must stay distinct.
6. A universal Financial Disclosure entity is not justified.
7. Formal historical disclosure should use Document/Revision/Representation/Publication rather than a new snapshot entity.
8. Dynamic dashboard does not create Publication.
9. Disclosure policy is configuration/rule semantics, not a new financial fact.
10. Public identifiable debtor disclosure is not adopted by this BP.
11. Audit/revision body scenario uses existing participation/Domain Power/access model, not hardcoded role.
12. Current projection may reflect effective corrections; old formal publications remain historical.
13. Source-fact visibility and supporting-Document visibility are checked independently.
14. No new ADR is preliminarily required if existing context boundaries remain sufficient.
15. Cross-cutting nature and financial/privacy sensitivity justify independent multi-review before normative sync.

## 61. Предварительные нормативные последствия

После review могут потребоваться точечные изменения:

- ADR-006 — explicit financial disclosure/projection source-of-truth boundary;
- ADR-009 — dynamic view vs formal publication boundary if current wording insufficient;
- ADR-010 — likely no change; existing access semantics sufficient;
- DOMAIN_MODEL — financial disclosure/current-vs-historical projection boundaries;
- TERMINOLOGY — potentially `Financial Disclosure` only if a stable term is useful; no entity semantics;
- REFERENCE_CANDIDATE_MATRIX — close REF-TRANS-001 / Stage 9.

VISION preliminarily does not require change.

## 62. Review requirement

BP is cross-cutting and touches financial visibility, personal/confidential information, historical corrections, documents/publications and access.

According to `docs/process/INDEPENDENT_MULTI_REVIEW.md`, normative synchronization should wait for one frozen independent multi-review round.

Second round should occur only if substantial unresolved disagreement remains.

## 63. Следующий шаг

1. internal consistency check against ADR-004/006/009/010/013 and current DOMAIN_MODEL/TERMINOLOGY;
2. freeze Stage 9 review package;
3. independent multi-review Round 1;
4. consolidate findings;
5. resolve any project-owner decisions;
6. perform normative synchronization;
7. merge Stage 9;
8. proceed to Stage 10.
