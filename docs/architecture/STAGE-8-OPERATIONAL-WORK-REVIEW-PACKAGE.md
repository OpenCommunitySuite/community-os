# Stage 8 — Independent Multi-Review Package

**Review ID:** STAGE8-OPS-001-R1  
**Статус пакета:** Frozen / Round 1  
**Base:** `main@6665005368125260cf60cf0b7dad8628d7c93114`  
**Branch:** `docs/bp-ops-001-operational-work`  
**Draft analysis content SHA:** `3d7bb2db44697859ff4621c8977ebe83ca336be6`  
**Draft BP content SHA:** `4a6c135ce273fb570fe37c474a8ff86a011e4a98`

## 1. Цель review

Проверить предметную и архитектурную корректность Stage 8 Community OS:

1. действительно ли самостоятельная `Operational Work` нужна как отдельный domain referent;
2. корректны ли её границы с Appeal, Management Decision, Resource, Document, Subject/Employee/Supplier, Expense/Obligation/Payment;
3. нужен ли для неё новый 11-й top-level context `Операционная деятельность (Community Operations)`, либо существующий Accepted ADR-002 context может владеть этим понятием без размывания границ;
4. не введены ли преждевременные сущности/отношения;
5. достаточны ли lifecycle/result/reopen/assignment semantics для универсального Community OS и практического пилотного СТ.

Это review архитектуры и бизнес-смысла. Не проектировать код, БД, API, UI, очереди, микросервисы или статусы ради реализации.

## 2. Критичное предлагаемое изменение

Текущий ADR-002 содержит 10 top-level contexts.

Draft Stage 8 предлагает **не принятое нормативно** изменение:

```text
+ Операционная деятельность (Community Operations)
```

с ownership над:

- Operational Work;
- Work Assignment;
- Work Result / completion outcome.

Пожалуйста, не считайте это решение уже принятым. Нужно проверить альтернативы.

## 3. Обязательные альтернативы для проверки

Сравните минимум:

A. Новый top-level context `Community Operations`.  
B. Расширение `Сообщество и организационная структура`.  
C. Владение через `Управление и коллективные процедуры`.  
D. Владение через `Коммуникации и обращения`.  
E. Владение через `Ресурсный и инженерный учёт`.  
F. Отказ от самостоятельного Operational Work в пользу связей существующих фактов.

Не выбирайте вариант по простоте реализации. Оценивайте предметный ownership, универсальность и отсутствие смешения контекстов.

## 4. Вопросы review

Проверьте, в частности:

- действительно ли Work может существовать без Appeal;
- корректна ли many-to-many связь Appeal↔Work;
- достаточно ли основания/basis без universal Problem/Incident/Work Request;
- не является ли Work Order документом по смыслу модели;
- оправдана ли отдельная Work Assignment semantics;
- достаточно ли различать internal employee и external contractor через contextual execution role;
- не создаёт ли Work Assignment Supplier/employment relation автоматически;
- корректно ли Completion ≠ Acceptance;
- нужен ли Work Result как самостоятельный исторически значимый факт/часть work history;
- корректны ли reopen vs follow-up/new Work boundaries;
- нужны ли universal status machine, priority taxonomy, SLA, dependency graph;
- не смешаны ли Work и Expense/Obligation/Payment;
- корректно ли исключён складской/ТМЦ учёт;
- корректно ли Work не переписывает Operational Loss/Reading/Consumption;
- не пропущены ли типовые сценарии СТ/ОСББ/ЖСК;
- не создаёт ли новый context чрезмерную фрагментацию ADR-002;
- если новый context не нужен — какой существующий context способен владеть Work без нарушения собственной текущей ответственности.

## 5. Формат ответа

Каждая находка:

- **ID**
- **severity:** BLOCKER / MAJOR / MINOR / QUESTION
- **место**
- **тип:** противоречие / неопределённость / риск / открытый вопрос / альтернатива
- **суть**
- **обоснование**
- **затронутые источники/решения**
- **предлагаемое направление**, если уместно

В конце:

1. список BLOCKER/MAJOR;
2. явное мнение по architecture ownership alternatives;
3. какие части Draft можно принять без изменений;
4. какие требуют решения пользователя;
5. есть ли основание для второго review round — только если осталось существенное архитектурное разногласие.

## 6. Требование к результату

Верните результат отдельным **downloadable UTF-8 Markdown (.md)** файлом.

Если среда не умеет отдавать downloadable Markdown, напишите ровно:

`DOWNLOADABLE_MD_NOT_SUPPORTED`

а затем дайте чистый Markdown-блок без лишнего обрамления, чтобы его можно было сохранить в .md.

---

# SOURCE A — Current ADR-002 excerpts

## 2. Решение

Community OS использует десять верхнеуровневых предметных архитектурных контекстов:

1. Сообщество и организационная структура.
2. Субъекты.
3. Объекты и отношения с ними.
4. Отношения субъекта с сообществом.
5. Полномочия и представительство.
6. Финансовые отношения.
7. Ресурсный и инженерный учёт.
8. Управление и коллективные процедуры.
9. Документы и формализация.
10. Коммуникации и обращения.

Конфигурация сообщества, правила и версии правил, история, аудит, происхождение данных, системная идентичность, учётные записи и технический доступ являются сквозными архитектурными ответственностями, а не предметными контекстами первого уровня.

Инфраструктурные функции могут предоставлять технические возможности или внешние данные, но не становятся владельцами предметных понятий Community OS.



## 5. Карта предметных контекстов

```text
Community OS
├── Сообщество и организационная структура
├── Субъекты
├── Объекты и отношения с ними
├── Отношения субъекта с сообществом
├── Полномочия и представительство
├── Финансовые отношения
├── Ресурсный и инженерный учёт
├── Управление и коллективные процедуры
├── Документы и формализация
└── Коммуникации и обращения

Сквозные ответственности:
├── Системная идентичность, учётные записи и технический доступ
├── Конфигурация сообщества
├── Правила и версии правил
└── История, аудит и происхождение данных
```



### 6.1. Сообщество и организационная структура

**Ответственность.** Понятие сообщества, его тип и организационные рамки деятельности.

**Ключевые понятия.** Сообщество, тип сообщества, орган управления в аспекте его существования и места в организационной структуре сообщества.

**Граница ответственности.** Контекст не владеет всеми субъектами, объектами, членством, собственностью, учётными записями, финансовыми отношениями или голосованиями только потому, что они принадлежат сообществу. Орган управления является одним предметным понятием: историческое участие конкретного субъекта в нём относится к контексту «Отношения субъекта с сообществом», а деятельность органа — к контексту «Управление и коллективные процедуры».

**Зависимости.** Использует конфигурацию сообщества для применимых специализаций.

**Предоставляемые результаты.** Сведения о самом сообществе, его организационных рамках и применимом типе сообщества.



### 6.6. Финансовые отношения

**Ответственность.** Финансовые отношения с субъектами и финансы самого сообщества.

**Ключевые понятия.** Лицевой счёт, начисление, финансовое обязательство, банковский счёт сообщества, банковская транзакция, платёж, задолженность, переплата, пеня, тариф, статья начисления, поставщик, обязательство перед поставщиком, платёж поставщику, расход сообщества, смета, источник финансирования, финансирование расхода, начисление вознаграждения.

Внутри одного верхнеуровневого контекста концептуально различаются две зоны:

- **расчёты с субъектами:** лицевые счета, обязательства, начисления, платежи, задолженность, переплата и тарифные основания;
- **финансы сообщества:** банковские счета сообщества, банковские транзакции, поставщики, расходы, смета, финансирование общих расходов, обязательства и расчёты с поставщиками и другими сторонами, выплаты сотрудникам и другие расходы сообщества.

Банковская транзакция является предметным понятием финансового контекста после её признания Community OS. Внешняя банковская операция, сообщение банка, строка выписки или иное полученное банковское представление сами по себе банковской транзакцией Community OS не являются; их получение, validation, mapping и recognition подчиняются общей интеграционной семантике ADR-011.

**Граница ответственности.** Контекст не определяет право собственности, членство, показания приборов, фактическое потребление или правила голосования. Он может использовать их как основания только в соответствии с применимыми правилами.

**Зависимости.** Использует объекты и применимые отношения с ними, отношения субъекта с сообществом, а также конфигурацию, правила и историю.

**Предоставляемые результаты.** Финансовые обязательства, состояние расчётов, платежи, финансовые результаты сообщества и основания для связанных процессов.



### 6.7. Ресурсный и инженерный учёт

**Ответственность.** Предметный учёт ресурсов и инженерной структуры сообщества.

**Ключевые понятия.** Ресурс, инженерная система, точка подключения, инженерная ветвь, ветвь учёта ресурса, прибор учёта, показание, потребление, расчётный небаланс, эксплуатационная потеря.

**Граница ответственности.** Расчётный небаланс не является автоматически эксплуатационной потерей, задолженностью, неучтённым потреблением или финансовым обязательством. Контекст не определяет начисление или обязательство, хотя его результаты могут быть их основанием.

**Зависимости.** Использует сообщество, объекты, конфигурацию, правила и исторически применимые сведения.

**Предоставляемые результаты.** Принятые показания, предметные результаты измерений, потребление, небалансы и сведения об инженерной структуре.



### 6.8. Управление и коллективные процедуры

**Ответственность.** Деятельность органов управления и коллективные процедуры рассмотрения вопросов и принятия решений.

**Ключевые понятия.** Орган управления в аспекте его деятельности, собрание, вопрос, право участия, голосование, версия правила голосования, право голоса, реализатор права голоса, снимок прав, голос, история голоса, корректирующая операция, эффективный состав прав, расчёт результата, расчётный результат, установление результата, установленный результат, пересмотр результата, решение по вопросу.

**Граница ответственности.** Вопрос, голосование, результат и решение по вопросу — разные понятия, но не отдельные верхнеуровневые контексты. Орган управления не получает второго независимого владельца: данный контекст отвечает только за его деятельность — рассмотрение вопросов, проведение процедур и принятие решений. Историческое участие конкретного субъекта в органе управления принадлежит контексту «Отношения субъекта с сообществом». Контекст не определяет собственность, членство или представительство; он может использовать их как основания согласно применимым правилам.

**Зависимости.** Использует сообщество, отношения субъекта с сообществом, полномочия и представительство, отношения с объектами, конфигурацию, правила и историю.

**Предоставляемые результаты.** Предметные результаты коллективных процедур, включая установленные результаты и решения по вопросам.



### 6.9. Документы и формализация

**Ответственность.** Документы, их применимые версии, публикация и связи с предметными объектами других контекстов.

**Ключевые понятия.** Документ, публичный документ.

**Граница ответственности.** Документ не тождествен предметному факту, праву, обязательству, результату или решению и не становится владельцем такого факта только потому, что оформляет, подтверждает, формализует или удостоверяет его. В конкретной предметной ситуации документ может быть связан с подтверждающими сведениями, оформлять или подтверждать их, а также быть основанием либо подтверждать основание. При этом документный контекст не становится владельцем всех подтверждающих сведений системы, а общее понятие «Основание» ему не принадлежит. Основание, подтверждающие сведения, документ, источник данных и действие фиксации — разные понятия.

**Зависимости.** Использует ссылки на предметные объекты, факты и решения соответствующих контекстов; применяет общие принципы происхождения и истории.

**Предоставляемые результаты.** Документы, их применимые версии, публикации и связи с предметными объектами.



### 6.10. Коммуникации и обращения

**Ответственность.** Предметное информационное взаимодействие сообщества с участниками.

**Ключевые понятия.** Обращение, новость, объявление, уведомление.

**Граница ответственности.** Личный кабинет может быть пользовательским каналом взаимодействия, но не становится самостоятельным предметным понятием или архитектурной границей только из-за пользовательского интерфейса. Предметная необходимость уведомить отличается от технической доставки сообщения. Контекст не определяет субъект, документ, решение или право доступа.

**Зависимости.** Использует субъектов, системную идентичность и доступ, документы, а также результаты других контекстов, когда они являются предметом обращения или уведомления.

**Предоставляемые результаты.** Обращения, информационные материалы и предметные основания информационного взаимодействия.



---

# SOURCE B — Current ADR-009 Appeal excerpt

### 15. Обращение

**Обращение** — предметно значимое направленное волеизъявление или информационное обращение от определимого инициатора к определимому адресату в связи с некоторым предметом.

Инициатор обращения не обязан быть пользователем системы. Субъект и пользовательская учётная запись не тождественны. Если инициатор является субъектом, его идентичность принадлежит контексту субъектов; способ технической аутентификации и действия от чужого имени относятся к Stage B.

Обращение может выражать заявление, запрос, жалобу, сообщение о неисправности, запрос документа, просьбу о перерасчёте или другой предметно определённый вид. Этот перечень открыт и не создаёт универсальную классификацию обращений.

Сохраняются различия:

```text
Обращение ≠ Документ ≠ Сообщение ≠ Заявка технической поддержки ≠ Управленческая процедура
```

Обращение может иметь связанный документ, а заявление может одновременно иметь документную форму. Это не делает обращение и документ одним понятием.

Не вводится универсальный жизненный цикл обращения. Принятие, рассмотрение, запрос уточнения, подготовка ответа, перенаправление, завершение или иные действия применяются только там, где они предусмотрены видом обращения и правилами процесса.



---

# SOURCE C — Current Stage 8 entry in candidate matrix

### Этап 8. BP-OPS-001 — от обращения к операционной работе

**Источники:** прежде всего DAH.

Нужно отделить:

```text
Appeal
≠ Operational Work / Work Order
≠ Assignment
≠ Expense
≠ Document
≠ Management Decision
```

Проверить:

- может ли обращение породить операционную работу;
- может ли работа возникнуть без обращения;
- объект/инфраструктура, к которой относится работа;
- инициатор, ответственный и исполнитель;
- внутренний сотрудник и внешний подрядчик;
- факт выполнения и результат;
- связанные материалы/акты;
- расходы и обязательства как отдельные финансовые факты;
- повторное открытие/новая работа после результата.

**Результат:** решение, требуется ли самостоятельное предметное понятие Work Order, и соответствующий BP.



---

# DRAFT D — Stage 8 architecture analysis

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

---

# DRAFT E — BP-OPS-001

# BP-OPS-001 — Операционная работа / Work Order

**Статус:** Draft
**Предлагаемый контекст:** Операционная деятельность (Community Operations) — не принят нормативно
**Тип документа:** Бизнес-процесс

## 1. Назначение

Настоящий BP определяет предметную семантику конкретной операционной работы Community: от recognition operational need до assignment, execution и результата.

Базовая модель:

```text
one or more sufficient bases
→ Operational Work recognized
→ planning / authorization where applicable
→ Work Assignment(s)
→ execution
→ completion/result
→ verification/acceptance where applicable
→ follow-up or new Work where required
```

## 2. Ключевые границы

```text
Appeal
≠ Operational Work
≠ Work Assignment
≠ Management Decision
≠ Document
≠ Expense
≠ Financial Obligation
```

## 3. Operational Work

**Operational Work** — исторически значимый предметный referent конкретной работы, которую Community намерено выполнить, выполняет либо выполнило для достижения определённого operational purpose/result.

Work имеет собственную stable identity.

Её identity определяется coherent operational purpose/scope, а не:

- Appeal ID;
- Document ID;
- executor;
- Expense;
- Supplier contract;
- Management Decision.

## 4. Work Order terminology

`Work Order` используется как допустимое английское название управляемой единицы Operational Work.

Это не означает отдельную Document entity.

```text
Work Order / Operational Work
≠ written order Document automatically
```

## 5. Что входит

- basis/source;
- purpose;
- operational scope;
- target/reference to affected domain objects where applicable;
- priority/deadline where meaningful;
- authorization/decision basis where required;
- responsible/executor assignment;
- planned vs actual time;
- execution history;
- completion assertion;
- result/outcome;
- verification/acceptance where required;
- cancellation;
- follow-up/reopen/new work semantics;
- related documents/evidence;
- related financial/resource/communication facts;
- provenance/corrections.

## 6. Что не входит

- Appeal lifecycle;
- governance decision-making;
- employment relationship;
- Supplier/Contractual Relationship creation;
- inventory/material stock accounting;
- payroll calculation;
- Expense/Payment/Obligation recognition;
- Resource recognition;
- universal incident/problem management;
- universal project-management system;
- UI/kanban/calendar;
- DB/API implementation.

## 7. Основание Work

Operational Work может иметь одно или несколько bases.

Примеры:

- Appeal;
- Management Decision;
- Operational Loss;
- Control Reconciliation result;
- scheduled maintenance rule;
- Contractual Relationship requirement;
- employee observation;
- emergency situation;
- document/evidence;
- other sufficient basis.

Ни один basis не становится Work автоматически без applicable recognition semantics.

## 8. Work без Appeal

Допустимы:

- плановое обслуживание;
- аварийная работа;
- работа по решению правления;
- периодическая проверка;
- contractor work;
- работа по resource result.

Следовательно Appeal не является обязательным owner/lifecycle parent Work.

## 9. Appeal → Work

Appeal может быть одним из bases Work.

```text
Appeal → 0..N Works
Work → 0..N Appeals
```

Несколько Appeals о том же фонаре могут вести к одной Work.

Work completion не закрывает Appeals автоматически; communication process отдельно определяет response/completion.

## 10. Recognized operational need

Отдельная universal entity `Operational Problem` или `Issue` не вводится.

Если конкретный future process требует самостоятельного incident/problem referent, он должен быть обоснован отдельно.

## 11. Purpose

Work должна иметь sufficiently defined purpose, например:

- восстановить освещение;
- устранить утечку;
- заменить повреждённый участок трубы;
- выполнить плановое обслуживание;
- убрать территорию.

Generic text «сделать что-нибудь» не является достаточной domain semantics.

## 12. Target

Work может относиться к предметам других contexts:

- Property/Object;
- common property;
- Engineering System;
- branch/topology element;
- Accounting Point/Meter;
- Community as a whole;
- another supported target.

Universal `Work Target` entity не вводится.

Target relation typed/contextual and does not transfer ownership.

## 13. Text location

Свободное описание места может использоваться как evidence/context.

Если structured domain target уже известен, text location не должен подменять его identity.

## 14. Work recognition

Work возникает как отдельный предметный referent после признания достаточного operational basis/purpose.

```text
Appeal received
≠ Work created automatically
```

Likewise:

```text
Management Decision
≠ Work created automatically
```

unless applicable rule/process explicitly creates it.

## 15. Authority

Следует различать:

- authority to recognize/create Work;
- authority to authorize execution;
- authority to assign performer;
- authority to report completion;
- authority to accept/verify result.

Они не обязаны принадлежать одному Subject.

Technical access ≠ subject-matter authority.

## 16. Emergency work

Emergency Work может начаться без предварительного Management Decision, если applicable authority/rule это допускает.

Post-factum document/decision may record/approve consequences where required, but does not rewrite actual start time.

## 17. Planned Work

Planned Work и actual execution различаются.

```text
planned start/end
≠ actual start/end
```

Планирование не доказывает выполнение.

## 18. Recurring maintenance

Recurring rule/schedule может порождать отдельные Work instances.

Не следует моделировать год планового обслуживания как одну бесконечную Work только ради recurring UI.

## 19. Priority

Priority may be configured/process-specific.

Universal severity/priority taxonomy не вводится.

## 20. Deadline

Deadline/SLA может быть применим, но overdue semantics определяется конкретной policy.

Missed deadline не означает Work failure автоматически.

## 21. Work Assignment

**Work Assignment** — исторически значимое отношение/действие назначения Subject на contextual role по конкретной Work.

Possible roles:

- responsible;
- executor;
- coordinator;
- verifier;
- other process-specific role.

Closed universal role list не вводится.

## 22. Internal employee

Employee may be assigned as executor.

Assignment:

```text
≠ employment relation
≠ remuneration accrual
```

Existing employee/service relation remains owned by its context.

## 23. External contractor

External Subject may perform Work.

Execution role does not automatically make Subject Supplier.

Supplier/Contractual Relationship may separately exist in financial/relationship contexts.

```text
Work executor role
≠ Supplier role automatically
```

## 24. Multiple performers

One Work may have several concurrent/sequential performers.

Universal one-assignee invariant not introduced.

## 25. Assignment history

Reassignment does not overwrite previous assignment.

Should remain explainable:

- who was assigned;
- role;
- applicable interval/time;
- who/what basis changed assignment.

## 26. Execution

Actual work execution is distinct from assignment.

```text
assigned
≠ started
≠ performed
≠ completed
```

## 27. Start

Actual start time may differ from planned start or assignment time.

Record time ≠ actual start time.

## 28. Pause/block

Work may be blocked/paused, e.g.:

- no access;
- waiting material;
- waiting contractor;
- weather;
- safety;
- dependency on another Work;
- other.

Universal blocked-reason taxonomy not introduced.

## 29. Dependency between Works

Works may be related:

- follow-up;
- prerequisite;
- caused-by;
- replacement;
- other local relation.

Universal project/task graph model not introduced.

## 30. Scope change

Materially changing purpose/target can require a new Work or explicit scope correction according applicable policy.

Silent rewriting of completed/started Work scope is not allowed.

## 31. Completion assertion

Performer/responsible Subject may assert that execution is complete.

```text
completion assertion
≠ accepted result automatically
```

Some Work types need independent verification/acceptance, others do not.

## 32. Work Result

**Work Result** — historically significant outcome of execution/completion in context of the Work.

Possible semantics include:

- completed as intended;
- partially completed;
- failed/no result;
- no action required;
- unable to complete;
- other process-specific outcome.

Closed universal result taxonomy not introduced.

Work Result ≠ Document.

## 33. Result evidence

Evidence may include:

- photo;
- act/report;
- telemetry/Reading;
- test result;
- comment;
- contractor document;
- other.

Evidence does not become Work Result automatically.

## 34. Verification / acceptance

Where required, Work Result may be verified/accepted separately.

Acceptance:

- may be by different Subject;
- may have evidence/document;
- may fail/reject completion;
- does not automatically create Payment/Expense.

## 35. Completed but not accepted

Valid state:

```text
execution complete
result awaiting verification
```

Do not force one universal `closed` state.

## 36. Completed work does not imply issue resolved

Work can be technically completed but original Appeal/problem may remain unresolved.

Example: lamp replaced, but power line fault remains.

Appeal/operational basis re-evaluates separately.

## 37. Cancellation

Work may be cancelled on sufficient basis.

Cancellation does not delete history and does not mean source Appeal was invalid.

## 38. No longer required

Work can become unnecessary because:

- condition disappeared;
- another Work solved it;
- scope changed;
- decision reversed;
- other.

This outcome remains distinct from successful execution.

## 39. Reopen vs new Work

After completion, a need may reappear.

Same Work may be reopened/corrected when original completion was premature/incorrect and coherent identity remains.

A new Work is preferred when:

- new occurrence;
- materially new scope/target;
- independent intervention;
- new operational objective.

Universal automatic reopen rule not introduced.

## 40. Follow-up Work

Result can generate one or more follow-up Works.

Parent/follow-up relation does not merge identities.

## 41. Document boundary

Documents may:

- authorize Work;
- describe assignment;
- record completion;
- evidence result;
- formalize acceptance;
- record contractor obligations.

But:

```text
Document ≠ Operational Work
Document ≠ Work Result
```

## 42. Photo boundary

Photo is evidence/representation and not Work Result or Work identity.

Photo timestamp ≠ actual execution time automatically.

## 43. Management Decision boundary

Management Decision may authorize/require Work.

One Decision may produce several Works.

One Work may rely on several decisions/bases.

Decision remains owned by governance context.

## 44. Expense boundary

Operational Work itself is not Expense.

Examples:

- employee performs work within salary;
- contractor generates Expense;
- material purchase generates Expense;
- no monetary consequence.

```text
Work completed
≠ Expense automatically
```

## 45. Financial Obligation boundary

Contractor acceptance may be one basis for Financial Obligation according financial/contract semantics.

Work Result does not create Obligation automatically.

## 46. Payment boundary

Payment may occur before, during or after Work.

Payment does not establish actual completion.

## 47. Estimate / planned cost

Estimated/planned Work cost:

```text
≠ Expense
≠ Financial Obligation
≠ Payment
```

It may support planning/budgeting.

## 48. Materials

Community OS is not inventory/TMC accounting system.

BP does not introduce stock/material-balance entities.

Material purchase/use can be evidenced/linked through documents, Work context and financial facts where needed.

## 49. Resource boundary

Work may act on engineering infrastructure and produce evidence that later affects resource facts.

Example:

```text
repair leak
→ work result
→ later resource observation/reconciliation
```

Work Result does not rewrite Operational Loss/Reading/Consumption directly.

## 50. Operational Loss → Work

Recognized Operational Loss may be basis Work.

Work completion does not automatically close/correct Operational Loss; resource process evaluates later evidence.

## 51. Communication back to initiator

Work progress/result may be basis for communication/notification/response.

Operational context does not own the Appeal response lifecycle.

## 52. Duplicate Appeals

Multiple Appeals about same issue do not require multiple Works.

Link all relevant Appeals to one coherent Work where appropriate.

## 53. Duplicate Work detection

Same target/title/date does not prove duplicate Work.

Duplicate resolution requires purpose/scope/basis/provenance.

## 54. Correction

Incorrect Work target, assignment, time or result is corrected traceably.

Silent deletion/overwrite of historical execution is not allowed.

Universal Correction entity not introduced.

## 55. Pilot ST — street lamp

```text
owner Appeal: lamp not working
→ Work: restore street lamp L-17
→ electrician assigned
→ actual repair
→ result/evidence
→ separate Appeal response
```

Expense may or may not arise separately.

## 56. Pilot ST — water leak

```text
Operational Loss / employee observation
→ emergency Work
→ plumber assigned
→ pipe repair
→ result
→ later resource verification
```

Work does not rewrite quantified/unquantified Operational Loss automatically.

## 57. Pilot ST — planned pump maintenance

Scheduled maintenance rule:

```text
schedule/basis
→ Work without Appeal
→ assigned employee/contractor
→ result
```

## 58. Pilot ST — contractor road repair

```text
Management Decision / approved need
→ Operational Work
→ external contractor assigned
→ contractor documents
→ work result/acceptance
→ separate Expense/Obligation/Payment processes
```

## 59. Pilot ST — multiple Appeals, one Work

Five owners report the same broken water pipe.

```text
5 Appeals
→ 1 coherent Operational Work
```

Completion/result may support responses to all five Appeals.

## 60. Pilot ST — one Appeal, several Works

Appeal reports low pressure.

Investigation leads to:

- inspect pump;
- repair valve;
- flush section.

These may be separate Works with explicit relations.

## 61. Pilot ST — failed first repair

First Work completed with result 'repair attempted', but fault persists.

Depending on real semantics:

- correct/reopen same Work if completion was premature;
- or create follow-up Work for a new intervention.

No universal automatic rule.

## 62. Pilot ST — emergency work before board decision

Pipe bursts at night.

Authorized emergency executor begins Work immediately.

Later board/document action may formalize consequences without moving actual start time.

## 63. Outcomes

### 63.1. Completed and accepted

Execution completed; applicable verification accepts result.

### 63.2. Completed without separate acceptance requirement

Result itself is sufficient under process policy.

### 63.3. Partial / follow-up required

Work produced partial result and may create linked follow-up Work.

### 63.4. Failed / unable

Execution attempted but intended result not achieved.

### 63.5. Cancelled / no longer required

Work ends without successful execution.

### 63.6. Ongoing / blocked

Work remains active with applicable limitation/dependency.

## 64. Provenance

Where materially relevant, should be determinable:

- Work identity;
- Community;
- basis/bases;
- purpose/scope;
- typed target relations;
- recognition time;
- planned times;
- actual start/end;
- authorization basis;
- assignment history;
- responsible/executor Subjects;
- execution/result history;
- verification/acceptance actions;
- related Appeals;
- related Management Decisions;
- related Resource facts;
- Documents/evidence;
- financial links where separately recognized;
- cancellation/reopen/follow-up relations;
- corrections.

## 65. Инварианты

1. Appeal ≠ Operational Work.
2. Operational Work may exist without Appeal.
3. One Appeal may relate to several Works.
4. Several Appeals may relate to one Work.
5. Management Decision ≠ Operational Work.
6. Document ≠ Operational Work.
7. Work Assignment ≠ employment relation.
8. Work executor role ≠ Supplier role automatically.
9. Assigned ≠ started ≠ completed.
10. Completion assertion ≠ acceptance automatically.
11. Work Result ≠ Document.
12. Work completion ≠ Appeal closure automatically.
13. Work completion ≠ Expense automatically.
14. Work Result ≠ Financial Obligation automatically.
15. Payment ≠ evidence of completion automatically.
16. Planned cost ≠ Expense.
17. Work does not own inventory/TMC accounting.
18. Operational Loss may be basis Work, but Work does not rewrite loss automatically.
19. Resource result may be basis Work, but Work does not own resource fact.
20. Emergency Work may exist without prior Management Decision under applicable authority.
21. Reassignment does not erase assignment history.
22. Cancellation does not erase Work history.
23. Reopen and new follow-up Work are distinct possibilities.
24. Same title/target/date ≠ duplicate proof.
25. Universal Problem/Incident entity is not introduced.
26. Universal Work Request entity is not introduced.
27. Universal Work Target entity is not introduced.
28. Universal material inventory entity is not introduced.
29. Universal status machine is not introduced.
30. Operational Work requires a domain owner; existing contexts do not naturally own it without boundary distortion.

## 66. Internal review conclusions

1. A standalone Operational Work referent is justified.
2. Work and Appeal must remain many-to-many capable and independently identified.
3. Work can originate from non-communication bases.
4. Work Assignment is a specialized historical relation/action, not a Subject subtype.
5. Internal employee and external contractor use the same execution-role semantics while preserving their own relations.
6. Work Result is distinct from documents and financial consequences.
7. Completion and acceptance are separate where process requires.
8. No universal rigid status machine is required; current state can be a projection over significant actions/outcomes.
9. No universal Problem/Incident/Work Request/Inventory entities are required now.
10. Existing top-level contexts do not provide a clean owner for Operational Work.
11. Proposed new context `Операционная деятельность (Community Operations)` is the preferred architecture option.
12. Because #11 changes ADR-002 top-level context map, it remains a proposal pending architecture acceptance/review.

## 67. Normative synchronization status

**Not performed yet.**

Reason: proposed 11th top-level context is a material architectural change.

Before normative sync, the project should accept or reject the architecture proposal in `STAGE-8-OPERATIONAL-WORK-ANALYSIS.md`.

If accepted, expected sync:

- ADR-002 — add Community Operations context;
- ADR-009 — Appeal → Operational Work boundary note;
- DOMAIN_MODEL — Operational Work / Work Assignment / Work Result;
- TERMINOLOGY;
- VISION, if operational work capability should be made explicit;
- REFERENCE_CANDIDATE_MATRIX — close REF-OPS-001.

## 68. Review

One frozen independent multi-review round is appropriate because the proposal changes the top-level domain context map.

Second review round only if substantial unresolved disagreement remains.

## 69. Следующий шаг

1. freeze current Stage 8 package;
2. perform one independent multi-review round;
3. consolidate review against GitHub;
4. user/project accepts or rejects proposed Community Operations context;
5. only then perform normative synchronization;
6. merge Stage 8;
7. proceed to Stage 9.
