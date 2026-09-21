# PR #59 / BP-DOC-CASH-001 — Independent Multi-Review Consolidation

**Статус:** Round 1 consolidated / point fixes applied  
**PR:** #59 — `docs: define cash document formalization process`  
**Base package:** `BP-DOC-CASH-001-INDEPENDENT-MULTI-REVIEW-PACKAGE.md`  
**Reviewers:** Gemini, DeepSeek  
**Claude:** review не получен из-за ограничения Free-режима; consolidation не ожидает третий review и не трактует его отсутствие как мнение.

## 1. Источники review

Round 1 выполнен двумя независимыми рецензентами по одному frozen package:

- Gemini — `gemini_stress_review_pr_59.md`;
- DeepSeek — `deepseek_markdown_20260921_633123.md`.

Raw review files не добавляются в repository; настоящая consolidation фиксирует findings и adjudication against current source of truth.

## 2. Общий результат

Оба reviewer сходятся по фундаментальным вопросам:

- BLOCKER нет;
- conceptual redesign не требуется;
- самостоятельная fundamental entity `Cash Document` не нужна;
- самостоятельная fundamental entity `Document Part` для ордера/квитанции не нужна;
- `Cash Visit / Session / Operation` не нужна;
- модель `Document → Revision → composite Representation` достаточна для пилота;
- границы `Cash Acceptance / Payment / Payment Allocation / Advance / Document` в целом корректны;
- Community OS может создавать/нумеровать/печатать ПКО, а BAF/BAS оставаться downstream accounting representation;
- REF-DOC-005 должен остаться отдельным legal/formalization analysis Украины;
- достаточно point fixes.

Основные реальные defects сосредоточены в трёх местах:

1. part-specific actions composite Representation нуждаются в явной адресуемости без новой entity;
2. §34.1 должен допускать `Unallocated Remainder` и точнее проводить `Advance ≠ Payment Allocation`;
3. формулировка retry/export не должна обещать отсутствие внешнего duplicate вопреки ADR-011 unknown-outcome semantics.

## 3. Adjudication matrix

| ID | Finding | Reviewers | Решение |
|---|---|---|---|
| C-01 | Части composite Representation имеют разные действия/диспозиции, но не определён target part-specific action | Gemini, DeepSeek | **Принять.** Ввести семантику «предметно адресуемая роль/сегмент конкретного Representation» без самостоятельной `Document Part` identity/status machine. Part-specific issuance/signing/reprint/retention сохраняют target role + provenance. |
| C-02 | §34.1 слишком жёстко говорит, что неназначенный excess должен получить иной disposition либо не приниматься | Gemini | **Принять с уточнением.** Если вся сумма уже recognized Payment, неназначенная часть может остаться `Unallocated Remainder`. Если Payment recognition этой части ещё не завершён, сохраняется unresolved/custody semantics BP-CASH-001. |
| C-03 | Заголовок «округление суммы вверх» смешивает округление долга и реально принятую большую сумму | DeepSeek | **Принять.** Переименовать сценарий как «сумма выше текущих обязательств; сдача не возвращается». |
| C-04 | Стрелка `19,33 → Advance` скрывает `Advance ≠ Payment Allocation` | DeepSeek | **Принять.** Уточнить: Initial Allocation to permitted Advance purpose → recognized Advance state according to owning finance semantics. |
| C-05 | «retry/reconciliation без дублирования внешнего бухгалтерского объекта» конфликтует с ADR-011 unknown outcome | DeepSeek | **Принять.** External retry может создать duplicate; Community OS не создаёт новый собственный domain fact автоматически, а внешний duplicate разрешается reconciliation. |
| C-06 | External BAF/BAS id недостаточно квалифицирован | DeepSeek | **Принять.** Хранить/описывать как qualified external identifier в scope конкретной integration, согласно ADR-011. |
| C-07 | Template/form provenance требуется на Representation level | Gemini; DeepSeek observation | **Принять concern, скорректировать prescription.** Исторически значимый Representation сохраняет фактически использованную template/form version provenance. Не вводится универсальное правило «всегда версия на момент Revision creation»: релевантна реально использованная версия при формировании/выдаче Representation. Reprint same historical Representation не молча использует новую форму. |
| C-08 | First issuance слишком универсально объявлено historically significant | DeepSeek | **Принять.** Historical significance issuance остаётся document-kind-specific; для pilot KO-1 first actual issuance receipt-part принимается как рабочее правило до REF-DOC-005/policy. |
| C-09 | KO-1 детали могут выглядеть универсальными | Gemini | **Принять как структурное уточнение.** KO-1 остаётся явно pilot application, а composite Representation — общий механизм. Fundamental model не меняется. |
| C-10 | Physical tenderer должен быть обязательным даже до Payment recognition | Gemini | **Отклонить как universal requirement.** Current norms требуют отражать только достоверно установленные сведения и не создавать fake Subject. Обязательность tenderer — document-kind/legal requirement; если он обязателен, документ нельзя финализировать без него. REF-DOC-005 решит украинскую legal requirement. |
| C-11 | Outgoing cash document преждевременен, потому что BP-CASH-002 ещё не принят | DeepSeek | **Частично принять только как scope clarification.** BP-CASH-002 уже присутствует в current main как Draft и является текущей нормативной опорой. PR #59 не должен переопределять его. Outgoing direction оставлен как boundary; pilot operational scenario остаётся incoming. |
| C-12 | `Cash Document` может потребовать glossary-entry | DeepSeek observation | **Отложить.** Пока термин локален BP и явно определён как contextual shorthand. TERMINOLOGY не расширяется без повторного использования/неоднозначности. |
| C-13 | ADR-009 следует менять ради template provenance | DeepSeek optional | **Не требуется сейчас.** Existing ADR-009 provenance/rule semantics достаточны. BP делает связь явной; ADR менять только если тот же gap проявится в других document processes. |
| C-14 | Legal/RRO/PRRO/КО-1 requirements не закрывать в BP | Gemini, DeepSeek | **Принять/сохранить.** Все такие вопросы остаются REF-DOC-005. |

## 4. Important rejected or narrowed reviewer prescriptions

### 4.1. Universal mandatory physical tenderer

Не принимается.

Нельзя из риска злоупотреблений выводить universal document invariant. Current model допускает unresolved financial interpretation и запрещает fake identities.

Правило:

```text
known tenderer → may be represented with provenance
unknown tenderer → no invented Subject
mandatory tenderer for document kind → finalization blocked by that policy
```

Юридическая обязательность реквизита — REF-DOC-005.

### 4.2. Template version = version active at Revision creation

Не принимается как universal rule.

`Revision` и `Representation` — разные уровни ADR-009. Representation может быть сформирован позднее Revision. Исторически важно сохранить **реально использованную** template/form version конкретного Representation/issuance.

Поэтому:

```text
Revision semantic content
≠ template version automatically

historical Representation
→ exact template/form provenance used
```

### 4.3. External retry must never duplicate BAF object

Отклонено как противоречащее ADR-011.

При unknown outcome повтор может породить duplicate на внешней стороне. Domain invariant Community OS состоит не в «магической внешней идемпотентности», а в отсутствии автоматического нового собственного domain fact и наличии reconciliation semantics.

### 4.4. New Document Part entity

Отклонено обоими reviewer и consolidation.

Для пилота достаточно addressable semantic role/segment внутри конкретного Representation. Новая entity возможна только если REF-DOC-005 либо будущий scenario докажет собственную устойчивую identity/history/independent legal semantics части.

## 5. Applied point fixes

Commit `abe6db126fd0352bdfda6fee3727353d24026185` применил принятые изменения:

- part-specific semantic role/segment addressability без `Document Part`;
- issuance/retention provenance для конкретной роли части;
- уточнение template/form provenance на Representation;
- qualified BAF/BAS external identifier;
- §34.1 переписан:
  - не «округление»;
  - `Initial Allocation → Advance purpose → Advance state`;
  - `Unallocated Remainder` как допустимый outcome recognized Payment;
  - unresolved cash не становится remainder преждевременно;
- ADR-011-correct retry/unknown-outcome/external-duplicate semantics;
- pilot-specific, а не universal first-issuance semantics;
- outgoing direction явно ограничен границей и не переопределяет BP-CASH-002;
- physical tenderer requirement возвращён к document-kind/legal policy.

## 6. Нормативные последствия

По результатам Round 1:

- DOMAIN_MODEL менять не требуется;
- TERMINOLOGY менять не требуется;
- ADR-009 менять не требуется;
- ADR-011 менять не требуется;
- BP-CASH-001 менять не требуется;
- BP-FIN-ALLOCATION-001 менять не требуется;
- BP-CASH-002 менять не требуется;
- REF-DOC-005 остаётся отдельным legal/formalization stage;
- REF-INT-001 остаётся отдельным Community OS → BAF/BAS integration-contract stage.

Причина: review выявил не новую предметную модель, а локальные неясности в BP-DOC-CASH-001.

## 7. Round 2

Полный Round 2 не требуется.

Focused second review был бы оправдан только если point fixes:

- вводят `Document Part` identity;
- меняют `Document → Revision → Representation`;
- меняют Cash Acceptance / Payment / Allocation / Advance semantics;
- вводят universal Cash Visit/Operation;
- передают domain ownership BAF/BAS;
- либо закрывают legal requirements до REF-DOC-005.

Текущие исправления этого не делают.

## 8. Result

После двух независимых reviews и adjudication:

- фундаментальных блокеров нет;
- conceptual redesign не требуется;
- point fixes applied;
- Draft остаётся совместимым с ADR-009, ADR-011, BP-CASH-001, BP-FIN-ALLOCATION-001 и текущим BP-CASH-002;
- модель pilot KO-1 остаётся: **один ПКО = один Document; ордер + квитанция = composite Representation с адресуемыми semantic roles/segments**;
- быстрый cashier interaction остаётся application-level coordination, а не новой domain entity;
- Community OS остаётся owner ПКО и связанных собственных financial/document facts; BAF/BAS — downstream accounting integration.

Следующее действие: выполнить final consistency check PR #59, обновить review-status PR и после успешной проверки решить readiness for merge.