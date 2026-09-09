# Community OS — Implementation Baseline

**Статус:** Accepted / Принято
**Язык документа:** русский

---

## 1. Назначение

Документ фиксирует минимальные concrete implementation decisions, принятые перед первым production-oriented application code. Он подчинён [ADR-001–ADR-018](../architecture/adr/), не заменяет их и не проектирует domain model, SQL schema, endpoints или production topology.

Любая реализация, включая generated/AI-assisted code, должна соблюдать эти границы. Изменение baseline требует явного documentation review; изменение архитектурного решения требует нового/пересматривающего ADR.

## 2. Backend stack и repository composition (Q1–Q2)

Основной backend stack: C#/.NET, ASP.NET Core, PostgreSQL, Npgsql и EF Core. Обоснование связано с strict typing, compiler checks, independently runnable Web/Worker hosts и возможностью machine-checkable architecture boundaries, а не с конкретным AI-разработчиком.

Repository является monorepo, backend — logical modular monolith. Functional Module boundaries выражаются явно и проверяются автоматически там, где это объективно возможно. Bounded Context не тождествен runtime module/project/service.

Web/API Host и Worker Host запускаются отдельно, но используют общую Domain/Application реализацию. Не фиксируются преждевременно десятки projects; одновременно недопустим giant project без границ. Concrete bootstrap composition определена в разделе 16 согласно [ADR-018](../architecture/adr/ADR-018.md).

Не вводятся автоматически Generic Repository, universal Unit of Work, MediatR/CQRS framework, AutoMapper или иные enterprise patterns без конкретной необходимости.

Initial supported application line — .NET 10 LTS с Target Framework `net10.0`; ASP.NET Core и EF Core используют major 10, Npgsql и `Npgsql.EntityFrameworkCore.PostgreSQL` — совместимую major-линию 10. Exact SDK и package patches закрепляются reproducibly в bootstrap configuration и обновляются по version policy раздела 16.

## 3. PostgreSQL persistence (Q3)

- PostgreSQL + Npgsql + EF Core, ORM-first.
- Mappings explicit, reviewable и принадлежат owning module.
- Targeted PostgreSQL SQL допустим для RLS, locking, reporting, performance и корректной PostgreSQL semantics.
- Versioned migrations reviewable и выполняются controlled migration runner с отдельной DB identity.
- Web/Worker runtime не имеет DDL privileges и не запускает production migrations автоматически на startup.
- Trusted Community DB context устанавливается transaction-scoped, fail closed, не принимается как trusted из client input и безопасно очищается/переустанавливается при connection pooling.
- PostgreSQL RLS остаётся defense-in-depth и не заменяет Application authorization/domain admissibility.
- Module владеет persistence mappings; one `DbContext` per Bounded Context не является обязательным.
- Local cross-module ACID допустим только внутри одного resolved persistence boundary согласно ADR-013/014.
- Initial connection pooling — Npgsql application pooling. PgBouncer не добавляется без demonstrated need.

Initial supported PostgreSQL major — 18. Development, integration tests и production используют проверенный supported servicing minor линии 18.x. Concrete servicing/image pin должен быть reproducible и не использует floating `latest`; он обновляется по version policy раздела 16. Exact schema, `numeric(p,s)`, RLS SQL, isolation levels, migration library details и pool sizes deferred.

## 4. Identifiers, time, numeric и concurrency (Q4)

### Identifiers

Default new internal stable identifier — opaque UUIDv7. UUID timestamp не является domain timestamp, historical evidence или business ordering. External identifiers сохраняются отдельно и scoped по ADR-011. Exact UUID library deferred to bootstrap compatibility review.

### Time

Absolute instants имеют offset-aware semantics и нормализуются к UTC при storage/exchange. Local Date, Local Time и Time Zone остаются distinct, когда это требуется domain semantics. Built-in types versus specialized time library не выбраны этим baseline.

### Exact quantities

Money, Resource Quantity, Voting Weight, Tariff/Rate и иные deterministic exact quantities используют decimal/fixed-precision representation, подходящую owning context. Binary floating point не используется для deterministic exact domain calculations.

Currency является частью Money semantics; universal UAH не hardcoded. Universal precision, scale или rounding rule отсутствуют. Rounding принадлежит конкретному calculation/rule и исторически определим, когда влияет на значимый результат.

### Concurrency

Mutable state, где stale write может нарушить correctness, имеет explicit application/persistence concurrency token. PostgreSQL `xmin` и timestamps не экспонируются как universal API/application concurrency semantics. Concurrency Token не равен Rule Version, Document Revision или Placement Generation. Exact token representation deferred.

## 5. API baseline (Q5)

Initial API style — REST over HTTPS, JSON и OpenAPI.

- Web API, Public API и Integration API — distinct audiences/contracts/lifecycles; global API version отсутствует.
- Explicit DTOs mandatory; Domain и EF entities не сериализуются напрямую.
- API выражает Application use cases, а не forced universal CRUD.
- HTTP errors используют Problem Details и stable machine-readable categories/codes where needed.
- Domain/Application outcome не сводится к HTTP error.
- Stale mutation использует concurrency precondition, обычно `ETag`/`If-Match` или equivalent; transport token не становится domain version/revision.
- Scoped idempotency применяется только там, где redelivery может повторить meaningful effect. Idempotency не равна optimistic concurrency.
- Community scope устанавливается trusted server context; Community ID/slug/hostname из request не является authorization.
- Public API имеет explicit compatibility/deprecation policy.
- Web API может co-evolve с owned frontend, сохраняя rollout compatibility, включая открытый older JavaScript bundle.
- Integration contracts имеют собственный lifecycle/version semantics.

GraphQL и gRPC не входят в initial baseline. Endpoint catalog, pagination/filtering conventions и OpenAPI code generator фиксируются при соответствующем implementation slice.

## 6. Authentication и security (Q6)

Own Web UI использует opaque server-side revocable session, initially stored in Platform PostgreSQL, и secure HttpOnly cookie. State-changing cookie-authenticated requests защищены explicit CSRF mechanism. Session credential не хранится frontend JavaScript в `localStorage`/`sessionStorage`. Self-contained JWT не является primary browser session mechanism; future Public/Integration bearer contracts допустимы.

Built-in password authentication использует Argon2id с versioned/configurable parameters и controlled rehash policy. Exact library/parameters выбираются и security-reviewed при implementation. Account поддерживает multiple Authentication Methods; initial built-in scope включает password и recovery, сохраняя extensibility для TOTP/OTP/OIDC.

External Identity не Subject. Name/email/phone match не связывает Account автоматически. Linking требует verified flow. Authentication устанавливает Account identity, но не Subject, Power или domain admissibility.

Authorization/Entitlement/domain-admissibility enforcement остаётся server-side. Initial solution не требует Redis, sticky session или отдельный auth service. Secret material не попадает в configuration files, payload/log/audit/history. Support elevation/break-glass сохраняют ADR-015 boundaries.

## 7. Persistent Work (Q7)

Initial reliable runtime — PostgreSQL-backed Persistent Work, Transactional Outbox и scheduling с отдельным Worker Host. Mandatory broker отсутствует.

- Reliability-required async obligation durable до acceptance; in-memory background work недостаточно.
- Общий contract — minimal technical envelope, semantics принадлежат module; universal domain Job/Workflow/Process отсутствует.
- Stable Operation identity distinct from Attempt identities.
- Authoritative state change и required async obligation фиксируются atomically в одном persistence boundary через Outbox/equivalent.
- Runtime имеет at-least-once exposure и не обещает exactly-once.
- Idempotency, guarded state, duplicate recognition/selective Inbox и reconciliation используются по effect contract.
- Claiming/recovery, classified retry, delayed work и quarantine durable.
- Cancellation останавливает future execution на safe boundary и не rollback.
- Compensation — separate linked durable operation; resume/replay authorized и historical; correction/new intent создаёт новую linked Operation.
- Complex processes используют specialized coordinators, не universal Workflow Engine.
- Community work resolve current Placement/Generation и current-sensitive gates на applicable boundaries.
- Worker действует под Workload Identity; Account/Subject credentials не capture.
- Work payload содержит Secret Reference, не Secret material.

RabbitMQ, Kafka и Redis не initial requirements. Exact tables, leases, polling, backoff, scheduler и framework deferred.

## 8. Frontend и Web surfaces (Q8)

Применяется [ADR-018](../architecture/adr/ADR-018.md): TypeScript + React для authenticated Platform Application и Community Application; они логически самостоятельны и используют shared packages только для common technical concerns.

Platform Public Site и optional Community Public Presence являются distinct public surfaces. Concrete public-site technology deferred. Platform Public Site не владеет Control Plane concepts и вызывает Application use cases через Web API/BFF.

Frontend/API rollout обязан учитывать older JS bundle, оставшийся открытым у пользователя. Это short owned-client compatibility и не заменяет long-term Public API policy.

Default UI locale — украинский, русский переключаемый, future locales supported. UI translation не переводит автоматически Community-authored content. Core user journeys responsive mobile Web; complex admin workspace может иметь desktop optimization; accessibility mandatory baseline quality.

Exact React build tooling, state manager, component/design-system implementation, i18n library, OpenAPI generator, PWA/offline и delivery packaging deferred.

## 9. Configuration и observability (Q9)

Typed owner-specific contracts различают:

- Domain/Community configuration;
- Platform/application configuration;
- technical/deployment configuration;
- configurable typed data attributes ADR-014;
- Entitlements;
- Secret References/material.

Universal string key/value Configuration model и universal Configuration entity/service отсутствуют. Validation, temporal/version semantics и authority принадлежат owner по ADR-003.

Application instrumentation baseline: structured logs, metrics, correlation и targeted tracing через vendor-neutral boundary. OpenTelemetry-compatible instrumentation является initial technical direction, но collector/backend/vendor не выбран.

Correlation ID, causation, Operation ID, Attempt ID и domain identifiers distinct. Correlation — technical investigation context, не domain relationship. Telemetry minimized/redacted; Secrets запрещены; sensitive/high-cardinality identifiers не metric dimensions без justified need.

Domain History/Provenance, Security Audit, Integration Provenance, Persistent Work state/history и Operational Observability distinct. Startup, Runtime Readiness, Liveness и Draining сохраняют ADR-017 semantics. Grafana, Prometheus, Seq, ELK, Application Insights и другие products не являются requirement.

## 10. Build, test и developer workflow (Q10)

Local и CI используют один reproducible standard build/test workflow. PR в `main` проходит applicable build, relevant tests и architecture/structural checks.

Tests выбираются по guarantee, не по fixed pyramid или arbitrary coverage percentage. Required strategy определена в [TESTING.md](TESTING.md). Real PostgreSQL обязателен для RLS/transaction/pooling guarantees; EF InMemory, SQLite или mocks не доказывают PostgreSQL semantics.

Normal CI не зависит от production credentials или live Telegram/PrivatBank/BAS endpoints. External adapters тестируются через controlled boundaries; sandbox/live verification separate.

Build artifacts имеют immutable Build Identity linked to Source Revision. Accepted artifact продвигается без rebuild. Compiler/tests/architecture gates authoritative независимо от human- или AI-assisted implementation.

Concrete .NET testing baseline определён разделом 16 и [TESTING.md](TESTING.md): xUnit.net v3 линии 4.x на Microsoft Testing Platform v2, ArchUnitNET и Testcontainers for .NET с real PostgreSQL 18.x. Standard entry points — `dotnet build` и `dotnet test`.

## 11. Packaging (Q11)

Initial packaging следует ADR-018:

- immutable OCI-compatible artifacts;
- initial supported SaaS production target Linux x86-64;
- independently runnable Web/API и Worker;
- environment technical configuration/Secrets outside artifact;
- same accepted artifact promoted Staging → Production without rebuild.

Frontend artifacts reproducible и identifiable. Embedded Web image, separate image или static/CDN delivery deferred; Platform Public Site может иметь separate build/deployment lifecycle. OCI не выбирает Docker Compose, Kubernetes, registry, cloud provider или Self-Hosted installer.

## 12. Bulk import и onboarding exchange (Q12a)

Первый mass external exchange mechanism — CSV/XLSX specialized bulk import. Universal ETL/entity importer не создаётся.

### Initial Community Register Import

Первый Import Type импортирует initial basic Community register: applicable Objects, Community-owned Subjects, ownership relations и Personal Accounts согласно effective Community configuration. Он universal для подходящих Community profiles и не hardcoded как SNT-only.

Opening Financial State, Payments, Meter Readings и иные independent facts не смешиваются с register import; они могут получить отдельные Import Types.

Pipeline:

```text
CSV/XLSX External Representation
→ received/parsed information
→ validation and permitted mapping
→ resolution where required
→ Application/Domain recognition and application
```

File/row не Domain Fact. Imported Subject/contact data не создаёт User Account и не связывает Account по name/email/phone. До application обязательны validation и preview. Import-specific contract владеет atomicity, partial application, correction, rerun и matching; generic fuzzy identity matching запрещён.

Import Operation сохраняет sufficient provenance. Source files/PII имеют scoped access, retention/minimization и не попадают в telemetry. Initial formats: CSV и XLSX; legacy XLS excluded.

### Dynamic template refinement

Import Template генерируется для concrete Import Type из effective configuration конкретной Community:

```text
Community Profile / Template
→ initial Community configuration
→ effective Community configuration
→ Import Type
→ dynamically generated Import Template
```

Profile/Template задаёт initial/default configuration, но не immutable import schema. Import Type определяет legal importable concepts; effective configuration — applicable permitted/required fields/relations.

Generated template имеет identifiable schema/version и sufficient configuration/import context, чтобы upload выявлял incompatible configuration change после generation. Existing CSV/XLSX может использовать limited column mapping только к fields, разрешённым Import Type; arbitrary mapping в domain entities запрещён.

Implementation order: сначала minimal internal Application/Domain path создания basic register, затем import reuse those semantics и не делает direct persistence write.

## 13. Operational integrations priority (Q12b)

Priority:

1. Telegram;
2. PrivatBank API;
3. BAS;
4. MQTT — explicitly deferred/low priority.

Telegram — additional user/communication channel поверх existing Application use cases, не second backend. Telegram identity distinct from User Account, Subject, Power и Access Right; linking verified. Initial scope incremental: notifications/linking и малое число useful actions по мере появления use cases.

PrivatBank API не требуется для first deployment. До него Finance поддерживает manual Payment entry и specialized Bank Statement Import. Bank Statement Import distinct from PrivatBank API и сохраняет:

```text
bank statement representation
→ received bank transaction information
→ recognition/matching
→ Payment
→ Allocation
→ financial state
```

Payment не Bank Transaction и не Allocation. Bank API позже автоматизирует работающий finance process и не определяет Finance domain. BAS следует после bank integration и не становится owner Community OS semantics.

MQTT deferred; Resource Accounting работает без него. Future flow сохраняет `Telemetry Sample != Received Information != Reading != Consumption`.

## 14. Explicit deferrals

- exact servicing/patch pins после первоначальной bootstrap фиксации и их последующие controlled updates внутри принятых major-линий;
- дальнейшая `.sln`/`.csproj` и directory decomposition за пределами минимального bootstrap состава;
- DB schema/migrations/RLS SQL/isolation/token representation;
- endpoint catalog and API tooling;
- Argon2/session/CSRF libraries and parameters;
- Worker/job framework, broker, Redis and retry numbers;
- React/public-site/build/state/component/i18n libraries;
- observability backend/collector/vendor;
- secrets manager, S3 provider, CI provider, registry/orchestrator;
- exact production/Self-Hosted topology and OSS/SaaS edition boundary;
- concrete Import/Telegram/bank/BAS/MQTT implementation.

## 15. Readiness to implement

Implementation Baseline decisions Q1–Q12 и bootstrap decisions B1–B4 are accepted. Application implementation has not started. Следующий code-producing task — строго ограниченный Application Bootstrap из раздела 16; он фиксирует concrete servicing/package/image pins в repository configuration и создаёт только согласованный skeleton без business functionality.

## 16. Accepted bootstrap decisions B1–B4

### B1. Toolchain и database versions

- Initial supported application major — .NET 10 LTS; Target Framework — `net10.0`; ASP.NET Core используется в той же major-линии.
- EF Core initial major — 10.
- Npgsql и `Npgsql.EntityFrameworkCore.PostgreSQL` используют совместимую major-линию 10.
- PostgreSQL initial supported database major — 18. Development, integration tests и production используют проверенный supported servicing minor 18.x.
- Concrete .NET SDK, NuGet packages и PostgreSQL container image фиксируются reproducibly в repository bootstrap configuration. Floating `latest` не является version contract; image pin должен иметь однозначную immutable identity, достаточную для воспроизведения.
- Servicing/patch updates внутри принятых major-линий выполняются как controlled dependency/toolchain update с build и applicable tests и сами по себе не требуют нового ADR.
- Переход на новую .NET, EF Core, Npgsql или PostgreSQL major-линию является отдельным controlled upgrade decision. PostgreSQL major upgrade требует compatibility, migration, backup, Staging и rollback-or-roll-forward review.

Текущие servicing numbers не являются вечными архитектурными константами. На момент принятия B1 официально поддерживаются .NET 10 LTS, EF Core 10, Npgsql provider 10 и PostgreSQL 18; concrete bootstrap pins проверяются повторно непосредственно при создании configuration files.

### B2. Solution, project и module boundaries

`Bounded Context != Functional Module != .NET Project`. Physical solution ориентируется прежде всего на Functional Module boundaries, а не на mechanical project-per-layer или project-per-Bounded-Context.

- Реально реализуемый Functional Module первоначально имеет один основной production assembly/project.
- Domain, Application и Infrastructure внутри module логически разделены namespaces/folders и architecture tests.
- Separate Domain/Application/Infrastructure projects вводятся только при доказанной необходимости более сильной compile-time isolation.
- Direct dependencies между implementation assemblies разных Functional Modules запрещены. Synchronous cross-module interaction использует public Module Contract.
- Lightweight `*.Contracts` project создаётся только при появлении реального cross-module consumer; пустые Contracts projects заранее не создаются.
- Module Contract не содержит EF entities, `DbContext`, repositories, internal Domain entities или Infrastructure services.
- Web и Worker — separate executable composition roots. Hosts владеют wiring/technical surfaces, но не business logic и не обходят Application layer.
- BuildingBlocks/Shared Kernel остаётся минимальным. `Common`/`Utils` dumping ground запрещён; shared project появляется только для доказанного shared concept/capability.
- EF mapping ownership принадлежит Functional Module, но module ownership не требует отдельного `DbContext` для каждого module или Bounded Context и не отменяет допустимый local cross-module ACID внутри одного resolved persistence boundary.
- Compiler/project graph является первой линией dependency protection; architecture tests — второй линией для объективно формализуемых правил.
- Frontend находится в monorepo, но вне .NET project graph.
- Пустые projects для будущих Modules/Bounded Contexts заранее не создаются.

### B3. Testing и tooling baseline

- Test framework — xUnit.net v3 линии 4.x с Microsoft Testing Platform v2; standard test entry point — `dotnet test`.
- Mandatory external assertion library отсутствует: baseline использует xUnit assertions. Fluent Assertions 8 не включён, поскольку commercial use требует paid license. Дополнительная assertion library возможна только при обоснованной необходимости и license review.
- Architecture tests используют ArchUnitNET и его xUnit v3 integration. Compiler/project graph остаётся первой линией защиты; architecture tests дополняют её объективно формализуемыми structural guarantees.
- PostgreSQL integration tests используют Testcontainers for .NET и real PostgreSQL 18.x с concrete reproducible verified image pin. SQLite, EF InMemory и mocks не доказывают PostgreSQL/RLS semantics.
- Mandatory mocking framework отсутствует. Простые fakes/stubs предпочтительны, когда достаточны; mocking library добавляется только при реальной необходимости.
- Test boundaries: `CommunityOS.UnitTests`, `CommunityOS.IntegrationTests`, `CommunityOS.ArchitectureTests`. Пустой UnitTests project и test project per Functional Module заранее не создаются.
- Initial architecture tests проверяют как минимум: Domain не зависит от Application, Infrastructure или Hosts; Application не зависит от Infrastructure или Hosts; cross-module implementation dependencies запрещены. Дополнительные host/module rules добавляются только когда корректно формализуемы.
- Standard developer/CI entry points — `dotnet build` и `dotnet test`.
- Code coverage допустим как diagnostic metric; arbitrary coverage threshold не является acceptance criterion.
- Mandatory development/test dependencies должны быть Open Source и разрешать бесплатное commercial use. Dependency с paid/commercial-use licensing не становится mandatory baseline без отдельного обоснованного решения.

### B4. Первый Application Bootstrap

Первый implementation increment после принятия B1–B4 — **Application Bootstrap**, не business vertical slice. Он создаёт только минимальные production projects:

- `CommunityOS.Web`;
- `CommunityOS.Worker`;
- `CommunityOS.Modules.Community`.

`CommunityOS.Modules.Community` является реальной Functional Module boundary, а не Registry/Core/Common supermodule. Bootstrap не создаёт искусственные Domain entities/use cases ради наполнения и не создаёт будущие modules заранее.

Bootstrap явно не реализует Control Plane, authentication, User Account, Subject, fake user/Subject, temporary authorization model, Finance, import, Resource Accounting или business endpoints.

- Web bootstrap — executable composition root только с необходимыми technical/operational surfaces, включая applicable health/readiness/liveness ADR-017. Operational endpoints не являются Web/Public domain API.
- Worker bootstrap — independently runnable composition root без Persistent Work/outbox/inbox/scheduler/retry/quarantine engine.
- Integration bootstrap использует Testcontainers, pinned PostgreSQL 18.x и real Npgsql connection для минимального connectivity smoke test без domain schema.
- Bootstrap не создаёт fake/global `DbContext`, domain database schema, empty migration, production migration runner или RLS schema implementation. EF Core/Npgsql dependencies могут быть подготовлены, но concrete `DbContext`/persistence composition появляется с первым real persistent slice.
- Bootstrap не создаёт BuildingBlocks/SharedKernel, `*.Contracts`, frontend или Platform Public Site projects.
- `CommunityOS.ArchitectureTests` и `CommunityOS.IntegrationTests` создаются. `CommunityOS.UnitTests` создаётся только при появлении real Domain behavior; fake behavior ради unit test запрещён.

Bootstrap accepted, когда pinned .NET 10 toolchain воспроизводимо собирает solution; Web и Worker запускаются независимо; Community Functional Module участвует в composition; architecture tests реально выполняются; PostgreSQL 18 Testcontainers connectivity smoke test проходит; `dotnet build` и `dotnet test` проходят; business functionality отсутствует.
