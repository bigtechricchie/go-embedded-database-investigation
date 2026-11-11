# Database Selection Criteria

## Decision principle

Do not choose SQLite because it has more features, and do not choose bbolt merely because it has fewer dependencies.

Choose the simplest persistence model that satisfies measured application requirements without creating excessive custom infrastructure.

## bbolt is attractive when

- access patterns are simple and explicit
- whole records can be stored and retrieved by stable keys
- one-writer semantics are acceptable
- deployment simplicity matters
- a very small third-party dependency surface is valuable
- complex relational constraints are not required
- reporting and ad-hoc querying are limited
- application-owned secondary indexes remain small and understandable

A representative model is:

```text
records bucket
ID → complete record
```

If necessary, additional buckets can maintain targeted indexes:

```text
status index
"active" → record IDs

category index
"item" → record IDs
```

The cost is that the application owns the consistency and maintenance of those indexes.

## SQLite is attractive when

- SQL significantly simplifies application logic
- multiple secondary indexes are required
- relational constraints matter
- joins become normal application behaviour
- date/range queries are frequent
- server-side sorting and filtering are important
- aggregation and reporting requirements grow
- ad-hoc investigation queries are useful
- custom bbolt index maintenance would become substantial

SQLite still does not become PostgreSQL-style multi-writer infrastructure. It is an embedded database and should be evaluated as such.

## Frontend filtering changes the trade-off

For modest datasets, a browser can keep lightweight summaries in memory and perform search/filter/sort locally.

A possible architecture is:

```text
embedded database
→ API returns lightweight summaries
→ frontend normalizes searchable fields once
→ summaries retained in memory
→ local search/filter/sort
→ full record fetched on demand
```

This can reduce the need for server-side query infrastructure when the dataset and payload remain reasonable.

## Sizing questions

Before changing databases, answer:

1. How many active records are normally relevant to the user?
2. What is the average summary payload size?
3. How many records must be transferred at once?
4. How many writes occur per day?
5. How many processes or application instances need to write?
6. How many independent indexes would bbolt require?
7. Are joins or relational constraints becoming core requirements?
8. Is reporting becoming a product feature?
9. Is the custom-index maintenance burden increasing?
10. Would PostgreSQL, rather than SQLite, be the real destination if multi-writer requirements appear?

## Current position

Dataset size and simple frontend filtering alone do not currently justify replacing bbolt.

SQLite should become preferred when its relational/query capabilities remove more complexity than its additional dependency and operational surface introduces.
