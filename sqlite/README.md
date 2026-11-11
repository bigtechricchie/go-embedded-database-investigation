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

- [ncruces/go-sqlite3](./ncruces/) — dependency and vulnerability findings measured.
- [modernc.org/sqlite](./modernc/) — dependency findings measured; build/test/vulnerability verification still pending.

The same methodology is applied so comparisons are based on equivalent evidence rather than assumptions.

## Current dependency comparison

The measured minimal consumers currently show:

```text
ncruces
→ smaller compiled dependency surface
→ CGO-free

modernc
→ materially larger compiled dependency surface
→ CGO-free
```

This does not establish a universal winner.

The dependency result is one input alongside reliability, operational behaviour, feature requirements, security scanning, and maintenance quality.

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

The ncruces dependency experiment remains promising.

The modernc experiment confirms a broader compiled dependency surface in the equivalent minimal consumer.

The remaining modernc checks are:

```text
go mod verify
go build .
go test ./...
govulncheck ./...
```

No clean build/test/vulnerability result is claimed until those commands are run and reported.
