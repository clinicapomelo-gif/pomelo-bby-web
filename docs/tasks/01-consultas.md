# Tarea 01 — Actualizar la página de Consultas

## Objetivo

Dejar `/consultas` con los tres servicios, precios, ejemplos e inclusiones definidos por Mar.

## Fuente de contenido

Usar la sección **“Consultas”** de [`CONTENT.md`](./CONTENT.md). No resumir ni eliminar ejemplos. Se permiten únicamente ajustes mínimos de género neutro exigidos por `AGENTS.md`.

## Alcance

- `src/pages/consultas.astro`
- Solo si es necesario para mantener el flujo actual: textos visibles de `src/pages/consulta-mensaje/*.astro`
- No cambiar en esta tarea la arquitectura de pagos, Cal.com, Resend o subida de archivos.

## Requisitos

1. Mostrar estos servicios en este orden:
   - ✉️ Cuéntame por correo — 19 €
   - 🎥 Duda concreta — 49 €
   - ❤️ Hablemos tranquilamente — 89 €
2. Incluir todo el contenido aprobado: introducción, ejemplos, qué incluye y cierre.
3. En “Hablemos tranquilamente” deben aparecer también los casos de prematuridad, varias dificultades simultáneas y el ejemplo largo sobre agotamiento. Actualmente están incompletos.
4. Mantener claramente visible que “Duda concreta” dura unos 20 minutos y que “Cuéntame por correo” se responde en 24-48 horas laborables.
5. No presentar “Más popular” como sustituto del nombre del servicio. Si se conserva como etiqueta comercial, el título y el icono ❤️ deben seguir siendo inequívocos.
6. Mantener los CTA existentes y no romper los atributos usados por Stripe o Cal.com.
7. Revisar legibilidad en móvil: títulos, precios, listas y botones no deben desbordarse.
8. No inventar advertencias médicas ni cambiar precios.

## Fuera de alcance

- Crear productos en Stripe.
- Configurar eventos reales de Cal.com.
- Implementar adjuntos.
- Cambiar el catálogo de la tienda.

## Criterios de aceptación

- Los tres servicios contienen todo el texto de `CONTENT.md`.
- Los precios son 19 €, 49 € y 89 €.
- No falta ningún punto de las listas “Ideal para” o “Incluye”.
- Los botones existentes siguen conservando sus enlaces o identificadores funcionales.
- `npm run build` finaliza correctamente.
