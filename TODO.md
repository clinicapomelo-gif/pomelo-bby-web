# TODO — Pomelo Baby

Solo lo que bloquea o tiene fecha. Última revisión: 12 oct 2026.

**Estado:** web publicada. Guías, consultas y El Chisme apagados por código (`GUIDES_ENABLED`, `CONSULTATIONS_ENABLED`, `CHISME_ENABLED`; la guía gratuita tiene el suyo, `FREE_GUIDES_ENABLED`). Stripe Live y Vercel Production listos para las guías, probadas en Sandbox (`docs/guias-de-pago.md`). Cal.com configurado (precios 49 € y 89 €) y, desde el 12 oct, con el horario fijo de los miércoles (`docs/configuracion-cal-com.md`). Mar envió el 2 oct el correo al gestor. Migración a Cloudflare en curso en la rama `cloudflare` (`TODO-cloudflare.md`). Los textos actuales los ha revisado Mar: no se tocan.

# A. Podemos hacer ahora mismo

No dependen de ninguna respuesta externa.

## Esta semana, con fecha

Production (push del 2 oct 2026) tiene el aviso de error de Contacto, los datos de empresa con el Registro Mercantil, `noindex` de las Condiciones y el precio de 89 €, y sigue sin poder cobrarse nada.

- [ ] **[Rafael + Dev]** **5 oct:** activar la guía gratuita: `FREE_GUIDES_ENABLED = true` en `src/data/guias.ts`, quitar `"downloadEnabled": false` en `src/data/guias.json`, build y push. `GUIDES_ENABLED` se queda en `false`.

## Pequeñas, de una sesión

- [ ] **[Mar]** Respuesta rápida de Instagram que derive las dudas de salud a `/consultas`.
- [ ] **[Vicente / Mar]** Es **S.L.P** (confirmado el 2 oct; la web ya lo dice bien). Faltan para el Aviso legal: el **número de inscripción de la sociedad en el Registro de Sociedades Profesionales** del Colegio de Enfermería (obligatorio por la Ley 2/2007; lo tiene el Colegio o la asesoría), **el colegio de Mar** (nombre exacto) y **su título y país de expedición** (LSSI, art. 10). Ya publicados: Registro Mercantil (Alicante, hoja A-191902, inscripción 1.ª) y n.º de colegiada 16700. Después, **Dev** los añade.
- [ ] **[Rafael]** Reenvío de `chisme@` a Gmail cuando se active El Chisme (el resto del correo en Gmail está hecho y probado el 8 oct, con SPF, DKIM y DMARC en PASS; ver `docs/configuracion-correo-profesional.md`).
- [ ] **[Mar + Rafael]** WhatsApp Business en el número nuevo (canal de consultas que abre Mar): nombre «Pomelo Baby» y foto, verificación en dos pasos, «Guardar en galería» desactivado, copia de seguridad desactivada o cifrada, y respuestas rápidas `/aviso` («en 5 minutos te llamo»), `/fotos` (cómo enviar fotos y vídeos con «ver una vez») y `/cierre`, con textos de Mar. Fotos y vídeos solo con «ver una vez»: Mar los abre al valorarlos, desde el móvil, y describe en el registro lo que ve; si llegan sin «ver una vez», los borra tras valorarlos. Al cerrar cada consulta: mensaje de cierre, pasar lo importante al registro en Clinic, borrar el chat y bloquear.
- [ ] **[Mar]** Confirmar el nombre exacto del proveedor «Clinic» (¿Clinic Cloud?) en la lista de proveedores de Privacidad. Aprobados el 7 oct: ayuda del teléfono en Contacto, frase de Cal.com, cambios de Privacidad y recordatorio de Cal.com 2 h antes. Mar bloquea en WhatsApp al terminar cualquier conversación, no solo las consultas.
- [ ] **[Rafael]** Cal.com: la disponibilidad ya está definida (12 oct) y Google Calendar de clinicapomelo@gmail.com comprueba conflictos con el calendario «Mar». Falta activar también **Pomelo — bloqueos**, si existe.

## Decisiones

- [ ] **[Mar]** ¿La web debe decir los 40 minutos de «Necesito un plan»? En Cal.com están en 40; la web solo dice los 20 minutos de la otra consulta. Sería texto nuevo.
- [ ] **[Mar + Rafael]** Decidir cuándo enseñar la web en redes (Mar quiere hacerlo pronto). La web ya está pública y las ventas siguen cerradas: antes, terminar la migración a Cloudflare (sección C), porque anunciar ventas en Vercel Hobby ya es uso comercial, y comprobar que todo lo visible es correcto (precios, «Próximamente», textos legales).

## Redacción y trabajo de Dev

- [ ] **[Gestor / abogado + Mar]** Revisar el borrador de las Condiciones de venta que Dev publicó el 12 oct en `src/pages/condiciones-venta.astro` (ya sin `noindex`): desistimiento, cancelaciones (2 reprogramaciones, hasta 24 h antes, reembolso con 48 h; el texto dice «sin perjuicio de los derechos que la ley te reconoce») y la nueva casilla de la consulta por correo (`src/lib/checkout-consent.ts`). Duda concreta: si «no se devuelve con menos de 48 h» es compatible con el desistimiento de 14 días antes de que se preste el servicio. Faltan los casos de ausencia y si cancela Mar con más detalle.
- [ ] **[Mar + Rafael]** «Cuéntame por correo» (la consulta de 19 €): E3 programada el 7 oct con máximo de 10 al día y pausa desde la web, `CONSULTA_CORREO_PAUSADA` (`docs/consulta-por-correo.md`). Textos aprobados por Mar y 10 todos los días de la semana. Probada en Sandbox el 7 oct. Falta decidir expresamente abrir el cobro Live (hoy solo Sandbox). Mar aprobó también los textos de WhatsApp de la confirmación y de «¡Recibido!».

## Facturas, horarios y formularios (12 oct 2026)

Hecho en el código el 12 oct: factura automática de Stripe en los dos checkouts (`src/lib/checkout-invoice.ts`), botón de descarga en `/guias/gracias`, bloqueo de la descarga si la guía está reembolsada, camino «Otro horario» (enlace en `/consultas`, formulario con campos propios y acuse), teléfono con prefijo y buscador de países. Diseño de la versión automática con respuesta de Mar: [`docs/ideas-horarios-alternativos.md`](docs/ideas-horarios-alternativos.md).

- [ ] **[Mar]** Aprobar los textos nuevos: enlace de `/consultas` («¿No te encaja ningún horario?…»), opción «Otro horario para una consulta», etiquetas, «Cómo funciona» y errores del formulario de horarios, ejemplo y errores del teléfono, lista de países «Más habituales», y los dos acuses (el de «Otro horario» no promete plazo; los demás, 24–48 h). Pendiente decidir si se quita la frase «24–48 horas laborables» del texto general de `/contacto`.
- [ ] **[Mar + Rafael]** Plantilla de respuesta en Gmail y filtro por el asunto `[Otro horario]`. Responder a una petición es manual: Mar añade una excepción por fecha en el horario de ese tipo en Cal.com y manda el enlace de `/consultas`.
- [ ] **[Rafael]** Cal.com: poner en la descripción de los dos eventos «¿No te encaja ningún horario? Escríbeme desde pomelobaby.es/contacto y buscamos otro.»; casilla obligatoria de aceptar las condiciones; confirmar «Necesito un plan» (horario de largas, 11:00 y 16:00, frecuencia 2 al día). Opcional: «reservas próximas por usuario» a 1, límite de reservas futuras y tope total por usuario (Settings → General, si aparece).
- [ ] **[Rafael]** Stripe: activar **Pagos efectuados** en Configuración → Empresa → Correos electrónicos de clientes (así llega la factura), y los datos fiscales de Piel de Pomelo para las facturas. Coste de Stripe por factura: 0,4 % con máximo de 2 $.
- [ ] **[Rafael + Dev]** Probar en Sandbox: compra de una guía (correo, botón de descarga, factura con «Enviar recibo» manual, reembolso y que la descarga se bloquee), y consulta por correo con el teléfono nuevo.
- [ ] **[Rafael + Dev]** Probar con las variables de Resend en `.env` (con `RESEND_TO_EMAIL` apuntando a un correo propio) el formulario de `/contacto` completo: aviso a Mar y acuse. Confirmar que la regla de límite de envíos de Cloudflare incluye `/api/contact`.
- [ ] **[Dev]** Probar el selector de prefijo (`src/lib/phone-prefix.ts`) con teclado, lector de pantalla, iPhone y Android.
- [ ] **[Gestor]** IVA de las guías: el código pone «IVA incluido (21 %)» (`GUIDE_VAT_RATE`); confirmar si son 4 % por libro electrónico. Consultas: exentas (art. 20.Uno.3.º de la Ley 37/1992, según Mar).
- [ ] **[Gestor + Dev]** Facturas de las reservas de Cal.com (49 y 89 €): no las genera el checkout. Opción: webhook de Cal.com y factura en Stripe pagada fuera de banda; antes, comprobar que Cal.com cobra con la misma cuenta de Stripe.
- [ ] **[Dev]** Borrar o conservar la maqueta `docs/show-me/06-selector-prefijo-telefono.html`.

# B. Pendiente: esperan a una respuesta o a otra tarea

## Esperan al gestor (correo enviado el 2 oct; si en una semana no responde, volver a escribirle)

- [ ] **[Gestor]** IVA o exención de guías y consultas, qué pone la factura y que los precios son finales. Se factura a Piel de Pomelo S.L.P con su NIF (ya confirmado). Guías de 4,90 a 14,90 € hoy, con previsión de llegar a 24,90 €; consultas de 19, 49 y 89 €.
- [ ] **[Gestor]** Revisar Aviso legal, Privacidad, Cookies, aviso sanitario del footer (Mar ya lo aprobó) y las capas de privacidad de los formularios. Mar lo prioriza («estar bien blindada legalmente»); Rafael lo ve opcional.
- [ ] **[Gestor]** Echar un vistazo a las Condiciones, el desistimiento y las cancelaciones cuando Rafael y Mar las tengan redactadas. Si nadie cualificado los mira y la web informa mal del desistimiento, la normativa de consumo suele ampliar el plazo de devolución.
- [ ] **[Mar + gestor]** Datos de salud: qué se guarda de cada consulta, cuánto tiempo y quién accede; canal seguro para fotos y vídeos (no Instagram); buzón restringido con MFA. Propuesta (7 oct): consultas también por WhatsApp Business; registro solo de texto en Clinic (el programa de historia clínica de Piel de Pomelo), 5 años desde el cierre de cada consulta (Ley 41/2002; la Comunitat Valenciana no fija otro plazo); fotos y vídeos con «ver una vez», sin conservarlos. Preguntar: si basta con describir la imagen en el registro, si conviene más plazo por tratarse de menores, y si WhatsApp Business es admisible para datos de salud de menores. Un gestor fiscal puede no llevar protección de datos: si no lo lleva, preguntar con quién verlo.

## Esperan a la clínica (prioridad de Mar para abrir consultas)

- [ ] **[Empresa]** Autorización sanitaria (titular, dirección, nº registral, U.2) con confirmación escrita de que cubre videollamada, formulario, correo y seguimiento. Después, **[Dev]** la publica.
- [ ] **[Empresa]** Confirmación escrita del seguro: sociedad, Mar, menores y atención remota.

## Esperan a lo anterior (Dev, salvo indicación)

- [ ] **[Rafael + Dev]** Con la revisión de las Condiciones y la respuesta del IVA: dejar definitivos los textos de `src/lib/checkout-consent.ts`, poner la URL de las Condiciones (`https://pomelobaby.es/condiciones-venta`) en Stripe **Sandbox y Live** (Settings → Public details) y decidir `tax_behavior` de los Prices.
- [ ] **[Dev + gestor]** Casilla de condiciones en la reserva de Cal.com, y reprogramaciones (hasta 2, hasta 24 h): Cal.com no las limita por sí mismo.
- [ ] **[Mar + Rafael]** Reservar y reembolsar una prueba de cada consulta de Cal.com, cuando haya disponibilidad: el cobro debe aparecer en el Stripe de Pomelo. En «Necesito hablar con calma», una de ellas eligiendo teléfono: recordatorio del Workflow 2 h antes, número en el calendario de Mar, videollamada de WhatsApp, cambio de hora y cancelación.
- [ ] **[Mar + Dev]** Compra real de 4,90 € (`conservacion-alimentos`): webhook 200 en Stripe, correo (¿spam en Gmail, Outlook y móvil?) y descarga; reembolsarla. Si cae en spam, revisar los informes DMARC: el `rua` ya está configurado y llegan a `dmarc@pomelobaby.es`. Después, `GUIDES_ENABLED = true` y push.
- [ ] **[Mar + Dev]** «Cuéntame por correo»: compra de prueba y compra real controlada antes de abrirla.
- [ ] **[Dev]** QA final: ya hecho enlaces (0 rotos), 404 (existe, sin enlace de vuelta; una 404 propia sería texto nuevo y la decide Mar), SEO (100), velocidad y Contacto en Production. Revisión manual de móvil, teclado y foco hecha por Rafael el 2 oct (funciona de 10 en móvil). Falta probar en Production los formularios que se abran.

# C. Migración a Cloudflare

Decidido el 2 oct 2026: Vercel Hobby no permite uso comercial (cobrar ni anunciar ventas). **Antes de cobrar o de enseñar la web en redes, la web tiene que estar en Cloudflare.** Lista completa, con tiempos de despliegue y de propagación del DNS: **[`TODO-cloudflare.md`](TODO-cloudflare.md)**.

# Más adelante

Verifactu: sin hacer nada hasta 2028 (Hacienda anunció el 5 oct 2026 el aplazamiento a octubre de 2028; falta el BOE). Reembolso automático ante un aviso de fraude de Stripe y respuesta de Mar con un clic para las peticiones de otro horario (diseño en `docs/ideas-horarios-alternativos.md`). 2FA en Cloudflare, Resend, DonDominio y GitHub, y DMARC estricto cuando SPF y DKIM lleven un tiempo en PASS.

El Chisme (Mar: 3 ediciones y el primer Broadcast con enlace de baja; limpiar los 2 contactos de prueba de Resend; el flujo de alta, confirmación, baja y reactivación ya está probado en local), Manual de supervivencia (PDF de Mar) y fuentes en los artículos de salud.

## Documentación

[Cal.com](docs/configuracion-cal-com.md) · [Ideas de horarios](docs/ideas-horarios-alternativos.md) · [Resend](docs/configuracion-resend.md) · [Correo profesional](docs/configuracion-correo-profesional.md) · [Doble opt-in](docs/arquitectura-doble-opt-in.md) · [El Chisme](docs/estrategia-blog-y-el-chisme.md) · [Guías de pago](docs/guias-de-pago.md) · [Consulta por correo](docs/consulta-por-correo.md) · [Archivos sanitarios](docs/canales-archivos-consultas.md) · [Enlaces](docs/urls.md)
