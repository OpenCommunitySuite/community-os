# Stage 8 — Independent Multi-Review Consolidation

**Статус:** Draft / synthesis complete, architecture decision pending  
**Review round:** Round 1  
**Frozen package:** `STAGE-8-OPERATIONAL-WORK-REVIEW-PACKAGE.md`  
**Base:** `main@6665005368125260cf60cf0b7dad8628d7c93114`  
**Draft analysis SHA:** `3d7bb2db44697859ff4621c8977ebe83ca336be6`  
**Draft BP SHA:** `4a6c135ce273fb570fe37c474a8ff86a011e4a98`

## 1. Источники независимого review

Round 1 выполнен тремя независимыми рецензентами по одному frozen package:

- Claude Chat — `claude_STAGE-8-OPERATIONAL-WORK-INDEPENDENT-REVIEW.md`, Review ID `STAGE8-OPS-001-R1`;
- DeepSeek — `deepseek_markdown_20260921_d67ecb.md`, Review ID `STAGE8-OPS-001-R1`;
- Gemini — `gemini_stage_8_operational_work_review.md`, Review ID `STAGE8-OPS-001-REV-INDEP`.

Raw reviews являются рабочими материалами. Настоящий документ фиксирует consolidated findings и их adjudication against repository source of truth.

## 2. Центральный архитектурный вывод

Все три независимых review подтверждают:

1. самостоятельный предметный referent `Operational Work` оправдан;
2. вариант F — отказ от самостоятельного Work в пользу связей существующих фактов — не сохраняет identity/history/assignment/result semantics;
3. Communications/Appeals, Governance, Resource & Engineering, Finance, Documents и Community & Organizational Structure не дают чистого ownership без boundary distortion;
4. предпочтительный вариант — новый top-level context `Операционная деятельность (Community Operations)`.

Совпадение reviewers не является голосованием. После сверки с ADR-002 этот вывод подтверждается по предметной причине: Operational Work является execution fact, а не organizational frame, subject/object relation, representation, governance decision, resource fact, financial fact, document или communication fact.

**Статус:** архитектурно обосновано, но **не принято нормативно**. Требуется explicit project-owner decision до изменения Accepted ADR-002.

## 3. Consolidated findings

| ID | Находка | Claude | DeepSeek | Gemini | Проверка по source of truth | Статус |
|---|---|---|---|---|---|---|
| C-01 | Operational Work требует самостоятельного referent | FND-01/02/04 | F-02/03/04/05/33 | Architecture A–F | Подтверждается | accepted as analysis |
| C-02 | Новый Community Operations — предпочтительный owner | FND-04 | F-05/33 | Architecture conclusion | Подтверждается, но меняет ADR-002 | **owner decision required** |
| C-03 | Draft не рассмотрел явно contexts 2–5 | FND-03 | — | — | Подтверждается ADR-002 §6.2–6.5 | accepted |
| C-04 | Граница нового context должна быть явно узкой | FND-05/06/12 | F-06 | — | Подтверждается ADR-002 pattern | accepted |
| C-05 | Work Assignment relation/action сформулирован двусмысленно | — | F-10 | — | Подтверждается Draft §21 | accepted |
| C-06 | Authority boundary нуждается уточнении | FND-08 | — | — | Literal ownership by context 5 **не подтверждается** ADR-010; Representation ≠ Domain Power | accepted with correction |
| C-07 | Volunteer/community-member executor надо показать явно | FND-10 | — | ST8-FIND-003 | Модель уже допускает Subject; пример улучшает практичность СТ | accepted |
| C-08 | Work Order terminology создаёт document ambiguity | FND-09 | F-07/22 | ST8-FIND-005 | Подтверждается | accepted |
| C-09 | Reopen/new Work и scope-change требуют яснее определить identity boundary | FND-11 | F-14/27 | ST8-FIND-006/007 | Подтверждается | accepted |
| C-10 | Архитектурный вывод не должен быть domain invariant BP | FND-07 | F-20 | — | Подтверждается | accepted |
| C-11 | Outcomes смешивают Work Result и current-state projection | — | F-21 | ST8-FIND-008 | Подтверждается | accepted |
| C-12 | Cross-context target relation требует semantic clarity | — | — | ST8-FIND-001 | Проблема валидна; предложенный `Context ID + Entity ID` — implementation detail | accepted partially |
| C-13 | Emergency Work и finance boundary | — | — | ST8-FIND-002 | Universal interim financial basis/post-factum approval противоречит separation semantics | rejected as universal rule; boundary clarified |
| C-14 | Materials usage evidence без inventory | FND-14 | F-17 | ST8-FIND-004 | Draft уже допускает evidence/link; полезно уточнить | accepted as clarification |
| C-15 | Problem/Incident entity пока преждевременна | FND-13 | F-09/23 | — | Подтверждается | deferred trigger retained |
| C-16 | Дополнительные pilot scenarios | — | F-19/32 | — | Не блокирует; полезно добавить volunteer/access/multi-stage examples | accepted selectively |

## 4. Решения по спорным рекомендациям

### 4.1. Authority не принадлежит целиком context 5

Claude предложил отнести определение authority к context 5 «Полномочия и представительство».

Accepted ADR-010 устанавливает более точную модель:

```text
Representation
≠ Domain Power
≠ Position
≠ Management-body participation
≠ Access role
```

Domain Power имеет локальную предметную семантику и может следовать из representation, position, employment/service relation, assignment, decision или другого основания.

Поэтому Community Operations должен:

- владеть admissibility/semantics собственных operational actions;
- использовать applicable Domain Power/bases согласно ADR-010;
- не владеть Subject identity, Representation, User Account, access roles/permissions;
- не превращать Work Assignment автоматически в universal Domain Power.

### 4.2. Target Reference как universal entity не вводится

Gemini правильно заметил риск потери identity при ссылках на targets других contexts.

Принимается semantic requirement:

- target relation должна быть typed/contextual;
- target identity остаётся owned исходным context;
- textual location не заменяет known domain identity;
- correction target relation traceable.

Не принимается как domain requirement конкретная техническая форма `Context ID + Target Entity ID + Target Role`. DB/API/reference implementation остаётся вне Stage 8.

### 4.3. Emergency Work не создаёт interim Obligation/Expense автоматически

Emergency Work может существовать без prior Management Decision.

Это не означает:

```text
Emergency Work
→ Financial Obligation automatically
→ Expense automatically
```

Work и Work Result могут быть одним из bases/evidence, которые financial context использует по собственной recognition semantics. Конкретное financial fact может иметь иное достаточное basis (contract, supplier performance, cash event, document, applicable rule). Universal mandatory post-factum approval также не вводится.

### 4.4. Materials evidence ≠ inventory accounting

Execution/Work Result evidence может описывать фактически использованные материалы и quantities where meaningful.

Но это:

- не создаёт material master/stock item automatically;
- не создаёт warehouse balance;
- не создаёт accounting write-off;
- не создаёт Expense automatically.

Будущий inventory/procurement context, если он появится, должен интегрироваться отдельно.

## 5. Draft corrections after review

До архитектурного owner decision допустимы non-normative corrections Draft D / BP-OPS-001:

- явно проверить все 10 existing top-level contexts;
- усилить categorical ownership rationale;
- уточнить proposed-context boundaries/dependencies/results;
- канонизировать термин `Operational Work`; оставить `Work Order` secondary UX alias;
- определить Work Assignment как historical relation с role/interval/provenance, а не двусмысленное relation/action;
- добавить volunteer/community-member execution case;
- уточнить authority boundary согласно ADR-010;
- усилить target semantic relation без implementation reference pattern;
- уточнить emergency finance boundary;
- разрешить materials usage as evidence без inventory;
- уточнить scope correction vs new Work и reopen criteria;
- сохранять prior Work Result/acceptance history при reopen/correction;
- отделить Work Result semantics от current-state projection;
- удалить architectural conclusion из domain invariants;
- добавить несколько практических stress scenarios.

Frozen review package не изменяется.

## 6. Second review round

Second round не требуется, если project owner принимает вариант A без изменения основной концепции.

Second round потребуется только если принято materially different architecture решение, например:

- расширить context 1 вместо нового Community Operations;
- отказаться от standalone Operational Work;
- существенно изменить ownership Work/Assignment/Result.

## 7. Оставшееся решение проекта

Требуется explicit decision:

> Принять ли новый 11-й top-level context **Операционная деятельность (Community Operations)** с ownership `Operational Work`, `Work Assignment`, `Work Result` и с явными границами относительно остальных contexts?

До этого решения ADR-002 / DOMAIN_MODEL / TERMINOLOGY не синхронизируются нормативно.
