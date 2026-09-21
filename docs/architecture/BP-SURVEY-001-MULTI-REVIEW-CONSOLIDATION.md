# PR #71 / BP-SURVEY-001 — Independent Multi-Review Consolidation

**Статус:** Round 1 consolidated / point fixes applied / proposed normative synchronization performed in PR  
**PR:** #71 — `docs: draft informal survey business process`  
**Base package:** `BP-SURVEY-001-INDEPENDENT-MULTI-REVIEW-PACKAGE.md`  
**Reviewers:** Claude, Gemini, DeepSeek  
**Review mode:** предметно-архитектурный stress-review; код/БД/API/UI и concrete legal/privacy implementation вне scope.

## 1. Источники review

Round 1 выполнен тремя независимыми рецензентами по одному frozen package:

- Claude — `claude_BP-SURVEY-001-INDEPENDENT-REVIEW.md`;
- Gemini — `gemini_independent_architecture_review_bp_survey_001.md`;
- DeepSeek — `deepseek_markdown_20260921_87c0f9.md`.

Raw review files не добавляются в repository. Настоящая consolidation фиксирует findings и adjudication against current source of truth.

## 2. Общий результат

Все три reviewer сходятся по фундаментальным вопросам:

- BLOCKER нет;
- conceptual redesign не требуется;
- `Survey` требует самостоятельной stable identity;
- `Survey Response` требует самостоятельной stable identity;
- `Survey Item` достаточно как локально identity-bearing часть конкретного Survey, а не fundamental top-level entity;
- owner Survey semantics — существующий context «Коммуникации и обращения»;
- `Survey ≠ Voting`, `Survey Response ≠ Vote`;
- `Survey Right`, `Survey Participant`, `Survey Eligibility Snapshot` не требуются;
- universal `Survey Result` не требуется;
- fundamental `Survey Definition Version` сейчас не требуется;
- aggregation остаётся derived Read Model / Projection;
- legal/privacy semantics конкретной юрисдикции должны оставаться отдельным анализом;
- достаточно point fixes.

Основные реальные gaps сосредоточены в пяти областях:

1. историческая explainability admissibility каждого accepted Response;
2. исторически определимое response-relevant значение Survey Item без premature universal version entity;
3. correction erroneous recognition отдельно от respondent modification/withdrawal;
4. явная semantics anonymity / response unit / multiplicity;
5. fixed/reproducible use survey summary при Governance и historical/document use.

## 3. Adjudication matrix

| ID | Finding | Reviewers | Решение |
|---|---|---|---|
| C-01 | `Survey` и `Survey Response` имеют самостоятельную stable identity | Claude, Gemini, DeepSeek | **Принять.** Базовая модель сохраняется. Это не Announcement/Appeal/Voting specialization и не связь `Subject→Survey`. |
| C-02 | Survey ownership должен остаться в Communications, а Governance только использует basis/input | Claude, Gemini, DeepSeek | **Принять.** Response admissibility является собственной domain admissibility Communications context по ADR-010, даже если использует ownership/membership как вход. |
| C-03 | Stable local identity Survey Item недостаточна без historical definition/applicability | DeepSeek; Claude observation; Gemini identity подтверждает | **Принять concern, без новой entity.** Для accepted Response должно быть восстановимо response-relevant значение Item: wording/options/validation/applicability. Universal Item Revision/Survey Version не вводится. |
| C-04 | Accepted Response должен сохранять historical admissibility provenance | Claude, DeepSeek | **Принять.** Фиксируются/восстанавливаются applicable policy/rule/version where applicable, response unit, bases/used values, effective time, multiplicity decision и recognition provenance. Отдельный `Survey Eligibility Snapshot` не нужен. |
| C-05 | Respondent modification/withdrawal не покрывают correction ошибочно recognized Response | Claude | **Принять с уточнением.** Вводится локальная correction semantics над той же Response identity. Ошибочно rejected external submission до recognition не является Response и идёт через ADR-011 re-evaluation/re-recognition, а не correction существующей Response. |
| C-06 | Формулировка «User Account создателя» смешивает technical account и subject attribution | Gemini | **Принять как wording/attribution fix.** Acting Subject/initiator и technical User Account различаются; оба могут быть provenance, но не определяют identity Survey. |
| C-07 | Создание/публикация Survey требует собственной subject-matter admissibility | Gemini; Claude ownership observation | **Принять.** Domain Power/relations/rules могут быть bases; technical access не создаёт admissibility. |
| C-08 | Anonymous/private/pseudonymous modes и response-unit multiplicity недостаточно разведены | Claude, Gemini, DeepSeek | **Принять.** Subject anonymity не означает отсутствие response unit. Полностью unlinked anonymous mode не может иметь domain-guaranteed identity/unit multiplicity без отдельного trusted mechanism. Fake Subject/универсальный Anonymous Token не вводятся. |
| C-09 | Ownership transfer в active Survey требует explicit multiplicity/effective-contribution semantics | Gemini | **Принять concern, отклонить закрытый список из двух стратегий и universal status.** Survey policy должна заранее определять последствия relation change. Возможны разные semantics; historical Response не переписывается. |
| C-10 | Draft слишком грубо связывал post-response definition changes с replacement Survey | Gemini, Claude, DeepSeek | **Принять concern, скорректировать prescription.** Materiality определяется semantic effect, а не типом поля. Non-material typo/presentation changes могут быть in-place с history. Period change не объявляется автоматически material/non-material. Prospective optional Item возможен только при explicit policy + historical applicability; иначе replacement. |
| C-11 | Нужно явно подтвердить отсутствие universal `Survey Definition Version` при наличии local history | Claude, Gemini, DeepSeek | **Принять.** Local history definition/applicability не равна fundamental Version entity. Versioning пересматривается только если один Survey реально должен продолжаться через materially different definition states. |
| C-12 | Replacement relation не должна выводиться из похожести Surveys | DeepSeek | **Принять.** Relation существует только при explicit предметной замене и причине. |
| C-13 | Rejected/unrecognized external submission не должна становиться Survey Response | DeepSeek | **Принять.** До domain recognition Response не существует; значимый rejection provenance остаётся ADR-011/privacy concern. |
| C-14 | «same external id = redelivery» и «edited message = modification» нельзя универсализировать | Gemini | **Принять concern, сузить prescription.** Duplicate/redelivery определяет concrete integration semantic contract. Изменённая external information после recognition может стать modification/new Response/correction/rejection согласно contract + survey policy. |
| C-15 | Current aggregation открытого Survey должна явно иметь freshness/as-of semantics | Claude | **Принять.** Mutable projection не называется итогом/Established Result. |
| C-16 | Возможна weighted/parameterized survey analytics без переноса Voting weights | DeepSeek | **Принять с жёсткой границей.** Это derived analytics по объявленной semantics; не создаёт Survey/Voting Right и при historical use требует explainable parameters/used values. |
| C-17 | Governance не должен использовать mutable live projection как significant historical basis | DeepSeek; Gemini document observation | **Принять.** Нужен fixed либо historically reproducible aggregation context/representation. Document может фиксировать его, но не становится source of truth Responses. |
| C-18 | Survey vs Appeal требует структурного объяснения | Claude | **Принять.** Item-level structure + response/multiplicity policy не принадлежат Appeal semantics ADR-009. |
| C-19 | Survey report recognition принадлежит Documents context, а поздние Response changes не переписывают old Revision | Claude, Gemini | **Принять.** Добавлена явная document ownership/history boundary. |
| C-20 | Public + fully anonymous + no binding не может обещать domain-enforced one-person/one-unit multiplicity | Claude, Gemini | **Принять.** Либо unlimited multiplicity на domain level, либо explicit binding/trusted mechanism; device/IP/cookie не становятся domain identity автоматически. |
| C-21 | ADR-002 / DOMAIN_MODEL / TERMINOLOGY требуют минимальной sync | Claude, DeepSeek | **Принять.** Sync подготовлена в PR без нового bounded context и без изменения Governance ownership. |
| C-22 | Universal `Survey Result` не нужен | Claude, Gemini, DeepSeek | **Принять.** Aggregation = derived Projection; formal/fixed output может быть reproducible summary/Document. |
| C-23 | `Survey Right` / `Survey Participant` / `Survey Eligibility Snapshot` не нужны | Claude, Gemini, DeepSeek | **Принять.** Historical admissibility provenance хранится локально на/в связи с Response, не через новую rights/snapshot model. |
| C-24 | Privacy/legal вопросы оставить отдельному анализу | Claude, Gemini, DeepSeek | **Принять.** Конкретные anonymity guarantees, retention/deletion/anonymization, personal-data visibility, external-channel legality/evidence и legal effect Survey не фиксируются настоящим BP. |

## 4. Important narrowed or rejected reviewer prescriptions

### 4.1. «User Account не может быть создателем, заменить его только Domain Power holder / Governance Body»

Принят concern, но не буквальная замена.

Community OS различает:

```text
acting Subject
≠ technical User Account
≠ Domain Power / other admissibility basis
≠ Governance Body
```

Survey может инициироваться не только Governance Body. User Account может быть технически использованной identity/provenance, но не является предметным actor сама по себе и не определяет Survey identity.

### 4.2. «Ownership transfer имеет ровно две стратегии: Static Unit Limit / Dynamic Override»

Не принимается как закрытая универсальная классификация.

Реальный invariant:

```text
response-unit multiplicity
+ relation changes during active Survey
→ applicable Survey policy must define effects
→ historical Response is not silently rewritten
```

Допустимы несколько domain-valid policies. Universal `superseded_by_transfer` status не вводится.

### 4.3. «Продление срока Survey — всегда administrative/non-material»

Не принимается как universal rule.

Продление/сокращение response period может менять admissibility population/time semantics. Materiality определяется effect + applicable policy. In-place period change допустим только при explicit policy и historical explainability.

### 4.4. «Один и тот же external id означает redelivery»

Не принимается как universal rule.

ADR-011 оставляет duplicate/redelivery semantics concrete integration contract. External identifier/content/version сами по себе не дают глобального deduplication rule.

### 4.5. «Анонимность при response-unit binding остаётся полной анонимностью»

Не принимается.

Response-unit binding может допускать indirect re-identification. Поэтому Draft теперь различает private attribution, pseudonymous binding и intentionally unlinked mode, а privacy guarantee должна быть описана честно и отдельно.

## 5. Applied point fixes

Commit `f464b6e329c1e6990b5c5ef61dc44615298013df` применил принятые point fixes в BP-SURVEY-001:

- creation/publication admissibility и ownership boundary;
- acting Subject vs technical User Account;
- historical Survey Item definition/applicability;
- admissibility provenance accepted Response;
- anonymity/private/pseudonymous + response unit;
- material/non-material change semantics без premature Survey Version;
- prospective optional Item edge case;
- explicit replacement relation;
- correction erroneous recognized Response;
- rejected external submission ≠ Response;
- contract-owned duplicate/redelivery;
- mutable aggregation freshness/as-of;
- weighted/parameterized analytics boundary;
- fixed/reproducible Governance basis;
- ownership-transfer policy requirement;
- public fully anonymous multiplicity boundary;
- Survey vs Appeal structural distinction;
- Document ownership/history boundary;
- расширенные stress scenarios и invariants.

## 6. Proposed normative synchronization in PR

Round 1 подтвердил необходимость минимальной sync существующего Communications context:

- `b2f95ca5a442eb523c3a1da3471163dbbbadf548` — ADR-002 §6.10:
  - Survey / Survey Response добавлены как ключевые понятия;
  - Survey Item зафиксирован как локально адресуемая часть;
  - Governance/Voting boundaries и dependencies уточнены;
- `087be563c0d2c52db4eff7679c802410a80381c7` — DOMAIN_MODEL:
  - добавлены Survey / Survey Item / Survey Response semantics;
  - historical admissibility/item-definition и aggregation boundaries;
- `e257f791df838796b88070e47054a29d17a6bb07` — TERMINOLOGY:
  - добавлены термины 42.11–42.13;
  - личный кабинет допускает опросы.

Это **не создаёт новый bounded context**, не меняет ADR-001/008 Voting model и не делает Survey частью Governance.

Пока PR #71 не принят/merged, эти изменения остаются proposed normative synchronization в Draft branch, а не решением main.

## 7. Что не требуется менять

По итогам Round 1 нет оснований менять:

- ADR-001;
- ADR-004;
- ADR-005;
- ADR-008;
- ADR-009;
- ADR-010;
- ADR-011;
- ADR-013;
- existing Voting entities/rules/snapshots;
- Document model;
- integration semantic framework.

Эти документы уже дают необходимые общие guarantees; BP-SURVEY-001 только специализирует их для Survey.

## 8. Round 2

Полный Round 2 не требуется.

Focused second review нужен только если дальнейшая sync:

- вводит fundamental `Survey Definition Version`;
- вводит `Survey Right`, `Survey Participant` или `Survey Eligibility Snapshot`;
- переносит Survey ownership в Governance;
- превращает aggregation в independent `Survey Result`;
- меняет ADR-001/008 Voting semantics;
- либо вводит новый identity-bearing anonymity/multiplicity mechanism.

Текущие point fixes и sync этого не делают.

## 9. Result

После трёх независимых reviews и adjudication:

- BLOCKER нет;
- conceptual redesign не требуется;
- point fixes sufficient и применены;
- proposed normative synchronization подготовлена;
- `Survey` и `Survey Response` остаются самостоятельными identity-bearing concepts;
- `Survey Item` остаётся locally identity-bearing part;
- Survey owner остаётся Communications & Appeals;
- Survey/Voting boundary сохраняется;
- universal Survey Result/Right/Participant/Eligibility Snapshot/Version не вводятся;
- privacy/legal остаётся отдельным analysis;
- full Round 2 не требуется.

Следующее действие: синхронизировать `REFERENCE_CANDIDATE_MATRIX.md`, выполнить final consistency check PR #71 и передать владельцу проекта решение о readiness/merge.
