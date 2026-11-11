# Findings

## Summary

The investigation has now produced three important findings.

First, the practical dependency surface of `github.com/ncruces/go-sqlite3` is much smaller than its broader upstream module graph initially suggested.

Second, `modernc.org/sqlite` has a materially larger compiled dependency surface in the equivalent minimal consumer, not merely a larger selected-module graph.

Third, frontend filtering of tens of thousands of lightweight records is fast enough on the tested development machine that server-side SQL filtering is not automatically required for every modest-scale application.

## bbolt dependency finding

Earlier measured baseline:

```text
go.etcd.io/bbolt v1.5.0
golang.org/x/sys v0.45.0
```

The compiled external package path was small and dominated by bbolt plus `x/sys/windows`.

This remains a strong argument for bbolt when simple key/value persistence is sufficient.

## SQLite: ncruces dependency finding

Tested candidate:

```text
github.com/ncruces/go-sqlite3 v0.37.0
```

The relevant selected modules were:

```text
github.com/ncruces/go-sqlite3
github.com/ncruces/go-sqlite3-wasm/v6
github.com/ncruces/julianday
golang.org/x/sys
```

The application was scanned with:

```powershell
govulncheck ./...
```

Measured result:

```text
No vulnerabilities found.
```

That means no known reachable vulnerabilities were reported for the analysed code at the time of the experiment. It is not a general proof of safety.

## SQLite: modernc dependency finding

Tested candidate:

```text
modernc.org/sqlite v1.62.0
```

The selected graph included:

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

The compiled package graph confirmed that most of the heavier modernc runtime stack is genuinely part of the minimal consumer.

Measured dependency paths include:

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

This makes modernc materially heavier than ncruces under the repository's dependency-minimisation criteria.

Build verification, tests, module verification, and vulnerability scanning are still pending and are not claimed as complete.

## Frontend filtering finding

Initial measured runs:

```text
Records: 25000
Matches: 89
Filter time: 13.778 ms
```

```text
Records: 50000
Matches: 89
Filter time: 24.948 ms
```

After precomputing normalized `searchText` once per record, three 50,000-record runs produced:

```text
4.564 ms
4.092 ms
4.426 ms
```

Average:

```text
≈ 4.36 ms
```

Compared with the earlier 24.948 ms run, this was approximately 5.7 times faster in the tested benchmark.

## What these findings do not prove

The filtering benchmark does not measure:

- network transfer
- HTTP compression
- JSON parsing
- Angular or SolidJS rendering
- DOM rendering
- mobile devices
- low-powered hardware
- production memory usage
- fuzzy or ranked search

The database experiments do not establish that a dependency is completely safe or that its current version is appropriate forever.

## Current conclusion

bbolt remains a credible choice for modest-write applications with simple persistence and controlled access patterns.

Among the two measured CGO-free SQLite candidates, ncruces currently has the smaller compiled dependency surface.

modernc remains technically viable, but its minimal consumer carries a broader implementation stack and therefore a larger dependency-review surface.

SQLite remains a credible choice when relational querying, constraints, reporting, and index complexity justify its additional dependency surface.

The current evidence does not support replacing bbolt solely because SQLite can perform server-side filtering.
