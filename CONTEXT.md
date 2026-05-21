# CONTEXT — pomelo.bby

Web de enfermería pediátrica de Mar Vall Requena. Dirigida a padres y madres que buscan información fiable y cercana sobre el cuidado de sus hijos.

---

## Glosario

### Post
Artículo del blog escrito en markdown, almacenado en `src/content/blog/`. Tiene un frontmatter con título, descripción, fecha, categoría, tags y estado de borrador. Un post con `draft: true` existe en el repo pero no se publica.

### Guía
Producto digital en formato PDF que se vende a precio fijo individual. No es un ebook extenso — es un documento práctico y visual sobre un tema concreto (alimentación, sueño, fiebre, etc.). Sinónimo de uso común: PDF.

### Consulta 1:1
Sesión de videollamada individual entre Mar y un cliente. Se reserva y paga en el momento de la reserva a través de Cal.com con cobro vía Stripe. Tiene duración y precio fijos.

### Lead magnet
Recurso gratuito (una Guía) que se entrega a cambio del email del visitante. Es el mecanismo principal de captación de suscriptores para la lista de email marketing.

### Suscriptor
Persona que ha dejado su email a través del lead magnet o de cualquier formulario de la web. Gestionado en Kit (ConvertKit).

### Draft
Post escrito y guardado en el repo pero no publicado. Se controla con el campo `draft: true` en el frontmatter. Permite preparar contenido sin publicarlo hasta estar listo.

### Categoría
Clasificación temática de un Post. Las categorías actuales son: `alimentacion`, `sueño`, `salud`, `desarrollo`, `crianza`. Se definen en `src/content.config.ts` y deben mantenerse sincronizadas con `src/pages/blog/index.astro`.

---

## Actores

### Mar
Mar Vall Requena. Enfermera infantil con especialidad en pediatría y neonatal. Autora de todo el contenido, titular del negocio y cara visible de pomelo.bby.

### Visitante
Persona que llega a la web sin haber comprado ni dejado su email. Objetivo: convertirlo en Suscriptor o Cliente.

### Suscriptor
Visitante que ha dejado su email. Recibe el lead magnet y entra en la secuencia de email marketing de Kit.

### Cliente
Persona que ha comprado una Guía o reservado una Consulta 1:1.
