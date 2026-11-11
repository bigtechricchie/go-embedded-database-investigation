# Go Embedded Database Investigation

Evidence-based investigation of embedded database options for Go applications.

This repository compares embedded persistence choices using measured dependency surfaces, security checks, application sizing, and practical benchmark results rather than selecting a database from headline feature lists alone.

## Current scope

The investigation currently covers:

- [bbolt](./bbolt/) as a small key/value persistence baseline.
- [SQLite](./sqlite/) as an embedded relational database option.
- [ncruces/go-sqlite3](./sqlite/ncruces/) as the first measured SQLite driver.
- [modernc.org/sqlite](./sqlite/modernc/) as the second measured SQLite candidate.
- [Frontend filtering benchmarks](./benchmarks/frontend-filtering/) for applications that may keep lightweight record summaries in browser memory.
- [Investigation methodology and findings](./docs/).

## Why this repository exists

An embedded database decision is rarely just a question of which database has the most features.

The decision can depend on:

- actual compiled dependency surface
- CGO and toolchain requirements
- operating-system support
- query complexity
- write concurrency
- deployment simplicity
- backup and recovery requirements
- security and supply-chain posture
- realistic record counts and payload sizes
- whether filtering belongs on the server, in the browser, or both

A module can appear in an upstream `go.mod` without being compiled into a particular application. Likewise, a checksum entry in `go.sum` is not proof that a package is part of the final executable.

This repository therefore distinguishes between:

```text
module graph
compiled package graph
checksum metadata
reachable vulnerabilities
runtime/application requirements
```

## Example workload

The benchmark examples use neutral London-style local listing data, such as a lost property record near Hyde Park. The examples are synthetic and contain no real customer or confidential data.

A representative lightweight summary might contain:

```json
{
  "id": 4821,
  "type": "lost",
  "category": "item",
  "title": "Black backpack lost near Hyde Park",
  "area": "Westminster, London",
  "status": "active",
  "short_summary": "Black backpack last seen near Hyde Park Corner."
}
```

The goal is to test a realistic architectural question:

```text
embedded database
    ↓
API returns lightweight summaries
    ↓
browser keeps summaries in memory
    ↓
local search/filter/sort
    ↓
full record fetched only when opened
```

## Current evidence

### bbolt

The earlier measured Go application baseline used:

```text
go.etcd.io/bbolt v1.5.0
golang.org/x/sys v0.45.0
```

The compiled external path was small and consisted primarily of bbolt plus `x/sys`. See [bbolt findings](./bbolt/README.md).

### SQLite with ncruces/go-sqlite3

The current minimal consumer uses:

```text
github.com/ncruces/go-sqlite3 v0.37.0
```

The measured compiled dependency path was substantially smaller than the broader upstream module graph suggested. The application also returned:

```text
No vulnerabilities found.
```

from `govulncheck ./...` at the time of the experiment.

See [ncruces findings](./sqlite/ncruces/README.md).

### SQLite with modernc.org/sqlite

`modernc.org/sqlite v1.62.0` has now been measured using the same minimal-consumer methodology. It has a materially larger compiled dependency surface than ncruces, but the verbose vulnerability scan identified 0 reachable vulnerabilities and no third-party dependency vulnerability findings. Two reported advisories belonged to the Go 1.27.2 standard library and are fixed by Go 1.27.4.

See [modernc findings](./sqlite/modernc/README.md).

### Frontend filtering

A simple JavaScript benchmark produced:

| Records | Approach | Matches | Measured filter time |
| ---: | --- | ---: | ---: |
| 25,000 | Build searchable text during every filter | 89 | 13.778 ms |
| 50,000 | Build searchable text during every filter | 89 | 24.948 ms |
| 50,000 | Precomputed searchable text | 89 | 4.564 ms |
| 50,000 | Precomputed searchable text | 89 | 4.092 ms |
| 50,000 | Precomputed searchable text | 89 | 4.426 ms |

The three precomputed 50,000-record runs average approximately **4.36 ms** on the tested development machine.

These measurements are not universal performance guarantees. They are evidence from one controlled experiment and do not include network transfer, JSON parsing, DOM rendering, framework rendering, mobile hardware, or production data.

## Current conclusion

Neither bbolt nor SQLite is being treated as a universal winner.

bbolt remains attractive when application-owned access patterns are simple, write concurrency is modest, and a very small dependency surface is valuable.

SQLite becomes increasingly attractive when relational constraints, multiple indexes, server-side querying, joins, aggregates, reporting, or increasingly complex access patterns would otherwise have to be built and maintained manually.

The central question is:

> When does maintaining application-specific access patterns and indexes become more expensive than accepting SQLite and SQL?

The investigation remains open and conclusions will change only when new evidence justifies it.

## Repository structure

```text
.
├── README.md
├── bbolt/
│   └── README.md
├── benchmarks/
│   ├── README.md
│   └── frontend-filtering/
│       ├── README.md
│       └── filter-benchmark.js
├── docs/
│   ├── README.md
│   ├── database-selection.md
│   ├── dependency-analysis.md
│   ├── findings.md
│   └── methodology.md
└── sqlite/
    ├── README.md
    ├── modernc/
    │   └── README.md
    └── ncruces/
        └── README.md
```

## Go baseline

New verification runs use:

```text
Go 1.27.4
```

Earlier Go 1.27.2 measurements are preserved as historical evidence, but standard-library advisories found during verbose scanning make 1.27.4 the current required baseline.

## Status

Investigation in progress.

No production database migration should be made solely from the results in this repository.
