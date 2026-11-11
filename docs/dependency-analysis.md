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

Measured `go mod why` output established clear reasons for julianday, the SQLite WASM engine, and `x/sys`.

## modernc.org/sqlite baseline

The equivalent minimal consumer used:

```text
modernc.org/sqlite v1.62.0
```

Its selected graph included:

```text
github.com/dustin/go-humanize
github.com/google/uuid
github.com/mattn/go-isatty
github.com/ncruces/go-strftime
github.com/remyoudompheng/bigfft
golang.org/x/sys
modernc.org/libc
modernc.org/mathutil
modernc.org/memory
```

The compiled package graph showed that most of this heavier runtime-support stack is actually part of the minimal application path.

Relevant compiled packages included:

```text
github.com/dustin/go-humanize
github.com/mattn/go-isatty
github.com/ncruces/go-strftime
golang.org/x/sys/cpu
golang.org/x/sys/windows
modernc.org/libc/errno
modernc.org/libc/fcntl
modernc.org/libc/limits
modernc.org/libc/pthread
modernc.org/libc/signal
modernc.org/libc/stdio
modernc.org/libc/sys/stat
modernc.org/libc/sys/types
modernc.org/libc/time
modernc.org/libc/unistd
github.com/remyoudompheng/bigfft
modernc.org/mathutil
modernc.org/memory
modernc.org/libc
modernc.org/sqlite/lib
modernc.org/sqlite/vtab
modernc.org/sqlite
```

Measured `go mod why` output established these chains:

```text
application
→ modernc.org/sqlite
→ modernc.org/libc
```

```text
application
→ modernc.org/sqlite
→ modernc.org/libc
→ modernc.org/memory
```

```text
application
→ modernc.org/sqlite
→ modernc.org/libc
→ modernc.org/mathutil
→ github.com/remyoudompheng/bigfft
```

This confirms that the larger modernc dependency surface is not merely selected-module noise.

## go.sum is not the executable

The ncruces experiment also contained `golang.org/x/text` checksums even though `x/text` did not appear in the measured minimal compiled package list.

This is why `go.sum` must not be treated as a list of code linked into the executable.

Do not manually prune `go.sum`. Let Go manage it through `go mod tidy`.

## Current comparison

Measured simplified shapes:

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

```text
modernc SQLite
→ modernc.org/sqlite
→ modernc.org/libc
   ├── modernc.org/memory
   └── modernc.org/mathutil
       └── bigfft
→ x/sys
→ additional supporting packages
```

Under a dependency-minimisation criterion, the measured modernc consumer has the broadest compiled third-party surface of the three current baselines.

That is an engineering trade-off, not proof that modernc is unsafe or unsuitable.
