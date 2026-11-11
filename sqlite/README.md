# SQLite Investigation

## Purpose

This directory evaluates SQLite as an embedded relational alternative to bbolt for Go applications.

The investigation focuses on the Go integration as much as SQLite itself because driver choice can materially affect:

- dependency surface
- CGO requirements
- Windows development
- cross-platform builds
- reproducibility
- supply-chain review

## Candidates

The current SQLite candidates are:

- [ncruces/go-sqlite3](./ncruces/) — measured initial candidate.
- [modernc.org/sqlite](./modernc/) — investigation pending.

The same methodology should be applied to each candidate so comparisons are based on equivalent evidence rather than assumptions.

## Why SQLite is interesting

SQLite provides capabilities that bbolt does not provide natively:

- SQL
- indexes
- joins
- relational constraints
- aggregation
- sorting
- range queries
- ad-hoc queries
- familiar schema-based tooling

These capabilities can reduce application code when query complexity grows.

## Concurrency perspective

SQLite improves read/write overlap, particularly when WAL mode is appropriate, but it remains an embedded database with effectively one writer at a time.

Therefore:

```text
bbolt
many readers + one writer

SQLite
many readers + one writer, with stronger relational/query capabilities

PostgreSQL
server database designed for multiple concurrent writers and instances
```

SQLite should not be selected merely as a supposed solution to true multi-writer scaling.

## Current status

The ncruces dependency experiment is promising.

The modernc candidate has been added to the investigation but has not yet been measured.

No production recommendation should be made until candidates are compared using the same minimal-consumer, dependency, build, and vulnerability checks.
