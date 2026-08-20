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
- La tienda solo mostrará la guía gratuita y las guías de pago que ya tengan PDF, Product ID y Price ID configurados. Las ideas futuras no aparecerán como “Próximamente”.
- El enlace de una guía de pago caduca actualmente 30 días después de la compra. El PDF descargado no caduca.
- El dominio canónico será `pomelobaby.es`; `www.pomelobaby.es` debe redirigir permanentemente hacia él.
- Lead magnet, newsletter y consultas permanecerán visibles mientras se completa su configuración externa y legal.
- Mar es **enfermera**, con Grado en Enfermería y formación de posgrado pediátrica; no posee el título oficial de Especialista en Enfermería Pediátrica.
- En Cal.com, “Duda concreta” dura 20 minutos y “Hablemos tranquilamente” 40 minutos. Cada evento tiene su formulario propio y Google Meet como ubicación. No habrá preaviso mínimo por ahora y se dejarán 15 minutos de margen entre consultas; falta conectar el calendario personal y Stripe.
- “Cuéntame por correo” incluye una única respuesta personalizada en 24-48 horas laborables. “Duda concreta” termina con la videollamada. “Hablemos tranquilamente” incluye seguimiento por correo durante 14 días, sin un número máximo de mensajes ni un plazo de respuesta definido por ahora.

## Estado comprobado

- El catálogo, el lead magnet, las consultas y la infraestructura de entrega de guías están integrados en `main`.
- Los cinco PDF están en el almacén privado `pomelo-bby-recursos`. Las cuatro guías de pago tienen `blobKey`, Product ID y Price ID y están marcadas como disponibles en el catálogo; sigue pendiente probar el flujo completo.
- El doble opt-in está probado en Preview de extremo a extremo: solicitud, email, página sin efectos, confirmación, alta en Resend y descarga. Falta probar baja, reutilización del enlace y nueva alta.
- Stripe continúa en sandbox. El flujo de Cuéntame por correo funciona de extremo a extremo por 19 € y los precios de Cal.com son correctos, pero todavía no se aceptan cobros reales.
- La prueba con `resend.dev` llegó a spam, algo esperable por usar un remitente compartido y un enlace de localhost. La entregabilidad real sigue pendiente del dominio verificado y enlaces HTTPS públicos.
- Production está pública en `https://pomelo-bby-web.vercel.app`; las Preview continúan protegidas por Vercel Authentication.
- `pomelobaby.es` y `www.pomelobaby.es` ya resuelven por HTTPS en Vercel. La variante `www` todavía responde directamente y falta redirigirla permanentemente al dominio canónico.
- `MAINTENANCE_MODE=false` en Production desde el último despliegue. Al activarlo, oculta la interfaz, bloquea las API no transaccionales con HTTP 503 y publica `robots.txt` con `Disallow: /`.
- Los formularios están públicos, pero sin la configuración externa y legal completa deben considerarse en preparación.
- La auditoría de seguridad está desplegada: CSP con hashes y sin `unsafe-inline`, endurecimiento de pagos y datos sensibles, funciones en `fra1` y dependencias sin vulnerabilidades conocidas en `npm audit` y `pnpm audit`.
- El webhook Live de Stripe para `https://pomelobaby.es/api/webhook` está activo con los dos eventos de Checkout, su secreto está en Production y una petición sin firma válida devuelve `400`. La clave temporal de Stripe CLI ya no conserva el permiso de escritura.
- El build termina correctamente. En local se usa Node 26 y Vercel avisa de que ejecutará las funciones con Node 24.
- Los worktrees `task-03`, `task-04`, `task-05`, `task-07` y `task-08` están limpios y sus commits están integrados. La tarea 06 se integró en los commits `c1fd7f6` y `71f7353`. La rama de la tarea 01 no es ancestro de `main`, pero Git confirma que su parche ya está aplicado.

---

# 1. Antes de publicar la web

- [x] **[Mar]** Comprar el dominio definitivo: `pomelobaby.es`.
- [ ] **[Mar]** Crear o confirmar el correo profesional.
- [x] **[Dev]** Añadir el dominio a Vercel y unificar `SITE_URL`, Astro, sitemap, robots, enlaces canónicos y Open Graph.
- [ ] **[Dev]** Redirigir permanentemente `www.pomelobaby.es` hacia `pomelobaby.es`.
- [x] **[Dev]** Bloquear también las rutas `/api/*` en Production mientras `MAINTENANCE_MODE` esté activo.
- [ ] **[Mar + profesional legal]** Completar Aviso legal, Privacidad, Cookies y Condiciones de venta, incluyendo formularios, newsletter, consultas, datos de salud, pagos y proveedores externos.
- [ ] **[Mar + profesional legal]** Validar el aviso ya publicado en el footer: “No están pensadas para situaciones urgentes: si algo te preocupa de forma inmediata o tu hijo o hija empeora, busca atención sanitaria sin esperar mi respuesta”.
- [ ] **[Dev]** Añadir la información resumida de privacidad junto a Contacto y Consultas y aplicar las decisiones legales al lead magnet y newsletter.
- [ ] **[Dev]** Revisar Google Fonts, Vercel Analytics y la carga de Cal.com para decidir si requieren cambios o consentimiento.
- [ ] **[Dev]** Añadir protección proporcionada contra abuso en los formularios públicos y revisar que los errores y logs no expongan información interna ni datos personales.
- [x] **[Mar + Dev]** Mantener visibles lead magnet, newsletter y consultas mientras se completa la configuración externa y legal.

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
- [x] **[Mar]** Colegio confirmado: **Colegio Oficial de Enfermería de Alicante**. Número de colegiación publicable: **16700**.
- [x] **[Mar]** Titulación confirmada: **Grado en Enfermería**, expedido en España, y **Diploma de Posgrado en Práctica Avanzada de Enfermería al Niño con Problemas de Salud**. No posee el título oficial de **Especialista en Enfermería Pediátrica**; el diploma de posgrado no debe presentarse como ese título oficial.
- [ ] **[Asesoría]** Confirmar si Piel de Pomelo SLP contrata y factura tanto las guías como las consultas y que ambas actividades están incluidas en su objeto social profesional.
- [ ] **[Gestoría]** Confirmar que todos los precios visibles son finales y cómo debe informarse de impuestos o exenciones en consultas y contenido digital.

### Autorización sanitaria en la Comunitat Valenciana

La normativa no establece una exención clara para la teleconsulta. La opción prudente es prestar el servicio desde la clínica ya autorizada y comprobar que su oferta asistencial incluye **U.2 Enfermería**.

- [ ] **[Empresa]** Localizar la resolución o certificado sanitario vigente de la clínica; actualmente no se dispone de una copia.
- [ ] **[Empresa]** Comprobar en ese documento: titular exacto, dirección autorizada, tipo de centro, oferta asistencial **U.2 Enfermería** y número del Registro Autonómico de Centros, Servicios y Establecimientos Sanitarios.
- [ ] **[Empresa]** Se ha indicado que la titular es **Piel de Pomelo SLP**, pero debe confirmarse en la autorización sanitaria. No usar en la web una autorización perteneciente a otra sociedad, profesional o dirección.
- [ ] **[Empresa]** Pedir confirmación escrita a la Dirección Territorial de Sanidad de que la atención infantil por videollamada, formulario y correo queda cubierta por la U.2 existente.
- [ ] **[Empresa]** Si no consta U.2 Enfermería o cambia la oferta autorizada, tramitar la modificación antes de abrir las consultas: <https://sede.gva.es/es/detall-tramit?id_proc=21330>.
- [ ] **[Dev]** Cuando esté verificado, publicar en Aviso legal y en la promoción de consultas el número registral y los datos de la autorización y del órgano supervisor que correspondan.

### Seguro de responsabilidad

No se contratará otra póliza sin revisar antes el seguro existente de la clínica. El seguro y la autorización sanitaria son comprobaciones distintas.

- [ ] **[Empresa]** Existe un seguro de responsabilidad civil, pendiente de revisar. Solicitar a la aseguradora —no solo una confirmación verbal— que indique por escrito que la póliza cubre a **Piel de Pomelo SLP** y a **Mar Vall Requena**.
- [ ] **[Empresa]** Confirmar que incluye consultas individualizadas de enfermería a menores mediante videollamada, formulario, correo y seguimiento remoto, además de la responsabilidad de la sociedad y de la profesional.
- [ ] **[Empresa]** Confirmar ámbito territorial, límites, franquicia, defensa jurídica, fecha retroactiva y posibles exclusiones por teleasistencia, menores o actividad fuera del local.
- [ ] **[Empresa]** Si la póliza no lo recoge con claridad, pedir un suplemento o certificado específico antes de abrir el servicio. El número de póliza no tiene que publicarse en la web.

### Privacidad, datos de salud y contratación

- [ ] **[Mar]** Leer y aprobar la Política de privacidad publicada.
- [ ] **[Profesional legal + Dev]** Sustituir los placeholders públicos de Privacidad, Cookies y Condiciones de compra por textos definitivos antes del lanzamiento.
- [ ] **[Profesional legal]** Definir responsable, finalidades, bases jurídicas, datos de salud de menores, proveedores, transferencias, conservación y derechos. Como regla de partida, la contratación debe realizarla una persona adulta que sea madre, padre o tutora legal; otra persona cuidadora deberá declarar que cuenta con autorización.
- [ ] **[Mar + profesional legal]** Determinar cuándo una consulta genera atención y documentación clínica, qué consentimiento e información asistencial necesita y durante cuánto tiempo debe conservarse.
- [ ] **[Mar + Dev]** Mar está buscando un canal específico para fotografías o vídeos. Validar su seguridad, conservación y acceso antes de aprobarlo; no usar Instagram para datos sanitarios.
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
- [ ] El dominio y los registros de SPF, DKIM y DMARC ya están añadidos en DonDominio. Completar la verificación en Resend cuando la delegación DNS de `pomelobaby.es` sea pública.
- [x] Crear el Segmento “El Chisme de Mar”.
- [x] Crear el Topic público “El Chisme de Mar” con alta predeterminada desactivada y suscripción explícita desde el formulario.
- [x] Crear las propiedades `signup_source`, `consent_version` y `consented_at`.
- [ ] Personalizar la página de baja de Resend.
- [x] Implementar el doble opt-in con token cifrado: solo crear el Contacto y activar el Topic después de pulsar el botón de confirmación.
- [x] Revisar y aprobar como definitivo el PDF de “25 cosas normales en los bebés”, ya alojado en Vercel Blob privado.
- [ ] Hay ideas para El Chisme, pero todavía no hay ediciones preparadas. Redactar tres ediciones y el primer artículo relacionado antes del primer envío.
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

- [ ] **[Mar]** Conectar Cal.com con la cuenta definitiva de Stripe de pomelo.bby y activar el pago obligatorio en “Duda concreta” y “Hablemos tranquilamente”. Actualmente Cal.com no está conectado con Stripe; hacerlo solo después de completar las pruebas y cerrar fiscalidad y condiciones.
- [x] **[Mar]** Los eventos se llaman “Duda concreta” y “Hablemos tranquilamente” y muestran **49 €** y **89 €** en EUR.
- [x] **[Mar]** Duraciones confirmadas: 20 minutos para “Duda concreta” y 40 minutos para “Hablemos tranquilamente”.
- [ ] **[Mar]** Los formularios de ambos eventos ya están configurados. Falta conectar el calendario personal como calendario de conflictos, mantener 15 minutos de margen y revisar la disponibilidad final. No hay preaviso mínimo y el máximo diario o semanal queda pendiente de decidir.
- [x] **[Mar]** Mantener el seguimiento por correo durante 14 días en “Hablemos tranquilamente”, sin límite de mensajes ni plazo de respuesta definido por ahora. Revisar estos límites antes de redactar las condiciones.
- [ ] **[Mar]** Definir más adelante cancelaciones, reprogramaciones y ausencias; todavía no hay una política decidida.
- [ ] **[Mar + Dev]** Probar reserva, pago, Google Meet, cancelación, reprogramación y correos de ambos eventos.

## Cuéntame por correo — 19 €

- [ ] **[Mar]** Crear en la cuenta definitiva de Stripe el producto y Price de 19 €.
- [ ] **[Dev]** Configurar `STRIPE_CONSULTA_MENSAJE_PRICE_ID` en producción; en test ya está verificado el cobro de 19 €.
- [x] **[Dev]** Impedir duplicados con metadata de Stripe e idempotencia de Resend.
- [ ] **[Dev]** Evitar perder el caso si Resend falla después del pago y devolver siempre errores genéricos.
- [ ] **[Mar + Dev]** Elegir y validar el canal para solicitar fotografías o vídeos después del primer correo. Comparativa y prueba propuesta en [`docs/canales-archivos-consultas.md`](docs/canales-archivos-consultas.md); no implementarlo ni anunciarlo hasta validar privacidad, acceso y conservación.
- [ ] **[Mar + Dev]** Hacer una compra completa de prueba y otra real controlada antes de abrir el servicio.

---

# 4. Stripe, fiscalidad y cobros reales

Stripe continúa en sandbox y los precios visibles son correctos. Antes de aceptar pagos reales:

- [ ] **[Mar]** La cuenta actual de Stripe no está a nombre de Piel de Pomelo SLP y no tiene una cuenta bancaria conectada. Probablemente se usará la sociedad, pero debe confirmarse. Cambiar solo el nombre visible o el email no cambia la titularidad legal: hay que completar o regularizar los datos fiscales, representante y cuenta bancaria antes de aceptar cobros reales.
- [ ] **[Mar + gestoría]** Confirmar IVA, facturación, datos necesarios del comprador y quién emite las facturas. Esto no implica necesariamente contratar Stripe Tax.
- [ ] **[Mar + profesional legal]** Confirmar condiciones de cancelación, devolución y desistimiento para consultas y productos digitales.
- [ ] **[Rafael]** Activar 2FA en Stripe, Resend, Cal.com, Supabase, Vercel, DonDominio y el correo profesional; Rafael se encargará de esta tarea.
- [ ] **[Dev]** Cambiar a claves y Price ID live solo después de superar todas las pruebas en sandbox.

---

# 5. Activar las nuevas guías de pago — no bloquea la web inicial

## Productos y precios acordados

- [x] **[Dev]** Añadir al catálogo como disponibles:
  - Recomendaciones generales para el recién nacido — **3,99 €**.
  - Conservación de la leche materna — **3,99 €**.
  - Pomada de aceite de uva — **3,99 €**.
  - La guía definitiva para empezar a comer — **17,99 €**.
- [x] **[Mar]** Subir los cuatro PDF de pago al Vercel Blob privado.
- [x] **[Dev]** Comprobar que los cinco archivos de `pomelo-bby-recursos` son privados, coinciden en nombre y tamaño con los PDF locales y configurar los cuatro `blobKey`.
- [ ] **[Mar + gestoría]** Confirmar que **3,99 €** y **17,99 €** son precios finales y cómo se tratan los impuestos y la facturación.
- [ ] **[Mar]** Confirmar si se mantienen los 30 días actuales de acceso al enlace de descarga.

## Datos que Mar debe copiar de los paneles

- [x] **[Dev]** Obtener y configurar el pathname o `blobKey` de cada PDF sin guardar URLs privadas ni credenciales.
- [x] **[Mar]** Crear en Stripe los cuatro productos y pasar sus Product ID (`prod_...`) a desarrollo.
- [ ] **[Mar]** Confirmar que están en **modo test** y que cada producto tiene un precio único en EUR con el importe indicado.
- [x] **[Mar]** Copiar los cuatro Price ID (`price_...`). El código cobra mediante el **Price ID**; el importe visible en la web y el Product ID no controlan el cobro.
- [x] **[Mar]** Pasar a desarrollo los cuatro Price ID, identificando a qué guía pertenece cada uno, sin compartir claves de Stripe.

## Conexión y prueba técnica

- [x] **[Dev]** Añadir los cuatro `stripeProductId` en `src/data/guias.ts`.
- [x] **[Dev]** Añadir los cuatro `stripePriceId` recibidos en `src/data/guias.ts`.
- [ ] **[Dev]** Configurar y probar en Preview un webhook de Stripe de test con su propio secreto; no reutilizar credenciales Live en Preview.
- [ ] **[Mar + Dev]** Probar cada guía de extremo a extremo: pago test, un único email, reintento del webhook, descarga del PDF correcto, página de gracias y errores seguros.
- [x] **[Dev]** Marcar como `available` las cuatro guías que ya tienen Blob, Product ID y Price ID, según la decisión de catálogo de Mar.

## Paso a cobros reales

- [ ] **[Mar]** Tras superar las pruebas y cerrar fiscalidad y condiciones, repetir los cuatro productos y precios en Stripe **modo live**.
- [ ] **[Dev]** Sustituir los IDs de test por los IDs live, hacer una compra real controlada de cada guía y desplegar.

Las futuras guías se añadirán al catálogo únicamente cuando tengan PDF, Product ID y Price ID.

---

# 6. Limpieza y QA final

- [ ] **[Dev]** Revisar y separar los cambios locales actuales de `AGENTS.md`, Inicio, Tienda, `docs/` e `images/`.
- [ ] **[Dev]** Eliminar los worktrees y ramas de tareas ya integradas después de una última comprobación.
- [ ] **[Mar + Dev]** Decidir qué materiales originales de `images/` se conservan fuera de Git y cuáles se versionan optimizados en `public/`.
- [ ] **[Dev]** Usar Node 24 y ejecutar el build final.
- [ ] **[Dev]** Separar completamente las credenciales Live de Stripe y Resend de Preview.
- [ ] **[Dev]** Tras desplegar, comprobar OIDC en las guías de pago y retirar o rotar `BLOB_READ_WRITE_TOKEN` si ya no es necesario en Vercel.
- [ ] **[Mar + Dev]** Probar en navegador que Vercel Analytics y el popup de Cal.com funcionan sin errores de CSP.
- [ ] **[Rafael + Mar]** Restringir el buzón de consultas sanitarias, activar MFA y acordar una política de conservación y borrado.
- [ ] **[Dev]** Revisar móvil, tableta, escritorio, teclado, foco, mensajes de error, enlaces, 404, SEO, sitemap y robots.
- [ ] **[Mar + Dev]** Probar en producción todos los formularios y servicios que vayan a quedar visibles.
- [ ] **[Dev]** Buscar antes del lanzamiento URLs provisionales, emails antiguos, `TODO` técnicos y valores `PLACEHOLDER`.
