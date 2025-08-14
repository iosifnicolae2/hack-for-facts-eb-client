---
title: API – Începe rapid
---

Trimiteți cereri GraphQL la `POST /graphql` cu un JSON ce include `query` și opțional `variables`.

Start rapid (copy‑paste)

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($f:AnalyticsFilterInput!){ entityAnalytics(filter:$f, limit:3){ nodes{ entity_cui entity_name total_amount per_capita_amount } pageInfo{ totalCount } } }",
  "variables": { "f": { "years": [2024], "account_category": "ch" } }
}'
```

Note

- Câmpuri obligatorii pentru analitice: `years` și `account_category` (`vn` venituri, `ch` cheltuieli)
- Adăugați `normalization: "per_capita"` pentru comparații corecte între mărimi diferite; altfel se returnează totaluri

Exemplu: listează entități

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($limit:Int,$offset:Int){ entities(limit:$limit, offset:$offset){ nodes{ cui name entity_type } pageInfo{ totalCount } } }",
  "variables": { "limit": 5, "offset": 0 }
}'
```
