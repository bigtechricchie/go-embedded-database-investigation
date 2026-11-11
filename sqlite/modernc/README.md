# modernc.org/sqlite Investigation

## Candidate

`modernc.org/sqlite v1.62.0`

## Status

**Dependency and verification findings measured.**

The minimal consumer was verified with Go 1.27.2 on Windows.

## Minimal consumer

```go
package main

import (
	"database/sql"

	_ "modernc.org/sqlite"
)

func main() {
	database, err := sql.Open("sqlite", ":memory:")
	if err != nil {
		panic(err)
	}
	defer database.Close()

	if err := database.Ping(); err != nil {
		panic(err)
	}
}
```

## Selected module graph

The resulting `go.mod` contained:

```text
modernc.org/sqlite v1.62.0

github.com/dustin/go-humanize v1.1.0
github.com/google/uuid v1.6.0
github.com/mattn/go-isatty v0.0.24
github.com/ncruces/go-strftime v1.1.0
github.com/remyoudompheng/bigfft v0.0.0-20230129092748-24d4a6f8daec
golang.org/x/sys v0.49.0
modernc.org/libc v1.80.1
modernc.org/mathutil v1.7.1
modernc.org/memory v1.12.1
```

At the selected-module level, this is materially larger than the measured ncruces candidate.

## Compiled package path

The minimal application produced this relevant external package output:

```text
github.com/dustin/go-humanize
github.com/mattn/go-isatty
github.com/ncruces/go-strftime
golang.org/x/sys/cpu
vendor/golang.org/x/net/dns/dnsmessage
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

The `vendor/golang.org/x/net/dns/dnsmessage` entry comes from Go toolchain/standard-library vendored code and should not be counted as another application module dependency.

## Important finding

Unlike the ncruces experiment, most of modernc's larger dependency surface is actually present in the compiled package graph of the minimal consumer.

This is therefore not only module-graph noise.

## Why the core supporting modules exist

Measured `go mod why` output established these paths.

### modernc.org/libc

```text
sqlite-driver-investigation-modernc
modernc.org/sqlite
modernc.org/libc
```

### modernc.org/memory

```text
sqlite-driver-investigation-modernc
modernc.org/sqlite
modernc.org/libc
modernc.org/memory
```

### modernc.org/mathutil

```text
sqlite-driver-investigation-modernc
modernc.org/sqlite
modernc.org/libc
modernc.org/mathutil
```

### github.com/remyoudompheng/bigfft

```text
sqlite-driver-investigation-modernc
modernc.org/sqlite
modernc.org/libc
modernc.org/mathutil
github.com/remyoudompheng/bigfft
```

These are genuine implementation dependencies of the tested minimal SQLite consumer.

## Verification results

### Module integrity

Command:

```powershell
go mod verify
```

Measured result:

```text
all modules verified
```

This confirms the downloaded module contents match the checksums recorded by the Go module system. It is an integrity check, not a trust or malicious-code guarantee.

### Build

Command:

```powershell
go build .
```

Measured result:

```text
success
```

The minimal consumer built successfully on the tested Windows development machine.

### Tests

Command:

```powershell
go test ./...
```

Measured result:

```text
?       sqlite-driver-investigation-modernc     [no test files]
```

This confirms the package compiled successfully under `go test`; the fixture currently contains no test files.

### Vulnerability scan

Command:

```powershell
govulncheck ./...
```

Measured result:

```text
No vulnerabilities found.

Your code is affected by 0 vulnerabilities.
This scan also found 0 vulnerabilities in packages you import and 2
vulnerabilities in modules you require, but your code doesn't appear to call
these vulnerabilities.
```

This distinction is important.

The scan reported:

```text
reachable vulnerabilities in application code: 0
vulnerabilities in imported packages:            0
vulnerabilities in required modules:              2
reachable calls to those module vulnerabilities:  no
```

Therefore, it would be misleading to record only "No vulnerabilities found" without also preserving the two vulnerable-module findings.

The verbose output should be inspected separately if the exact module advisories need to be documented.

## Current comparison with ncruces

Measured simplified dependency shapes:

```text
ncruces/go-sqlite3
→ go-sqlite3
→ go-sqlite3-wasm
→ julianday
→ x/sys
```

```text
modernc.org/sqlite
→ modernc.org/sqlite
→ modernc.org/libc
   ├── modernc.org/memory
   └── modernc.org/mathutil
       └── bigfft
→ x/sys
→ additional supporting packages
```

This means modernc has a materially larger compiled dependency surface for the tested minimal consumer.

That does not make modernc unsuitable. It means its implementation approach carries a larger runtime-support stack into the application and therefore creates a broader supply-chain and review surface.

## Current assessment

```text
CGO requirement:                 No
database/sql support:            Yes
Windows dependency path:         Measured
Compiled dependency surface:     Materially larger than ncruces
Dependency paths:                Clearly attributable
go mod verify:                   Passed
go build:                        Passed
go test:                         Passed; no test files
Reachable vulnerabilities:       0
Imported-package vulnerabilities: 0
Required-module vulnerabilities:  2, not reached by application code
```

## Current position

modernc remains a technically viable CGO-free SQLite option.

Under this repository's dependency-minimisation criteria, ncruces currently has the smaller measured compiled dependency surface.

The two required-module vulnerability findings should be investigated with verbose `govulncheck` output before any production recommendation is made.
