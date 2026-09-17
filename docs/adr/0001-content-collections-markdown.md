# ADR 0001 — Content Collections en markdown en el repo (sin CMS headless)

## Estado
Aceptado

## Fecha
2026-05-21

## Contexto
El blog de Pomelo Baby necesita un sistema para gestionar posts. Las opciones evaluadas fueron:

1. **Content Collections de Astro (markdown en el repo)** — los posts viven como archivos `.md` en `src/content/blog/`, versionados en git.
2. **CMS headless (Sanity, Contentful, Decap CMS)** — interfaz visual para escribir y publicar posts, desacoplada del código.

El perfil del equipo editorial es: Mar escribe el contenido en texto plano o lo genera a partir de imágenes de Instagram, y el desarrollador (Rafa) lo formatea a markdown y hace el commit.

## Decisión
Usamos Content Collections de Astro con archivos markdown en el repo.

## Razones
- El desarrollador es el único que publica — no hay necesidad de una interfaz visual para no técnicos.
- Cero dependencias externas, cero coste adicional.
- El contenido está versionado en git junto al código.
- Si en el futuro Mar necesita publicar sin intervención del desarrollador, se puede añadir Decap CMS encima sin cambiar la estructura de archivos.

## Consecuencias
- Publicar un post requiere intervención del desarrollador (commit + push).
- El flujo de creación de contenido está documentado en `PROMPT-BLOG.md`.
- Si el volumen de posts crece mucho o Mar quiere autonomía editorial, habrá que evaluar añadir Decap CMS o migrar a un CMS headless.
