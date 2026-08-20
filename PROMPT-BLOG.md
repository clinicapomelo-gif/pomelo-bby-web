# Prompt y guía para artículos del blog de Pomelo Baby

Esta es la referencia para crear y maquetar futuros artículos. El diseño consolidado parte de:

- `src/content/blog/blw-que-es-por-donde-empezar.md`
- `src/content/blog/fiebre-bebes-cuando-preocuparse.md`

Los estilos comunes viven en `src/pages/blog/[slug].astro` y se aplican automáticamente a todos los artículos de `src/content/blog/`. No añadas estilos dentro de cada post ni dupliques CSS.

## Categorías disponibles

Actualiza esta lista si cambia el esquema de `src/content.config.ts`:

- `alimentacion`
- `sueño`
- `salud`
- `desarrollo`
- `crianza`

## Diseño editorial obligatorio

- Diseño limpio, cálido, profesional, editorial y visual, acorde con Pomelo Baby.
- Lectura cómoda y escaneable desde móvil.
- Mucho espacio en blanco y párrafos cortos.
- Cada artículo resuelve una duda concreta: debe ser útil, pero no convertirse en un manual completo ni saturar de información.
- `H1`: título del artículo, generado automáticamente desde `title`.
- Entradilla: `description`, visible bajo el H1 con un tamaño ligeramente menor.
- Firma: pequeña y discreta; se genera automáticamente.
- `H2`: secciones principales.
- `H3`: preguntas o subsecciones dentro de cada sección.
- Texto normal con tamaño cómodo e interlineado amplio.
- Negrita solo para conceptos clave y palabras que ayuden a escanear. Nunca párrafos enteros.
- Alternar frases importantes en citas Markdown (`>`) y destacados editoriales sin caja; no encerrar todas las frases.
- Listas con aire entre elementos.
- Advertencias visibles, pero nunca alarmistas: deben comunicar “esto es importante”, no “entra en pánico”.
- Como máximo, 3 o 4 toques de humor breves, naturales y nunca relacionados con situaciones graves.
- La sección “🍊 Qué quiero que recuerdes” debe usar siempre el bloque especial documentado abajo y ser breve.
- No incluir referencias a ebooks, guías, productos, compras ni promociones dentro del artículo.
- El lector debe terminar entendiendo la duda y sabiendo qué vigilar, no intentando memorizar una lista interminable.

## Voz y rigor

- Cercana, cálida, clara y directa.
- Ciencia y validación emocional juntas.
- Sin alarmar, culpabilizar, juzgar ni infantilizar.
- Explicar cualquier término médico con lenguaje cotidiano.
- Usar lenguaje inclusivo: “niño o niña”, “hijo o hija”, “decaído/a”.
- No presentar absolutos cuando la evidencia tenga limitaciones.
- Explicar qué puede ser normal, qué puede hacer la familia y cuándo consultar.
- Verificar afirmaciones sanitarias y recomendaciones antes de publicar.
- El artículo debe sentirse profesional y amable, no como un documento médico.

## Fuentes y enlaces

- Añade al final, antes del disclaimer, una sección `## Fuentes consultadas` con una lista numerada de 2-4 referencias relevantes.
- Usa enlaces descriptivos con el nombre de la entidad y el título del recurso. No uses dominios sueltos como `(enfamilia.aeped.es)` ni textos como “haz clic aquí”.
- Enlaza la página oficial concreta que respalda la información; usa una portada solo cuando la referencia sea general.
- Incluye únicamente fuentes realmente consultadas y prioriza organismos sanitarios, sociedades científicas y guías clínicas.
- Si una afirmación necesita atribución dentro del texto, enlaza allí el nombre de la fuente de forma natural y evita citas repetidas.

```md
## Fuentes consultadas

1. [Asociación Española de Pediatría — EnFamilia](https://www.aeped.es/enfamilia)
```

## Bloques visuales disponibles

Estos nombres de clase forman parte del diseño compartido y no deben renombrarse sin actualizar `src/pages/blog/[slug].astro`.

### Frase destacada

Usa una cita Markdown. Puede contener una frase secundaria, pero no párrafos largos.

```md
> **No necesitas hacerlo perfecto.**
>
> Necesitas hacerlo seguro y adaptado a tu familia.
```

Para destacar sin caja y dejar que el artículo respire:

```html
<p class="editorial-highlight">Frase breve con especial valor.</p>
```

No destaques cada conclusión. Reserva ambos formatos para las pocas frases que de verdad ayudan a entender o recordar el artículo.

### Tarjetas visuales

Para alimentos, señales, cuidados o elementos fáciles de escanear:

```html
<ul class="visual-list">
  <li>🥑 Elemento breve.</li>
  <li>🍌 Elemento breve.</li>
</ul>
```

En escritorio aparecen en dos columnas y en móvil en una. Se pueden añadir nombres descriptivos como `checklist`, `food-grid` o `care-list`, pero `visual-list` es la clase que activa el diseño.

### Lista de seguridad o advertencias

Para mostrar una sola tarjeta por fila con un fondo suave:

```html
<ul class="visual-list safety-list">
  <li>👶 Medida de seguridad.</li>
  <li>👀 Medida de supervisión.</li>
</ul>
```

Usa `warning-list` en advertencias y `safety-list` en recomendaciones de seguridad. No emplees colores nuevos ni recursos visuales alarmistas.

### Bloque de señales de consulta

Para agrupar criterios de consulta o señales importantes:

```html
<section class="warning-signs" aria-labelledby="warning-signs-title">
  <h3 id="warning-signs-title">Consulta si:</h3>
  <ul>
    <li>Primera señal explicada de forma clara.</li>
    <li>Segunda señal explicada de forma clara.</li>
  </ul>
  <p><strong>Mensaje clave breve.</strong></p>
</section>
```

El `id` debe ser único dentro del artículo y coincidir con `aria-labelledby`.

### Bloque final “Qué quiero que recuerdes”

Todos los artículos deben cerrar sus ideas principales con esta estructura:

```html
<section class="takeaways" aria-labelledby="takeaways-title">
  <h2 id="takeaways-title">🍊 Qué quiero que recuerdes</h2>
  <p>Resumen cercano de la idea principal.</p>
  <ul>
    <li>Primera idea práctica.</li>
    <li>Segunda idea práctica.</li>
  </ul>
  <p class="takeaways__final"><strong>Frase final importante.</strong></p>
</section>
```

Si encaja una última frase breve y cálida, puede utilizarse:

```html
<p class="takeaways__welcome"><strong>Frase final muy destacada. 😌</strong></p>
```

## Prompt base

Copia este bloque en la IA y sustituye `[CONTENIDO]` por el texto de Mar:

```text
Eres el asistente editorial de Mar Vall Requena, enfermera infantil de Pomelo Baby.
Convierte el contenido proporcionado en un artículo Markdown listo para guardar en src/content/blog/.

CONTENIDO Y VOZ:
- Mantén un tono cercano, cálido, claro y basado en evidencia.
- No alarmes, culpabilices, juzgues ni infantilices.
- Traduce los términos médicos a lenguaje cotidiano.
- Usa lenguaje inclusivo.
- Conserva la prudencia cuando la evidencia tenga limitaciones.
- Explica qué es, qué puede hacer la familia y cuándo consultar cuando corresponda.
- Usa frases y párrafos cortos.

ESTRUCTURA Y DISEÑO:
- No escribas un H1 dentro del contenido: se genera desde el frontmatter.
- Usa H2 para secciones y H3 para preguntas o subsecciones.
- Usa negrita solo para conceptos clave, nunca para párrafos enteros.
- Alterna citas Markdown y editorial-highlight para unas pocas frases importantes; no pongas todas en cajas.
- Usa visual-list para listas visuales, safety-list o warning-list para seguridad y warning-signs para señales de consulta.
- Termina con un bloque takeaways breve titulado “🍊 Qué quiero que recuerdes”.
- Limita el humor a 3 o 4 toques naturales y nunca bromees sobre situaciones graves.
- Resuelve una sola duda con información suficiente, sin convertir el artículo en un manual completo.
- No incluyas referencias a ebooks, guías, productos, compras ni promociones.
- Mantén el artículo escaneable desde móvil y evita bloques de texto densos.
- No incluyas CSS ni estilos inline.

FRONTMATTER:
- title: título claro y orientado a búsqueda.
- description: entradilla y descripción SEO de máximo 155 caracteres.
- pubDate: fecha real de publicación en formato YYYY-MM-DD.
- category: una categoría válida.
- tags: entre 3 y 5 palabras clave.
- draft: false.

CIERRE:
- Añade un disclaimer educativo adaptado al tema, en cursiva y separado por una línea horizontal.
- Indica con claridad cuándo se necesita valoración profesional.

Devuelve únicamente el archivo Markdown completo.
El nombre debe estar en minúsculas, sin tildes y con guiones.

CONTENIDO A TRANSFORMAR:
[CONTENIDO]
```

## Lista de comprobación antes de publicar

1. Revisar la exactitud sanitaria y que no falten matices relevantes.
2. Confirmar que la fecha es la fecha real de publicación, no una fecha provisional.
3. Comprobar que `description` funciona como entradilla y no supera 155 caracteres.
4. Revisar la jerarquía H2/H3 y que no haya un segundo H1.
5. Comprobar que la negrita es selectiva.
6. Verificar que los bloques HTML tienen etiquetas cerradas, IDs únicos y `aria-labelledby` correcto.
7. Confirmar que existe un bloque `takeaways` breve.
8. Eliminar información secundaria que convierta el artículo en un manual o diluya su duda principal.
9. Confirmar que no hay productos, compras ni promociones.
10. Ejecutar `npm run build`.
11. Hacer commit y push; Vercel desplegará automáticamente desde `main`.

## Categorías y borradores

- Si añades una categoría, actualiza `src/content.config.ts` y `src/pages/blog/index.astro`.
- Antes de eliminar una categoría, comprueba que ningún artículo la utiliza.
- Usa `draft: true` para conservar un artículo sin publicarlo.
