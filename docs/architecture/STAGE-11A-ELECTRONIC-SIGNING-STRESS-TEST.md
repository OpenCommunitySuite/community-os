# Stage 11A — Electronic Signing stress-test

**Статус:** Working analysis / stress-test completed / reviewed in BP-SIGN-001 Round 1 / not normative  
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

Текущей фундаментальной модели ADR-009/010/011 достаточно для **document-scoped Signing**.

Independent multi-review BP-SIGN-001 подтвердил, что не требуется:

- новый bounded context;
- `Electronic Signing` как новый fundamental subtype;
- universal `Signing Evidence` entity;
- universal `Signature Validation` entity;
- provider-specific `Diia.Signature` domain entity;
- изменение Governance Voting model.

После review уточнено:

- semantic target Revision/Representation и exact cryptographic target electronic data различаются;
- exact cryptographic target не обязан быть отдельной domain Representation;
- applicable signing rule/policy versions и material validation/trust context должны быть historically determinable;
- same Subject может иметь несколько distinct Signings по одному semantic target, если policy признаёт разные signing acts;
- later revalidation не overwrites initial validation context;
- document-scoped Signing **не считается автоматически reusable** для documentless signed Governance action.

Последний вопрос остаётся входом Stage 11B:

```text
documentless signed Governance action
→ generalized Signing target?
or
→ Governance-owned action/evidence concept?
```

Stage 11A не решает это преждевременно и не создаёт fake Document.

## 8. Следующий шаг

Draft `BP-SIGN-001 — Electronic Document Signing` подготовлен, прошёл independent multi-review Round 1 и point-fix adjudication.

Дальше:

1. final consistency/readiness check Stage 11A;
2. решение владельца проекта о принятии/merge;
3. затем Stage 11B remote participation/electronic voting, начиная с unresolved documentless signed-action boundary и pilot legal/governance profile.
