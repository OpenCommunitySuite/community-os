# Stage 11B — Mixed paper/electronic voting stress-test

**Статус:** Accepted Stage 11B requirements / detailed BP not yet drafted  
**Пилот:** Садівниче товариство «ЕКСПРЕС»  
**Связанный этап:** Stage 11B — Remote Participation and Electronic Voting  
**Цель:** проверить смешанную процедуру, в которой одна Voting допускает электронно подписанное волеизъявление и бумажные бюллетени с собственноручной подписью без раздвоения предметной модели Vote.

## 0. Принятые проектные выводы

Для дальнейшего Stage 11B зафиксированы следующие требования.

1. На предметном уровне Voting поддерживает два основных режима прозрачности выбора:
   - **открытое голосование (Open Voting)** — связь `Subject/Voting Right ↔ Position` допустима и исторически объяснима;
   - **тайное голосование (Secret Voting)** — Community OS может знать факт участия/реализации Voting Right, но не должна связывать конкретного участника с содержанием его выбора там, где выбор обрабатывается самой системой.

   Термин **«тайное»** используется как основной предметный термин. Слово «анонимное» может применяться в UI как пояснение, но не означает, что Community OS не знает участника вообще: для проверки права голоса факт участия может оставаться идентифицируемым.

2. **Mixed voting обязательно поддерживается:** одна Voting может одновременно иметь online и offline каналы без создания нескольких Voting identities.

3. **Offline сведения могут вноситься уполномоченными администраторами/членами комиссии.** Data-entry operator не становится voter/right implementer.

4. Community OS **не определяет и не исполняет физическую процедуру обеспечения тайны офлайн-голосования**. За пределами её предметной ответственности остаются, в частности:
   - форма и физическое изготовление бумажных бюллетеней;
   - опечатывание урн;
   - физическая выдача/сбор бюллетеней;
   - организация работы счётной/избирательной комиссии;
   - физический подсчёт бумажных бюллетеней;
   - процедура подписания комиссией бумажного протокола.

   Community OS может хранить результаты и подтверждающие документы этих действий, но не становится владельцем самой внешней организационной процедуры.

5. Community OS должна принимать **полный результат offline-части**, достаточный для построения общего результата mixed Voting.

   Для open offline channel это может быть набор individual Vote facts, введённых оператором.

   Для secret offline channel Community OS **не должна искусственно создавать Subject-linked individual Votes по каждому бумажному бюллетеню**. Вместо этого она принимает recognized aggregate/offline tally по вопросам/вариантам и иные необходимые счётные показатели как вход Calculation согласно ADR-008.

6. Evidence для offline части различается по режиму:
   - **open offline Vote** — к individual Vote можно приложить фото/скан бумажного бюллетеня с выбором и собственноручной подписью;
   - **secret offline participation** — можно приложить фото/скан заверенного списка/реестра выдачи бюллетеней либо другого документа, подтверждающего участие/реализацию права без раскрытия выбора;
   - **secret offline tally** — для подтверждения внесённых итоговых чисел может быть приложен фото/скан подписанного протокола/итогового документа счётной комиссии.

7. Физические оригиналы бумажных подтверждающих документов сохраняются вне Community OS согласно applicable retention/legal profile. Community OS хранит digital copies и provenance/links, но digital copy не заменяет physical original автоматически.

8. Native online Secret Voting, если будет реализован Community OS, является отдельной Stage 11B design task: техническая реализация не должна сохранять восстанавливаемую связь `Subject ↔ choice`. Это отличается от внешней физической процедуры офлайн-тайного голосования, которая остаётся вне компетенции Community OS.

## 1. Бизнес-потребность

Часть участников пилотного СТ не готова пользоваться КЕП/Дія.Підпис или другими electronic signing mechanisms.

Одновременно дистанционное электронное участие необходимо для собственников, которые отсутствуют физически, в том числе находятся за границей.

Поэтому пилот должен поддерживать один и тот же Governance process через несколько допустимых каналов:

~~~text
one Voting
→ common Voting Rule / rights snapshot / questions
→ online channels
→ offline channels
→ recognized individual Votes and/or recognized offline tally inputs
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

Там, где процедура представляет individual Vote как предметный факт, он остаётся фактом выражения позиции по конкретному Voting Right независимо от допустимого канала/formalization.

Для open Voting это обычно позволяет хранить individual Votes из online и offline channels.

Для secret offline Voting Community OS может принимать aggregate/offline tally без создания individual Subject-linked Vote facts по каждому бумажному бюллетеню.

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

Для **open paper Voting** собственноручное подписание бумажного Representation может быть исторически значимым Signing конкретного Document/Representation.

Для **secret paper Voting** собственноручная подпись участника может относиться к отдельному participation/issuance register или иному подтверждающему документу, а не к ballot content.

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

Для **open offline Vote** scan/photo бумажного бюллетеня может использоваться как digital Representation/evidence для:

- data entry;
- remote checking;
- audit;
- dispute review;
- linking to recognized Vote.

Для **secret offline Voting** Community OS обычно хранит scan/photo participation/issuance evidence и counting protocol/result document, а не персонально идентифицируемую копию ballot content.

Но:

~~~text
scan/photo
≠ physical original
≠ electronic signature
≠ new Vote
~~~

Если paper original уже породил recognized Vote, загрузка нескольких фотографий/сканов не создаёт несколько Votes.

## 6. Physical originals

Community OS не заменяет физические оригиналы бумажных evidence автоматически.

Для open offline Voting это прежде всего signed ballots. Для secret offline Voting это могут быть ballot sets, issuance/participation registers, counting protocol и иные документы внешней процедуры.

Рабочий pilot baseline:

~~~text
paper voting evidence used to support recognized result
→ relevant physical originals retained externally
→ digital copies may supplement them
→ destruction only when applicable retention/legal profile permits
   + authorized disposal is recorded where required
~~~

Community OS хранит digital copies/provenance и, при необходимости, сведения о physical custody/location, но не управляет физическим архивом как обязательной собственной подсистемой.

Настоящий stress-test не устанавливает универсальный statutory retention period для всех Community types.

## 7. Custody and archive provenance

Для значимого paper-origin evidence Community OS должна позволять зафиксировать/сослаться, где применимо, на:

- вид source evidence;
- received/provided time;
- digital copy/scan/photo;
- источник/ответственного за предоставление;
- physical custodian/location reference, если это ведётся в Community OS;
- relation to Voting / Vote / offline tally / participation evidence;
- applicable retention rule/reference;
- факт/основание последующего disposal, если он отражается системой.

Это не означает, что Community OS обязана моделировать полный физический archive workflow и не доказывает необходимость universal `Physical Archive Item` entity.

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

Для Stage 11B фиксируется граница:

~~~text
participation / Voting Right realization
≠ ballot choice
~~~

Community OS может знать и подтверждать, что конкретный Subject/Voting Right участвовал в secret Voting, но для secret result не должна создавать сохраняемую связь с конкретной Position.

### 18.1. Offline secret voting — external physical procedure

Физическая процедура обеспечения тайны остаётся за пределами Community OS.

Community OS **не управляет**:

- формой/печатью бумажного ballot;
- выдачей бюллетеня;
- sealed ballot box;
- физическим подсчётом;
- работой комиссии;
- подписанием бумажного протокола.

Community OS принимает результат этой внешней процедуры.

### 18.2. Offline secret participation evidence

Для подтверждения участия без раскрытия выбора к Voting/participation records может быть приложен digital copy:

- заверенного списка/реестра выдачи бюллетеней;
- receipt/attendance/issuance document;
- иного допустимого документа, показывающего, что Subject или допустимый представитель получил/реализовал право участия.

Такой evidence:

~~~text
proves participation / issuance
≠ proves ballot choice
~~~

### 18.3. Offline secret tally

Для secret paper channel Community OS не обязана создавать отдельный Vote по каждому анонимному бумажному бюллетеню.

Уполномоченный оператор может внести полный offline tally, например по каждому Question/Option:

- количество `За`;
- количество `Против`;
- количество `Воздержался`, если такой вариант предусмотрен;
- количество недействительных/неучтённых бюллетеней where applicable;
- иные счётные показатели, требуемые Voting Rule.

Источник чисел должен быть исторически объясним.

Как evidence можно приложить digital copy подписанного протокола/итогового документа счётной комиссии.

Это не делает protocol Document самим Calculation или Established Result.

### 18.4. Online secret voting

Если Community OS сама обеспечивает online secret Voting, техническая анонимность выбора уже не является внешней физической процедурой и должна быть обеспечена самой системой.

Минимальный invariant:

~~~text
Community OS may know:
Subject / Voting Right participated

Community OS must not retain:
Subject / Voting Right → secret Position
~~~

Конкретный credential/cryptographic protocol остаётся отдельной Stage 11B design task. Новый universal `Anonymous Vote Token` сейчас не вводится.

## 19. Counting and result

Mixed Voting должна сформировать **один полный Calculation / Established Result** из всех допустимых каналов.

Для open channels Calculation может использовать individual recognized Votes.

Для secret offline channel Calculation может использовать recognized aggregate/offline tally как иной исторически объяснимый вход согласно ADR-008, без восстановления individual Subject-linked Votes.

~~~text
online open Votes ───────────────┐
offline open Votes ──────────────┤
online secret aggregate/input ───┤
offline secret tally ────────────┼→ Calculation → Established Result
other allowed inputs ────────────┘
~~~

Calculation должен позволять объяснить:

- какие каналы участвовали;
- какие individual Votes использованы;
- какие aggregate offline values использованы;
- их source/provenance;
- применимую Voting Rule version;
- exclusions/corrections where relevant.

Calculation не должен суммировать:

- число файлов;
- число scans;
- число provider callbacks;
- число paper Documents.

Для secret offline части система считает признанные итоговые значения комиссии, а не пытается восстановить связь anonymous ballot с Voting Right.

## 20. Audit/challenge package

При споре о легитимности mixed Voting должно быть возможно собрать explainable package, включающий where applicable:

- Voting Rule version;
- rights snapshot;
- agenda/question versions;
- online Vote history;
- offline open Votes and their ballot evidence;
- source channel;
- scan/photo open paper ballot;
- signed/certified ballot-issuance/participation register for secret offline part;
- counting-commission protocol or other source document for secret offline tally;
- recorder/data-entry operator actions;
- rejection/correction history;
- Calculation;
- Established Result;
- protocol/Document.

Community OS хранит digital evidence/provenance, но не обязана владеть physical secret-voting procedure.

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
- `Mixed Voting` as a separate Voting subtype;
- fundamental individual `Anonymous Offline Vote` records created from secret paper ballots.

Отдельный concept для historically recognized offline tally может потребовать проверки при Draft Stage 11B BP, но сейчас ADR-008 уже допускает «иные входы» Calculation, поэтому новая fundamental entity заранее не вводится.

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

1. Voting has two principal choice-visibility modes: Open and Secret.
2. One Voting may accept several online/offline submission/formalization channels.
3. Vote identity is not channel identity.
4. Paper-origin open Vote is not converted into a new electronic Vote during data entry.
5. Paper ballot Document ≠ Vote.
6. Handwritten Signing ≠ Vote.
7. Scan/photo ≠ physical original.
8. Scan/photo ≠ electronic signature.
9. Multiple scans ≠ multiple Votes.
10. Data-entry operator ≠ voter/right implementer.
11. Submission/receipt time ≠ data-entry time automatically.
12. Paper + electronic submissions for one Voting Right require explicit conflict/change semantics where individual Vote identity exists.
13. Open offline Votes may be entered individually with ballot evidence.
14. Secret offline results may be entered as aggregate/offline tally without creating Subject-linked individual Votes.
15. Secret participation evidence ≠ secret choice evidence.
16. Calculation may combine individual Votes and historically explainable aggregate offline inputs where allowed by Voting Rule.
17. Community OS does not own physical offline secrecy mechanics; it stores results/evidence/provenance.
18. Physical originals remain subject to external applicable retention/archive rules; digital copies do not replace them automatically.
19. Native online Secret Voting must not retain a recoverable Subject/Voting Right → Position link.
20. Mixed Voting does not require a new Voting subtype or new Vote entity.

## 24. Result

Mixed paper/electronic voting fits the existing Community OS architecture without new fundamental Vote/channel entities.

Accepted Stage 11B direction:

- Open and Secret are the two principal voting visibility modes;
- online/offline channels may coexist within one Voting;
- administrators may enter offline results with explicit attribution;
- open offline channel can create individual Vote facts backed by ballot scans/photos;
- secret offline channel contributes aggregate tally plus participation/counting evidence, without Subject-linked ballot choices;
- physical secrecy procedure remains external to Community OS;
- Community OS must be able to combine all recognized online/offline inputs into one complete result;
- physical originals remain external archival evidence; Community OS stores digital copies/provenance;
- native online Secret Voting remains a dedicated design problem because the system itself must prevent retained Subject↔choice linkage.

## 25. Next step

These findings should be input to the future Stage 11B BP.

Before implementation, Stage 11B still needs:

1. pilot legal/governance profile;
2. exact rule for paper/electronic conflict/change;
3. ballot document semantics;
4. retention period/legal destruction rule;
5. secret-voting decision;
6. remote paper original receipt rules, if supported.
