# BP-GOV-001 — Смешанное открытое и анонимное голосование

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

Настоящий BP определяет предметную семантику формального голосования, в котором одна Voting может принимать признанные волеизъявления через несколько допустимых каналов:

- очно;
- дистанционно;
- электронно;
- на бумаге;
- через смешанную комбинацию каналов.

BP поддерживает два основных режима прозрачности выбора:

- **Open Voting** — связь между конкретным Voting Right и Position может быть исторически сохраняема;
- **Anonymous Voting** — Community OS не должна сохранять восстанавливаемую связь между конкретным Subject/Voting Right и Position там, где выбор обрабатывается самой системой.

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

Самостоятельный исторически значимый Governance fact, фиксирующий признанное использование конкретного Voting Right допустимым реализатором без обязательного хранения Position.

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

---

## 13. Anonymous offline Voting

Community OS не владеет физической процедурой обеспечения тайны.

Она принимает два разных класса фактов.

### 13.1. Right-use evidence

~~~text
certified ballot issuance register
→ recognition
→ Voting Right Exercise
~~~

Это доказывает использование права, но не Position.

### 13.2. Choice count

~~~text
commission counts anonymous ballots
→ Result of Offline Count
~~~

Community OS не создаёт Subject-linked Votes из анонимных бумажных бюллетеней.

---

## 14. Result of Offline Count — identity и scope

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

---

## 18. Open Voting и Voting Right Exercise

Для Open Voting отдельный Exercise не обязателен как дублирование каждого Vote.

Recognized Vote уже может подтверждать реализацию права.

Voting Right Exercise нужен там, где требуется отдельная семантика использования права без Position.

---

## 19. Mixed Voting

Одна Voting может принимать вклад через несколько каналов:

~~~text
one Voting
→ open online Votes
→ open paper Votes
→ anonymous online contributions
→ anonymous offline Results of Offline Count
→ one Calculation
~~~

Конкретная комбинация определяется Voting Rule.

Mixed mode не создаёт отдельную paper/electronic Voting.

---

## 20. Double-use / channel conflict

~~~text
VR-15
→ online exercise recognized

later
→ offline register claims same VR-15
→ conflict
~~~

Community OS фиксирует conflict без раскрытия Position.

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

Open Voting:

~~~text
recognized effective Votes
→ Calculation
~~~

Anonymous Voting:

~~~text
anonymous counting inputs/results
+
Voting Right Exercises / participation metrics where rule requires
→ Calculation
~~~

Mixed:

~~~text
individual Votes
+
anonymous online count inputs
+
Results of Offline Count
+
other rule-required inputs
→ Calculation
~~~

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

~~~text
offline:
Voting Right Exercises
+
Result of Offline Count

online:
Voting Right Exercises
+
anonymous online choice/count inputs

→ one Calculation
~~~

Exercise→Position link запрещён.

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
3. Voting Right ≠ Vote.
4. Voting Right Exercise ≠ Vote.
5. Voting Right Exercise ≠ Position.
6. Participation Right ≠ Voting Right Exercise.
7. Ballot Document ≠ Vote.
8. Signing ≠ Vote.
9. Data-entry operator ≠ voter/implementer.
10. Physical presence ≠ participation automatically.
11. Participation ≠ Vote automatically.
12. Ballot receipt ≠ Vote automatically.
13. Explicit abstain ≠ no Vote.
14. One ballot may contain several Votes.
15. Mixed channels do not create multiple Voting identities.
16. One Voting Right cannot have two incompatible effective uses.
17. Conflict outcome is rule-driven.
18. Anonymous mode must not retain recoverable Subject/Voting Right→Position linkage.
19. Anonymous offline paper choices are not reconstructed as Subject-linked Votes.
20. Result of Offline Count has own identity.
21. Result of Offline Count ≠ protocol Document.
22. Result of Offline Count ≠ Calculation.
23. Calculation ≠ Established Result.
24. Established Result ≠ Management Decision.
25. External received data ≠ recognized domain fact automatically.
26. Cryptographic validity ≠ domain admissibility.
27. User Account/access ≠ Voting Right.
28. Representation does not create a new Voting Right.
29. Registry changes do not silently rewrite snapshot.
30. Corrections do not silently rewrite historical facts.

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
7. Native online Anonymous Voting входит ли в первый пилот и какой механизм separation?
8. Anonymous online counting referent: unlinkable submission или aggregate result?
9. Physical-original retention/receipt rules.
10. Нужен ли Voting Right Exercise для некоторых Open Voting participation cases?
11. Exact correction/replacement terminology Result of Offline Count.
12. Result of Offline Count — per Question или multi-question container с question-local addressability?

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

- native online Anonymous Voting implementation;
- documentless signed-action boundary;
- pilot-specific conflict/change and legal/profile rules.

До review/adjudication и normative synchronization implementation task для Codex не формируется.
