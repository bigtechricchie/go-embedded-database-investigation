# Frontend Filtering Benchmark

## Question

Can a browser-style JavaScript application keep tens of thousands of lightweight record summaries in memory and filter them quickly enough for an interactive search experience?

This matters because, at modest scale, fast client-side filtering can reduce the need to build server-side query infrastructure solely for text search and simple filters.

## Synthetic dataset

The benchmark uses synthetic London-style listing records with fields such as:

```text
id
type
category
title
area
status
shortSummary
```

No real customer or confidential data is used.

## Initial implementation

The first version rebuilt searchable text on every filter operation:

```js
const searchableText =
  `${record.title} ${record.area} ${record.shortSummary}`.toLowerCase();
```

Measured results:

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

## Precomputed search text

The benchmark was then changed to normalize searchable text once when records are created or loaded:

```js
searchText:
  `${title} ${area} ${shortSummary}`.toLowerCase()
```

Filtering then performs only:

```js
record.status === "active" &&
record.searchText.includes(searchTerm)
```

Three measured 50,000-record runs produced:

```text
4.564 ms
4.092 ms
4.426 ms
```

Average:

```text
≈ 4.36 ms
```

Compared with the earlier 24.948 ms run, the measured filter step was approximately 5.7 times faster.

## Interpretation

This result supports the viability of an architecture in which:

```text
embedded database
→ API returns lightweight summaries
→ frontend normalizes once
→ summaries retained in memory
→ repeated local search/filter/sort
→ render only matching records
```

It does not mean that 50,000 DOM elements should be rendered.

The benchmark measures filtering only.

## Limitations

The experiment does not measure:

- network transfer
- HTTP compression
- JSON parsing
- DOM rendering
- Angular or SolidJS change/render cost
- memory pressure
- mobile hardware
- low-powered devices
- real production data
- fuzzy search
- relevance ranking

Those should be measured separately if they become relevant.

## Run the benchmark

From this directory:

```powershell
node .\filter-benchmark.js
```

Node.js must provide the standard `performance` API.

## Current conclusion

For the tested machine and synthetic data, filtering 50,000 lightweight summaries with precomputed normalized text is not a performance reason by itself to require server-side SQL search.
