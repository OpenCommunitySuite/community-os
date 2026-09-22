# Stage 11B — Pilot requirement: дистанционное участие и подписанное электронное голосование

**Статус:** Accepted product requirement / architecture not yet finalized  
**Связанный этап:** Stage 11B — Remote Participation and Electronic Voting  
**Первое внедрение:** пилотное садовое товарищество (СТ)

## 1. Бизнес-проблема

Пилотное СТ испытывает устойчивую практическую проблему с проведением общих собраний и участием собственников в принятии важных решений.

Существенные причины:

- часть владельцев участков физически отсутствует;
- часть владельцев находится за пределами Украины;
- военное положение, перемещение людей и иные обстоятельства затрудняют очное присутствие;
- критически важные решения по уставу/применимому праву должны приниматься коллективно;
- очный формат не должен быть единственным техническим способом реализовать допустимое право участия/голоса, если legal profile допускает дистанционную форму.

## 2. Принятое продуктовое требование

Community OS должна поддерживать для первого пилота СТ дистанционное участие и электронное волеизъявление с проверяемым подтверждением подписанта.

Целевой пользовательский смысл:

```text
eligible owner / right implementer
→ receives agenda/materials
→ identifies/signs remotely
→ submits a signed expression of will / Vote
→ Community OS validates evidence and domain admissibility
→ Vote is counted according to applicable Voting Rule
→ evidence remains verifiable later
```

Поддержка КЕП и provider mechanisms вроде Дія.Підпис является обязательным направлением для такого сценария.

## 3. Ключевая правовая граница

Законодательство Украины придаёт КЕП такую же юридическую силу, как собственноручной подписи.

Однако из этого **не следует автоматически**, что:

```text
valid КЕП
→ any remote meeting procedure is legally valid
→ any signed payload is automatically a valid Vote
```

Электронная подпись отвечает за подпись/идентификацию/целостность соответствующих electronic data в установленном законом объёме.

Право участия, Voting Right, quorum, presence, procedure form и условия зачёта Vote определяются отдельно applicable governance/legal profile.

## 4. Обязательная profile-driven модель

Community OS не должна hard-code один универсальный способ дистанционного собрания.

Legal/governance profile конкретного Community должен позволять определить:

- кто имеет Participation Right;
- кто имеет Voting Right;
- кто реализует конкретное право;
- допустимо ли представительство;
- что считается присутствием;
- как определяется quorum/правомочность;
- допускается ли remote synchronous participation;
- допускается ли signed asynchronous ballot / written survey;
- допускается ли mixed procedure;
- какой signature class необходим;
- какой electronic document/ballot требуется;
- какие сроки подачи волеизъявления;
- что происходит при повторной/изменённой подаче;
- как формируется и устанавливается результат;
- какое документальное оформление требуется.

## 5. Режимы, которые архитектура должна уметь поддержать

Не как универсально обязательные одновременно, а как configurable procedure modes:

```text
A. очное участие;
B. удалённое синхронное участие;
C. подписанное асинхронное электронное волеизъявление / ballot;
D. бумажный бюллетень с собственноручной подписью, если это допускает procedure/legal profile;
E. смешанная процедура A+B;
F. смешанная процедура A+B+C;
G. смешанная процедура A+B+C+D where legally allowed.
```

**Mixed voting является обязательной возможностью первого пилота.** Одна Voting не должна искусственно разбиваться на «бумажное» и «электронное» голосования только из-за разных каналов подачи позиции.

```text
one Voting
→ one Voting Rule / snapshot / set of Voting Rights
→ several permitted submission/formalization channels
→ Votes
→ one Calculation / Established Result
```

Канал/форма подачи не создаёт отдельную identity Vote автоматически.

### 5.1. Paper-origin Vote

Для участника, который не использует электронную подпись, procedure profile может разрешить бумажный бюллетень с собственноручной подписью.

Предметная цепочка:

```text
Voting Right
→ paper ballot Document / Representation
→ handwritten Signing
→ receipt / validation / admissibility check
→ recognized Vote
→ optional scan/photo/digital Representation
→ electronic accounting/counting in Community OS
```

После ввода в Community OS такой Vote **не становится «электронным голосом» по происхождению**. Это тот же domain Vote, полученный из paper-origin evidence и отражённый в системе.

### 5.2. Scan/photo does not replace the physical original

Фотография или скан бумажного бюллетеня:

- может быть digital Representation/evidence, связанной с исходным бумажным документом;
- обеспечивает оперативный просмотр, проверку и удалённый аудит;
- не становится новой Vote;
- не является electronic signature;
- не превращает собственноручную подпись в КЕП;
- не заменяет physical original автоматически.

Для принятого paper-origin Vote физический оригинал бюллетеня должен сохраняться согласно applicable retention/archive policy.

Для пилота действует безопасный baseline:

```text
accepted paper-origin Vote
→ physical original retention required
→ destruction prohibited
   until an explicit applicable retention rule
   and authorized archive/disposal action allow it
```

Community OS должна позволять исторически определить, где применимо:

- наличие physical original;
- ответственного хранителя/custodian;
- физическое место хранения или архивную ссылку;
- дату получения;
- связь с Voting / Voting Right / Vote;
- связь с scan/photo Representation;
- применимую retention policy;
- факт и основание последующего перемещения/передачи/уничтожения, если оно когда-либо допустимо.

Это не вводит universal `Physical Archive Item` entity автоматически; конкретная document/archive model уточняется отдельно.

### 5.3. Data entry does not make the operator the voter

Если бумажный бюллетень вводит в Community OS член счётной комиссии/оператор:

```text
voter / right implementer
≠ data-entry operator
```

Должны быть различимы:

- Subject, реализовавший Voting Right;
- собственноручно подписанный source ballot;
- лицо, принявшее/проверившее бюллетень;
- User Account/Subject, выполнивший data entry;
- момент фактической подачи/получения бюллетеня;
- момент digitization/recognition в Community OS.

Ввод данных оператором не является новым волеизъявлением от имени оператора.

### 5.4. One Voting Right across several channels

Если один и тот же Voting Right может быть реализован через электронный и бумажный каналы, applicable Voting Rule обязана определить conflict/change semantics.

Нельзя считать:

```text
paper submission
+
electronic submission
=
two independent Votes automatically
```

Нужно определить, где применимо:

- разрешено ли изменение ранее поданной позиции;
- до какого момента;
- какая submission является effective;
- как определяется duplicate;
- что считается correction;
- что происходит при бумажном и электронном волеизъявлении с разными позициями;
- как сохраняется история предыдущей позиции согласно ADR-001/004/008.

### 5.5. Open vs secret voting

Signed identifiable ballot подходит не для каждой формы голосования.

Для **открытого** голосования ballot может связывать Subject/Voting Right, позицию и собственноручную/электронную подпись.

Для **тайного** голосования подпись голосующего на самом ballot не является default requirement: такая подпись связывает identity с ballot position и уничтожает secrecy.

Правильная граница:

```text
proof of eligibility / Voting Right
≠ proof of ballot issuance
≠ proof of ballot authenticity
≠ secret ballot content
```

Для paper secret voting Stage 11B должен поддерживать модель, где голосующий подтверждает получение/реализацию права в отдельном register/receipt, а сам ballot остаётся anonymous, но authenticated через approved form/commission marks/controlled issuance.

Для remote paper secret voting требуется separated-identity process (например outer identified package + inner anonymous ballot), а простой upload photo от известного Subject не считается secrecy-preserving.

Для electronic secret voting direct КЕП/Дія.Підпис на сохраняемом ballot payload с choice также несовместим с настоящей тайной; eligibility/authentication и anonymous ballot submission должны проектироваться раздельно.

Подробная модель — в `STAGE-11B-MIXED-PAPER-ELECTRONIC-VOTING-STRESS-TEST.md`.

## 6. Электронная подпись не создаёт право голоса

Сохраняются существующие инварианты Community OS:

```text
КЕП / Дія.Підпис
≠ Participation Right
≠ Voting Right
≠ Vote

Signing
≠ Vote

valid cryptographic signature
≠ sufficient domain admissibility
```

Подпись подтверждает конкретные electronic data/действие в рамках применимой signing policy, но не создаёт ownership/member status/representation/voting entitlement.

## 7. Vote и signed document остаются разными фактами

В зависимости от legal profile дистанционный Vote может требовать подписанного electronic ballot/survey sheet.

Тогда:

```text
Vote
↔ Document / Revision / Representation
↔ Signing
```

Но:

```text
Vote ≠ Document ≠ Signing
```

Если конкретный profile допускает electronic Vote без самостоятельного Document, Community OS не должна создавать фиктивный документ только ради переиспользования Signing model.

## 8. Пилотное правило «1 участок = 1 голос»

В проекте для первого внедрения ранее принято правило:

```text
1 участок = 1 голос
```

После анализа устава и уточнения фактической практики это правило сохраняется как **реально используемый pilot requirement**, но его юридическое основание остаётся предметом focused legal-profile validation.

Сообщённая практика СТ такова:

- владелец каждого участка подаёт отдельное заявление о принятии в члены относительно соответствующего участка;
- один Subject с несколькими участками может иметь несколько таких заявлений/актов приёма;
- внутри СТ это трактуется как «множественное членство» и фактически используется для получения отдельного голоса по каждому участку.

Community OS не должна кодировать эту практику как:

```text
one person + three plots
→ three Subjects
```

или автоматически как:

```text
three applications
→ three legally independent Memberships
```

Рабочая модель пилота:

```text
one Subject
+ historically recognized Membership
+ 0..N admission/application/basis records
+ 1..N qualifying Plots
+ applicable Voting Rule
→ 0..N Voting Rights
```

При действующем фактическом правиле «1 участок = 1 голос» один Subject может быть реализатором нескольких Voting Rights — по одному на каждый qualifying Plot.

Это уже поддерживается ADR-001 и не требует дублирования Membership или User Account.

Одновременно устав формулирует «каждый член имеет один голос», а Закон України «Про кооперацію», если применим к пилотному СТ, закрепляет принцип «один член кооператива = один голос». Поэтому несколько заявлений одного физического лица **не считаются Community OS достаточным доказательством нескольких юридически самостоятельных Membership**.

До legally significant production use нужно проверить legal profile пилотного СТ и определить, является ли фактическая практика «множественного членства» юридически допустимым основанием нескольких голосов либо Voting Rule должен быть скорректирован.

Подробный stress-test зафиксирован в:

`STAGE-11B-PILOT-MEMBERSHIP-PLOT-VOTING-STRESS-TEST.md`.

## 9. Минимальные evidence requirements

Для подписанного дистанционного волеизъявления должны быть исторически объяснимы, где применимо:

- Governance Procedure / Question / Voting;
- конкретное Voting Right;
- right implementer / acting Subject;
- representation basis if applicable;
- Vote position;
- exact signed electronic payload or Document Representation;
- signature/provider evidence;
- validation result;
- signature class required vs actually validated;
- submission/effective time;
- applicable Voting Rule version;
- link to counting/result calculation.

Точный технический формат определяется после Stage 11A.

## 10. Международный/зарубежный участник

Нахождение владельца участка за пределами Украины не должно само по себе исключать его из дистанционного сценария.

Архитектура должна позволять использовать допустимый remote signing mechanism и evidence provider, если он принимается applicable policy и может быть validated.

Конкретные правила признания иностранного/европейского electronic signature относятся к signing/legal profile, а не к Voting identity.

## 11. Что остаётся открытым до Stage 11B design

Нужно отдельно решить:

- является ли remote signed Vote частью собрания или отдельным письменным/заочным опросом для конкретного profile;
- synchronous vs asynchronous deadlines;
- quorum/presence semantics;
- может ли signed ballot быть изменён/отозван;
- какая подача считается effective при нескольких submissions;
- когда фиксируется snapshot прав;
- требуется ли отдельный electronic voting sheet Document;
- какие signatures допустимы;
- как подтверждается representation;
- что должно войти в протокол;
- какие current-law требования применимы именно к пилотному СТ.

## 12. Решение по этапам

```text
Stage 11A
→ electronic Document Signing semantics
→ evidence / validation / recognition

Stage 11B
→ remote participation
→ electronic Vote semantics
→ link to Signing where required
→ pilot ST legal/governance profile
```

Stage 11B является обязательным для первого пилота и не считается «будущей опцией».
