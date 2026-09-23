# Stage 11B — Pilot stress-test: Membership ↔ Plot ↔ Voting Right

**Статус:** Working analysis / not normative  
**Пилот:** Садівниче товариство «ЕКСПРЕС»  
**Связанный этап:** Stage 11B — Remote Participation and Electronic Voting  
**Цель:** проверить, как фактическая практика «1 участок = 1 голос» соотносится с Membership model Community OS и нужен ли новый fundamental concept для повторных заявлений/приёмов одного Subject.

## 1. Источники и степень достоверности

### 1.1. Устав СТ «ЕКСПРЕС», редакция 2016 года

Предоставлены фотокопии 14 страниц устава.

Релевантные положения:

- п. 7.1 — членами могут быть физические лица, получившие земельный участок на определённых основаниях; текст связывает членство и участок, но не формулирует «одно членство на каждый участок»;
- п. 7.3 — вступление осуществляется на основании письменного заявления; решение о принятии принимает правление с последующим утверждением собранием членов;
- п. 8.1 — член имеет право участвовать в управлении и право голоса на собраниях;
- п. 10.1–10.2 — положения о наследниках сформулированы не полностью согласованно: с одной стороны, описано возникновение членства после оформления наследства/перехода собственности, с другой — предусмотрено заявление наследника и рассмотрение вопроса собранием;
- п. 14.1.6 — каждый член или уполномоченный представитель имеет один голос;
- п. 14.1.6 также допускает передачу голоса другому лицу при наличии надлежащего документа;
- п. 14.1.6 — кворум: более половины членов; для собрания уполномоченных — не менее 2/3 уполномоченных;
- п. 14.1.7 — часть решений требует 75% голосов присутствующих, остальные — простого большинства.

Устав **не содержит явного определения** «множественного членства» одного физического лица и не говорит прямо, что один человек считается несколькими членами из-за нескольких участков.

### 1.2. Сообщённая фактическая практика пилотного СТ

По уточнению участника пилота, модель «1 участок = 1 голос» на практике объясняется так:

- владелец каждого участка пишет отдельное заявление о принятии в члены относительно этого участка;
- если одно физическое лицо владеет несколькими участками, оно подаёт несколько заявлений;
- внутри СТ это трактуется как «множественное членство» одного человека;
- за каждым таким участком/приёмом фактически учитывается отдельный голос.

Это **сообщённая практика**, а не установленная настоящим документом правовая квалификация.

### 1.3. Закон України «Про кооперацію»

Официальный источник: https://zakon.rada.gov.ua/go/1087-15

На дату анализа закон формулирует:

- членом кооператива является физическое/юридическое лицо;
- вступление производится на основании письменного заявления;
- кооператив ведёт учёт своих членов;
- основной принцип — равное право голоса: один член кооператива — один голос;
- ст. 15: каждый член/уполномоченный имеет один голос, и это право не может быть передано другому лицу.

Это создаёт потенциальное противоречие с локальной практикой «одно физическое лицо = несколько членств/голосов», если именно эти нормы применимы к пилотному СТ.

Настоящий stress-test **не разрешает юридический спор**, а определяет модель Community OS так, чтобы она не искажала факты и не зашивала спорную квалификацию.

## 2. Проблема моделирования

Нельзя эквивалентно считать:

~~~text
Subject
= Membership
= Plot
= Voting Right
~~~

Нужно сохранить минимум четыре разных уровня:

~~~text
Subject
│
├─ Ownership / Use → Plot
│
└─ Membership → Community

Voting Rule
→ evaluates Membership / Plot / other bases
→ creates Voting Rights

Voting Right
→ implemented by Subject
→ Vote
~~~

Ключевой вопрос stress-test:

> Повторное заявление/решение о приёме одного Subject относительно второго/третьего участка создаёт новое Membership, новый historical admission fact/basis либо только ещё одно основание для Voting Right?

## 3. Working distinction

Предлагается различать:

~~~text
Membership
≠ Membership application
≠ admission/approval action
≠ admission basis
≠ Ownership
≠ Voting Right
~~~

**Membership** остаётся историческим отношением Subject ↔ Community.

Письменное заявление, решение правления и утверждение собранием — исторически различимые сведения/действия, способные быть основаниями возникновения/подтверждения Membership.

Несколько таких действий по одному Subject не должны автоматически:

- создавать несколько Subjects;
- создавать несколько User Accounts;
- создавать несколько Voting Rights;
- доказывать наличие нескольких юридически самостоятельных Membership.

Но Community OS не должна терять эту историю только потому, что её юридическая квалификация спорна.

## 4. Сценарий A — один Subject, три участка, три заявления

Фактический пример:

~~~text
Subject A
├─ owns Plot 15
├─ owns Plot 27
└─ owns Plot 83

historical records:
├─ Application/Admission basis A15
├─ Application/Admission basis A27
└─ Application/Admission basis A83
~~~

### Возможная юридическая интерпретация 1 — один Member

~~~text
Subject A
→ one Membership in Community
→ three historical admission/basis records
~~~

Если applicable Voting Rule = «1 member = 1 vote»:

~~~text
A → 1 Voting Right
~~~

### Возможная локальная интерпретация 2 — участок создаёт отдельное право

Даже без утверждения «A является тремя разными членами» Voting Rule может использовать смешанное основание:

~~~text
active Membership
+ qualifying Ownership of Plot 15
→ VR-15

active Membership
+ qualifying Ownership of Plot 27
→ VR-27

active Membership
+ qualifying Ownership of Plot 83
→ VR-83
~~~

Один Subject A является реализатором трёх разных Voting Rights.

### Вывод

Для поддержки фактической практики «1 участок = 1 голос» **не требуется моделировать одного человека как несколько Subjects и не требуется автоматически создавать три Membership identities**.

ADR-001 уже допускает:

~~~text
one Subject → multiple Voting Rights
~~~

## 5. Сценарий B — два совладельца одного участка

~~~text
Subject A ─┐
           ├─ Ownership → Plot 20
Subject B ─┘
~~~

Возможные rules:

### Object-based

~~~text
Plot 20 → one Voting Right
→ one applicable implementer according to rule
~~~

### Member-based

Если A и B являются самостоятельными Members и applicable law/rule даёт каждому члену один голос:

~~~text
Membership A → VR-A
Membership B → VR-B
~~~

### Вывод

Совладение само по себе не отвечает на вопрос о количестве голосов.

~~~text
co-ownership
≠ multiple Voting Rights automatically
~~~

Количество прав определяет Voting Rule.

## 6. Сценарий C — собственник участка не является членом

~~~text
Subject C
→ Ownership Plot 30
→ no recognized Membership
~~~

Устав пилота связывает право голоса с членством.

Следовательно для текущего charter-based profile:

~~~text
Ownership alone
≠ Membership
≠ Voting Right automatically
~~~

Если в будущем применяется иной legal profile, где собственники голосуют независимо от членства, это будет другая Voting Rule, а не изменение Subject/Object model.

## 7. Сценарий D — член СТ без текущего участка

Такой сценарий возможен хотя бы временно из-за:

- продажи участка;
- наследственного перехода;
- исправления реестра;
- задержки прекращения членства;
- иной исторической причины.

Community OS не должна автоматически выполнять:

~~~text
Ownership ended
→ Membership deleted
~~~

если применимые правила не определяют такое последствие.

Для Voting:

- member-based rule может продолжать давать право до прекращения Membership;
- object-based/mixed rule может не сформировать право без qualifying Plot;
- решение должно быть объяснимо применимой Voting Rule и snapshot.

## 8. Сценарий E — продажа одного из трёх участков

До продажи:

~~~text
Subject A
Membership M
Plots 15, 27, 83
~~~

При object-based/mixed pilot rule:

~~~text
VR-15
VR-27
VR-83
~~~

После продажи Plot 27:

- Ownership A→27 прекращается;
- историческое admission/application basis A27 не удаляется;
- Membership A↔Community не обязано прекращаться;
- будущий Voting snapshot может сформировать только VR-15 и VR-83, если rule требует current qualifying Ownership;
- ранее существовавшие VR/Vote не переписываются.

### Вывод

Наличие нескольких admission/basis records не требует нескольких Membership lifecycle только для того, чтобы корректно уменьшить количество будущих object-based Voting Rights.

## 9. Сценарий F — наследование

Устав содержит напряжение между:

- формулировкой о членстве наследников после оформления документов/перехода собственности;
- отдельной процедурой заявления наследника и рассмотрения вопроса собранием.

Поэтому Community OS не должна молча делать:

~~~text
Inheritance / Ownership acquired
→ Membership automatically
~~~

без profile-specific rule.

Безопасная модель:

~~~text
Inheritance / Ownership
→ separate fact

Application / admission / approval where required
→ Membership recognition

Membership
→ possible basis for future Voting Right
~~~

Неоднозначность устава должна сохраняться как legal/profile issue, а не разрешаться техническим default.

## 10. Сценарий G — повторное заявление уже действующего Member

Если Subject уже имеет Membership и подаёт ещё одно заявление относительно нового Plot, возможны разные предметные интерпретации:

1. заявление является дополнительным **основанием/историческим admission record** существующего Membership;
2. локальное правило считает его отдельной scoped membership-position;
3. заявление не имеет самостоятельного legal effect, но используется как operational record;
4. решение собрания формирует отдельное object-scoped право/обязанность, не являющееся новым Membership.

Community OS не должна выбирать один вариант только по факту наличия второго заявления.

Для импорта необходимо сохранять:

- Subject;
- Plot;
- Application/Document;
- board decision;
- assembly approval;
- relevant dates;
- claimed/effective relation to Membership;
- source/provenance.

## 11. Требуется ли новая fundamental entity Membership Admission?

### Аргументы за

Admission имеет собственные:

- заявление;
- решение правления;
- последующее утверждение собранием;
- дату;
- связь с Plot в локальной практике;
- возможный отказ/correction;
- historical provenance.

### Аргументы против fundamental entity сейчас

Однако:

- заявление уже может быть Document/Appeal depending on semantics;
- решение правления/собрания уже может быть Management Decision;
- Membership является итоговым историческим отношением;
- «основание Membership» уже допускается текущей моделью;
- несколько оснований не требуют отдельной top-level entity только ради хранения;
- пока не доказан независимый lifecycle Membership Admission вне соответствующих Documents/Decisions/Membership;
- Stage 11B не должен создавать общий Membership Workflow ради одного спорного pilot pattern.

### Рабочий вывод

~~~text
Membership Admission / Membership Basis
is semantically relevant
but new fundamental entity is NOT justified yet.
~~~

Нужен отдельный membership/admission business process позднее, если потребуется полноценно моделировать:

~~~text
application
→ board decision
→ assembly approval
→ effective Membership
→ refusal / correction / termination
~~~

Для Stage 11B достаточно ссылаться на historically recognized Membership и его основания.

## 12. Требуется ли разрешить несколько Membership одного Subject в одном Community?

**Universal prohibition вводить не следует.**

Текущая модель не должна утверждать:

~~~text
Subject + Community → exactly one Membership forever
~~~

потому что существуют:

- повторное вступление после прекращения;
- historical Membership periods;
- потенциальные local scoped membership semantics.

Но также нельзя утверждать:

~~~text
multiple applications
→ multiple simultaneous legal Memberships automatically
~~~

Рабочий invariant:

> несколько Membership relation instances одного Subject в одном Community допустимы моделью только если concrete community/legal profile признаёт их самостоятельную предметную identity и независимый lifecycle; сами по себе несколько заявлений этого не доказывают.

Для пилота до legal resolution предпочтительно:

~~~text
one Subject
+ historically explainable Membership
+ multiple application/admission/basis records
+ multiple Plot relations
+ Voting Rule derives applicable Voting Rights
~~~

## 13. Влияние на электронное голосование

При фактической модели «1 участок = 1 голос» электронное голосование **не требует нескольких User Accounts или нескольких подписей как разных лиц**.

Один Subject может реализовать несколько Voting Rights:

~~~text
Subject A
→ VR-15
→ VR-27
→ VR-83
~~~

Electronic ballot должен однозначно показывать, по каким Voting Rights выражается позиция.

Например:

~~~text
Question Q1

VR-15 / Plot 15 → ЗА
VR-27 / Plot 27 → ПРОТИВ
VR-83 / Plot 83 → ВОЗДЕРЖАЛСЯ

signed by Subject A
via accepted electronic signing mechanism
~~~

Signing подтверждает acting Subject и exact ballot data, но не создаёт дополнительные Voting Rights.

## 14. Юридический риск пилота

На дату анализа есть потенциальное противоречие:

~~~text
reported/current ST practice
→ one qualifying Plot / repeated admission → one vote per Plot

charter wording
→ each Member has one vote

Law "On Cooperation", if applicable
→ one Member = one vote
~~~

Следовательно «1 участок = 1 голос» остаётся важным фактическим pilot requirement, но его **legal basis must be verified separately**.

Community OS должна уметь воспроизвести фактическую модель, но не должна маскировать её как бесспорно законную.

## 15. Нормативные последствия stress-test

На этом этапе:

- **не требуется** новый Subject concept;
- **не требуется** дублировать Subject на каждый Plot;
- **не требуется** создавать User Account на каждое «членство»;
- **не требуется** fundamental Membership Admission entity;
- **не требуется** fundamental Membership Slot / Membership Unit entity;
- **не требуется** менять ADR-001;
- existing Voting Right model уже поддерживает несколько прав, реализуемых одним Subject;
- existing Membership model в целом достаточен, если сохраняются multiple historical grounds/admission records and applicability;
- возможная самостоятельная identity нескольких simultaneous Memberships остаётся profile-specific и не выводится из количества заявлений;
- pilot «1 участок = 1 голос» следует моделировать Voting Rule, а не количеством копий Subject/Membership;
- legal validity конкретного pilot Voting Rule остаётся открытым legal/profile question.

## 16. Кандидат на минимальную будущую нормативную синхронизацию

После review Stage 11B может потребоваться уточнить DOMAIN_MODEL/TERMINOLOGY:

> Membership может иметь несколько исторически значимых оснований/актов признания; наличие нескольких оснований одного Subject не создаёт автоматически несколько Memberships или Voting Rights. Один Subject может иметь несколько Membership relation instances в одном Community только если их самостоятельность следует из concrete community/legal semantics.

Это **пока proposal**, а не изменение normative main.

## 17. Следующий шаг

1. зафиксировать finding в Stage 11B pilot requirement;
2. сохранить legal ambiguity «1 member = 1 vote» vs reported «1 plot = 1 vote»;
3. не блокировать проектирование электронного голосования;
4. BP Stage 11B должен строить Voting Rights из applicable versioned Voting Rule, а не из количества заявлений/аккаунтов;
5. перед production use legally significant voting провести focused legal-profile validation пилотного СТ.
