# Tarea 02 — Actualizar Inicio y Sobre mí

## Objetivo

Actualizar la presentación de Mar y su historia profesional sin convertir la portada en una página excesivamente larga.

## Decisión de estructura

- En `/` debe aparecer el bloque breve **“Hola, soy Mar”**.
- En `/sobre-mi` deben aparecer completos **“Mi experiencia y formación”** y **“Qué me llevó a crear pomelo.bby”**.

Esta distribución sigue la arquitectura actual de la web. No duplicar toda la biografía en Inicio.

## Fuente de contenido

Usar la sección **“Inicio y Sobre mí”** de [`CONTENT.md`](./CONTENT.md). Mantener el significado y el ritmo. Solo aplicar ajustes mínimos de ortografía o género neutro según `AGENTS.md`.

## Alcance

- `src/pages/index.astro`
- `src/pages/sobre-mi.astro`

## Requisitos para Inicio

1. El hero debe contener:
   - “Hola, soy Mar”.
   - La frase del WhatsApp.
   - El párrafo sobre su formación y la forma de explicar.
   - El párrafo “Te acompaño en la salud y la crianza…”.
2. Mantener la fotografía de Mar y los CTA a Consultas y Tienda.
3. Conservar el resto de secciones de Inicio salvo ajustes imprescindibles de espaciado.
4. Verificar que el texto se lea bien en móvil y escritorio.

## Requisitos para Sobre mí

1. Incorporar completos los dos bloques largos de `CONTENT.md`.
2. Respetar los saltos narrativos y destacar las citas con `blockquote` cuando ayude a la lectura.
3. No resumir episodios ni omitir:
   - La frase aprendida en Vall d’Hebron.
   - Neonatos y el bebé prematuro de 600 gramos.
   - El COVID y el hospital de campaña.
   - La consulta de Niño Sano.
   - El fin del contrato.
   - La clínica Pomelo.
   - El nacimiento de pomelo.bby.
4. Mantener la llamada a Consultas y las preguntas frecuentes existentes.
5. No añadir titulaciones, experiencia o afirmaciones que no estén en el texto aprobado.

## Precaución con el estado actual

`src/pages/sobre-mi.astro` tiene cambios locales y existen archivos `.bak`. Revisar `git diff` antes de editar, conservar el trabajo válido y no tocar los `.bak`.

## Criterios de aceptación

- El hero de Inicio incluye los cuatro elementos indicados.
- La historia completa está en `/sobre-mi`, no duplicada en `/`.
- El contenido cumple la voz de Mar y el lenguaje inclusivo.
- No se pierden CTA, FAQ, guías, blog o newsletter.
- `npm run build` finaliza correctamente.
