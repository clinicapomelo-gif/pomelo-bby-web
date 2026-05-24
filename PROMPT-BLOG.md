# Prompt para generar posts del blog de pomelo.bby

Usa este prompt en ChatGPT, Claude o cualquier IA que soporte texto e imágenes.

---

## Categorías disponibles

Actualiza esta lista si añades o eliminas categorías en `src/content.config.ts`:

- `alimentacion`
- `sueño`
- `salud`
- `desarrollo`
- `crianza`

---

## Prompt base

Copia y pega esto en la IA, sustituyendo `[CONTENIDO]` por el texto o imagen:

```
Eres el asistente de Mar Vall Requena, enfermera pediátrica de pomelo.bby.
Convierte el siguiente contenido en un post de blog en markdown.

REQUISITOS DE CONTENIDO:
- Tono cercano, sin alarmismos, dirigido a padres y madres
- Estructura clara con H2 para secciones principales y H3 para subsecciones
- Párrafos cortos, máximo 3-4 líneas
- Usa listas cuando sea útil para facilitar la lectura
- Incluye una sección "## Preguntas frecuentes" al final con 2-3 preguntas reales que se hacen los padres
- Termina siempre con este párrafo en cursiva:
  *Este artículo es orientativo y educativo. No sustituye una valoración presencial. Ante cualquier duda sobre la salud de tu hijo o hija, consulta con un profesional sanitario.*

REQUISITOS DEL FRONTMATTER:
Genera el bloque frontmatter con estos campos exactos:
- title: título claro y descriptivo, orientado a búsqueda (ej: "Fiebre en bebés: cuándo preocuparse")
- description: resumen de máximo 155 caracteres para SEO
- pubDate: fecha de hoy en formato YYYY-MM-DD
- category: elige UNA de las categorías disponibles (ver arriba)
- tags: array de 3-5 palabras clave relacionadas
- draft: false

FORMATO DE SALIDA:
Devuelve únicamente el archivo markdown completo, listo para guardar en src/content/blog/.
El nombre del archivo debe ser en minúsculas, sin tildes, con guiones en lugar de espacios.
Ejemplo: fiebre-bebes-cuando-preocuparse.md

CONTENIDO A TRANSFORMAR:
[PEGA AQUÍ EL TEXTO O ADJUNTA LA IMAGEN]
```

---

## Cómo publicar el post

1. Guarda el archivo `.md` generado en `src/content/blog/`
2. Revisa que el frontmatter sea correcto (categoría válida, fecha bien formateada)
3. Haz commit y push al repositorio
4. Vercel desplegará automáticamente

---

## Notas importantes

- **NUNCA usar "pediatra" ni "tu pediatra"** en los artículos. Usar siempre "profesional sanitario", "centro de salud" o "valoración presencial". Mar es enfermera pediátrica — referir al pediatra socava su autoridad profesional.
- Si añades una nueva categoría, actualízala también en `src/content.config.ts` (en el enum de `category`) y en `src/pages/blog/index.astro` (en los arrays `categories` y `categoryLabels`)
- Si eliminas una categoría, asegúrate de que no haya posts existentes con esa categoría antes de borrarla del enum
- El campo `draft: true` permite guardar un post sin que se publique hasta que lo cambies a `false`
