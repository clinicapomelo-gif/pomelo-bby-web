# TODO — Pomelo Baby

Solo tareas pendientes. Si no está aquí, no bloquea.

## Estado actual

- La web y `pomelobaby.es` están publicados; `MAINTENANCE_MODE=false`.
- Stripe sigue en Sandbox. No se aceptan cobros reales y `GUIDES_ENABLED=false` mantiene desactivadas las compras de guías.
- El catálogo contiene siete guías: cinco `available`, una gratuita con descarga desactivada y el Manual del primer año como `coming-soon`; las seis guías terminadas se muestran como «Próximamente» mientras `GUIDES_ENABLED=false`.
- Las cinco guías de pago actuales tienen PDF privado y Price test: Primeros cuidados (5,90 €), Alimentación complementaria (14,90 €), Conservación de alimentos (4,90 €), Atragantamiento (6,90 €) y Sueño infantil (14,90 €).
- Manual de supervivencia al primer año está anunciado a 19,90 €, pero todavía no tiene PDF, páginas ni beneficios definitivos.
- El doble opt-in de El Chisme funciona en Preview.
- Cuéntame por correo funciona en test, pero Live está bloqueado hasta guardar los casos de forma duradera.

## Integrar la revisión actual

- [ ] **[Dev]** Confirmar que los PDF de trabajo permanecen fuera de Git; solo se versionan sus `blobKey`.
- [ ] **[Dev]** Hacer commit, push y PR de la revisión del catálogo, los precios, las versiones de PDF y el soporte de `coming-soon`.
- [ ] **[Mar + Dev]** Revisar en Preview las siete fichas, sus títulos, descripciones, precios, categorías y estados.

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
- [ ] **[Dev]** Redirigir `www.pomelobaby.es` y `pomelo-bby-web.vercel.app` a `https://pomelobaby.es`.
- [ ] **[Mar]** Completar la verificación del dominio en Resend y personalizar la página de baja.
- [ ] **[Dev]** Configurar en Production el Segment ID, Topic ID y remitentes definitivos de Resend.
- [ ] **[Mar + Dev]** Probar Contacto, El Chisme y correos transaccionales con dominio propio en Gmail, Outlook y móvil.
- [ ] **[Dev]** Verificar Google Search Console y enviar `https://pomelobaby.es/sitemap-index.xml`.

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
- [x] **[Dev]** Alimentación complementaria, Conservación de alimentos y Sueño infantil pasaron de `testing` a `available` después de superar sus compras de prueba.
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

- [ ] **[Dev]** Añadir protección proporcionada contra abuso en los formularios públicos.
- [ ] **[Profesional legal + Dev]** Aplicar las primeras capas de privacidad y los controles aprobados a todos los formularios.
- [ ] **[Dev]** Auditar Vercel Analytics, Cal.com, cookies y almacenamiento local; pedir consentimiento solo cuando corresponda.
- [ ] **[Mar + Dev]** Añadir autoría enlazada, fecha visible de publicación o revisión y fuentes a los contenidos sanitarios.
- [ ] **[Dev]** Mejorar los títulos SEO de Inicio, Blog y Consultas.
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
