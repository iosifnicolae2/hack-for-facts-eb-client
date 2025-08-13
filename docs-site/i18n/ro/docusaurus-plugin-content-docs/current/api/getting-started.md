---
title: API – Începe rapid
---

Trimiteți cereri GraphQL la `POST /graphql` cu un JSON ce include `query` și opțional `variables`.

Exemplu: listează entități

```bash
curl -X POST http://localhost:3000/graphql \
  -H 'content-type: application/json' \
  -d '{
  "query": "query($limit:Int,$offset:Int){ entities(limit:$limit, offset:$offset){ nodes{ cui name entity_type } pageInfo{ totalCount } } }",
  "variables": { "limit": 5, "offset": 0 }
}'
```
