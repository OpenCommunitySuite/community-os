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

Для пилотного садового товарищества Stage 11A не предполагает, что ОСББ rules применимы.

До юридически значимого remote voting необходимо определить:

- legal form pilot ST;
- applicable law;
- charter;
- procedure requirements;
- acceptable electronic participation/signature form.

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
