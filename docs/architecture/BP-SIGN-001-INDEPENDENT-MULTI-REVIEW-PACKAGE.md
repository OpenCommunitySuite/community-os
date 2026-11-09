# Independent multi-review package — PR #73 / BP-SIGN-001

**Repository:** OpenCommunitySuite/community-os  
**PR:** #73 — `docs: define Stage 11A electronic document signing`  
**Base:** `main@09f8d84a9ccca2b0b846833efd4ec8c8cc8df072`  
**Frozen Draft head before packaging:** `6409a4083e6214abf2679d4937d3310bcdbb8a56`  
**Stage:** 11A — электронное подписание документа  
**Related pilot context:** Stage 11B — дистанционное участие и подписанное электронное голосование  
**Review mode:** независимый предметно-архитектурный stress-review. Не проектировать код, БД, API, UI, криптографическую библиотеку или конкретный provider flow. Не подменять отдельный legal opinion по конкретной процедуре.

---

## 1. Задание независимому рецензенту

Проведи независимый stress-review Draft `BP-SIGN-001 — Электронное подписание документа / Electronic Document Signing` в контексте приложенных нормативных документов Community OS, Stage 11A stress-test, current-law/reference анализа Украины и обязательного pilot context Stage 11B.

Главная цель review — проверить, действительно ли существующего понятия `Signing` ADR-009 достаточно для electronic signing и корректно ли Draft отделяет:

```text
Signing
from
electronic signature artifact
authentication / electronic identification
Subject mapping
Domain Power / Representation
validation / revalidation
external integration result
Vote / Voting Right
Document Revision / Representation
```

Не оценивай удобство реализации и не вводи новую fundamental entity только потому, что её удобно хранить отдельно.

Особенно проверь:

1. достаточно ли существующей stable identity `Signing` из ADR-009 для electronic scenario;
2. корректно ли не вводить отдельную fundamental `Electronic Signing`;
3. достаточно ли `signing evidence/provenance package` без fundamental `Signing Evidence`;
4. не имеет ли `Signature Validation` уже сейчас самостоятельной identity/lifecycle, достаточных для fundamental entity;
5. корректно ли разделены:
   - semantic target;
   - exact cryptographic target;
   - Document Revision;
   - Document Representation;
   - signed electronic data/artifact;
6. достаточно ли Draft объясняет, что подписание одной Representation не переносится автоматически на другую Representation или новую Revision;
7. корректно ли различены:
   - signer identity from certificate/provider evidence;
   - Community OS Subject;
   - acting Subject;
   - User Account/session;
   - represented Subject/body;
   - Domain Power / Representation basis;
8. достаточно ли разделены cryptographic/trust validation и domain admissibility;
9. корректно ли сформулирована applicable signing policy без создания universal signing rule engine;
10. достаточно ли history/provenance для certificate expiry/revocation, trust-list changes и later revalidation;
11. корректна ли semantics `revalidation ≠ new Signing`;
12. корректно ли Draft обращается с invalid/broken evidence before recognition и correction ошибочно recognized Signing;
13. достаточно ли ADR-011 для duplicate/redelivery, unknown outcome и reconciliation внешнего provider flow;
14. не требуется ли domain identity для external signing operation/provider transaction;
15. корректно ли Draft не делает КЕП/Дія.Підпис источником Subject, Domain Power, Voting Right или Vote;
16. не создаёт ли Draft скрытый universal `Signed Action` или, наоборот, не нужен ли такой concept уже на Stage 11A;
17. корректно ли отложить direct signed non-document actions/Vote evidence до Stage 11B;
18. выдерживает ли модель confirmed ОСББ scenario, где signed electronic survey/voting sheet связан с Vote, но `Vote ≠ Document ≠ Signing`;
19. не ломает ли pilot requirement СТ границу Stage 11A/11B;
20. корректно ли не моделировать reported «множественное членство» пилотного СТ через копии Subject/User Account или автоматически независимые Membership;
21. достаточно ли ADR-001 для `one Subject → multiple Voting Rights` при profile rule «1 участок = 1 голос»;
22. не требуется ли сейчас отдельная fundamental `Membership Admission`, `Membership Slot` или `Membership Unit`;
23. есть ли конфликт Draft с ADR-001/004/005/008/009/010/011/013;
24. какие выводы требуют нормативной sync DOMAIN_MODEL / TERMINOLOGY / ADR после принятия;
25. какие вопросы должны остаться legal/profile-specific и не становиться universal Community OS rules.

Если предлагаешь новую fundamental entity, обязательно обоснуй:

- её stable domain identity;
- независимый lifecycle;
- собственные history/correction rules;
- ownership bounded context;
- случаи, которые невозможно корректно выразить уже существующими понятиями.

---

## 2. Формат ответа

Верни review **одним Markdown-файлом (.md)**, пригодным для скачивания и последующей передачи ChatGPT для multi-review consolidation.

Для каждого замечания используй:

- **Severity:** BLOCKER / MAJOR / MINOR / OBSERVATION
- **Раздел Draft / связанный документ**
- **Проблема**
- **Почему это проблема**
- **Предлагаемое минимальное исправление**
- **Нужно ли менять DOMAIN_MODEL / TERMINOLOGY / ADR / BP / legal-profile document**

Отдельно в конце ответь на следующие вопросы:

1. Достаточна ли existing `Signing` identity ADR-009?
2. Нужна ли fundamental `Electronic Signing`?
3. Нужна ли fundamental `Signing Evidence`?
4. Нужна ли fundamental `Signature Validation`?
5. Корректна ли dual-target model `semantic target ↔ exact cryptographic target`?
6. Достаточна ли модель exact signed content / Representation binding?
7. Корректно ли Subject mapping отделён от certificate/provider identity?
8. Корректно ли Domain Power/Representation отделены от signature validity?
9. Достаточны ли expiry/revocation/revalidation semantics?
10. Достаточен ли ADR-011 для provider duplicate/redelivery/unknown outcome/reconciliation?
11. Нужен ли universal `Signed Action` уже сейчас?
12. Корректно ли отложить direct signed Vote/non-document action до Stage 11B?
13. Корректна ли связь `Vote ↔ Document ↔ Signing` без слияния identities?
14. Достаточна ли текущая модель Membership/Plot/Voting Right для reported pilot practice?
15. Нужен ли `Membership Admission` / `Membership Slot` / `Membership Unit`?
16. Какие минимальные normative changes нужны после принятия BP-SIGN-001?
17. Какие выводы должны остаться legal/profile-specific?
18. Итог: **point fixes sufficient** или **conceptual redesign required**, с аргументами.

Не ограничивайся подтверждением Draft. Ищи скрытые смешения ownership, identity, legal validity, evidence и технических объектов.

---

## 3. Что именно является предметом review

**Primary subject:** `BP-SIGN-001`.

Stage 11A stress-test является рабочим обоснованием Draft и тоже может быть оспорен.

Legal/reference analysis Украины — входной источник требований и ограничений, но не нормативная domain model Community OS.

Документы Stage 11B включены **как boundary/stress context**, а не как уже спроектированный и принятый BP удалённого голосования.

Review не должен:

- завершать Stage 11B вместо Stage 11A;
- объявлять legal validity pilot voting rule без отдельного правового основания;
- превращать current Ukrainian profile в universal platform semantics.

---

## 4. Уже принятые ограничения проекта

Не пересматривай их без прямого обнаруженного противоречия:

- Subject ≠ User Account;
- ownership ≠ membership ≠ representation ≠ access ≠ Voting Right;
- один Subject может реализовывать несколько Voting Rights;
- право голоса создаётся применимой версией Voting Rule, а не UI/account/signature;
- Governance Question ≠ Voting ≠ Vote ≠ Calculation ≠ Established Result ≠ Management Decision;
- Document ≠ Revision ≠ Representation ≠ File;
- Signing ≠ Approval ≠ Registration ≠ Publication;
- внешний provider/system не становится Subject;
- external information ≠ received information ≠ recognized domain fact;
- technical authentication/authorization ≠ domain admissibility;
- current state не переписывает historical fact молча;
- применимые rule/version/used values должны быть исторически объяснимы;
- новый fundamental concept вводится только при собственной domain identity/history/rules;
- profile-specific legal requirement не становится universal rule автоматически.

---

## 5. Draft под review — полный BP-SIGN-001

# BP-SIGN-001 — Электронное подписание документа / Electronic Document Signing

**Статус:** Draft / Stage 11A stress-test completed  
**Контекст:** Документы и формализация  
**Связанные контексты:** Субъекты; Полномочия и представительство; Управление и коллективные процедуры; Интеграции; сквозные History/Rules/Access  
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий BP определяет предметную семантику электронного подписания документа в Community OS.

Он развивает уже принятую ADR-009 модель:

```text
Signing
= historically significant action
  over a concrete Document Revision
  or a specific Document Representation
```

Stage 11A не вводит новый вид права, новую identity электронной подписи или отдельный bounded context.

Базовая цепочка:

```text
Document / Revision
+ exact electronic Representation/data
+ signer / acting Subject
+ applicable authority/signing policy
+ external electronic-signature evidence
→ validation / mapping
→ domain admissibility
→ recognition
→ Signing
→ retained evidence/provenance
```

## 2. Ключевые границы

```text
Signing
≠ electronic signature artifact
≠ authentication
≠ electronic identification
≠ Domain Power
≠ Approval
≠ Registration
≠ Publication
≠ Vote
```

Также:

```text
valid cryptographic signature
≠ sufficient authority to sign
```

## 3. Нормативная основа

BP развивает:

- ADR-004 — historical explainability, no silent rewrite, temporal semantics;
- ADR-005 — applicable rules/versions and historical used values;
- ADR-009 — Document / Revision / Representation / Signing semantics;
- ADR-010 — Subject / User Account / Domain Power / Representation / technical authorization boundaries;
- ADR-011 — external information / validation / mapping / domain recognition / duplicate / unknown outcome / reconciliation;
- ADR-013 — source of truth vs derived/read-model boundaries.

Current-law/reference input for Ukraine is documented separately in:

- `docs/references/UKRAINE_ELECTRONIC_SIGNING_LEGAL_ANALYSIS.md`.

Legal/reference requirements do not become universal domain rules automatically.

## 4. Что входит

BP охватывает:

- target электронного подписания;
- semantic target и exact cryptographic target;
- signer/acting Subject;
- действие от собственного или чужого имени;
- Domain Power / Representation basis;
- applicable signing policy;
- external signing result/evidence;
- validation/mapping/domain recognition;
- signature class/method as policy input;
- evidence/provenance;
- validation/revalidation history;
- certificate/provider/trust context where applicable;
- multiple signers;
- duplicates/redelivery/unknown outcome;
- invalid/insufficient evidence;
- correction/review recognized Signing;
- relation with Document Revision/Representation;
- boundary with Governance/Vote.

## 5. Что не входит

BP не определяет:

- конкретный PKI provider;
- обязательное использование Дія.Підпис;
- конкретный signing API;
- XAdES/PAdES/CAdES/ASiC implementation;
- certificate storage technology;
- cryptographic libraries;
- key storage;
- UI flow;
- universal legal validity for every Community/document type;
- remote meeting participation;
- electronic Vote lifecycle;
- Voting Right / Participation Right;
- universal Archive/retention implementation.

## 6. Signing остаётся существующим понятием ADR-009

Настоящий BP не вводит отдельную fundamental entity `Electronic Signing`.

Electronic form является способом создания/подтверждения существующего предметного Signing.

```text
electronic Signing
is a specialization/use case of Signing
not a new ownership boundary
```

## 7. Identity Signing

Каждое предметно значимое Signing имеет собственную historical identity.

Identity Signing не определяется:

- certificate serial alone;
- signature bytes/hash alone;
- User Account;
- provider transaction ID;
- file name;
- timestamp;
- Document status `signed`.

Одна Revision/Representation может иметь несколько independent Signing facts.

## 8. Multiple signers

Если одну Revision/Representation подписывают несколько Subjects:

```text
target
├─ Signing S1 by Subject A
├─ Signing S2 by Subject B
└─ Signing S3 by Subject C
```

Не вводится universal aggregate status `signed=true`, который скрывает individual Signing identities.

Document-kind policy может определять required signer composition, но это не меняет identity отдельных Signing facts.

## 9. Semantic target и cryptographic target

Для электронного подписания следует различать:

- **semantic target** — Revision/Representation, которую Subject намерен подписать в предметном смысле;
- **cryptographic target** — точные electronic data, с которыми связан external electronic signature.

Например:

```text
semantic target = Document Revision R1
cryptographic target = PDF Representation P1
```

Document/signing policy определяет, считается ли valid signing конкретной Representation достаточным Signing Revision.

## 10. Exact signed content

Для recognized electronic Signing должно быть исторически определимо, какие именно electronic data были подписаны.

Недостаточно хранить только:

- текущий PDF;
- имя файла;
- Document ID;
- Revision ID;
- provider transaction ID.

Нужно сохранять/иметь возможность восстановить exact signed Representation/data и проверяемую связь evidence с ним.

Технический способ — hash, immutable artifact, signed container, detached signature binding или иной механизм — относится к implementation/integration design, не к настоящему BP.

## 11. Representation change

```text
Signing(P1)
≠ Signing(P2) automatically
```

Если после подписания создаётся новая Representation P2 той же Revision, прежнее Signing не переносится автоматически.

Последствия определяются signing/document-kind policy.

## 12. New Revision

Новая Document Revision не наследует Signing предыдущей Revision автоматически согласно ADR-009.

Даже если визуально содержание совпадает, новая Revision требует собственной применимой signing semantics.

## 13. Acting Subject и User Account

Следует различать:

- signer identity from electronic-signature evidence;
- mapped Community OS Subject;
- acting Subject;
- technical User Account/session;
- represented Subject/body where applicable;
- Domain Power / Representation basis.

```text
certificate identity
≠ User Account
≠ Subject automatically
≠ Domain Power
```

## 14. Signing от собственного имени

При действии от собственного имени должны быть исторически определимы, где применимо:

- acting Subject;
- target;
- applicable signing policy;
- validation/recognition context;
- time semantics;
- evidence/provenance.

Technical account не заменяет Subject attribution.

## 15. Signing от чужого имени

Если Subject подписывает от имени другого Subject или Governance Body:

- действующий Subject;
- представляемый Subject/body;
- Representation / Domain Power basis;
- область полномочия;
- применимость к target/action;
- relevant effective time

должны быть исторически объяснимы.

External certificate сам по себе не доказывает Community OS Domain Power.

## 16. Provider result не является Signing

```text
provider callback / signed artifact
≠ recognized Signing
```

External result проходит ADR-011:

```text
external information
→ received information
→ validation
→ mapping
→ subject/target recognition
→ domain admissibility
→ Signing recognition
```

## 17. Cryptographic validation ≠ domain admissibility

Успешная проверка signature integrity/credential/trust отвечает на вопросы технической/доверительной валидности evidence.

Она не отвечает автоматически на вопросы:

- имел ли Subject право подписывать;
- мог ли он действовать от имени Community/Body;
- подписал ли он допустимую Revision;
- требовался ли именно этот signature class;
- действовало ли Representation/Domain Power;
- выполнена ли procedure-specific requirement.

## 18. Applicable signing policy

Signing policy может определять, где применимо:

- какие Subjects/roles/bases допускаются;
- какие signatures/method classes приемлемы;
- должен ли signing target быть Revision или specific Representation;
- сколько подписантов требуется;
- порядок signing;
- необходимость timestamp/trust evidence;
- допустимость remote provider;
- consequences invalid/expired/revoked evidence;
- document-kind/legal requirements.

Universal one-size-fits-all signing policy не вводится.

## 19. Electronic signature classes

Community OS не предполагает, что любое electronic Signing обязательно требует КЕП.

Applicable policy может требовать конкретный legal/technical class согласно применимому закону.

Для Украины правовые термины различают, среди прочего:

- electronic signature;
- advanced electronic signature;
- advanced electronic signature based on qualified certificate;
- qualified electronic signature (КЕП).

Формулировку закона «electronic signature based on a qualified certificate» нельзя автоматически интерпретировать как «только КЕП».

## 20. Дія.Підпис

Дія.Підпис рассматривается как один из possible provider mechanisms qualified electronic signature.

```text
Дія.Підпис
≠ special domain entity
≠ Domain Power
≠ Voting Right
≠ Vote
```

Provider-specific identifiers относятся к integration scope.

## 21. Signing evidence/provenance

Для recognized Signing должен сохраняться достаточный evidence/provenance context.

Он может включать, где применимо:

- exact signed data / Representation reference;
- external signature artifact/container;
- signature class/method;
- signer identity established by validation;
- provider/trust-service context;
- certificate/signing identifiers;
- claimed/provided signature time;
- trusted timestamp evidence where applicable;
- validation time/result;
- trust/certificate status relevant to validation;
- mapping to Subject;
- authority/admissibility basis;
- source/integration provenance.

Перечень не является universal storage schema.

## 22. Fundamental Signing Evidence entity не вводится

Electronic signing evidence требуется семантически, но этого недостаточно для введения отдельной fundamental `Signing Evidence` entity.

Рабочая модель:

```text
Signing
→ evidence/provenance package
→ 0..N validation observations/history
```

Evidence может существовать как:

- Document Representation/File/external artifact;
- received integration information;
- confirming information;
- provenance attached to Signing.

Новый universal Evidence bounded context/entity не создаётся.

## 23. Signature Validation

Validation не является Signing.

Одно Signing может иметь несколько validation observations в разные моменты.

```text
Signing S1
├─ validation at t1
├─ revalidation at t2
└─ revalidation at t3
```

Universal fundamental `Signature Validation` entity не вводится.

Если validation является historically significant для конкретного process/legal policy, её result/context сохраняется как provenance/evidence согласно ADR-004/011.

## 24. Revalidation

Повторная validation не создаёт новое Signing автоматически.

Revalidation может понадобиться:

- при последующей проверке документа;
- после изменения trust list;
- после certificate expiry/revocation;
- при споре;
- при migration/archive;
- при verification by another system.

Новый результат revalidation не переписывает исходный historical recognition молча.

## 25. Certificate expiry

```text
certificate expired now
≠ historical Signing invalid automatically
```

Applicable legal/trust policy и historical validation context определяют последствия.

Current certificate state не используется для silent rewrite прошлого.

## 26. Certificate revocation

Поздний revocation не приводит автоматически к удалению/аннулированию всех historical Signings.

Могут быть предметно значимы:

- effective revocation time;
- reason;
- original validation evidence;
- trusted time evidence;
- applicable law/policy.

Если требуется review/correction Signing, оно выполняется явно.

## 27. Invalid/broken evidence before recognition

Если external signature:

- не проверяет integrity;
- не соответствует required trust level;
- относится к другим data;
- не может быть mapped;
- не удовлетворяет policy,

она не создаёт recognized Signing.

Полученная информация может сохраняться как rejected/unrecognized integration evidence согласно ADR-011.

## 28. Correction recognized Signing

Если Signing было признано ошибочно, например из-за:

- неправильного Subject mapping;
- ошибочной validation;
- неверной authority/admissibility check;
- ошибочной target binding,

исправление не выполняется silent delete.

```text
Signing recognition
→ later discovered error
→ explicit correction/review
→ historical trace preserved
```

Не вводится universal `Signing Correction` entity автоматически.

## 29. Duplicate / redelivery

Повторная доставка одного external result не создаёт новый Signing автоматически.

Но universal dedup key не определяется как:

```text
same signer + same target + same timestamp
```

Конкретный integration semantic contract определяет duplicate/redelivery recognition.

## 30. Unknown outcome

Запуск signing flow не означает успешного Signing.

При потере callback/ответа:

```text
signing requested
≠ Signing recognized
```

Retry/reconciliation выполняются по ADR-011. External duplicate может возникнуть; Community OS не создаёт новый собственный Signing без recognition.

## 31. Signing time

Следует различать:

- user/provider asserted signing time;
- trusted electronic timestamp where applicable;
- provider event time;
- recording time in Community OS;
- validation time;
- effective time of authority/policy where relevant.

Ни client timestamp, ни DB timestamp не являются универсально trustworthy signing time.

## 32. Форматы подписи

XAdES, PAdES, CAdES, ASiC и другие formats/containers являются technical/integration concerns.

Domain semantics требует:

- exact signed content;
- signer;
- evidence;
- validation;
- target;
- authority/admissibility;
- history.

Формат не создаёт новый domain type.

## 33. Electronic document original

Если применимое право требует электронный документ как original, Community OS должен сохранять required electronic representation/evidence таким образом, чтобы его integrity и signatures могли быть проверены в будущем.

Printed/rendered copy не заменяет автоматически signed electronic original.

Конкретные retention/archive rules определяются separately.

## 34. Signing и Approval

```text
Signing ≠ Approval
```

Subject может подписать Revision:

- подтверждая авторство;
- подтверждая ознакомление;
- удостоверяя действие;
- формализуя волеизъявление;
- в иной document-kind role.

Это не создаёт Approval, если applicable process не определяет его отдельно.

## 35. Signing и Registration / Publication

```text
Signing
≠ Registration
≠ Publication
```

Подписанная Revision не становится автоматически зарегистрированной или опубликованной.

## 36. Signing и Governance

Signing может быть evidence/document formalization для Governance process, но:

```text
Signing
≠ Participation Right
≠ Voting Right
≠ Vote
≠ Established Result
≠ Management Decision
```

Governance context остаётся owner соответствующих facts.

## 37. Signed Vote-related Document

Если applicable profile требует signed voting/survey sheet:

```text
Vote
↔ related Document/Revision/Representation
↔ Signing
```

Связь не объединяет их identities.

Можно иметь:

- valid Vote with required signed Document;
- rejected Vote because required formalization missing;
- technically valid signature but inadmissible Vote;
- corrected Document without automatic Vote correction.

Точные relations определяет Stage 11B/legal profile.

## 38. Vote без Document

Stage 11A не создаёт artificial Document только для того, чтобы воспользоваться Signing model.

Если future Governance profile допускает electronic Vote без independent Document semantics, доказательство такого action должно проектироваться в Stage 11B в ownership Governance/integration, а не через фиктивный Document.

## 39. ОСББ — confirmed profile signal

Current Ukrainian law подтверждает для ОСББ/совладельцев многоквартирного дома сценарии:

- remote meeting participation via video conference;
- written survey in electronic form;
- electronic survey sheet;
- electronic signature based on qualified certificate;
- storage allowing future integrity verification.

Это **profile/legal requirement**, а не universal Community OS invariant.

## 40. Пилотное СТ

Для пилотного садового товарищества **дистанционное участие и подписанное электронное волеизъявление являются обязательным продуктовым сценарием Stage 11B**.

Цель — дать владельцам/допустимым реализаторам права возможность участвовать в важных решениях, даже если они физически отсутствуют в СТ или находятся за границей.

При этом Stage 11A не копирует ОСББ procedure как universal rule и не делает вывод:

```text
КЕП valid
→ Vote legally valid automatically
```

До юридически значимого remote voting legal/governance profile пилотного СТ должен определить:

- legal form pilot ST;
- applicable law;
- charter;
- кто является носителем права участия и права голоса;
- quorum/presence semantics;
- допускаемые in-person / remote synchronous / signed asynchronous / mixed modes;
- procedure requirements;
- acceptable electronic signature class;
- document/ballot/protocol formalization.

Если применимое право пилотного СТ содержит императивное правило, противоречащее текущей конфигурации `1 участок = 1 голос`, legal rule имеет приоритет для юридически значимой процедуры, а Community OS должна позволить profile-specific Voting Rule вместо сокрытия конфликта.

Universal Signing model при этом остаётся reusable.
## 41. Проверочные сценарии

### 41.1. One signer / one Representation

A signs P1 → evidence validated → Subject/authority mapped → Signing S1.

### 41.2. Multiple signers

A and B sign same target → S1 + S2.

### 41.3. Valid signature, no authority

Cryptography valid; Domain Power absent → required-role Signing is not recognized as admissible merely because signature valid.

### 41.4. Unknown Subject mapping

Certificate identity valid, but no reliable mapping to Subject → no invented Subject; recognition remains unresolved/rejected according to policy.

### 41.5. New Representation

P2 generated after P1 signed → P2 is not signed automatically.

### 41.6. Revalidation after expiry

S1 remains historical fact; revalidation V2 is new evidence/assessment, not new Signing.

### 41.7. Later revocation

No silent rewrite. Applicable policy decides review consequences.

### 41.8. Broken signed data

Integrity fails → no new Signing recognition; if existing recognition proved wrong, explicit correction.

### 41.9. Provider redelivery

Duplicate callback → no second Signing automatically.

### 41.10. Provider unknown outcome

No Signing until recognized evidence is available; reconciliation required.

### 41.11. Representative signs

Signer A / represented Subject B / authority basis R → each remains distinct.

### 41.12. Дія.Підпис

Provider returns valid QES → still requires mapping, authority and target recognition.

### 41.13. ОСББ survey sheet

Vote fact and signed electronic Document are related but independent.

### 41.14. Direct electronic Vote

If legal/profile semantics do not create Document, Stage 11B must model action evidence without fake Document.

## 42. Инварианты

1. Signing has own historical identity.
2. Electronic signature artifact ≠ Signing.
3. Authentication ≠ Signing.
4. Electronic identification ≠ Signing.
5. Cryptographic validity ≠ Domain Power.
6. User Account ≠ signer Subject automatically.
7. Certificate/provider identity ≠ Community OS Subject automatically.
8. Semantic target and exact cryptographic target remain distinguishable.
9. Electronic Signing keeps historically explainable exact signed content.
10. Signing one Representation does not sign another automatically.
11. New Revision does not inherit prior Signing.
12. Multiple signers create distinct Signings.
13. External provider result requires ADR-011 recognition.
14. Redelivery ≠ new Signing automatically.
15. Unknown outcome ≠ successful Signing.
16. Revalidation ≠ new Signing.
17. Current expiry/revocation does not silently rewrite historical Signing.
18. Invalid evidence does not create recognized Signing.
19. Correction does not silently delete historical recognition.
20. Signing method/provider does not create Domain Power.
21. Signing ≠ Approval ≠ Registration ≠ Publication.
22. Signing ≠ Vote ≠ Voting Right.
23. Signed Vote-related Document ≠ Vote.
24. Signature format/container ≠ domain identity.
25. Universal fundamental Signing Evidence entity is not introduced.
26. Universal fundamental Signature Validation entity is not introduced.
27. Legal/profile-specific required signature class is not universalized.
28. ОСББ remote/electronic rules are not transferred automatically to pilot ST.

## 43. Нормативные последствия Draft

Рабочий вывод Stage 11A:

- ADR-009 Signing concept достаточен как fundamental domain action;
- отдельная fundamental `Electronic Signing` entity не требуется;
- separate `Signing Evidence` fundamental entity пока не требуется;
- separate universal `Signature Validation` entity пока не требуется;
- evidence/provenance/revalidation history должны быть явно описаны;
- electronic Signing специализирует Document context;
- external signature mechanisms/providers остаются integration/technical layer;
- remote participation/Vote остаются Stage 11B.

Это Draft до independent review/принятия.

## 44. Вопросы для independent review

1. Достаточно ли ADR-009 Signing identity для electronic scenario?
2. Достаточно ли evidence/provenance package без Signing Evidence entity?
3. Нужна ли identity-bearing Signature Validation?
4. Корректно ли разделены semantic target и cryptographic target?
5. Достаточно ли model для detached/container signatures?
6. Корректно ли Subject mapping отделено от certificate identity?
7. Корректно ли authority/admissibility отделено от cryptographic validity?
8. Достаточна ли current-law policy boundary signature classes?
9. Корректны ли expiry/revocation/revalidation semantics?
10. Достаточно ли ADR-011 для duplicates/unknown outcome?
11. Не требуется ли отдельный Signed Action concept для non-document actions уже в Stage 11A?
12. Корректно ли отложить direct signed Vote/action evidence до Stage 11B?
13. Что требует DOMAIN_MODEL/TERMINOLOGY/ADR sync после принятия?
14. Какие вопросы нужно оставить legal/profile-specific analysis?

## 45. Следующий шаг

1. провести independent multi-review Draft BP-SIGN-001;
2. adjudicate findings;
3. при подтверждении выполнить минимальную normative sync;
4. закрыть Stage 11A;
5. затем перейти к Stage 11B — remote participation and electronic voting.


---

## 6. Stage 11A stress-test — полный текст

# Stage 11A — Electronic Signing stress-test

**Статус:** Working analysis / not normative  
**Основание:** ADR-004/005/009/010/011/013 + `UKRAINE_ELECTRONIC_SIGNING_LEGAL_ANALYSIS.md`  
**Цель:** проверить, достаточно ли существующего понятия `Signing` ADR-009 и требуется ли самостоятельная identity-bearing `Signing Evidence`.

## 1. Исходная модель

ADR-009 уже определяет:

```text
Signing
= historically significant action
  over a concrete Document Revision
  or a specific Document Representation
```

Stage 11A проверяет электронный способ доказательства такого Signing.

Рабочая декомпозиция:

```text
Document / Revision
        ↓
Representation / exact electronic data
        ↓
external electronic-signature operation
        ↓
received signature/provider information
        ↓
validation + mapping
        ↓
subject / authority / target recognition
        ↓
recognized Signing
        ↓
supporting evidence + validation provenance
```

## 2. Кандидатные понятия

### 2.1. Signing

Сохраняется существующее понятие ADR-009.

Signing имеет собственную историческую identity как действие подписания конкретного target конкретным signer/acting Subject в определимом предметном контексте.

### 2.2. Electronic signature artifact / provider result

Не является Signing автоматически.

Это external/integration information либо electronic representation/evidence, которое должно пройти validation/mapping/domain recognition по ADR-011.

### 2.3. Signing Evidence

Кандидат на самостоятельную сущность проверяется stress-test.

Предварительная гипотеза:

- evidence требуется;
- stable top-level domain identity evidence **не доказана**;
- evidence может быть составным provenance конкретного Signing;
- одно Signing может иметь несколько validation observations/revalidation results;
- один внешний artifact не должен автоматически владеть предметной identity Signing.

### 2.4. Signature Validation

Проверка криптографической/доверительной информации не является Signing.

Она может быть повторена позднее и дать новое observation/assessment без создания нового Signing.

Пока нет основания вводить universal `Signature Validation` как fundamental domain entity. Для historically significant validation может потребоваться сохраняемый evidence/provenance record.

## 3. Stress-test scenarios

### S1. Один Document Revision, один КЕП

Revision R1 имеет PDF Representation P1. Subject A подписывает P1 допустимым КЕП.

После validation и mapping подпись признаётся Signing S1.

```text
R1
└─ P1 exact signed representation
   └─ external signature artifact
      └─ validated → Signing S1
```

**Вывод:** существующего Signing достаточно. Отдельная Signing Evidence identity не требуется.

### S2. Одна Revision подписана двумя субъектами

Один и тот же P1 подписывают A и B.

```text
R1/P1
├─ Signing S1 by A
└─ Signing S2 by B
```

Каждое подписание — самостоятельное historically significant action.

**Вывод:** подписи не следует моделировать одним aggregate status `signed=true`.

### S3. Signer подписывает от имени Community / Governance Body

Сертификат идентифицирует физическое лицо A.

Это не доказывает автоматически:

- что A является председателем;
- что A вправе действовать от имени Community;
- что полномочие действительно на target/action;
- что действие принадлежит Governance Body.

```text
certificate identity
≠ Subject mapping automatically
≠ Representation/Domain Power
≠ competence
```

**Вывод:** validation cryptographic identity и domain admissibility должны оставаться отдельными шагами ADR-010/011.

### S4. Сертификат валиден, но Subject не имеет полномочия

Криптографическая подпись корректна, но действующий Subject не имел достаточного Domain Power.

External signature evidence остаётся валидным техническим доказательством того, кто подписал данные, но Community OS не должно признавать это как допустимое Signing в требуемой предметной роли только из-за успешной cryptographic validation.

**Вывод:** `valid electronic signature ≠ admissible Signing`.

### S5. Сертификат неизвестного/недоверенного provider

Artifact получен, но required trust policy не выполнена.

```text
received electronic signature
→ validation failure / insufficient trust
→ no recognized Signing under this policy
```

Сам artifact может сохраняться как received information/provenance согласно ADR-011.

### S6. Повторная доставка provider callback

Один и тот же внешний signing result доставлен дважды.

Redelivery не создаёт второй Signing автоматически.

External deduplication key определяется concrete integration contract; совпадение signer/target/time не является universal identity key.

### S7. Unknown outcome внешней операции

Community OS запросил provider flow, пользователь подписал данные, но callback потерян.

Нельзя автоматически создавать Signing на основании факта запуска операции.

Retry может привести к:

- получению прежнего result;
- новому external operation;
- duplicate внешнего результата;
- unknown outcome.

**Вывод:** применяются ADR-011 unknown outcome/reconciliation semantics.

### S8. Сертификат истёк после ранее признанного Signing

Позднее текущее состояние сертификата изменилось.

Current expiry не должно молча переписывать historic Signing. Revalidation может создать новое observation/assessment и, если требуется, запустить review/correction semantics.

**Вывод:** current certificate state ≠ historical signing validity automatically.

### S9. Сертификат отозван позднее

Причина/момент revocation может иметь значение.

Community OS не должна использовать универсальное правило:

```text
certificate revoked now
→ delete/invalidate every historical Signing
```

Нужны applicable trust/legal policy и historical validation context.

**Вывод:** original Signing fact и последующее validation/review различаются.

### S10. Broken signature / изменён signed content

После подписания P1 его данные изменены или проверка integrity не проходит.

Новый/изменённый artifact не наследует Signing S1.

Если ранее Signing S1 был ошибочно recognized, исправление выполняется явно согласно ADR-004/011; original recognition не переписывается молча.

### S11. Revision R1 имеет новую Representation P2

R1 подписана через P1. Позднее создаётся P2 — например, новый PDF/rendering тех же semantic data.

```text
Signing(P1)
≠ Signing(P2) automatically
```

ADR-009 уже говорит, что изменение Representation не сохраняет автоматически применимость прежнего Signing.

**Вывод:** для electronic Signing необходимо хранить exact cryptographic target Representation/data.

### S12. Что значит «Signing Revision», если криптография подписывает Representation

Предметный intent может быть «подписать Revision R1», но электронная подпись всегда связывается с конкретными electronic data.

Поэтому для electronic Signing нужно различать:

```text
semantic target = Revision R1
cryptographic target = exact Representation/data P1
```

Document-kind/signing policy определяет, считается ли подписание P1 подписанием R1 в предметном смысле.

**Вывод:** ADR-009 менять не требуется, но BP должен сделать dual-target semantics явной.

### S13. Подписан только detached signature/container

Форматы CAdES/XAdES/PAdES/ASiC и аналогичные технические способы не должны менять предметную модель.

Независимо от формата должны быть определимы exact signed data и evidence required for verification.

**Вывод:** format = implementation/integration concern.

### S14. Re-validation через несколько лет

Для одного Signing S1 можно выполнить несколько validation операций в разные моменты.

```text
Signing S1
├─ validation V1 at t1
├─ validation V2 at t2
└─ validation V3 at t3
```

Разные validation results не создают новые Signing facts.

**Вывод:** evidence/validation имеет собственную историю, но этого пока недостаточно для fundamental `Signing Evidence` entity.

### S15. Timestamp

Signature creation time, recording time, provider time и qualified electronic timestamp — разные сведения.

Нельзя универсально считать timestamp из client/UI trustworthy signing time.

**Вывод:** trusted time evidence используется только там, где applicable policy требует/признаёт его. Universal Qualified Timestamp requirement не вводится.

### S16. Дія.Підпис

Дія.Підпис подтверждён official provider как remote КЕП.

Но:

```text
successful Дія.Підпис
≠ Domain Power
≠ automatic Subject↔Community relation
≠ Voting Right
≠ Vote
≠ Signing recognized automatically
```

После provider result сохраняются mapping/validation/domain recognition.

### S17. Электронная подпись и Vote без Document

Технически электронная подпись может быть связана с payload, представляющим волеизъявление.

Но существующее `Signing` ADR-009 принадлежит Document context.

**Вывод:** Stage 11A не должен преждевременно обобщать Document Signing в universal `Signed Action`.

Для Stage 11B следует отдельно проверить два режима:

1. legal/procedure profile требует signed electronic Document (например, electronic survey/voting sheet) → Vote и Document/Signing связаны, но остаются разными facts;
2. profile допускает electronic Vote без Document semantics → доказательство/аутентификация действия моделируется Governance/integration semantics, а не искусственным Document.

### S18. ОСББ electronic survey sheet

Подтверждённый legal scenario:

- electronic survey sheet является electronic document;
- содержит конкретные сведения/choice;
- подписывается electronic signature based on qualified certificate;
- может иметь несколько required signers;
- должен сохраняться в формате, позволяющем проверять integrity.

```text
Vote / participation fact
≠ survey sheet Document
≠ signer electronic signature
≠ recognized Signing
```

**Вывод:** Community OS должен уметь связать эти факты, не сливая их.

### S19. Пилотное СТ

Организационно-правовая форма/статут пилотного СТ пока не закреплены в Stage 11 legal profile.

**Вывод:** нельзя переносить ОСББ requirements на СТ. Universal architecture должна поддерживать разные signing/governance policies.

## 4. Проверка кандидата Signing Evidence

### Аргументы за отдельную identity

Evidence может:

- включать external artifact;
- проходить повторную validation;
- иметь несколько validation observations;
- требовать retention для legal proof.

### Аргументы против fundamental entity

Однако:

- evidence существует потому, что подтверждает конкретное действие/target;
- artifact уже может иметь identity как Representation/File/external information;
- validation result является observation/assessment, а не новым подписанием;
- разные provider representations не должны создавать несколько domain Signings;
- ADR-004/011 уже позволяют сохранять provenance/history без universal Evidence entity;
- проект сознательно не вводит universal Evidence/Assertion/Audit entity.

### Рабочий вывод

```text
Electronic Signing Evidence is required semantically
but fundamental Signing Evidence entity is NOT justified yet.
```

Для Draft BP достаточно понятия **signing evidence/provenance package** как состава подтверждающих сведений конкретного Signing и его validation history.

Если в будущем один evidence object получит самостоятельные:

- stable cross-process identity;
- независимый lifecycle;
- corrections/revocation semantics;
- sharing между несколькими domain actions;
- самостоятельное управление/retention beyond source Signings,

тогда необходимость отдельной entity можно исследовать повторно.

## 5. Рабочая модель после stress-test

```text
Document
└─ Revision
   └─ Representation / exact signed data
      ↓
external electronic signature
      ↓
received evidence
      ↓
cryptographic/trust validation
      ↓
Subject mapping
      ↓
Domain Power / Representation / policy check
      ↓
recognized Signing
      ├─ signer / acting Subject
      ├─ represented Subject/body where applicable
      ├─ semantic target Revision where applicable
      ├─ exact cryptographic target Representation/data
      ├─ applicable signing policy
      └─ evidence/provenance + validation history
```

## 6. Инварианты-кандидаты для BP

1. `Signing ≠ electronic signature artifact`.
2. `Signing ≠ authentication`.
3. `Signing ≠ electronic identification`.
4. `valid cryptographic signature ≠ sufficient Domain Power`.
5. User Account identity ≠ signer Subject automatically.
6. Provider identity ≠ Community OS Subject identity automatically.
7. Electronic Signing сохраняет exact signed electronic data/Representation context.
8. Signing one Representation does not sign another Representation automatically.
9. New Revision does not inherit prior Signing.
10. Multiple signers create distinct Signing facts.
11. Redelivery does not create new Signing automatically.
12. External unknown outcome does not create Signing automatically.
13. Current certificate expiry/revocation does not silently rewrite historic Signing.
14. Revalidation ≠ new Signing.
15. Signing correction/review does not silently delete original historical recognition.
16. Electronic signature provider/type does not create Domain Power/Voting Right.
17. `Signing ≠ Vote`.
18. Signed Vote-related Document ≠ Vote.
19. Signature format/container is not domain identity.
20. Fundamental `Signing Evidence` entity is not introduced at this stage.

## 7. Результат stress-test

Текущей фундаментальной модели ADR-009/010/011 достаточно.

Не требуется:

- новый bounded context;
- `Electronic Signing` как новый fundamental subtype;
- universal `Signing Evidence` entity;
- universal `Signature Validation` entity;
- provider-specific `Diia.Signature` domain entity;
- изменение Governance Voting model.

Требуется специализированный Draft BP, который сделает явными:

- semantic vs cryptographic target;
- recognition chain;
- signer/authority mapping;
- evidence/provenance;
- validation/revalidation;
- external failure/duplicate/unknown-outcome;
- correction/review;
- exact boundary with Governance Stage 11B.

## 8. Следующий шаг

Подготовить Draft `BP-SIGN-001 — Electronic Document Signing` на этой основе.

Stage 11B remote participation не фиксировать нормативно до принятия Stage 11A.


---

## 7. Current-law/reference analysis Украины — полный текст

# Community OS — правовой/reference-анализ электронного подписания в Украине

**Статус:** Draft reference analysis for Stage 11  
**Проверено:** 2026-09-21  
**Назначение:** правовой/reference-вход для предметно-архитектурного проектирования Stage 11. Документ не является юридическим заключением и не заменяет проверку применимого законодательства/устава конкретного Community.

## 1. Зачем нужен этот документ

Stage 11 должен сначала определить предметную семантику электронного подписания, не смешивая её с техническим провайдером подписи и не превращая КЭП/Дія.Підпис в источник предметного права.

Основные вопросы:

- что именно подписывается;
- какой Document Revision / Representation является target;
- кто является фактическим подписантом;
- от собственного или чужого имени он действует;
- какое основание/полномочие применимо;
- какой внешний результат считается evidence;
- как выполняются validation и domain recognition;
- что необходимо сохранять для последующей проверяемости;
- какие требования зависят от типа Community и конкретной процедуры.

## 2. Уже принятая предметная основа Community OS

ADR-009 уже определяет:

```text
Signing
= historically significant action
  over a concrete Document Revision
  or a specific Document Representation

Signing
≠ Approval
≠ Registration
≠ Publication
```

Подписание не требует на предметном уровне выбора КЭП, PKI, сертификата или конкретного технического формата.

ADR-010 требует различать:

```text
Subject
≠ User Account
≠ Domain Power
≠ Representation
≠ technical authorization
```

ADR-011 требует цепочку:

```text
external information / provider result
→ received information
→ validation / mapping
→ domain recognition
→ recognized Community OS fact
```

Следовательно Stage 11 не должен делать внешний объект подписи source of truth Community OS.

## 3. Нормативные источники Украины

### UA-SIGN-01 — Закон № 2155-VIII

**Название:** Закон України «Про електронну ідентифікацію та електронні довірчі послуги»  
**Источник:** https://zakon.rada.gov.ua/go/2155-19  
**Дополнительный официальный источник:** https://czo.gov.ua/article18

Актуально для Stage 11:

- электронные подписи бывают не только квалифицированными;
- квалифицированный электронный подпись (КЕП) является отдельной правовой категорией;
- квалифицированный электронный подпись имеет такую же юридическую силу, как собственноручная подпись, и пользуется презумпцией соответствия собственноручной подписи;
- проверка КЕП включает, в частности, проверку действительности квалифицированного сертификата на момент создания подписи, идентификацию подписанта по сертификату и подтверждение целостности связанных электронных данных;
- электронная подпись не теряет возможность рассматриваться как доказательство только потому, что она имеет электронный вид или не соответствует требованиям именно КЕП.

**Архитектурный сигнал:** Community OS не должен универсально сводить «электронное подписание» к одному типу подписи. Конкретный document/procedure policy должен определять минимально допустимый вид подписи согласно применимому праву.

### UA-SIGN-02 — Закон № 851-IV

**Название:** Закон України «Про електронні документи та електронний документообіг»  
**Источник:** https://zakon.rada.gov.ua/go/851-15

Актуально для Stage 11:

- электронный документ — документ, информация в котором зафиксирована как электронные данные с обязательными реквизитами;
- оригиналом электронного документа считается электронный экземпляр с обязательными реквизитами, включая применимый электронный подпись;
- юридическая сила электронного документа не может отрицаться только потому, что он имеет электронную форму;
- электронный документооборот включает создание, обработку, передачу, получение, хранение, использование и уничтожение электронных документов с проверкой целостности и, при необходимости, подтверждением получения.

**Архитектурный сигнал:** signed electronic artifact не следует редуцировать к PDF-файлу. Необходимо сохранять связь подписи с конкретными электронными данными/Representation и возможность проверки их целостности.

### UA-SIGN-03 — Дія.Підпис

**Официальные источники:**
- https://ca.diia.gov.ua/faq_diia_id
- https://ca.diia.gov.ua/contract_diia_id
- https://ca.diia.gov.ua/sign

Квалифицированный поставщик «Дія» прямо описывает Дія.Підпис как удалённый квалифицированный электронный подпись (КЕП).

**Архитектурный сигнал:**

```text
Дія.Підпис
= один из возможных technical/provider mechanisms КЕП

Дія.Підпис
≠ Domain Power
≠ Voting Right
≠ Vote
≠ Signing fact Community OS automatically
```

Это согласуется с уже зафиксированным выводом референсов МДО/DAH.

## 4. Важная терминологическая деталь: «подпись на квалифицированном сертификате» ≠ только КЕП

Законодательство различает как минимум:

- qualified electronic signature (КЕП);
- advanced electronic signature based on a qualified certificate;
- более широкую формулировку «электронний підпис, що базується на кваліфікованому сертифікаті електронного підпису».

Официальная терминология показывает, что последняя формулировка может охватывать как КЕП, так и усовершенствованный подпись, базирующийся на квалифицированном сертификате.

**Следствие для Community OS:** если конкретный закон/процедура требует «електронний підпис, що базується на кваліфікованому сертифікаті», нельзя молча заменить это архитектурным правилом «только КЕП». Точная допустимость должна принадлежать local legal/document/procedure policy.

## 5. ОСББ/многоквартирный дом: подтверждённый сценарий удалённого участия

### UA-GOV-OSBB-01 — Закон № 2866-III и изменения № 3270-IX

**Источники:**
- https://zakon.rada.gov.ua/go/2866-14
- https://zakon.rada.gov.ua/go/3270-20

На дату проверки Закон об ОСББ действует в редакции от 15.04.2026.

Актуальные правила допускают, в частности:

- дистанционное участие совладельцев в собрании с использованием технических средств электронных коммуникаций в режиме видеоконференции;
- письменный опрос в письменной и/или электронной форме;
- заполнение листка опроса с собственноручным подписью либо электронным подписью, базирующимся на квалифицированном сертификате;
- учёт голосов, поданных дистанционно;
- обязательное сохранение электронных листков опроса в формате, позволяющем проверять их целостность;
- представительство совладельца регулируется отдельно и не выводится из факта электронной подписи.

**Архитектурный вывод:**

```text
remote participation
≠ electronic signature
≠ voting right
≠ vote
```

Электронный подпись может служить evidence конкретного волеизъявления/электронного документа, но право участия, Voting Right, реализатор права и допустимость Vote определяются Governance model.

## 6. Типовой устав ОСББ

**Источник:** https://zakon.rada.gov.ua/go/z0061-24

Актуализированный типовой устав также предусматривает письменный опрос в электронной форме и подпись листков опроса электронным подписью, базирующимся на квалифицированном сертификате.

Это подтверждает, что для профиля ОСББ Stage 11 должен уметь моделировать:

```text
Governance action / Vote
↔ formalized survey/voting sheet Document where required
↔ electronic Signing evidence
```

При этом Vote и Document/Signing должны сохранять разные identities и lifecycle.

## 7. Экспериментальная цифровая система управления многоквартирными домами

**Источник:** https://zakon.rada.gov.ua/go/1336-2024-%D0%BF

Постановление КМУ № 1336 предусматривает в экспериментальной системе, среди прочего:

- получение и заполнение листков опроса;
- наложение электронного подписи;
- проведение отдельных процедур и передачу протоколов/уведомлений через систему.

Этот источник подтверждает практическую реализуемость цифрового процесса, но не должен определять внутреннюю модель Community OS.

## 8. Кооперативы и садовые товарищества: обязательный pilot scenario и legal-profile boundary

Для первого пилота СТ **дистанционное участие и дистанционное волеизъявление с электронной подписью являются принятой продуктовой потребностью**, а не отложенной опцией.

Практическая причина пилота — невозможность устойчиво собрать очное общее собрание, в том числе из-за войны, территориального перемещения собственников и нахождения части владельцев участков за границей. Community OS должна позволять такому собственнику реализовать допустимое право участия/голоса дистанционно, если применимый legal/governance profile признаёт такой способ.

При этом следует различать два утверждения.

### 8.1. Что подтверждено общим законодательством об электронной подписи

Квалифицированный электронный подпись имеет такую же юридическую силу, как собственноручная подпись. Электронный документ не теряет юридическую силу только из-за электронной формы.

Следовательно Community OS должна уметь использовать КЕП и provider mechanisms вроде Дія.Підпис как средство подписания электронного волеизъявления/документа там, где конкретная процедура допускает электронную форму.

### 8.2. Чего из этого не следует автоматически

Эквивалентность КЕП собственноручной подписи **не означает сама по себе**, что любая организационно-правовая форма автоматически получает новую процедуру общего собрания или что любое подписанное КЕП волеизъявление обязано засчитываться как присутствие/голос на общем собрании.

Необходимо отдельно определить:

- кто по применимому закону имеет право участия/голоса;
- как формируется кворум/правомочность;
- что считается участием в собрании;
- допускается ли заочное/дистанционное волеизъявление;
- как соотносятся synchronous remote participation и asynchronous signed ballot;
- какой electronic signature class достаточен;
- какое оформление/протокол/листок голосования требуется.

Это не отменяет pilot requirement. Это означает, что механизм должен быть **profile-driven**, а не жёстко скопирован из ОСББ.

### 8.3. Особое внимание, если пилотное СТ юридически является кооперативом

Закон Украины «Про кооперацію» в действующей редакции задаёт собственные правила общего собрания, включая правомочность собрания, правила принятия решений и принцип «каждый член кооператива или уполномоченный имеет один голос; это право не может быть передано другому лицу».

Поэтому до признания конкретной конфигурации пилотного СТ legally valid необходимо установить его фактическую организационно-правовую форму и сопоставить её с ранее выбранным проектным правилом:

```text
pilot project rule: 1 участок = 1 голос
possible cooperative-law rule: 1 член кооператива = 1 голос
```

Если пилотное СТ является кооперативом и эти множества не совпадают, это будет не техническая деталь, а прямой legal/domain conflict, который нужно разрешить до юридически значимого голосования.

### 8.4. Сообщённая практика «множественного членства» пилотного СТ

По уточнению участника пилота, фактическая схема СТ «ЕКСПРЕС» описывается так:

- заявление о вступлении подаётся отдельно относительно каждого участка;
- один и тот же владелец нескольких участков может подать несколько заявлений;
- внутри СТ это трактуется как несколько членств одного физического лица;
- на этой основе фактически реализуется принцип «1 участок = 1 голос».

Устав 2016 года действительно предусматривает письменное заявление и последующее утверждение решения о приёме, но **не формулирует явно** понятие нескольких одновременных членств одного физического лица.

Общий Закон «Про кооперацію» также формулирует member identity через лицо и правило «один член = один голос». Поэтому Community OS не должна автоматически превращать несколько заявлений в несколько юридически самостоятельных Membership.

Архитектурно безопасная модель до legal resolution:

```text
one Subject
+ historically recognized Membership
+ multiple application/admission/basis records
+ multiple Plot relations
+ applicable Voting Rule
→ applicable Voting Rights
```

Такой подход:

- сохраняет фактическую историю СТ;
- позволяет реализовать текущую практику «1 участок = 1 голос» через несколько Voting Rights одного Subject;
- не создаёт фиктивных Subjects/User Accounts;
- не объявляет спорную юридическую интерпретацию установленным фактом.

Подробный предметный stress-test:
`docs/architecture/STAGE-11B-PILOT-MEMBERSHIP-PLOT-VOTING-STRESS-TEST.md`.

### 8.5. Требование к Community OS

Universal architecture должна поддерживать:

```text
in-person participation
remote synchronous participation
signed asynchronous ballot / written survey where legally allowed
mixed procedure
```

и позволять legal/governance profile определить, какие из этих способов допустимы для конкретного Community и вопроса.

Таким образом, Stage 11B обязателен для первого пилота СТ, но его legal validity не выводится только из факта КЕП.
## 9. Предварительные архитектурные границы Stage 11

На основании текущей нормативной модели и подтверждённых правовых источников рабочей выглядит схема:

```text
Document / Revision / Representation
+ signer Subject
+ acting-for-self / acting-for-another semantics
+ applicable Domain Power / Representation
+ applicable signing policy
+ external signing operation/evidence
→ validation
→ domain recognition
→ Signing fact
```

При этом:

```text
authentication
≠ electronic identification
≠ external signature operation
≠ recognized Signing
≠ Domain Power

Signing
≠ Approval
≠ Registration
≠ Publication

Signing
≠ Vote
≠ Voting Right
≠ Participation Right
```

## 10. Что, вероятно, должно сохраняться для проверяемости

Это пока **архитектурный кандидат**, а не принятое решение.

Для recognized electronic Signing может потребоваться исторически определимый набор provenance:

- target Document Revision / Representation;
- exact signed electronic data/artifact identity or cryptographic digest/qualified reference;
- signer identity as established by validated evidence;
- acting Subject;
- represented Subject/body, если применимо;
- applicable Representation / Domain Power basis;
- signing method/class required by local policy;
- actual validated signature class;
- provider/trust-service context;
- certificate/signing identifier в допустимом объёме;
- signature creation time where trustworthy/available;
- validation time;
- validation result;
- certificate status/trust information relevant to the validation moment;
- evidence needed to repeat or explain validation later;
- source/integration provenance.

Конкретные cryptographic formats, libraries, certificate stores и API — не предмет этого reference analysis.

## 11. Ключевой открытый вопрос для предметной модели

Нужно решить, является ли существующего понятия ADR-009 **Signing** достаточно как identity-bearing historical action, или требуется отдельное понятие **Electronic Signature Evidence / Signing Evidence**.

Рабочая гипотеза:

- новый вид `Electronic Signing` как fundamental domain entity, вероятно, не нужен;
- `Signing` остаётся предметным действием ADR-009;
- внешний cryptographic signature/provider result является evidence/integration information;
- отдельная identity-bearing `Signing Evidence` оправдана только если у evidence есть самостоятельный lifecycle, независимые corrections/revalidation/retention и ссылки нескольких domain facts.

Этот вопрос нужно stress-test до создания нормативного BP.

## 12. Вопросы для следующего шага Stage 11

1. Что является identity `Signing` и может ли одна Revision иметь несколько Signing facts?
2. Может ли одно Signing относиться к Representation, а другое — к Revision?
3. Как определить «exact signed content», если Representation пересоздано/конвертировано?
4. Является ли validation новым domain fact или производным состоянием/evidence?
5. Что происходит при:
   - просроченном сертификате после успешного подписания;
   - отозванном сертификате;
   - неизвестном/недоверенном provider;
   - broken signature;
   - re-validation через несколько лет;
   - change in trust list;
   - external service unknown outcome;
   - повторной доставке signature result;
   - нескольких подписях одной Revision;
   - подписи представителем;
   - подписи неуполномоченным Subject;
   - подписании другой Representation той же Revision?
6. Может ли electronic Signing подтверждать Vote без создания отдельного Document?
7. Когда legal profile требует именно signed electronic document, а когда достаточно доказательства предметного action?
8. Какие requirements принадлежат universal model, а какие — Community/document/governance profile.

## 13. Предварительный вывод

Текущая архитектура ADR-009/010/011 уже содержит правильные фундаментальные границы.

На этом этапе **нет основания вводить новый bounded context или считать КЭП/Дія.Підпис отдельной предметной сущностью Community OS**.

Следующий шаг Documentation First:

```text
stress-test Signing semantics
→ решить вопрос Signing Evidence
→ Draft BP electronic signing
→ independent review
→ normative sync if needed
→ только затем remote participation / electronic voting profile
```


---

## 8. Pilot boundary — обязательный Stage 11B remote-voting requirement

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
C. подписанное асинхронное волеизъявление / ballot;
D. смешанная процедура A+B;
E. смешанная процедура A+B+C where legally allowed.
```

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


---

## 9. Pilot stress-test Membership ↔ Plot ↔ Voting Right

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


---

## 10. ADR-009 — Document / Revision / Representation / Signing

### Core document semantics and Signing

## Решение

### 1. Два самостоятельных предметных контекста

Сохраняются принятые ADR-002 контексты **«Документы и формализация»** и **«Коммуникации и обращения»**.

Контекст документов владеет предметной семантикой:

- документов и их стабильной идентичности;
- редакций документов;
- представлений документов;
- отношений между документами;
- публикаций документов;
- подписания и регистрации документов;
- документных связей с предметами других контекстов.

Контекст коммуникаций владеет предметной семантикой:

- обращений;
- уведомлений;
- новостей и объявлений;
- адресной и аудиторной направленности коммуникационных материалов;
- предметно значимых результатов коммуникации, если они предусмотрены соответствующим процессом.

Один предметный процесс может использовать понятия обоих контекстов. Например, обращение может иметь приложенный документ, уведомление может ссылаться на финансовое обязательство, а новость может сопровождаться опубликованной редакцией документа. Такие связи не объединяют контексты и не передают владение понятиями.

Настоящий ADR не вводит отдельный общий контекст документов и коммуникаций. Совместное рассмотрение двух контекстов в одном ADR не означает их технического или предметного слияния.

### 2. Документ

**Документ** — предметно распознаваемый информационный объект со стабильной идентичностью, относящийся к деятельности сообщества и признаваемый документом согласно семантике его вида и применимым правилам.

Документ может оформлять, фиксировать, представлять или подтверждать предметное содержание, факт, основание, результат либо решение, а в предусмотренных случаях сам быть основанием. Из этого не следует, что документ становится тем предметом, который он оформляет или подтверждает.

Сохраняются различия:

```text
Документ
≠ предметный факт
≠ основание
≠ источник данных
≠ подтверждающие сведения
≠ действие фиксации
```

Не вводится универсальная сущность `Document Fact`, общий предок всех предметных фактов или универсальная связь документа с абстрактным `Domain Fact`. Отношения документа с предметами других контекстов имеют локальную семантику: оформляет, подтверждает, фиксирует, представляет, служит источником, является основанием либо выражает другое предметно определённое отношение.

### 3. Идентичность документа и редакция

Документ имеет стабильную предметную идентичность, позволяющую отличить его от редакций, представлений и связанных документов.

**Редакция документа** — исторически определимое состояние содержания конкретного документа, выделенное как редакция согласно семантике вида документа и применимым правилам.

Не устанавливается универсальный критерий, когда изменение означает:

- изменение изменяемого черновика без новой редакции;
- новую редакцию того же документа;
- исправление редакции;
- новый документ, заменяющий предыдущий;
- отзыв, отмену или прекращение применимости;
- другое предметно значимое изменение.

Этот выбор определяется видом документа и применимыми правилами. При этом должны сохраняться стабильная идентичность документа, идентичность существенной редакции и предметно значимые отношения между документами или редакциями там, где они необходимы для объяснения истории.

Документы могут быть связаны, например, отношениями замены, дополнения, отмены, исправления или иной локально определённой связи. Этот открытый перечень не является универсальной иерархией типов отношений.

### 4. Черновик и исторически значимое содержание

Черновое содержание может изменяться в пределах, допускаемых видом документа и применимыми правилами. Наличие черновика не вводит обязательный универсальный статус или общий жизненный цикл всех документов.

Если редакция использована в предметно значимом действии, например подписана, утверждена, зарегистрирована, опубликована, отправлена, получена либо послужила основанием другого факта, её исторически значимое содержание не переписывается молча.

Последующее изменение должно сохранять различимость исходной редакции, характера изменения и новой редакции или нового документа в объёме, требуемом предметной семантикой. Это не требует неизменяемости любого чернового символа, универсального архива всех промежуточных состояний или event sourcing.

### 5. Документ, представление и файл

**Представление документа** — предметно различимая форма, в которой конкретная редакция документа выражена, предъявлена или подготовлена для использования.

Сохраняется инвариант:

```text
Документ ≠ Редакция документа ≠ Представление документа ≠ Файл
```

Документ может существовать без файла и иметь от нуля до нескольких представлений. Представление может быть текстовым, структурированным, визуальным, печатным или иным образом предметно определённым. Эти примеры не образуют закрытой классификации.

Представление не обязано быть файлом. Файл является возможным техническим или переносимым носителем представления и не определяет предметную идентичность документа автоматически. Один файл не объявляется универсально равным одному документу, одной редакции или одному представлению.

Отдельная обязательная универсальная сущность содержания документа не вводится. Семантическое содержание должно быть отличимо от представления там, где это необходимо, но способ его предметного структурирования определяется видом документа.

### 6. Отношения документа с другими предметами

Документ может иметь несколько предметно типизированных связей с объектами, отношениями, действиями, результатами и решениями других контекстов. Конкретный контекст сохраняет владение собственным предметом.

В частности:

- протокол может оформлять сведения о собрании, голосовании, установленном результате или решении;
- заявление может быть документом, связанным с обращением;
- документ поставщика может быть источником, подтверждением или основанием финансового процесса;
- акт или отчёт может относиться к инженерной системе, точке учёта или ресурсному процессу;
- документ может относиться к субъекту, объекту собственности, органу управления или управленческой процедуре.

Наличие связи не создаёт универсального автоматического последствия. Документ поставщика не создаёт финансовое обязательство только из-за своего существования, а протокол не создаёт и не заменяет управленческое решение без предусмотренного предметного основания.

### 7. Роли в создании и обращении документа

В отношении документа могут быть предметно значимы разные роли и действия, включая:

- инициатора;
- автора содержания;
- составителя;
- издателя;
- утверждающего;
- подписанта;
- регистратора;
- отправителя.

Эти роли не образуют обязательный универсальный набор, не обязаны присутствовать у каждого документа и не обязаны принадлежать одному субъекту.

Следует различать орган управления, субъект, должность и полномочие. Документ может относиться к действию органа. Если действие по своей предметной семантике совершается субъектом, должны быть определимы фактически действовавший субъект и, где применимо, основание его действия. Компетенция органа не заменяет полномочие субъекта действовать от имени органа или в его составе.

Автоматическое выполнение технической или предметно допустимой операции не превращает автоматизированный механизм в субъект и не подменяет требуемую предметной семантикой атрибуцию субъекта. Универсальный тип автоматизированного действующего лица не вводится.

Предметная допустимость действий и семантика прав доступа относятся к Stage B; техническая реализация и enforcement соответствующих решений относятся к Stage K. Настоящий ADR фиксирует только необходимость сохранять предметно значимую атрибуцию и основание там, где это требуется семантикой действия.

### 8. Подписание

**Подписание документа** — исторически значимое действие над конкретной редакцией документа или её определённым представлением с определимым подписантом и, где применимо, основанием действия от собственного или чужого имени.

Подписание не тождественно утверждению, регистрации или публикации:

```text
Подписание ≠ Утверждение ≠ Регистрация ≠ Публикация
```

Одну редакцию могут подписывать несколько субъектов, если это предусмотрено видом документа и применимыми правилами. Подписание одним субъектом не создаёт автоматически подписание другим субъектом или органом управления.

Новая редакция не наследует автоматически подписание предыдущей редакции. Изменение представления после подписания не сохраняет автоматически применимость прежнего подписания; последствия определяются предметной семантикой вида подписания и документа.

Если субъект подписывает от имени органа или другого субъекта, должны быть определимы действовавший субъект, представляемый субъект или орган, основание и применимость полномочия к действию в требуемом объёме. Настоящий ADR не определяет конкретную модель полномочий.

Подписание в предметном смысле не требует выбора КЭП, PKI, сертификатов, криптографии или технического формата электронной подписи.

### 9. Утверждение

**Утверждение документа** — предметно значимое признание конкретной редакции утверждённой в пределах применимой процедуры и правил, если вид документа предусматривает такое действие.

Утверждение не является обязательным для каждого документа и не создаёт универсальный статусный переход. Оно не тождественно управленческому решению: решение может служить основанием утверждения документа либо непосредственно определять его предметный эффект, но документ и решение сохраняют самостоятельность.

### 10. Регистрация и нумерация

**Регистрация документа** — допустимое исторически значимое действие признания документа или его редакции зарегистрированными в определённом предметном контексте, если это предусмотрено видом документа и применимыми правилами.

Регистрация не обязательна для каждого документа. Настоящий ADR не вводит универсальный реестр, обязательную запись реестра, общую систему серий или сквозную нумерацию Community OS.

Сохраняются различия:

```text
Идентичность документа ≠ Регистрационный номер ≠ Запись реестра
```

Регистрационный номер, входящий, исходящий или внутренний номер, дата регистрации, серия и правила уникальности являются локальными характеристиками соответствующего вида регистрации. Они не определяют идентичность документа автоматически.


### Temporal/history/provenance/rules

### 21. Временная семантика

В зависимости от вида документа или коммуникации могут быть предметно значимы разные моменты и периоды:

- создание документа;
- дата документа;
- изменение черновика;
- возникновение редакции;
- утверждение;
- подписание;
- регистрация;
- публикация и отзыв публикации;
- отправка;
- доставка;
- получение;
- прочтение или подтверждение;
- вступление в силу;
- период применимости;
- прекращение, отзыв, отмена или замена.

Не каждое понятие обязано иметь все эти характеристики. Одинаково названные моменты могут иметь разную семантику у разных видов документов и коммуникаций. Настоящий ADR не вводит универсальный набор временных отметок, обязательную bitemporal-модель или единую дату документа.

### 22. Исправления и историческая сохранность

Следует различать, где применимо:

- изменение черновика;
- новую редакцию;
- исправление ошибочного содержания;
- новый документ, заменяющий прежний;
- отзыв или отмену документа;
- отзыв публикации;
- исправление адресата или аудитории;
- повторную отправку;
- исправление ошибочного уведомления;
- изменение оценки или последствий ранее переданной информации.

Эти действия не следуют друг из друга автоматически и не образуют универсальную операцию исправления. Исправление документа не исправляет автоматически предметный факт другого контекста. Исправление предметного факта не переписывает автоматически связанный документ.

Исторически значимые редакции, публикации, подписания, регистрации, обращения и уведомления не переписываются молча. Последующие изменения сохраняют прослеживаемую связь с исходным состоянием в объёме, требуемом предметной семантикой.

Настоящий ADR не требует универсального неизменяемого архива файлов, полного сохранения всех промежуточных черновиков, event sourcing или глобального журнала событий.

### 23. Происхождение и объяснимость

Для исторически значимого документа или коммуникационного результата должны быть определимы, где применимо:

- идентичность документа и использованная редакция;
- существенное содержание;
- использованное представление;
- происхождение и источник сведений;
- предметное основание;
- инициатор и фактически действовавший субъект;
- действие от имени другого субъекта или органа;
- применимая версия правила;
- аудитория или адресат;
- подписание, утверждение, регистрация или публикация;
- связанные предметы других контекстов;
- последующие исправления, замены, отзывы и изменения последствий.

Конкретный состав определяется видом документа или коммуникации. Этот перечень не образует универсальную запись аудита, сущность происхождения или обязательный snapshot всей системы.

### 24. Конфигурация и правила

Конфигурация может определять допустимые виды документов и коммуникационных материалов, локальные классификации, доступные способы оформления, аудитории, политики публикации и другие специализации. Она не заменяет документ, редакцию, публикацию, обращение, уведомление или иной исторический факт.

Правила могут определять:

- критерий новой редакции или нового документа;
- допустимость и последствия утверждения, подписания, регистрации, публикации, исправления, замены или отзыва;
- формирование аудитории;
- применимые действия над обращением;
- предметный эффект отправки, получения или юридически значимого уведомления;
- иные локально значимые условия.

Правила и их версии соответствуют ADR-005. Не вводятся универсальный документный Rule, отдельный Document Configuration Context или единый механизм исполнения правил.


### Cross-context boundaries and invariants

## Границы предметных контекстов

### Документы и управление

Документ может оформлять, фиксировать, представлять или подтверждать управленческую процедуру, собрание, вопрос, голосование, установленный результат или управленческое решение.

Сохраняется инвариант:

```text
Документ ≠ Управленческое решение
```

Управленческое решение принадлежит контексту управления. Протокол, выписка или опубликованная редакция документа не заменяют решение и не изменяют его автоматически. Решение может быть основанием создания, утверждения или публикации документа согласно применимой процедуре.

### Документы и финансы

Документ может относиться к начислению, обязательству, платежу, задолженности, расходу или другому финансовому предмету, быть источником сведений, подтверждением либо допустимым основанием.

Сохраняются различия:

```text
Документ ≠ Начисление ≠ Финансовое обязательство ≠ Платёж
```

Документ поставщика, счёт, акт, квитанция, кассовый или банковский документ не создают и не изменяют финансовый факт автоматически. Финансовые последствия определяет финансовый контекст согласно собственным правилам.

Dynamic financial Read Model / Projection не является Document или Publication автоматически. Если требуется historically fixed official financial disclosure, используется обычная цепочка Document / Revision / Representation / Publication; при этом document context не получает ownership исходных financial facts.

Если новый financial report исправляет, заменяет или отзывает ранее опубликованный report, связь с соответствующей Revision/Publication должна быть исторически прослеживаемой в объёме, требуемом процессом.

### Документы и ресурсный учёт

Документ может относиться к ресурсу, инженерной системе, месту потребления, точке учёта, прибору, установке прибора, показанию, потреблению, контрольной сверке, расчётному небалансу или эксплуатационной потере.

Сохраняются различия:

```text
Документ ≠ Показание ≠ Потребление ≠ Расчётный небаланс ≠ Эксплуатационная потеря
```

Документ не создаёт и не изменяет ресурсный факт автоматически. Ресурсный контекст может использовать документ как источник, подтверждение или основание в пределах собственной семантики.

### Документы и коммуникации

Коммуникационный материал может иметь документную форму или ссылаться на документ, его редакцию, представление либо публикацию. Документный контекст владеет документной идентичностью и публикацией документа; коммуникационный контекст владеет обращением, уведомлением, новостью, объявлением и их предметной направленностью.

Обращение или уведомление не становится документом автоматически. Документ не становится обращением, уведомлением, новостью или объявлением только из-за использования в коммуникации.

### Коммуникации и субъекты

Контекст субъектов владеет идентичностью субъектов. Коммуникационный контекст использует субъектов как инициаторов, адресатов, получателей или иных участников предметно определённого отношения, но не присваивает их идентичность.

Пользовательская учётная запись не тождественна субъекту. Наличие учётной записи не создаёт автоматически предметную возможность инициировать, получить, прочитать или подтвердить коммуникацию.

### Коммуникации, полномочия и органы управления

Семантика полномочий и представительства принадлежит соответствующему контексту. Контекст коммуникаций определяет применимость этих отношений к конкретному обращению, уведомлению, ответу или иному действию, не создавая собственную модель полномочий.

Орган управления не тождествен субъекту. Коммуникация может быть адресована органу или исходить от него, однако фактически действовавший субъект и основание действия должны быть определимы там, где это предметно существенно.

### Публикация, аудитория и доступ

Документный контекст владеет фактом публикации документа и её предназначенной аудиторией. Аудитория характеризует предметную направленность публикации, но не является самой публикацией. Контекст коммуникаций может использовать публикацию и описывать направленность коммуникационного материала.

Предметная аудитория и публичность не определяют право доступа автоматически. Семантика прав доступа, authorization, пользовательских ролей и permissions относится к Stage B; их техническая реализация, хранение и enforcement относятся к Stage K.

Для dynamic Read Model используется собственная visibility/authorization semantics согласно ADR-013. Technical viewer scope dynamic projection не становится `Audience` автоматически. Если доступ к financial projection включает ссылку/метаданные Document, projection может раскрывать только те document metadata, которые допустимы соответствующим public/read contract и предметной доступностью документа; доступ к Revision/Representation проверяется document context независимо.

### Уведомление и доставка

Контекст коммуникаций владеет уведомлением и предметным признанием значимых результатов коммуникации. Интеграционная или инфраструктурная функция владеет техническими попытками и протоколами доставки.

Сведения о технической доставке могут быть источником для предметного признания получения или юридически значимого уведомления, но не создают такой факт автоматически.

## Архитектурные инварианты

1. Контексты «Документы и формализация» и «Коммуникации и обращения» самостоятельны и не объединяются настоящим ADR.
2. Документ имеет стабильную предметную идентичность.
3. Критерий новой редакции того же документа или нового документа определяется видом документа и применимыми правилами.
4. Документ, редакция документа, представление документа и файл не тождественны.
5. Документ может существовать без файла и иметь от нуля до нескольких представлений.
6. Универсальная сущность содержания документа не вводится.
7. Исторически значимое содержание не переписывается молча.
8. Публикация документа является отдельным исторически значимым фактом, связанным с конкретной редакцией или представлением и определимой аудиторией.
9. Опубликованность не является обязательным универсальным состоянием документа.
10. Отзыв публикации не стирает факт предыдущей публикации.
11. Публикация, аудитория, право доступа, технический доступ, доставка и фактический читатель не тождественны.
12. Универсальная сущность аудитории и закрытый перечень аудиторий не вводятся.
13. Обращение не требует пользовательской учётной записи и не имеет обязательного универсального жизненного цикла.
14. Обращение, документ, сообщение, заявка технической поддержки и управленческая процедура не тождественны.
15. Уведомление является самостоятельным предметным понятием и не тождественно отправке, доставке, получению, прочтению или юридически значимому уведомлению.
16. Общая семантика коммуникаций не создаёт универсальную сущность Communication или Message.
17. Новость и объявление не являются автоматически документами или публикациями документов.
18. Подписание, утверждение, регистрация и публикация различаются.
19. Новая редакция не наследует автоматически подписание предыдущей редакции.
20. Регистрация и нумерация не обязательны для каждого документа; универсальный реестр не вводится.
21. Входящий, исходящий и внутренний документ являются контекстными ролями или локальными классификациями, а не универсальными подтипами.
22. Вложение является контекстной ролью или отношением и не получает обязательную универсальную идентичность.
23. Документ не тождествен предмету другого контекста, который он оформляет, подтверждает, представляет или с которым связан.
24. Управленческое решение не тождественно документу.
25. Финансовое обязательство, начисление и платёж не тождественны документу.
26. Показание, потребление, расчётный небаланс и эксплуатационная потеря не тождественны документу.
27. История и происхождение принадлежат соответствующим предметным понятиям и не образуют отдельный универсальный контекст.
28. Техническая доставка не создаёт автоматически предметное получение или юридически значимое уведомление.
29. Настоящий ADR не вводит универсальный Workflow, State Machine, Event или общий агрегат документов и коммуникаций.


### Deliberately not introduced / deferred legal specializations

## Сознательно не вводимые универсальные сущности

Настоящий ADR не вводит:

- универсальный `Document Fact`;
- универсальную сущность содержания документа;
- общий предок всех предметных фактов;
- универсальную сущность коммуникации или сообщения;
- универсальную сущность вложения;
- универсальную сущность аудитории, получателя или действующего лица;
- универсальный реестр документов;
- универсальное событие документа или публикации;
- универсальный жизненный цикл, Workflow, State Machine или набор состояний;
- универсальную сущность исправления;
- глобальный контекст истории, аудита или происхождения;
- универсальную сущность доказательства, утверждения или основания.

Описательные слова «содержание», «сообщение», «аудитория», «получатель», «действие» и «событие» не означают автоматического введения одноимённых нормативных сущностей.

## Намеренно отложенные решения

### Stage B

- authentication и authorization;
- права доступа, роли пользователей, ACL и permissions;
- конкретная модель проверки полномочий;
- определение того, кто вправе создавать, подписывать, утверждать, регистрировать, публиковать, отправлять, получать, читать, исправлять или отзывать и на каком предметном основании;
- действие от имени другого субъекта или органа и применимость соответствующего полномочия.

### Stage J

- email, Telegram, SMS, push и другие каналы;
- интеграции с внешними системами документооборота;
- BAS document exchange;
- внешние идентификаторы;
- импорт, экспорт и mapping;
- протоколы и контракты доставки;
- webhook и provider API;
- форматы обмена и внешние подтверждения;
- конкретные форматы электронной подписи.

### Stage K

- базы данных, таблицы, поля, индексы и схемы;
- API, REST, GraphQL, DTO и JSON;
- файловое и объектное хранение;
- MIME-типы и бинарные форматы;
- очереди, retry, event bus и кэш;
- search engine и OCR;
- UI, frontend и backend;
- сервисы и микросервисы;
- технические журналы и audit log;
- техническая реализация, хранение и enforcement решений о доступе и authorization;
- event sourcing;
- криптография и проверка сертификатов;
- deployment;
- конкретная реализация versioning и хранения истории.

### Локальные и юридические специализации

- обязательные реквизиты документов;
- юридические виды документов и протоколов;
- критерии новой редакции или нового документа для конкретного вида;
- конкретные статусы и процессы документов или обращений;
- правила регистрации, нумерации, серий и журналов;
- сроки хранения и публикации;
- юридический эффект публикации, доставки, получения или прочтения;
- обязательные аудитории и способы уведомления;
- КЭП, Дія.Підпис, PKI, сертификаты и криптографические требования;
- бухгалтерские первичные документы;
- правила обращений граждан;
- требования конкретной страны к электронным документам, архивам и персональным данным.

Эти специализации могут определяться конфигурацией, применимыми правилами, профилем сообщества или отдельным юридическим решением, но не являются универсальными инвариантами Community OS.


---

## 11. ADR-010 — Subject / User Account / Domain Power / admissibility

### Identity, authentication, Domain Power, Representation, acting-for semantics

## Решение

### 1. Субъект и пользовательская учётная запись

**Субъект** — участник предметных отношений согласно принятой модели Community OS.

**Пользовательская учётная запись** — технически используемое средство взаимодействия субъекта с Community OS. Она не является самостоятельным носителем предметных прав.

Сохраняется инвариант:

```text
Субъект ≠ Пользовательская учётная запись
```

Один субъект может иметь несколько пользовательских учётных записей. Несколько учётных записей одного субъекта не создают дополнительных:

- прав собственности;
- членств;
- должностей;
- предметных полномочий;
- представительств;
- прав участия;
- прав голоса;
- голосов;
- иных предметных отношений или результатов.

Создание, блокировка, деактивация или прекращение учётной записи сами по себе не создают, не изменяют и не прекращают предметные отношения субъекта. Наличие субъекта не означает наличия учётной записи.

### 2. Связь пользовательской учётной записи с субъектом

Пользовательская учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет связь с этим субъектом. После такого использования она не перепривязывается другому субъекту. Для другого субъекта используется другая пользовательская учётная запись. Это сохраняет историческую атрибуцию действий, выполненных через учётную запись.

Ошибочная первоначальная связь исправляется отдельной исторически прослеживаемой корректировкой. Такая корректировка:

- сохраняет ошибочную исходную связь и факт её исправления в необходимом для объяснимости объёме;
- не переписывает молча историю;
- не меняет атрибуцию уже совершённых предметно значимых действий;
- не делает нового субъекта действующим субъектом прошлых действий;
- не требует универсальной сущности идентичности или глобальной модели исправлений.

Конкретная процедура проверки и исправления связи определяется последующими решениями и применимыми правилами.

### 3. Техническая идентичность и аутентификация

**Техническая идентичность** — квалифицированное обозначение identity, которую система устанавливает или использует при техническом взаимодействии. Из этого определения не следует универсальная предметная сущность `Identity`.

**Аутентификация** — техническое установление идентичности, используемой системой при операции.

Следует различать:

```text
Аутентификация
≠ связь учётной записи с субъектом
≠ предметное полномочие
≠ предметная допустимость
≠ техническая авторизация
≠ право доступа
≠ техническая возможность вызвать операцию
```

Успешная аутентификация сама по себе не доказывает собственность, членство, должность, полномочие, представительство, право участия, право голоса, право действовать от имени сообщества или органа управления либо допустимость конкретного действия.

Предметная идентичность субъекта, пользовательская учётная запись, внешняя заявленная идентичность, credential и техническая идентичность аутентификации не объединяются универсальной сущностью.

Настоящий ADR не выбирает способ аутентификации или управления сессиями.

### 4. Предметное полномочие и основание действия

**Предметное полномочие** (`Domain Power`) — предметно определимая допустимость субъекта действовать в некоторой области на применимом основании. Оно имеет собственную локальную семантику и не является универсальной заменой всех условий конкретного действия.

Предметное полномочие может следовать из представительства, должности, участия в органе управления, служебного отношения, назначения, решения или иного допустимого основания. Из этого не следует единая универсальная иерархия полномочий.

Конкретный предметный контекст может требовать сочетание:

- предметного полномочия;
- представительства;
- собственности;
- членства;
- должности;
- участия в органе управления;
- компетенции органа;
- права участия или права голоса;
- применимой версии правила;
- состояния предмета;
- других допустимых оснований и условий.

Наличие одного предметного полномочия не означает автоматически соблюдения остальных условий.

### 5. Представительство и другие основания

**Представительство** остаётся самостоятельным историческим отношением и одним из возможных оснований предметного полномочия действовать от имени другого субъекта.

Сохраняются различия:

```text
Представительство
≠ Предметное полномочие
≠ Должность
≠ Участие в органе управления
≠ Компетенция органа
≠ Роль доступа
≠ Право доступа
≠ Право голоса
```

Представительство не передаёт автоматически собственность, членство, должность, право участия или право голоса, не создаёт нового права голоса и не изменяет его вес.

Конфликт нескольких представительств, полномочий или действий разрешается применимыми правилами соответствующего предметного контекста. Универсальный приоритет по времени создания, сроку, виду документа или техническому порядку действий не устанавливается.

### 6. Действие от собственного и чужого имени

«Действие от имени» не является одной универсальной предметной связью.

Там, где применимо, раздельно определяются:

- фактически действующий субъект;
- субъект, от имени которого совершается действие;
- сообщество, к которому относится действие;
- орган управления, к деятельности которого относится действие;
- должность;
- участие в органе управления;
- компетенция органа;
- представительство;
- предметное полномочие;
- основание;
- область применимости;
- момент применимости.

Действие субъекта от собственного имени не требует фиктивной связи представительства самого себя.

Представительство другого субъекта не тождественно действию от имени сообщества. Действие, относимое к органу управления, не превращает орган в субъект. Универсальный `Principal`, объединяющий субъект, сообщество и орган управления, не вводится.

### 7. Сообщество и орган управления в атрибуции действия

Сообщество, орган управления и субъект сохраняют собственную идентичность и семантику.

Если действие относится к органу управления, должны различаться:

1. компетенция органа совершать действие или принимать соответствующее решение;
2. предметное полномочие конкретного субъекта действовать от имени органа или в его составе;
3. техническая авторизация использованной учётной записи.

Положительный результат одной проверки не заменяет остальные обязательные проверки.

Конкретный субъект, фактически выполнивший действие, должен быть определим там, где предметная семантика требует действия субъекта. Орган управления не становится пользовательской учётной записью или технической идентичностью.

### 8. Минимальный семантический контракт значимого действия

Stage B определяет минимальный общий семантический контракт атрибуции предметно значимых действий, но не вводит универсальную сущность `Action Context` или общий тип `Action`.

Для конкретного значимого действия должны быть исторически определимы, где применимо:

- фактически действующий субъект;
- использованная пользовательская учётная запись;
- использованная техническая идентичность;
- представляемый субъект;
- сообщество;
- орган управления;
- должность или участие в органе;
- основание;
- предметное полномочие;
- представительство;
- компетенция органа;
- область применимости;
- момент действия;
- автоматический характер выполнения;
- применимые правила и иные необходимые предметные обстоятельства.

Не все элементы обязательны для каждого действия. Конкретное действие и необходимый состав атрибуции принадлежат bounded context, владеющему его предметной семантикой.

Общий контракт не становится владельцем действий, их результатов или истории. Он не требует общей таблицы, объекта передачи данных, агрегата, события или журнала.

### 9. Предметная допустимость, техническая авторизация и доступ

**Предметная допустимость действия** — результат применения семантики контекста-владельца к конкретному действию, предмету, субъектам, основаниям, правилам и состоянию.

**Техническая авторизация** — проверка того, может ли технически идентифицированное взаимодействие выполнить конкретную операцию с учётом необходимых решений и сведений.

**Технический доступ** — технически обеспеченная возможность использовать данные или функции в пределах применимой авторизации.

Сохраняются различия:

```text
Предметная допустимость
≠ Предметное полномочие
≠ Техническая авторизация
≠ Право доступа
≠ Технический доступ
```

Community OS использует общий семантический контракт авторизации. Он может координировать:

- установленную техническую идентичность;
- связь учётной записи с субъектом;
- обязательные проверки предметного контекста;
- применимые права и роли доступа;
- предметное полномочие;
- представительство;
- отношения субъекта;
- состояние предмета;
- применимую версию правила;
- область применимости;
- другие необходимые источники решений.

Контракт авторизации не владеет предметными правилами. Предметная допустимость конкретного действия определяется bounded context, владеющим действием.

Нельзя установить универсальный порядок `role wins`, `power wins`, `access wins`, `ownership wins` или аналогичный. Роль доступа, право доступа, предметное полномочие или собственность по отдельности не являются универсальным источником разрешения.

Если обязательная предметная проверка дала отрицательный результат, техническая авторизация не разрешает выполнение только на основании технического доступа. Наличие предметного полномочия также не означает, что конкретная учётная запись технически допущена выполнить операцию.

Настоящий ADR не определяет механизм исполнения контракта авторизации.


### Temporal applicability and historical explainability

### 12. Временная применимость

Для полномочий, представительств, прав доступа, ролей доступа и связей учётных записей должна сохраняться временная семантика там, где она предметно значима.

Следует различать, где применимо:

- период действия полномочия или представительства;
- период применимости права или роли доступа;
- состояние и период активности учётной записи;
- момент аутентификации;
- момент совершения действия;
- время фиксации сведений;
- последующее прекращение полномочия или доступа;
- исправление сведений.

Не все понятия обязаны иметь одинаковые интервалы или набор временных характеристик. Настоящий ADR не вводит универсальную bitemporal-модель или обязательный набор временных отметок.

Применимость основания оценивается для момента действия согласно семантике соответствующего процесса. Позднейшее прекращение полномочия, представительства или доступа не делает автоматически недействительным исторически допустимое действие.

### 13. Историческая объяснимость

Для предметно значимого действия должен сохраняться достаточный исторический контекст, позволяющий объяснить, где применимо:

- кто фактически действовал;
- через какую учётную запись или техническую идентичность;
- от чьего имени;
- к какому сообществу или органу управления относилось действие;
- какое основание использовалось;
- какая область применимости использовалась;
- были ли полномочие и представительство применимы в момент действия;
- какие исторически значимые правила и сведения использовались;
- было ли действие автоматическим.

Прекращение, отзыв или исправление основания не переписывает молча прежнее действие. Исправление исторических сведений сохраняет различимость исходных сведений, изменения и его основания в объёме, необходимом для объяснимости.

Универсальный обязательный `Authorization Decision` не вводится. Если контекст-владелец или применимое правило считает результат авторизации исторически значимым, он может фиксироваться отдельно в локальной семантике.

Это не создаёт глобальный журнал авторизации, общий Audit Context, обязательный Audit Event, универсальный снимок всех правил или event sourcing.


### Document/Governance boundaries and invariants

## Границы предметных контекстов

### Управление и органы управления

Контекст управления владеет органами управления, компетенцией, управленческими процедурами, голосованиями, управленческими расчётами, установленными результатами и решениями.

Stage B не присваивает эту семантику. Для действия органа различаются компетенция органа, полномочие конкретного субъекта действовать от имени органа или в его составе и техническая авторизация учётной записи.

### Голосование

Право голоса и реализатор права принадлежат семантике управления и голосования. Пользовательская учётная запись, роль или право доступа не создают право голоса.

Представительство не создаёт дополнительное право голоса и не изменяет его вес. Контракт авторизации не назначает реализатора самостоятельно и не изменяет инвариант «одно право голоса — не более одного одновременно действующего голоса».

### Документы и формализация

Контекст документов владеет документом, редакцией, представлением, подписанием, утверждением, регистрацией и публикацией.

Право выполнить подписание не означает права утвердить, зарегистрировать или опубликовать документ. Stage B предоставляет общую семантику субъекта, полномочия, роли и права доступа, не присваивая документные действия.

### Финансы

Финансовый контекст владеет обязательствами, начислениями, платежами, распределениями, исправлениями, пересчётами и другими финансовыми действиями.

Stage B не определяет, кто предметно вправе признать конкретный платёж, создать или изменить обязательство либо исправить финансовые сведения. Финансовый контекст может использовать субъект, полномочие, область применимости и результат технической авторизации согласно собственной семантике.

### Ресурсный и инженерный учёт

Ресурсный контекст определяет предметные условия сообщения и признания показания, корректировки, контрольной сверки, установления эксплуатационной потери, пересчёта и других ресурсных действий.

Stage B предоставляет общую семантику субъекта, полномочия, области применимости и технической авторизации, но не присваивает эти решения.

### Коммуникации и обращения

Обращение может существовать без аутентифицированной пользовательской учётной записи. Уведомление может формироваться автоматически.

Техническая доставка не доказывает идентичность отправителя, не создаёт предметное полномочие и не означает автоматически получение, прочтение или юридически значимое уведомление.

### Конфигурация и правила

Конфигурация может влиять на применимую политику доступа, но не является правом доступа или предметным полномочием.

Правило не является результатом авторизации. Если версия правила существенна для исторически значимой проверки или действия, фактически использованная версия должна быть исторически определима согласно ADR-005.

## Архитектурные инварианты

1. Субъект и пользовательская учётная запись не тождественны.
2. Пользовательская учётная запись не владеет предметными правами.
3. Несколько учётных записей одного субъекта не создают дополнительных предметных прав.
4. Создание, блокировка или прекращение учётной записи не изменяют предметные отношения субъекта автоматически.
5. Учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет эту связь и не перепривязывается другому субъекту.
6. Корректировка ошибочной связи учётной записи не меняет атрибуцию прошлых действий.
7. Аутентификация, связь Account—Subject, предметное полномочие, предметная допустимость, техническая авторизация, право доступа и техническая возможность выполнить операцию различаются.
8. Предметное полномочие, роль доступа и право доступа не тождественны.
9. Роль доступа группирует права доступа и не создаёт предметные отношения.
10. Представительство является самостоятельным историческим отношением и не тождественно полномочию.
11. Представительство, должность, участие в органе, компетенция, роль доступа, право доступа и право голоса различаются.
12. Орган управления, сообщество и субъект не объединяются универсальным Principal.
13. Компетенция органа и полномочие конкретного субъекта являются разными проверками.
14. Общий семантический контракт атрибуции не создаёт универсальную сущность Action Context или Action.
15. Конкретное действие и его предметная допустимость принадлежат контексту-владельцу.
16. Обязательный отрицательный результат предметной проверки не преодолевается одним техническим доступом.
17. Предметное полномочие не создаёт технический доступ автоматически.
18. Универсальный приоритет роли, полномочия, доступа, собственности или другого основания не устанавливается.
19. Области применимости определяются локальными предметными контекстами и не образуют закрытый универсальный перечень.
20. Роль доступа, право доступа, должность и полномочие не считаются глобальными между сообществами автоматически.
21. Последующее прекращение полномочия, представительства или доступа не отменяет автоматически исторически допустимое действие.
22. Универсальный обязательный результат авторизации не вводится.
23. Автоматизированный механизм не является субъектом.
24. Не каждое автоматическое действие требует действующего субъекта.
25. Автоматизация не заменяет атрибуцию субъекта там, где она требуется предметной семантикой.
26. Субъект может существовать и действовать без пользовательской учётной записи, если это допускает соответствующий процесс.
27. Техническая доставка не доказывает идентичность и не создаёт предметное полномочие.
28. История и происхождение принадлежат соответствующим предметным понятиям и не образуют глобальный Audit Context.


---

## 12. ADR-011 — external evidence, recognition, duplicate and unknown outcome

### 3. Полученная внешняя информация

Сохраняется различие:

```text
Внешняя информация
≠ Полученная внешняя информация
≠ Признанный предметный факт
```

Общая семантическая последовательность имеет вид:

```text
Внешнее представление
→ полученная внешняя информация
→ validation / mapping
→ domain recognition или rejection
→ предметные последствия
```

Получение не означает признание. Domain recognition принадлежит bounded context, владеющему соответствующей предметной семантикой.

Если rejected или unrecognized information исторически значима, сохраняются достаточные сведения о её содержании, происхождении и результате обработки. Из этого не следуют универсальные `Integration Receipt`, `Imported Fact`, `External Fact`, `Message` или `Event`.

### 4. Mapping, validation и domain recognition

**Mapping** обозначает интерпретацию или сопоставление внешнего представления с интеграционными и предметными понятиями конкретного процесса. Это не обязательная универсальная сущность.

Validation внешнего представления, validation интеграционного смысла и предметная допустимость признания могут различаться.

Mapping не создаёт предметный факт автоматически. Предметный контекст определяет:

- достаточно ли сведений для recognition;
- какой предметный факт, отношение или результат может возникнуть;
- требуется ли действующий субъект или предметное основание;
- какие последствия имеет rejection;
- какие дальнейшие действия допустимы.

Признанный предметный факт сохраняет идентичность и историю своего контекста и не становится импортированной универсальной сущностью.

### 5. Provenance и историческая объяснимость

Для исторически значимого интеграционного действия или результата должны быть определимы, где применимо:

- внешняя сторона или источник;
- внешний идентификатор;
- исходное внешнее время, если известно;
- момент получения;
- полученное значение или представление;
- применимая версия semantic contract;
- применимая версия mapping;
- результат validation и recognition;
- связь с correction, cancellation или replacement;
- автоматический характер обработки;
- фактически действующий субъект и основание, если предметная операция требует субъекта.

Не все сведения обязательны для любой интеграции. Перечень не образует универсальную запись, Integration Event, bitemporal model или History/Audit Context.

Предметная объяснимость не требует сохранения старых runtime, adapter binaries или технического окружения.

### 6. Duplicate и redelivery

Повторное получение внешних сведений не должно автоматически создавать новый предметный факт. Одновременно совпадение значений само по себе не доказывает duplicate.

Сохраняются различия:

```text
Redelivery
≠ Duplicate
≠ External correction
≠ Replacement
≠ New information
```

Критерии идентичности и deduplication определяются конкретным integration semantic contract и соответствующим предметным процессом. Они могут учитывать внешний идентификатор, версию, sequence, время, содержание и другие значимые признаки.

Настоящий ADR не определяет idempotency key, hash, database constraint или inbox implementation.

### 7. Corrections и re-recognition

Сохраняются различия:

```text
Redelivery
≠ External correction
≠ Cancellation
≠ Replacement
≠ Re-import
≠ Re-recognition
```

Если внешняя информация уже привела к признанному предметному факту, последующее исправление внешнего источника не переписывает этот факт молча.

Исходная внешняя информация и её provenance сохраняются, если они исторически значимы. Контекст-владелец решает, требуется ли correction, recalculation, cancellation, replacement, новый предметный факт либо отсутствие предметного изменения.

Повторное recognition старых данных с новой версией mapping должно быть отличимо от первоначального recognition. Универсальный `Correction Event` не вводится.

### 8. Виды импорта и синхронизации

Различаются:

```text
Migration import
≠ Manual bulk import
≠ Regular synchronization
≠ Operational integration
```

Первоначальная миграция является архитектурно значимым сценарием Community OS. Она может включать объекты собственности, субъектов, отношения собственности и пользования, лицевые счета, исторические платежи, показания, приборы, связи с точками учёта и другие исторически значимые данные.

Строка входного файла не является предметным фактом. CSV и XLS являются входными представлениями или форматами, а не предметной моделью.

Импорт должен допускать на семантическом уровне:

- identification;
- validation;
- mapping;
- preview или dry-run, если это требуется процессом;
- recognition;
- отдельный результат элемента;
- partial success;
- provenance;
- correction;
- безопасный повторный запуск или re-import.

Эти возможности не образуют универсальный Import Workflow.

### 9. Batch import и partial success

Массовый импорт может иметь составной результат с независимыми результатами отдельных элементов.

Atomicity определяется конкретным процессом: один импорт может допускать partial success, другой — требовать all-or-nothing.

Повторная обработка исправленных элементов не должна автоматически создавать duplicates для уже успешно признанных элементов. Для каждого значимого результата должна быть объяснима связь с соответствующим входным элементом и попыткой обработки.

Настоящий ADR не определяет транзакции базы данных, UI предварительного просмотра, парсер или техническую структуру batch.

### 10. Export

Не каждый export является исторически значимым. Его значимость определяется предметным контекстом, integration semantic contract и требованиями конкретного процесса.

Сохраняются различия:

```text
Export
≠ Publication
≠ Delivery
≠ Document
≠ Document Representation, если это прямо не установлено предметной семантикой
```

Export может быть эфемерной проекцией, исторически значимой передачей, представлением или внешним взаимодействием, требующим acknowledgement.

Универсальный `Export Document` не вводится.

### 11. Delivery

Stage J определяет минимальный semantic contract доставки без обязательных универсальных сущностей доставки.

Где применимо, могут быть определимы:

- попытка доставки;
- предназначенный канал или endpoint;
- передаваемый предмет или представление;
- внешний delivery identifier;
- время попытки;
- acknowledgement provider;
- известный результат;
- неизвестный результат.

Сохраняется различие:

```text
Notification created
≠ Sent
≠ Provider accepted
≠ Delivered
≠ Received
≠ Read
≠ Legally notified
```

Повторная попытка доставки не создаёт автоматически новое уведомление. `Delivery Attempt`, `Delivery Outcome`, Delivery Workflow и Delivery State Machine не являются обязательными универсальными сущностями.

Retry workers, очереди и техническое исполнение доставки относятся к Stage K.

### 12. Integration semantic contract

Сохраняется различие:

```text
Domain contract
≠ Integration semantic contract
≠ External protocol/API contract
≠ Transport/schema
```

Общий architectural semantic contract задаёт границы, но не требует универсальной сущности `Integration Contract`.

Конкретный contract принадлежит конкретной интеграции и может определять, где применимо:

- смысл обмениваемой информации;
- внешнюю сторону;
- семантику идентификаторов;
- mapping;
- validation и recognition;
- duplicate, redelivery и correction semantics;
- acknowledgement и ожидаемый outcome;
- provenance;
- authoritative side и ownership;
- reconciliation semantics.

### 13. Версии contract и mapping

Версия semantic contract или mapping должна быть исторически определима, если её изменение могло изменить validation, recognition, interpretation или предметный результат.

При этом:

```text
API version ≠ Semantic mapping version
Schema version ≠ автоматически предметно значимая версия
Mapping ≠ автоматически универсальное Rule
```

Если mapping имеет семантику правила, применяются требования ADR-005 в соответствующем локальном контексте. Техническое хранение версий относится к Stage K.

### 14. Failure, rejection и unknown outcome

Там, где это применимо, различаются:

```text
Not attempted
≠ Failed
≠ Rejected
≠ Unknown
≠ Confirmed
```

Это семантические различия, а не обязательные состояния универсальной Integration State Machine.

`Unknown outcome` не является failure. Если после внешнего запроса неизвестно, выполнила ли внешняя сторона действие:

- результат остаётся unknown;
- повтор не считается автоматически новой предметной операцией;
- повтор может создать внешний duplicate;
- последующая reconciliation должна установить фактический результат, когда это возможно.

Недоступность внешней системы не изменяет молча уже признанные предметные факты. Timeout, retry strategy, circuit breaker и техническое хранение состояния относятся к Stage K.

### 15. Reconciliation

Reconciliation в Stage J обозначает context-specific сопоставление известных состояний и сведений для установления результата внешнего взаимодействия или разрешения расхождения.

Она не является универсальным workflow, state machine или предметной сущностью. Конкретный контекст определяет сравниваемые сведения, допустимые источники, правила признания и последствия.

### 16. Authority и source of truth

Глобальная иерархия источников истины не вводится.

Сохраняются различия:

```text
Источник информации
≠ Подтверждающие сведения
≠ Authoritative source для конкретной информации
≠ Основание recognition
≠ Владелец предметного факта
≠ Производный результат
```

Authority определяется предметным контекстом, видом информации, конкретным integration semantic contract и применимыми правилами.

Например:

- банк может быть authoritative относительно собственного сообщения о банковской операции, но это сообщение не является автоматически банковской транзакцией Community OS, Payment или Allocation;
- BAS может быть authoritative относительно собственного бухгалтерского документа, но не Financial Obligation Community OS;
- источник телеметрии сообщает сведения об измерении, но ресурсный контекст признаёт Reading;
- IdP аутентифицирует техническую идентичность, но не создаёт Subject, ownership или Domain Power;
- Community OS может быть authoritative для начисления, экспортируемого в BAS.

Эти примеры не образуют закрытый перечень или жёстко заданную универсальную иерархию.

### 17. Двусторонняя синхронизация и конфликты

Более новое значение не получает приоритет только потому, что оно новее. Универсальный last-write-wins запрещён.

При расхождении должны быть определимы, где применимо:

- какие сведения сравниваются;
- относятся ли они к одному предметному понятию;
- authoritative side;
- исходное время источника;
- время получения;
- применённые версии mapping;
- является ли различие correction, delay, conflict или допустимым расхождением представлений;
- кто или какое правило разрешает расхождение;
- что сохраняется исторически.

Разрешение принадлежит соответствующему предметному контексту или конкретной интеграции. Универсальная сущность `Conflict` не вводится.

### 18. Integration security boundary

Внешняя сторона и техническая идентичность взаимодействия должны быть определимы там, где это существенно.

Сохраняются различия:

```text
Authentication внешнего источника
≠ Достоверность содержания
≠ Domain recognition
≠ Subject
≠ Domain Power
≠ Domain admissibility
```

Интеграция или внешняя система не является субъектом. Импортированные сведения не создают предметное полномочие. Автоматизация не заменяет атрибуцию конкретного субъекта, если предметная операция требует такого субъекта.

Trust и authority внешнего источника действуют только в context-specific scope. Technical access и credentials не подменяют предметную допустимость.

Настоящий ADR не выбирает OAuth, OIDC, SAML, API keys, certificates, MFA, secret storage или network security implementation.

### 19. Временная семантика

Где это значимо, различаются:


---

## 13. ADR-004 — history, no silent rewrite, temporal semantics and attribution

## Решение

### 1. Владение предметной историей и сквозная ответственность

Предметный аудит Community OS не моделируется как единая универсальная сущность или централизованный журнал предметных изменений.

Исторические факты, действия и результаты принадлежат предметным контекстам, владеющим их смыслом. Сквозная ответственность истории, предметного аудита и происхождения устанавливает следующий минимальный принцип:

> Предметно значимое действие или результат должны иметь объяснимое происхождение в объёме, необходимом для их предметной семантики.

Конкретный состав атрибуции, происхождения и истории определяет соответствующий предметный контекст.

Сквозные требования не означают:

- универсальную Audit Record;
- единый History или Audit Context;
- единый централизованный журнал;
- обязательный одинаковый набор атрибутов для всех действий;
- отдельного владельца всех исторических фактов.

«Предметный аудит» в настоящем ADR обозначает свойство объяснимости предметно значимых действий и результатов, а не самостоятельную сущность предметной модели.

### 2. Требуемая историческая гарантия

Для каждого исторически значимого вида предметной информации соответствующий предметный контекст определяет необходимую историческую гарантию:

1. возможность установить состояние на момент времени;
2. возможность проследить значимые изменения;
3. обе возможности.

Различаются вопросы:

```text
Какое состояние существовало на момент T?
≠
Какие значимые изменения привели к этому состоянию?
```

Наличие одной гарантии не означает автоматически наличия или достаточности другой. Не вводится универсальное требование сохранять полную последовательность изменений всех предметных данных.

Например, право собственности, членство и полномочие могут требовать исторического состояния и значимых изменений отношений. Расчётный результат может требовать объяснения входных данных, правила и расчёта. Конкретная гарантия определяется семантикой вида информации, а не единым механизмом её технической реализации.

### 3. Изменения, исправления и запрет silent rewrite

Исторически значимое прошлое Community OS не должно изменяться молча.

Если ранее зафиксированный предметный факт, состояние, отношение, действие или результат исправляется, отменяется, признаётся недействительным, переоценивается либо изменяются его последствия, должна сохраняться прослеживаемость исходного исторически значимого состояния и последующего изменения в объёме, требуемом предметной семантикой.

Следует различать, когда применимо:

- обычное изменение состояния;
- исправление ошибочных сведений;
- позднюю фиксацию сведений о прошлом;
- изменение оценки сведений;
- корректировку;
- перерасчёт;
- пересмотр результата;
- изменение последствий решения.

Это не закрытый универсальный перечень типов операций и не единый жизненный цикл всех предметных данных. Конкретная процедура принадлежит предметному контексту.

Специальная «Корректирующая операция» ADR-001 для снимка прав и голосования не становится универсальным механизмом исправления данных Community OS. Более строгие гарантии неизменяемости исходного снимка сохраняются специальными правилами модели голосования.

### 4. Предметная объяснимость и воспроизводимость

#### Explainability

Community OS должна обеспечивать предметную объяснимость исторически значимых результатов. Должно быть возможно определить, на основании каких исторически значимых фактов, сведений, правил, значений, действий и иных существенных оснований был получен результат — в объёме, требуемом его предметной семантикой.

Этот перечень не образует обязательного набора характеристик каждого действия или результата.

#### Domain reproducibility

Если предметный результат является расчётным или иным образом предметно проверяемым, архитектура должна позволять предметно воспроизвести или независимо проверить его на основании исторически определённых входных данных, применимых правил, использованных значений и иных существенных оснований.

Предметная воспроизводимость не требуется для любого факта только потому, что он исторический. Например, право собственности не требуется «пересчитывать», однако его историческое состояние и основания должны быть объяснимы в требуемом предметной семантикой объёме.

#### Technical reproducibility

Предметная воспроизводимость не требует сохранения или повторного исполнения исторической версии программного кода, базы данных, операционной системы, инфраструктуры или другого технического окружения. Способ технического достижения предметной воспроизводимости определяется позднее.

### 5. Конфликтующие сведения

Community OS допускает существование конфликтующих предметно значимых сведений. Конфликт не обязан устраняться перезаписью или удалением ранее зафиксированных сведений.

Конкретная модель конфликтующих сведений и разрешения конфликтов принадлежит соответствующему предметному контексту. Сквозно различаются:

1. наличие сведения;
2. признание его применимым или достоверным;
3. использование сведения в конкретном предметном действии или результате.

Эти понятия не тождественны. Если выбор между конфликтующими либо по-разному оценёнными сведениями существенен для действия или результата, должно быть возможно определить, какие сведения фактически использовались и, когда этого требует предметная семантика, на каком основании они были признаны применимыми.

Последующее изменение оценки сведений не переписывает молча историю ранее совершённых действий, которые на них основывались.

Настоящий ADR не вводит универсальные Assertion, Evidence или Conflict Resolution entity.

### 6. Временная семантика

Когда это применимо к предметной семантике, различаются:

- время предметной применимости / effective time;
- время фиксации / recording time;
- момент предметного события;
- момент состояния;
- момент формирования.

Не каждое понятие обязано иметь все эти времена. Настоящий ADR не вводит обязательную универсальную bitemporal-модель.

Для исторических отношений сохраняется принятый принцип периода действия `[start, end)`, где он уже применим. Он не распространяется автоматически на любые факты, действия, результаты и настройки.

Технический timestamp записи в базе данных не является автоматически recording time в предметном смысле.

### 7. Атрибуция предметно значимых действий

Атрибуция является условной: для конкретного действия могут быть предметно значимы, в зависимости от его семантики:

- что произошло и к какому предметному контексту относится действие;
- время;
- фактически действующий субъект;
- субъект, от имени которого совершено действие;
- пользовательская идентичность;
- полномочие;
- основание;
- источник данных;
- действие фиксации;
- применимая версия правила;
- использованные значения;
- автоматический характер действия.

Не каждое действие обязано иметь все перечисленные характеристики. Настоящий ADR не создаёт универсальные Action, Audit DTO или entity.

### 8. Автоматические действия

Система, сервис, фоновый процесс, интеграционный работник и иной технический механизм не становятся субъектами предметной модели только потому, что выполнили автоматическое действие.

Автоматическое предметно значимое действие может не иметь человеческого действующего субъекта. Если это существенно для предметной семантики, должно сохраняться достаточное происхождение результата: инициирующее предметное действие, применимое правило, использованные значения, применимая конфигурация, источник, время и автоматический характер действия.

Техническая service identity не становится предметным субъектом автоматически.

### 9. Внешние источники и происхождение

Сохраняется различие:

```text
внешний источник
≠ основание предметного факта
≠ действие фиксации
≠ действующий субъект
```

Например, банк как источник сведений о платеже не является автоматически основанием финансового обязательства. Импорт банковской операции не тождествен ручному сопоставлению платежа с обязательством.

Источники, основания, документы, подтверждающие сведения и действия фиксации сохраняют самостоятельную предметную семантику. Происхождение не становится отдельным владельцем предметных фактов.

### 10. Граница с техническим аудитом

Предметная история и предметный аудит отличаются от технического логирования. HTTP request, SQL UPDATE, stack trace, database timestamp, browser User-Agent, IP address и инфраструктурная метрика сами по себе не являются предметной историей.

Такие данные могут быть полезны для эксплуатации, диагностики, безопасности и расследований, но их наличие не заменяет предметную историю или происхождение и не делает технический журнал источником предметной истины автоматически.

Некоторые процессы имеют и предметную историю, и технический след. Например, импорт банковской операции или автоматическое начисление. Их предметный смысл и воспроизводимость определяются настоящим ADR; способ технического логирования остаётся за его пределами.

### 11. Удаление и прекращение предметной силы

Настоящий ADR различает, но не устанавливает процедуры для:

- удаления черновика до возникновения предметной значимости;
- отмены, аннулирования или признания исторически значимой информации недействительной;
- исключения информации из текущего представления;
- физического удаления;
- обезличивания;
- ограничения доступа.

Правовые основания, приватность, сроки хранения, обязательное физическое удаление и способы обезличивания не определяются этим ADR.


### Invariants

## Инварианты

1. Исторические предметные факты, действия и результаты принадлежат контекстам, владеющим их смыслом.
2. Сквозная ответственность истории, предметного аудита и происхождения не является отдельным владельцем всех исторических данных.
3. Предметно значимое действие или результат имеет объяснимое происхождение в объёме, требуемом его предметной семантикой.
4. Для исторически значимого вида информации определяется требуемая гарантия состояния на момент, значимых изменений либо обеих гарантий.
5. Исторически значимое прошлое не переписывается молча; значимые изменения, исправления, переоценки и изменения последствий остаются прослеживаемыми в требуемом предметной семантикой объёме.
6. Специальная корректирующая операция модели голосования не является универсальным механизмом исправления.
7. Расчётный или иной предметно проверяемый результат допускает предметную воспроизводимость в необходимом объёме.
8. Предметная воспроизводимость не требует сохранения старого исполняемого кода или технического окружения.
9. Наличие сведения, признание его применимости и использование в действии или результате различаются.
10. Последующая оценка сведения не переписывает молча историю ранее совершённого действия.
11. Временные измерения применяются, когда этого требует предметная семантика, и не образуют обязательную универсальную bitemporal-модель.
12. Автоматический механизм не становится субъектом предметной модели автоматически.
13. Внешний источник, предметное основание, действие фиксации и действующий субъект не тождественны.
14. Технический журнал не является автоматически источником предметной истины.

## Следствия

Для этапа D этот ADR требует определять, какие версии правил, входы и использованные значения нужны для объяснения и проверки результатов.

Для этапов F и G он требует отдельно определить историческую гарантию финансовых и ресурсных фактов, расчётов, корректировок, источников и временной применимости.

Для этапа H он дополняет, но не пересматривает ADR-001: процесс управления должен использовать принятые гарантии снимка, голосов, расчётов, установления и пересмотра результата.

Для всех последующих областей решение запрещает заменять предметную историю техническими журналами и навязывать единый механизм исправлений или хранения.


---

## 14. ADR-005 — rules, versions and historically reproducible application

## Решение

### 1. Общая семантика и классификация правил

Community OS использует подход «общий семантический контракт и локальные виды правил».

**Правило** — формализованный набор условий, определяющий применимое предметное поведение, результат или порядок выполнения определённого процесса. Общий архитектурный минимум относится к идентичности, версиям, применимости, историческому контексту и воспроизводимости применения. Содержание, типы и владение правилами остаются локальными для соответствующих предметных контекстов.

Универсальный объект Rule, единый Rule Context и централизованный владелец всех правил не вводятся.

Допускается открытая классификация правил по характеру поведения, включая:

- вычисление;
- допуск;
- ограничение;
- выбор;
- определение веса;
- агрегацию;
- распределение;
- процедурный порядок;
- иные предметно необходимые виды.

Эта классификация не является закрытой универсальной иерархией или обязательным перечислением. Одно предметное правило может сочетать несколько видов поведения, если это следует из его семантики.

Сохраняется различие:

```text
правило
≠ конфигурация
≠ предметный факт
≠ программный код
```

Конфигурация может определять допустимость или применимость правила. Правило определяет предметное поведение. Предметный факт является входом, основанием, действием или результатом соответствующего процесса. Программный код может реализовывать правило, но не является самим предметным правилом автоматически.

### 2. Идентичность, владение и жизненный цикл

Правило имеет устойчивую предметную идентичность, объединяющую его редакции во времени. В предметных процессах используются конкретные версии правила.

Правило и его версии принадлежат предметному контексту, владеющему их предметным смыслом, применимостью и локальными инвариантами. Сквозная ответственность правил устанавливает общие гарантии, но не становится централизованным владельцем.

До публикации или иного предметного принятия допускается изменяемая редакция — черновик. После публикации или иного предметного принятия версия становится неизменяемой. Изменение её содержания создаёт новую версию того же правила, а не изменяет существующую версию.

Минимально различаются:

- черновик;
- принятая или опубликованная версия.

Прекращённая, заменённая и другие предметно значимые характеристики версии могут использоваться соответствующим контекстом, но не образуют обязательный универсальный жизненный цикл всех правил.

Прекращение применимости или замена версии не изменяет её историческое содержание и не устраняет её роль в объяснении прошлых действий и результатов.

### 3. Применимость и временной выбор версии

Применимая версия определяется предметно установленной политикой соответствующего вида процесса или операции. Единого универсального алгоритма выбора версии для всей Community OS не вводится.

Политика может предусматривать:

- явную фиксацию версии;
- выбор по времени применимости;
- выбор по расчётному периоду;
- выбор по состоянию исходных данных;
- выбор по моменту начала процедуры;
- выбор по специально установленному моменту фиксации;
- другие предметно значимые основания.

Момент определения применимости задаётся семантикой конкретного процесса. Нельзя автоматически считать применимой текущую, последнюю или наиболее новую версию.

Если выбор версии влияет на исторически значимое действие или результат, фактически использованная версия должна быть зафиксирована либо однозначно определима из сохранённого исторического контекста.

Если процесс заранее зафиксировал версию, появление новой версии само по себе не меняет правило уже начатого процесса, если предметная семантика явно не предусматривает иного.

Конфигурация сообщества может участвовать в выборе правила или версии, но не является обязательным универсальным механизмом выбора. Текущая конфигурация не заменяет исторически определённую применимость.

### 4. Конфликты, приоритеты и композиция

Глобальная иерархия приоритетов правил не вводится. Если потенциально применимы несколько правил, ситуация разрешается согласно предметной семантике соответствующего контекста.

Локальная политика может определять:

- взаимную исключительность;
- приоритет;
- совместное применение;
- порядок применения;
- выбор по дополнительным предметным условиям.

Наличие нескольких потенциально применимых правил само по себе не означает конфликт. Конфликт существует, когда совместное применение несовместимо либо не позволяет однозначно определить требуемое предметное поведение.

При композиции порядок должен быть предметно определён, если его изменение способно изменить результат. Случайный или скрытый технический порядок исполнения не должен определять предметный результат.

Если выбор, приоритет или порядок влияет на исторически значимый результат, должны быть определимы фактически использованные версии, существенный порядок и предметные основания выбора в необходимом для объяснимости и воспроизводимости объёме.

Межконтекстная зависимость или композиция должна быть явно определена предметной архитектурой процесса. Конкретные схемы приоритетов и композиции остаются ответственностью соответствующих предметных областей.

### 5. Исторический контекст применения правила

Для исторически значимого применения правила должен сохраняться либо быть однозначно восстанавливаем контекст, достаточный для объяснения результата и, когда требуется предметной семантикой, его независимой проверки или воспроизведения.

Контекст может включать:

- фактически использованную версию или версии;
- существенные входные данные;
- фактически использованные значения;
- существенные основания выбора и применимости;
- существенные промежуточные показатели или результаты.

Конкретный состав определяется семантикой вида правила и процесса. Универсального обязательного набора полей для всех правил не вводится. Не требуется полный снимок всех доступных данных, конфигурации и состояния Community OS.

Ссылка только на версию правила недостаточна, если результат зависел также от изменяемых входов, настроек, оснований или других использованных значений. Сохранение только результата также недостаточно там, где требуется объяснимость или воспроизводимость.

Следует различать доступное, эффективное и фактически использованное значение. Для исторического объяснения существенно фактически использованное значение. Оно не тождественно текущему настроенному или эффективному значению.

Не требуется дублировать сведения, уже надёжно сохранённые как исторически определимые предметные факты в контексте-владельце. Допустима однозначная историческая ссылка, если она не превращается в ссылку на изменяемое текущее состояние.

Настоящий ADR не определяет технический способ хранения исторического контекста.

### 6. Изменение, ретроспективная применимость и последствия

Новая версия правила сама по себе не изменяет ранее выполненные действия, результаты и фактически использованные версии.

Ретроспективная применимость допускается, если это разрешено предметной семантикой соответствующего контекста. Следует различать:

- ретроспективную применимость;
- признание отношения версии к прошлому периоду;
- повторный расчёт;
- исправление;
- пересмотр результата;
- изменение последствий ранее совершённого действия.

Это не одна универсальная операция, и эти действия не следуют друг из друга автоматически. Ретроспективная применимость не означает автоматического перерасчёта или замены исторического результата.

Если прошлый результат требуется пересчитать, исправить, пересмотреть или изменить его последствия, это оформляется отдельным предметно значимым и прослеживаемым действием соответствующего контекста.

При этом в объёме, требуемом предметной семантикой, должны оставаться определимыми:

- первоначально использованная версия;
- первоначальный результат и существенный исторический контекст;
- основание последующего действия;
- версия и значения последующего действия;
- новый результат или изменение последствий.

Поздняя фиксация правила или сведений о нём сама по себе не означает, что исторический процесс фактически использовал это правило.

Универсальная Correction, Recalculation или подобная операция для всей Community OS не вводится. Специальные корректирующие операции и процедуры соответствующих контекстов сохраняют собственную предметную семантику.

### 7. Предметная воспроизводимость и граница реализации

Воспроизводимость применения правила означает возможность на основании сохранённого исторического контекста объяснить и, когда этого требует предметная семантика, независимо проверить получение исторического результата.

Для расчётных и иных детерминированно проверяемых результатов должны быть определимы:

- предметная логика использованной версии;
- существенные входы;
- фактически использованные значения и основания;
- существенные этапы вычисления или преобразования, если без них результат невозможно независимо проверить;
- результат.

Воспроизводимость не означает обязательный повторный запуск той же программной реализации. Исторический результат может проверяться другой реализацией или иным предметно корректным способом при сохранении эквивалентной предметной семантики.

Для недетерминированных по природе предметных решений может требоваться не повторное получение идентичного решения, а достаточная объяснимость: какие правила, основания, сведения и значения использовались и какое предметно значимое действие было совершено.

Требования к воспроизводимости зависят от характера правила и результата. Не требуется сохранять старую версию приложения, бинарные файлы, фреймворк, библиотеки, операционную систему, контейнер, виртуальную машину, физическое состояние СУБД или иное техническое окружение, если они сами не являются предметно значимыми данными.

Настоящий ADR определяет предметную гарантию, а не технический механизм её обеспечения. Если будущая техническая реализация не обеспечивает принятую гарантию объяснимости или воспроизводимости, должна корректироваться реализация, а не молча ослабляться предметная архитектура.


### Invariants

## Архитектурные инварианты

1. Общий семантический контракт правил не создаёт универсальный объект Rule, единый Rule Context или централизованного владельца всех правил.
2. Содержание, типы, применимость и локальные инварианты правила принадлежат контексту, владеющему его предметным смыслом.
3. Правило, конфигурация, предметный факт и программный код не тождественны.
4. Правило имеет устойчивую предметную идентичность; предметный процесс использует конкретную версию правила.
5. Принятая или опубликованная версия неизменяема. Изменение содержания создаёт новую версию.
6. Прекращение применимости или замена версии не изменяет её историческое содержание.
7. Текущая, последняя или наиболее новая версия не считается применимой автоматически.
8. Фактически использованная версия исторически значимого процесса фиксируется либо однозначно определяется из сохранённого контекста.
9. Глобальная иерархия приоритетов правил не вводится; конфликты и композиция разрешаются предметной политикой соответствующего контекста.
10. Скрытый технический порядок исполнения не определяет предметный результат.
11. Исторически значимое применение сохраняет достаточный контекст версии, существенных входов, использованных значений и оснований.
12. Универсальный полный снимок Community OS и универсальный набор полей применения правила не требуются.
13. Новая или ретроспективно применимая версия не переписывает прошлое и не вызывает автоматический перерасчёт.
14. Перерасчёт, исправление, пересмотр и изменение последствий являются отдельными предметно значимыми действиями там, где они предусмотрены.
15. Предметная воспроизводимость не требует повторного исполнения исторической программной реализации или сохранения технического окружения.

## Последствия

Положительные последствия:

- разные предметные области получают общий архитектурный минимум без потери локальной семантики;
- изменение правил не переписывает прошлые действия и результаты;
- применимость и выбор версии становятся предметно объяснимыми;
- композиция и приоритет не зависят от случайного технического порядка;
- исторические результаты могут быть независимо проверены в требуемом предметной семантикой объёме;
- будущая техническая реализация остаётся заменяемой и подчиняется предметным гарантиям.

Издержки и ограничения:

- каждый контекст должен явно определить свои виды правил, политику применимости и существенный исторический контекст;
- процессы с несколькими правилами требуют явной политики выбора, приоритета или композиции;
- для воспроизводимости недостаточно хранить только текущую версию правила либо только итоговый результат;
- изменения с последствиями для прошлого требуют отдельных прослеживаемых предметных действий;
- достаточность исторического контекста должна определяться для каждого вида процесса, а не единым универсальным набором данных.


---

## 15. ADR-001 — Voting Rights and pilot profile

### Core concepts, relations and invariants

## Основные понятия предметной модели

### Субъект

**Субъект** — физическое лицо, юридическое лицо или иной поддерживаемый в будущем носитель прав, обязанностей и полномочий.

Ядро не предполагает, что субъект обязательно является собственником, членом сообщества, пользователем, плательщиком или должником. Это разные контексты и отношения, настраиваемые для сообщества.

### Пользователь системы

**Пользователь системы** — учётная запись, посредством которой субъект взаимодействует с Community OS.

Один субъект может иметь несколько пользователей системы. Несколько пользователей одного субъекта не создают дополнительных прав участия, прав голоса или голосов. Пользователь получает разрешения на действия в системе, но не обладает правом голоса непосредственно.

### Объект

**Объект** — сущность предметной области, к которой могут относиться права, учёт, доступ или правила. В контексте настоящего ADR специальным случаем является объект собственности.

### Объект собственности

**Объект собственности** — единица собственности в сообществе: участок, квартира, гараж, машино-место, дом или иной объект. Пользование является отношением субъекта к объекту, а право собственности и право пользования — разными отношениями.

### Право собственности

**Право собственности** — самостоятельное историческое отношение между субъектом и объектом собственности.

Оно содержит как минимум субъект, объект, долю, начало и окончание действия, основание возникновения и документ-основание, если он применим.

Право собственности не является правом голоса. Оно может быть одним из оснований формирования права участия, права голоса, веса или назначения реализатора — только если это предусмотрено правилом.

### Право участия

**Право участия** — право субъекта участвовать в определённом контексте участия в объёме, определённом применимыми правилами. Уровень контекста определяется этими правилами и может относиться к сообществу, собранию, иной процедуре, конкретному вопросу либо другому применимому контексту. Универсальный обязательный уровень не устанавливается.

Оно не означает автоматически права присутствовать, участвовать в обсуждении, получать материалы, участвовать в процедуре или голосовать. Эти возможности не объединяются принудительно в одну универсальную сущность: при необходимости они задаются отдельными правилами и правами доступа. Универсальный реализатор права участия не вводится.

### Право голоса

**Право голоса** — самостоятельное право выразить позицию по конкретному вопросу конкретного голосования с определённым весом.

Право голоса фиксирует как минимум основания, вес, связь с вопросом и голосованием, назначенного реализатора при его наличии и состояние возможности реализации.

### Реализатор права голоса

**Реализатор права голоса** — субъект, который фактически реализует конкретное право голоса.

Право голоса и реализатор — разные понятия. Одно право голоса имеет не более одного фактического реализатора. Один субъект может быть реализатором неограниченного числа различных прав, если это допускают правила и подтверждающие отношения.

### Представительство

**Представительство** — самостоятельное историческое отношение, позволяющее одному субъекту действовать от имени другого в определённом контексте.

Оно может содержать предоставляющего полномочие, представителя, область, объект, право, тип действия, начало и окончание действия, основание, документ и отзыв.

Представительство не передаёт право голоса, не создаёт новое право и не изменяет его вес. Оно может подтверждать допустимость реализации права другим субъектом.

### Правило голосования и версия правила

**Правило голосования** — настраиваемое описание условий формирования прав голоса и параметров конкретного голосования: оснований, реализаторов, весов, вариантов ответа, правил учёта голосов, кворума, расчёта, установления результата и других условий голосования. Связь права участия и права голоса определяется применимыми правилами конкретной процедуры.

**Версия правила** — неизменяемая редакция правила. Изменение правила создаёт новую версию и не меняет ранее использованные версии.

### Основание права голоса и использованное значение

**Основание права голоса** — факт или отношение, на котором применимое правило основывает возникновение права голоса, назначение реализатора, вес либо иной параметр.

**Использованное значение** — конкретное значение основания или результата условия, зафиксированное при формировании снимка: площадь, доля, статус, дата действия отношения или иной необходимый параметр. Основание и использованное значение не являются одним понятием.

### Снимок прав

**Снимок прав** — неизменяемый набор результатов применения версии правила к конкретному голосованию. Он содержит контекст, достаточный для независимой проверки, но не обязан копировать весь реестр.

### Голос

**Голос** — факт выражения позиции по конкретному праву голоса. Набор вариантов ответа определяет конкретное голосование; «за», «против» и «воздержался» не являются обязательным универсальным набором.

## Связи между сущностями

```text
Субъект ──< Право собственности >── Объект собственности
   │
   ├──< Пользователь системы
   │
   └──< Представительство >── Субъект

Сообщество
  ├──< Правило голосования ──< Версия правила
  └──< Собрание ──< Вопрос ──< 0..N Голосований по вопросу
                                       ├── каждое использует одну версию правила
                                       └── каждое имеет один снимок прав
                                             ├──< Права участия
                                             └──< Права голоса
                                                   ├── 1..N оснований
                                                   ├── 1..N использованных значений
                                                   ├── 0..1 реализатор
                                                   └── 0..N записей истории голоса
```

- Собрание может содержать несколько вопросов.
- Вопрос может не требовать голосования либо иметь одно или несколько связанных голосований.
- Каждое голосование имеет самостоятельную предметную идентичность и использует одну применимую версию правила.
- Одна версия правила может использоваться несколькими голосованиями.
- У каждого голосования после формирования существует один исходный снимок прав.
- Каждое право голоса относится к одному вопросу, одному голосованию и одному снимку.
- Основания и использованные значения фиксируются в снимке как контекст конкретного права, участия или расчёта веса.
- Представительство может быть привязано к субъекту, объекту, конкретному праву, типу действий или конкретному голосованию.
- Повторное голосование является новым голосованием, исторически связанным с предыдущим, и не переписывает его.

## Правила и инварианты

1. Субъект, пользователь системы, право собственности, право участия, право голоса, реализатор, представительство и голос — разные понятия предметной модели.
2. Субъект не получает автоматически право участия или право голоса из-за учётной записи, собственности, членства, доступа к объекту, статуса плательщика или должника.
3. Пользователь системы не имеет связи вида «пользователь имеет право голосовать». Он может технически совершить действие только от имени правомерно назначенного реализатора и при наличии нужного доступа.
4. Право собственности не определяет автоматически количество, вес или порядок реализации голосов.
5. Несколько собственников одного объекта сами по себе не создают несколько прав голоса и не создают представительство между совладельцами.
6. Одно право голоса имеет не более одного фактического реализатора; один субъект может быть реализатором нескольких прав.
7. Отсутствие реализатора не уничтожает право голоса автоматически. Его состояние и влияние на процедуру определяет правило.
8. Право участия не влечёт автоматически право голоса. Наличие права голоса означает возможность реализации только при соблюдении условий применимого правила.
9. Голос не существует без права голоса. По одному праву не может существовать несколько одновременно действующих голосов.
10. «Воздержался» означает сознательно выбранный вариант ответа, если такой вариант предусмотрен. «Не участвовал» означает, что действительный голос не подан. Эти состояния не заменяются одним значением.
11. Право с весом `0` допустимо в ядре и не тождественно отсутствию права. Допустимость подачи голоса и влияние такого права определяет правило.
12. Ядро допускает целые и дробные веса. Тип, точность, диапазон, округление и суммирование определяются правилом и должны быть детерминированными.
13. Ядро не устанавливает универсальное ограничение суммы весов. Нормализация, если предусмотрена, отличается от округления и определяется правилом.
14. Правило и его версия не изменяются задним числом для уже использованного голосования.
15. Исходный снимок неизменяем. Изменения текущих реестров после его создания не изменяют его содержимое незаметно.
16. Наличие задолженности само по себе не отменяет право участия, право голоса и не меняет вес. Такое влияние допускается только как явное условие правила.
17. Действительность поданного голоса определяется правилом. Изменение базового права или реестра не удаляет автоматически исторический факт подачи голоса.
18. Все сущности конкретного голосования, его вопроса, версии правила и снимка принадлежат одному сообществу.

## Универсальная модель

Универсальное ядро предусматривает субъектов, пользователей системы, объекты, исторические права собственности, представительства, правила и версии правил, права участия, права голоса, основания, использованные значения, снимки, голоса, историю голосов и корректирующие операции.

Ядро допускает, но не навязывает:

- право на объект, на субъект, на членство, на площадь, на долю или на смешанное основание;
- один или несколько оснований права;
- вес `0`, целый или дробный вес;
- отсутствие реализатора;
- несколько прав, реализуемых одним субъектом;
- разные варианты ответов;
- разные моменты формирования снимка;
- разное влияние нереализованных прав на кворум и результат.


### Community configuration and first-deployment profile

## Конфигурация конкретного сообщества

Конфигурация сообщества определяет допустимые типы субъектов и отношений, доступные основания участия и голоса, формулу и арифметику веса, правила назначения реализатора, требования к представительству, влияние задолженности и иных условий, правила кворума, подсчёта и публикации результата.

Конфигурация не меняет универсальные различия сущностей. Она лишь задаёт допустимые способы их применения для данного сообщества.

## Профиль первого внедрения — СНТ

Первоначальная конфигурация:

```text
Тип сообщества: СНТ

Основание права голоса: объект собственности
Объект: земельный участок
Правило: 1 участок = 1 голос
Совладельцы: одно право голоса на участок
Реализатор: по умолчанию один назначенный собственник/совладелец; иной субъект — согласно правилам представительства
Представительство: допускается согласно правилам
Задолженность: не ограничивает право голоса
Варианты ответа: могут включать ЗА / ПРОТИВ / ВОЗДЕРЖАЛСЯ
```

Если участок имеет нескольких собственников, создаётся одно право голоса участка с весом `1`. Несколько собственников не создают несколько голосов. Один из собственников может быть назначен реализатором общего права.

Такое назначение не является представительством:

```text
Участок №15
├── Иван — собственник 50%
└── Пётр — собственник 50%

Право голоса участка = 1
Реализатор = Иван
```

Иван в этом случае не является представителем Петра. Представительство возникает только при самостоятельном отношении предоставления полномочий одним субъектом другому.

## Правила конкретного голосования

Каждое конкретное голосование по вопросу использует одну версию правила. Разные голосования одного или разных вопросов могут использовать разные версии:

```text
Собрание №10
├── Вопрос 1
│   ├── Голосование 1 → Правило v3
│   └── Повторное голосование → Правило v5
├── Вопрос 2 → без голосования
└── Вопрос 3
    └── Голосование 1 → Правило v3
```

Версия правила определяет момент формирования снимка, допустимые основания, условия формирования прав голоса, расчёт и арифметику веса, возможность реализации права, влияние задолженности, нереализованных прав и выбранных ответов на кворум и результат. Связь права участия и права голоса определяется применимыми правилами конкретной процедуры.

Количество прав голоса определяется применимой версией правила конкретного голосования, а не субъектом автоматически. Например, в СНТ один субъект, владеющий участками №10, №20 и №30, получает три разных права при правиле «1 участок = 1 голос». В другом сообществе правило может быть «1 член = 1 право» или «вес = площадь».

## Представительство

Представительство ограничено областью полномочий и периодом действия. Его область может распространяться на субъекта, объект, конкретное право, тип действий либо конкретное голосование.

Оно служит основанием проверить допустимость назначения и действия реализатора, но не передаёт само право. Следовательно:

```text
Совладелец назначен реализатором общего права голоса
≠
Субъект предоставил другому субъекту представительство
```

Отзыв представительства прекращает его действие для будущих назначений и будущих снимков. Влияние отзыва на уже сформированный снимок и поданный голос определяется правилами пересмотра и оформляется явно.


### Snapshot / Vote history / corrections

## Формирование и фиксация снимка прав

1. Для голосования выбирается версия правила.
2. В определённый ею момент система выявляет применимые основания и условия.
3. В снимке фиксируются применимые права участия; формируются права голоса, фиксируются их вес, реализатор и состояние возможности реализации.
4. Фиксируются необходимые использованные значения, результаты расчётов, ограничения и иной контекст, достаточный для независимой проверки.
5. Формируется исходный снимок прав.
6. Кворум и результат используют снимок, а не актуальное состояние реестров.

Версия правила конкретного голосования определяет допустимый порядок формирования снимка. В снимке фиксируются момент состояния — момент, на который определяется предметное состояние данных и отношений, — и момент формирования — момент, когда снимок был сформирован; эти моменты могут различаться. Изменение собственности, пользовательских учётных записей, представительств, задолженности или иных текущих данных после снимка, а также позднее появление сведений о прошлом не изменяют исходный снимок автоматически.

Первоначальный реализатор не заменяется непосредственно в снимке. При необходимости применяется отдельная управляемая операция; допустимость и момент замены определяются правилом. Исходное назначение сохраняется.

## Голос и история изменения голоса

Голос содержит выбранный для конкретного голосования вариант ответа и относится к одному праву голоса. Варианты ответа не фиксированы универсально.

Возможность изменить голос определяет правило. При разрешённом изменении история сохраняется, а правило определяет, считается ли для подсчёта последнее действующее значение.

Система может поддерживать групповую операцию подачи одинакового ответа по нескольким правам голоса. Такая операция не объединяет права и приводит к фиксации отдельного голоса по каждому праву:

```text
участок №10 → отдельный голос
участок №20 → отдельный голос
участок №30 → отдельный голос
```

Групповое действие не создаёт нового вида права голоса.

Универсальный пример разделения доступа и голоса:

```text
Участок №15
├── Собственник Иван
│      └── пользователь системы
└── Арендатор Пётр
       └── пользователь системы
```

Оба пользователя могут, в пределах настроенных прав доступа, вводить показания счётчика, видеть начисления, баланс и платежи, а также оплачивать задолженность. Но при правиле «1 участок = 1 голос» создаётся право голоса, основанием которого является участок; его реализует только назначенный реализатор: собственник либо лицо, правомерно допущенное правилами и представительством.

```text
Арендатор:
показания ✓
баланс ✓
оплата ✓
голосование ✗
```

Это не исключение для СНТ, а пример независимости доступа пользователя и права голоса в универсальной модели.

## Корректирующие операции

Исходный снимок неизменяем. При обнаружении ошибки не допускается тихое редактирование:

```text
Snapshot #17
      ↓
корректирующая операция
      ↓
результат применения корректирующей операции
```

Исходный снимок остаётся неизменяемым. Корректирующая операция хранит ссылку на него, причину, инициатора, дату и время, ошибочные данные, корректные данные и результат применения операции.

Изменение права собственности после снимка не меняет существующий снимок автоматически. Если правило допускает пересмотр, он выполняется явной управляемой процедурой. Аналогично определяется пересмотр при изменении реализатора, представительства или уже поданного голоса.


---

## 16. ADR-008 — Governance procedures and channel-independent Vote semantics

### Meeting/procedure/question/participation/quorum/Vote/rule

## Решение

### 1. Управленческая процедура

**Управленческая процедура** — минимальная общая предметная рамка, связывающая существенные для определённого управленческого процесса факты и действия.

Она может координировать, где применимо:

- инициирование и подготовку;
- рассмотрение;
- собрания или иные способы проведения;
- вопросы и их редакции;
- голосования;
- расчёты и установление результатов;
- решения;
- исправления и пересмотр.

Управленческая процедура не является универсальным `Workflow`, обязательной `State Machine`, универсальным событием управления или техническим процессом оркестрации. Она не обязана иметь одинаковый набор стадий и не становится суперсущностью, владеющей всеми управленческими фактами. Разные виды процедур могут иметь различную предметную структуру.

### 2. Орган управления и компетенция

**Орган управления** — предметно определённый орган сообщества, способный выполнять управленческие функции в пределах своей компетенции.

В конкретном сообществе возможны общее собрание, правление, председатель, ревизионная или временная комиссия и другие локальные специализации. Закрытый универсальный перечень органов и обязательная классификация на коллегиальные и единоличные органы не вводятся.

Где это существенно, исторически определимы:

- идентичность органа и принадлежность сообществу;
- компетенция;
- состав;
- период существования или действия;
- применимые правила формирования и деятельности.

Компетенция определяет предметную область, в которой орган вправе действовать. Она не является полномочием конкретного субъекта действовать от имени органа или в его составе.

Орган управления не тождествен субъекту, пользователю системы, должности или полномочию. Участие субъекта в составе органа и действие субъекта от его имени являются самостоятельными исторически значимыми отношениями или фактами. Если локальная модель признаёт должность единоличным органом, это должно быть предметно определено и не следует автоматически из занятия должности конкретным человеком.

### 3. Собрания и способы проведения

**Собрание** — возможная часть управленческой процедуры, в рамках которой происходит совместное рассмотрение вопросов и, если применимо, голосование или принятие решений.

Собрание не тождественно всей управленческой процедуре. Процедура может:

- включать одно собрание;
- включать несколько мероприятий или периодов проведения;
- иметь перерыв, перенос или продолжение;
- использовать очную, заочную, электронную или смешанную форму;
- не иметь физического собрания.

Мероприятия и периоды проведения должны быть предметно различимы там, где их различие влияет на участие, сроки, применимые правила, результаты или решения. Универсальная техническая модель сессий не вводится.

### 4. Вопросы и их исторический состав

**Вопрос** — самостоятельный предмет рассмотрения там, где управленческая процедура выделяет вопросы. Вопрос не является обязательным универсальным узлом любой процедуры и не тождествен голосованию, расчёту, установленному результату или решению.

Для процедуры, в которой выделяются вопросы, должен быть исторически определим их состав. Где это существенно, также определимы:

- порядок рассмотрения;
- формулировка и её редакция;
- включение и исключение;
- снятие;
- разделение или объединение;
- период или момент применимости редакции.

Исторически значимая формулировка вопроса или состав вопросов не переписываются молча. Изменение фиксируется в соответствии с предметной семантикой процедуры.

### 5. Повестка

**Повестка** может быть самостоятельным предметным представлением состава и порядка вопросов там, где она предусмотрена конкретной процедурой. Обязательная универсальная сущность повестки не вводится.

Отсутствие самостоятельной повестки не отменяет требования сохранять исторически определимый состав и существенные редакции вопросов.

### 6. Вопрос и голосования

Сохраняется модель ADR-001:

```text
Вопрос → 0..N голосований
```

Вопрос может не требовать голосования, иметь одно голосование либо несколько связанных голосований. Каждое голосование имеет самостоятельную предметную идентичность и собственный контекст, включающий, где применимо:

- применимую версию правила;
- исходный снимок прав;
- права голоса;
- голоса;
- расчёты;
- действия установления результата;
- установленные результаты.

Повторное голосование является новым голосованием, а не новой версией или изменением предыдущего. Оно может использовать другую версию правила и имеет собственный исходный снимок прав. Предыдущее голосование не переписывается; сохраняется предметно значимая связь с ним и с причиной повторения.

### 7. Возможности участия

Предметно различаются возможности:

- присутствовать;
- участвовать в обсуждении;
- вносить предложение;
- голосовать;
- подписывать;
- устанавливать или подтверждать результат;
- совершать иные допустимые действия.

Эти возможности не объединяются автоматически в универсальный пакет прав. Универсальные сущности участия или участника процедуры не вводятся. Самостоятельное предметное право требуется только там, где оно необходимо соответствующему процессу. Право голоса сохраняется как специализированное самостоятельное понятие ADR-001.

Допустимость конкретного действия может следовать из правила, полномочия, состава органа, представительства или другого предметного основания. Предметная допустимость действия не тождественна технической авторизации или доступу пользователя.

### 8. Кворум

**Кворум** — предусмотренное применимым правилом условие достаточности состава или участия для определённой области процедуры.

У кворума нет универсального уровня, формулы или знаменателя. Применимая версия правила определяет:

- требуется ли кворум;
- к какой области он относится;
- какие исторические данные используются;
- каким способом рассчитываются значимые показатели и определяется наличие или отсутствие кворума;
- требуется ли отдельное предметное установление наличия или отсутствия кворума.

Расчёт показателей кворума и установленный вывод о его наличии или отсутствии различаются там, где процедура предусматривает отдельное установление. Применимое правило также может позволять определить наличие или отсутствие кворума непосредственно, без отдельного акта установления.

Кворум может относиться к процедуре, собранию, вопросу, конкретному голосованию или другой предусмотренной правилом области. Он также может не требоваться. Нельзя универсально считать его по субъектам, объектам, числу прав, весам, присутствующим или проголосовавшим.

Исходный снимок прав конкретного голосования не является автоматически источником любого кворума. Для кворума процедуры, собрания или вопроса используется исторически определимый набор данных, предусмотренный соответствующим правилом. Универсальная структура результата кворума не вводится.

### 9. Временная семантика голосования

Для конкретного голосования исторически определимы, где применимо:

- момент или период, когда подача голосов допустима;
- окончание допустимости подачи;
- время подачи голоса;
- изменения или отзыв голоса;
- значение голоса, действовавшее в соответствующий момент;
- голоса, использованные конкретным расчётом.

Это требование не вводит универсальную последовательность состояний голосования. Специализированная процедура может предусматривать дополнительные фазы.

Бумажный, очный, электронный или иной допустимый канал подачи не меняет предметную природу голоса и не образует самостоятельный универсальный вид голоса.

### 10. Голос и позиция

**Голос** выражает допустимую по применимой версии правила позицию реализатора конкретного права голоса.

Позиция может выражать один или несколько выборов, выбор одного или нескольких кандидатов, ранжирование либо другой предметно определённый способ ответа. Универсальный тип голосования и универсальная техническая структура позиции не вводятся. Допустимость позиции определяется применимой версией правила.

«Воздержался» является позицией только тогда, когда такой вариант предусмотрен применимым правилом. Неучастие означает отсутствие действительного голоса. Воздержание и неучастие не тождественны.

### 11. Версия правила и снимок прав

Каждое конкретное голосование использует одну применимую версию правила. Одна версия может использоваться несколькими голосованиями. Разные голосования одного вопроса могут использовать разные версии.

Каждое голосование после формирования имеет один исходный снимок прав согласно ADR-001. Снимок фиксирует исторически определимый состав прав, их основания, использованные значения, веса и другие предусмотренные правилом параметры. Он не переписывается молча.

Представительство не помещается автоматически в снимок как неизменяемая принадлежность права для всех процедур. Оно остаётся самостоятельным историческим отношением. Его применимость к конкретному действию определяется для соответствующего момента и правила, если процедура не требует иной предметной фиксации.

### 12. Расчёт и установление результата

**Расчёт результата** — исторически определимое применение соответствующей версии правила к предусмотренным ею данным. Расчёт должен позволять определить использованные права, веса, голоса, существенные исключения и иные входы, необходимые для объяснимости результата.

Расчётный результат не становится установленным автоматически. **Установление результата** — отдельное предметно значимое действие, которым результат признаётся для соответствующей процедуры на определимом расчётном и ином допустимом основании.

Один расчёт может не привести к установленному результату. Основание установления может включать один или несколько расчётов и другие предусмотренные процедурой факты. Расчёт и установленный результат не тождественны.


### Decision, representation, correction, history

### 13. Управленческое решение

**Управленческое решение** — самостоятельный предметный факт определённого управленческого содержания, относимый к компетентному органу и возникший на допустимом для соответствующей процедуры основании.

Решение не тождественно расчёту, установленному результату или документу. Установленный результат может не привести к решению.

Решение может возникнуть:

1. отдельным предметным действием компетентного органа;
2. как заранее предусмотренное предметное следствие установленного результата согласно применимому правилу.

Во втором случае установленный результат не становится решением. Решение остаётся отдельным фактом, а основание его возникновения должно быть предметно определимо. Дополнительный ручной акт не требуется, если применимое правило уже устанавливает непосредственное возникновение решения из установленного результата.

### 14. Решение без голосования

Управленческое решение по своей природе не требует голосования. Оно может возникнуть вследствие голосования общего собрания или коллегиального органа, быть принято единолично компетентным органом либо возникнуть другим предметно допустимым способом.

Для решения исторически определимы, где применимо:

- компетентный орган;
- субъект, фактически действовавший от имени органа или в его составе;
- основание и компетенция;
- связанная процедура;
- содержание;
- момент принятия и применимость;
- связь с голосованием и установленным результатом;
- связь с документом, если решение документировалось.

Решение приписывается компетентному органу. Физическое или юридическое лицо, действующее как председатель, член органа или иной исполнитель, не тождественно органу. Должность может считаться единоличным органом только как явно определённая локальная специализация.

Не каждое управленческое действие является решением. Решение, поручение, уведомление, согласование, назначение и фиксация факта не объединяются автоматически в универсальную сущность управленческого действия.

### 15. Временная семантика решения

Для решения различаются там, где это предметно значимо:

- принятие;
- вступление в силу и начало действия;
- период действия;
- приостановление;
- прекращение;
- отмена;
- замена;
- другие существенные временные характеристики.

Не каждое решение обязано иметь все перечисленные характеристики. Универсальный обязательный набор временных отметок и одна универсальная дата решения не вводятся. Отмена или замена решения не стирает исторический факт его существования и действия.

### 16. Представительство и конфликт действий

Для действия представителя исторически определимы, где применимо:

- действовавший субъект;
- реализуемое право;
- основание представительства;
- использованное полномочие;
- область и период полномочия;
- применимость полномочия к конкретному действию.

Универсальный приоритет представителей не вводится. Конфликт нескольких полномочий или действий разрешается применимыми правилами конкретной процедуры.

Несколько представителей не создают несколько прав или несколько одновременно действующих голосов. Сохраняется инвариант ADR-001: одно право голоса имеет не более одного одновременно действующего голоса в конкретном голосовании. Не предполагается автоматически, что более позднее действие всегда приоритетно, второй голос всегда заменяет первый либо всегда является недействительным.

Отзыв или изменение представительства после исторически допустимого голоса не стирает этот голос автоматически.

### 17. Исправление, пересчёт и пересмотр

Исправление исходного факта, корректировка снимка, новый расчёт, пересмотр или повторное установление кворума, пересчёт результата, пересмотр установленного результата, изменение или отмена решения и повторное голосование являются специализированными действиями соответствующих уровней. Они не образуют универсальную операцию исправления.

Изменение более раннего факта не переписывает автоматически последующие результаты. Не каждый возможный последующий шаг обязателен. Исходные и последующие состояния и результаты сохраняются исторически различимыми.

**Пересмотр** обозначает минимальную общую предметную семантику связи причины, пересматриваемого предмета, последующих специализированных действий и результата пересмотра, если он возник. Из этой семантики не следует обязательная самостоятельная сущность пересмотра. Пересмотр не является универсальным процессом исполнения, событием или глобальной моделью истории. Он может завершиться без изменения установленного результата или решения.

### 18. Повторное голосование

Повторное голосование является новым самостоятельным голосованием. Для него определяются собственные применимая версия правила, исходный снимок прав, права, голоса, расчёты и установленные результаты.

Оно сохраняет историческую связь с предыдущим голосованием и причиной повторения там, где это существенно. Создание повторного голосования не изменяет и не отменяет автоматически прежнее голосование, его результат или принятое решение.

### 19. Историчность и воспроизводимость

Для исторически значимых управленческих результатов должен сохраняться достаточный предметный контекст для объяснимости и, когда применимо, воспроизводимости. В зависимости от процесса могут быть определимы:

- процедура и применимый способ проведения;
- вопрос и его редакция;
- конкретное голосование;
- версия правила;
- исходный снимок прав;
- использованные права, веса и голоса;
- расчёт;
- действие и основание установления результата;
- установленный результат;
- компетентный орган и действовавший субъект;
- основание возникновения решения;
- последующие исправления, расчёты и пересмотры.

Этот перечень не является универсальным обязательным набором полей. Не требуются полный снимок всей системы, хранение старой программной среды, обязательный event sourcing, глобальный контекст истории или аудита либо универсальная bitemporal-модель.


### Context boundaries and invariants

## Границы предметных контекстов

### Управление и коллективные процедуры

Контекст управления владеет семантикой управленческих процедур, вопросов, голосований, специализированных управленческих расчётов и установления результатов, а также управленческих решений в пределах своей предметной ответственности.

### Субъекты и объекты

Контекст субъектов владеет идентичностью субъектов. Контекст объектов владеет объектами и отношениями с ними. Субъект, пользователь, объект собственности, отношение собственности и право голоса остаются разными понятиями. Управление использует соответствующие факты как основания, но не присваивает их.

### Полномочия и представительство

Семантика полномочий и представительства принадлежит соответствующему контексту. Управленческая процедура определяет применимость этих отношений к конкретному действию, не превращая компетенцию органа в полномочие субъекта.

### Правила и конфигурация

Правила и их версии соответствуют общему контракту ADR-005 и специализируются владельцем предметного процесса. Конфигурация определяет допустимые политики и специализации, но не заменяет правило, его применение, предметный факт или историю.

### Документы

Документ может фиксировать, оформлять или подтверждать процедуру, голосование, установленный результат или решение, но не тождествен им. Общий жизненный цикл документов не принадлежит этому ADR.

### Коммуникации

Доставка уведомления сама по себе не создаёт управленческий факт, если применимая процедура не придаёт доставке определённый предметный эффект. Каналы и техническая доставка относятся к коммуникационному и интеграционному решениям.

### Финансы

Управленческое решение может быть основанием финансового процесса. При этом:

```text
Решение ≠ Начисление ≠ Финансовое обязательство
```

Контекст управления не создаёт и не изменяет финансовые факты вместо финансового контекста.

### Ресурсный и инженерный учёт

Ресурсный процесс может использовать управленческое решение как допустимое основание. Решение не становится показанием, потреблением, результатом контрольной сверки, расчётным небалансом, эксплуатационной потерей или другим ресурсным фактом.

## Архитектурные инварианты

1. Субъект не тождествен пользователю или учётной записи.
2. Объект собственности не тождествен субъекту.
3. Собственность не тождественна праву голоса.
4. Право участия не тождественно праву голоса.
5. Представительство не тождественно праву голоса.
6. Полномочие субъекта не тождественно компетенции органа.
7. Орган управления не тождествен субъекту или должности.
8. Вопрос может иметь от нуля до нескольких самостоятельных голосований.
9. Каждое голосование использует одну применимую версию правила и имеет один исходный снимок прав после его формирования.
10. Повторное голосование является новым голосованием и не переписывает предыдущее.
11. Право голоса и голос не тождественны; на одно право допускается не более одного одновременно действующего голоса.
12. Воздержание не тождественно неучастию.
13. Расчётный результат не тождествен установленному результату.
14. Установленный результат не тождествен решению.
15. Документ не тождествен решению.
16. Конфигурация, правило и предметный факт не тождественны.
17. Автоматизированный сервис не становится субъектом; автоматическое действие должно иметь определимое предметное основание.
18. Изменение раннего факта не переписывает последующие результаты автоматически.
19. Принятая или опубликованная версия правила не изменяется задним числом; использованная версия исторически определима.
20. Универсальная суперсущность управления, обязательный процесс состояний и универсальный механизм исправлений не вводятся.


---

## 17. ADR-013 — derived models / coordinators / admissibility boundary

Для dashboards, reports, search, complex read-heavy queries и BFF composition допускаются explicitly published read models/projections.

Каждая projection:

- derived и не является source of truth;
- имеет declared producer/owner;
- имеет определимый Community/tenant scope;
- имеет visibility/authorization semantics;
- имеет declared freshness/consistency expectation;
- является read-only для consumers;
- не используется для command-side mutation domain state;
- rebuildable там, где это допускают source facts и semantics.

Stale projection не может grant Access Right, Power или domain admissibility и не может подтверждать irreversible operation, когда требуется current authoritative state.

BFF, Public API, reports и search используют projection только в пределах её declared semantics. Physical storage, rebuild strategy, indexes и isolation projection относятся к ADR-014; freshness monitoring — к ADR-017.

### 13. Process-specific coordinators

Для действительно complex multi-step process допустим specialized application-level process coordinator.

Coordinator:

- принадлежит конкретному named use case/process;
- не является universal Workflow Engine или universal State Machine;
- не владеет domain facts участвующих modules;
- использует public application contracts и published events;
- хранит только необходимый orchestration progress/context;
- является persistent/resumable для long-running process;
- допускает retry, recovery и idempotent steps, где они требуются;
- не предполагает distributed transaction с external systems.

Coordinator не требуется для каждого multi-module call.

Provisioning и Community relocation могут иметь Control Plane coordinators согласно ADR-012. Import и bank reconciliation используют собственную integration/Finance semantics ADR-006/011. Onboarding или Go-Live используют coordinator только там, где process действительно multi-step; это не создаёт общий onboarding workflow engine.


### 24. Control Plane module boundary

Control Plane сохраняется как separate platform responsibility ADR-012 и технически представлен platform functional modules внутри logical modular-monolith baseline.

Control Plane modules:

- соблюдают те же layers и public-contract rules;
- входят в тот же acyclic dependency discipline;
- проверяются теми же architecture tests;
- не читают internal persistence Community functional modules;
- не присваивают ownership Community domain facts.

Community modules не читают Control Plane internals, а Control Plane modules не читают internals Community modules. Взаимодействие выполняется через narrow stable published platform и Community contracts или применимые read models.

Community-scoped entry point или application composition boundary выполняет resolution актуального Community Placement до вызова operation, требующей Community-owned storage, и формирует корректный placement-aware application execution/storage context. Community Domain не зависит от Placement Resolver и не вызывает Control Plane internals.

Entitlement contract применяется на соответствующей application/platform authorization или admission boundary и не становится dependency Community Domain model. Control Plane process coordinator может вызывать Community initialization/readiness contracts в пределах конкретного process, не присваивая их semantics.

Отдельный Control Plane service или host не обязателен. Web/API Host и Worker Host могут выполнять соответствующие entry points с применимыми permissions. Возможный третий host или future service является отдельным deployment/evolution decision.

### 25. Authorization и domain admissibility

Transport layer принимает authenticated technical context, но authentication не доказывает Subject, Power или domain admissibility.

Application координирует technical authorization и вызов обязательных domain-specific checks. Context-owner Domain владеет domain admissibility и invariants конкретного действия.

Technical Access Right или Access Role не может override mandatory negative domain result. Domain Power не предоставляет technical access автоматически.

Bootstrap administrator может быть authorized actor platform operation без fake Subject, если это допускают applicable technical authorization и domain admissibility. Worker service identity также не становится Subject и не создаёт bypass.

Настоящий ADR не выбирает RBAC, ABAC, ReBAC, policy engine, token/session или security middleware.

### 26. Architecture enforcement

Architecture as code применяется там, где правило можно надёжно проверить автоматически.

Future CI/architecture tests должны иметь возможность проверять:

- forbidden module dependencies;
- dependency cycles;
- обращение к другим modules только через allowed contracts;
- отсутствие dependencies Domain на Web/API/Telegram/ORM/Infrastructure;
- отсутствие случайной публикации module internals;
- отсутствие dependencies Shared Kernel на functional modules;
- соблюдение Application boundaries Web/API и Worker Hosts.

Нарушение объективно проверяемого architecture rule должно fail CI.

Architecture tests не заменяют semantic architecture review. Вопрос, какому context/module принадлежит конкретная business capability, не выводится автоматически из dependency graph.

Exact architecture-test framework, library и CI implementation относятся к Implementation Baseline.


---

## 18. DOMAIN_MODEL — relevant current source of truth

### Subject / ownership / Membership / Domain Power

## 4. Субъект, лицо и пользователь системы

**Субъект** — универсальный участник предметных отношений. В текущей модели субъектом может быть лицо: физическое или юридическое. Иные типы субъектов могут быть добавлены позднее.

Субъект может быть представлен неполными идентификационными сведениями, если имеющихся сведений достаточно для признания конкретного реального лица отдельным субъектом предметных отношений. Неполнота сведений не означает существования условного или фиктивного субъекта. Если известно только наличие неустановленного лица, например неизвестного собственника объекта, субъект не создаётся.

Последующее дополнение или уточнение сведений о том же субъекте само по себе не создаёт нового субъекта. Совпадение отдельных имён, контактных данных, внешних идентификаторов или иных признаков само по себе не является достаточным основанием для автоматического объединения субъектов.

Субъект не становится автоматически собственником, членом сообщества, сотрудником, плательщиком, должником, пользователем системы, участником процедуры или носителем права голоса. Это разные отношения и контексты.

**Пользовательская учётная запись** — средство технического взаимодействия субъекта с Community OS. Субъект может существовать без учётной записи и иметь несколько учётных записей.

Количество учётных записей не создаёт дополнительных предметных прав, прав участия, прав голоса или голосов. Создание, блокировка или прекращение учётной записи сами по себе не изменяют собственность, членство, должность, предметное полномочие, представительство, право голоса и другие предметные отношения субъекта.

Учётная запись, связанная с субъектом и использованная для предметно значимого действия, сохраняет эту связь и после такого использования не перепривязывается другому субъекту. Для другого субъекта используется другая учётная запись. Ошибочная связь исправляется отдельной исторически прослеживаемой корректировкой, которая не меняет атрибуцию уже совершённых значимых действий.

Для устойчивой platform identity и multi-community attribution может использоваться минимальный **Subject Identity Anchor**. Он не является полным профилем субъекта или глобальным каталогом всех субъектов и не создаётся автоматически из импорта либо совпадения контактных данных. Community-specific сведения о субъекте и его предметные отношения принадлежат соответствующему сообществу. Community Subject может существовать без пользовательской учётной записи и без Anchor; связь с Anchor не создаёт cross-community visibility или распространение предметных отношений.

## 5. Объекты и отношения субъекта к объекту

**Объект** — элемент предметной модели, который может быть предметом права, отношения, учёта или иного процесса, определённого правилами Community OS. Объект не является обязательным предком всех понятий модели.

**Объект собственности** — специализация объекта, представляющая единицу собственности: участок, квартиру, дом, гараж, машино-место, помещение или иной применимый объект.

Объект собственности имеет устойчивую предметную идентичность, не зависящую от его текущего обозначения, собственника или действующих отношений с субъектами. Смена собственника не создаёт новый объект.

Объект собственности имеет применимый тип и может иметь предметное обозначение в рамках сообщества. Обозначение не является идентичностью объекта и может изменяться без изменения самого объекта. Для действующих объектов обозначение уникально в пределах сочетания сообщества и типа объекта. Внешние и исторические идентификаторы не заменяют внутреннюю идентичность объекта.

Объект собственности может существовать без установленного в Community OS действующего собственника. Такое состояние означает отсутствие достаточных сведений о действующем праве в системе и само по себе не характеризует юридический статус объекта.

**Площадь объекта (Object Area)** — исторически значимая измеряемая характеристика объекта собственности, выражающая площадь определённого вида в установленной единице измерения.

Для одного объекта могут быть применимы несколько видов площади, если это имеет предметный смысл: например, площадь земельного участка, общая площадь помещения, жилая площадь или иной явно определённый вид площади. Вид площади является частью её предметной семантики и не выводится только из типа объекта.

Для площади должны быть определимы, где применимо, объект, вид площади, числовое значение, единица измерения, период применимости, происхождение и основание признания. Неизвестная площадь не заменяется нулём или предполагаемым значением.

Реальное изменение площади и исправление ошибочных сведений о площади являются различными ситуациями и сохраняют требуемую историческую прослеживаемость.

Площадь объекта не является финансовым фактом, тарифом, начислением или правилом. Она может использоваться как исторически значимое входное значение в финансовых, управленческих и других предметных процессах. Если площадь использована при исторически значимом расчёте, должно быть возможно определить фактически использованное значение, его единицу измерения и предметную применимость в контексте этого расчёта.

Прекращение использования или учёта объекта, ошибочное создание объекта и изменение отношений субъектов с существующим объектом являются различными ситуациями. Разделение, объединение и иные преобразования объектов требуют собственной предметной семантики и настоящим документом детально не определяются.

**Отношение субъекта к объекту** — концептуальная общность исторических отношений субъекта и объекта. К ней относятся право собственности, право пользования, аренда и другие поддерживаемые отношения. Это не означает единую техническую сущность или одинаковый набор атрибутов.

**Право собственности** — самостоятельный предметно значимый вид отношения субъекта к объекту собственности. Оно связывает установленного субъекта с объектом собственности и содержит исторически значимые сведения об отношении в объёме, известном и применимом к конкретному случаю.

Для права собственности могут быть значимы доля, период действия, основание возникновения или изменения и документ-основание. Неизвестность отдельных сведений не отменяет существование признанного отношения собственности, если имеющихся сведений достаточно для его предметного признания.

Доля собственности может быть известна или неизвестна. Неизвестная доля не заменяется предполагаемым значением. Неприменимость доли в конкретном предметном процессе также не тождественна неизвестной доле.

Начало периода действия права может быть неизвестно. Технический момент создания записи, импорта или начала эксплуатации Community OS не считается датой возникновения права без соответствующего предметного основания.

Документ-основание не является обязательным условием существования зарегистрированного отношения собственности. Следует различать само право, известное основание, подтверждающий документ, полноту или подтверждённость сведений и их происхождение.

Реальная смена собственника и исправление ошибочных сведений различаются. При смене собственника завершается применимое прежнее отношение и возникает новое. Исправление ошибки сохраняет требуемую историческую прослеживаемость и не должно изображаться фиктивной передачей собственности.

Объект может иметь несколько прав собственности, включая долевые. Право собственности не является правом голоса, но может быть основанием его формирования, определения веса или назначения реализатора, если это предписано правилом.

Пользование является отношением субъекта к объекту, а не отдельным универсальным типом объекта. Не вводится общий обязательный тип «объект пользования».

## 6. Отношения субъекта к сообществу

**Отношение субъекта к сообществу** — концептуальная общность отношений субъекта и сообщества. К ней могут относиться членство, служебное или трудовое отношение, участие в органе управления и другие отношения, допустимые для сообщества.

**Членство** не является синонимом собственности, пользователя системы, права участия или права голоса. Его наличие, основания и последствия определяются правилами сообщества.

**Служебное / трудовое отношение** — историческое отношение субъекта к сообществу, на основании которого субъект выполняет работу. Оно может определять должность, функцию или иные организационные назначения. Должность, функция, роль доступа, право доступа и предметное полномочие — разные понятия.

**Сотрудник** — субъект, имеющий применимое служебное или трудовое отношение с сообществом. Наличие такого отношения не создаёт автоматически пользовательскую учётную запись, роль доступа или право доступа. Вознаграждение сотрудника относится к отдельной финансовой предметной области.

**Орган управления** принадлежит сообществу. Участие субъекта в органе управления — самостоятельное историческое отношение с конкретным органом; оно не сводится к роли пользователя.

**Договорное отношение с сообществом (Contractual Relationship)** — самостоятельное исторически значимое отношение между конкретным сообществом и установленным субъектом, возникающее на договорном или ином согласованном основании, когда само устойчивое взаимодействие имеет собственный предметный смысл и не исчерпывается уже существующим специализированным отношением.

Договорное отношение имеет собственную identity в пределах Community. Она не тождественна Subject, номеру договора, Document, Financial Obligation, Payment, Expense, отношению пользования объектом или внешнему идентификатору. Один Subject может иметь несколько договорных отношений с одним Community.

Contractual Relationship может существовать без загруженного Contract Document. Документ может оформлять, подтверждать, изменять или прекращать отношение, но не является самим отношением. Само договорное отношение может быть основанием для финансовых, объектных, ресурсных или иных фактов в соответствующих owning contexts и не создаёт их автоматически.

Наличие договора или соглашения не требует отдельного Contractual Relationship, если предмет уже полностью принадлежит специализированному отношению. В частности, трудовой договор может быть основанием служебного/трудового отношения, а частная аренда участка между Subjects относится к Subject↔Object Use/Lease relation. ГПХ сам по себе не определяет owning relation: он может быть формой служебного/трудового отношения либо основанием самостоятельного внешнего Contractual Relationship согласно реальному предметному смыслу.

В Contractual Relationship могут быть значимы contextual roles сторон и relation kind, но роль не является типом Subject, Access Role или Domain Power. Relation kind как допустимая конфигурационная классификация не является identity отношения и не заменяет его конкретный subject matter.

## 7. Полномочия и предметно значимые действия

**Предметное полномочие** — предметно определимая допустимость субъекта действовать в определённой области на применимом основании. Оно не заменяет специальные условия соответствующего предметного контекста и может основываться на представительстве, должности, участии в органе управления, служебном отношении, назначении или ином допустимом основании.

**Представительство** — самостоятельное историческое отношение и одно из возможных оснований полномочия. Оно не передаёт собственность, членство, право участия или право голоса и не создаёт их автоматически.

Представительство не тождественно предметному полномочию, должности, участию в органе управления, компетенции органа, роли доступа, праву доступа или праву голоса. Компетенция органа управления и полномочие конкретного субъекта действовать от имени или в составе органа проверяются раздельно.

Предметное полномочие, право доступа и иные применимые основания могут иметь **область применимости**, семантика которой принадлежит соответствующему предметному контексту. Она может относиться к сообществу, объекту, лицевому счёту, инженерной системе, точке учёта, документу, процедуре, голосованию или иной открыто определяемой области. Универсальный объект авторизации, универсальный идентификатор или закрытый перечень областей не вводятся.

**Предметно значимое действие** — концептуальный принцип, а не обязательный общий тип всех операций. Если применимо, его локальная семантика позволяет различить фактически действующего субъекта, представленную сторону, сообщество, орган управления, должность или участие в органе, компетенцию, представительство, предметное полномочие, основание, учётную запись, область и момент применимости. Эти сведения не объединяются универсальной сущностью действия, действующего лица или контекста действия.

**Роль доступа** — техническая группировка прав доступа. **Право доступа** — возможность технического доступа к данным или функции в применимой области. Роль и право доступа не тождественны должности, профессии или трудовому отношению, собственности, членству, предметному полномочию, представительству либо праву голоса и сами по себе не создают эти отношения.

**Access Grant** — исторически объяснимое предоставление определённых прав доступа допустимому получателю доступа — пользовательской учётной записи либо иной Technical Identity согласно ADR-015 — в определённой области применимости и по применимым правилам. Access Grant не является собственностью, членством, представительством, предметным полномочием или правом голоса и не создаёт их.

Для обычного пользовательского доступа к предметно значимым функциям учётная запись должна быть связана с определимым Community Subject. Регистрация учётной записи, совпадение ФИО, телефона, email или иного отдельного признака сами по себе не устанавливают такую связь и не создают Access Grant. Запрос пользователя или приглашение могут участвовать в процессе получения доступа, но не являются обязательными стадиями каждого grant и сами по себе не создают предметное отношение.

Автоматическое предоставление пользовательского доступа допускается только по явно применимому правилу. Делегирование доступа означает создание нового самостоятельного Access Grant другому пользователю, а не передачу Ownership, Membership, Representation, Domain Power, Voting Right или копирование всех прав инициатора. Существенное изменение основания доступа должно оставаться исторически прослеживаемым и не переписывает молча прежнее основание.

Предметная допустимость действия определяется контекстом — владельцем его семантики. Общий семантический контракт авторизации координирует предметные проверки и технический доступ, не присваивая предметные правила. Отрицательный результат обязательной предметной проверки не преодолевается техническим доступом, а предметное полномочие само по себе не создаёт технический доступ. Универсальный результат авторизации не вводится.

Для предметных полномочий, представительств, ролей и прав доступа, связей учётных записей и других применимых оснований сохраняется временная семантика там, где она значима. Их последующее прекращение не переписывает автоматически исторически допустимое действие; должны быть объяснимы применимость основания в момент действия и последующая корректировка сведений.

Инициатор и фактический исполнитель различаются, когда это предметно важно. Автоматическое действие может не требовать действующего субъекта, но должно сохранять значимое происхождение, если влияет на предметный результат. Если предметная семантика требует субъекта, автоматизация не заменяет его атрибуцию. Система, сервис или фоновая задача не становятся субъектом.

Внешний субъект может существовать и участвовать в обращении, импорте или другом допустимом процессе без пользовательской учётной записи. Заявленная внешняя идентичность, источник сведений, техническая интеграция и установленный субъект различаются; внешний идентификатор сам по себе не создаёт субъекта.

Один субъект может участвовать в нескольких сообществах и использовать одну учётную запись для взаимодействия с ними. Его предметные полномочия, должности, роли и права доступа, отношения и области применимости не считаются глобальными между сообществами автоматически.

## 8. Основания, сведения и документ

Для предметно значимой информации различаются:

- **основание** — почему факт или отношение имеют предметную силу;
- **источник данных** — откуда получены сведения;
- **действие фиксации** — кто или что зафиксировало сведения в Community OS;
- **подтверждающие сведения** — информация, на которой факт может быть установлен или проверен;
- **документ** — предметно распознаваемый информационный объект со стабильной идентичностью, относящийся к деятельности сообщества и признаваемый документом согласно семантике его вида и применимым правилам.

Эти понятия могут совпадать в конкретной ситуации, но не тождественны. Основание не равно документу. Документ может оформлять или подтверждать основание, удостоверять факт либо быть основанием, если это следует из конкретной ситуации.

Не вводятся обязательные универсальные понятия «доказательство», «предметный факт» или «предметное утверждение». Конкретные отношения сохраняют собственную семантику.

## 9. Время, история и конфликтующие сведения

Для исторических отношений используется интервал действия **[start, end)**: начало включительно, конец исключительно; отсутствие конца означает продолжающееся отношение. Эта семантика применяется только там, где имеет предметный смысл. Для отдельных исторических отношений начало периода может быть неизвестно; неизвестность начала не должна заменяться технической датой фиксации или иным предполагаемым значением.

Различаются время действия — когда отношение или состояние имеет предметную силу — и время фиксации — когда информация появилась в Community OS. Момент предметного события может быть отдельной характеристикой, если применимо.

Для исторически значимых изменений должна быть восстановима картина до изменения, содержание изменения, момент изменения и состояние после него. Технический способ хранения не определяется.

Содержание сведений отделяется от оценки их достоверности или применимости. Система может хранить конфликтующие сведения, не признавая их одновременно действительными. Следует различать наличие сведений, признание их применимыми и использование в конкретном действии или расчёте.

Ядро не задаёт глобальную иерархию доверия к источникам. Приоритет источников, требования к подтверждению и разрешение конфликтов определяются правилами соответствующего процесса и должны быть предметно объяснимы.


### Documents / integrations

## 13. Документы, публикации, обращения и коммуникации

Контексты **«Документы и формализация»** и **«Коммуникации и обращения»** самостоятельны. Связь документа с коммуникационным материалом не объединяет контексты и не передаёт владение их понятиями.

**Документ** имеет стабильную предметную идентичность. **Редакция документа** является исторически определимым состоянием содержания конкретного документа, а **представление документа** — предметно различимой формой выражения конкретной редакции. Документ может существовать без файла и иметь от нуля до нескольких представлений; представление не обязано быть файлом.

```text
Документ ≠ Редакция документа ≠ Представление документа ≠ Файл
```

Вид документа и применимые правила определяют, означает ли изменение правку черновика, новую редакцию того же документа, исправление, замену, отзыв или новый документ. Исторически значимое содержание не переписывается молча. Универсальная сущность содержания документа и общий жизненный цикл документов не вводятся.

**Публикация документа** — отдельный исторически значимый факт, связанный с конкретной редакцией или представлением и определимой аудиторией. Аудитория задаёт открытую предметную направленность публикации или коммуникационного материала и не является закрытым перечнем, правом доступа либо техническим списком аккаунтов.

```text
Документ ≠ Редакция документа ≠ Публикация документа
Публикация ≠ Аудитория ≠ Техническая доставка ≠ Технический доступ
```

**Подписание**, **утверждение**, **регистрация** и **публикация** являются разными предметными действиями. Подписание относится к конкретной редакции или представлению; новая редакция не наследует его автоматически. Регистрация не обязательна для каждого документа и не вводит универсальный реестр или систему нумерации.

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом. Инициатор не обязан быть пользователем системы; универсальный жизненный цикл обращения не вводится.

Обращение не тождественно документу, сообщению, заявке технической поддержки или управленческой процедуре.

**Уведомление** — самостоятельное предметное коммуникационное понятие с определимым содержанием и адресатом или аудиторией. Формирование уведомления не означает его отправку, доставку, получение, прочтение или юридически значимое уведомление. Несколько технических попыток или каналов доставки не создают автоматически несколько уведомлений.

**Новость** и **объявление** являются самостоятельными коммуникационными материалами, а не обязательными видами документа или публикации. Они могут иметь явные связи с документом, редакцией, представлением или публикацией.

**Неформальный опрос (Survey)** — самостоятельный identity-bearing коммуникационный referent структурированного сбора мнений/ответов. Survey относится к контексту «Коммуникации и обращения» и может использоваться управленческим контекстом как basis/input, но не становится Governance Question или Voting автоматически.

**Survey Item** — локально адресуемая часть конкретного Survey со стабильной локальной identity. Для уже принятых Survey Responses должно быть исторически объяснимо response-relevant значение Item — его применимая формулировка, допустимые варианты/validation и применимость в необходимом объёме. Отдельная universal Survey Item Revision или Survey Definition Version не вводится.

**Survey Response** — самостоятельный исторически различимый факт принятого ответа в рамках конкретного Survey со stable identity. Он не является простым отношением Subject↔Survey и может существовать без persistent Subject link, если это допускает declared survey policy. Acting Subject/User, response unit, admissibility basis и technical access различаются. Для accepted Response, где это существенно, сохраняется достаточный historical context применённой admissibility/multiplicity semantics без введения Survey Right или Survey Eligibility Snapshot.

```text
Survey ≠ Voting
Survey Item ≠ Governance Question
Survey Response ≠ Vote
survey aggregation ≠ Established Result ≠ Management Decision
```

Derived aggregation Survey Responses является Read Model / Projection, а не новым source of truth или universal Survey Result. Если summary используется как предметно значимый basis Governance, его aggregation context должен быть фиксированным либо исторически воспроизводимым. Формализованный исторический отчёт может использовать Document/Revision/Representation, не передавая документному контексту ownership Survey Responses.

**Вложение / приложение** — контекстная роль или предметно значимое отношение коммуникационного материала с документом, редакцией либо представлением. Универсальная идентичность вложения не вводится.

Если действие по своей предметной семантике совершает субъект, должны быть определимы фактически действовавший субъект и, где применимо, основание его действия. Автоматизированный механизм не становится субъектом и не подменяет требуемую атрибуцию.

Документ может оформлять, подтверждать, фиксировать, представлять или быть основанием предмета другого контекста, но не становится этим предметом автоматически. В частности:

- документ не тождествен управленческому решению;
- документ не тождествен финансовому обязательству, начислению, платежу или распределению;
- документ не тождествен показанию, потреблению, результату контрольной сверки, расчётному небалансу или эксплуатационной потере.

Право доступа и технический доступ, доставка и фактическое прочтение, а также публикация и аудитория сохраняют самостоятельную семантику. Сквозная семантика идентичности, полномочий и доступа определена ADR-010; семантические границы интеграций определены ADR-011, а техническая реализация и enforcement относятся к этапу K.

## 14. Интеграционные границы

**Внешняя сторона интеграции** должна быть минимально определима в рамках конкретного взаимодействия для происхождения сведений, внешних идентификаторов и семантических контрактов. Она не является субъектом, пользовательской учётной записью, bounded context или универсальной предметной сущностью внешней системы и не получает владение предметной семантикой Community OS.

**Внешний идентификатор** — квалифицированное значение в области конкретной интеграции. Он не является глобальной идентичностью внутреннего объекта и сам её не определяет. Связь внутреннего объекта с внешним идентификатором может быть исторически значима; один объект может иметь разные идентификаторы в разных интеграциях и сообществах. Изменение внешнего идентификатора прибора не меняет идентичность прибора или точки учёта.

```text
Внешняя информация ≠ Полученная внешняя информация ≠ Признанный предметный факт
```

Внешнее представление проходит получение, проверку и контекстное сопоставление, после чего владеющий bounded context признаёт или отклоняет предметный факт и определяет последствия. Получение и сопоставление сами по себе не создают предметный факт; сопоставление не становится автоматически универсальной сущностью или правилом.

Для исторически значимого результата сохраняются достаточные сведения о происхождении и объяснимости: источник, применимый внешний идентификатор, значимые времена и версия семантического контракта или сопоставления, если она могла повлиять на интерпретацию. Это не создаёт глобальную историю интеграций или обязательную универсальную запись.

```text
Повторная доставка ≠ Дубликат ≠ Внешнее исправление ≠ Замена ≠ Новая информация
```

Повторное получение не создаёт новый предметный факт автоматически, а исправление внешнего источника не переписывает молча уже признанный исторически значимый факт. Критерии различия и предметные последствия принадлежат конкретному интеграционному процессу и владеющему bounded context.

Первоначальная миграция, ручной массовый импорт, регулярная синхронизация и операционная интеграция различаются. Строка CSV/XLS или иной элемент входа не является предметным фактом. Составной импорт может иметь результаты отдельных элементов; допустимость частичного успеха либо атомарность определяет конкретный процесс. Повторный запуск должен отличать уже признанные элементы от исправленных, не требуя универсального процесса импорта.

Экспорт не тождествен документу, публикации или доставке. Его историческая значимость определяется bounded context и семантическим контрактом конкретной интеграции. Доставка уведомления сохраняет различия между созданием, отправкой, принятием провайдером, доставкой, получением, прочтением и юридически значимым уведомлением; универсальные сущности доставки не вводятся.

Источник сведений, авторитетный источник конкретных сведений, основание признания, владелец предметного факта и производный результат не тождественны. Авторитет определяется контекстом и областью; глобальная иерархия источников истины и правило «последнее значение побеждает» не вводятся.

Интеграционные границы сохраняют предметные различия: банковская операция не является автоматически банковской транзакцией Community OS, а банковская транзакция не является автоматически платежом, распределением, начислением или финансовым обязательством; бухгалтерский документ внешней системы не является финансовым обязательством Community OS; телеметрический образец не является показанием или потреблением; внешний файл не становится документом; внешние сведения о голосовании не создают голосование, установленный результат или управленческое решение; аутентификация внешним поставщиком идентичности не создаёт субъекта, предметное полномочие или предметную допустимость.


### Governance / Participation / Rules / Voting / first-deployment profile

## 15. Управление, процедуры и собрания

**Управленческая процедура** — минимальная предметная рамка, которая может связывать инициирование, подготовку, рассмотрение, собрания или иные способы проведения, вопросы, голосования, расчёты, установление результатов, решения и пересмотр там, где это применимо. Она не является универсальным процессом исполнения, обязательной машиной состояний или владельцем всех управленческих фактов; разные виды процедур могут иметь различную предметную структуру.

**Орган управления** — относимый к сообществу орган с предметно определённой компетенцией. Орган управления не тождествен субъекту, пользователю, должности или полномочию. Компетенция органа определяет предметную область, в которой орган вправе действовать, тогда как полномочие конкретного субъекта действовать от имени органа или в его составе является отдельным историческим отношением.

**Собрание** — возможная, но не обязательная часть управленческой процедуры. Процедура может включать одно или несколько мероприятий или периодов проведения, проходить очно, заочно, в смешанной форме либо без физического собрания.

**Вопрос** — самостоятельный предмет рассмотрения там, где управленческая процедура выделяет вопросы. Он не обязан принадлежать физическому собранию и не является обязательным узлом любой процедуры. Вопрос, голосование, расчёт результата, установленный результат и управленческое решение — разные понятия.

Вопрос может не требовать голосования либо иметь одно или несколько связанных голосований. **Голосование** имеет самостоятельную предметную идентичность; каждое конкретное голосование использует одну применимую версию правила и после формирования имеет один исходный снимок прав, где он применим. Разные голосования одного вопроса могут использовать разные версии правил и снимки прав. Повторное голосование является новым, исторически связанным голосованием, а не новой версией или переписыванием предыдущего.

**Повестка** может быть самостоятельным представлением исторически определимого состава и порядка вопросов, если это предусмотрено конкретной процедурой, но не является обязательной универсальной сущностью.

**Кворум** — предусмотренное применимым правилом условие достаточности состава или участия для определённой области процедуры. Правило определяет необходимость, область, исходные данные и способ определения кворума; снимок прав конкретного голосования не является универсальным источником любого кворума. Универсальная модель результата кворума не вводится.

## 16. Право участия

**Право участия** — право субъекта участвовать в определённом контексте участия в объёме, установленном применимыми правилами.

Контекст может относиться к сообществу, собранию, вопросу или иной процедуре; единый обязательный уровень не устанавливается. Право участия имеет субъект, контекст, основание или основания, состояние и определяемый правилами объём участия.

Право участия не является автоматически правом присутствовать, получать материалы, участвовать в обсуждении, подавать голос или правом голоса. Не вводится универсальный реализатор права участия. Фактическое действие определяется общей моделью полномочий и предметно значимых действий.

Право участия и право голоса самостоятельны. Ни одно из них не объявляется универсально обязательным условием другого; их связь задаёт правило конкретной процедуры.

Возможности присутствовать, участвовать в обсуждении, вносить предложение, голосовать, подписывать или устанавливать результат и иные процессно допустимые возможности различаются. Они не образуют обязательного универсального участника или единого пакета прав.

## 17. Правила и версии правил

**Правило** — предметный набор условий, определяющий применимое поведение, результат или порядок выполнения процесса. Правило имеет устойчивую предметную идентичность, объединяющую его редакции во времени, и принадлежит контексту, владеющему его предметным смыслом.

**Версия правила** — конкретная редакция правила. До предметного принятия или публикации редакция может оставаться изменяемым черновиком. Принятая или опубликованная версия неизменяема; изменение её содержания создаёт новую версию того же правила.

Правила и версии правил являются сквозной архитектурной ответственностью, но не образуют универсального централизованного владельца. Содержание и локальная модель правил принадлежат соответствующим предметным контекстам. Не вводится обязательный универсальный Rule-объект, одинаковый для всех контекстов.

Сохраняются различия:

```text
правило
≠ конфигурация
≠ предметный факт
≠ программный код
```

Конфигурация может участвовать в определении допустимости или применимости правила, но не заменяет правило. Предметный факт может быть основанием, входом, действием или результатом процесса. Программный код может реализовывать предметную логику версии, но не является самим предметным правилом автоматически.

Применимая версия определяется предметной политикой соответствующего процесса. Текущая, последняя или наиболее новая версия не считается применимой автоматически. Если процесс заранее зафиксировал версию, появление новой версии само по себе не меняет правило уже начатого процесса, если его предметная семантика явно не предусматривает иного.

Для одного процесса могут быть потенциально применимы несколько правил. Их взаимная исключительность, выбор, приоритет, совместное применение и существенный порядок композиции определяются предметной семантикой процесса. Случайный или скрытый технический порядок исполнения не должен определять предметный результат. Межконтекстная зависимость правил определяется явно там, где она имеет предметный смысл.

Для исторически значимого применения должны быть определимы фактически использованные версии, существенные входы, использованные значения, основания выбора и применимости, а также существенные промежуточные показатели, если они необходимы для объяснимости или предметной воспроизводимости результата. Универсальный полный снимок состояния Community OS и единый журнал применения правил не требуются. Допустимы однозначные исторические ссылки на сведения контекстов-владельцев, если они не ссылаются на изменяемое текущее состояние.

Ретроспективная применимость версии сама по себе не переписывает прошлые действия и результаты и не инициирует автоматический перерасчёт. Перерасчёт, исправление, пересмотр и изменение последствий являются самостоятельными прослеживаемыми предметными действиями соответствующих контекстов и не образуют универсальную операцию Community OS.

Предметная воспроизводимость применения означает возможность на основании исторически определённого контекста объяснить и, когда это требуется семантикой результата, независимо проверить его получение. Она не требует повторного запуска той же программной реализации или сохранения исторического технического окружения.

### Правило голосования и право голоса

**Правило голосования** определяет условия формирования прав голоса, основания, реализаторов, веса, варианты ответа, порядок учёта голосов, расчёта и установления результата. Связь права участия с правом голоса определяется применимыми правилами конкретной процедуры.

**Версия правила голосования** — специальная для голосования версия правила. Она сохраняет гарантии общей концепции версии и специальные инварианты ADR-001. Каждое конкретное голосование использует одну применимую версию; разные голосования одного или разных вопросов могут использовать разные версии. Если версия опирается на конфигурацию, она должна ссылаться на исторически определённое состояние её предметно значимых частей.

**Право голоса** существует в контексте конкретного вопроса и голосования. Оно имеет одно или несколько оснований, использованные значения, вес, состояние возможности реализации и реализатора при наличии.

Основание отвечает, почему право, вес или реализатор допустимы. Использованное значение — конкретные сведения, применённые к правилу: например, площадь, доля, статус или дата действия отношения. Основание и использованное значение не тождественны.

Вес может быть `0`, целым или дробным, если это допускает правило. Вес `0` не равен отсутствию права. Тип, точность, диапазон, округление, суммирование и возможная нормализация определяются правилом; ядро не задаёт универсальную сумму весов.

Кардинальность прав определяется правилом. Один субъект может иметь несколько самостоятельных прав голоса, которые не объединяются автоматически. Несколько собственников объекта также не создают автоматически несколько прав голоса.

**Реализатор права голоса** — специальное понятие модели голосования: субъект, фактически реализующий конкретное право. Одно право имеет не более одного одновременно фактического реализатора; один субъект может реализовывать любое число разных прав. Отсутствие реализатора не уничтожает право.

Назначение совладельца реализатором общего права не является автоматически представительством других совладельцев. Представительство может быть основанием полномочия реализовать право, но не передаёт само право и не меняет его вес.

## 18. Предварительная проекция, снимок и корректировка прав

До формирования снимка может существовать предварительная проекция будущих прав. Она изменяема, не является исторически зафиксированным правом конкретной процедуры и не создаёт отдельный вид права.

**Снимок прав** фиксирует исторически определённые права конкретного голосования. Он неизменяем и содержит достаточно контекста для независимой проверки: версию правила, момент состояния, момент формирования, основания, использованные значения, рассчитанные права, веса, состояния, реализаторов и существенные исключения.

Снимок не является полной копией реестров. Представительство остаётся самостоятельным историческим отношением и не включается универсально в снимок прав как неизменяемый элемент. Поздние сведения и изменения собственности, пользователей, представительств или иных текущих отношений не переписывают исходный снимок и не отменяют автоматически исторически допустимое действие. После завершения периода реализации право сохраняется исторически, хотя может перестать быть реализуемым.

**Корректирующая операция** — самостоятельное исторически прослеживаемое изменение результата снимка. Она не изменяет исходный снимок. Следует различать исходный снимок, корректирующие операции и эффективный состав прав с учётом применимых корректировок.

Корректировка может затрагивать наличие права, вес, реализатора или иную допустимую характеристику только если это разрешает правило. У неё различаются момент фиксации и предметный момент либо период действия последствий. Само обнаружение ошибки не делает корректировку автоматически допустимой.

## 19. Голос, расчёт и результаты

**Голос** — факт выражения позиции по конкретному праву голоса. Право и голос не тождественны: существование права не означает, что голос подан.

Набор вариантов ответа определяет конкретное голосование. «Воздержался» — сознательно выбранный вариант, если он предусмотрен; «не участвовал» — отсутствие действительного поданного голоса. Групповая операция подачи одинакового ответа не объединяет права и фиксирует отдельный голос по каждому праву.

Одно право не может иметь более одного одновременно учитываемого голоса. При изменении голоса сохраняется история предыдущих значений. Версия правила определяет допустимость изменения и то, какое значение учитывается.

Для голоса различаются исторический факт подачи, результат его проверки в момент подачи и учитываемость в конкретном расчёте результата. Учитываемость и основание учёта или неучёта относятся к конкретному расчёту и не являются неизменяемым свойством самого голоса. Поздняя корректировка права не удаляет исторически поданный голос и не переписывает то, как голос был принят или проверен в момент подачи.

**Расчёт результата** — исторически определённое применение правила к эффективному составу прав и голосов. Он может фиксировать версию правила, момент, учтённые и существенные неучтённые голоса, показатели и расчётный результат. Технический предварительный пересчёт сам по себе не является предметно значимым расчётом.

**Расчётный результат** — результат применения правила к определённому составу прав и голосов.

**Установленный результат** — исторически значимый результат, предметно зафиксированный для конкретной процедуры. Он имеет определимое основание установления, включающее применимую версию правила и расчётное основание. Расчётное основание может включать один или несколько предметно значимых расчётов результата и иные предусмотренные процедурой основания. Установленный результат позволяет определить применённую версию правила, существенные расчётные показатели и предметный вывод согласно применённому правилу. Универсальный закрытый набор показателей или выводов не устанавливается.

**Установление результата** — предметно значимое действие, которым для процедуры фиксируется установленный результат на определимом расчётном и ином допустимом основании. Оно может выполняться субъектом или автоматически согласно применимым правилам и концептуально отличается от расчёта результата и последующего пересмотра. Расчётный результат не становится установленным автоматически.

**Управленческое решение** — самостоятельный предметный факт определённого управленческого содержания, относимый к компетентному органу и возникший на допустимом для соответствующей процедуры основании. Оно может возникнуть через голосование, вследствие установленного результата согласно применимому правилу либо без голосования. Даже когда правило непосредственно связывает установленный результат с возникновением решения, установленный результат и решение остаются разными предметными фактами.

Для решения, где это существенно, различаются принятие, вступление в силу, период действия, приостановление, прекращение, отмена и замена. Универсальный обязательный набор временных характеристик не вводится, а изменение или прекращение решения не стирает его историю.

**Решение по вопросу** является частным управленческим решением. Оно не тождественно вопросу, голосованию, расчётному или установленному результату либо документу, которым оформлено.

**Пересмотр результата** — самостоятельное предметно значимое действие. Корректировка предметных данных, расчёт или перерасчёт результата, пересмотр установленного результата и изменение состояния решения — разные действия. Корректировка сама по себе не меняет установленный результат или решение после завершения голосования.

Пересмотр результата сам по себе не переписывает и не отменяет решение по вопросу. Последствия пересмотра установленного результата для существующего решения определяются применимыми правилами и фиксируются как отдельное предметно значимое изменение состояния решения. Исправление, новый расчёт, пересмотр или повторное установление результата, изменение решения и повторное голосование являются специализированными действиями; общее понятие пересмотра не требует универсальной самостоятельной сущности.

Завершение приёма голосов, расчёт результата и установление результата различаются концептуально, даже если совпадают по времени. После завершения основной процедуры могут существовать корректировки, пересмотры и другие исторически значимые действия, если это допускают правила.

История управления должна позволять объяснить, где применимо, какой орган действовал, в какой процедуре, какие вопросы и их редакции использовались, какое голосование проводилось, какая версия правила и какой снимок прав применялись, какие позиции и голоса учитывались, какой результат был рассчитан и установлен и какое решение возникло. Это не создаёт глобального контекста истории.

Документ может оформлять, подтверждать или фиксировать управленческое решение, но не тождествен ему. Управленческое решение также не является начислением или финансовым обязательством и не становится показанием, потреблением, расчётным небалансом, эксплуатационной потерей либо иным ресурсным фактом. Финансовый или ресурсный процесс может использовать решение как основание только в пределах собственной предметной семантики.

## 20. Профиль первого внедрения — СНТ

Первый профиль Community OS — СНТ. Его специализации не являются универсальными правилами.

- объектом собственности для голосования является земельный участок;
- правило «1 участок = 1 голос» создаёт одно право голоса на участок;
- совместная собственность не создаёт дополнительных голосов;
- один из совладельцев может быть назначен реализатором согласно применимому правилу;
- такое назначение не означает представительство остальных совладельцев;
- задолженность сама по себе не ограничивает право голоса;
- варианты ответа могут включать «за», «против» и «воздержался».

Профиль также использует участки, лицевые счета, учёт электроэнергии и воды, инженерные ветви, общие и промежуточные приборы, анализ небалансов и сметное финансирование общих расходов. Для участка, участвующего в финансовом учёте первого профиля, конфигурация предусматривает основной лицевой счёт; это специализация профиля, а не универсальная обязательность лицевого счёта для любого объекта собственности Community OS.


### Core invariants excerpt

## 22. Инварианты и расширяемость

Существенные различия модели:

- субъект ≠ пользователь системы;
- Subject Identity Anchor ≠ субъект, полный профиль субъекта и пользовательская учётная запись;
- сообщество ≠ Tenant, Customer/Billing Account, Subscription и Community Placement;
- пользовательская учётная запись ≠ предметное полномочие, роль доступа и право доступа;
- предметное полномочие ≠ представительство, роль доступа, право доступа и право голоса;
- орган управления ≠ субъект, пользовательская учётная запись, должность и предметное полномочие;
- компетенция органа ≠ предметное полномочие конкретного субъекта;
- автоматизированный механизм ≠ субъект;
- объект собственности ≠ лицевой счёт и инженерная система;
- право собственности ≠ право голоса;
- членство ≠ собственность и право голоса;
- сотрудник ≠ роль доступа;
- Subject ≠ Contractual Relationship; Community ≠ Subject только ради договорной модели;
- Contractual Relationship ≠ Contract Document ≠ Financial Obligation ≠ Payment ≠ Expense;
- Contractual Relationship ≠ Subject↔Object Use/Lease relation и не заменяет инженерную топологию;
- Supplier ≠ тип Subject и ≠ отдельная identity; Contractual role ≠ Access Role;
- наличие договора/соглашения ≠ автоматическое Contractual Relationship;
- прекращение Contractual Relationship ≠ автоматическая отмена существующих Financial Obligations;
- право участия ≠ право голоса;
- реализатор ≠ представитель;
- право голоса ≠ голос;
- снимок прав ≠ корректирующая операция;
- расчётный результат ≠ установленный результат;
- установленный результат ≠ решение по вопросу;
- документ ≠ оформляемый им факт или решение;
- документ ≠ редакция документа ≠ представление документа ≠ файл;
- документ ≠ публикация; публикация ≠ аудитория ≠ техническая доставка ≠ технический доступ;
- обращение ≠ документ; уведомление ≠ отправка ≠ доставка ≠ получение ≠ прочтение ≠ юридически значимое уведомление;
- обращение ≠ операционная работа; операционная работа может существовать без обращения;
- операционная работа ≠ назначение по работе ≠ результат работы;
- финансовое раскрытие/проекция ≠ financial source of truth;
- dynamic financial view ≠ formal Publication;
- universal Disclosure Rule не вводится; rule ownership остаётся локальным согласно ADR-005;
- bank movement ≠ Payment ≠ Expense ≠ Budget execution metric;
- Funding Source/target metric ≠ reserve automatically;
- member/resident relation ≠ identifiable debtor visibility automatically;
- Work Assignment ≠ employment/Supplier/Contractual Relationship/Representation automatically;
- Completion Assertion ≠ Acceptance;
- Work Result ≠ Document ≠ Expense ≠ Financial Obligation;
- Operational Work/Work Result не переписывают resource facts автоматически;
- ресурс ≠ инженерная система;
- объект собственности ≠ место потребления ≠ точка учёта ≠ прибор ≠ лицевой счёт;
- точка учёта ≠ прибор; показание ≠ потребление;
- потребление ≠ результат контрольной сверки, расчётный небаланс или эксплуатационная потеря;
- расчётный небаланс ≠ эксплуатационная потеря;
- внешнее или телеметрическое значение ≠ признанное показание;
- потребление ≠ начисление; начисление ≠ платёж;
- финансовое обязательство ≠ начисление, задолженность, расход или платёж;
- задолженность ≠ просрочка;
- банковский счёт сообщества ≠ лицевой счёт;
- банковская транзакция ≠ платёж и распределение;
- платёж ≠ распределение; платёжное намерение ≠ платёж;
- нераспределённый остаток ≠ переплата ≠ аванс;
- смета ≠ фактическое исполнение; источник финансирования ≠ направление использования средств;
- источник финансирования ≠ статья начисления, платёж, банковская транзакция и финансирование расхода;
- направление использования средств ≠ финансирование расхода; целевое направление само по себе ≠ техническое резервирование средств.

Модель должна позволять добавлять типы субъектов, объектов, сообществ, ресурсов, инженерных элементов, начислений, документов, правил и аналитики без изменения фундаментальных понятий. Специализация сообщества не должна требовать отдельной программной системы.

---


---

## 19. TERMINOLOGY — relevant current terms

### Governance + Document + Signing + Survey boundary

# 34. Орган управления

**Орган управления** — относимый к сообществу орган с предметно определённой компетенцией.

Орган управления не тождествен субъекту, пользователю системы, должности или полномочию. Компетенция органа и полномочие конкретного субъекта действовать от имени органа или в его составе — разные понятия. Участие субъекта в органе управления является отдельным историческим отношением.

Примеры:

- председатель;
- правление;
- общее собрание;
- другие органы.

---

# 35. Собрание

**Собрание** — возможная, но не обязательная часть управленческой процедуры, представляющая предметно значимое мероприятие или период проведения.

Управленческая процедура может включать одно или несколько собраний либо проходить без физического собрания. Собрание может быть очным, заочным, электронным или смешанным в соответствии с применимыми правилами.

---

# 36. Голосование

**Голосование** — самостоятельный предметный контекст выражения допустимых позиций по конкретному вопросу на основе относящихся к нему прав голоса.

Голосование связано с правами голоса и их весами и использует одну применимую версию правила голосования. В зависимости от применимых правил оно также может быть связано с:

- правами участия;
- вариантами ответа;
- результатами.

---

# 37. Право голоса

**Право голоса** — самостоятельное понятие предметной модели: право выразить позицию по конкретному вопросу конкретного голосования с определённым весом.

Право голоса формируется в контексте конкретного голосования согласно применимой версии правила. Оно может иметь одно или несколько оснований, вес, реализатора при его наличии и состояние возможности реализации.

Право собственности, пользователь системы и право участия не являются правом голоса. Один субъект может быть реализатором нескольких разных прав голоса, но одно право голоса имеет не более одного фактического реализатора. Отсутствие реализатора не уничтожает право автоматически.

Вес права голоса может быть нулевым, целым или дробным. Допустимость веса, точность, диапазон, округление, суммирование и возможная нормализация определяются применимым правилом; универсальная сумма весов не устанавливается. Вес `0` не тождественен отсутствию права.

Правило «1 участок = 1 голос» является примером конфигурации конкретного сообщества, а не универсальным определением права голоса.

---

# 38. Правило голосования

**Правило голосования** — настраиваемое описание условий формирования прав голоса и параметров конкретного голосования: оснований, реализаторов, весов, вариантов ответа, порядка учёта голосов, кворума, расчёта, установления результата и других условий голосования.

Связь права участия и права голоса определяется применимыми правилами конкретной процедуры. Правило голосования не является универсальным источником формирования прав участия.

Правило голосования имеет версии. Конкретное голосование использует одну применимую версию правила; разные голосования, в том числе по одному вопросу, могут использовать разные версии. Изменение правила создаёт новую версию и не меняет ранее использованные версии.

---

# 39. Документ

**Документ** — предметно распознаваемый информационный объект со стабильной идентичностью, относящийся к деятельности сообщества и признаваемый документом согласно семантике его вида и применимым правилам.

Документ не тождествен факту или решению, которое он оформляет или подтверждает. Документ может оформлять, подтверждать или удостоверять основание, факт или решение, а в отдельных случаях сам быть основанием.

Документ может существовать без файла и иметь от нуля до нескольких представлений. Документ, его редакция, представление и файл не тождественны.

Примеры:

- устав;
- протокол собрания;
- решение правления;
- финансовый отчёт;
- отчёт ревизионной комиссии;
- договор;
- заявление.

---

# 40. Публичный документ

**Публичный документ** — документ, для которого применимая предметная семантика предусматривает публичность или публикацию открытой аудитории.

Публичность документа не определяется только отсутствием авторизации или местом в пользовательском интерфейсе и не создаёт техническое право доступа автоматически.

«Публичный документ» является контекстной характеристикой, а не обязательным универсальным подтипом или состоянием документа.

---

# 41. Личный кабинет

**Личный кабинет** — защищённая область системы, через которую пользователь получает доступ к данным и функциям, разрешённым его правами.

Для собственника личный кабинет может содержать:

- объекты собственности;
- лицевые счета;
- начисления;
- платежи;
- задолженность;
- показания приборов учёта;
- документы;
- уведомления;
- опросы;
- голосования;
- обращения.

---

# 42. Обращение

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом.

Инициатор не обязан быть пользователем системы. Обращение не тождественно документу, сообщению, заявке технической поддержки или управленческой процедуре и не имеет обязательного универсального жизненного цикла.

---

# 42.1. Редакция документа

**Редакция документа** — исторически определимое состояние содержания конкретного документа, выделенное как редакция согласно семантике вида документа и применимым правилам.

Не существует универсального критерия, когда изменение является новой редакцией того же документа, а когда исправлением, заменой, отзывом или новым документом. Исторически значимое содержание не переписывается молча.

---

# 42.2. Представление документа

**Представление документа** — предметно различимая форма, в которой конкретная редакция документа выражена, предъявлена или подготовлена для использования.

Представление не обязано быть файлом. Документ может существовать без файла и иметь от нуля до нескольких представлений. Универсальная сущность содержания документа не вводится.

---

# 42.3. Публикация документа

**Публикация документа** — отдельный исторически значимый предметный факт предоставления конкретной редакции документа или её определённого представления определимой аудитории согласно применимым правилам.

Публикация не является универсальным состоянием документа. Отзыв публикации не стирает факт предыдущей публикации. Документ, редакция документа, публикация, аудитория, техническая доставка и технический доступ не тождественны.

---

# 42.4. Аудитория

**Аудитория** — открытая предметная семантика того, кому предназначены документ, публикация или коммуникационный материал.

Аудитория может определяться субъектом, группой или предметным условием либо отношением. Она не является обязательной универсальной сущностью, закрытым перечнем, правом доступа, техническим доступом, доставкой или фактическим читателем.

---

# 42.5. Подписание документа

**Подписание документа** — исторически значимое действие над конкретной редакцией документа или её определённым представлением с определимым подписантом и, где применимо, основанием действия от собственного или чужого имени.

Подписание не тождественно утверждению, регистрации или публикации. Новая редакция не наследует автоматически подписание предыдущей.

---

# 42.6. Утверждение документа

**Утверждение документа** — предметно значимое признание конкретной редакции утверждённой в пределах применимой процедуры и правил, если вид документа предусматривает такое действие.

Утверждение не обязательно для каждого документа и не тождественно подписанию, регистрации, публикации или управленческому решению.

---

# 42.7. Регистрация документа

**Регистрация документа** — допустимое исторически значимое действие признания документа или его редакции зарегистрированными в определённом предметном контексте.

Регистрация не обязательна для каждого документа и не вводит универсальный реестр или систему нумерации. Идентичность документа, регистрационный номер и запись реестра не тождественны.

---

# 42.8. Уведомление

**Уведомление** — самостоятельное предметное понятие контекста коммуникаций с определимым содержанием и адресатом или аудиторией, предназначенное сообщить предметно значимую информацию.

Формирование уведомления не тождественно его отправке, доставке, получению, прочтению или юридически значимому уведомлению. Эти понятия не образуют обязательный универсальный жизненный цикл.

---

# 42.9. Новость и объявление

**Новость** и **объявление** — самостоятельные коммуникационные материалы сообщества, которые не являются автоматически документами или публикациями документов.

Они могут иметь явные связи с документом, редакцией, представлением или публикацией.

---

# 42.10. Вложение / приложение

**Вложение / приложение** — контекстная роль или предметно значимое отношение, связывающее обращение или иной коммуникационный материал с документом, редакцией документа или представлением документа.

Вложение не тождественно документу, редакции, представлению или файлу и не получает обязательную универсальную идентичность.

---

# 42.11. Неформальный опрос (Survey)

**Неформальный опрос (Survey)** — самостоятельный предметно идентифицируемый коммуникационный referent структурированного сбора мнений, предпочтений или иной обратной связи от определимой либо policy-допустимой аудитории Community.

Survey имеет стабильную identity и принадлежит контексту «Коммуникации и обращения». Он может использоваться как basis/input управленческой процедуры, но не является автоматически Governance Question, Voting, Established Result или Management Decision.

Повторное проведение похожего по содержанию опроса является новым Survey, если это новый предметный акт сбора мнений. Replacement relation между Surveys существует только при явной предметной замене.

---

# 42.12. Пункт опроса (Survey Item)

**Пункт опроса (Survey Item)** — локально адресуемая часть конкретного Survey, по которой ожидается structured input.

Survey Item имеет стабильную локальную identity внутри Survey, но не является самостоятельной fundamental top-level entity. Survey Item не тождествен Governance Question.

Для accepted Survey Responses должно быть исторически объяснимо response-relevant значение Item — применимая формулировка, допустимые варианты/validation и применимость в необходимом объёме. Это не требует universal Survey Item Revision или Survey Definition Version.

---

# 42.13. Ответ на опрос (Survey Response)

**Ответ на опрос (Survey Response)** — самостоятельный исторически различимый факт принятого ответа в рамках конкретного Survey со stable identity.

Survey Response может содержать значения по одному или нескольким Survey Items и не является простым отношением Subject↔Survey. Acting Subject, User Account, response unit, admissibility basis и technical access различаются; persistent Subject link не является универсально обязательным.

Survey Response не является Vote, Appeal или Document автоматически. Accepted Response должен сохранять достаточную историческую объяснимость применённой admissibility/multiplicity semantics там, где это существенно. Для этого не вводятся universal Survey Right, Survey Participant или Survey Eligibility Snapshot.

Derived aggregation Survey Responses является Read Model / Projection и не становится universal Survey Result, Established Result или Management Decision.

---



### Subject / authentication / Domain Power / access

# 69. Субъект

**Субъект** — физическое лицо, юридическое лицо или иной поддерживаемый носитель прав, обязанностей и полномочий.

Субъект может иметь неполные идентификационные сведения, если имеющихся сведений достаточно для признания конкретного реального лица отдельным субъектом предметных отношений. Неустановленное лицо не представляется фиктивным субъектом: если известно только наличие неизвестного собственника или иного неустановленного лица, отдельный Subject не создаётся.

Последующее дополнение или уточнение сведений о том же субъекте само по себе не создаёт нового субъекта. Совпадение отдельных имён, контактных данных, внешних идентификаторов или иных признаков не является достаточным основанием для автоматического объединения субъектов.

Субъект не является автоматически собственником, членом сообщества, пользователем системы, плательщиком или должником. Эти статусы и отношения определяются в соответствующих контекстах.

Субъект может существовать без пользовательской учётной записи, в том числе участвовать во внешнем взаимодействии или обращении. Заявленная внешняя идентичность, источник сведений, техническая интеграция и установленный субъект не тождественны; внешний идентификатор сам по себе не создаёт субъекта.

---

# 69.1. Техническая идентичность

**Техническая идентичность (Technical Identity)** — идентичность, устанавливаемая технической аутентификацией и используемая системой при операции.

Она не тождественна субъекту, пользовательской учётной записи, предметному полномочию или праву доступа и не объединяется с ними универсальной сущностью Identity.

---

# 69.2. Аутентификация

**Аутентификация (Authentication)** — техническое установление идентичности, используемой системой при операции.

Успешная аутентификация сама по себе не доказывает связь учётной записи с субъектом, собственность, членство, должность, предметное полномочие, представительство, право голоса, предметную допустимость или право доступа.

---

# 69.3. Предметное полномочие

**Предметное полномочие (Domain Power)** — предметно определимая допустимость субъекта действовать в определённой области на применимом основании.

Оно не является универсальной заменой специальных условий предметного контекста и не тождественно представительству, должности, участию в органе управления, компетенции органа, роли доступа, праву доступа или праву голоса.

---

# 69.4. Предметная допустимость

**Предметная допустимость (Domain Admissibility)** — результат применения требований контекста — владельца семантики конкретного действия — к возможности совершить это действие в данных предметных обстоятельствах.

Она не тождественна аутентификации, предметному полномочию, технической авторизации, праву доступа или технической возможности вызвать операцию.

---

# 69.5. Техническая авторизация

**Техническая авторизация (Technical Authorization)** — проверка того, может ли технически идентифицированное взаимодействие выполнить конкретную операцию с учётом необходимых решений и сведений.

Техническая авторизация не владеет предметными правилами и не может преодолеть отрицательный результат обязательной предметной проверки только на основании технического доступа. Универсальная сущность результата авторизации не вводится.

---

# 69.6. Роль доступа

**Роль доступа (Access Role)** — техническая группировка прав доступа.

Роль доступа не является должностью, профессией или трудовым отношением, собственностью, членством, предметным полномочием, представительством, правом голоса или участием в органе управления и сама по себе не создаёт этих отношений.

---

# 69.7. Право доступа

**Право доступа (Access Right)** — возможность технического доступа к данным или функции в применимой области.

Право доступа не тождественно предметному полномочию, предметной допустимости или праву голоса и само по себе не создаёт их.

---

# 69.8. Технический доступ

**Технический доступ (Technical Access)** — техническая возможность использовать данные или функцию системы в результате применимой авторизации.

Технический доступ не доказывает предметную допустимость действия и не создаёт предметное полномочие.

---

# 69.9. Область применимости

**Область применимости (Scope)** — предметно определённая область, ограничивающая применимость полномочия, права доступа или иного основания.

Семантика области принадлежит соответствующему предметному контексту. Универсальный объект авторизации, универсальный идентификатор области и закрытый перечень видов области не вводятся.

---

# 69.10. Предоставление доступа

**Предоставление доступа (Access Grant)** — исторически объяснимое предоставление определённых прав доступа допустимому получателю — пользовательской учётной записи либо иной Technical Identity согласно ADR-015 — в определённой области применимости и по применимым правилам.

Access Grant не является собственностью, членством, представительством, предметным полномочием или правом голоса и не создаёт их. В пользовательском сценарии один User Account может иметь несколько независимых grants на разных основаниях и в разных областях применимости.

Прекращение предметного основания влияет только на зависимый от него доступ согласно применимым правилам и не прекращает автоматически другие grants пользователя. Отзыв Access Grant не тождествен блокировке пользовательской учётной записи.

---

# 69.11. Запрос на доступ

**Запрос на доступ (Access Request)** — запрос пользователя на предоставление определённого пользовательского доступа в конкретном сообществе.

Запрос может содержать заявленные сведения о субъекте, объекте, основании, требуемых правах и области применимости, но сам по себе не устанавливает Account↔Subject linkage, Ownership, Membership, Representation, Domain Power или Access Grant.

Access Request не является обязательной стадией каждого предоставления доступа.

---

# 69.12. Приглашение к получению доступа

**Приглашение к получению доступа (Invitation)** — предложение определённому или определяемому пользователю начать процесс получения доступа на заданных инициатором условиях.

Invitation не является Access Grant и само по себе не доказывает идентичность Subject, Ownership или другое предметное отношение. Принятие приглашения может потребовать identity resolution, проверки основания и применения access policy.

Отзыв Invitation после создания Access Grant сам по себе не отзывает уже предоставленный доступ.

---


### Participation / Voting / Membership / basis / confirming information

# 72. Право участия

**Право участия** — право субъекта участвовать в определённом контексте участия в объёме, установленном применимыми правилами.

Контекст может относиться к сообществу, собранию, вопросу или иной процедуре; единый универсально обязательный уровень не устанавливается. Право участия не означает автоматически право присутствовать, получать материалы, участвовать в обсуждении или подавать голос. Эти возможности определяются правилами соответствующего контекста и, если применимо, правами доступа.

Право участия не тождественно праву голоса и не влечёт его автоматически. Оно не имеет универсального реализатора и не является универсально обязательным условием возникновения права голоса.

---

# 73. Реализатор права голоса

**Реализатор права голоса** — субъект, который фактически реализует конкретное право голоса.

Реализатор не является самим правом голоса и не является автоматически представителем. Один субъект может быть реализатором нескольких различных прав голоса, при этом одно право голоса имеет не более одного фактического реализатора.

Назначение совладельца реализатором общего права голоса не означает, что этот совладелец представляет другого совладельца.

---

# 74. Представительство

**Представительство** — самостоятельное историческое отношение и одно из возможных оснований полномочия действовать от имени другого субъекта в определённом контексте. Представительство не является самим полномочием.

Представительство может относиться к субъекту, объекту, конкретному праву, типу действия или конкретному голосованию. Оно не передаёт автоматически собственность, членство, право участия или право голоса, не создаёт новое право и не изменяет вес права голоса, но может подтверждать допустимость реализации права другим субъектом.

Отзыв или изменение представительства не переписывает молча исторически допустимое действие. Применимость представительства к конкретному действию определяется для соответствующего момента и правила.

---

# 75. Версия правила голосования

**Версия правила голосования** — неизменяемая редакция правила голосования, применимая к конкретному голосованию.

Это специальный термин модели голосования и специализация общей «Версии правила». Изменение правила создаёт новую версию и не меняет ранее использованные версии. Каждое конкретное голосование использует одну применимую версию; разные голосования одного или разных вопросов могут использовать разные версии.

---

# 76. Основание права голоса

**Основание права голоса** — частный случай основания: факт или отношение, на котором применимое правило основывает возникновение права голоса, назначение реализатора, определение веса либо иной параметр.

Право голоса может иметь одно или несколько оснований.

---

# 77. Использованное значение

**Использованное значение** — значение, фактически применённое конкретным предметным действием, процедурой или расчётом.

В модели голосования использованное значение при формировании снимка прав является частным случаем этого понятия. Например, им могут быть площадь, доля, статус или дата действия отношения, применённые для проверки права, назначения реализатора, расчёта веса или другого параметра. Использованное значение не тождественно основанию права голоса.

Изменение текущего настроенного или эффективного значения не переписывает автоматически значение, исторически использованное предметным действием.

---

# 78. Снимок прав

**Снимок прав** — неизменяемый набор результатов применения версии правила голосования к конкретному голосованию.

Снимок фиксирует достаточный для независимой проверки контекст, включая применимую версию правила, момент состояния и момент формирования, основания, использованные значения, применимые права участия, права голоса, веса, реализаторов при их наличии и применённые условия или ограничения. Представительство остаётся самостоятельным историческим отношением и не включается универсально в снимок как неизменяемый элемент.

Изменение текущих реестров после формирования снимка не изменяет его автоматически. Снимок прав не тождествен корректирующей операции или эффективному составу прав.

---

# 79. Голос

**Голос** — факт выражения позиции по конкретному праву голоса в конкретном голосовании.

Голос не тождествен праву голоса: он может быть подан только по существующему праву, а наличие права не означает, что голос подан. По одному праву голоса не может существовать несколько одновременно действующих голосов.

Набор вариантов ответа определяется конкретным голосованием. «За», «против» и «воздержался» не являются обязательным универсальным набором. «Воздержался» означает сознательно выбранный вариант ответа, если он предусмотрен; «не участвовал» означает, что действительный голос не подан.

Групповая операция подачи одинакового ответа по нескольким правам не объединяет эти права и фиксирует отдельный голос по каждому из них.

Для голоса различаются исторический факт подачи, результат проверки в момент подачи и учитываемость в конкретном расчёте результата. Учитываемость относится к конкретному расчёту, а не является неизменяемым свойством самого голоса.

---

# 80. История голоса

**История голоса** — сохранённые сведения об исторически поданных значениях голоса и их изменениях по конкретному праву голоса.

Возможность изменения голоса и правило использования действующего значения при подсчёте определяются конкретным голосованием. Поздняя корректировка не переписывает факт подачи голоса или то, как голос был принят либо проверен в момент подачи. Учитываемость голоса относится к конкретному расчёту результата.

---

# 81. Корректирующая операция

**Корректирующая операция** — явно оформленное исторически прослеживаемое изменение результата снимка прав, выполняемое в пределах, допускаемых применимыми правилами.

Причиной операции может быть выявленная ошибка или иное допустимое основание. Корректирующая операция содержит ссылку на исходный снимок, причину, инициатора, дату и время, ошибочные данные, корректные данные и результат применения операции. Исходный снимок остаётся неизменяемым и не переписывается; операция может изменять эффективный состав прав, но сама по себе не меняет установленный результат или решение по вопросу. Допустимость и последствия операции определяются применимыми правилами.

---

# 82. Физическое лицо

**Физическое лицо** — человек, выступающий субъектом предметных отношений Community OS.

---

# 83. Юридическое лицо

**Юридическое лицо** — организация, выступающая субъектом предметных отношений Community OS.

---

# 84. Конфигурация сообщества

**Конфигурация сообщества** — совокупность предметно значимых настроек разных областей, определяющих применимые специализации, политики, варианты поведения и возможности конкретного сообщества, но не заменяющих предметные факты этих областей.

Конфигурация не тождественна универсальной предметной модели, профилю сообщества или технической конфигурации системы. Она не является единым владельцем всех настроек: их предметный смысл и история принадлежат соответствующим областям. Единая глобальная версия всей конфигурации не подразумевается.

---

# 85. Отношение субъекта к объекту

**Отношение субъекта к объекту** — концептуальная общность исторических отношений субъекта и объекта. К ней относятся право собственности, право пользования, аренда и другие применимые отношения.

Эта общность не означает единый обязательный набор характеристик для всех таких отношений.

---

# 86. Право пользования

**Право пользования** — предметно значимое отношение субъекта к объекту, определяющее допустимость его использования в установленном контексте и периоде.

Право пользования не тождественно праву собственности и не создаёт автоматически право участия или право голоса.

---

# 87. Отношение субъекта к сообществу

**Отношение субъекта к сообществу** — концептуальная общность отношений субъекта и сообщества. К ней могут относиться членство, служебное или трудовое отношение, участие в органе управления, договорное отношение с сообществом и другие отношения, допустимые для сообщества.

---

# 87.1. Договорное отношение с сообществом

**Договорное отношение с сообществом (Contractual Relationship)** — самостоятельное исторически значимое отношение между конкретным Community и установленным Subject, возникающее на договорном или ином согласованном основании, когда само устойчивое взаимодействие имеет самостоятельный предметный смысл и не исчерпывается уже существующим специализированным отношением.

Оно имеет собственную identity в пределах Community и не тождественно Subject, номеру договора, Document, Financial Obligation, Payment, Expense или Subject↔Object Use/Lease relation.

Contractual Relationship может существовать без загруженного Contract Document. Документы могут оформлять, подтверждать, изменять или прекращать отношение, но не являются самим отношением.

Наличие договора или соглашения само по себе не создаёт Contractual Relationship, если предмет полностью принадлежит специализированному отношению.

---

# 87.2. Контекстная договорная роль

**Контекстная договорная роль (contextual contractual role)** — предметная роль Community или Subject в конкретном Contractual Relationship, например supplier/customer, contractor/customer, lessor/lessee, infrastructure provider/infrastructure user или service provider/service recipient.

Такая роль имеет смысл только в контексте конкретного отношения. Она не является типом Subject, Access Role, Domain Power или универсальной сущностью PartyRole.

---

# 88. Членство

**Членство** — историческое отношение субъекта к сообществу, наличие, основания и последствия которого определяются правилами сообщества.

Членство не тождественно собственности, пользователю системы, праву участия или праву голоса.

---

# 89. Служебное / трудовое отношение

**Служебное / трудовое отношение** — историческое отношение субъекта к сообществу, на основании которого субъект выполняет работу. Оно может определять должность, функцию или иные организационные назначения.

Должность, функция, роль доступа, право доступа и предметное полномочие — разные понятия.

---

# 90. Участие в органе управления

**Участие в органе управления** — историческое отношение субъекта с конкретным органом управления сообщества.

Оно не тождественно роли доступа, праву доступа, предметному полномочию или самому органу управления.

---

# 91. Полномочие действовать от имени субъекта

**Полномочие действовать от имени субъекта** — специализированный случай предметного полномочия одного субъекта действовать от имени другого в определённой области.

Оно может основываться на представительстве или другом допустимом основании, но не тождественно самому представительству. Действие от имени другого субъекта не объединяется универсально с действием, относимым к сообществу или органу управления.

---

# 92. Основание

**Основание** — то, почему факт, отношение, право или иной предметный результат имеют предметную силу.

Основание не тождественно источнику данных, подтверждающим сведениям, документу или действию фиксации.

---

# 93. Источник данных

**Источник данных** — то, откуда получены сведения, используемые в предметном процессе.

Источник данных не определяет автоматически предметную силу сведений или их применимость.

---

# 94. Действие фиксации

**Действие фиксации** — действие, которым сведения были зафиксированы в Community OS.

Оно отличается от источника данных, основания и подтверждающих сведений.

---

# 95. Подтверждающие сведения

**Подтверждающие сведения** — информация, на которой факт или отношение могут быть установлены либо проверены.

Подтверждающие сведения не тождественны основанию, источнику данных, документу или действию фиксации.

---

# 96. Временная семантика исторических отношений

Для исторических отношений применяется интервал действия **[start, end)**: начало включительно, конец исключительно, отсутствие конца означает продолжающееся отношение. Для отдельных исторических отношений начало периода может быть неизвестно; неизвестность начала не заменяется технической датой фиксации или иным предполагаемым значением.

Различаются время действия — когда отношение или состояние имеет предметную силу, время фиксации — когда сведения появились в Community OS, и момент предметного события, если он применим.

---


### Governance rules/results

# 99. Вопрос

**Вопрос** — самостоятельный предмет рассмотрения там, где управленческая процедура выделяет вопросы.

Вопрос не является обязательным узлом любой управленческой процедуры и не обязан принадлежать физическому собранию. Он не тождествен голосованию, расчёту результата, установленному результату или решению по вопросу. Вопрос может иметь от нуля до нескольких самостоятельных голосований.

---

# 100. Расчёт результата

**Расчёт результата** — исторически определённое применение правила к эффективному составу прав и голосов.

Технический предварительный пересчёт сам по себе не является расчётом результата в предметном смысле.

---

# 101. Расчётный результат

**Расчётный результат** — результат применения правила к определённому составу прав и голосов.

---

# 102. Установленный результат

**Установленный результат** — исторически значимый результат, предметно зафиксированный для конкретной процедуры на определимом расчётном и ином допустимом основании.

Расчётный результат не становится установленным автоматически. Установленный результат не тождествен управленческому решению и может не привести к его возникновению.

---

# 103. Установление результата

**Установление результата** — предметно значимое действие, которым для процедуры фиксируется установленный результат на определимом расчётном и ином допустимом основании.

Оно отличается от расчёта результата и последующего пересмотра.

---

# 104. Пересмотр результата

**Пересмотр результата** — самостоятельное предметно значимое действие по пересмотру установленного результата в пределах применимых правил.

Он отличается от корректирующей операции и сам по себе не переписывает или отменяет решение по вопросу. Общая семантика пересмотра не требует универсальной самостоятельной сущности пересмотра.

---

# 105. Решение по вопросу

**Решение по вопросу** — частный случай управленческого решения, возникшего по вопросу на допустимом для соответствующей процедуры основании.

Оно не тождественно вопросу, голосованию, установленному результату или документу, которым оформлено.

---

# 106. Значение по умолчанию

**Значение по умолчанию** — значение, предлагаемое при отсутствии явно установленного значения, если предметная семантика соответствующего вида настройки вообще предусматривает значение по умолчанию.

Наличие значения по умолчанию не обязательно для каждой настройки. Оно не означает автоматически эффективного значения; его изменение не изменяет автоматически уже настроенное или ранее использованное значение.

---

# 107. Настроенное значение

**Настроенное значение** — значение настройки, явно установленное для конкретного сообщества или более узкой предметной области применимости.

Настроенное значение не тождественно эффективному или использованному значению.

---

# 108. Эффективное значение

**Эффективное значение** — значение настройки, применимое в соответствующей предметной области и временном контексте.

Эффективное значение не обязано совпадать с настроенным значением. Его применимость определяется предметной семантикой конкретного вида настройки и не предполагает универсального механизма разрешения или универсального языка областей применимости.

---

# 109. Версия правила

**Версия правила** — конкретная редакция правила.

До предметного принятия или публикации редакция может быть изменяемым черновиком. После предметного принятия или публикации версия неизменяема; изменение содержания означает создание новой версии того же правила. Прекращение применимости или замена версии не изменяет её историческое содержание и роль в объяснении прошлых действий и результатов.

Версия правила голосования является специальным термином голосования и сохраняет дополнительные инварианты ADR-001.

---

# 110. Применимость правила / версии правила

**Применимость правила / версии правила** — предметные условия, при которых правило или конкретная версия относится к процессу, операции, периоду или иному предметному случаю.

Применимость определяется семантикой соответствующего процесса и может учитывать время, расчётный период, состояние исходных данных, момент начала процедуры, явно зафиксированный выбор и другие предметно значимые основания. Текущая, последняя или наиболее новая версия не считается применимой автоматически.

Если потенциально применимы несколько правил, их выбор, приоритет или композиция определяются предметной политикой соответствующего контекста. Глобальная иерархия приоритетов правил не вводится.

---

# 111. Применение правила

**Применение правила** — использование конкретной версии правила в конкретном предметном процессе или операции.

Для исторически значимого применения фактически использованная версия и необходимый контекст должны быть исторически определимы. В зависимости от семантики процесса такой контекст может включать существенные входы, использованные значения, основания выбора и применимости, порядок композиции и существенные промежуточные показатели.

Новая или ретроспективно применимая версия не изменяет автоматически ранее совершённое применение, его результат или последствия.

---

# 112. Управленческая процедура

**Управленческая процедура** — минимальная предметная рамка, которая может связывать применимые управленческие действия, собрания или иные способы проведения, вопросы, голосования, установление результатов, решения и пересмотр.

Она не является универсальным процессом исполнения, обязательной машиной состояний или владельцем всех управленческих фактов. Разные виды процедур могут иметь различную предметную структуру.

---

# 113. Компетенция

**Компетенция** — предметно определённая область, в которой орган управления вправе действовать.

Компетенция органа не тождественна полномочию конкретного субъекта действовать от имени органа или в его составе.

---

# 114. Повестка

**Повестка** — самостоятельное представление состава и, где применимо, порядка вопросов управленческой процедуры.

Повестка существует только там, где её предусматривает конкретная процедура, и не является обязательной универсальной сущностью.

---

# 115. Кворум

**Кворум** — предусмотренное применимым правилом условие достаточности состава или участия для определённой области управленческой процедуры.

Правило определяет необходимость, область, исходные данные и способ определения кворума. Снимок прав конкретного голосования не является универсальным источником любого кворума; универсальная сущность результата кворума не вводится.

---

# 116. Позиция

**Позиция** — допустимый по применимой версии правила способ волеизъявления реализатора конкретного права голоса.

Позиция может выражать один или несколько выборов, выбор кандидата или кандидатов, ранжирование либо иной предметно определённый ответ. «Воздержался» является позицией только при наличии такого варианта; неучастие означает отсутствие действительного голоса.

---

# 117. Управленческое решение

**Управленческое решение** — самостоятельный предметный факт определённого управленческого содержания, относимый к компетентному органу и возникший на допустимом для соответствующей процедуры основании.

Решение может возникнуть через голосование, как предусмотренное правилом следствие установленного результата либо без голосования. Оно не тождественно расчёту, установленному результату или документу. Где это существенно, отдельно определимы принятие, вступление в силу, период действия, приостановление, прекращение, отмена и замена решения.

---

# 118. Повторное голосование

**Повторное голосование** — новое самостоятельное голосование, исторически связанное с предыдущим голосованием и причиной повторения, если она предметно значима.

Оно не является новой версией предыдущего голосования и не переписывает его. Повторное голосование использует собственную применимую версию правила и имеет собственный исходный снимок прав, где он применим.

---


### Integration/runtime terms relevant to unknown outcome and evidence handling

# 142. Workload Identity

**Workload Identity** — Technical Identity автоматизированного runtime/workload с explicit purpose и scope. Она не является User Account, Subject или носителем Domain Power и не требует fake System Subject.

---

# 143. Support Elevation и Break-glass

**Support Elevation** — explicit scoped, purpose-bound, time-limited и auditable технический доступ support operator под собственной Technical Identity.

**Break-glass** — exceptional explicitly activated privileged capability с усиленной assurance, ограниченными scope/time, reason, audit и обязательным termination/review. Оба понятия отличны от impersonation, Subject Representation и Domain Power.

---

# 144. Secret Reference и Secret Material

**Secret Reference** — opaque technical handle на защищённый secret с owner/purpose/scope/version/lifecycle metadata. Он не является normal plaintext retrieval capability.

**Secret Material** — защищённое credential/key-sensitive value, доступное только authorized runtime use. Оно не является ordinary configuration и никогда не включается в logs, Security Audit или domain provenance.

---

# 145. Security Audit

**Security Audit** — append-oriented technical record security-sensitive operations с безопасной attribution, scope, target, reason/correlation и result metadata.

Security Audit не является domain history/provenance, operational log/metric/trace или universal domain Audit Event. User/Community security views являются purpose-filtered projections, а не raw Security Audit.

---

# 146. Persistent Work, Operation и Attempt

**Persistent Work** — durable technical work, obligation и state которой сохраняются при потере process. Один **Persistent Work Item** представляет одну stable **Operation**; в этом common runtime contract stable Persistent Work identity является stable Operation identity. Retry или допустимый Resume сохраняет Operation identity и создаёт отдельную **Attempt** identity.

Materially new intent, Correction, Replacement или deliberate new Replay создают новую linked Operation. Persistent Work не является universal domain Job, universal Workflow или новым bounded context.

---

# 147. Durable Delivery Record и Transactional Outbox

**Durable Delivery Record** — technical record delivery/publication obligation с собственной delivery identity. Он не является semantic Event/fact или Persistent Work Operation.

**Transactional Outbox** или semantic equivalent атомарно фиксирует local state transition и required durable publication/continuation intent в одной local ACID transaction. Dispatch после commit может повторяться.

---

# 148. Idempotency и Inbox / durable duplicate recognition

**Idempotency** — свойство qualified effect/Operation boundary, при котором повторное исполнение не создаёт непреднамеренный дополнительный effect. Equal payload или hash сами по себе не доказывают duplicate.

**Inbox** — один из возможных technical mechanisms durable duplicate recognition. Он не является universal mandatory component: допустимы authoritative local uniqueness, guarded transition или другой semantically equivalent mechanism.

---

# 149. Known Success, Known Failure и Unknown Outcome

**Known Success**, **Known Failure** и **Unknown Outcome** — разные состояния знания о результате effect. Unknown Outcome не является success или failure и не превращается автоматически в failure после определённого числа retries; он может требовать provider idempotency/status, independent evidence/reconciliation или attributable manual resolution.

---

# 150. Terminal / Quarantined Persistent Work

**Terminal / Quarantined Persistent Work** — condition, в котором automatic processing остановлен и требуется explicit resolution. Work, её identity, Attempt history и causation не удаляются. Resume сохраняет Operation identity только при сохранении того же unresolved obligation, intent и idempotency boundary; иначе создаётся linked new Operation.

Quarantined не означает автоматически Cancelled, Compensated или forever impossible.

---

# 151. Cancellation Request

**Cancellation Request** — запрос прекратить future execution на explicit safe boundary. Cancellation Requested не означает, что execution уже остановлено, и не является Compensation. Committed local/external effects не отменяются автоматически; Compensation/Correction является отдельным context-owned и historically traceable action.

---

# 152. Failure Domain

**Failure Domain** — infrastructure scope, внутри которого общий physical/operational failure может одновременно нарушить доступность нескольких components или Placements. Failure Domain не тождествен Region: один Region может содержать несколько Failure Domains. Он не является Community, Tenant, bounded context или гарантией независимого выживания каждой Community в Shared Placement.

---


---

## 20. Current Stage 11 entry in REFERENCE_CANDIDATE_MATRIX

### Этап 11. Электронное подписание и удалённое участие

**Состояние:** в работе; начат подэтап 11A «электронное подписание». Подготовлен current-law/reference анализ `UKRAINE_ELECTRONIC_SIGNING_LEGAL_ANALYSIS.md` по состоянию на 2026-09-21.

Сначала исследуется электронное подписание, при этом базовая предметная семантика ADR-009 не пересматривается без необходимости:

- что именно подписывается;
- какой Revision/Representation;
- кто подписант;
- от собственного или чужого имени;
- основание полномочия;
- какой внешний результат является evidence;
- как выполняются validation и domain recognition внешней подписи;
- что хранится для последующей проверяемости;
- актуальные правовые требования.

Первичный legal/reference анализ подтверждает:

- КЭП является одной из правовых категорий электронной подписи и имеет силу собственноручной подписи согласно Закону № 2155-VIII;
- электронный документ и его оригинал регулируются отдельно Законом № 851-IV;
- `Дія.Підпис` является provider/technical mechanism КЭП, а не источником Domain Power/Voting Right;
- формулировка «электронний підпис, що базується на кваліфікованому сертифікаті» не должна автоматически сужаться до «только КЭП»;
- для ОСББ/собственников многоквартирного дома законодательство допускает дистанционное участие по видеоконференции и электронные листки письменного опроса с подписью на квалифицированном сертификате;
- для пилотного СТ нельзя переносить ОСББ-процедуру универсально до проверки организационно-правовой формы и статута конкретного СТ.

**Результат stress-test 11A:** существующего ADR-009 понятия `Signing` достаточно как fundamental domain action. Отдельные fundamental `Electronic Signing`, `Signing Evidence` и `Signature Validation` сейчас не обоснованы. Для electronic Signing требуется явный evidence/provenance package, historical validation/revalidation context и distinction semantic target vs exact cryptographic target.

Подготовлен Draft `BP-SIGN-001 — Электронное подписание документа / Electronic Document Signing`.

**Принятое продуктовое требование Stage 11B для первого пилота СТ:** Community OS должна поддерживать дистанционное участие и юридически пригодное подписанное электронное волеизъявление/голосование (включая КЕП и provider mechanisms вроде Дія.Підпис) для владельцев/допустимых реализаторов права, которые физически отсутствуют, в том числе находятся за границей. Это не означает автоматического переноса ОСББ procedure или автоматической legal validity любого signed Vote: конкретный legal/governance profile должен определить quorum/presence, eligibility, permissible remote/asynchronous modes, signature class и formalization.

Отдельно выявлен потенциально критичный legal-profile check: если пилотное СТ является кооперативом, необходимо сопоставить текущий project rule `1 участок = 1 голос` с императивными нормами Закона «Про кооперацію», где базово закреплён принцип `1 член кооператива = 1 голос`.

После анализа устава СТ «ЕКСПРЕС» и уточнения фактической практики выполнен отдельный stress-test `Membership ↔ Plot ↔ Voting Right`.

Зафиксировано:

- устав требует письменного заявления, решения о приёме и последующего утверждения, но прямо не определяет «множественное членство» одного физического лица;
- сообщённая практика СТ трактует отдельное заявление по каждому участку как отдельное членство/голос;
- Community OS не должна создавать несколько Subjects/User Accounts или считать несколько заявлений автоматическим доказательством нескольких юридически самостоятельных Membership;
- существующая ADR-001 модель уже позволяет одному Subject реализовывать несколько Voting Rights;
- текущую практику `1 участок = 1 голос` следует выражать через applicable Voting Rule и qualifying Plot/Membership bases;
- новый fundamental `Membership Admission`, `Membership Slot` или `Membership Unit` по stress-test не требуется;
- несколько исторических application/admission/basis records должны сохраняться без потери provenance;
- возможность нескольких simultaneous Membership одного Subject остаётся profile-specific и требует самостоятельной legal semantics, а не выводится из количества заявлений;
- legal validity текущей практики «множественного членства» остаётся focused pilot legal question.

**Следующий шаг 11A:** independent multi-review Draft BP-SIGN-001 → adjudication → минимальная normative sync при подтверждении модели.

После закрытия 11A Stage 11B не откладывается: он является обязательным пилотным процессом remote participation/electronic voting и должен быть спроектирован как profile-driven Governance process. При проектировании Stage 11B Voting Rights формируются из applicable versioned Voting Rule, а не из количества заявлений или User Accounts.

---

## 21. Pilot facts that reviewer must not silently reinterpret

From supplied 2016 charter scans and reported operating practice:

- charter p. 7.3: admission is based on written application; board decides with later assembly approval;
- charter p. 8.1: a member has governance participation and voting rights;
- charter p. 14.1.6: each member/authorized representative has one vote;
- charter p. 14.1.6 also describes proxy/transfer practice;
- charter does not explicitly define simultaneous multiple Membership of one physical person;
- reported practice: one application per plot, including several applications from the same owner, is treated internally as «multiple membership» and is used to implement one vote per plot.

These facts are inputs. The review may identify legal/domain conflicts but must not convert the reported practice into a universal legal conclusion.

---

## 22. Review discipline

При review:

- различай **Signing fact** и cryptographic evidence;
- различай **valid signature** и **authorized/admissible action**;
- различай **historical validity/recognition** и current certificate/trust state;
- не вводи universal Evidence entity без independent identity/lifecycle;
- не превращай external provider transaction в domain action автоматически;
- не создавай Document только для переиспользования Signing, если реальный process не имеет document semantics;
- не превращай КЕП/Дія.Підпис в Voting Right;
- не превращай несколько заявлений одного человека в несколько Subjects;
- не объявляй несколько заявлений несколькими legally independent Membership без source-supported basis;
- не отменяй pilot «1 участок = 1 голос» только ради архитектурного удобства: моделируй его как profile/rule candidate и отдельно отмечай legal risk;
- не проектируй код/DB/API/UI/crypto stack;
- при замечании указывай конкретный раздел Draft и конкретный источник из package;
- предпочитай minimal point fix, если fundamental model остаётся корректной.

