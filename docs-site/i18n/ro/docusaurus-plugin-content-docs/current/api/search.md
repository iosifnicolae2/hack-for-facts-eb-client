---
title: Căutare — Entități și clasificări
---

Această pagină explică modul în care funcționează căutarea pentru entități și seturile de date de clasificări (funcțională, economică, surse de finanțare, sectoare bugetare, UAT‑uri), cu exemple și sfaturi pentru rezultate mai bune.

**Pentru cine**: Dezvoltatori și utilizatori care caută în seturi de date

**Rezultate**: Formulați interogări eficiente și preferați modurile indexate

### Cum se potrivește textul

- Case‑insensitive: căutarea textuală folosește `ILIKE`.
- Fuzzy: trigram (pg_trgm) îmbunătățește ordonarea pentru potriviri apropiate (typo, parțiale).
- Prioritate pentru prefixe: potrivirile exacte/prefix sunt prioritizate.
- Cod vs nume: căutările în clasificări acceptă mod pe cod (prefix) și mod pe nume.

Indici (din schemă)

- Trigram GIN: `Entities(name,address)`, `UATs(name,county_name)`, `FunctionalClassifications(functional_name)`, `EconomicClassifications(economic_name)`, `FundingSources(source_description)`, `Reports(download_links)`.
- Prefix (varchar_pattern_ops): pentru `functional_code` și `economic_code` (LIKE `'xx%'`).

### Entități

```graphql
query($filter: EntityFilter, $limit:Int, $offset:Int){
  entities(filter:$filter, limit:$limit, offset:$offset){
    nodes{ cui name entity_type uat_id }
    pageInfo{ totalCount }
  }
}
```

Filtre uzuale

- `filter.search`: fuzzy pe nume (și adresă); prefixele sunt prioritizate.
- Alte filtre: `entity_type`, `is_uat`, `uat_id`, `name` (ILIKE), `address` (ILIKE), `cui`/`cuis`.

REST (helper AI)

```bash
curl 'http://localhost:3000/ai/v1/entities/search?search=Sibiu&limit=5'
```

### Clasificări funcționale

```graphql
query($q:String){
  functionalClassifications(filter:{search:$q}, limit:20){
    nodes{ functional_code functional_name }
    pageInfo{ totalCount }
  }
}
```

Moduri de căutare

- Mod cod: `fn:<prefix>` (ex.: `fn:65`) sau input numeric (`65`, `65.04`, `65.04.02`) → `LIKE 'prefix%'`.
- Mod nume: alte input‑uri caută `functional_name` cu ILIKE + trigram; prefixele primează.

Sfaturi

- Preferă prefixe când știi capitol/subcapitol; sunt indexate și rapide.
- Pentru termeni românești (ex.: "Învățământ"), folosiți o rădăcină distinctivă dacă nu sunteți sigur de diacritice.

### Clasificări economice

```graphql
query($q:String){
  economicClassifications(filter:{search:$q}, limit:20){
    nodes{ economic_code economic_name }
    pageInfo{ totalCount }
  }
}
```

Moduri de căutare

- Mod cod: `ec:<prefix>` (ex.: `ec:10.01`) sau `10`, `10.01`, `10.01.01` → `LIKE 'prefix%'`.
- Mod nume: ILIKE + trigram; prefixele primează.

REST (helper AI)

```bash
curl 'http://localhost:3000/ai/v1/economic-classifications?search=ec:10.01&limit=10'
```

### Sfaturi & trucuri

- Folosiți prefixe punctate pentru familii (ex.: `10.01` pentru salarii).
- Combinați căutarea cu filtre de analitice pentru a focaliza imediat rezultatele.
- Pentru entități/UAT‑uri, adăugați filtre structurale (`is_uat`, `entity_type`, `county_code`).

### Vezi și

- Endpoint‑uri REST: [rest-endpoints](./rest-endpoints.md)
- Interogări GraphQL: [graphql-queries](./graphql-queries.md)
- Filtre/paginare/sortare: [filters-pagination-sorting](./filters-pagination-sorting.md)


