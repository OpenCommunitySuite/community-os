# BP-GOV-001 — Independent Multi-Review Package

**Статус:** package for Claude / Gemini / DeepSeek independent review  
**Режим review:** предметно-архитектурный, без проектирования кода/БД/API/UI  
**Проект:** Community OS  
**Объект review:** Stage 11B / BP-GOV-001 — открытое и анонимное голосование со смешанными каналами

---

## 1. Роль рецензента

Вы — независимый предметный и архитектурный рецензент.

Нужно проверить:

- соответствие принятой domain model;
- внутреннюю непротиворечивость;
- достаточность новых identity-bearing concepts;
- отсутствие преждевременных abstractions;
- корректность границ bounded contexts;
- применимость к реальному первому пилоту СТ;
- универсальность для будущих ОСМД/ЖСК/кооперативов;
- историчность, provenance и correction semantics;
- privacy/anonymity boundaries;
- отсутствие скрытого смешивания прав, действий, документов и результатов.

Не проектировать:

- PostgreSQL tables;
- ORM;
- REST/GraphQL API;
- UI;
- microservices;
- конкретную библиотеку КЕП;
- конкретный криптографический protocol, если он не нужен для выявления domain gap.

---

## 2. Главные принципы Community OS

1. Subject, User Account, Ownership, Membership, Participation Right, Voting Right, Representation, Vote и Access Right различаются.
2. Voting Right создаётся для конкретной Voting по применимой versioned Voting Rule.
3. Vote — факт выражения Position по конкретному Voting Right.
4. One Voting Right не имеет нескольких одновременно действующих Votes.
5. Governance Question ≠ Voting ≠ Calculation ≠ Established Result ≠ Management Decision.
6. Document ≠ Vote.
7. Document Signing ≠ Vote.
8. Electronic signature artifact/provider result ≠ recognized Signing автоматически.
9. Cryptographic validity ≠ Domain Power/domain admissibility.
10. Paper/electronic channel не должен создавать отдельный universal Vote type.
11. Historical facts не переписываются silently.
12. Current registry changes не переписывают rights snapshot.
13. Universal Community OS model не должна копировать pilot-specific legal rules.
14. Первый пилот должен быть практически применим для СТ.
15. Не вводить fundamental entity только ради удобства реализации.

---

## 3. Уже принятые Stage 11B решения

### 3.1. Open / Anonymous

Formal Voting использует один declared choice-visibility mode:

~~~text
Open Voting
or
Anonymous Voting
~~~

Mixed означает несколько допустимых способов участия/подачи/формализации в рамках одного режима, а не смешение Open и Anonymous choice semantics.

### 3.2. Voting Right Exercise

Принят identity-bearing Governance concept:

**Voting Right Exercise / Реализация права голоса** — исторически значимый факт того, что согласно applicable Voting Rule конкретное Voting Right признано реализованным/расходованным для целей процедуры без обязательного хранения Position.

Он нужен прежде всего для Anonymous Voting.

~~~text
Voting Right Exercise
≠ Vote
≠ Position
≠ Participation Right
~~~

### 3.3. Result of Offline Count

Принят identity-bearing Governance concept:

**Result of Offline Count / Результат подсчёта офлайн-части** — исторически значимый результат внешнего физического anonymous offline count.

~~~text
counting protocol Document
≠ Result of Offline Count
≠ Calculation
≠ Established Result
~~~

После internal review уточнено:

~~~text
one Result of Offline Count
→ one Voting
→ one Question
→ one count scope
~~~

Один multi-question protocol Document может подтверждать несколько отдельных Results of Offline Count.

### 3.4. Anonymous invariant

Community OS не должна сохранять recoverable:

~~~text
Subject / Voting Right
→ Position
~~~

для Anonymous Voting.

Этот invariant должен распространяться не только на source-of-truth, но и на projections, exports, audit/logical surfaces, если они позволяют восстановить связь.

### 3.5. Paper ballot

Один paper/electronic ballot Document может содержать позиции по нескольким Questions/Votings.

~~~text
one signed Document
→ Vote Q1
→ Vote Q2
→ Vote Q3
~~~

Ballot Document ≠ Vote.

### 3.6. Pilot practical flow

Реальный pilot case:

~~~text
≈60 physically present at meeting
→ paper ballots distributed
→ some submit positions, some do not
→ board later personally delivers ballots to other gardeners
→ protocol says participants = 181
→ recognized positions per question = 139
~~~

Следовательно:

~~~text
physical presence
≠ participation
≠ ballot receipt
≠ Voting Right Exercise
≠ Vote
~~~

---

## 4. Internal review findings already applied

Internal review found and fixed:

1. ballot issuance/receipt ≠ Voting Right Exercise automatically;
2. Result of Offline Count should be one-Voting/question-local;
3. in-person/remote and paper/electronic are different dimensions, not one universal Channel taxonomy;
4. multiple historical Exercise claims/records do not imply multiple simultaneously effective realizations;
5. multi-question signed ballot requires explicit local mapping from Document content to each recognized Vote;
6. late recognition of timely received action does not make the action late automatically;
7. open aggregate count does not replace individual Open Votes in the current pilot semantics.

Internal review supports, subject to independent review:

> one Voting has one declared choice-visibility mode.

---

## 5. Open BLOCKER before normative sync

### Native online Anonymous choice-side domain referent

Community OS may know:

~~~text
Voting Right
→ Voting Right Exercise
~~~

but must not retain:

~~~text
Voting Right
→ anonymous Position
~~~

If Community OS itself accepts an anonymous online choice, existing Vote cannot be used because Vote is explicitly linked to Voting Right.

Current Draft therefore has an unresolved gap:

> what domain fact/referent represents accepted anonymous online choice/counting input?

It must support, where relevant:

- stable/historical identity or explainable non-identity decision;
- duplicate/redelivery/idempotency;
- correction/rejection;
- counting provenance;
- inclusion in Calculation;
- evidence that accepted choice was not lost/double-counted;
- no recoverable Voting Right→Position link.

Internal review recommends **not** inventing a new entity without a dedicated stress-test.

Candidate directions:

**A. Defer native online Anonymous Voting from first normative/pilot scope.**

First pilot supports:

- Open remote signed electronic ballot;
- Open paper voting;
- Anonymous paper/offline counting;
- mixed channels where semantics are defined.

Native online Anonymous remains future design.

**B. Design anonymous online choice-side concept now.**

Requires separate domain stress-test before normative sync.

Independent reviewers should evaluate both options, not assume B.

---

## 6. Questions for independent review

Please explicitly answer:

1. Is one declared Open/Anonymous visibility mode per Voting a correct invariant?
2. Is Voting Right Exercise justified as a standalone identity-bearing Governance fact?
3. Is its refined meaning “right considered realized/consumed by applicable rule” safe, or does it conflate issuance, participation and actual voting?
4. Is Result of Offline Count justified as standalone identity-bearing fact?
5. Is one Result of Offline Count per Voting/Question the correct boundary?
6. Is multi-question protocol Document → multiple question-local count results correct?
7. Does the model preserve ADR-001 Vote = Position by Voting Right without abusing Vote for anonymous input?
8. Is native online Anonymous indeed BLOCKER for normative sync?
9. Should first pilot defer native online Anonymous rather than introduce another concept now?
10. If not deferred, what exact domain problem forces a new anonymous choice-side concept?
11. Does document-backed signed electronic ballot correctly reuse Stage 11A without fake Document?
12. Is direct documentless signed Vote safe to defer?
13. Are paper/electronic conflict/change semantics correctly left to Voting Rule/profile?
14. Are presence, participation, receipt, exercise and Vote sufficiently separated?
15. Is any pilot-specific assumption accidentally promoted to universal invariant?
16. Are correction/recount/review boundaries consistent with ADR-004/008?
17. Does the draft over-model anything?
18. Does the draft under-model any historically significant fact?
19. Are there hidden privacy leaks in the proposed Anonymous model?
20. What minimal normative sync should be made after adjudication?

---

## 7. Required severity scale

Use:

- **BLOCKER** — cannot normatively accept BP without resolution;
- **MAJOR** — substantial semantic issue; can often be fixed without conceptual redesign;
- **MINOR** — wording/clarification/edge-case;
- **NOTE** — useful observation, no required change.

Do not inflate severity.

---

## 8. Required output format

Return Markdown with exactly these sections:

1. **Executive conclusion**
2. **BLOCKER findings**
3. **MAJOR findings**
4. **MINOR findings**
5. **Fundamental entity assessment**
6. **Anonymous privacy assessment**
7. **Pilot applicability assessment**
8. **Normative sync assessment**
9. **Recommended point fixes**
10. **Final verdict**

For each finding include:

- ID;
- severity;
- exact issue;
- why it matters;
- whether it conflicts with an existing accepted principle;
- recommended correction;
- whether correction requires conceptual redesign.

Finish with one of:

- **ACCEPT AS-IS**
- **ACCEPT AFTER POINT FIXES**
- **REQUIRES CONCEPTUAL REDESIGN**

Please save/return the result as a Markdown document where the interface allows it.

---

## 9. Current Draft BP-GOV-001

# BP-GOV-001 — Открытое и анонимное голосование со смешанными каналами

**Статус:** Draft / Stage 11B / based on accepted requirements and stress-tests  
**Контекст:** Управление и коллективные процедуры  
**Связанные контексты:** Субъекты; Полномочия и представительство; Документы и формализация; Доступ; Интеграции  
**Связанные решения:** ADR-001, ADR-004, ADR-005, ADR-008, ADR-009, ADR-010, ADR-011

Связанные материалы:

- STAGE-11B-PILOT-REMOTE-VOTING-REQUIREMENT.md;
- STAGE-11B-MIXED-PAPER-ELECTRONIC-VOTING-STRESS-TEST.md;
- STAGE-11B-ANONYMOUS-VOTING-RIGHT-EXERCISE-STRESS-TEST.md;
- STAGE-11B-PILOT-MEMBERSHIP-PLOT-VOTING-STRESS-TEST.md;
- PILOT_ST_EXPRESS_MEETING_2026-10-24_REFERENCE_ANALYSIS.md.

---

## 1. Назначение

Настоящий BP определяет предметную семантику формального голосования, в котором одна Voting может принимать признанные волеизъявления через несколько допустимых **способов участия, подачи и формализации**.

Например, процедура может сочетать:

- очное и дистанционное участие;
- бумажную и электронную формализацию;
- ручной ввод признанного paper-origin факта;
- внешнего электронного provider.

Эти признаки не образуют одну универсальную Channel taxonomy. Конкретный source/channel/formalization сохраняется как process provenance согласно applicable rule.

BP поддерживает два основных режима прозрачности выбора:

- **Open Voting** — связь между конкретным Voting Right и Position может быть исторически сохраняема;
- **Anonymous Voting** — Community OS не должна сохранять восстанавливаемую связь между конкретным Subject/Voting Right и Position там, где выбор обрабатывается самой системой.

**Одна конкретная Voting использует один объявленный режим прозрачности выбора.** Mixed voting в настоящем BP означает смешение допустимых каналов внутри этого режима, а не одновременное смешение Open и Anonymous semantics в одной Voting.

Главная модель:

~~~text
one Voting
→ one applicable Voting Rule / rights snapshot
→ several allowed participation/submission channels
→ recognized domain inputs
→ one Calculation
→ one Established Result
~~~

Канал подачи не создаёт отдельную Voting автоматически.

---

## 2. Нормативная основа

BP развивает принятые ADR.

ADR-001 сохраняет различия:

~~~text
Subject
≠ User Account
≠ Ownership
≠ Membership
≠ Participation Right
≠ Voting Right
≠ Voting Right implementer
≠ Representation
≠ Vote
~~~

ADR-008 сохраняет различия:

~~~text
Governance Question
≠ Voting
≠ Vote
≠ Calculation
≠ Established Result
≠ Management Decision
~~~

ADR-009 сохраняет document-scoped Signing:

~~~text
Signing
→ Document Revision / Representation
~~~

Настоящий BP не обобщает Signing автоматически на arbitrary non-document actions.

ADR-010/011 сохраняют границу между технической идентификацией, provider result, User Account и domain admissibility.

---

## 3. Что входит

BP определяет:

- режим Open / Anonymous;
- допустимые каналы одной Voting;
- участие очное и дистанционное;
- бумажные и электронные волеизъявления;
- использование Voting Right;
- Voting Right Exercise там, где он нужен;
- open individual Vote;
- anonymous offline counting;
- Result of Offline Count;
- конфликт попыток использования одного Voting Right;
- бумажный ballot как Document/Representation;
- электронно подписанный ballot/document;
- завершение периода приёма волеизъявлений;
- входы Calculation;
- correction/review/recount boundaries;
- mixed online/offline procedure;
- pilot-specific проверочные сценарии.

---

## 4. Что не входит

BP не определяет:

- PostgreSQL schema;
- API/UI;
- конкретный криптографический протокол anonymous online voting;
- конкретного provider КЕП/Дія.Підпис;
- юридическую допустимость конкретной процедуры без applicable legal/governance profile;
- физическую процедуру тайного бумажного голосования;
- изготовление урн и бюллетеней;
- физический подсчёт комиссии;
- универсальную формулу кворума;
- универсальный paper/electronic conflict rule;
- универсальный срок хранения бумажных оригиналов;
- ограничение Voting Right из-за задолженности автоматически.

---

## 5. Основные понятия

### 5.1. Open Voting

В Open Voting связь:

~~~text
Voting Right
→ Vote
→ Position
~~~

допустима и исторически объяснима.

### 5.2. Anonymous Voting

В Anonymous Voting факт использования права может быть идентифицируемым, но выбор не должен связываться с конкретным Voting Right.

~~~text
Voting Right
→ Voting Right Exercise

anonymous choice
→ anonymous counting input/result

Voting Right Exercise
X
Position
~~~

### 5.3. Voting Right Exercise / Реализация права голоса

Самостоятельный исторически значимый Governance fact, фиксирующий, что согласно applicable Voting Rule конкретное Voting Right признано **реализованным/расходованным для целей процедуры** допустимым реализатором без обязательного хранения Position.

Voting Right Exercise сам по себе не доказывает автоматически, что valid Position была подана, ballot был физически подсчитан либо Exercise должен участвовать в quorum/counting. Эти последствия определяет applicable rule.

~~~text
Voting Right Exercise
≠ Vote
≠ Position
≠ Participation Right
~~~

### 5.4. Result of Offline Count / Результат подсчёта офлайн-части

Самостоятельный исторически значимый Governance fact, отражающий признанный итог внешнего физического подсчёта бумажной anonymous offline-части в определённом scope.

~~~text
paper counting protocol Document
≠ Result of Offline Count
≠ Calculation
≠ Established Result
~~~

---

## 6. Presence, participation, ballot receipt и Vote

Запрещено универсально отождествлять:

~~~text
physical presence
=
participation
=
ballot receipt
=
Voting Right Exercise
=
Vote
~~~

Пилотный кейс 24.10.2026:

~~~text
≈60 physically present
→ ballots distributed
→ some vote, some do not
→ board later delivers ballots to other gardeners
→ protocol participants = 181
→ recognized positions per question = 139
~~~

Разница между величинами не классифицируется автоматически.

---

## 7. Voting Rule

Применимая версия Voting Rule должна определять, где существенно:

- Participation Right;
- Voting Right;
- basis и weight;
- implementer;
- Representation;
- режим Open / Anonymous;
- допустимые каналы;
- period/deadline;
- presence semantics;
- participation semantics;
- quorum;
- повторную/изменённую подачу;
- conflict между каналами;
- invalid/rejected semantics;
- Calculation;
- Established Result;
- required evidence;
- required signature/formalization;
- correction/review/recount.

---

## 8. Rights snapshot

До приёма формальных волеизъявлений формируется snapshot по ADR-001.

Он должен позволять восстановить:

- Voting Rights;
- basis;
- weights;
- implementers;
- использованные значения;
- применимую версию правила.

Поздние изменения Ownership/Membership/User Account не переписывают snapshot молча.

---

## 9. Channel не является видом Vote

~~~text
Vote identity
≠ paper/electronic channel
≠ submission transport
≠ data-entry operation
~~~

Для Open Voting:

~~~text
paper signed ballot
→ recognized Vote

electronic signed ballot/document
→ recognized Vote
~~~

После recognition это не два разных типа Vote.

---

## 10. Open online Voting

Типовой процесс:

~~~text
Voting Right
→ identified implementer
→ admissibility check
→ Position
→ required formalization/signing
→ recognition
→ Vote
~~~

Если procedure требует electronic Signing:

~~~text
electronic ballot Document
→ Revision/Representation
→ Signing
→ validation / Subject mapping / admissibility
→ recognized Vote
~~~

Signing не является Vote.

---

## 11. Open offline Voting

Типовой процесс:

~~~text
Voting Right
→ paper ballot
→ handwritten signature where required
→ receipt
→ validation/admissibility
→ operator entry
→ recognized Vote
~~~

Data-entry operator ≠ voter ≠ Voting Right implementer.

К Vote могут быть связаны scan/photo, Document/Representation и provenance physical original.

---

## 12. Один paper ballot может содержать несколько Votes

~~~text
one paper Document
→ one handwritten Signing
→ Vote Q1
→ Vote Q2
→ ...
→ Vote QN
~~~

Правило 1 ballot file = 1 Vote не вводится.

Один multi-question ballot может охватывать несколько Questions и, следовательно, несколько Voting identities.

Для каждого recognized Vote должно быть исторически объяснимо:

- какой Document Revision/Representation был источником;
- какой локально адресуемый semantic item/field выражал Position именно этого Vote;
- какой Signing покрывал соответствующую Revision/Representation;
- как Position была распознана/введена.

Отдельная universal Ballot Item entity этим не вводится.

---

## 13. Anonymous offline Voting

Community OS не владеет физической процедурой обеспечения тайны.

Она принимает два разных класса фактов.

### 13.1. Right-use evidence

~~~text
certified ballot issuance / receipt evidence
→ validation under applicable Voting Rule
→ may justify Voting Right Exercise
~~~

Mere issuance/receipt **не является Voting Right Exercise автоматически**.

Для anonymous offline procedure Voting Rule должен определить, какой момент считается реализацией/расходованием права. Например, если после выдачи unlinkable paper ballot система объективно не может установить, был ли он впоследствии опущен в урну, rule может считать саму допустимую выдачу моментом расходования права для защиты от двойного использования.

Такой Exercise не доказывает Position и не доказывает физический подсчёт ballot.

### 13.2. Choice count

~~~text
commission counts anonymous ballots
→ Result of Offline Count
~~~

Community OS не создаёт Subject-linked Votes из анонимных бумажных бюллетеней.

---

## 14. Result of Offline Count — identity и scope

Каждый Result of Offline Count относится к **одной Voting**, а следовательно — к одному Governance Question.

Для каждого признанного результата должны быть определимы, где применимо:

- Voting;
- Governance Question;
- count scope;
- source commission/location/area;
- counts by Position;
- invalid/other indicators;
- counting time/period;
- recognition time;
- data-entry Subject/User;
- source protocol/document;
- evidence;
- rule/version;
- correction/replacement relation.

Одна Voting может иметь 0..N Results of Offline Count, если physical count разделён на независимые scopes.

Один multi-question counting protocol Document может быть source/evidence для нескольких отдельных Results of Offline Count — по одному или нескольким results для каждой соответствующей Voting. Multi-question Result of Offline Count container не вводится.

---

## 15. Correction / replacement Result of Offline Count

Ошибочный результат не переписывается молча.

~~~text
C1 original
→ error/recount
→ C2 replacement
→ explicit historical relation
~~~

Calculation должен позволять определить, какая версия использована.

Отдельная universal Offline Count Correction entity пока не вводится.

---

## 16. Anonymous online Voting

Минимальный domain invariant:

> Community OS не должна сохранять восстанавливаемую связь Subject/Voting Right → Position.

Одновременно она должна:

- проверить eligibility;
- признать Voting Right Exercise;
- предотвратить несовместимое повторное использование права;
- принять anonymous choice;
- включить его в counting/result;
- не раскрыть Position через source-of-truth, projections, exports или audit surfaces.

Конкретный механизм anonymous credential / blind signature / provider / cryptographic mix настоящим BP не выбирается.

Если техническая реализация не обеспечивает invariant, native online Anonymous Voting не считается корректно реализованным.

**Текущий Draft gap:** пока не определён choice-side domain referent для случая, когда Community OS сама принимает anonymous online choice. Existing Vote использовать нельзя, потому что он связан с конкретным Voting Right. До отдельного stress-test/design этот участок не готов к normative sync.

Допустимые направления дальнейшего решения:

- оставить native online Anonymous Voting вне первой нормативной версии/пилота, сохранив только invariant и future design task;
- либо отдельно спроектировать anonymous choice-side concept с identity/correction/idempotency/counting semantics без Voting Right→Position linkage.

Настоящий BP не выбирает второй вариант автоматически.

---

## 17. Voting Right Exercise — минимальная семантика

Для recognized Exercise должны быть исторически определимы, где применимо:

- Voting;
- Voting Right;
- actual implementer;
- Representation/Domain Power basis;
- channel;
- exercise/receipt time;
- recognition time;
- acting recorder;
- evidence/source;
- rule/version;
- correction/review history.

Position для Anonymous Voting отсутствует.

Historical claims/recognitions/corrections могут быть множественными, но это не означает несколько одновременно effective realizations одного Voting Right.

Applicable rule/review должна позволять определить:

- какой Exercise effective для соответствующего reference time;
- какой record был superseded/corrected;
- какой claim был rejected/conflicting;
- кто считался actual implementer.

Отдельная universal Voting Right Exercise Claim entity пока не вводится.

---

## 18. Open Voting и Voting Right Exercise

Для Open Voting отдельный Exercise не обязателен как дублирование каждого Vote.

Recognized Vote уже может подтверждать реализацию права.

Voting Right Exercise нужен там, где требуется отдельная семантика использования права без Position.

---

## 19. Mixed Voting

Mixed Voting означает использование нескольких каналов **при одном режиме прозрачности выбора**.

### 19.1. Mixed-channel Open Voting

~~~text
one Open Voting
→ open online Votes
→ open paper Votes
→ one Calculation
~~~

### 19.2. Mixed-channel Anonymous Voting

Если native online Anonymous Voting для конкретного profile уже имеет отдельно принятую choice-side semantics:

~~~text
one Anonymous Voting
→ anonymous online counting inputs/results where supported
→ anonymous offline Results of Offline Count
→ Voting Right Exercises where applicable
→ one Calculation
~~~

До разрешения BLOCKER из section 16 гарантированно определён только offline anonymous contribution; наличие online anonymous input не предполагается автоматически.

Одна Voting не смешивает Open и Anonymous choice semantics. Если по тем же Governance Questions требуется другая прозрачность выбора, это требует отдельной Voting согласно applicable rule.

Mixed mode не создаёт отдельную paper/electronic Voting только из-за channel.

---

## 20. Double-use / channel conflict

~~~text
VR-15
→ online exercise recognized

later
→ offline register claims same VR-15
→ conflict
~~~

Community OS фиксирует conflict без раскрытия Position. Второй несовместимый claim не обязан немедленно становиться вторым effective Voting Right Exercise; он может оставаться received/conflicting evidence до rule-driven resolution.

Voting Rule определяет outcome:

- reject later claim;
- suspend/review;
- authoritative source;
- correction erroneous recognition;
- иной profile-specific result.

Universal latest-wins rule не вводится.

---

## 21. Повторная/изменённая подача Open Vote

Если rule разрешает change/revote:

~~~text
Vote V1
→ later change
→ V1 remains historical
→ effective Vote determined by rule
~~~

Paper/electronic conflict/change semantics должны быть explicit.

---

## 22. Representation

~~~text
Voting Right basis/owner
≠ actual implementer
~~~

Система хранит sufficient Representation basis, scope, applicability time и source/evidence.

Representation не создаёт новое Voting Right.

---

## 23. Несколько Voting Rights одного Subject

Один Subject может реализовать несколько Voting Rights, если это допускает snapshot/rule.

Это не требует копирования Subject/User Account.

---

## 24. Pilot rule 1 участок = 1 голос

Рабочее требование первого внедрения:

~~~text
1 Plot
→ 1 Voting Right
~~~

Applicable Membership/Plot basis определяются Voting Rule и legal/governance profile.

Несколько membership applications/bases не создают автоматически несколько simultaneous Memberships или Voting Rights.

Юридическая валидность конкретной схемы остаётся profile/legal question.

---

## 25. Ballot Document

Ballot может быть Document/Revision/Representation.

~~~text
Ballot Document
≠ Vote
~~~

Один Document может поддерживать несколько Votes.

---

## 26. Electronic signed ballot — Draft rule

Для первого пилота предлагается document-scoped модель дистанционного Open Vote:

~~~text
electronic ballot Document
→ Revision/Representation
→ electronic Signing
→ validation / Subject mapping / authority/admissibility
→ one or more recognized Votes
~~~

Это не требует обобщать ADR-009 Signing.

### 26.1. Direct documentless signed Vote

Direct signed non-document Vote остаётся отдельной архитектурной возможностью, но не считается автоматически поддержанной.

До отдельного решения:

- fake Document не создаётся;
- Signing target не обобщается молча;
- pilot может использовать document-backed signed ballot.

Это предложение настоящего Draft BP, а не ранее принятое универсальное решение.

---

## 27. Closing / deadline

Voting Rule определяет:

- opening time;
- closing deadline;
- late submission;
- offline receipt deadline;
- unknown external outcome handling;
- optional reconciliation/grace period.

Окончание очной части собрания не означает автоматически закрытие Voting.

---

## 28. Submitted / received / recognized

Различаются:

~~~text
submitted
received
provider accepted
recognized
~~~

Если действие получено до deadline, но recognized позднее, outcome определяет applicable rule.

Late recognition ранее своевременно received action не делает само action late автоматически. Предметно значимый момент определяется applicable rule и source evidence.

Technical delay не должен молча менять предметное время действия.

---

## 29. Unknown external outcome

~~~text
request sent
→ timeout
→ external state unknown
~~~

Retry не создаёт новый Vote автоматически.

Применяются ADR-011 reconciliation/idempotency semantics.

---

## 30. Completion of collection

Перед Calculation должно быть объяснимо:

- period closed;
- pending external outcomes resolved/excluded;
- offline results recognized;
- conflicts resolved/excluded;
- corrections applied.

Это не означает, что каждый Voting Right обязан иметь Vote.

---

## 31. Calculation

### 31.1. Open Voting

~~~text
recognized effective individual Votes
→ Calculation
~~~

При mixed-channel Open Voting сюда могут входить признанные Votes из paper и electronic channels.

### 31.2. Anonymous Voting

~~~text
Results of Offline Count
+
anonymous online counting inputs/results where separately supported
+
Voting Right Exercises / participation metrics where rule requires
→ Calculation
~~~

При mixed-channel Anonymous Voting Calculation объединяет только те анонимные inputs, чья domain semantics уже определена для соответствующего profile. До разрешения BLOCKER section 16 native online anonymous input не считается нормативно определённым.

Open individual Votes и Anonymous counting inputs не смешиваются внутри одной Voting.

Calculation сохраняет provenance input identities/versions.

---

## 32. Quorum

Quorum не выводится универсально из:

- physical presence;
- Voting Rights;
- Voting Right Exercises;
- Votes;
- ballots;
- User Accounts.

Формулу задаёт applicable Voting Rule.

---

## 33. Воздержался ≠ отсутствие Vote

~~~text
explicit abstain
≠ no Vote
≠ missing ballot
≠ invalid ballot
≠ unresolved participation
~~~

Разница между participants и recognized Positions не заполняется автоматически значением Воздержался.

---

## 34. Established Result

~~~text
Calculation
→ result establishment action
→ Established Result
~~~

Calculation не становится Established Result автоматически.

---

## 35. Management Decision

~~~text
Established Result
≠ Management Decision
~~~

Решение сохраняет собственную identity/lifecycle.

---

## 36. Recount / review

Anonymous offline:

~~~text
physical recount
→ replacement Result of Offline Count
→ new Calculation
→ possible Result Review
~~~

Correction individual Vote/evidence не переписывает Established Result автоматически.

Для Open offline Voting aggregate paper count может храниться как дополнительное evidence/reconciliation input where useful, но для текущего пилотного сценария он не заменяет individual recognized Votes. Aggregate-only Open semantics потребовали бы отдельного review.

---

## 37. Evidence

Evidence может включать:

- paper ballot scan/photo;
- electronic ballot Representation;
- Signing artifact/result;
- provider validation;
- issuance register;
- commission protocol;
- attendance/register document;
- Representation basis;
- other supporting documents.

Evidence не заменяет domain fact автоматически.

---

## 38. Physical originals

Community OS может хранить digital copy, location/reference, custody/provenance metadata и receipt/transfer fact where needed.

Digital copy не объявляется автоматической заменой physical original.

---

## 39. Privacy

Open/Anonymous distinction распространяется на:

- source-of-truth relations;
- projections;
- exports;
- audit surfaces;
- analytics;
- operational logs where linkage can be reconstructed.

Anonymous mode нарушен, если Subject→Position link восстанавливается из штатных данных системы.

---

## 40. Access

~~~text
Access Right
≠ Participation Right
≠ Voting Right
≠ admissibility of Vote
~~~

ADR-010 сохраняется.

---

## 41. External submission recognition

~~~text
received information
→ validation
→ mapping
→ domain admissibility
→ recognition/rejection
~~~

Received ballot/result не становится Vote/Exercise/Offline Count автоматически.

---

## 42. Correction boundaries

Различаются:

- correction received information;
- correction Voting Right;
- correction Voting Right Exercise;
- correction Vote recognition;
- replacement Result of Offline Count;
- recalculation;
- review Established Result;
- change Management Decision.

Ни одно действие не переписывает соседние факты автоматически.

---

## 43. Pilot scenario A — очное + последующий paper collection

~~~text
meeting/discussion
→ ballots to present participants
→ some submit Votes
→ board later delivers ballots to absent gardeners
→ paper collection continues
→ deadline
→ recognition
→ Calculation
→ Established Result
~~~

Одна Voting сохраняется на протяжении всей процедуры.

---

## 44. Pilot scenario B — open paper + signed electronic

~~~text
VR1 → paper signed ballot → Vote
VR2 → electronic signed ballot Document → Vote
VR3 → electronic signed ballot Document → Vote
→ one Calculation
~~~

---

## 45. Pilot scenario C — anonymous mixed

Этот сценарий становится допустимым только после отдельного решения native online Anonymous choice-side semantics.

~~~text
offline:
Voting Right Exercises
+
Result of Offline Count

online where separately supported:
Voting Right Exercises
+
anonymous online choice/count inputs

→ one Calculation
~~~

До такого решения pilot Anonymous Voting может оставаться offline-only. Exercise→Position link запрещён.

---

## 46. Pilot scenario D — same right in two channels

~~~text
VR27 → online Exercise E1

later:
paper register → claimed offline Exercise E2

→ conflict
→ rule-driven review
~~~

Оба использования не учитываются молча.

---

## 47. Pilot scenario E — multi-question ballot

~~~text
one signed ballot
→ Vote Q1
→ Vote Q2
→ Vote Q3
~~~

Пустая позиция по одному Question не invalidates остальные автоматически, если rule не требует обратного.

---

## 48. Pilot scenario F — representative

~~~text
Voting Right VR15
→ implementer Subject B
→ Representation basis
→ Vote / Exercise
~~~

Representation не меняет identity/weight VR15.

---

## 49. Outcomes

### 49.1. Accepted open Vote

Voting Right + admissible Position + required formalization → recognized Vote.

### 49.2. Recognized anonymous exercise

Voting Right used without retained Position linkage → Voting Right Exercise.

### 49.3. Recognized offline count

External physical count + sufficient source/evidence → Result of Offline Count.

### 49.4. Rejected submission

Validation/admissibility failed; recognized domain fact не создаётся.

### 49.5. Conflict requiring review

Несовместимые claims/effective uses требуют rule-driven resolution.

### 49.6. Incomplete inputs at close

Calculation может быть blocked/limited/proceed только по explicit rule. Missing input не выдумывается.

---

## 50. Provenance

Where materially relevant, should be determinable:

- Voting;
- Question;
- mode;
- Voting Rule/version;
- snapshot;
- Voting Rights;
- channel/formalization;
- submit/receive/recognition times;
- implementer;
- Representation/authority basis;
- Vote identity;
- Voting Right Exercise identity;
- Result of Offline Count identity/version;
- ballot/protocol Documents;
- Signing identities;
- provider correlation;
- rejection/conflict reason;
- Calculation input set;
- correction/review links.

---

## 51. Инварианты

1. Voting ≠ channel.
2. Open Voting ≠ Anonymous Voting.
3. One Voting has one declared choice-visibility mode; mixed channels do not mix Open and Anonymous semantics.
4. Voting Right ≠ Vote.
5. Voting Right Exercise ≠ Vote.
6. Voting Right Exercise ≠ Position.
7. Participation Right ≠ Voting Right Exercise.
8. Ballot Document ≠ Vote.
9. Signing ≠ Vote.
10. Data-entry operator ≠ voter/implementer.
11. Physical presence ≠ participation automatically.
12. Participation ≠ Vote automatically.
13. Ballot receipt ≠ Vote automatically.
14. Explicit abstain ≠ no Vote.
15. One ballot may contain several Votes.
16. Mixed channels do not create multiple Voting identities.
17. One Voting Right cannot have two incompatible effective uses.
18. Conflict outcome is rule-driven.
19. Anonymous mode must not retain recoverable Subject/Voting Right→Position linkage.
20. Anonymous offline paper choices are not reconstructed as Subject-linked Votes.
21. Result of Offline Count has own identity.
22. Result of Offline Count ≠ protocol Document.
23. Result of Offline Count ≠ Calculation.
24. Calculation ≠ Established Result.
25. Established Result ≠ Management Decision.
26. External received data ≠ recognized domain fact automatically.
27. Cryptographic validity ≠ domain admissibility.
28. User Account/access ≠ Voting Right.
29. Representation does not create a new Voting Right.
30. Registry changes do not silently rewrite snapshot.
31. Corrections do not silently rewrite historical facts.
32. Ballot issuance/receipt ≠ Voting Right Exercise automatically.
33. One Result of Offline Count belongs to one Voting/Question.
34. One protocol Document may evidence several question-local Results of Offline Count.
35. Multiple historical Exercise records/claims do not imply multiple simultaneously effective realizations.
36. Participation mode and carrier/formalization mode are not one universal Channel taxonomy.

---

## 52. Fundamental entity check

### 52.1. Voting Right Exercise

Accepted as new identity-bearing Governance concept for Stage 11B.

### 52.2. Result of Offline Count

Accepted as new identity-bearing Governance concept for Stage 11B.

### 52.3. No new channel entities

Paper Vote / Electronic Vote / Hybrid Vote fundamental entities не вводятся.

### 52.4. No universal Ballot entity yet

Ballot использует Document semantics; separate fundamental Ballot entity не вводится.

### 52.5. No generalized Signed Action yet

Stage 11A document-scoped Signing не обобщается автоматически.

---

## 53. Proposed normative synchronization after review

После review/adjudication предлагается минимальная sync.

ADR-001:

- добавить Voting Right Exercise как distinct from Vote;
- разрешить anonymous exercise без Position;
- rule определяет effective use/conflict outcome.

ADR-008:

- добавить Result of Offline Count как самостоятельный input;
- mixed Calculation может использовать individual Votes и другие recognized inputs;
- anonymous procedure разделяет right-use evidence и position-counting inputs.

DOMAIN_MODEL:

- добавить Voting Right Exercise;
- добавить Result of Offline Count;
- закрепить границы с Vote/Calculation/Established Result.

TERMINOLOGY:

- добавить канонические русские/английские термины.

Новый bounded context не требуется.

---

## 54. Open questions for review/adjudication

1. Document-backed electronic ballot — обязательный pilot mechanism для signed Open remote Vote?
2. Direct documentless signed Vote откладывается из первого пилота?
3. Exact paper/electronic change/conflict rules.
4. Может ли later electronic Vote заменять paper Vote и на каком основании?
5. Exact legal/profile definition presence/quorum для пилота.
6. Exact legal/profile status 1 Plot = 1 Vote.
7. Native online Anonymous Voting входит ли в первый пилот либо откладывается до отдельного design?
8. Anonymous online choice-side referent: нужен ли новый identity-bearing concept либо first-pilot scope исключает native online Anonymous?
9. Physical-original retention/receipt rules.
10. Нужен ли Voting Right Exercise для некоторых Open Voting participation cases?
11. Exact correction/replacement terminology Result of Offline Count.

Решено internal review: один Result of Offline Count относится к одной Voting/Question; multi-question protocol Document может подтверждать несколько таких results.

---

## 55. Independent review focus

Reviewers should test:

- contradiction with ADR-001/008/009;
- Subject→Position leakage in Anonymous mode;
- duplicate Vote/Exercise semantics;
- conflict resolution boundaries;
- Document/Signing ownership;
- mixed paper/electronic flow;
- multi-question ballot;
- quorum/presence separation;
- correction/recount/history;
- justification of new fundamental entities;
- pilot specifics promoted to universal rules accidentally.

---

## 56. Текущий вывод Draft

Accepted Stage 11B requirements собираются в один Governance BP без отдельных paper/electronic Voting models.

Новые fundamental Governance concepts, уже принятые в Stage 11B analysis:

~~~text
Voting Right Exercise
Result of Offline Count
~~~

Крупные нерешённые вопросы:

- **BLOCKER до normative sync:** native online Anonymous Voting choice-side domain referent / решение об исключении native online Anonymous из first-pilot normative scope;
- documentless signed-action boundary;
- pilot-specific conflict/change and legal/profile rules.

До review/adjudication и normative synchronization implementation task для Codex не формируется.


---

## 10. Internal review record

# BP-GOV-001 — Internal architectural review

**Статус:** Round 1 internal review / findings before independent review  
**Объект:** `BP-GOV-001-MIXED-OPEN-ANONYMOUS-VOTING.md`  
**Контекст:** Управление и коллективные процедуры  
**Проверено против:** ADR-001, ADR-004, ADR-005, ADR-008, ADR-009, ADR-010, ADR-011, Stage 11B stress-tests и pilot reference 24.10.2026

---

## 1. Общий вывод

Draft в целом совместим с принятой архитектурой Community OS.

Сильные стороны:

- channel не превращён в новый тип Vote/Voting;
- Open и Anonymous разделены;
- одна Voting использует один режим прозрачности выбора;
- physical presence, participation, ballot receipt, Vote и Voting Right Exercise различены;
- Ballot Document, Signing и Vote не смешаны;
- Result of Offline Count отделён от protocol Document, Calculation и Established Result;
- смешанная paper/electronic процедура укладывается в существующий Voting/Rule/Snapshot;
- pilot specifics не объявлены универсальными автоматически;
- новые bounded contexts не требуются.

До нормативной синхронизации остаётся один блокирующий design gap и несколько point-fix findings.

---

## 2. BLOCKER-1 — native online Anonymous Voting не имеет определённого choice-side referent

### Наблюдение

Draft корректно вводит:

~~~text
Voting Right
→ Voting Right Exercise
~~~

и запрещает:

~~~text
Voting Right / Subject
→ Position
~~~

Но для native online Anonymous Voting одновременно утверждается:

~~~text
anonymous choice
→ anonymous counting input/result
~~~

без определения, что именно является исторически значимым source/input со стороны choice.

Existing `Vote` использовать нельзя:

~~~text
Vote
→ concrete Voting Right
→ Position
~~~

что противоречит anonymous invariant.

### Почему это BLOCKER

Пока Community OS сама принимает anonymous online choice, необходимо объяснить:

- какой предметный факт/referent существует после принятия choice;
- имеет ли он identity;
- как он участвует в correction/redelivery/idempotency;
- как он входит в Calculation;
- как доказывается, что choice не был потерян/дублирован;
- как при этом исключается recoverable Voting Right→Position linkage.

Без этого normative sync ADR-001/ADR-008 будет неполной.

### Варианты

**A. Отложить native online Anonymous Voting из первой нормативной версии BP.**

BP фиксирует invariant и future design task, а first-pilot Anonymous поддерживает offline physical counting; first-pilot remote electronic mode — Open signed ballot.

Плюсы:

- не вводится преждевременная сущность;
- Stage 11B можно нормативно завершить для практически обязательного пилотного сценария;
- cryptographic/identity-separation design остаётся отдельной задачей.

Минус: native online Anonymous Voting не входит в первый нормативный scope.

**B. Проектировать отдельный anonymous choice-side concept сейчас.**

Кандидаты нельзя выбирать по удобству хранения. Нужен отдельный stress-test identity/lifecycle/correction/counting boundary.

### Рекомендация internal review

Предпочтителен **вариант A**, если пользователь не требует native online Anonymous Voting уже в первой версии пилота.

---

## 3. MAJOR-1 — ballot issuance не равен Voting Right Exercise автоматически

### Наблюдение

Draft одновременно содержит:

~~~text
ballot receipt ≠ Voting Right Exercise
~~~

и:

~~~text
certified ballot issuance register
→ recognition
→ Voting Right Exercise
~~~

Это противоречие.

### Решение

Уточнить:

~~~text
issuance / receipt evidence
→ may justify Voting Right Exercise
only if applicable Voting Rule defines this event
as sufficient realization/consumption of the right
~~~

Для anonymous offline это особенно важно: после выдачи unlinkable paper ballot система может уже не иметь возможности доказать, был ли он физически опущен в урну.

Следовательно, Voting Rule должен определить **момент реализации/расходования права** для конкретной anonymous procedure.

---

## 4. MAJOR-2 — Result of Offline Count должен быть question-local через Voting

ADR-001/008 определяют:

~~~text
Question
→ 0..N Voting
~~~

и каждый Voting Right относится к конкретной Voting/Question.

Поэтому Result of Offline Count безопаснее определить как относящийся к **одной Voting**, а значит — к одному Question.

Много-вопросный физический protocol Document может подтверждать:

~~~text
one protocol Document
→ Result of Offline Count for Voting Q1
→ Result of Offline Count for Voting Q2
→ Result of Offline Count for Voting Q3
~~~

Не требуется multi-question Result of Offline Count container.

Это сохраняет:

- question-local recalculation;
- correction/recount одного вопроса;
- ясный Calculation input set;
- отсутствие cross-Voting aggregate identity.

---

## 5. MAJOR-3 — «канал» сейчас смешивает разные измерения

В начале Draft перечислены:

- очно;
- дистанционно;
- электронно;
- на бумаге.

Это не одна таксономическая ось:

~~~text
in-person / remote
→ participation/delivery mode

paper / electronic
→ carrier/formalization mode
~~~

Например, paper ballot может быть вручён очно или дистанционно; electronic action может быть выполнен во время очного собрания.

### Решение

Не вводить universal Channel taxonomy.

Использовать более широкое:

> способы участия, подачи и формализации

а конкретный source/channel/formalization сохранять как process provenance согласно applicable rule.

---

## 6. MAJOR-4 — effective Voting Right Exercise нужно отделить от исторических claims/records

Draft допускает conflict:

~~~text
same Voting Right
→ online exercise
→ offline claim
~~~

При этом ADR-001 сохраняет:

- один actual implementer для права;
- не более одного одновременно действующего Vote.

Для Exercise необходимо аналогичное уточнение:

- historical claims/recognitions/corrections могут быть множественными;
- это не означает несколько одновременно effective realizations;
- applicable rule/review определяет effective realization;
- ошибочный historical Exercise не удаляется молча.

Отдельную universal Claim entity вводить пока не требуется.

---

## 7. MAJOR-5 — multi-question signed ballot требует явной mapping semantics

Один Document может содержать позиции по нескольким Questions/Votings.

~~~text
one signed Document Revision
→ Vote V1 / Question Q1
→ Vote V2 / Question Q2
→ Vote V3 / Question Q3
~~~

Для каждого recognized Vote должно быть исторически объяснимо:

- какой Document Revision/Representation был источником;
- какой semantic item/field выражал Position именно этого Vote;
- какой Signing покрывал соответствующую Revision/Representation;
- как Position была распознана/введена.

Новая Ballot Item entity не требуется автоматически; достаточно local addressability / mapping provenance, если lifecycle не требует самостоятельной identity.

---

## 8. MAJOR-6 — one visibility mode per Voting выглядит обоснованно

Draft добавил:

> одна Voting использует один declared choice-visibility mode.

Internal review считает это корректным направлением.

Если одному Governance Question нужны разные режимы прозрачности:

~~~text
Open Voting
≠ Anonymous Voting
~~~

это должны быть отдельные Voting identities согласно applicable rule.

Иначе «частично открытая/частично анонимная» одна Voting разрушает единообразную privacy semantics результата.

Finding предлагается оставить как accepted BP invariant после independent review.

---

## 9. MINOR-1 — deadline и recognition

Draft правильно различает:

~~~text
submitted
received
provider accepted
recognized
~~~

Следует дополнительно подчеркнуть, что late recognition ранее полученного action не делает action late автоматически. Предметный момент определяется applicable rule/source evidence.

Это point fix, redesign не нужен.

---

## 10. MINOR-2 — open offline aggregate

Stage 11B stress-test допускает aggregate open offline count как дополнительную сверку/evidence.

BP может явно указать:

> open aggregate count does not replace individual recognized Votes unless a specific procedure intentionally uses aggregate-only semantics, which would require separate review.

Для пилота individual open Votes остаются source-of-truth.

---

## 11. Fundamental entity check после internal review

### Voting Right Exercise

Identity остаётся обоснованной.

Но definition должна быть уточнена:

> признанный исторический факт того, что согласно applicable Voting Rule конкретное Voting Right считается реализованным/расходованным для целей процедуры, без обязательного хранения Position.

Это **не означает автоматически**, что:

- valid Position была подана;
- ballot был физически подсчитан;
- Exercise входит в quorum;
- Exercise входит в choice count.

### Result of Offline Count

Identity остаётся обоснованной.

Рекомендуемая граница:

~~~text
one Result of Offline Count
→ one Voting
→ one Question
→ one count scope
~~~

Один protocol Document может evidence 0..N таких results.

### Новая anonymous online choice entity

Internal review **не рекомендует вводить её без отдельного stress-test**.

---

## 12. Итог Round 1

| Finding | Severity | Результат |
|---|---|---|
| Native online Anonymous choice-side referent undefined | BLOCKER | open design decision |
| Ballot issuance ≠ Exercise automatically | MAJOR | point fix |
| Offline Count result should be one-Voting/question-local | MAJOR | point fix |
| Channel taxonomy mixes dimensions | MAJOR | point fix |
| Exercise effective/history semantics | MAJOR | point fix |
| Multi-question signed ballot mapping | MAJOR | point fix |
| One visibility mode per Voting | MAJOR | support / independent review |
| Deadline vs recognition wording | MINOR | point fix |
| Open aggregate reconciliation wording | MINOR | point fix |

После point fixes Draft пригоден для independent multi-review.

Normative sync ADR-001 / ADR-008 / DOMAIN_MODEL / TERMINOLOGY до adjudication BLOCKER-1 не выполнять.

