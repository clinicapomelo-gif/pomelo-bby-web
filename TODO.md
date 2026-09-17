# TODO — Pomelo Baby

Solo tareas pendientes. Si no está aquí, no bloquea.

## Estado actual

- La web y `pomelobaby.es` están publicados; `MAINTENANCE_MODE=false`.
- Guías, consultas y El Chisme siguen desactivados por código. No se aceptan cobros, reservas ni suscripciones públicas.
- Vercel Web Analytics está activo en Production.
- La propiedad `pomelobaby.es` está verificada en Google Search Console y su sitemap está enviado, pendiente de lectura por Google.

# 0. Pendiente tuyo tras la revisión de textos y UX

## Vercel y correo

- [ ] **[Rafael]** Comprobar en Vercel que `RESEND_TO_EMAIL` es `hola@pomelobaby.es` y `RESEND_CONSULTA_TO_EMAIL` es `mar@pomelobaby.es`.
- [ ] **[Rafael]** Actualizar el remitente en el `.env.local`: `perl -pi -e 's{^RESEND_FROM_EMAIL=.*$}{RESEND_FROM_EMAIL="Mar de Pomelo Baby <mar@pomelobaby.es>"}' .env.local` (en Production y Preview ya está cambiado).
- [ ] **[Mar]** Crear en Gmail un filtro por cada prefijo del asunto del formulario: `[Orientación]`, `[Colaboración]`, `[Compra]` y `[Otro]`.
- [ ] **[Mar]** Guardar en Instagram una respuesta rápida que derive las dudas de salud a `/consultas`.

## Decisiones de texto

- [ ] **[Mar]** Contacto: confirmar si es tuyo el usuario `@pomelo.baby` que aparecía en el texto; la web enlaza a `@pomelo.bby`.
- [ ] **[Mar]** Contacto: aprobar o reescribir los textos que no son suyos: título "Escríbeme", aviso del formulario, "¿Prefieres el email?", "Me encontrarás en Instagram:" y "Muy pronto podrás reservar…".
- [ ] **[Mar]** Portada: decidir si el bloque del blog debe decir "El blog de Pomelo" o "El blog de Pomelo Baby".
- [ ] **[Mar]** Chisme: decidir si el título lleva punto final ("El Chisme de Mar.").
- [ ] **[Mar]** Consultas: confirmar si "Necesito un plan" incluye videollamada y de cuántos minutos, para añadirla a su lista de "Incluye".

## Publicación

- [ ] **[Rafael]** Hacer commit y push de los cambios de textos y UX. Production está en `afa79ab` y aún no los tiene.
- [ ] **[Dev]** Decidir si se arregla la pantalla de error del formulario de contacto: hoy, si falla el envío, se muestra un JSON en vez de un mensaje.

# 1. Antes de aceptar cobros o consultas reales

## Empresa, legal y fiscalidad

- [ ] **[Empresa + asesoría]** Facilitar denominación registral, CIF, domicilio y datos del Registro Mercantil.
- [ ] **[Asesoría]** Confirmar que Piel de Pomelo SLP contrata y factura guías y consultas.
- [ ] **[Gestoría]** Confirmar IVA, facturación y que todos los precios publicados son finales.
- [ ] **[Profesional legal]** Revisar Privacidad, Cookies y Aviso legal, y completar las Condiciones de venta.
- [ ] **[Mar + profesional legal]** Aprobar el aviso sanitario del footer y definir cancelaciones, reprogramaciones, ausencias, devoluciones y desistimiento.

## Autorización sanitaria y seguro

- [ ] **[Empresa]** Localizar la autorización sanitaria de la clínica y comprobar titular, dirección, número registral y oferta **U.2 Enfermería**.
- [ ] **[Empresa]** Obtener confirmación escrita de que la U.2 cubre videollamada, formulario, correo y seguimiento infantil.
- [ ] **[Empresa]** Obtener confirmación escrita de que el seguro cubre a la sociedad, a Mar, a menores y la atención remota.
- [ ] **[Dev]** Publicar los datos sanitarios verificados cuando exista la documentación.

## Privacidad sanitaria

- [ ] **[Mar + profesional legal]** Definir qué documentación clínica se conserva, durante cuánto tiempo y quién puede acceder.
- [ ] **[Mar + Dev]** Elegir y validar un canal seguro para fotografías o vídeos; no usar Instagram.
- [ ] **[Rafael + Mar]** Restringir el buzón sanitario, activar MFA y acordar conservación y borrado.

# 2. Dominio, correo y Resend

- [ ] **[Mar]** Crear o confirmar el correo profesional.
- [ ] **[Mar]** Completar la verificación del dominio en Resend y personalizar la página de baja.
- [ ] **[Dev]** Cuando el dominio esté verificado en Resend, confirmar en Production el Segment ID, Topic ID y remitentes definitivos de Resend.
- [ ] **[Mar + Dev]** Probar Contacto, El Chisme y correos transaccionales con dominio propio en Gmail, Outlook y móvil.
- [ ] **[Dev]** Comprobar que Google puede leer el sitemap enviado y que descubre sus URLs; si el error persiste más de 48 horas, investigar la respuesta pública del dominio antes de reenviarlo.
- [ ] **[Mar + Dev]** Revisar en Search Console la indexación de Inicio, Blog, Guías, Consultas y Sobre mí cuando Google haya procesado el sitemap; solicitar indexación solo de las páginas principales o de nuevo contenido relevante.
- [ ] **[Mar + Dev]** Revisar mensualmente en Search Console las consultas, impresiones, clics, cobertura e incidencias para orientar el blog y detectar problemas de indexación.

# 3. Activar consultas

## Cal.com

- [ ] **[Mar]** Conectar el calendario personal y revisar disponibilidad, límites y margen de 15 minutos.
- [ ] **[Mar]** Conectar Cal.com con el Stripe definitivo y activar el pago obligatorio.
- [ ] **[Mar + Dev]** Probar reserva, pago, Google Meet, cancelación, reprogramación y correos de ambas consultas.

## Cuéntame por correo

- [ ] **[Mar]** Crear el producto y Price Live de 19 €.
- [ ] **[Dev]** Guardar el caso de forma duradera antes de enviarlo por Resend y permitir reintentos seguros.
- [ ] **[Dev]** Configurar el Price ID en Production después de implementar la persistencia.
- [ ] **[Mar + Dev]** Hacer una compra test completa y una compra real controlada antes de abrir el servicio.

# 4. Activar guías de pago

- [ ] **[Mar + gestoría]** Confirmar los precios finales, impuestos y facturación de las cinco guías de pago.
- [ ] **[Mar]** Confirmar si el enlace de descarga seguirá disponible durante 30 días.
- [ ] **[Dev]** Rotar cualquier credencial Stripe compartida fuera del gestor de secretos y conservar `STRIPE_CATALOG_KEY` solo en Vercel Development.
- [ ] **[Dev]** Configurar `STRIPE_WEBHOOK_SECRET` del Sandbox correcto en Preview.
- [ ] **[Dev]** Habilitar temporalmente el checkout en Preview y comprobar que Production continúa rechazando credenciales test.
- [ ] **[Mar + Dev]** Probar las cinco guías de extremo a extremo: pago test, email único, reintento del webhook, PDF correcto, página de gracias, caducidad y errores seguros.
- [ ] **[Mar]** Crear los Products y Prices de Stripe Live cuando legal y fiscalidad estén cerrados.
- [ ] **[Dev]** Añadir al catálogo los mapeos `stripe.live` sin reutilizar IDs del Sandbox.
- [ ] **[Mar + Dev]** Hacer una compra real controlada de cada guía y verificar correo y descarga antes de abrir ventas.
- [ ] **[Dev]** Activar `GUIDES_ENABLED` únicamente cuando los cinco flujos estén verificados y Production tenga su configuración Live definitiva.

# 5. Preparar El Chisme

- [ ] **[Mar]** Redactar tres ediciones y el primer artículo relacionado.
- [ ] **[Mar]** Crear y probar el primer Broadcast con Topic y enlace de baja.
- [ ] **[Mar + Dev]** Probar alta nueva, alta existente, baja, reutilización del enlace y nueva alta consentida.
- [ ] **[Dev]** Limpiar contactos de prueba de Resend antes del primer envío.

# 6. Desarrollo y QA final

- [ ] **[Dev]** Configurar en Vercel una regla de rate limiting para los formularios públicos, empezando en modo observación antes de bloquear solicitudes.
- [ ] **[Profesional legal + Dev]** Aplicar las primeras capas de privacidad y los controles aprobados a todos los formularios.
- [ ] **[Dev]** Auditar Vercel Analytics, Cal.com, cookies y almacenamiento local; pedir consentimiento solo cuando corresponda.
- [ ] **[Mar + Dev]** Revisar mensualmente en Vercel Web Analytics las páginas más visitadas y fuentes de tráfico. No añadir Google Analytics mientras Vercel Analytics cubra las métricas necesarias y no se apruebe un cambio de privacidad.
- [ ] **[Mar + Dev]** Añadir autoría enlazada, fecha visible de publicación o revisión y fuentes a los contenidos sanitarios.
- [ ] **[Dev]** Separar completamente las credenciales Live de Preview y comprobar OIDC de Blob.
- [ ] **[Dev]** Ejecutar con Node 24 el build y la revisión final de móvil, escritorio, teclado, foco, errores, enlaces, 404, CSP, SEO, sitemap y robots.
- [ ] **[Mar + Dev]** Probar en Production todos los formularios y servicios que vayan a quedar visibles.
- [ ] **[Dev]** Limpiar cambios locales, worktrees, ramas, imágenes, whitespace, URLs provisionales y placeholders sin perder cambios ajenos.

# Más adelante — no bloquea el lanzamiento

- [ ] **[Mar]** Terminar el Manual de supervivencia al primer año y entregar PDF, páginas y tres beneficios definitivos.
- [ ] **[Dev]** Provisionar el Manual en Blob y Stripe test, probar su compra y sustituir `coming-soon` por `available` cuando esté aprobado.
- [ ] **[Mar]** Decidir cuándo activar la descarga gratuita de Conservación de la leche materna.

## Documentación operativa

- [Configuración de Cal.com](docs/configuracion-cal-com.md)
- [Configuración de Resend](docs/configuracion-resend.md)
- [Correo profesional](docs/configuracion-correo-profesional.md)
- [Doble opt-in](docs/arquitectura-doble-opt-in.md)
- [El Chisme](docs/estrategia-blog-y-el-chisme.md)
- [Guías de pago](docs/guias-de-pago.md)
- [Canales para archivos sanitarios](docs/canales-archivos-consultas.md)
