# TODO — lanzamiento de pomelo.bby

Lista operativa resumida. Los procedimientos detallados están en:

- [`docs/configuracion-cal-com.md`](docs/configuracion-cal-com.md)
- [`docs/configuracion-resend.md`](docs/configuracion-resend.md)
- [`docs/configuracion-correo-profesional.md`](docs/configuracion-correo-profesional.md)
- [`docs/arquitectura-doble-opt-in.md`](docs/arquitectura-doble-opt-in.md)
- [`docs/estrategia-blog-y-el-chisme.md`](docs/estrategia-blog-y-el-chisme.md)
- [`docs/guias-de-pago.md`](docs/guias-de-pago.md)

## Decisiones cerradas

- Consultas: **Cuéntame por correo — 19 €**, **Duda concreta — 49 €** y **Hablemos tranquilamente — 89 €**.
- Los enlaces actuales de Cal.com son correctos: `pomelo-bby/consulta-express` y `pomelo-bby/consulta-personalizada`.
- El nombre es obligatorio en los formularios de la guía gratuita y El Chisme para personalizar los correos.
- Resend gestionará correo transaccional y marketing. El doble opt-in usará un token cifrado sin Supabase; Supabase se reserva para necesidades persistentes reales.
- Los PDF se alojarán en el Vercel Blob privado conectado al proyecto: la guía gratuita se servirá mediante una URL estable de la web y las guías de pago tras verificar la compra.
- Las cinco guías de pago seguirán como “Próximamente” hasta que cada PDF, cobro y entrega estén probados.
- El enlace de una guía de pago caduca actualmente 30 días después de la compra. El PDF descargado no caduca.

## Estado comprobado

- El catálogo, el lead magnet, las consultas y la infraestructura de entrega de guías están integrados en `main`.
- El PDF del lead magnet ya está en el Vercel Blob privado; las cinco guías de pago todavía no tienen PDF definitivo configurado.
- El doble opt-in está probado en Preview de extremo a extremo: solicitud, email, página sin efectos, confirmación, alta en Resend y descarga. Falta probar baja, reutilización del enlace y nueva alta.
- El flujo sandbox de Cuéntame por correo funciona de extremo a extremo por 19 €: Stripe vuelve al formulario pagado y Resend entrega el caso.
- La prueba con `resend.dev` llegó a spam, algo esperable por usar un remitente compartido y un enlace de localhost. La entregabilidad real sigue pendiente del dominio verificado y enlaces HTTPS públicos.
- `pomelobaby.es` está añadido a Vercel y Production muestra una página de mantenimiento; la web completa sigue disponible en una Preview protegida.
- El dominio todavía no resuelve desde la comprobación externa; falta validar propagación DNS, HTTPS y la variante `www`.
- `MAINTENANCE_MODE` oculta toda la interfaz en Production, bloquea `/api/*` con HTTP 503 y publica `robots.txt` con `Disallow: /`.
- Los formularios están visibles en Preview, pero sin la configuración externa completa deben considerarse en preparación.
- El build termina correctamente. En local se usa Node 26 y Vercel avisa de que ejecutará las funciones con Node 24.
- Los worktrees `task-03`, `task-04`, `task-05`, `task-07` y `task-08` están limpios y sus commits están integrados. La tarea 06 se integró en los commits `c1fd7f6` y `71f7353`. La rama de la tarea 01 no es ancestro de `main`, pero Git confirma que su parche ya está aplicado.

---

# 1. Antes de publicar la web

- [x] **[Mar]** Comprar el dominio definitivo: `pomelobaby.es`.
- [ ] **[Mar]** Crear o confirmar el correo profesional.
- [x] **[Dev]** Añadir el dominio a Vercel y unificar `SITE_URL`, Astro, sitemap, robots, enlaces canónicos y Open Graph.
- [ ] **[Dev]** Validar propagación DNS, certificado HTTPS y redirección entre `www` y el dominio principal.
- [x] **[Dev]** Bloquear también las rutas `/api/*` en Production mientras `MAINTENANCE_MODE` esté activo.
- [ ] **[Mar + profesional legal]** Completar Aviso legal, Privacidad, Cookies y Condiciones de venta, incluyendo formularios, newsletter, consultas, datos de salud, pagos y proveedores externos.
- [ ] **[Mar + profesional legal]** Definir el aviso ante urgencias y dejar claro que la web y el correo no sustituyen la atención sanitaria urgente.
- [ ] **[Dev]** Añadir la información resumida de privacidad junto a Contacto y Consultas y aplicar las decisiones legales al lead magnet y newsletter.
- [ ] **[Dev]** Revisar Google Fonts, Vercel Analytics y la carga de Cal.com para decidir si requieren cambios o consentimiento.
- [ ] **[Dev]** Añadir protección proporcionada contra abuso en los formularios públicos y revisar que los errores y logs no expongan información interna ni datos personales.
- [ ] **[Mar + Dev]** Decidir si lead magnet, newsletter y consultas se ocultan hasta estar configurados o si todo se activa en un único lanzamiento.

## Revisión legal, sanitaria y de contratación

La revisión se ha contrastado con el artículo 10 de la LSSI, la Ley 44/2003 de ordenación de las profesiones sanitarias, el Real Decreto 1277/2003 y la normativa valenciana de autorización de centros y servicios sanitarios. El Aviso legal no sustituye la autorización, el seguro, la privacidad ni las condiciones de contratación.

### Cambios integrados en `main` desde `feat/home-conversion`

- [x] **[Dev]** Integrar la rama `feat/home-conversion` conservando los cambios locales previos de `main`.
- [x] Identificar a **Piel de Pomelo SLP** como titular y a Mar Vall Requena como responsable profesional de los contenidos sanitarios.
- [x] Separar claramente los contenidos educativos de las consultas individualizadas de enfermería y aclarar que no son consultas médicas de pediatría, diagnósticos médicos ni un servicio de urgencias.
- [x] Añadir al footer el aviso sanitario, los enlaces legales y la razón social.
- [x] Evitar que el componente de SEO presente a Mar como “enfermera pediátrica” mientras no se confirme que posee el título oficial de especialista; usar simplemente “Enfermera”.
- [x] Mantener la reserva de Cal.com dentro de un popup para no sacar a la familia de la web. La carga del tercero queda pendiente de la auditoría de cookies indicada más abajo.
- [x] Quitar la indicación de enviar datos de salud o imágenes por Instagram.
- [x] Excluir de indexación las páginas transaccionales y eliminar los parámetros de sesión de las URLs canónicas por defecto.

### Datos obligatorios que faltan para completar el Aviso legal

- [x] Confirmar la titularidad: **Piel de Pomelo SLP**.
- [ ] **[Empresa + asesoría]** Facilitar la denominación registral exacta, CIF, domicilio social o profesional y datos completos del Registro Mercantil listos para publicar.
- [ ] **[Mar]** Confirmar el nombre completo del Colegio Oficial de Enfermería al que pertenece y que el número de colegiación **16700** es el que debe publicarse.
- [ ] **[Mar]** Confirmar el título académico oficial exacto, el Estado de expedición y si posee o no el título oficial de Especialista en Enfermería Pediátrica. Hasta entonces no mostrar “especialista” ni usar “Enfermera Pediátrica” como título profesional.
- [ ] **[Asesoría]** Confirmar si Piel de Pomelo SLP contrata y factura tanto las guías como las consultas y que ambas actividades están incluidas en su objeto social profesional.
- [ ] **[Gestoría]** Confirmar que todos los precios visibles son finales y cómo debe informarse de impuestos o exenciones en consultas y contenido digital.

### Autorización sanitaria en la Comunitat Valenciana

La normativa no establece una exención clara para la teleconsulta. La opción prudente es prestar el servicio desde la clínica ya autorizada y comprobar que su oferta asistencial incluye **U.2 Enfermería**.

- [ ] **[Empresa]** Localizar la resolución o certificado sanitario vigente de la clínica.
- [ ] **[Empresa]** Comprobar en ese documento: titular exacto, dirección autorizada, tipo de centro, oferta asistencial **U.2 Enfermería** y número del Registro Autonómico de Centros, Servicios y Establecimientos Sanitarios.
- [ ] **[Empresa]** Confirmar que la titular de la autorización es Piel de Pomelo SLP. No usar en la web una autorización perteneciente a otra sociedad, profesional o dirección.
- [ ] **[Empresa]** Pedir confirmación escrita a la Dirección Territorial de Sanidad de que la atención infantil por videollamada, formulario y correo queda cubierta por la U.2 existente.
- [ ] **[Empresa]** Si no consta U.2 Enfermería o cambia la oferta autorizada, tramitar la modificación antes de abrir las consultas: <https://sede.gva.es/es/detall-tramit?id_proc=21330>.
- [ ] **[Dev]** Cuando esté verificado, publicar en Aviso legal y en la promoción de consultas el número registral y los datos de la autorización y del órgano supervisor que correspondan.

### Seguro de responsabilidad

No se contratará otra póliza sin revisar antes el seguro existente de la clínica. El seguro y la autorización sanitaria son comprobaciones distintas.

- [ ] **[Empresa]** Solicitar a la aseguradora —no solo una confirmación verbal— que indique por escrito que la póliza cubre a **Piel de Pomelo SLP** y a **Mar Vall Requena**.
- [ ] **[Empresa]** Confirmar que incluye consultas individualizadas de enfermería a menores mediante videollamada, formulario, correo y seguimiento remoto, además de la responsabilidad de la sociedad y de la profesional.
- [ ] **[Empresa]** Confirmar ámbito territorial, límites, franquicia, defensa jurídica, fecha retroactiva y posibles exclusiones por teleasistencia, menores o actividad fuera del local.
- [ ] **[Empresa]** Si la póliza no lo recoge con claridad, pedir un suplemento o certificado específico antes de abrir el servicio. El número de póliza no tiene que publicarse en la web.

### Privacidad, datos de salud y contratación

- [ ] **[Profesional legal + Dev]** Sustituir los placeholders públicos de Privacidad, Cookies y Condiciones de compra por textos definitivos antes del lanzamiento.
- [ ] **[Profesional legal]** Definir responsable, finalidades, bases jurídicas, datos de salud de menores, representación de madres/padres/tutores, proveedores, transferencias, conservación y derechos.
- [ ] **[Mar + profesional legal]** Determinar cuándo una consulta genera atención y documentación clínica, qué consentimiento e información asistencial necesita y durante cuánto tiempo debe conservarse.
- [ ] **[Mar + Dev]** Elegir un canal aprobado para solicitar fotografías o vídeos. No usar Instagram para datos sanitarios y no prometer envíos por correo sin validar antes seguridad, conservación y acceso.
- [ ] **[Dev]** Añadir la primera capa de privacidad y los controles aprobados al formulario de consulta pagada y al formulario general de Contacto.
- [ ] **[Profesional legal + Dev]** Completar condiciones distintas para consultas y PDF: identidad de quien contrata, alcance, precio final, pago, entrega, cancelación, reprogramación, ausencia, reembolso y desistimiento del contenido digital.
- [ ] **[Dev]** Auditar en producción Vercel Analytics, Cal.com y cualquier almacenamiento local o cookie; bloquear hasta consentimiento solo aquello que legalmente lo requiera.
- [ ] **[Mar]** Añadir autoría, fecha de publicación o revisión y fuentes a los contenidos sanitarios para poder sostener la afirmación “basado en evidencia”.

### No mostrar como verificado hasta disponer de documentación

- No afirmar que el servicio o la clínica están autorizados sin comprobar resolución, titular, dirección, U.2 y número registral.
- No afirmar que el seguro cubre teleconsultas o menores sin confirmación escrita de la aseguradora.
- No presentar a Mar como pediatra ni como especialista en Enfermería Pediátrica sin el título oficial correspondiente.
- No presentar Privacidad, Cookies o Condiciones de compra como completas mientras sigan siendo placeholders.
- No afirmar que todos los contenidos están “actualizados” sin una fecha de revisión y fuentes trazables.

---

# 2. Resend, newsletter y guía gratuita

La configuración detallada está en [`docs/configuracion-resend.md`](docs/configuracion-resend.md).

## Pendiente de Mar

- [x] Comprar el dominio `pomelobaby.es`.
- [ ] Verificar en Resend el dominio o subdominio remitente con SPF y DKIM; añadir DMARC cuando corresponda.
- [x] Crear el Segmento “El Chisme de Mar”.
- [x] Crear el Topic público “El Chisme de Mar” con alta predeterminada desactivada y suscripción explícita desde el formulario.
- [x] Crear las propiedades `signup_source`, `consent_version` y `consented_at`.
- [ ] Personalizar la página de baja de Resend.
- [x] Implementar el doble opt-in con token cifrado: solo crear el Contacto y activar el Topic después de pulsar el botón de confirmación.
- [x] Revisar y aprobar como definitivo el PDF de “25 cosas normales en los bebés”, ya alojado en Vercel Blob privado.
- [ ] Preparar tres ediciones de El Chisme y el primer artículo relacionado antes de abrir la captación.
- [ ] Crear y probar el primer Broadcast con el Topic y el enlace de baja de Resend.

## Pendiente de desarrollo

- [x] Configurar `NEWSLETTER_CONFIRMATION_SECRET` en Production.
- [ ] Configurar `RESEND_NEWSLETTER_SEGMENT_ID` y `RESEND_NEWSLETTER_TOPIC_ID` en Production; Preview ya está configurado.
- [ ] Configurar `RESEND_FROM_EMAIL` y `RESEND_TO_EMAIL` cuando exista dominio y buzón.
- [ ] Probar alta nueva, alta existente, baja y nueva suscripción consentida.
- [ ] Limpiar de Resend los contactos de prueba y cualquier dirección incorrecta antes del primer Broadcast.
- [x] Enviar confirmación a la familia cuando se reciba correctamente una consulta por correo.
- [ ] Tras verificar el dominio, repetir Contacto, lead magnet y correos transaccionales con remitente propio y enlaces HTTPS en Gmail, Outlook y móvil, incluyendo spam y promociones.

---

# 3. Activar las consultas

## Cal.com — Duda concreta y Hablemos tranquilamente

- [ ] **[Mar]** Conectar a Cal.com la cuenta de Stripe definitiva de pomelo.bby.
- [ ] **[Mar]** Cambiar los nombres públicos a “Duda concreta” y “Hablemos tranquilamente” y configurar **49 €** y **89 €** en EUR.
- [ ] **[Mar]** Confirmar si Hablemos tranquilamente mantiene los 40 minutos actuales o necesita otra duración.
- [ ] **[Mar]** Configurar disponibilidad, calendarios de conflictos, márgenes, preaviso y límites de reservas.
- [ ] **[Mar]** Añadir como preguntas obligatorias la edad del niño o niña y la preocupación principal.
- [ ] **[Mar]** Definir cancelaciones, reprogramaciones, ausencias y el seguimiento de 14 días.
- [ ] **[Mar + Dev]** Probar reserva, pago, Google Meet, cancelación, reprogramación y correos de ambos eventos.

## Cuéntame por correo — 19 €

- [ ] **[Mar]** Crear en la cuenta definitiva de Stripe el producto y Price de 19 €.
- [ ] **[Dev]** Configurar `STRIPE_CONSULTA_MENSAJE_PRICE_ID` en producción; en test ya está verificado el cobro de 19 €.
- [x] **[Dev]** Impedir duplicados con metadata de Stripe e idempotencia de Resend.
- [ ] **[Dev]** Evitar perder el caso si Resend falla después del pago y devolver siempre errores genéricos.
- [ ] **[Mar + Dev]** Definir un flujo privado para solicitar fotografías o vídeos después del primer correo, sin implementar todavía una subida de archivos.
- [ ] **[Mar + Dev]** Hacer una compra completa de prueba y otra real controlada antes de abrir el servicio.

---

# 4. Stripe, fiscalidad y cobros reales

Stripe puede seguir en sandbox durante el desarrollo. Antes de aceptar pagos reales:

- [ ] **[Mar]** Crear o confirmar una cuenta de Stripe propiedad de Mar o de la empresa de pomelo.bby, completar la verificación y conectar la cuenta bancaria.
- [ ] **[Mar + gestoría]** Confirmar IVA, facturación, datos necesarios del comprador y quién emite las facturas. Esto no implica necesariamente contratar Stripe Tax.
- [ ] **[Mar + profesional legal]** Confirmar condiciones de cancelación, devolución y desistimiento para consultas y productos digitales.
- [ ] **[Mar]** Proteger Stripe, Resend, Cal.com, Supabase y Vercel con 2FA.
- [ ] **[Dev]** Cambiar a claves y Price ID live solo después de superar todas las pruebas en sandbox.

---

# 5. Primera guía de pago — no bloquea la web inicial

- [ ] **[Mar]** Elegir la primera guía y crear contenido, fuente editable, bibliografía, PDF, portada y descripción final.
- [ ] **[Mar]** Confirmar si se mantienen los 30 días actuales de acceso al enlace de descarga.
- [ ] **[Mar + Dev]** Crear el producto y Price en Stripe test, subir el PDF a Vercel Blob privado y configurar sus referencias en `src/data/guias.ts`.
- [ ] **[Dev]** Configurar webhook, Resend y Blob en Preview y Production.
- [ ] **[Mar + Dev]** Probar pago, un único email, reintento del webhook, descarga, caducidad y soporte.
- [ ] **[Dev]** Cambiar la guía a `available` solo después de una compra real controlada.

Las otras cuatro guías repetirán este proceso cuando sus contenidos estén terminados.

---

# 6. Limpieza y QA final

- [ ] **[Dev]** Revisar y separar los cambios locales actuales de `AGENTS.md`, Inicio, Tienda, `docs/` e `images/`.
- [ ] **[Dev]** Eliminar los worktrees y ramas de tareas ya integradas después de una última comprobación.
- [ ] **[Mar + Dev]** Decidir qué materiales originales de `images/` se conservan fuera de Git y cuáles se versionan optimizados en `public/`.
- [ ] **[Dev]** Usar Node 24 y ejecutar el build final.
- [ ] **[Dev]** Revisar móvil, tableta, escritorio, teclado, foco, mensajes de error, enlaces, 404, SEO, sitemap y robots.
- [ ] **[Mar + Dev]** Probar en producción todos los formularios y servicios que vayan a quedar visibles.
- [ ] **[Dev]** Buscar antes del lanzamiento URLs provisionales, emails antiguos, `TODO` técnicos y valores `PLACEHOLDER`.
