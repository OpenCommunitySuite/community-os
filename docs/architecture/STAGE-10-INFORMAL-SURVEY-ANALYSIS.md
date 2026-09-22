# Stage 10 — Informal Survey / Opinion Poll — предметно-архитектурный анализ

**Статус:** Draft analysis / решение не принято  
**Кандидат:** REF-GOV-001  
**Источники:** Мій Дім Online, DAH Online, ADR-008, ADR-009  
**Base:** `main@5325ce00181487f1c0db3b0bac0e902cb46c86da`

## 1. Проблема

Внешние референсы отдельно поддерживают:

```text
объявления
обсуждения
опросы
голосования
собрания
```

MDO прямо отделяет online survey от general meeting, а DAH — poll от voting.

Community OS уже имеет сильную formal governance model:

```text
Procedure
→ Question
→ 0..N Voting
→ Vote Rights
→ Votes
→ Calculation
→ Established Result
→ Management Decision where applicable
```

Нельзя добавлять informal survey как `Voting` с «выключенным кворумом», потому что Voting по ADR-008 несёт предметную семантику Vote Right, Rule Version, snapshot, Vote и Established Result.

## 2. Базовое различие

Предварительная граница:

```text
Informal Survey / Opinion Poll
≠ Voting
≠ Vote
≠ Vote Right
≠ Established Result
≠ Management Decision
```

Survey может использоваться для:

- предварительного сбора мнений;
- выбора удобной даты;
- оценки интереса;
- консультации;
- выбора предпочтений до formal procedure;
- подготовки будущего governance Question;
- сбора feedback по работе/услуге/проекту.

Survey response не имеет юридического/управленческого эффекта автоматически.

## 3. Почему Survey не является урезанным Voting

Formal Voting может требовать:

- Vote Rights;
- реализаторов;
- weights;
- applicable Voting Rule Version;
- snapshot прав;
- quorum;
- established result;
- competence/procedure context;
- history of result establishment/review.

Informal Survey может не требовать ни одного из этих элементов.

Если конкретный process требует Vote Rights/quorum/formal result, это сильный сигнал, что используется Voting либо иная formal governance procedure, а не informal Survey.

## 4. Нужен ли самостоятельный referent Survey

Предварительно — **да, вероятно нужен локальный referent**, потому что Survey должен сохранять:

- own identity;
- purpose/topic;
- respondent eligibility/scope;
- item/question wording;
- period;
- response semantics;
- whether identity is known/hidden;
- whether response may be changed;
- aggregation/result presentation;
- provenance;
- relation to communications/governance subjects.

Без Survey referent пришлось бы либо:
- притвориться Voting;
- хранить набор несвязанных communications;
- потерять границы response period, eligibility и aggregation.

Это не означает новый top-level context.

## 5. Candidate Survey Response

`Survey Response` предварительно рассматривается как ответ/выражение мнения в конкретном Survey.

```text
Survey Response
≠ Vote
```

Response может быть:

- single choice;
- multiple choice;
- scale/rating;
- ranking;
- free text;
- another survey-specific response form.

Universal technical payload format не вводится.

## 6. Survey item / question terminology

Не следует автоматически переиспользовать governance `Question` ADR-008.

Governance Question — предмет рассмотрения formal management procedure.

Survey может содержать один или несколько items/prompts/questions, но если использовать термин `Question`, нужна явная контекстная специализация.

Предварительно безопаснее:

```text
Survey Item / Survey Question
≠ Governance Question automatically
```

## 7. Result semantics

Survey может иметь derived aggregation:

- counts;
- percentages;
- ranking;
- average score;
- categorized feedback;
- textual summary where applicable.

Но:

```text
Survey Aggregate
≠ Established Result
≠ Management Decision
```

Отдельная fundamental `Survey Result` entity пока не обоснована. Aggregate может быть derived projection, если historical fixation не требуется.

Если определённый snapshot результата survey historically significant, это требует отдельной семантики/documentation, а не превращения Survey в Voting.

## 8. Anonymous / identified

Следует различать:

- eligibility to respond;
- technical identity/account;
- Subject identity;
- whether owner can link response to Subject;
- whether other viewers see respondent identity.

```text
anonymous to viewers
≠ anonymous to system
≠ unrestricted public response
```

Survey may permit anonymous/secret presentation without inheriting formal ballot secrecy semantics.

## 9. Eligibility

Survey respondent scope может зависеть от:

- Community membership;
- Ownership;
- right of use / resident relation;
- Subject↔Community relation;
- Object relation;
- explicit invitation;
- public/open access;
- other applicable rule.

Но respondent eligibility:

```text
≠ Vote Right
```

One-plot-one-vote pilot rule does not automatically apply to Survey.

## 10. One Subject / one response

Universal `one Subject = one Survey Response` rule не вводится.

Possible policies:

- one response per Subject;
- one response per Object relation;
- multiple updates with one effective response;
- multiple independent submissions;
- anonymous/open submissions.

Concrete Survey rule determines semantics.

## 11. Multiple objects

A Subject owning several plots may have:

- one opinion as a person;
- one response per plot/object;
- another configured scope.

Это не должно автоматически наследовать formal voting rule `1 участок = 1 голос`.

## 12. Editing response

Survey may allow response changes until deadline.

Need distinguish:

```text
edit current effective response
≠ additional independent response
```

If historical traceability matters, prior response version/action remains explainable according applicable Survey semantics.

No universal response-version entity is introduced yet.

## 13. Non-participation

Survey non-participation is simply absence of applicable response unless survey rule defines otherwise.

```text
no response
≠ abstention automatically
```

This mirrors, but does not reuse, Voting distinction.

## 14. Channel

Survey may be answered through:

- personal cabinet;
- mobile UI;
- Telegram;
- email link;
- public web form;
- another integration.

Channel:

```text
≠ Survey
≠ Survey Response
```

Telegram/MDO reference is integration/UX evidence, not domain ownership.

## 15. Survey and formal governance

Survey may precede formal governance:

```text
Survey
→ evidence/input
→ future Governance Question / Procedure / Decision
```

But Survey aggregate does not create Question, Voting or Management Decision automatically.

A formal procedure may reference Survey/result as basis/evidence.

## 16. Same wording, separate identities

An informal Survey Item and later formal governance Question may have identical text.

Textual equality:

```text
≠ same domain identity
```

Formal Question must be created/recognized in governance context under its own semantics.

## 17. Survey linked to Operational Work

Survey may ask residents which repair option is preferred.

Survey can reference Operational Work/project, but:

```text
survey preference
≠ Work authorization
≠ Work Assignment
≠ Management Decision
```

## 18. Survey linked to Communications

Survey launch may be announced through communication channels.

Announcement/Notification:

```text
≠ Survey
```

Responses are not generic communication messages merely because they arrive via a communication channel.

## 19. Ownership options

### Option A — Communications owner

Survey is primarily a structured feedback/consultation mechanism.

Pros:
- aligns with DAH grouping of announcements/discussions/polls;
- no formal rights/result semantics;
- easy boundary: Governance consumes Survey as evidence.

Cons:
- survey may be explicitly embedded inside a governance procedure.

### Option B — Governance owner

Survey is a non-binding collective procedure.

Pros:
- fits consultative processes preceding decisions;
- can share procedure timing/competence context.

Cons:
- risks semantic drift toward Voting;
- many surveys are service/communication feedback with no governance purpose.

### Option C — Context-local survey concept with shared semantics

Different contexts could define their own surveys.

Cons:
- duplicates identity/response/eligibility/aggregation semantics;
- difficult to keep consistent;
- likely premature.

### Option D — reuse Voting

Rejected.

It imports Vote Right/snapshot/rule/result semantics into a process that references explicitly say may not require them.

## 20. Preliminary preferred option

**Proposal, not accepted:** Option A — Survey belongs to `Коммуникации и обращения` as structured collection of opinions/feedback.

Governance can reference Survey/aggregate as evidence/input.

Rationale:

- the defining meaning is collection of feedback, not establishment of a binding collective result;
- lack of Vote Rights/quorum/Established Result is not merely optional configuration, but a categorical boundary;
- consultation may support governance without being governance itself;
- non-governance surveys remain natural.

If future scenario establishes a formal consultative governance procedure with its own legal/procedural effect but no Voting, that may be a separate Governance specialization rather than expansion of generic Survey.

## 21. Candidate lifecycle

Not a universal state machine.

Possible historical actions:

```text
Survey created/drafted
→ made available to applicable respondent scope
→ responses received/changed where allowed
→ response period ends
→ aggregate/projection available
→ archived/closed
```

Publication/notification semantics remain separate.

## 22. Corrections

Need distinguish:

- fixing Survey wording before opening;
- materially changing Survey after responses exist;
- correcting respondent mapping;
- changing response where allowed;
- invalidating abusive/duplicate response under applicable rule;
- correcting aggregation bug.

Material wording/options change after responses exist may require a new Survey or explicit new version/round; silent rewrite is not allowed.

## 23. Pilot ST scenarios

### 23.1. Repair preference

Board asks plot users which road section should be repaired first.

Result is advisory and does not authorize spending.

### 23.2. Meeting date

Members choose preferred meeting date.

No Vote Right/quorum; management later schedules the meeting.

### 23.3. Multiple plots

Owner has three plots.

Survey rule says one response per Subject, unlike formal ST voting rule one plot = one vote.

### 23.4. Residents/users

Tenant/right-of-use Subject can answer a service-quality Survey if applicable scope allows, despite having no Vote Right.

### 23.5. Telegram

Same Survey available in cabinet and Telegram.

Two channel submissions from same allowed respondent are deduplicated/treated according Survey identity/rule, not as two Votes.

## 24. Pilot ОСББ/ЖСК scenarios

### 24.1. Courtyard preference

Residents select preferred playground design.

Not a formal co-owner decision.

### 24.2. Formal follow-up

Survey indicates preference for project A.

Board later creates a formal agenda Question and, if required, Voting.

Survey aggregate is evidence only.

### 24.3. Service satisfaction

Residents rate cleaning quality.

This has no necessary governance procedure at all.

## 25. Questions for Stage 10 decision

1. Accept Communications as owner of generic Informal Survey?
2. Is standalone `Survey` referent justified?
3. Is standalone `Survey Response` referent justified?
4. Should aggregate remain projection rather than fundamental Result?
5. Do we need explicit Survey Rule as a locally owned rule type?
6. When does materially changed wording require new Survey?
7. Is anonymous/open survey in baseline scope or only supported by semantics?
8. Does any real pilot require governance-owned consultative procedure distinct from generic Survey?

## 26. Preliminary normative impact if Option A accepted

Likely:

- ADR-009 — add Informal Survey/Opinion Poll communication concept and boundary to Voting;
- ADR-008 — mirror boundary `Survey ≠ Voting`;
- DOMAIN_MODEL — Survey / Survey Response and governance boundary;
- TERMINOLOGY — Survey, Survey Response;
- REFERENCE_CANDIDATE_MATRIX — close REF-GOV-001 and Stage 10.

No new top-level context and no new ADR appear necessary.

## 27. Next step

1. internal stress review of Options A–D;
2. decide ownership/referents;
3. prepare BP-SURVEY-001 only after business meaning is accepted;
4. independent review only if the ownership decision exposes a real architectural disagreement.
