---
title: Autentificare și securitate
---

**Pentru cine**: Operatorii și dezvoltatorii care livrează/integră API‑ul

**Rezultate**: Înțelegeți valorile implicite, cheile pentru rate‑limit și CORS în producție

## Autentificare

- Accesul în citire nu necesită autentificare implicit. Endpoint‑urile sunt publice pentru interogare.
- Un antet special poate fi configurat de operator pentru limite mai mari (stil API key). Dacă este activ în mediul dvs., cereți numele antetului și cheia administratorului.

## Transport și CORS

- În producție, CORS este restricționat la originile configurate. Dacă frontend‑ul e blocat, adăugați domeniul în originile permise.
- Folosiți HTTPS în producție.

## Securitate GraphQL

- Limită de adâncime pentru interogări: 8 niveluri.
- Introspecția este dezactivată în producție. Folosiți această documentație sau `/mcp/v1/definition` pentru schema SDL.
- Interogările batch sunt dezactivate.

## Permisiuni date

- Datele expuse sunt publice (finanțe publice). Nu există endpoint‑uri de scriere.


