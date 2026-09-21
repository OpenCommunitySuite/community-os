# Stage 8 — Анализ операционной работы и архитектурного владения

**Статус:** Draft / архитектурное предложение
**Связанный процесс:** `BP-OPS-001 — Operational Work / Work Order`

## 1. Причина анализа

Внешний референс DAH подтверждает практический сценарий «заявки на выполнение задач для правления», но не даёт надёжной модели lifecycle, assignment, completion или финансовых последствий.

Community OS уже различает:

- Appeal;
- Management Decision;
- Resource facts;
- Document;
- Expense / Financial Obligation;
- Subject / Employee / Supplier / Contractual Relationship.

При этом действующая карта ADR-002 не содержит явного владельца самостоятельного факта выполнения операционной работы.

## 2. Реальная потребность

Сообщество выполняет работы, например:

- ремонт фонаря;
- устранение утечки;
- ремонт трубы;
- проверка/замена прибора;
- обслуживание насосной;
- уборка территории;
- покос;
- ремонт дороги;
- установка оборудования;
- аварийное отключение/восстановление;
- иные внутренние или подрядные работы.

Работа может возникнуть из обращения, но также из:

- планового обслуживания;
- решения органа управления;
- результата осмотра;
- Operational Loss;
- Control Reconciliation;
- требования договора/поставщика;
- наблюдения сотрудника;
- аварийной ситуации;
- иной достаточной operational basis.

Следовательно:

```text
Appeal → Operational Work   (possible)
Operational Work without Appeal   (possible)
```

## 3. Почему существующие контексты не подходят как владелец

### 3.1. Коммуникации и обращения

`Appeal` принадлежит этому контексту, но Operational Work может существовать без Appeal, иметь нескольких исполнителей, собственный результат и продолжаться после коммуникации.

Если Work поместить сюда:

- фактическое выполнение работы станет частью коммуникации;
- обращение начнёт неявно владеть жизненным циклом исполнения;
- несколько Appeals → одна Work будут моделироваться плохо.

**Вывод:** не подходит.

### 3.2. Управление и коллективные процедуры

Management Decision может быть основанием Work, но фактическое исполнение решения не является самим решением.

```text
Management Decision
≠ Operational Work
```

Emergency/maintenance Work может возникать без отдельного Management Decision.

**Вывод:** не подходит.

### 3.3. Ресурсный и инженерный учёт

Многие работы относятся к инженерной инфраструктуре, но не все.

Уборка, охрана, благоустройство, организационные действия и иные работы могут не иметь Resource semantics.

```text
engineering target
≠ ownership of Work fact
```

**Вывод:** слишком узко.

### 3.4. Финансовые отношения

Work может иметь Expense, Supplier Obligation или remuneration consequence, но:

```text
Operational Work
≠ Expense
≠ Financial Obligation
≠ Payment
```

Работа может выполняться без нового денежного последствия.

**Вывод:** не подходит.

### 3.5. Документы и формализация

Акт, фото, отчёт, наряд либо иной документ может оформлять/подтверждать Work, но:

```text
Document
≠ Operational Work
```

**Вывод:** не подходит.

### 3.6. Сообщество и организационная структура

Этот контекст отвечает за Community и организационные рамки, а не за множество конкретных execution facts.

Помещение Operational Work сюда существенно расширило бы ответственность контекста и превратило бы его в «всё, что делает сообщество».

**Вывод:** не рекомендуется.

## 4. Предложение

Предлагается новый верхнеуровневый контекст:

**Операционная деятельность (Community Operations)**.

Предлагаемая ответственность:

> конкретные операционные работы сообщества, их предметная цель, scope/targets, назначения, фактическое выполнение, результат и исторические изменения.

Предлагаемые ключевые понятия:

- Operational Work;
- Work Assignment;
- Work Result / Completion outcome.

Контекст не должен владеть:

- Appeal;
- Management Decision;
- Subject/Employee/Supplier;
- engineering target;
- Document;
- Expense/Obligation/Payment;
- Contractual Relationship;
- user access.

Он использует их через явные межконтекстные связи.

## 5. Почему не вводится универсальный Problem / Incident

Работа может быть основана на неисправности, плановом обслуживании, решении или иной причине.

Ввод universal `Problem`, `Incident`, `Issue` до появления самостоятельных сценариев создаст преждевременную абстракцию.

`Operational Work` может иметь один или несколько basis без обязательной промежуточной universal entity.

## 6. Почему Work Order не должен автоматически быть Document

Термин `Work Order` широко используется как название управляемой единицы работы.

Для Community OS предлагается:

```text
Operational Work = предметный referent работы
Work Order = допустимое английское/UX название управляемой единицы работы
Document / written order / акт = отдельный Document when applicable
```

Если в конкретной модели появляется юридически значимый наряд/приказ, он остаётся Document, связанным с Operational Work.

## 7. Почему не требуется отдельная fundamental Work Request

Appeal уже покрывает коммуникационную инициативу.

Scheduled/management/resource basis могут создавать Work без request.

Универсальная Work Request между любым basis и Work не добавляет самостоятельного предметного смысла на текущем этапе.

## 8. Предлагаемые отношения

### 8.1. Appeal ↔ Operational Work

```text
one Appeal → 0..N Operational Works
one Operational Work → 0..N Appeals
```

Несколько жителей могут сообщить об одной неисправности, которая приводит к одной Work.

Одно Appeal может потребовать нескольких независимых Works.

### 8.2. Management Decision → Operational Work

Decision может быть basis/authorization Work, но не создаёт Work автоматически без applicable process/rule.

### 8.3. Resource / infrastructure facts → Operational Work

Operational Loss, inspection/reconciliation result или другой resource fact может быть basis Work.

Work не становится resource fact.

### 8.4. Subject / Employee / Contractor ↔ Operational Work

Subject может иметь contextual execution/responsibility role.

Assignment не создаёт employment, Supplier или Contractual Relationship автоматически.

### 8.5. Operational Work ↔ Expense / Obligation

Связь допускается для traceability, но Work не создаёт Expense/Obligation автоматически.

One Work may relate to several Expenses/Obligations and vice versa where real process requires it.

### 8.6. Operational Work ↔ Document

Document may authorize, describe, evidence or formalize Work/result.

Document identity remains separate.

## 9. Архитектурные последствия предложения

Если новый контекст принимается, потребуется нормативно изменить минимум:

- ADR-002 — 10 → 11 top-level contexts;
- DOMAIN_MODEL — Operational Work / Assignment / Result boundaries;
- TERMINOLOGY;
- VISION — при необходимости явно добавить operational work capability;
- REFERENCE_CANDIDATE_MATRIX — закрыть REF-OPS-001;
- architecture/module mapping later, but not at this stage.

## 10. Альтернатива без нового контекста

Технически возможно расширить контекст «Сообщество и организационная структура» до «Сообщество, организационная структура и операционная деятельность».

Недостатки:

- смешивает stable organization facts и high-volume operational facts;
- делает ответственность контекста слишком широкой;
- снижает ясность ownership;
- затрудняет будущие maintenance/service/field-work processes.

Эта альтернатива считается менее предпочтительной.

## 11. Статус решения

**Предложение, не принятое нормативно.**

До принятия:

- ADR-002 не изменяется;
- новый context не считается существующим;
- BP-OPS-001 использует термин `proposed Community Operations context`;
- реализация не начинается.

## 12. Требуемый уровень review

Добавление нового top-level bounded context является существенным архитектурным изменением.

Согласно `INDEPENDENT_MULTI_REVIEW.md` перед нормативной синхронизацией рекомендуется один frozen multi-review round по текущему Stage 8 package.

Повторный круг review нужен только при реальном неразрешённом архитектурном разногласии.