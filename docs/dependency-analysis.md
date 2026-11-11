# Dependency Analysis

## Why dependency counts can mislead

An upstream project's `go.mod` can contain dependencies used by optional extensions, tests, examples, or build paths that a minimal consumer never compiles.

For application risk analysis, these concepts should remain separate:

```text
go list -m all
→ selected module graph

go mod graph
→ relationships between selected modules

go list -deps ./...
→ package dependency graph required by the application build

go mod why -m <module>
→ path explaining why a module is needed

go.sum
→ checksum metadata used by the module system
```

None of these views alone is a complete security assessment.

## bbolt baseline

The earlier Transaction Reconciliation experiment used:

```text
go.etcd.io/bbolt v1.5.0
golang.org/x/sys v0.45.0
```

The relevant compiled external path observed at the time was:

```text
go.etcd.io/bbolt/errors
go.etcd.io/bbolt/internal/common
go.etcd.io/bbolt/internal/freelist
golang.org/x/sys/windows
go.etcd.io/bbolt
```

The command output also showed:

```text
vendor/golang.org/x/sys/cpu
```

That `vendor/` path came from Go toolchain/standard-library vendored code and was not another application module dependency.

The practical application-owned third-party surface was therefore very small: bbolt plus `x/sys`.

## ncruces/go-sqlite3 baseline

The minimal SQLite consumer used:

```text
github.com/ncruces/go-sqlite3 v0.37.0
```

Its measured compiled external path included:

```text
github.com/ncruces/go-sqlite3-wasm/v6
github.com/ncruces/go-sqlite3/internal/errutil
github.com/ncruces/go-sqlite3/internal/testenv
github.com/ncruces/julianday
golang.org/x/sys/windows
github.com/ncruces/go-sqlite3/internal/sqlite3_wrap
github.com/ncruces/go-sqlite3/internal/util
github.com/ncruces/go-sqlite3/vfs
github.com/ncruces/go-sqlite3
github.com/ncruces/go-sqlite3/driver
```

Optional upstream dependencies such as UUID, approximate-counting, additional crypto, and Unicode extension packages did not appear in that minimal compiled path.

## Why the SQLite dependencies exist

Measured `go mod why` output established these paths:

```text
application
→ go-sqlite3/driver
→ go-sqlite3
→ julianday
```

```text
application
→ go-sqlite3/driver
→ go-sqlite3
→ go-sqlite3-wasm/v6
```

```text
application
→ go-sqlite3/driver
→ go-sqlite3
→ internal/sqlite3_wrap
→ golang.org/x/sys
```

These are therefore real dependencies of the tested SQLite application path.

## go.sum is not the executable

The SQLite experiment also contained `golang.org/x/text` checksums even though `x/text` did not appear in the measured minimal compiled package list.

This is why `go.sum` must not be treated as a list of code linked into the executable.

Do not manually prune `go.sum`. Let Go manage it through `go mod tidy`.

## Current comparison

At the tested versions:

```text
bbolt
→ bbolt
→ x/sys
```

```text
ncruces SQLite
→ go-sqlite3
→ go-sqlite3-wasm
→ julianday
→ x/sys
```

SQLite has a larger practical dependency surface, but the measured difference is substantially smaller than a broad reading of its upstream module graph initially suggested.
