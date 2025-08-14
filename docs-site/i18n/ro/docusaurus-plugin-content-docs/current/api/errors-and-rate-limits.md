---
title: Erori și limitări de rată
---

**Pentru cine**: Dezvoltatori care gestionează răspunsuri de eroare și limite de throughput

**Rezultate**: Înțelegeți forma erorilor și cum funcționează rate limiting

## Erori

- GraphQL: erorile apar în array‑ul `errors`. Rezolverele trimit mesaje descriptive pentru validare și generice pentru eșec server.
- REST: JSON cu `{ ok: false, error, details? }` sau text simplu pentru health.

## Rate limiting

- Fereastră configurabilă via env. Cheie specială de API poate ridica plafonul.
- Cheia de rată: antetul special de API când e prezent, altfel IP client.

## Securitate și producție

- Introspecția GraphQL este dezactivată în producție.
- Limitare de adâncime pentru interogări GraphQL (implicit: 8).
- CORS restricționează originile în producție (configurabil via env).

## Bune practici

- Preferă paginația și filtrele țintite pentru payloaduri mici.
- Evită interogările GraphQL foarte adânci; se aplică limite de adâncime.
- La 429, faceți backoff și reîncercați după fereastră.

## Vezi și

- Autentificare & Securitate: [authentication-and-security](./authentication-and-security.md)
- Endpoint‑uri REST: [rest-endpoints](./rest-endpoints.md)

