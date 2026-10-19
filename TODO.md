# TODO — Pomelo Baby

Solo lo que bloquea o tiene fecha. Última revisión: 19 oct 2026.

**Estado:** **web abierta el 19 oct 2026** (commit `62ef56a`, desplegado en Production a las 17:30 UTC): guías de pago, guía gratuita, consultas y El Chisme activos (de El Chisme, de momento solo captar suscriptores: aún no hay ediciones) (`GUIDES_ENABLED`, `FREE_GUIDES_ENABLED`, `CONSULTATIONS_ENABLED` y `CHISME_ENABLED` a `true`; `CONSULTA_CORREO_PAUSADA` a `false`). Comprobado en la web: `/consultas` muestra «Reservar» y las guías de pago, «Comprar». **Compra Live real de una guía comprobada por Rafael el 19 oct: funciona.** Stripe Live y Cloudflare Production, probados en Sandbox (`docs/guias-de-pago.md`). Cal.com con el horario fijo de los miércoles, comprobado como correcto el 19 oct (`docs/configuracion-cal-com.md`). Mar envió el 2 oct el correo al gestor, sin respuesta registrada. Migración a Cloudflare hecha el 8 oct (`TODO-cloudflare.md`). Los textos actuales los ha revisado Mar: no se tocan.

# Ahora, tras abrir

Con las ventas abiertas, esto pasa a ser lo primero:

- [x] **[Rafael]** Compra real Live de una guía y reembolso: funciona (19 oct). Queda mirar si el correo cae en spam (Gmail, Outlook, móvil) y que la factura llegue, cuando «Pagos efectuados» esté activado.
- [ ] **[Dev]** Comprobar que las **demás** guías también tienen mapeo `stripe.live` y su PDF en R2 (`pomelo-guias`); la compra real solo prueba una. El webhook Live, `sk_live_` y Resend quedan probados por esa compra.
- [ ] **[Mar + Rafael]** Una reserva real controlada de cada consulta de Cal.com (el cobro debe salir en el Stripe de Pomelo) y reembolsarla; y la consulta por correo, que ya se puede comprar. El horario de Cal.com ya está bien.
- [ ] **[Rafael]** Search Console: **reenviar `sitemap-index.xml`** (la última lectura fue el 30 sept, antes de la migración; hoy responde 200). El aviso «Página alternativa con etiqueta canónica adecuada» es informativo (URL sin barra final que apunta a la versión con barra): se ignora.
- [ ] **[Rafael]** Stripe: «Pagos efectuados», datos fiscales y URL de las Condiciones en **Sandbox y Live**, si no están (las facturas dependen de ello).
- [ ] **[Rafael + Mar]** El Chisme (captando suscriptores, sin ediciones todavía): reenvío de `chisme@` a Gmail y limpiar los 2 contactos de prueba de Resend. Las 3 ediciones de Mar y el primer Broadcast con enlace de baja, antes de enviar nada.
- [ ] **[Dev]** Cuando se pase por las páginas legales: los datos pendientes del Aviso legal (ver más abajo) siguen sin publicar con la web ya abierta.

# A. Podemos hacer ahora mismo

No dependen de ninguna respuesta externa.

## Hecho el 19 oct

- [x] **[Rafael + Dev]** Guía gratuita activada (`FREE_GUIDES_ENABLED = true`, sin `downloadEnabled: false`), junto con el resto de la apertura.

## Pequeñas, de una sesión

- [ ] **[Mar]** Respuesta rápida de Instagram que derive las dudas de salud a `/consultas`.
- [ ] **[Vicente / Mar]** Es **S.L.P** (confirmado el 2 oct; la web ya lo dice bien). Faltan para el Aviso legal: el **número de inscripción de la sociedad en el Registro de Sociedades Profesionales** del Colegio de Enfermería (obligatorio por la Ley 2/2007; lo tiene el Colegio o la asesoría), **el colegio de Mar** (nombre exacto) y **su título y país de expedición** (LSSI, art. 10). Ya publicados: Registro Mercantil (Alicante, hoja A-191902, inscripción 1.ª) y n.º de colegiada 16700. Después, **Dev** los añade.
- [ ] **[Rafael]** Reenvío de `chisme@` a Gmail cuando se active El Chisme (el resto del correo en Gmail está hecho y probado el 8 oct, con SPF, DKIM y DMARC en PASS; ver `docs/configuracion-correo-profesional.md`).
- [ ] **[Mar + Rafael]** Añadir el teléfono nuevo (el de las consultas) al móvil de Mar. Va antes de WhatsApp Business, que se configura en ese número.
- [ ] **[Mar + Rafael]** WhatsApp Business en el número nuevo (canal de consultas que abre Mar): nombre «Pomelo Baby» y foto, verificación en dos pasos, «Guardar en galería» desactivado, copia de seguridad desactivada o cifrada, y respuestas rápidas `/aviso` («en 5 minutos te llamo»), `/fotos` (cómo enviar fotos y vídeos con «ver una vez») y `/cierre`, con textos de Mar. Fotos y vídeos solo con «ver una vez»: Mar los abre al valorarlos, desde el móvil, y describe en el registro lo que ve; si llegan sin «ver una vez», los borra tras valorarlos. Al cerrar cada consulta: mensaje de cierre, pasar lo importante al registro en Clinic, borrar el chat y bloquear.
- [ ] **[Mar]** Confirmar el nombre exacto del proveedor «Clinic» (¿Clinic Cloud?) en la lista de proveedores de Privacidad. Aprobados el 7 oct: ayuda del teléfono en Contacto, frase de Cal.com, cambios de Privacidad y recordatorio de Cal.com 2 h antes. Mar bloquea en WhatsApp al terminar cualquier conversación, no solo las consultas.
- [ ] **[Rafael]** Cal.com: la disponibilidad ya está definida (12 oct) y Google Calendar de clinicapomelo@gmail.com comprueba conflictos con el calendario «Mar». Falta activar también **Pomelo — bloqueos**, si existe.

## Decisiones

- [ ] **[Mar]** ¿La web debe decir los 40 minutos de «Necesito un plan»? En Cal.com están en 40; la web solo dice los 20 minutos de la otra consulta. Sería texto nuevo.
- [ ] **[Mar + Rafael]** Decidir cuándo enseñar la web en redes (Mar quiere hacerlo pronto). La web y las ventas ya están abiertas: antes de anunciarla, cerrar «Ahora, tras abrir».

## Redacción y trabajo de Dev

- [ ] **[Gestor / abogado + Mar]** Revisar el borrador de las Condiciones de venta que Dev publicó el 12 oct en `src/pages/condiciones-venta.astro` (ya sin `noindex`): desistimiento, cancelaciones (2 reprogramaciones, hasta 24 h antes, reembolso con 48 h; el texto dice «sin perjuicio de los derechos que la ley te reconoce») y la nueva casilla de la consulta por correo (`src/lib/checkout-consent.ts`). Duda concreta: si «no se devuelve con menos de 48 h» es compatible con el desistimiento de 14 días antes de que se preste el servicio. Faltan los casos de ausencia y si cancela Mar con más detalle.
- [ ] **[Mar + Rafael]** «Cuéntame por correo» (la consulta de 19 €): E3 programada el 7 oct con máximo de 10 al día y pausa desde la web, `CONSULTA_CORREO_PAUSADA` (`docs/consulta-por-correo.md`). Textos aprobados por Mar y 10 todos los días de la semana. Probada en Sandbox el 7 oct. Abierta con el resto el 19 oct (`CONSULTATIONS_ENABLED = true`): falta una compra real controlada. Mar aprobó también los textos de WhatsApp de la confirmación y de «¡Recibido!».

## Facturas, horarios y formularios (12 oct 2026)

Hecho en el código el 12 oct: factura automática de Stripe en los dos checkouts (`src/lib/checkout-invoice.ts`), botón de descarga en `/guias/gracias`, bloqueo de la descarga si la guía está reembolsada, camino «Otro horario» (enlace en `/consultas`, formulario con campos propios y acuse), teléfono con prefijo y buscador de países. Diseño de la versión automática con respuesta de Mar: [`docs/ideas-horarios-alternativos.md`](docs/ideas-horarios-alternativos.md).

- [ ] **[Mar]** Aprobar los textos nuevos: enlace de `/consultas` («¿No te encaja ningún horario?…»), opción «Otro horario para una consulta», etiquetas, «Cómo funciona» y errores del formulario de horarios, ejemplo y errores del teléfono, lista de países «Más habituales», y los dos acuses (el de «Otro horario» no promete plazo; los demás, 24–48 h). Pendiente decidir si se quita la frase «24–48 horas laborables» del texto general de `/contacto`.
- [ ] **[Mar + Rafael]** Plantilla de respuesta en Gmail y filtro por el asunto `[Otro horario]`. Responder a una petición es manual: Mar añade una excepción por fecha en el horario de ese tipo en Cal.com y manda el enlace de `/consultas`.
- [ ] **[Rafael]** Cal.com: poner en la descripción de los dos eventos «¿No te encaja ningún horario? Escríbeme desde pomelobaby.es/contacto y buscamos otro.»; casilla obligatoria de aceptar las condiciones; confirmar «Necesito un plan» (horario de largas, 11:00 y 16:00, frecuencia 2 al día). Opcional: «reservas próximas por usuario» a 1, límite de reservas futuras y tope total por usuario (Settings → General, si aparece).
- [ ] **[Rafael]** Stripe: activar **Pagos efectuados** en Configuración → Empresa → Correos electrónicos de clientes (así llega la factura), y los datos fiscales de Piel de Pomelo para las facturas. Coste de Stripe por factura: 0,4 % con máximo de 2 $.
- [x] **[Rafael + Dev]** Probar en Sandbox (hecho, 13 oct): compra de una guía (correo, botón de descarga, factura con «Enviar recibo» manual, reembolso y que la descarga se bloquee), y consulta por correo con el teléfono nuevo.
- [ ] **[Rafael + Dev]** Probar con las variables de Resend en `.env` (con `RESEND_TO_EMAIL` apuntando a un correo propio) el formulario de `/contacto` completo: aviso a Mar y acuse. Confirmar que la regla de límite de envíos de Cloudflare incluye `/api/contact`.
- [ ] **[Dev]** Probar el selector de prefijo (`src/lib/phone-prefix.ts`) con teclado, lector de pantalla, iPhone y Android.
- [ ] **[Gestor]** IVA de las guías: el código pone «IVA incluido (21 %)» (`GUIDE_VAT_RATE`); confirmar si son 4 % por libro electrónico. Consultas: exentas (art. 20.Uno.3.º de la Ley 37/1992, según Mar).
- [ ] **[Gestor + Dev]** Facturas de las reservas de Cal.com (49 y 89 €): no las genera el checkout. Opción: webhook de Cal.com y factura en Stripe pagada fuera de banda; antes, comprobar que Cal.com cobra con la misma cuenta de Stripe.
- [ ] **[Dev]** Borrar o conservar la maqueta `docs/show-me/06-selector-prefijo-telefono.html`.

# Apertura (hecha el 19 oct)

El 14 oct se decidió abrir todo el mismo día, salvo El Chisme; el 19 oct se abrió **todo, incluido El Chisme** (`62ef56a`). Lo que se había previsto como requisito y sigue sin hacerse:

- [ ] **[Gestor]** Respuesta sobre IVA y revisión de Aviso legal, Privacidad, Cookies y Condiciones (sección B). Hoy se cobra 21 % en las guías sin confirmar.
- [ ] **[Vicente / Mar]** Datos del Aviso legal: nº del Registro de Sociedades Profesionales, colegio de Mar, título y país.
- [ ] **[Mar]** Aprobar los textos nuevos (sección A) y decidir lo de los 40 minutos.
- [ ] **[Rafael]** Cal.com: descripciones, casilla de condiciones y «Necesito un plan».
- [ ] **[Rafael + Dev]** Probar el formulario de `/contacto` con Resend y revisar `/contacto` en móvil (390 y 320 px).
- [x] **[Dev]** Banderas a `true`, `downloadEnabled` y `CONSULTA_CORREO_PAUSADA` fuera (19 oct).

# B. Pendiente: esperan a una respuesta o a otra tarea

## Esperan al gestor (correo enviado el 2 oct; ya pasó la semana de plazo: si no ha respondido, volver a escribirle)

- [ ] **[Gestor]** IVA o exención de guías y consultas, qué pone la factura y que los precios son finales. Se factura a Piel de Pomelo S.L.P con su NIF (ya confirmado). Guías de 4,90 a 14,90 € hoy, con previsión de llegar a 24,90 €; consultas de 19, 49 y 89 €.
- [ ] **[Gestor]** Revisar Aviso legal, Privacidad, Cookies, aviso sanitario del footer (Mar ya lo aprobó) y las capas de privacidad de los formularios. Mar lo prioriza («estar bien blindada legalmente»); Rafael lo ve opcional.
- [ ] **[Gestor]** Echar un vistazo a las Condiciones, el desistimiento y las cancelaciones cuando Rafael y Mar las tengan redactadas. Si nadie cualificado los mira y la web informa mal del desistimiento, la normativa de consumo suele ampliar el plazo de devolución.
- [ ] **[Mar + gestor]** Datos de salud: qué se guarda de cada consulta, cuánto tiempo y quién accede; canal seguro para fotos y vídeos (no Instagram); buzón restringido con MFA. Propuesta (7 oct): consultas también por WhatsApp Business; registro solo de texto en Clinic (el programa de historia clínica de Piel de Pomelo), 5 años desde el cierre de cada consulta (Ley 41/2002; la Comunitat Valenciana no fija otro plazo); fotos y vídeos con «ver una vez», sin conservarlos. Preguntar: si basta con describir la imagen en el registro, si conviene más plazo por tratarse de menores, y si WhatsApp Business es admisible para datos de salud de menores. Un gestor fiscal puede no llevar protección de datos: si no lo lleva, preguntar con quién verlo.

## Esperan a la clínica (prioridad de Mar para abrir consultas)

- [x] **[Empresa]** Autorización sanitaria: la clínica está cubierta (13 oct). Falta que **[Dev]** publique sus datos (titular, dirección, nº registral, U.2); hay que pasárselos.
- [x] **[Empresa]** Seguro: cubierto (13 oct).

## Esperan a lo anterior (Dev, salvo indicación)

- [ ] **[Rafael + Dev]** Con la revisión de las Condiciones y la respuesta del IVA: dejar definitivos los textos de `src/lib/checkout-consent.ts`, poner la URL de las Condiciones (`https://pomelobaby.es/condiciones-venta`) en Stripe **Sandbox y Live** (Settings → Public details) y decidir `tax_behavior` de los Prices.
- [ ] **[Dev + gestor]** Casilla de condiciones en la reserva de Cal.com, y reprogramaciones (hasta 2, hasta 24 h): Cal.com no las limita por sí mismo.
- [ ] **[Mar + Rafael]** Reservar y reembolsar una prueba de cada consulta de Cal.com, cuando haya disponibilidad: el cobro debe aparecer en el Stripe de Pomelo. En «Necesito hablar con calma», una de ellas eligiendo teléfono: recordatorio del Workflow 2 h antes, número en el calendario de Mar, videollamada de WhatsApp, cambio de hora y cancelación.
- [x] Compra real de una guía: hecha el 19 oct (ver «Ahora, tras abrir»). Si el correo cae en spam, revisar los informes DMARC: el `rua` ya llega a `dmarc@pomelobaby.es`.
- [ ] **[Mar + Dev]** «Cuéntame por correo»: compra de prueba y compra real controlada antes de abrirla.
- [ ] **[Dev]** QA final: ya hecho enlaces (0 rotos), 404 (existe, sin enlace de vuelta; una 404 propia sería texto nuevo y la decide Mar), SEO (100), velocidad y Contacto en Production. Revisión manual de móvil, teclado y foco hecha por Rafael el 2 oct (funciona de 10 en móvil). Falta probar en Production los formularios que se abran.

# Entornos de prueba (develop)

Decidido el 16 oct (conversación): rama **`develop`** y entorno de pruebas con el Worker `pomelo-bby-web-preview`, Sandbox y recursos propios, en vez de migrar a Worker Previews antes del lanzamiento (novedad del 22 sept 2026 y cambio irreversible; revisar más adelante si hace falta una URL por rama). Flujo: ramas de trabajo → `develop` → pruebas → `main`; `main` solo recibe de `develop`.

- [ ] **[Dev]** Crear la rama `develop` desde `main` y limitar el Worker `-preview` para que solo se despliegue desde ella (hoy cualquier rama lo pisa).
- [ ] **[Dev + Rafael]** **Bucket R2 propio** (`pomelo-guias-develop`, con PDFs de prueba): hoy la preview y Production comparten `pomelo-guias`.
- [ ] **[Rafael]** Dominio `develop.pomelobaby.es` en el Worker `-preview` (primer nivel, lo cubre el certificado gratuito) protegido con Cloudflare Access, y webhook propio en Stripe Sandbox para esa URL.
- [ ] **[Dev + Rafael]** Resend: Segmento y Topic de pruebas, y `RESEND_TO_EMAIL` / `RESEND_CONSULTA_TO_EMAIL` a un correo propio en la preview. Comprobar qué usa hoy la preview (solo nombres, nunca valores).
- [ ] **[Dev]** `noindex` en el dominio propio de develop (solo `workers.dev` lo lleva automático) y que las visitas no cuenten en Web Analytics.
- [ ] **[Rafael + Mar]** Cal.com no tiene Sandbox y solo conecta una cuenta de Stripe: decidir si se prueba con una segunda cuenta de Cal.com conectada a Stripe Sandbox, con un evento oculto de coste real o solo con la reserva real controlada.
- [ ] **[Dev]** Escribir `docs/entornos.md` con el mapa del stack (qué es compartido y qué tiene entorno propio) y la lista de correos que envía el sistema (a la familia y a Mar), para enseñárselo a Mar.

# C. Migración a Cloudflare

Hecha el 8 oct 2026: `pomelobaby.es` se sirve desde el Worker de Production y Vercel queda solo como vuelta atrás. Lo que falta (revisión y limpieza de Vercel) está en **[`TODO-cloudflare.md`](TODO-cloudflare.md)**.

# Más adelante

Verifactu: sin hacer nada hasta 2028 (Hacienda anunció el 5 oct 2026 el aplazamiento a octubre de 2028; falta el BOE). Reembolso automático ante un aviso de fraude de Stripe y respuesta de Mar con un clic para las peticiones de otro horario (diseño en `docs/ideas-horarios-alternativos.md`). 2FA en Cloudflare, Resend, DonDominio y GitHub, y DMARC estricto cuando SPF y DKIM lleven un tiempo en PASS.

El Chisme está abierto solo para captar suscriptores (tareas en «Ahora, tras abrir»); las ediciones y el primer Broadcast, cuando Mar las tenga; el flujo de alta, confirmación, baja y reactivación está probado en local. Manual de supervivencia (PDF de Mar) y fuentes en los artículos de salud.

## Documentación

[Cal.com](docs/configuracion-cal-com.md) · [Ideas de horarios](docs/ideas-horarios-alternativos.md) · [Resend](docs/configuracion-resend.md) · [Correo profesional](docs/configuracion-correo-profesional.md) · [Doble opt-in](docs/arquitectura-doble-opt-in.md) · [El Chisme](docs/estrategia-blog-y-el-chisme.md) · [Guías de pago](docs/guias-de-pago.md) · [Consulta por correo](docs/consulta-por-correo.md) · [Archivos sanitarios](docs/canales-archivos-consultas.md) · [Enlaces](docs/urls.md)
