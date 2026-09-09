# Guía para artículos del blog de Pomelo Baby

Referencia obligatoria para crear o modificar artículos en `src/content/blog/`.

El diseño común ya vive en `src/pages/blog/[slug].astro`: no añadas CSS ni estilos inline al artículo. Los posts existentes son ejemplos, no la fuente de verdad.

## Objetivo

Resolver **una duda concreta** con información útil, clara y suficiente.

- Extensión orientativa: **700-1.000 palabras**; superar 1.200 solo si el tema lo exige.
- Elimina información secundaria antes de añadir más apartados.
- El resultado debe dar tranquilidad y criterio, no parecer un manual médico.
- No incluyas ebooks, guías, productos, compras ni promociones.

La persona debe terminar pensando: “Ahora lo entiendo y sé qué vigilar”, no “Tengo que memorizar 25 normas”.

## Voz

Sigue siempre la voz de Mar definida en `AGENTS.md`:

- Cercana, cálida, directa y profesional.
- Lenguaje cotidiano y párrafos cortos.
- Ciencia y validación emocional juntas.
- Sin alarmar, culpabilizar, juzgar ni infantilizar.
- Lenguaje inclusivo: “niño o niña”, “hijo o hija”, “decaído/a”.
- Como máximo, 3 o 4 toques de humor naturales. Nunca bromees sobre situaciones graves.

## Estructura

El layout genera automáticamente el H1, la entradilla y la firma.

1. Frontmatter.
2. Introducción breve que conecte con la duda real de la familia.
3. H2 para las secciones principales; H3 solo para preguntas o subsecciones.
4. Respuesta práctica: qué significa, qué puede hacerse y cuándo consultar.
5. Bloque breve `🍊 Qué quiero que recuerdes`.
6. Disclaimer educativo.

Usa negrita solo para conceptos clave. Evita párrafos enteros en negrita, bloques densos y secciones repetidas.

## Frontmatter

```yaml
---
title: "Título claro y orientado a búsqueda"
description: "Entradilla de hasta 155 caracteres."
pubDate: YYYY-MM-DD
category: salud
tags: ["fiebre", "bebé", "pediatría"]
draft: false
---
```

Sustituye el ejemplo por la fecha, categoría y etiquetas reales. Las categorías válidas son `alimentacion`, `sueño`, `salud`, `desarrollo` y `crianza`; el esquema definitivo está en `src/content.config.ts`.

## Recursos visuales

Úsalos solo cuando faciliten la lectura. No destaques cada conclusión.

### Frase con caja

```md
> **Una idea importante y breve.**
```

### Frase destacada sin caja

```html
<p class="editorial-highlight">Una idea importante y breve.</p>
```

Alterna ambos formatos. Como orientación, usa entre 3 y 5 destacados en todo el artículo.

### Lista visual

```html
<ul class="visual-list">
  <li>💧 Elemento breve.</li>
  <li>👀 Elemento breve.</li>
</ul>
```

Para seguridad o advertencias en una sola columna, añade `safety-list` o `warning-list`:

```html
<ul class="visual-list safety-list">
  <li>👶 Medida de seguridad.</li>
</ul>
```

### Señales para consultar

```html
<section class="warning-signs" aria-labelledby="warning-signs-title">
  <h3 id="warning-signs-title">🚩 Consulta si:</h3>
  <ul>
    <li>Señal explicada con claridad.</li>
  </ul>
</section>
```

Debe comunicar “esto es importante”, no “entra en pánico”. El `id` debe ser único y coincidir con `aria-labelledby`.

### Cierre Pomelo Baby

```html
<section class="takeaways" aria-labelledby="takeaways-title">
  <h2 id="takeaways-title">🍊 Qué quiero que recuerdes</h2>
  <p>Resumen breve.</p>
  <p class="takeaways__final"><strong>Idea final importante.</strong></p>
</section>
```

Limítalo a 3-5 ideas. Usa `takeaways__welcome` únicamente para una frase final muy breve que realmente lo necesite.

## Fuentes sanitarias

- Verifica las afirmaciones antes de publicar.
- Prioriza fuentes oficiales y sociedades científicas: AEP, AESAN, Ministerio de Sanidad, OMS y guías clínicas vigentes.
- No inventes estudios, cifras, recomendaciones ni enlaces.
- Añade al final, antes del disclaimer, una sección `## Fuentes consultadas` con una lista numerada de 2-4 referencias relevantes.
- Usa enlaces descriptivos con el nombre de la entidad y el título del recurso. Nunca dejes dominios sueltos como `(dominio.es)` ni uses “haz clic aquí”.
- Enlaza la página oficial concreta que respalda la información; usa una portada solo cuando la referencia sea general.
- Si una afirmación necesita atribución dentro del texto, enlaza el nombre de la fuente de forma natural. Evita repetir la misma cita en cada párrafo.
- Incluye únicamente fuentes realmente consultadas y expresa los límites de la evidencia cuando corresponda.

Ejemplo:

```md
## Fuentes consultadas

1. [Asociación Española de Pediatría — EnFamilia](https://www.aeped.es/enfamilia)
```

## Disclaimer

Adáptalo al tema y mantenlo breve:

```md
---

*Este artículo tiene finalidad educativa y no sustituye una valoración individual. Ante cualquier duda sobre la salud de tu bebé, consulta con un profesional sanitario.*
```

## Antes de publicar

1. ¿Resuelve una sola duda sin convertirse en un manual?
2. ¿Puede eliminarse algún apartado sin perder la respuesta principal?
3. ¿Las recomendaciones sanitarias están verificadas y existe una sección `Fuentes consultadas` con enlaces oficiales y descriptivos?
4. ¿Se han eliminado los dominios sueltos y se enlaza el recurso concreto cuando existe?
5. ¿La negrita, el humor y los destacados se usan con moderación?
6. ¿El bloque de señales es claro y el cierre es breve?
7. ¿La fecha y el frontmatter son correctos?
8. Ejecuta `npm run build`.
