# Stage 8 — Анализ операционной работы и архитектурного владения

**Статус:** Accepted architecture outcome / normative synchronization performed
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

Многие работы пилотного СТ относятся к инженерной инфраструктуре, но не все.

Уборка, охрана, благоустройство, покос, работы по общему имуществу и иные действия могут не иметь Resource semantics. Большая доля инженерных примеров первого внедрения не является основанием передать ownership Work ресурсному контексту.

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

### 3.7. Субъекты

Контекст «Субъекты» владеет identity и базовыми сведениями о Subject, но не действиями/работами только потому, что их выполняет Subject.

```text
Subject
≠ Operational Work
```

Work использует Subject как исполнителя, ответственного, координатора или verifier через contextual role, не передавая ownership самого Subject.

**Вывод:** не подходит.

### 3.8. Объекты и отношения с ними

Property/Object либо иное domain object может быть target Work, но владение объектом и историческими Subject↔Object relations не означает владение работой над этим объектом.

```text
Work target
≠ ownership/use relation
≠ Operational Work
```

**Вывод:** не подходит.

### 3.9. Отношения субъекта с сообществом

Employment/service/Contractual Relationship может быть одним из оснований участия Subject в Work, но Work не является самим отношением Subject↔Community.

Волонтёрское/неоплачиваемое выполнение Work также показывает, что execution fact не должен зависеть от наличия трудового или договорного отношения.

**Вывод:** не подходит.

### 3.10. Полномочия и представительство

Representation и иные основания Domain Power могут участвовать в проверке допустимости operational action согласно ADR-010.

Но:

```text
Representation
≠ Domain Power
≠ Operational Work
```

Контекст Operational Work не должен поглощать Representation или technical access; одновременно context 5 не становится owner самой Work только потому, что для действия требуется полномочие.

**Вывод:** не подходит как owner Work.

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
- Subject identity / Employee / Supplier;
- Property/Object identity и Subject↔Object relations;
- Subject↔Community relations, включая employment/service/Contractual Relationship;
- Representation;
- engineering/resource target identity и resource facts;
- Document;
- Expense/Obligation/Payment;
- user account, access roles/permissions.

Он использует их через явные межконтекстные связи.

Operational domain rules могут определять допустимость конкретного Work action и использовать applicable Domain Power/bases согласно ADR-010. Из этого не следует, что Community Operations становится владельцем Representation, должности, employment relation или универсальной модели полномочий.

**Предлагаемые зависимости:** Community, Subjects, Objects/relations, Subject↔Community relations, Representation/Domain Power bases, Governance decisions, Resource facts/topology, Documents, Finance, Communications — только там, где они являются basis, target, evidence или связанным результатом.

**Предоставляемые результаты:** Operational Work identity/history, assignment history, execution/completion facts, Work Result и связанные operational outcomes, которые другие contexts могут использовать как basis/evidence без передачи ownership.

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

## 10. Альтернативы без нового контекста

### 10.1. Расширить «Сообщество и организационная структура»

Теоретически возможно расширить контекст «Сообщество и организационная структура» до «Сообщество, организационная структура и операционная деятельность».

Но ADR-002 §6.1 уже проводит принципиальную границу: этот context не владеет всеми фактами только потому, что они принадлежат Community.

Добавление Operational Work сюда:

- смешивает stable organization facts и execution facts;
- превращает context в потенциальный контейнер «всего, что делает Community»;
- требует материального переопределения его Accepted responsibility;
- снижает ясность ownership.

По предметной цене такое переопределение не проще добавления отдельного context и хуже сохраняет границы.

### 10.2. Отказаться от самостоятельного Operational Work

Вариант «Appeal / Decision / Document / Expense / Resource facts + связи без Work referent» также рассмотрен.

Он не сохраняет корректно:

- Work без Appeal/Decision/Expense/Document;
- many-to-many Appeal↔Work;
- assignment/reassignment history;
- completion/result/verification;
- reopen/follow-up identity;
- единые invariants исполнения независимо от basis.

Связующий узел, способный хранить эту семантику, фактически снова станет Operational Work под другим именем.

**Вывод:** standalone Operational Work предметно оправдан; среди проверенных alternatives новый Community Operations context остаётся предпочтительным owner.

## 11. Статус решения

**Принято проектом.**

Принят вариант A:

> новый 11-й top-level context **Операционная деятельность (Community Operations)** владеет Operational Work, Work Assignment и Work Result в пределах зафиксированных границ.

Нормативная синхронизация выполнена в ADR-002, ADR-009, DOMAIN_MODEL, TERMINOLOGY и REFERENCE_CANDIDATE_MATRIX.

Решение не означает отдельный микросервис, модуль кода, PostgreSQL schema или иной implementation boundary автоматически.

## 12. Review status

Один frozen independent multi-review round выполнен по `STAGE-8-OPERATIONAL-WORK-REVIEW-PACKAGE.md`.

Синтез зафиксирован в `STAGE-8-OPERATIONAL-WORK-MULTI-REVIEW-CONSOLIDATION.md`.

Round 1 подтвердил самостоятельный Operational Work referent и предпочтительность proposed Community Operations context. Review findings, не требующие изменения Accepted ADR, внесены в Draft analysis/BP.

Повторный review round не требуется, если project owner принимает proposed option A без материального изменения концепции. При выборе materially different ownership architecture потребуется отдельная целевая проверка.