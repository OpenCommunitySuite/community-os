# Community OS — Testing strategy

**Статус:** Baseline / Действует

## 1. Принцип

Tests выбираются по гарантии, которую необходимо доказать, а не по фиксированной test pyramid, названию framework или arbitrary coverage percentage. Один тест может покрывать несколько levels; название test type не заменяет доказательство relevant boundary.

Exact .NET/JavaScript test frameworks, container-test library, CI vendor и commands выбираются bootstrap task и не являются частью этого документа.

## 2. Test classes

### Unit / Domain

Проверяют pure domain calculations, rules, invariants, temporal selection, rounding и corrections без infrastructure. Historically significant version/rule cases имеют explicit examples. Unit test не доказывает persistence, authorization или integration behavior.

### Application / use case

Проверяют orchestration, domain admissibility, authorization coordination, transaction intent и result contracts через controlled ports. Они сохраняют distinctions Account/Subject/Power/Entitlement и не bypass mandatory denial ради fixture simplicity.

### Architecture / structural

Machine-checkable проверки должны объективно контролировать:

- Functional Module dependency directions;
- отсутствие forbidden Domain → infrastructure/transport references;
- separate Web/API и Worker compositions;
- отсутствие direct cross-boundary persistence access;
- explicit public contracts;
- запрет direct serialization EF/Domain models как API contracts, где это проверяемо.

### PostgreSQL integration и RLS

Проверки выполняются против real supported PostgreSQL. Они покрывают migrations, transactions, optimistic concurrency, targeted locking where introduced, trusted transaction-scoped Community context, connection reuse/pooling safety, RLS isolation и fail-closed behavior.

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

Exact commands, parallelism, retries, test database lifecycle и schedule фиксируются после bootstrap.

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
