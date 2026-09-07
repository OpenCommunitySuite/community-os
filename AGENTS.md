# Repository instructions

- Follow the project's Documentation First approach.
- Treat approved project documentation and architectural decisions as the source of truth for implementation.
- Use Russian as the working language for project design documentation unless the task requires another language.

# User-facing communication

- The default language for user interaction is Russian.
- Write all user-facing reports, section headings, review findings, questions, warnings and explanations in Russian.
- Use English only where appropriate for machine-significant or technical values, including code, Git commands, file and branch names, commit messages, pull request titles, identifiers and exact technical terms.
- Do not switch a report to English solely because the source prompt, API, GitHub or technical documentation uses English.
- If the user explicitly requests another language for a specific task, use it only for that task.

# Git and GitHub workflow

For this repository, Codex may autonomously perform routine Git and GitHub
operations that are directly required by the user's requested task.

Allowed without additional confirmation:
- inspect git status, branches, logs, diffs and remotes;
- fetch remote state;
- pull the current branch when safe;
- synchronize local main with origin/main using a normal fast-forward pull when safe;
- create a new task-specific branch from an up-to-date main branch;
- switch between task branches and main when this does not discard changes;
- edit files that are within the scope of the requested task;
- run non-destructive checks, tests and validation commands;
- git add only files that belong to the requested task;
- create normal commits;
- push a task branch;
- set upstream for a task branch;
- create a GitHub pull request targeting main;
- update the same branch and PR after fixes or review feedback;
- inspect PR status, checks and comments;
- after a task PR has been successfully merged into main, delete that PR's task branch locally and remotely without additional confirmation only when the branch is not main/default/protected and its head commit is confirmed reachable from the current origin/main.

Codex must STOP and ask for explicit confirmation before:
- merging any pull request into main;
- pushing directly to main;
- force-push or push --force-with-lease;
- deleting local or remote branches except the verified automatic post-merge cleanup described above;
- rebasing or otherwise rewriting published history;
- git reset --hard;
- git clean with destructive options;
- discarding unrelated local changes;
- resolving ambiguous merge conflicts where domain intent is unclear;
- changing repository settings, permissions, branch protection or security settings;
- changing GitHub Actions security settings;
- modifying unrelated files only to make the working tree cleaner;
- combining unrelated changes into the same commit or PR.

Mandatory workflow rules:
1. Before starting work, inspect:
   - git status --short
   - current branch
   - configured remotes.
2. Never overwrite, discard or silently modify unrelated user changes.
3. For normal documentation and architecture work:
   - start from an up-to-date main branch;
   - create a dedicated task branch;
   - do not work directly on main unless the user explicitly requests it.
4. Before commit:
   - inspect the complete diff;
   - verify that only task-related files are included.
5. Commit only files required by the task.
6. Use concise, meaningful commit messages.
7. Before push, report unexpected changes, conflicts or suspicious repository state.
8. Pull requests normally target main.
9. Use a concise PR title and body explaining what changed and why.
10. Creating or updating a PR never implies permission to merge it.
11. If Git or GitHub authentication is unavailable, report the exact failure.
12. Do not install tools, modify system credentials, ACLs or GitHub authentication automatically.
13. Never place passwords, access tokens, private keys, secrets or credentials into:
    - repository files;
    - commits;
    - PR descriptions;
    - logs;
    - summaries.
14. Preserve repository architecture and documentation conventions.
15. If task scope is ambiguous, stop before modifying additional unrelated files.
16. Automatic post-merge branch cleanup is permitted only for the task branch of the PR just merged after explicit merge authorization. Before deletion, verify that the PR is merged, the current origin/main contains the resulting merge, and the task branch head is reachable from origin/main. Never delete main, the default branch, a protected branch, an unmerged branch, a branch with commits not reachable from origin/main, or an unrelated historical branch under this automatic rule.
17. Historical branch cleanup outside the immediately completed task is a separate maintenance operation: inspect all candidate branches first and delete them only when the user has explicitly requested or confirmed that cleanup.

# Community OS architecture workflow

- ADR, DOMAIN_MODEL, TERMINOLOGY, VISION and ARCHITECTURE_ROADMAP are architecture-level documents.
- Do not silently change already accepted architectural decisions.
- If a requested change conflicts with an accepted ADR, report the conflict before changing the accepted decision.
- When an ADR is accepted, check whether DOMAIN_MODEL, TERMINOLOGY, VISION or ARCHITECTURE_ROADMAP require synchronization.
- Do not introduce PostgreSQL schema, SQL, API, UI, framework, deployment or other implementation decisions into architecture documents unless the task explicitly concerns technical architecture.
- Keep domain concepts separate from implementation entities, tables, services and code modules.
- Preserve historical and temporal distinctions already fixed by accepted ADRs.
