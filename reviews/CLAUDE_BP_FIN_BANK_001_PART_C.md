# Claude Review BP-FIN-BANK-001 — Part C — ADR-011 + ADR-016

Используй вместе с Part A, B, D.

# ADR-011

### 1. Идентичность внешней стороны

Для конкретной интеграции должна быть определима внешняя сторона взаимодействия в объёме, необходимом для external identifiers, contracts, provenance и исторической объяснимости.

Это минимальная интеграционная идентичность, а не универсальная предметная сущность `External System`.

Внешняя сторона:

- не является субъектом;
- не является bounded context;
- не получает предметную семантику Community OS;
- не становится владельцем импортируемого предметного факта;
- имеет конкретные свойства только в локальной семантике интеграции.

Автоматизированная интеграция также не становится субъектом или фиктивным пользователем системы.

---

### 2. Внешний идентификатор

**Внешний идентификатор** — квалифицированное значение или отношение в области конкретной интеграции.

Его смысл может определяться сочетанием:

- области интеграции;
- внешней стороны или namespace;
- вида внешнего объекта, если он значим;
- значения идентификатора.

Внешний идентификатор не является глобальным идентификатором объекта Community OS и сам по себе не определяет внутреннюю идентичность.

Один внутренний объект может иметь разные внешние идентификаторы в разных интеграциях. Связь internal—external может быть исторически значимой. Ошибочное сопоставление исправляется прослеживаемо и не переписывает прошлую интерпретацию молча.

Изменение external device ID не изменяет автоматически идентичность прибора или точки учёта. Глобальный реестр внешних идентификаторов и обязательная standalone entity не вводятся.

---

### 3. Полученная внешняя информация

Сохраняется различие:

```text
Внешняя информация
≠ Полученная внешняя информация
≠ Признанный предметный факт
```

Общая семантическая последовательность имеет вид:

```text
Внешнее представление
→ полученная внешняя информация
→ validation / mapping
→ domain recognition или rejection
→ предметные последствия
```

Получение не означает признание. Domain recognition принадлежит bounded context, владеющему соответствующей предметной семантикой.

Если rejected или unrecognized information исторически значима, сохраняются достаточные сведения о её содержании, происхождении и результате обработки. Из этого не следуют универсальные `Integration Receipt`, `Imported Fact`, `External Fact`, `Message` или `Event`.

---

### 4. Mapping, validation и domain recognition

**Mapping** обозначает интерпретацию или сопоставление внешнего представления с интеграционными и предметными понятиями конкретного процесса. Это не обязательная универсальная сущность.

Validation внешнего представления, validation интеграционного смысла и предметная допустимость признания могут различаться.

Mapping не создаёт предметный факт автоматически. Предметный контекст определяет:

- достаточно ли сведений для recognition;
- какой предметный факт, отношение или результат может возникнуть;
- требуется ли действующий субъект или предметное основание;
- какие последствия имеет rejection;
- какие дальнейшие действия допустимы.

Признанный предметный факт сохраняет идентичность и историю своего контекста и не становится импортированной универсальной сущностью.

---

### 5. Provenance и историческая объяснимость

Для исторически значимого интеграционного действия или результата должны быть определимы, где применимо:

- внешняя сторона или источник;
- внешний идентификатор;
- исходное внешнее время, если известно;
- момент получения;
- полученное значение или представление;
- применимая версия semantic contract;
- применимая версия mapping;
- результат validation и recognition;
- связь с correction, cancellation или replacement;
- автоматический характер обработки;
- фактически действующий субъект и основание, если предметная операция требует субъекта.

Не все сведения обязательны для любой интеграции. Перечень не образует универсальную запись, Integration Event, bitemporal model или History/Audit Context.

Предметная объяснимость не требует сохранения старых runtime, adapter binaries или технического окружения.

---

### 6. Duplicate и redelivery

Повторное получение внешних сведений не должно автоматически создавать новый предметный факт. Одновременно совпадение значений само по себе не доказывает duplicate.

Сохраняются различия:

```text
Redelivery
≠ Duplicate
≠ External correction
≠ Replacement
≠ New information
```

Критерии идентичности и deduplication определяются конкретным integration semantic contract и соответствующим предметным процессом. Они могут учитывать внешний идентификатор, версию, sequence, время, содержание и другие значимые признаки.

Настоящий ADR не определяет idempotency key, hash, database constraint или inbox implementation.

---

### 7. Corrections и re-recognition

Сохраняются различия:

```text
Redelivery
≠ External correction
≠ Cancellation
≠ Replacement
≠ Re-import
≠ Re-recognition
```

Если внешняя информация уже привела к признанному предметному факту, последующее исправление внешнего источника не переписывает этот факт молча.

Исходная внешняя информация и её provenance сохраняются, если они исторически значимы. Контекст-владелец решает, требуется ли correction, recalculation, cancellation, replacement, новый предметный факт либо отсутствие предметного изменения.

Повторное recognition старых данных с новой версией mapping должно быть отличимо от первоначального recognition. Универсальный `Correction Event` не вводится.

---

### 8. Виды импорта и синхронизации

Различаются:

```text
Migration import
≠ Manual bulk import
≠ Regular synchronization
≠ Operational integration
```

Первоначальная миграция является архитектурно значимым сценарием Community OS. Она может включать объекты собственности, субъектов, отношения собственности и пользования, лицевые счета, исторические платежи, показания, приборы, связи с точками учёта и другие исторически значимые данные.

Строка входного файла не является предметным фактом. CSV и XLS являются входными представлениями или форматами, а не предметной моделью.

Импорт должен допускать на семантическом уровне:

- identification;
- validation;
- mapping;
- preview или dry-run, если это требуется процессом;
- recognition;
- отдельный результат элемента;
- partial success;
- provenance;
- correction;
- безопасный повторный запуск или re-import.

Эти возможности не образуют универсальный Import Workflow.

---

### 9. Batch import и partial success

Массовый импорт может иметь составной результат с независимыми результатами отдельных элементов.

Atomicity определяется конкретным процессом: один импорт может допускать partial success, другой — требовать all-or-nothing.

Повторная обработка исправленных элементов не должна автоматически создавать duplicates для уже успешно признанных элементов. Для каждого значимого результата должна быть объяснима связь с соответствующим входным элементом и попыткой обработки.

Настоящий ADR не определяет транзакции базы данных, UI предварительного просмотра, парсер или техническую структуру batch.

---

### 12. Integration semantic contract

Сохраняется различие:

```text
Domain contract
≠ Integration semantic contract
≠ External protocol/API contract
≠ Transport/schema
```

Общий architectural semantic contract задаёт границы, но не требует универсальной сущности `Integration Contract`.

Конкретный contract принадлежит конкретной интеграции и может определять, где применимо:

- смысл обмениваемой информации;
- внешнюю сторону;
- семантику идентификаторов;
- mapping;
- validation и recognition;
- duplicate, redelivery и correction semantics;
- acknowledgement и ожидаемый outcome;
- provenance;
- authoritative side и ownership;
- reconciliation semantics.

---

### 13. Версии contract и mapping

Версия semantic contract или mapping должна быть исторически определима, если её изменение могло изменить validation, recognition, interpretation или предметный результат.

При этом:

```text
API version ≠ Semantic mapping version
Schema version ≠ автоматически предметно значимая версия
Mapping ≠ автоматически универсальное Rule
```

Если mapping имеет семантику правила, применяются требования ADR-005 в соответствующем локальном контексте. Техническое хранение версий относится к Stage K.

---

### 14. Failure, rejection и unknown outcome

Там, где это применимо, различаются:

```text
Not attempted
≠ Failed
≠ Rejected
≠ Unknown
≠ Confirmed
```

Это семантические различия, а не обязательные состояния универсальной Integration State Machine.

`Unknown outcome` не является failure. Если после внешнего запроса неизвестно, выполнила ли внешняя сторона действие:

- результат остаётся unknown;
- повтор не считается автоматически новой предметной операцией;
- повтор может создать внешний duplicate;
- последующая reconciliation должна установить фактический результат, когда это возможно.

Недоступность внешней системы не изменяет молча уже признанные предметные факты. Timeout, retry strategy, circuit breaker и техническое хранение состояния относятся к Stage K.

---

### 15. Reconciliation

Reconciliation в Stage J обозначает context-specific сопоставление известных состояний и сведений для установления результата внешнего взаимодействия или разрешения расхождения.

Она не является универсальным workflow, state machine или предметной сущностью. Конкретный контекст определяет сравниваемые сведения, допустимые источники, правила признания и последствия.

---

### 16. Authority и source of truth

Глобальная иерархия источников истины не вводится.

Сохраняются различия:

```text
Источник информации
≠ Подтверждающие сведения
≠ Authoritative source для конкретной информации
≠ Основание recognition
≠ Владелец предметного факта
≠ Производный результат
```

Authority определяется предметным контекстом, видом информации, конкретным integration semantic contract и применимыми правилами.

Например:

- банк может быть authoritative относительно собственного сообщения о банковской операции, но это сообщение не является автоматически банковской транзакцией Community OS, Payment или Allocation;
- BAS может быть authoritative относительно собственного бухгалтерского документа, но не Financial Obligation Community OS;
- источник телеметрии сообщает сведения об измерении, но ресурсный контекст признаёт Reading;
- IdP аутентифицирует техническую идентичность, но не создаёт Subject, ownership или Domain Power;
- Community OS может быть authoritative для начисления, экспортируемого в BAS.

Эти примеры не образуют закрытый перечень или жёстко заданную универсальную иерархию.

---

### 17. Двусторонняя синхронизация и конфликты

Более новое значение не получает приоритет только потому, что оно новее. Универсальный last-write-wins запрещён.

При расхождении должны быть определимы, где применимо:

- какие сведения сравниваются;
- относятся ли они к одному предметному понятию;
- authoritative side;
- исходное время источника;
- время получения;
- применённые версии mapping;
- является ли различие correction, delay, conflict или допустимым расхождением представлений;
- кто или какое правило разрешает расхождение;
- что сохраняется исторически.

Разрешение принадлежит соответствующему предметному контексту или конкретной интеграции. Универсальная сущность `Conflict` не вводится.

---

### 18. Integration security boundary

Внешняя сторона и техническая идентичность взаимодействия должны быть определимы там, где это существенно.

Сохраняются различия:

```text
Authentication внешнего источника
≠ Достоверность содержания
≠ Domain recognition
≠ Subject
≠ Domain Power
≠ Domain admissibility
```

Интеграция или внешняя система не является субъектом. Импортированные сведения не создают предметное полномочие. Автоматизация не заменяет атрибуцию конкретного субъекта, если предметная операция требует такого субъекта.

Trust и authority внешнего источника действуют только в context-specific scope. Technical access и credentials не подменяют предметную допустимость.

Настоящий ADR не выбирает OAuth, OIDC, SAML, API keys, certificates, MFA, secret storage или network security implementation.

---

### 19. Временная семантика

Где это значимо, различаются:

- время внешнего события или измерения;
- время формирования сведений внешней стороной;
- время передачи;
- время получения;
- время обработки;
- время recognition;
- время correction, re-import или re-recognition;
- время попытки доставки;
- время acknowledgement.

Не все моменты обязательны для каждой интеграции. Они не образуют универсальную bitemporal model. Время записи в базу данных не считается автоматически предметным или интеграционно значимым временем.

---

### 20. Multi-community scope

External identifiers, mappings, contracts, authority, credentials, scopes и integration relations не считаются автоматически глобальными между сообществами.

Область конкретной интеграции должна быть определима без глобальной иерархии scope. Один внешний источник может взаимодействовать с несколькими сообществами, но применимость идентификаторов, mappings и authority определяется отдельно.

Tenant tables и техническая изоляция относятся к Stage K.

---

## Архитектурные инварианты

1. Предметная семантика, интеграционная семантика, внешний контракт, транспорт и техническая реализация различаются.
2. Внешняя сторона интеграции не является субъектом или bounded context.
3. Внешний идентификатор не является глобальным идентификатором объекта Community OS.
4. Внешняя информация, полученная информация и признанный предметный факт различаются.
5. Recognition принадлежит bounded context — владельцу предметной семантики.
6. Mapping не создаёт предметный факт автоматически.
7. Повторное получение не создаёт новый предметный факт автоматически.
8. Совпадение значений само по себе не доказывает duplicate.
9. Redelivery, duplicate, correction, replacement и new information различаются.
10. Исторически значимая внешняя correction не переписывает признанный факт молча.
11. Migration, bulk import, synchronization и operational integration различаются.
12. Partial success и atomicity определяются конкретным import process.
13. Export, Publication, Delivery, Document и Document Representation различаются.
14. Не каждый export является исторически значимым.
15. Создание, отправка, принятие provider, доставка, получение, прочтение и юридическое уведомление различаются.
16. Повторная доставка не создаёт новое Notification автоматически.
17. Integration semantic contract не является универсальной предметной сущностью.
18. Значимая версия contract или mapping исторически определима, если влияет на результат.
19. API version и semantic mapping version различаются.
20. Unknown outcome не является failure.
21. Универсальная Integration State Machine не вводится.
22. Недоступность внешней системы не меняет признанные предметные факты молча.
23. Глобальная иерархия источников истины не вводится.
24. Более новое значение не имеет универсального приоритета.
25. Authentication внешнего источника не доказывает достоверность или recognition.
26. Интеграция, сервис или автоматический механизм не являются субъектами.
27. External identifiers, mappings, contracts и authority не глобальны между сообществами автоматически.
28. Предметная история интеграции не заменяется техническим журналом.
29. Внешняя банковская операция и полученная банковская информация не являются автоматически банковской транзакцией Community OS.
30. Признанная банковская транзакция принадлежит финансовому контексту и не является автоматически Payment или Allocation.

---

# ADR-016

### 1. Persistent Work contract

Business-significant asynchronous obligation, которая должна пережить process termination/restart/deployment, фиксируется как Persistent Work или equivalent durable delivery obligation.

Минимальный общий technical contract позволяет определить:

- stable Operation identity;
- owning module, work type и contract version;
- Platform или trusted Community Scope;
- eligibility/scheduling и execution/outcome condition;
- Attempts;
- correlation и causation;
- failure/outcome classification;
- необходимые безопасные runtime references.

Точный состав physical record не определяется. Specialized payload/state/checkpoints, domain meaning/effects, recognition, correction и compensation принадлежат owning module/context. Общий runtime не получает ownership domain facts и не становится universal Workflow.

Persistent Work obligation не считается исполненной только потому, что work была claimed, external request отправлен или transport acknowledgement получен. Completion evidence определяется owning contract.

---

### 2. Persistent Work Operation и Attempt

Operation identity стабильна на протяжении automatic retries и допустимых resumes. Каждая execution attempt имеет собственную identity и сохраняет outcome/failure evidence, достаточные для диагностики без secret material.

Resume сохраняет Operation identity только при одновременном сохранении:

- того же unresolved obligation;
- того же semantic intent;
- того же idempotency boundary.

Materially changed intent/significant input, Correction, Replacement или deliberate new Replay создают новую linked Operation identity. Они не маскируются под Retry старой Operation. Prior Attempts и исходная Operation не переписываются.

Claim/lease может ограничивать concurrent execution, но сам по себе не доказывает exactly-once effect: Worker может завершиться после commit и до acknowledgement.

---

### 4. Duplicate recognition / Inbox

Inbox не является universal mandatory component. Durable duplicate recognition обязательна там, где repeated inbound/durable delivery иначе способна создать unintended second effect и это нельзя безопасно установить из authoritative local state.

Допустимы Inbox, local uniqueness по qualified Operation/external identity, guarded state transition или другой semantically equivalent mechanism. Equal payload/hash сам по себе не доказывает duplicate.

Owning integration contract различает redelivery, duplicate, correction, replacement и new information. Повторно полученная external information не становится автоматически новым recognized domain fact и не теряется как duplicate без contract evidence.

---

### 5. At-least-once и idempotency

Durable delivery и Persistent Work предоставляют **at-least-once delivery/execution exposure**. После crash, timeout или lost acknowledgement та же Delivery или Operation может быть dispatched, claimed или attempted повторно.

Community OS не обещает system-wide:

- exactly-once execution;
- exactly-once delivery;
- exactly-once external effect.

Specific bounded effect может иметь effectively/exactly-once committed result только если его concrete local transactional или provider contract действительно обеспечивает это. Такая гарантия не становится свойством общего runtime.

Если повтор может создать unintended effect, owning contract определяет idempotency boundary и использует применимую комбинацию stable Operation identity, local uniqueness, guarded transition, provider idempotency, durable duplicate recognition или reconciliation. Idempotency key является qualified contract value, а не universal identity или payload hash.

---

### 6. Failure / outcome semantics

Архитектурно различаются, без требования одного universal enum/state machine:

- pending/eligible obligation;
- claimed/running Attempt;
- completed/succeeded Operation согласно owner-defined evidence;
- known transient failure;
- known permanent validation failure/rejection;
- authorization/admissibility/lifecycle denial;
- stale Placement Generation или incompatible contract/schema/application state;
- revoked credential/Secret;
- provider rate limit/unavailability;
- duplicate/redelivery;
- poison/malformed work;
- partial completion;
- Unknown Outcome;
- cancellation requested и execution stopped;
- superseded work;
- terminal/quarantined condition и manual intervention requirement.

Known transient failure может retry-иться согласно context policy и после revalidation. Permanent rejection, mandatory denial, incompatible work или poison input не retry-ятся бесконечно. Superseded work сохраняется traceably, а не удаляется молча.

Exact status enum, retry count, delay/backoff, circuit breaker, timeout и exception mapping принадлежат Implementation Baseline/context policy.

---

### 7. Terminal / quarantine

Work, которую нельзя безопасно автоматически продолжать, сохраняется в explicit terminal/quarantined condition:

> automatic processing stopped; explicit resolution is required.

Сохраняются stable Operation identity, Attempt history, classification/reason, correlation/causation, safe diagnostics и допустимый resolution path. Quarantine не означает deletion или обязательную forever-impossibility.

Manual Resume продолжает ту же Operation только внутри того же obligation/intent/idempotency boundary. Replay/Correction/Replacement/New Intent создаёт linked new Operation. Quarantined, Cancelled/Stopped и Compensated являются разными semantics и могут требовать разных resolution actions.

---

### 8. Unknown Outcome и reconciliation

Unknown Outcome означает, что external effect мог произойти, но доступных evidence недостаточно для Known Success или Known Failure. Он не является failure, success и не превращается автоматически в permanent failure после N retries.

Когда contract поддерживает, resolution следует использовать в порядке применимости:

```text
stable provider idempotency / correlation
→ provider status or query
→ later independent evidence and reconciliation
→ attributable manual resolution
```

Если provider не позволяет доказать outcome, а повтор способен создать duplicate material effect, blind retry запрещён. Operation остаётся unresolved/quarantined до безопасного resolution.

Bank mutation, notification provider, DNS/API mutation и object upload определяют собственные success evidence и reconciliation semantics. Notification send/provider acceptance не доказывает delivery/receipt/read/legal notification; object existence не доказывает recognized domain completion.

---

### 9. Causation, authority и execution revalidation

Operation может сохранять historically fixed acceptance/causation context:

- initiating Technical Identity/User Account;
- actual/represented Subject и basis только где они действительно применимы;
- original command/request и Operation identity;
- факт допустимого acceptance;
- rule/configuration/mapping/integration-contract versions, необходимые для historical determinability.

Captured acceptance/authorization является evidence/causation и не является credential, reusable delegation или evergreen authorization token. Captured human credentials не сохраняются и не используются.

Worker исполняет под собственной Workload Identity через те же Application/Domain boundaries, что synchronous entry. Перед execution или irreversible effect каждая Attempt re-resolves/revalidates declared current-sensitive gates, где применимо:

- Community lifecycle и Entitlement execution gate;
- current technical Access Rights;
- current domain Power/Representation/admissibility;
- current authoritative domain state;
- Placement и Placement Generation;
- integration enabled/configuration state;
- authorized Secret Reference/credential lifecycle;
- work-contract/schema/application compatibility.

Owning operation contract явно определяет authorization boundary. Already-final accepted durable command может технически продолжаться, если именно acceptance окончательно зафиксировал authority/intent. Delayed effect, для которого authority должна существовать непосредственно при effect, revalidates current authority.

Same Operation identity при Retry/Resume не bypass revalidation. Mandatory domain denial не может быть overridden Worker, retry, replay, support elevation, cancellation processing или другим technical runtime. Fake Subject/System User не создаётся.

---

### 16. History, audit, provenance и observability

Различаются:

1. Persistent Work/Process state — authoritative technical state obligation, eligibility, attempts, progress и resolution;
2. context-owned Integration Provenance — external identity/request/response/evidence/mapping/recognition;
3. Domain History — semantic facts, versions, corrections и attribution;
4. Security Audit — security-sensitive technical actions;
5. Operational logs, metrics, traces и alerts — diagnosis/health.

Для operator diagnosis доступны stable Operation/Attempt identities, owner/type/version, scope, eligibility, failure/outcome classification, safe diagnostics, correlation/causation, terminal/cancellation state и resolution linkage. Raw logs не являются durable work record, business fact или единственным evidence unresolved obligation.

Community administrators/users получают только purpose/scoped views по owning contracts, а не raw infrastructure log или unrestricted Security Audit.

---

## Архитектурные инварианты

1. Significant asynchronous obligation, которая должна пережить process loss, durable.
2. Один Persistent Work Item представляет одну stable Operation; Attempt и Delivery Record имеют отдельные identities.
3. Retry/Resume сохраняет Operation только внутри того же intent/obligation/idempotency boundary.
4. Correction, Replacement, New Intent и materially new Replay создают linked new Operation.
5. Worker использует те же Application/Domain boundaries и исполняет под Workload Identity, не Account/Subject.
6. Одна ACID transaction ограничена одной resolved Transactional Persistence Boundary.
7. Commit-coupled publication intent atomic с local state через outbox/equivalent; dispatch may repeat.
8. At-least-once delivery/execution exposure является baseline; universal exactly-once отсутствует.
9. Idempotency и duplicate recognition определены qualified effect/contract; universal Inbox отсутствует.
10. Redelivery, duplicate, correction, replacement и new information distinct.
11. External/received information и recognized domain fact distinct.
12. Known Success, Known Failure и Unknown Outcome distinct; Unknown не становится failure по retry count.
13. Blind retry Unknown Outcome, способный duplicate material effect, запрещён.
14. External effect не выполняется внутри open local domain transaction.
15. Persistent Work state, Domain History, Integration Provenance, Security Audit и Operational Log distinct.
16. Historically significant rule/configuration/mapping/contract version determinable.
17. Каждая Attempt применяет declared current-sensitive revalidation.
18. Mandatory domain denial не может быть overridden.
19. Lifecycle/Entitlement denial не уничтожает Power/history; suspended/archive блокирует normal effects по умолчанию.
20. Community Scope trusted explicitly; RLS является defense-in-depth, не authorization.
21. Current Placement/Generation resolved; stale Generation fenced.
22. Cross-Placement FK/SQL/ACID/2PC не предполагаются.
23. Significant multi-step processes используют specialized resumable coordinators; universal Workflow отсутствует.
24. Cross-store partial state detectable/recoverable.
25. Нет global/per-Community FIFO; ordering, exclusivity и concurrency distinct/scoped.
26. Fairness/backpressure не задают physical tenant topology или SLA.
27. Cancellation Requested, Execution Stopped и Compensation distinct; universal rollback отсутствует.
28. Secret material не входит в work/log/audit/history; privileged interventions authorized/attributed/audited.
29. Unsupported work version fail closed/quarantine без silent reinterpretation/loss.

# End Part C
