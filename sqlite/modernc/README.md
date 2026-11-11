# modernc.org/sqlite Investigation

## Candidate

`modernc.org/sqlite`

## Status

**Investigation pending.**

This candidate has not yet been measured in this repository.

The purpose of this folder is to evaluate `modernc.org/sqlite` using the same evidence-based process already applied to `github.com/ncruces/go-sqlite3`.

No dependency-size, performance, security, or production-suitability conclusion should be inferred from this document yet.

## Why investigate it

`modernc.org/sqlite` is relevant because it provides a CGO-free SQLite implementation for Go.

That makes it useful to compare when:

- Windows development matters
- a C compiler should not be required
- `database/sql` integration is desirable
- reproducible Go builds are important
- dependency and supply-chain review are part of the database decision

## Questions to answer

The investigation should establish:

- exact version tested
- Go version used
- selected module graph
- actual compiled package graph
- why each important transitive module is present
- relationship with `modernc.org/libc`
- CGO requirements
- Windows build behaviour
- `database/sql` behaviour
- vulnerability-scan results
- module verification result
- operational considerations such as WAL, backup, and migrations

## Planned minimal consumer

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

The exact driver name and DSN should be verified against the version selected for the experiment before treating this fixture as final evidence.

## Planned dependency commands

```powershell
go mod tidy
go list -m all
go mod graph
go list -deps ./...
go mod why -m modernc.org/libc
go mod verify
go test ./...
go build .
govulncheck ./...
```

For a compact view of external compiled packages on Windows:

```powershell
go list -deps ./... |
    Select-String "github.com|golang.org|modernc.org|lukechampine.com"
```

## Comparison rule

The final comparison must be measured-to-measured.

We should not compare measured ncruces results with assumptions about modernc.

Findings will be added only after the minimal consumer has been created and the dependency, build, and vulnerability checks have been run.
