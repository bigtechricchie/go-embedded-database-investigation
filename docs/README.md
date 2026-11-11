# Documentation

This directory contains the investigation method, dependency analysis rules, database-selection criteria, and consolidated findings for the repository.

## Documents

- [Methodology](./methodology.md) — how experiments are structured and verified.
- [Dependency analysis](./dependency-analysis.md) — how module graphs, compiled packages, `go.sum`, and vulnerability checks are interpreted.
- [Database selection](./database-selection.md) — criteria for choosing between bbolt and SQLite.
- [Findings](./findings.md) — evidence collected so far and the current conclusions.

The documentation intentionally separates measured evidence from architectural judgement. Findings should be updated when new measurements or requirements justify a change.
