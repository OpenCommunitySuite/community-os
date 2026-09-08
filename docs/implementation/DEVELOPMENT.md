# Community OS — Development workflow

**Статус:** Baseline / Действует

## 1. Documentation First

Accepted architecture и [Implementation Baseline](IMPLEMENTATION_BASELINE.md) являются source of truth для реализации. Код не принимает молча решения, оставленные документацией открытыми, и не переопределяет domain terminology удобными framework concepts.

Обычный task flow:

```text
business requirement
→ accepted architecture / explicit implementation baseline
→ scoped implementation task and acceptance criteria
→ implementation
→ build and applicable tests
→ complete diff/review
→ Pull Request
→ merge only after explicit authorization
```

Если implementation pressure выявляет конфликт или новый cross-cutting architectural choice, работа останавливается до явного документационного решения.

## 2. Требования к implementation task

Task указывает:

- source requirement и applicable ADR/baseline sections;
- точный scope и files/components in scope;
- acceptance criteria и expected observable behavior;
- applicable test guarantees;
- explicit deferrals и prohibited changes.

Unrelated cleanup не включается в task/commit/PR. Чужие или неожиданные local changes не уничтожаются и не скрываются.

## 3. Architecture enforcement

Architecture violations нельзя обходить ради прохождения теста или быстрого feature delivery. Tests/mocks не могут подменять PostgreSQL/RLS, authorization, durable-work или integration guarantees, которые они фактически не проверяют.

Critical objective boundaries становятся machine-checkable там, где это возможно: module dependencies, forbidden references, host composition, migrations/runtime privileges, tenant context, API contracts и relevant test suites.

## 4. AI-assisted development

AI-assisted development и AI coding agents допустимы как инструменты реализации и review. Business/owner decisions, acceptance архитектуры, security exceptions и merge authorization не делегируются автоматически AI.

Generated implementation проходит те же compiler, formatting, static, architecture, test, diff и review gates, что и human-written code. Проект не зависит от конкретного AI product или provider.

## 5. Reproducibility и data safety

Local и CI workflows должны использовать один reproducible set of build/test commands. Exact commands фиксируются bootstrap task после создания toolchain manifests.

Secrets, production credentials и real personal data запрещены в tests, fixtures, examples, logs и documentation. Используются synthetic/minimized data и controlled external sandboxes.

## 6. Git/PR discipline

Применяется root [AGENTS.md](../../AGENTS.md): clean baseline, task branch, complete diff review, task-only commit, normal push и PR в `main`. Merge, force push, history rewrite и branch deletion выполняются только в пределах явно разрешённой policy.
