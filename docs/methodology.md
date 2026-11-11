# Investigation Methodology

## Purpose

The goal is to compare embedded database choices using reproducible evidence rather than feature checklists or dependency-count assumptions.

## Principles

1. Test a minimal real consumer, not only the upstream repository.
2. Distinguish module selection from packages compiled into the application.
3. Record exact versions used by an experiment.
4. Prefer standard Go tooling for dependency analysis.
5. Treat vulnerability scanning as one security signal, not proof of safety.
6. Keep synthetic benchmark data free of confidential or customer information.
7. Measure before adding optimisations or infrastructure.
8. Preserve historical findings when a later experiment changes the conclusion.

## Dependency workflow

For a candidate Go dependency:

```powershell
go mod tidy
go list -m all
go mod graph
go list -deps ./...
go mod verify
go test ./...
go build .
govulncheck ./...
```

For a particular module:

```powershell
go mod why -m <module>
```

On Windows, a compact view of external compiled packages can be obtained with:

```powershell
go list -deps ./... |
    Select-String "github.com|golang.org|modernc.org|lukechampine.com"
```

## Application-sizing workflow

Database capabilities should be evaluated against realistic application scale.

Measure:

- record count
- average summary size
- full-record size
- transfer size
- JSON parsing cost
- memory use
- filtering/search cost
- rendering cost
- write frequency
- concurrent writers
- query complexity

Do not assume that a database feature is necessary merely because it exists.

## Benchmark interpretation

A benchmark result is evidence for the tested machine, dataset, code path, and runtime only.

It is not a universal performance guarantee.

Every benchmark result should record:

- dataset size
- operation performed
- measured result
- important implementation details
- limitations

## Security interpretation

`govulncheck` reports known vulnerabilities reachable through analysed Go code. A clean result does not prove that a dependency has no unknown vulnerabilities, malicious changes, or future advisories.

Likewise, `go mod verify` checks module-cache integrity against recorded hashes. It does not establish that upstream source code is trustworthy.

Security decisions should combine provenance, dependency surface, maintenance quality, vulnerability information, reproducibility, and actual application need.
