# Stage 11B — Mixed paper/electronic voting stress-test

**Статус:** Working analysis / not normative  
**Пилот:** Садівниче товариство «ЕКСПРЕС»  
**Связанный этап:** Stage 11B — Remote Participation and Electronic Voting  
**Цель:** проверить смешанную процедуру, в которой одна Voting допускает электронно подписанное волеизъявление и бумажные бюллетени с собственноручной подписью без раздвоения предметной модели Vote.

## 1. Бизнес-потребность

Часть участников пилотного СТ не готова пользоваться КЕП/Дія.Підпис или другими electronic signing mechanisms.

Одновременно дистанционное электронное участие необходимо для собственников, которые отсутствуют физически, в том числе находятся за границей.

Поэтому пилот должен поддерживать один и тот же Governance process через несколько допустимых каналов:

~~~text
one Voting
→ common Voting Rule / rights snapshot / questions
→ electronic signed channel
→ paper signed channel
→ one set of recognized Votes
→ one Calculation
→ one Established Result
~~~

Mixed mode не является двумя голосованиями.

## 2. Основной предметный инвариант

~~~text
Vote identity
≠ submission channel
≠ ballot medium
≠ data-entry operation
~~~

Один Vote остаётся фактом выражения позиции по конкретному Voting Right независимо от того, подтверждён ли он:

- электронно подписанным Document/Representation;
- бумажным бюллетенем с собственноручной подписью;
- иным допустимым evidence/formalization способом, предусмотренным profile.

Канал является provenance/formalization semantics, а не отдельным видом Vote автоматически.

## 3. Paper ballot

Бумажный бюллетень может быть Document/Representation, связанной с Governance Voting.

Для открытого голосования он может содержать:

- Community / Voting reference;
- Question(s);
- Voting Right / Subject identification according to procedure;
- position(s);
- дату;
- собственноручную подпись;
- иные required реквизиты.

При этом:

~~~text
paper ballot Document
≠ Vote

handwritten Signing
≠ Vote
~~~

Vote возникает/признаётся в Governance context согласно applicable Voting Rule и admissibility semantics.

## 4. Handwritten Signing

ADR-009 Signing не ограничено electronic signature.

Собственноручное подписание бумажного Representation может быть исторически значимым Signing конкретного Document/Representation.

Для paper Signing применимы те же фундаментальные границы:

~~~text
Signing
≠ Vote
≠ Approval
≠ Registration
~~~

Но evidence/validation semantics отличаются от electronic Signing:

- нет cryptographic validation;
- нет certificate/trust-list semantics;
- может требоваться визуальная/процедурная проверка подписи;
- допустимость определяется paper-ballot/legal profile.

Stage 11B не должен искусственно превращать handwritten signature в electronic signature.

## 5. Scan/photo

Scan/photo бумажного бюллетеня может использоваться как digital Representation/evidence для:

- data entry;
- remote checking;
- audit;
- dispute review;
- linking to recognized Vote.

Но:

~~~text
scan/photo
≠ physical original
≠ electronic signature
≠ new Vote
~~~

Если paper original уже породил recognized Vote, загрузка нескольких фотографий/сканов не создаёт несколько Votes.

## 6. Physical original

Для accepted paper-origin Vote physical original сохраняется как первичный материальный evidence, если applicable procedure/profile не устанавливает иное.

Рабочий pilot baseline:

~~~text
accepted paper-origin Vote
→ physical original must be retained
→ scan/photo may supplement it
→ destruction only after explicit retention rule permits
   + authorized disposal action is recorded
~~~

Это правило вводится как product/process safeguard для доказуемости смешанного голосования.

Настоящий stress-test не устанавливает универсальный statutory retention period для всех Community types.

## 7. Custody and archive provenance

Для paper-origin evidence должно быть исторически определимо, где применимо:

- original received/not received;
- received time;
- receiving Subject/commission member;
- current custodian;
- physical archive location/reference;
- movement/transfer between custodians;
- scan/photo Representation;
- relation to Voting/Voting Right/Vote;
- retention rule;
- destruction authorization, date and actor if destruction is later lawful.

Это не доказывает необходимость universal `Physical Archive Item` entity.

Если document/archive use cases позднее покажут independent identity/lifecycle физического носителя, вопрос отдельной entity должен быть исследован отдельно.

## 8. Data-entry operator

В mixed mode особенно важно разделять:

~~~text
voter / right implementer
≠ person receiving ballot
≠ counting commission member
≠ data-entry operator
≠ User Account that records Vote
~~~

Data entry является action of fixation/recognition of already expressed will, а не новым волеизъявлением оператора.

Для historical explainability сохраняются:

- source paper ballot;
- voter/right implementer;
- recorder/operator;
- received time;
- entry/recognition time;
- applicable rule/version;
- validation/admissibility result.

## 9. Submission time vs entry time

Для бумажного бюллетеня могут различаться:

~~~text
ballot signed time
ballot submitted/received time
scan time
data-entry time
domain recognition time
~~~

Applicable Voting Rule должна определять, какой момент используется для deadline/admissibility.

Нельзя автоматически считать data-entry time временем Vote, если paper ballot был своевременно подан ранее.

## 10. Duplicate paper digitization

Один бумажный бюллетень может быть:

- сфотографирован телефоном;
- затем отсканирован;
- затем повторно загружен.

Это:

~~~text
multiple representations/evidence
≠ multiple Votes
~~~

Duplicate recognition должна опираться на ballot/Voting Right/provenance semantics, а не только на image hash.

## 11. Paper + electronic submission for same Voting Right

Если один Voting Right использован сначала на бумаге, а затем электронно, либо наоборот, это не создаёт автоматически два effective Votes.

Policy должна определить:

- разрешено ли изменение позиции;
- до какого deadline;
- считается ли новая submission replacement/change;
- как ведётся Vote history;
- что происходит при конфликтующих позициях;
- требуется ли отзыв/аннулирование предыдущего ballot evidence;
- какой Vote effective для Calculation.

Historical original/previous Vote не переписывается молча.

## 12. Multiple Voting Rights one Subject

При pilot rule «1 qualifying Plot = 1 Voting Right» один Subject может иметь несколько Voting Rights.

Paper ballot может:

- содержать позиции по нескольким Rights;
- либо один ballot выпускаться на один Right.

Это profile/document-design choice.

Независимо от формы:

~~~text
one handwritten signature
may formalize a ballot containing several Voting Rights
≠ several Subjects
~~~

Каждая position должна быть однозначно сопоставима с соответствующим Voting Right.

## 13. Co-owners

При нескольких co-owners одного Plot количество Voting Rights и implementer semantics определяет applicable Voting Rule.

Paper channel не решает этот вопрос и не меняет ADR-001.

Если разные Subjects имеют разные Voting Rights, их signatures/ballots должны позволять отличить, кто реализовал какое право.

## 14. Invalid or incomplete paper ballot

Бумажный ballot может быть rejected/invalid, например из-за:

- отсутствия required signature;
- невозможности идентифицировать Voting/Voting Right;
- неоднозначной позиции;
- submission after deadline;
- unauthorized representative;
- incompatible ballot version;
- повреждения/неполноты;
- иных profile-specific причин.

Rejected ballot:

~~~text
≠ recognized Vote
~~~

Но если rejection предметно значим, source/evidence и reason должны быть traceable according to ADR-004/008/009.

## 15. Lost physical original after recognition

Если scan/photo существует, но physical original после recognition утрачен:

- Vote не должен автоматически исчезать;
- loss является отдельным material evidence/custody incident;
- applicable legal/profile policy определяет последствия для evidentiary strength/validity;
- history loss/correction/review должна сохраняться.

Community OS не должна silent-rewrite Vote только потому, что archive state ухудшился позднее.

## 16. Physical original received after preliminary scan

Возможен remote paper flow:

~~~text
participant signs paper
→ sends photo for preliminary receipt
→ original arrives later by mail/person
~~~

Нужно различать:

- preliminary copy/evidence;
- required original;
- provisional vs final admissibility if profile допускает;
- actual receipt deadline.

Настоящий stress-test не устанавливает, что photo alone достаточно для legally valid Vote; это legal/profile rule.

## 17. Open voting

Для open voting связь:

~~~text
Subject / Voting Right
↔ ballot position
↔ handwritten/electronic Signing
~~~

может быть допустимой и необходимой для auditability.

Mixed channel здесь концептуально прост: identities остаются различимыми, а source channel фиксируется provenance.

## 18. Secret voting

Для secret voting direct signed identifiable ballot создаёт конфликт:

~~~text
identity proof
+ signature
+ ballot position
→ destroys secrecy if kept together
~~~

Поэтому secret mixed voting требует отдельной модели:

~~~text
eligibility / ballot issuance evidence
≠ anonymous ballot content
~~~

Возможные mechanics не проектируются здесь.

Stage 11B обязан отдельно решить secret-voting identity separation до реализации такого mode.

## 19. Counting and result

Calculation должен работать по recognized effective Votes независимо от канала.

~~~text
paper-origin Vote ─┐
electronic Vote ───┼→ Calculation → Established Result
other allowed ─────┘
~~~

Calculation не должен суммировать:

- число файлов;
- число scans;
- число provider callbacks;
- число paper Documents.

Он считает Votes/positions согласно Voting Rule.

## 20. Audit/challenge package

При споре о легитимности mixed Voting должно быть возможно собрать explainable package, включающий where applicable:

- Voting Rule version;
- rights snapshot;
- agenda/question versions;
- Vote history;
- source channel;
- paper ballot original custody/provenance;
- scan/photo;
- handwritten/electronic Signing evidence;
- recorder/validator actions;
- rejection/correction history;
- Calculation;
- Established Result;
- protocol/Document.

Это не означает universal `Voting Evidence Package` entity.

## 21. Legal/reference signals

Current Ukrainian document-management rules for organizations require the material carrier and recording method of a management document to preserve the document during its established retention period.

For ОСББ, the current model charter explicitly requires paper survey sheets to be numbered, bound and stored by the board or another authorized person; electronic survey sheets are stored in a form that allows integrity verification.

These are strong signals in favor of preserving paper originals in a mixed-voting profile, but the ОСББ rule is not automatically a legal rule for the pilot ST.

Current official sources:

- https://zakon.rada.gov.ua/go/z0736-15
- https://zakon.rada.gov.ua/go/z0061-24

## 22. Fundamental entity check

Stress-test does **not** currently justify:

- `Paper Vote` entity;
- `Electronic Vote` entity;
- `Physical Archive Item` entity;
- `Vote Import` entity;
- `Ballot Scan` entity;
- `Mixed Voting` as a separate Voting subtype.

Working model:

~~~text
Voting
+ Voting Rule
+ Voting Rights
+ Vote
+ Documents/Representations/Signings
+ provenance
+ channel-specific recognition semantics
~~~

## 23. Candidate invariants

1. One Voting may accept several submission/formalization channels.
2. Vote identity is not channel identity.
3. Paper-origin Vote is not converted into a new electronic Vote during data entry.
4. Paper ballot Document ≠ Vote.
5. Handwritten Signing ≠ Vote.
6. Scan/photo ≠ physical original.
7. Scan/photo ≠ electronic signature.
8. Multiple scans ≠ multiple Votes.
9. Data-entry operator ≠ voter/right implementer.
10. Submission/receipt time ≠ data-entry time automatically.
11. Paper + electronic submissions for one Voting Right require explicit conflict/change semantics.
12. Calculation consumes recognized effective Votes, not files/documents/submissions.
13. Physical original retention is required for accepted paper-origin Vote under pilot baseline until authorized disposal is allowed by applicable retention policy.
14. Loss of original after recognition does not silently delete historical Vote.
15. Secret voting requires separation of identity/eligibility evidence from ballot content.
16. Mixed Voting does not require a new Voting subtype or new Vote entity.

## 24. Result

Mixed paper/electronic voting fits the existing Community OS architecture without new fundamental entities.

The most important new Stage 11B requirements are:

- channel-neutral Vote identity;
- paper ballot as document/formalization/evidence, not Vote itself;
- physical-original retention/custody;
- data-entry attribution;
- submission-time semantics;
- duplicate/conflicting multi-channel submission rules;
- open vs secret voting separation.

## 25. Next step

These findings should be input to the future Stage 11B BP.

Before implementation, Stage 11B still needs:

1. pilot legal/governance profile;
2. exact rule for paper/electronic conflict/change;
3. ballot document semantics;
4. retention period/legal destruction rule;
5. secret-voting decision;
6. remote paper original receipt rules, if supported.
