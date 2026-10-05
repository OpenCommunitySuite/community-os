# Community OS — Testing strategy

**Статус:** Baseline / Действует

## 1. Принцип

Tests выбираются по гарантии, которую необходимо доказать, а не по фиксированной test pyramid, названию framework или arbitrary coverage percentage. Один тест может покрывать несколько levels; название test type не заменяет доказательство relevant boundary.

.NET testing baseline: xUnit.net v3 линии 4.x, Microsoft Testing Platform v2 и standard entry point `dotnet test`. Architecture tests используют ArchUnitNET с xUnit v3 integration; PostgreSQL integration tests — Testcontainers for .NET. Concrete package versions и PostgreSQL image фиксируются reproducibly при bootstrap. JavaScript test framework и CI vendor остаются deferred.

Mandatory external assertion и mocking libraries отсутствуют. Используются xUnit assertions; простые fakes/stubs предпочтительны, когда достаточны. Fluent Assertions 8 не входит в baseline из-за paid commercial-use licensing. Любая обязательная development/test dependency должна быть Open Source и разрешать бесплатное commercial use либо требовать отдельного обоснованного решения.

## 2. Test classes

### Unit / Domain

Проверяют pure domain calculations, rules, invariants, temporal selection, rounding и corrections без infrastructure. Historically significant version/rule cases имеют explicit examples. Unit test не доказывает persistence, authorization или integration behavior.

### Application / use case

Проверяют orchestration, domain admissibility, authorization coordination, transaction intent и result contracts через controlled ports. Они сохраняют distinctions Account/Subject/Power/Entitlement и не bypass mandatory denial ради fixture simplicity.

### Architecture / structural

Machine-checkable проверки должны объективно контролировать:

- Domain не зависит от Application, Infrastructure или Hosts;
- Application не зависит от Infrastructure или Hosts;
- direct cross-module implementation dependencies запрещены;
- separate Web/API и Worker compositions и дополнительные module/host rules — только там, где их можно корректно формализовать.

Compiler/project graph является первой линией защиты; ArchUnitNET tests — второй. Architecture tests не должны имитировать гарантию, которую выбранная physical project graph фактически не обеспечивает.

### PostgreSQL integration и RLS

Проверки выполняются через Testcontainers for .NET против real PostgreSQL 18.x с concrete verified reproducible image pin. Они покрывают migrations, transactions, optimistic concurrency, targeted locking where introduced, trusted transaction-scoped Community context, connection reuse/pooling safety, RLS isolation и fail-closed behavior.

EF InMemory, SQLite и mocks могут ускорять отдельные tests, но не являются доказательством PostgreSQL/RLS semantics.

### API contract/integration

Проверяют explicit DTO, Problem Details/categories, trusted Community resolution, authentication/session/CSRF boundary, authorization/admissibility, concurrency preconditions, scoped idempotency и declared Web/Public/Integration compatibility.

Owned frontend rollout tests должны учитывать older JavaScript bundle в пределах declared short compatibility window.

### Persistent Work

По мере появления mechanisms проверяются:

- atomic authoritative change + Outbox obligation;
- at-least-once redelivery и idempotent/guarded effect;
- distinct Operation/Attempt identities;
- claim recovery после Worker failure;
- retry classification/delay/quarantine;
- Unknown Outcome без blind retry;
- cancellation versus compensation;
- Placement/Generation и current-sensitive revalidation;
- compatible durable payload evolution.

Tests не утверждают exactly-once.

### Authentication и security

Проверяют Account/Subject separation, method lifecycle/linking, password/session revocation, cookie/CSRF properties, server-side authorization, tenant scope, secret redaction, Security Audit boundary и privileged flows по мере их реализации.

Security test не использует real credentials, OTP, tokens или PII.

### Integration adapters и imports

Controlled contract tests используют fixtures/fakes/recorded synthetic responses, проверяют mapping/version/provenance, duplicate/correction distinctions и failure/Unknown Outcome semantics.

Initial Community Register Import дополнительно проверяет dynamic template/version/config context, preview, prohibited field mapping, no Account auto-link, rerun/correction rules и reuse Application use cases.

Telegram, bank, BAS и другие live systems не являются dependency normal CI. Sandbox/live verification — separate, explicitly authorized suite с isolated credentials и operational controls.

### Frontend

Проверяются critical components и user flows, API/error/concurrency/session integration, localization fallback, Ukrainian/Russian switching, responsive core journeys и applicable accessibility properties. Exact browser/e2e mix определяется по risk.

### Smoke, migration и recovery

Artifact smoke test подтверждает startup/readiness основных hosts и supported contract/schema combination. Migration compatibility tests следуют expand/deploy/backfill/contract. Backup/restore/DR verification относится к production-readiness suite и runbooks, не заменяется unit tests.

## 3. Fast и full suites

Могут существовать fast local/PR suite и более полные integration/security/migration/recovery suites. Classification определяется duration/dependencies/risk; critical merge guarantee не может быть навсегда вынесена в необязательный manual run.

Standard entry points — `dotnet build` и `dotnet test`. Exact suite selection, parallelism, retries, test database lifecycle и schedule фиксируются по мере появления соответствующих tests.

## 4. Test data и observability

Test data synthetic, deterministic where required и scoped. Real PII/production exports запрещены без отдельного controlled privacy process.

Test failures не должны печатать Secrets, credentials, session values или sensitive payload. Operational test logs не становятся Domain History, Security Audit или provenance.

## 5. Coverage policy

Mandatory numeric code-coverage percentage initial baseline отсутствует. Coverage reports допустимы как diagnostic signal. Acceptance опирается на explicitly mapped guarantees, boundary/risk cases и meaningful review, а не на число строк.

## 6. Definition of test readiness

Implementation slice готов к PR, когда:

- applicable guarantees перечислены;
- нужные test classes выполнены воспроизводимо;
- known untested risk явно deferred/accepted, а не скрыт;
- architecture checks не обходятся;
- diff не содержит credentials/PII/unrelated implementation.

## 7. Bootstrap test boundaries

Первый Application Bootstrap создаёт `CommunityOS.ArchitectureTests` и `CommunityOS.IntegrationTests`. Integration suite поднимает pinned PostgreSQL 18.x, открывает real Npgsql connection и выполняет minimal connectivity smoke test без domain schema.

`CommunityOS.UnitTests` появляется только вместе с real Domain behavior; пустой project и fake behavior ради демонстрации теста не создаются. Test project per Functional Module также не создаётся заранее.

## 8. Приёмочные сценарии кассы, финансов и контрольной сверки

Уточнение от 05.10.2026 связывает существующие предметные правила с проверками будущих implementation slices. Оно не расширяет bootstrap или пилот, не меняет статусы BP/ADR и не утверждает наличие выполненных автоматических тестов. В PR соответствующей реализации каждый применимый сценарий должен быть связан с тестом либо явно обоснованным deferred risk по разделу 6.

| ID | Сценарий и ожидаемый результат | Основание |
|---|---|---|
| MARKET-CASH-01 | После реального приёма наличных, признания Payment и распределения исправляется/отзывается только ПКО. Cash Acceptance, корректный Payment и его распределения сохраняют финансовый эффект; исторически значимая редакция документа не исчезает. Сам по себе отзыв ПКО не восстанавливает долг. | [BP-DOC-CASH-001](../business-processes/BP-DOC-CASH-001-CASH-DOCUMENT-FORMALIZATION.md), разделы 28–31 |
| MARKET-CASH-02 | Установлено ошибочное признание Payment, имеющего Allocation/Advance. Исправление проходит специализированный процесс, сохраняет source evidence и историю, проверяет зависимые результаты и не оставляет необъяснимого действующего зачёта. Не превращается в Refund автоматически. | [BP-FIN-002](../business-processes/BP-FIN-002-PAYMENT-RECOGNITION-CORRECTION.md), разделы 7, 13–18, 25–27 |
| MARKET-FIN-01 | Повторная доставка, повтор команды и конкурентные попытки одного intent не создают второго предметного эффекта. Две реальные операции одинаковой суммы/даты не сливаются автоматически. Unknown Outcome требует разрешения исхода до небезопасного повторения. | [BP-FIN-BANK-001](../business-processes/BP-FIN-BANK-001-BANK-TRANSACTION-RECOGNITION.md), разделы 14–16, 47–49; [ADR-016](../architecture/adr/ADR-016.md) |
| MARKET-FIN-02 | При подтверждении сопоставления выбранного набора банковских операций соседние невыбранные операции не изменяются. Если предметно целостное исправление требует расширить набор, расширение явно предъявляется и подтверждается; скрытый каскад не допускается. Проверить изменение входов между выбором и подтверждением. | BP-FIN-BANK-001; BP-FIN-002, разделы 26–27 |
| MARKET-FIN-03 | Одинаковые внешние идентификаторы в разных областях банковских счетов/источников не смешиваются. Неоднозначная привязка не признаётся автоматически. Исправление счёта/распределения сохраняет происхождение и не смешивает банковский счёт, Personal Account и назначение суммы. | BP-FIN-BANK-001, разделы 6, 14–17, 28; [BP-FIN-ALLOCATION-001](../business-processes/BP-FIN-ALLOCATION-001-INITIAL-PAYMENT-ALLOCATION.md); BP-FIN-002 |
| MARKET-FIN-04 | Операция на границе месяца поступает в следующем месяце; отдельно проверяется позднее исправление. Время банковского события, банковские даты и время фиксации не подменяют друг друга; выбор периода результата объясним применимым правилом. Источник с точностью до даты не получает вымышленное точное время. | BP-FIN-BANK-001, раздел 13; BP-FIN-002, разделы 11.4, 30; [ADR-004](../architecture/adr/ADR-004.md) |
| MARKET-FIN-05 | Если реализуемый процесс имеет согласование по сумме: проверить значения ниже, на границе и выше порога, а также изменение суммы/значимых входов после предварительного согласования. Подтверждение на устаревшем основании отклоняется либо требует новой проверки по применимой policy. | BP-FIN-002, разделы 27–28; [ADR-005](../architecture/adr/ADR-005.md), [ADR-010](../architecture/adr/ADR-010.md) |
| MARKET-RECON-01 | Повтор ввода одного наблюдения не удваивает вклад. Исправленное показание отличается от дубля; пересчёт сохраняет объяснимую связь с исходными входами/результатом, причиной и версией правила. Финансовые результаты не исправляются автоматически. | [BP-READING-001](../business-processes/BP-READING-001-READING-RECOGNITION.md), [BP-READING-003](../business-processes/BP-READING-003-CONTROL-OBSERVATION.md), [BP-RECON-001](../business-processes/BP-RECON-001-CONTROL-RECONCILIATION.md) |
| MARKET-RECON-02 | Проверить отсутствующие и исключённые точки, разные моменты снятия в допустимом окне, смену топологии, несколько общих счётчиков и насосную ветвь. Пропуск не становится нулём; используются применимые исторические связи, явно показываются ограничения полноты и качества. | BP-RECON-001, разделы 6–19, 31–32; [ADR-007](../architecture/adr/ADR-007.md) |

MARKET-FIN-04 не вводит регламентированное закрытие бухгалтерских периодов. MARKET-FIN-05 не вводит универсальный денежный порог или новый обязательный процесс согласования. MARKET-FIN-02 применяется к реализации выбора/сопоставления, не подменяя предметно необходимую проверку зависимостей. Проверки воспроизводят принятые границы; недостающие локальные правила должны быть определены до реализации соответствующего сценария.

## 9. Голосовой канал AVA

Для запланированного AVA Integration API применяются сценарии `AVA-T01`–`AVA-T09` из [AVA_INTEGRATION_PLAN.md, раздел 8](AVA_INTEGRATION_PLAN.md#8-проверки-перед-подключением-жителей). Они включают приём показаний воды/электричества: read-back и подтверждение конкретной версии, выбор точки/регистра, точность значения и времени, outcomes BP-READING-001, повтор/неизвестный исход, изоляцию сообщества и сбои доставки. Сначала используются synthetic fixtures и contract/integration tests; языковая и телефонная квалификация проводится отдельно на выбранной конфигурации. Публикация плана не означает, что API или тесты уже реализованы. Эти сценарии не добавляются к bootstrap как фиктивные тесты без соответствующего поведения.
