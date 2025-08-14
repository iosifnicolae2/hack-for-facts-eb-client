---
id: search
title: Search – Entities and Classifications
---

This page explains how search works for entities and classification datasets (functional, economic, funding sources, budget sectors, UATs), with examples and tips to get better results.

**Who it's for**: Developers and users searching across datasets.

**Outcomes**: Compose effective search queries and prefer indexed modes.

### How matching works

- Case-insensitive: all textual search is case-insensitive via `ILIKE`.
- Fuzzy matching: trigram similarity (pg_trgm) improves ranking for close matches (typos, partials). Default threshold ≈ 0.1.
- Prefix prioritization: exact/prefix matches are ranked ahead of similar-but-not-prefix results.
- Code vs name: functional and economic classification searches support both code-prefix and name-text modes.

Indexes used (from the schema)

- Trigram (pg_trgm) GIN: `Entities(name,address)`, `UATs(name,county_name)`, `FunctionalClassifications(functional_name)`, `EconomicClassifications(economic_name)`, `FundingSources(source_description)`, `Reports(download_links)`.
- Prefix (varchar_pattern_ops): `FunctionalClassifications.functional_code`, `EconomicClassifications.economic_code` for `LIKE 'xx%'`.

### Entities

GraphQL

```graphql
query($filter: EntityFilter, $limit:Int, $offset:Int){
  entities(filter:$filter, limit:$limit, offset:$offset){
    nodes{ cui name entity_type uat_id }
    pageInfo{ totalCount }
  }
}
```

Common filters

- `filter.search`: fuzzy search across name (and address); uses trigram similarity and ranks prefix matches higher.
- Other filters: `entity_type`, `is_uat`, `uat_id`, `name` (ILIKE), `address` (ILIKE), `cui` or `cuis`.

REST (AI helper)

```bash
curl 'http://localhost:3000/ai/v1/entities/search?search=Sibiu&limit=5'
```

Tips

- Start with a short distinctive token (e.g., "Sibiu", "Cluj").
- If the entity is a UAT, filtering with `is_uat: true` narrows the set.
- Use `entity_type` to target specific cohorts (e.g., `admin_county_council`).

### UATs

GraphQL

```graphql
query($filter: UATFilter){
  uats(filter:$filter, limit:20){ nodes{ id uat_code name county_name } pageInfo{ totalCount } }
}
```

Notes

- `filter.search` searches `name` and `county_name` with trigram similarity.
- `is_county: true` returns county-level administrative units (special-case for Bucharest handled).

### Functional classifications

GraphQL

```graphql
query($q:String){
  functionalClassifications(filter:{search:$q}, limit:20){
    nodes{ functional_code functional_name }
    pageInfo{ totalCount }
  }
}
```

Search modes

- Code mode: use `fn:<prefix>` (e.g., `fn:65`) or bare code-like input (`65`, `65.04`, `65.04.02`). Matches by `LIKE 'prefix%'`.
- Name mode: any other input searches `functional_name` with ILIKE + trigram similarity and ranks prefix matches first.

Tips

- Prefer code prefixes when you know the chapter/subchapter structure; they are index-backed and fast.
- For Romanian terms (e.g., "Învățământ"), use a distinctive stem if unsure about diacritics.

### Economic classifications

GraphQL

```graphql
query($q:String){
  economicClassifications(filter:{search:$q}, limit:20){
    nodes{ economic_code economic_name }
    pageInfo{ totalCount }
  }
}
```

Search modes

- Code mode: use `ec:<prefix>` (e.g., `ec:10.01`) or bare code-like inputs (`10`, `10.01`, `10.01.01`). Matches by `LIKE 'prefix%'`.
- Name mode: searches `economic_name` with ILIKE + trigram similarity; ranks prefix matches first.

REST (AI helper)

```bash
curl 'http://localhost:3000/ai/v1/economic-classifications?search=ec:10.01&limit=10'
```

Tips

- Use dotted prefixes to capture families (e.g., `10.01` for salaries).
- Combine with analytics filters (e.g., in charts) to focus on a topic across entities/geographies.

### Funding sources

GraphQL

```graphql
query($q:String){
  fundingSources(filter:{search:$q}, limit:20){ nodes{ source_id source_description } pageInfo{ totalCount } }
}
```

Notes

- Text search uses ILIKE + trigram on `source_description`.

### Budget sectors

GraphQL

```graphql
query($q:String){
  budgetSectors(filter:{search:$q}, limit:20){ nodes{ sector_id sector_description } pageInfo{ totalCount } }
}
```

Notes

- Text search uses ILIKE + trigram on `sector_description`.

### Datasets (static)

GraphQL

```graphql
query($q:String){
  datasets(filter:{search:$q}, limit:20){ nodes{ id name description } pageInfo{ totalCount } }
}
```

Notes

- Uses in-memory Fuse.js fuzzy search across `name` and `description` (client-friendly static datasets).

### Tips & tricks


See also

- REST helpers: [rest-endpoints](./rest-endpoints.md)
- GraphQL queries: [graphql-queries](./graphql-queries.md)
- Prefer code-prefix searches (`fn:`/`ec:`) when you know the classification families; they are fast and precise.
- Use short, distinctive tokens for name searches; trigram will rank close matches higher.
- For entity/UAT searches, add structural filters (`is_uat`, `entity_type`, `county_code`) to narrow candidates.
- Combine search with analytics filters to immediately scope results (e.g., search economic code then query entity analytics with that code prefix).
 - Filters, pagination, and sorting: [filters-pagination-sorting](./filters-pagination-sorting.md)


