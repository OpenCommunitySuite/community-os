# PR #73 / BP-SIGN-001 — Independent Multi-Review Consolidation

**Статус:** Round 1 consolidated / point fixes applied / proposed normative synchronization performed in PR  
**PR:** #73 — `docs: define Stage 11A electronic document signing`  
**Base package:** `BP-SIGN-001-INDEPENDENT-MULTI-REVIEW-PACKAGE.md`  
**Reviewers:** Claude, Gemini, DeepSeek  
**Review date:** 2026-09-22  
**Review mode:** предметно-архитектурный stress-review; code/DB/API/UI/crypto implementation и окончательная legal validity конкретного pilot Voting Rule вне scope.

## 1. Источники review

Round 1 выполнен тремя независимыми рецензентами по одному frozen review package:

- Claude — `claude_BP-SIGN-001-INDEPENDENT-REVIEW.md`;
- Gemini — `gemini_stress_review_bp_sign_001.md`;
- DeepSeek — `deepseek_markdown_20260922_816d68.md`.

Raw review files не добавляются в repository. Настоящая consolidation фиксирует findings и adjudication against current source of truth.

## 2. Общий результат

Два reviewer не выявили BLOCKER и прямо дали итог `point fixes sufficient`. Claude обозначил один BLOCKER как внутреннее противоречие формулировки Draft: ADR-009 определяет document-scoped Signing, а §40 ошибочно называл ту же модель универсально reusable для будущего documentless Vote. Сам Claude при этом указал, что исправление требует wording/open-question fix, а не conceptual redesign.

После adjudication общий вывод:

- conceptual redesign Stage 11A **не требуется**;
- существующий ADR-009 `Signing` достаточен для **document-signing scope**;
- отдельные fundamental `Electronic Signing`, `Signing Evidence`, `Signature Validation` не требуются;
- direct signed non-document action/Vote **не считается уже решённым** существующим Signing и остаётся design question Stage 11B;
- semantic target и exact cryptographic target должны быть явно различены;
- cryptographic validity ≠ Subject mapping ≠ Domain Power/admissibility;
- signing-policy/rule versions и material validation/trust context должны быть исторически определимы;
- revalidation не создаёт новое Signing и не переписывает initial validation/recognition;
- external provider/session state может существовать на integration/runtime уровне, но не является Signing;
- correction ошибочно recognized Signing требует явной исторической semantics, но не универсальной Correction entity/state machine;
- derived signing completeness допустим как ADR-013 Projection;
- pilot `Membership ↔ Plot ↔ Voting Right` model выдерживает review без новых Membership entities.

## 3. Adjudication matrix

| ID | Finding | Reviewers | Решение |
|---|---|---|---|
| S-01 | Existing ADR-009 `Signing` достаточен для electronic document signing | Claude, Gemini, DeepSeek | **Принять.** Electronic form остаётся specialization/use case existing document Signing. |
| S-02 | Draft противоречиво называл document-scoped Signing «universal reusable» для documentless Vote | Claude BLOCKER, Gemini MAJOR | **Принять concern.** Claim удалён. Stage 11A регулирует только Document Revision/Representation Signing. Stage 11B отдельно решит generalization target semantics либо Governance-owned action/evidence concept. ADR-009 сейчас не обобщается. |
| S-03 | Semantic target / exact cryptographic target недостаточно жёстко разделены | Gemini MAJOR, DeepSeek MINOR/OBSERVATION | **Принять concern, отклонить literal prescription “Signing primary target always Representation”.** ADR-009 разрешает semantic target Revision или Representation. Exact cryptographic target всегда конкретные electronic data; они могут соответствовать Representation либо technical artifact/data binding. Новая Representation не наследует cryptographic coverage. |
| S-04 | Technical file/artifact может быть ошибочно принят за Representation | DeepSeek MINOR | **Принять.** File/artifact не становится Representation/Document автоматически; evidence relation уточнена. |
| S-05 | Signing identity определена только отрицательно; same Subject/same target re-signing не покрыт | Claude MAJOR, DeepSeek OBSERVATION | **Принять.** Identity возникает при domain recognition отдельного historical signing act; не выводится из `signer+target`. Policy может разрешить несколько distinct Signings одного Subject по одному semantic target. |
| S-06 | Applicable signing policy/version не зафиксирована исторически | DeepSeek MAJOR+MINOR, Claude OBSERVATION | **Принять.** Signing policy трактуется как context-specific rule/composition по ADR-005; material version(s) должны быть historically determinable для recognized Signing. Universal `Signing Policy` entity не вводится. |
| S-07 | Trust-list / validation policy version нужна для revalidation explainability | DeepSeek MINOR | **Принять.** Material trust/validation policy/list context добавлен в provenance; initial и later revalidation context различаются. |
| S-08 | Authority/Representation нужно оценивать во времени | Gemini MAJOR | **Принять concern, сузить prescription.** Не вводится universal правило «строго trusted T_sign»: applicable policy определяет historical reference time/period (trusted signature time, иной доказанный effective/action time и т.п.). Current authority state не переписывает прошлое; retroactive effects идут через explicit review/correction. |
| S-09 | Validation observations должны сохранять историю | Gemini MINOR | **Принять semantics, отклонить storage prescription.** Later revalidation не overwrites initial validation context. Universal entity и mandatory append-only implementation не вводятся. |
| S-10 | Correction ошибочно recognized Signing недостаточно конкретна | Gemini MAJOR | **Принять concern, отклонить universal `Recognition State` / `Correction Record`.** Correction сохраняет reason/time/actor/effect и original history; local owning process может иметь status semantics при необходимости. |
| S-11 | Ownership rejected/unrecognized evidence не определён | Claude MAJOR | **Принять с разделением semantics/runtime.** Rejection относительно Signing принадлежит Documents/Formalization; transport/runtime received-information record может принадлежать integration/runtime mechanism. Generic Evidence entity не вводится. |
| S-12 | Async provider flow требует correlation/reconciliation state | Gemini MAJOR | **Принять как integration/runtime requirement, не domain entity.** External operation/session может иметь technical/durable identity/state для callback correlation, timeout/retry/reconciliation; это не Signing и не новый Stage 11A fundamental concept. |
| S-13 | ADR-011 pipeline restated как будто canonical, хотя это specialization | Claude MINOR | **Принять.** BP теперь прямо называет signer/target/admissibility split specialization общей ADR-011 sequence. |
| S-14 | ADR-013 был dangling reference; нужна signing-completeness projection | Claude MINOR, Gemini OBSERVATION | **Принять.** `Partially/Fully Signed` допустимы только как derived Read Model/Projection, не source-of-truth aggregate. |
| S-15 | Specific Ukrainian signature-class interpretation не должна жить в universal BP | DeepSeek OBSERVATION | **Принять.** BP оставлен jurisdiction-neutral; детали вынесены/сохранены в `UKRAINE_ELECTRONIC_SIGNING_LEGAL_ANALYSIS.md`. |
| S-16 | PAdES ByteRange требует специальной формулировки | Gemini MINOR | **Принять underlying concern, отклонить format-specific implementation detail.** BP говорит, что exact cryptographic target определяется semantics конкретного signature format/container и не равен универсально hash итогового файла целиком. PAdES ByteRange не закрепляется как domain rule. |
| S-17 | Provenance list должен явно специализировать ADR-011 | Claude OBSERVATION | **Принять.** Добавлен explicit cross-reference; список не universal schema. |
| S-18 | Direct signed Vote без Document может создать parallel signing-like concept | Claude BLOCKER/F1, Gemini MAJOR | **Принять как Stage 11B input.** Ни fake Document, ни premature `Signed Action` в Stage 11A. Stage 11B обязан решить ownership/identity до проектирования documentless signed Vote. |
| S-19 | `Vote ↔ Document ↔ Signing` identities должны оставаться раздельными | Все reviewers | **Принять.** Existing boundary сохраняется. |
| S-20 | Co-ownership / several Voting Rights may require several Signings over shared ballot | Claude OBSERVATION | **Принять как cross-context note.** §37 указывает, что Stage 11B/legal profile может требовать independent Signings нескольких Subjects при общем ballot target. |
| S-21 | Pilot `1 участок = 1 голос` не должен кодироваться copies of Subject/User Account/Membership | Все reviewers | **Принять.** Existing ADR-001 supports one Subject → multiple Voting Rights; legal validity конкретного pilot rule остаётся profile-specific. |
| S-22 | Нужны ли `Membership Admission`, `Membership Slot`, `Membership Unit` | Все reviewers | **Отклонить введение.** Independent identity/lifecycle не доказаны. Historical applications/decisions/bases сохраняются без новых fundamental entities. |
| S-23 | DOMAIN_MODEL/TERMINOLOGY не говорят явно, что several admission bases ≠ several Memberships | DeepSeek OBSERVATION | **Принять.** Выполнена минимальная normative sync в Draft branch. |
| S-24 | Flexible Voting Rule/legal profile нужен для member-based vs object-based pilot semantics | Gemini MAJOR | **Принять boundary, не вводить новый engine/entity.** ADR-001/005 уже задают versioned Voting Rule semantics. Legal profile выбирает применимое правило; Community OS не маскирует legal conflict. |

## 4. Принятые point fixes в BP-SIGN-001

Point fixes applied:

- positive Signing identity semantics;
- same-Subject/same-target distinct re-signing where policy permits;
- ADR-013 signing-completeness projection;
- strict semantic target vs exact cryptographic target boundary;
- technical artifact/file ≠ Representation automatically;
- format-neutral exact cryptographic target semantics;
- historical Domain Power/admissibility time semantics;
- ADR-011 specialization wording;
- versioned/context-specific signing rules per ADR-005;
- signing-policy and validation/trust versions in provenance;
- initial-vs-revalidation historical distinction;
- Documents ownership of Signing rejection semantics;
- integration/runtime external operation/session distinction;
- correction semantics without universal state machine/entity;
- document-scoped boundary for `Signing`;
- explicit Stage 11B open question for documentless signed action;
- co-owner/multiple-signer cross-context note;
- jurisdiction-specific signature-class interpretation removed from universal BP.

## 5. Proposed normative synchronization

Минимальная sync выполнена в Draft branch без изменения ADR:

### DOMAIN_MODEL

Добавлено:

- electronic Signing semantic target vs exact cryptographic target;
- technical artifact/file ≠ Representation automatically;
- provider result requires ADR-010/011 recognition;
- cryptographic validity ≠ Domain Power;
- historical rule/trust/admissibility provenance;
- revalidation semantics;
- multiple distinct Signings;
- derived signing-completeness Projection;
- no universal `Electronic Signing` / `Signing Evidence` / `Signature Validation`;
- Membership may have several historical bases/acts;
- several bases do not automatically create several simultaneous Memberships/Voting Rights;
- several Membership relation instances require independent community/legal semantics.

### TERMINOLOGY

Расширены:

- `42.5 Подписание документа`;
- `88 Членство`.

Новые fundamental terms/entities не добавлены.

### ADR

Изменения ADR-001/004/005/008/009/010/011/013 **не требуются**. Review findings укладываются в уже принятые принципы этих ADR.

## 6. Reviewer prescriptions, которые не приняты буквально

### 6.1. «Primary immutable target Signing всегда Representation»

Не принимается.

ADR-009 прямо определяет Signing над Revision **или** specific Representation. Для electronic Signing exact cryptographic target действительно является конкретными electronic data, но semantic target может оставаться Revision. Поэтому исправлена связь, а не изменён target type ADR-009.

### 6.2. «Domain Power проверяется строго на T_sign/trusted timestamp»

Не принимается как universal rule.

Trusted timestamp может отсутствовать, а применимая процедура может использовать другую доказанную temporal semantics. Universal invariant:

```text
authority/admissibility
→ evaluated against historically applicable reference time/period
→ according to applicable rule/policy
```

Current state не переписывает прошлое.

### 6.3. «Recognition State + Correction Record»

Не принимается как mandatory universal state/entity.

ADR-004 требует traceable correction, но не universal state machine. BP фиксирует semantic outcome/history; concrete process может иметь local status representation.

### 6.4. «External Signing Session обязана быть domain object»

Не принимается.

Для asynchronous provider interaction correlation/reconciliation state практически нужен, но он принадлежит integration/runtime mechanics. Его existence/identity не делает его `Signing` или fundamental domain entity Stage 11A.

### 6.5. «PAdES ByteRange закрепить в BP»

Не принимается как domain-level requirement.

Underlying requirement принято: exact cryptographic target определяется signature-format semantics и не равен универсально whole-final-file hash. PAdES/CAdES/XAdES details остаются technical/integration design.

### 6.6. «Validation observations должны храниться append-only list»

Не принимается как storage prescription.

Принята semantic guarantee: later validation cannot silently overwrite historically significant previous validation context.

## 7. Stage 11B inputs confirmed by review

После Stage 11A остаются обязательными:

1. решить documentless signed Governance action boundary:
   - generalize Signing target with normative change;
   - либо Governance-owned action/evidence concept;
   - не создавать fake Document;
2. сформировать pilot legal/governance profile;
3. определить legally applicable Voting Rule:
   - member-based;
   - object-based/mixed if legally valid;
4. определить quorum/presence semantics для remote/mixed procedure;
5. определить signed ballot/document requirements;
6. сохранить `Vote ≠ Document ≠ Signing`;
7. не моделировать «множественное членство» copies of Subject/User Account.

## 8. Round 2

Полный Round 2 Stage 11A не требуется, если дальнейшая sync не вводит:

- generalized non-document `Signing`;
- fundamental `Signing Evidence`;
- fundamental `Signature Validation`;
- universal `Signing Correction` / Recognition State machine;
- new Membership identity semantics;
- changes to ADR-001/008 Voting ownership;
- changes to ADR-009 document boundary.

Если один из этих пунктов появится, нужен focused second review.

## 9. Result

После Claude + Gemini + DeepSeek review и adjudication:

- исходная document-signing architecture сохранена;
- один Claude BLOCKER устранён как internal wording/boundary contradiction;
- conceptual redesign Stage 11A не требуется;
- point fixes sufficient;
- proposed normative sync DOMAIN_MODEL/TERMINOLOGY выполнена;
- ADR rewrite не требуется;
- Stage 11A готов к final consistency/readiness check;
- Stage 11B остаётся обязательным следующим этапом и получает явный unresolved input по documentless signed action.
