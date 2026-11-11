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

## Current driver

The first candidate is:

- [ncruces/go-sqlite3](./ncruces/)

The investigation uses a minimal `database/sql` consumer and then measures the actual compiled dependency path.

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

The ncruces dependency experiment is promising, but the overall SQLite investigation remains open.

Future work may compare additional drivers and operational behaviour before any production recommendation is made.
