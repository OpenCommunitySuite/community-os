# Stage 9 — Independent Multi-Review Consolidation

**Статус:** Complete / Round 1 consolidated / normative synchronization performed  
**Review Package:** `STAGE9-TRANS-001-R1-FINAL`  
**Base:** `main@87e59549fcceb465540d583def7c0636d265d3e3`  
**Draft:** `BP-TRANS-001`

## 1. Источники review

Round 1 выполнен тремя независимыми рецензентами по одному frozen package:

- Claude Chat — `Claude_STAGE9-TRANS-001-R1-REVIEW-INDEPENDENT.md`;
- DeepSeek — `deepseek_markdown_20260921_461b35.md`;
- Gemini — `gemini_independent_architectural_review_stage_9_financial_disclosure.md`.

Raw review files не добавляются в repository; настоящая consolidation фиксирует findings и adjudication against current source of truth.

## 2. Общий результат

Все три reviewer согласны по фундаментальным вопросам:

- BLOCKER нет;
- новый top-level context не нужен;
- новая universal `Financial Disclosure` / `Financial Transparency` entity не нужна;
- dynamic view должен оставаться `Read Model / Projection`;
- formal historically fixed disclosure покрывается `Document / Revision / Representation / Publication`;
- второй полный review round не требуется, если исправления не меняют фундаментальную форму модели.

Основной консенсусный defect — неопределённость вокруг `Disclosure Rule`: Draft использовал его как будто один composite rule, хотя ADR-005 уже запрещает универсальный Rule/Rule Context и закрепляет rule ownership за контекстом, владеющим конкретным предметным смыслом.

## 3. Adjudication matrix

| ID | Finding | Reviewers | Решение |
|---|---|---|---|
| C-01 | Не определён owner/lifecycle Disclosure Rule | Claude, DeepSeek, Gemini | **Принять concern, отклонить single-owner fix.** По ADR-005 universal Disclosure Rule не вводится. Disclosure semantics = композиция locally owned rule types/versions: Finance — financial selection/aggregation semantics; Documents — formal publication semantics; owning subject/access contexts — applicable visibility/admissibility; cross-cutting Rules responsibility даёт общие version/history guarantees, но не ownership. |
| C-02 | Не определён producer/owner composite disclosure projection | Claude | **Принять.** Каждая конкретная projection должна иметь declared producer/owner по ADR-013. Cross-module composition использует public query contracts/published projections; direct internal reads запрещены. Universal projection owner не вводится. |
| C-03 | Базовая диаграмма смешивает dynamic view и formal publication | Claude | **Принять.** Развести две независимые ветви от authoritative facts. |
| C-04 | As-of temporal axis ambiguous | Gemini | **Принять concern, отклонить universal effective-time default.** Конкретная projection обязана явно декларировать temporal semantics: effective-at-current-knowledge, historical-recording-state where supported, либо иной defined view. Bare `as-of` без оси запрещён. Stage 9 не обещает bitemporal reconstruction там, где owner context не даёт такую history guarantee. |
| C-05 | Bank movement vs classified finance; unclassified transactions; not-1:1 | Claude | **Принять.** Bank movement projection и Expense/Payment classification projection различаются и не суммируются автоматически. Unclassified Bank Transactions остаются representable. |
| C-06 | External bank balance provenance/status | DeepSeek, Gemini | **Принять.** External bank balance = external information with source/confirmation/completeness semantics, not authoritative internal financial fact automatically. |
| C-07 | Additive vs overlapping aggregation / many-to-many dimensions | DeepSeek, Claude | **Принять.** Каждая metric/aggregation declares additivity semantics; multi-dimensional many-to-many grouping not additive-safe by default. |
| C-08 | Sub-community / multi-building scope absent | Claude | **Принять without new entity.** Projection/report may have sub-Community domain scope only where owner contexts already model that scope (building/entrance/object group/engineering branch etc.). Stage 9 does not invent a universal Scope entity. |
| C-09 | Member-level debtor identity undefined | Claude | **Принять as non-default policy.** Member/owner visibility does not imply identifiable debtor visibility. Such disclosure requires explicit applicable rule/basis; no universal allow/deny policy is hardcoded. |
| C-10 | Resident/tenant omitted | DeepSeek; also Claude non-owner occupant | **Принять.** Community transparency may include eligible resident/tenant/user based on supported Subject↔Object/Community relation and applicable rule. No automatic equivalence with owner/member/public. |
| C-11 | Ownership change: account current state vs prior person's history | DeepSeek | **Принять.** Personal Account belongs to object/account context, not owner; current account-state projection and person-identifiable historical facts are separate visibility scopes. Ownership change does not transfer obligations/history automatically. |
| C-12 | Oversight access: domain disclosure fact or technical access log | DeepSeek | **Resolve:** ordinary dynamic oversight access is not Publication/domain financial fact; technical access/audit remains cross-cutting. If formal delivery/disclosure must be historically evidenced, use Document/Publication/Communication semantics explicitly. |
| C-13 | Corrected formal publication lacks traceable relation | DeepSeek | **Принять.** Where correction/replacement/withdrawal is semantically meaningful, relation to prior Publication/Revision must be traceable under ADR-009. |
| C-14 | Supporting-document metadata can leak through projection | Gemini | **Принять with boundary correction.** Financial projection may expose only document metadata supplied/permitted by Documents/public read contract; it must not bypass Document visibility by reading raw metadata. |
| C-15 | Budget execution actual basis not declared | Gemini | **Принять.** Metric must name its actual basis (e.g. Expense-based, Payment-based or another defined basis); no closed two-method enum. |
| C-16 | Disputed correction current-effective semantics | DeepSeek | **Принять boundary clarification.** Finance owner determines which corrected result is current effective. Disclosure shows that result plus dispute semantics; disclosure itself does not decide effectiveness. |
| C-17 | Reserve/target fund accumulation scenario | Claude, DeepSeek, Gemini | **Принять scenario, no new reserve fact.** Derived target-funding position is allowed only from existing explicit source facts/classifications and declared formula. It must not be presented as reserved/blocked funds unless separate finance semantics establish that fact. |
| C-18 | Transit/reimbursable utility flows | Gemini | **Принять scenario, no new transit entity.** Disclosure must keep owner Accrual/Payment, Community Expense, supplier Obligation/Payment separate. Any “pass-through/transit” grouping is a disclosed classification/metric only when underlying finance semantics support it. |
| C-19 | Board/management financial view omitted | Claude | **Принять.** Add governance/management view as distinct operational visibility scenario using Domain Power/access rules. |
| C-20 | Assembly approval/rejection of annual report | Claude | **Принять pilot scenario.** Rejected draft report → new Revision/approval cycle; prior historical publications are not rewritten. |
| C-21 | Historical recording-state guarantee may not exist for every fact | Claude | **Принять.** Historical reconstruction capabilities are limited by owning context ADR-004 guarantees. |
| C-22 | Audience terminology in dynamic views | Claude | **Принять.** Use `viewer scope / visibility scope` for dynamic views; reserve ADR-009 `Audience` for formal Publication semantics where applicable. |
| C-23 | All pilots are ST-heavy / OSBB-ZhSK cases missing | Claude, DeepSeek, Gemini | **Принять selectively.** Add multi-building, resident/tenant, capital-repair/target accumulation, board, assembly and direct-vs-community utility examples without introducing new entities. |

## 4. Important rejected reviewer prescriptions

### 4.1. One global owner for Disclosure Rule

Rejected.

ADR-005 explicitly says:

```text
universal Rule / Rule Context / centralized owner
→ not introduced
```

Rule identity/version semantics are cross-cutting; content and ownership remain local to the context owning the subject meaning.

Therefore Stage 9 will replace singular composite `Disclosure Rule` language with **applicable disclosure rules/policies composed from locally owned rules**.

### 4.2. Rules/Governance context as owner

Rejected.

There is no top-level `Rules/Governance` context owning all rules. Governance context owns collective procedures/decisions; cross-cutting Rules responsibility does not own local rule content.

### 4.3. Universal `as-of = effective time at current knowledge`

Rejected as universal rule.

That is a valid projection type, but not the only valid one. ADR-004 does not guarantee universal bitemporality, while ADR-013 requires each projection to declare its semantics. Therefore ambiguous `as-of` is forbidden; temporal axis must be explicit per projection.

### 4.4. Stage 9 creates reserve/fund or transit financial facts

Rejected.

Financial transparency cannot invent upstream Finance facts. It may expose a derived metric only when source semantics support it. If a future legal/financial scenario requires a distinct reserve, restricted fund or pass-through relationship not representable by current Finance semantics, that is a separate Finance-domain analysis.

## 5. Project-owner decisions

No new fundamental project-owner decision remains after adjudication.

Potentially controversial policies are intentionally **not universalized**:

- identifiable debtor visibility for members/residents;
- resident/tenant scope;
- sub-Community scope;
- reserve/fund labels;
- pass-through labels.

They remain locally rule-driven within accepted domain boundaries.

## 6. Round 2

Full Round 2 is not required.

A focused review would be justified only if post-review edits introduce:

- a new fundamental domain entity/context;
- a new universal privacy/disclosure policy;
- a new reserve/transit financial fact;
- materially different historical semantics.

Current adjudication does none of these.

## 7. Result

Accepted clarifications were applied to BP-TRANS-001.

Superseded review packages were removed from PR; only `STAGE-9-FINANCIAL-DISCLOSURE-REVIEW-PACKAGE-R1-FINAL.md` remains.

Normative synchronization was performed against ADR-006/009, DOMAIN_MODEL, TERMINOLOGY and REFERENCE_CANDIDATE_MATRIX. ADR-005/010/013 remain unchanged because their existing accepted semantics already cover the required boundaries.

Stage 9 has no unresolved fundamental architecture question and may proceed to final merge after consistency check.
