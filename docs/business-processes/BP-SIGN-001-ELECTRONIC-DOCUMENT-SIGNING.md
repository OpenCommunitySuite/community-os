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

Каждое предметно значимое Signing имеет собственную historical identity, возникающую при domain recognition конкретного действия подписания.

Identity Signing не определяется:

- certificate serial alone;
- signature bytes/hash alone;
- User Account;
- provider transaction ID;
- file name;
- timestamp;
- парой `signer + target`;
- Document status `signed`.

Одна Revision/Representation может иметь несколько independent Signing facts.

Один и тот же Subject также может иметь несколько distinct Signings по одному semantic target, если applicable signing policy признаёт их разными историческими действиями, например при повторном подписании после correction либо при новом требуемом signature class. Это вопрос policy и истории действий, а не deduplication identity.

Redelivery/duplicate external result не становится новым Signing автоматически и рассматривается отдельно по ADR-011.

## 8. Multiple signers

Если одну Revision/Representation подписывают несколько Subjects:

```text
target
├─ Signing S1 by Subject A
├─ Signing S2 by Subject B
└─ Signing S3 by Subject C
```

Не вводится universal source-of-truth aggregate status `signed=true`, который скрывает individual Signing identities.

Document-kind/signing policy может определять required signer composition, порядок и условия достаточности подписей, но это не меняет identity отдельных Signing facts.

Производное представление вида `Partially Signed` / `Fully Signed` допустимо как Read Model / Projection по ADR-013, если оно вычисляется из текущих применимых Signing facts и applicable policy. Такая projection не является source of truth и не заменяет individual Signings.

## 9. Semantic target и cryptographic target

Для электронного подписания следует различать:

- **semantic target** — Document Revision либо specific Document Representation, которую Subject подписывает в предметном смысле;
- **exact cryptographic target** — точные electronic data, криптографически покрытые external electronic signature.

Например:

```text
semantic target = Document Revision R1
exact cryptographic target = electronic data of PDF Representation P1
```

Exact cryptographic target может совпадать с domain Representation либо быть конкретным technical artifact/data binding, который сам по себе не становится Document Representation.

Document/signing policy определяет, когда valid electronic signature над конкретными data/Representation является достаточным Signing semantic target Revision/Representation.

Связь с Revision не означает, что все настоящие или будущие Representations этой Revision автоматически считаются подписанными.

## 10. Exact signed content

Для recognized electronic Signing должно быть исторически определимо, какие именно electronic data были криптографически подписаны и как они связаны с semantic target.

Недостаточно хранить только:

- текущий PDF;
- имя файла;
- Document ID;
- Revision ID;
- provider transaction ID.

Нужно сохранять/иметь возможность восстановить exact cryptographic target и проверяемую связь evidence с ним и с semantic target.

Если exact signed data представлены техническим file/artifact, такой file/artifact не становится автоматически Document Representation или Document.

Конкретная граница подписанных байтов/данных определяется semantics применимого signature format/container. Поэтому нельзя универсально считать cryptographic target «хешем итогового файла целиком».

Технический способ — hash, immutable artifact, signed container, detached signature binding или иной mechanism — относится к implementation/integration design, не к настоящему BP.

## 11. Representation change

Если semantic target связан с Revision R1, а exact cryptographic target — данные Representation P1, создание новой Representation P2 не переносит на неё cryptographic coverage или Signing автоматически.

```text
Signing over exact data of P1
≠ P2 signed automatically
```

Applicable document/signing policy может определять предметные последствия Signing для Revision, но не может задним числом сделать новые electronic data частью прежнего cryptographic target.

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

Domain admissibility полномочия/представительства оценивается относительно исторического момента или периода, который applicable policy считает значимым для данного Signing. Это может быть trustworthy signature time, иной доказанный action/effective time либо другой policy-defined reference time, если trusted timestamp отсутствует.

Последующее прекращение полномочия не переписывает признанное историческое Signing молча. Если более поздний факт или решение имеет ретроспективные последствия, они применяются через явный review/correction согласно ADR-004/005/010, а не через оценку прошлого по текущему состоянию полномочий.

## 16. Provider result не является Signing

```text
provider callback / signed artifact
≠ recognized Signing
```

Для Signing используется специализация общей последовательности ADR-011:

```text
external information
→ received information
→ validation / mapping
→ signer + target interpretation
→ domain admissibility
→ Signing recognition or rejection
```

Разделение validation, mapping, signer/target interpretation и domain admissibility является specialization для electronic Signing и не заменяет общую ADR-011 semantics.

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

Applicable signing policy является context-specific rule либо композицией правил в смысле ADR-005, а не universal `Signing Policy` entity.

Она может определять, где применимо:

- какие Subjects/roles/bases допускаются;
- какие signatures/method classes приемлемы;
- должен ли semantic signing target быть Revision или specific Representation;
- какие exact cryptographic target/data bindings приемлемы;
- сколько подписантов требуется;
- порядок signing;
- необходимость timestamp/trust evidence;
- допустимость remote provider;
- consequences invalid/expired/revoked evidence;
- document-kind/legal requirements.

Для recognized Signing фактически применённая версия правила/композиции правил должна быть исторически определима, если её изменение могло повлиять на validation, admissibility, recognition или последствия Signing.

Universal one-size-fits-all signing policy не вводится.

## 19. Electronic signature classes

Community OS не предполагает один universal required class электронной подписи для всех Communities, document kinds и procedures.

Applicable signing/legal profile определяет требуемый signature class/method согласно применимому праву и конкретной procedure/document semantics.

Конкретные юридические категории и их соотношение в Украине вынесены в:

- `docs/references/UKRAINE_ELECTRONIC_SIGNING_LEGAL_ANALYSIS.md`.

BP-SIGN-001 не превращает юрисдикционную терминологию в universal domain taxonomy.

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

Этот перечень специализирует ADR-011 provenance requirements для electronic Signing и не заменяет их.

Он может включать, где применимо:

- semantic target Revision/Representation;
- exact cryptographic target / exact signed data binding;
- reference to Document Representation where applicable;
- external signature artifact/container;
- signature class/method;
- signer identity established by validation;
- provider/trust-service context;
- certificate/signing identifiers;
- claimed/provided signature time;
- trusted timestamp evidence where applicable;
- validation time/result;
- trust/certificate status relevant to validation;
- trust-list / validation policy identifier/version used for validation, where applicable;
- applicable signing policy/rule version(s) used for recognition;
- mapping to Subject;
- authority/admissibility basis and historically used values/time context where applicable;
- source/integration provenance.

Перечень не является universal storage schema.

Если какой-либо technical file/artifact включён в evidence, это не превращает его автоматически в Document Representation.

Изменение текущей trust list, signing policy или иных правил не переписывает молча provenance первоначального recognition.

## 22. Fundamental Signing Evidence entity не вводится

Electronic signing evidence требуется семантически, но этого недостаточно для введения отдельной fundamental `Signing Evidence` entity.

Рабочая модель:

```text
Signing
→ evidence/provenance package
→ 0..N validation observations/history
```

Evidence может быть связано с:

- Document Representation, если signed data сами имеют такую domain semantics;
- technical file/artifact/container, который не становится Representation автоматически;
- received integration information;
- confirming information;
- provenance конкретного Signing.

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

Если validation является historically significant для конкретного process/legal policy, её result/context сохраняется как distinguishable historical observation/provenance согласно ADR-004/011. Более поздняя revalidation не переписывает первоначальную validation context молча.

Это семантическое требование к истории, а не предписание конкретного append-only storage implementation.

## 24. Revalidation

Повторная validation не создаёт новое Signing автоматически.

Revalidation может понадобиться:

- при последующей проверке документа;
- после изменения trust list;
- после certificate expiry/revocation;
- при споре;
- при migration/archive;
- при verification by another system.

Для объяснимости должны быть различимы первоначальный validation/trust context и последующий revalidation context, включая применимые policy/trust-list versions where relevant.

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

Семантическое решение о rejection относительно Signing принадлежит контексту **«Документы и формализация»** как owner Signing semantics. Достаточная received-information/evidence provenance сохраняется согласно ADR-011, если rejection исторически значим.

Transport/runtime record внешнего взаимодействия может принадлежать integration/runtime mechanism, но не становится отдельным domain Signing или universal `Integration Evidence` entity.

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
→ current applicability/effect adjusted where required
→ historical trace preserved
```

Для correction должны быть исторически объяснимы причина, момент, acting Subject/authority и последствия.

Не вводятся universal `Signing Correction` entity или обязательная universal `Recognition State` state machine. Конкретный owning process может иметь локальные correction/status semantics, если они предметно необходимы.

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

Для асинхронного provider flow integration/runtime layer может иметь собственную identity и durable state операции/сессии, необходимую для correlation, timeout, retry и reconciliation. Такая external operation/session не является Signing и не создаёт нового fundamental domain concept Stage 11A.

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

Если несколько Subjects реализуют разные Voting Rights, applicable Stage 11B/legal profile может потребовать несколько independent Signings даже при общем document/ballot target. Это не меняет identity Voting Rights или Signings.

Точные relations определяет Stage 11B/legal profile.

## 38. Vote без Document

Stage 11A не создаёт artificial Document только для того, чтобы воспользоваться document-scoped Signing model ADR-009.

Настоящий BP регулирует **только Signing Document Revision / Representation**.

Если future Governance profile допускает electronic Vote или иное signed Governance action без independent Document semantics, Stage 11B должен отдельно решить:

- требуется ли обобщение target semantics существующего `Signing` с соответствующим нормативным изменением;
- либо Governance владеет отдельным action/evidence concept, использующим общие validation/provenance/recognition patterns без identity reuse.

Этот вопрос **не решён Stage 11A**. Нельзя ни создавать фиктивный Document, ни заранее считать document-scoped Signing универсально reusable для non-document actions.

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

Stage 11A сохраняет только document-scoped Signing semantics. Способ доказательства documentless signed Vote, если такой mode будет допустим профилем, является отдельным открытым вопросом Stage 11B.

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

1. Signing has own historical identity, assigned by domain recognition of a concrete signing act.
2. Signing identity is not derived from `signer + target` uniqueness.
3. Electronic signature artifact ≠ Signing.
4. Authentication ≠ Signing.
5. Electronic identification ≠ Signing.
6. Cryptographic validity ≠ Domain Power.
7. User Account ≠ signer Subject automatically.
8. Certificate/provider identity ≠ Community OS Subject automatically.
9. Semantic target and exact cryptographic target remain distinguishable.
10. Exact cryptographic target/data binding may be technical evidence and does not become Document Representation automatically.
11. Electronic Signing keeps historically explainable exact signed content.
12. Signing one exact cryptographic target does not sign another Representation/data automatically.
13. New Revision does not inherit prior Signing.
14. Multiple signers create distinct Signings.
15. The same Subject may have multiple distinct Signings over the same semantic target when policy recognizes distinct acts.
16. External provider result requires ADR-011 recognition.
17. Redelivery ≠ new Signing automatically.
18. Unknown outcome ≠ successful Signing.
19. Revalidation ≠ new Signing.
20. Later validation does not silently overwrite original validation context.
21. Current expiry/revocation/trust state does not silently rewrite historical Signing.
22. Current Domain Power state does not silently replace the historical authority/admissibility context used for Signing.
23. Invalid evidence does not create recognized Signing.
24. Correction does not silently delete historical recognition.
25. Signing method/provider does not create Domain Power.
26. Signing ≠ Approval ≠ Registration ≠ Publication.
27. Signing ≠ Vote ≠ Voting Right.
28. Signed Vote-related Document ≠ Vote.
29. Document-scoped Signing ADR-009 is not assumed to cover documentless Governance actions.
30. Signature format/container ≠ domain identity.
31. Applicable signing rule/policy version(s) used for recognition must be historically determinable per ADR-005 where material.
32. Relevant validation/trust policy/list context must be historically determinable where material.
33. A derived document signing-completeness status may exist only as Read Model / Projection and does not replace individual Signings.
34. Universal fundamental Signing Evidence entity is not introduced.
35. Universal fundamental Signature Validation entity is not introduced.
36. Legal/profile-specific required signature class is not universalized.
37. ОСББ remote/electronic rules are not transferred automatically to pilot ST.

## 43. Нормативные последствия Draft

Independent multi-review Round 1 (Claude + Gemini + DeepSeek) подтвердил базовую Stage 11A модель: отдельные fundamental `Electronic Signing`, `Signing Evidence` и `Signature Validation` не требуются, а conceptual redesign document-signing model не нужен.

После adjudication уточнено:

- ADR-009 Signing остаётся **document-scoped** fundamental historical action;
- claim о universal reuse Signing для documentless Vote снят; это open Stage 11B question;
- Signing имеет positive identity semantics и не определяется `signer + target` uniqueness;
- semantic target и exact cryptographic target строго различаются;
- technical artifact/file не становится Representation автоматически;
- applicable signing rule/policy versions и validation/trust context должны быть historically determinable where material;
- historical Domain Power/admissibility оценивается по applicable historical time semantics, а не текущему состоянию;
- validation/revalidation history не переписывается молча;
- semantic ownership rejection относительно Signing принадлежит Documents/Formalization; transport/runtime state остаётся integration/runtime concern;
- asynchronous external operation/session may exist technically for reconciliation, but is not Signing;
- Signing correction сохраняет historical trace без universal Correction entity/state machine;
- derived `Fully Signed`/similar status допустим только как ADR-013 Projection;
- direct signed non-document action/Vote остаётся Stage 11B design question;
- Membership/Plot/Voting Right pilot finding не требует новых fundamental membership entities.

Это остаётся Draft до нормативной синхронизации и решения владельца проекта.

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

1. independent multi-review Round 1 — завершён;
2. reviewer findings adjudicated; point fixes применены;
3. выполнить минимальную normative sync DOMAIN_MODEL / TERMINOLOGY для Signing semantics и Membership admission/basis clarification;
4. зафиксировать multi-review consolidation и обновить Stage 11 status;
5. full Round 2 не требуется, если sync не вводит новую identity/ownership/model semantics;
6. после принятия Stage 11A перейти к Stage 11B — remote participation and electronic voting, начиная с unresolved documentless signed-action boundary и pilot legal/governance profile.

