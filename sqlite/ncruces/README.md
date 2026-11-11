# ncruces/go-sqlite3 Investigation

## Candidate

```text
github.com/ncruces/go-sqlite3 v0.37.0
```

The candidate is interesting because it provides SQLite without requiring CGO and integrates with Go's `database/sql` package.

## Minimal consumer

```go
package main

import (
    "database/sql"

    _ "github.com/ncruces/go-sqlite3/driver"
)

func main() {
    database, err := sql.Open("sqlite3", ":memory:")
    if err != nil {
        panic(err)
    }
    defer database.Close()

    if err := database.Ping(); err != nil {
        panic(err)
    }
}
```

The deprecated `github.com/ncruces/go-sqlite3/embed` package is not required by this experiment.

## Selected module footprint

After adding the dependency and tidying the module, the relevant selected modules were:

```text
github.com/ncruces/go-sqlite3 v0.37.0
github.com/ncruces/go-sqlite3-wasm/v6 v6.5.35401
github.com/ncruces/julianday v1.0.0
golang.org/x/sys v0.49.0
```

## Compiled package path

The measured external package output included:

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

This was significantly smaller than the broader dependency list visible in the upstream project's own module file.

Optional upstream dependencies for features such as UUID support, approximate counting, additional crypto, and Unicode extensions did not appear in this minimal compiled path.

## Why the supporting modules exist

Measured `go mod why` paths:

### julianday

```text
sqlite-driver-investigation
github.com/ncruces/go-sqlite3/driver
github.com/ncruces/go-sqlite3
github.com/ncruces/julianday
```

### SQLite WASM

```text
sqlite-driver-investigation
github.com/ncruces/go-sqlite3/driver
github.com/ncruces/go-sqlite3
github.com/ncruces/go-sqlite3-wasm/v6
```

### x/sys

```text
sqlite-driver-investigation
github.com/ncruces/go-sqlite3/driver
github.com/ncruces/go-sqlite3
github.com/ncruces/go-sqlite3/internal/sqlite3_wrap
golang.org/x/sys/unix
```

The final package selected by `x/sys` is platform-dependent; the Windows compiled package listing showed `golang.org/x/sys/windows`.

## Checksum footprint

The experiment's `go.sum` contained checksums for:

```text
github.com/ncruces/go-sqlite3
github.com/ncruces/go-sqlite3-wasm/v6
github.com/ncruces/julianday
golang.org/x/sys
golang.org/x/text
```

`golang.org/x/text` did not appear in the measured minimal compiled package path.

This demonstrates why `go.sum` should not be treated as an executable dependency inventory.

## Vulnerability scan

Command:

```powershell
govulncheck ./...
```

Measured result:

```text
No vulnerabilities found.
```

Interpretation: no known reachable vulnerabilities were reported for the analysed code at the time of the experiment.

This does not prove the dependency is free of unknown vulnerabilities or future advisories.

## Current assessment

```text
CGO requirement:                 No
database/sql support:            Yes
Windows path tested:             Yes
Compiled dependency surface:     Small for the tested consumer
Known reachable vulnerabilities: None reported in the measured scan
```

The candidate should no longer be rejected solely because the upstream module graph looks larger than bbolt's.

Further operational and comparative testing is still required before treating it as a production default.
