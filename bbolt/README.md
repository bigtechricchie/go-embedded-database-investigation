# bbolt Investigation

## Role in this repository

bbolt is the minimal embedded key/value baseline used for comparison with SQLite.

The earlier application experiment used:

```text
go.etcd.io/bbolt v1.5.0
golang.org/x/sys v0.45.0
```

## Measured compiled dependency path

The relevant external packages observed were:

```text
go.etcd.io/bbolt/errors
go.etcd.io/bbolt/internal/common
go.etcd.io/bbolt/internal/freelist
golang.org/x/sys/windows
go.etcd.io/bbolt
```

A `vendor/golang.org/x/sys/cpu` path also appeared in package output. That path belonged to code vendored by the Go toolchain/standard library rather than an additional application module dependency.

The practical application-owned third-party surface was therefore very small.

## Strengths

- very small dependency surface
- simple embedded deployment
- deterministic key/value access
- many concurrent readers
- one writer
- application-controlled storage layout
- no SQL parser or relational layer required

## Constraints

- one write transaction at a time
- no SQL
- no joins
- no relational constraints
- no query planner
- secondary indexes must be designed and maintained by the application
- reporting and ad-hoc queries become increasingly manual as requirements grow
- the database file is process-locked and is not a multi-instance server database

## Whole-record strategy

A useful pattern for modest-scale applications is to store the complete record as the value:

```text
record ID
→ encoded complete record
```

The API can expose a smaller summary representation for collection views while loading the complete record only when required.

For applications with tens of thousands of lightweight summaries, frontend filtering may remain practical. See the [frontend filtering benchmark](../benchmarks/frontend-filtering/README.md).

## Secondary indexes

If measured requirements justify them, targeted buckets can provide application-owned indexes:

```text
records
ID → record

status
active → IDs

category
item → IDs
```

This can remain simple for a small number of stable access patterns.

The trade-off is that application code becomes responsible for keeping records and indexes consistent in the same write transaction.

## When to reconsider bbolt

SQLite becomes worth reconsidering when:

- the number of secondary indexes keeps growing
- relational integrity becomes important
- joins are normal rather than exceptional
- reporting or aggregation expands
- server-side range queries become common
- custom index maintenance starts dominating persistence code

If the actual requirement becomes multiple concurrent writers across application instances, PostgreSQL may be a more appropriate migration target than SQLite.

## Current assessment

bbolt remains a strong baseline, not a temporary placeholder.

Its suitability should be judged by application requirements rather than by the absence of SQL.
