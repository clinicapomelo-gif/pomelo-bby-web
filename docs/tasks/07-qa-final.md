# Tarea 07 — QA e integración final

## Objetivo

Revisar juntas todas las tareas anteriores antes de publicar, sin introducir rediseños ni funcionalidades nuevas.

## Dependencias

Ejecutar después de integrar las tareas terminadas. Las guías todavía “Próximamente” no bloquean la publicación, siempre que no puedan comprarse.

## Alcance de revisión

### Contenido

- Comparar Consultas, Inicio y Sobre mí con `docs/tasks/CONTENT.md`.
- Confirmar títulos, precios, duración y plazos.
- Revisar ortografía y lenguaje inclusivo según `AGENTS.md`.
- Comprobar que no queden textos provisionales visibles.

### Navegación y presentación

- Cabecera, logo, menú móvil y pie.
- Inicio, Sobre mí, Consultas, Tienda, Newsletter y páginas de gracias.
- Resoluciones móvil, tableta y escritorio.
- Estados hover, focus, carga y error.
- Ausencia de desbordes horizontales.

### Funcionalidad

- CTA y enlaces internos sin 404.
- Formulario del recurso gratuito.
- Validación de email y consentimiento.
- Checkout bloqueado para productos no disponibles.
- Flujos de Stripe y Cal.com configurados, si existen credenciales de test.
- Correos de Resend en entorno de prueba.

### Accesibilidad y SEO

- Un `h1` principal por página.
- Etiquetas, textos alternativos y navegación por teclado.
- Focus visible.
- Títulos y descripciones SEO coherentes.
- Logo accesible y favicon correcto si se proporcionó.

### Código y despliegue

- Revisar `git status` y eliminar solo artefactos creados por las tareas, nunca cambios ajenos.
- Buscar placeholders visibles o técnicos: `PLACEHOLDER`, emails de prueba, Price IDs ficticios y TODO críticos.
- No borrar `.bak` preexistentes sin autorización; solo informar de ellos.
- Ejecutar `npm run build`.
- Si es posible, probar el build con la configuración de preview de Vercel.

## Criterios de aceptación

- No hay enlaces rotos ni compras falsas disponibles.
- El contenido aprobado está completo.
- Los flujos configurados funcionan o quedan identificados claramente como bloqueados por una dependencia externa.
- La web es usable con teclado y en móvil.
- El build finaliza correctamente.
- La entrega incluye un informe breve de pruebas, incidencias y bloqueos pendientes.
