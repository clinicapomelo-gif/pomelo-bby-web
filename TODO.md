# TODO — Pomelo Baby

Solo lo que bloquea o tiene fecha. Última revisión: 2 oct 2026.

**Estado:** web publicada. Guías, consultas y El Chisme apagados por código (`GUIDES_ENABLED`, `CONSULTATIONS_ENABLED`, `CHISME_ENABLED`; la guía gratuita tiene el suyo, `FREE_GUIDES_ENABLED`). Stripe Live y Vercel Production listos para las guías, probadas en Sandbox (`docs/guias-de-pago.md`). Cal.com configurado (precios 49 € y 89 €) salvo la disponibilidad (`docs/configuracion-cal-com.md`). Mar envió el 2 oct el correo al gestor. Migración a Cloudflare en curso en la rama `cloudflare` (`TODO-cloudflare.md`). Los textos actuales los ha revisado Mar: no se tocan.

# A. Podemos hacer ahora mismo

No dependen de ninguna respuesta externa.

## Esta semana, con fecha

Production (push del 2 oct 2026) tiene el aviso de error de Contacto, los datos de empresa con el Registro Mercantil, `noindex` de las Condiciones y el precio de 89 €, y sigue sin poder cobrarse nada.

- [ ] **[Rafael + Dev]** **5 oct:** activar la guía gratuita: `FREE_GUIDES_ENABLED = true` en `src/data/guias.ts`, quitar `"downloadEnabled": false` en `src/data/guias.json`, build y push. `GUIDES_ENABLED` se queda en `false`.

## Pequeñas, de una sesión

- [ ] **[Mar]** Respuesta rápida de Instagram que derive las dudas de salud a `/consultas`.
- [ ] **[Vicente / Mar]** Es **S.L.P** (confirmado el 2 oct; la web ya lo dice bien). Faltan para el Aviso legal: el **número de inscripción de la sociedad en el Registro de Sociedades Profesionales** del Colegio de Enfermería (obligatorio por la Ley 2/2007; lo tiene el Colegio o la asesoría), **el colegio de Mar** (nombre exacto) y **su título y país de expedición** (LSSI, art. 10). Ya publicados: Registro Mercantil (Alicante, hoja A-191902, inscripción 1.ª) y n.º de colegiada 16700. Después, **Dev** los añade.
- [ ] **[Rafael]** SPF de la raíz en DonDominio: hoy es `v=spf1 include:spf.dondominio.com`, sin cierre. Añadir ` ~all` al final, para que el correo que suplante el dominio cuente como sospechoso. No hay que tocar el SPF de `send` (Resend), que ya lo tiene.
- [ ] **[Rafael + Mar]** Correo profesional: los buzones `hola@` y `mar@pomelobaby.es` ya funcionan. Falta integrarlos con Gmail: redirigirlos a una cuenta de Gmail dedicada y configurar **Enviar como** con el SMTP de DonDominio (pasos en `docs/configuracion-correo-profesional.md`).
- [ ] **[Mar + Rafael]** Cal.com: conectar Google Calendar como calendario de conflictos (el de Mar y **Pomelo — bloqueos**; ya hay una cuenta de destino, clinicapomelo@gmail.com) y definir la disponibilidad real.

## Decisiones

- [ ] **[Mar]** ¿La web debe decir los 40 minutos de «Necesito un plan»? En Cal.com están en 40; la web solo dice los 20 minutos de la otra consulta. Sería texto nuevo.
- [ ] **[Mar + Rafael]** Decidir cuándo enseñar la web en redes (Mar quiere hacerlo pronto). La web ya está pública y las ventas siguen cerradas: antes, terminar la migración a Cloudflare (sección C), porque anunciar ventas en Vercel Hobby ya es uso comercial, y comprobar que todo lo visible es correcto (precios, «Próximamente», textos legales).
- [ ] **[Mar + Rafael]** Decidir la propuesta E3 para «Cuéntame por correo» (ver abajo). Si se aprueba, **Dev** puede construirla sin esperar al gestor.

## Redacción y trabajo de Dev

- [ ] **[Rafael + Mar + Dev]** Redactar las Condiciones de venta (hoy placeholder), el texto del desistimiento y la confirmación del contrato, con las cancelaciones: Mar decidió 2 reprogramaciones, hasta 24 h antes, y reembolso con 48 h; faltan los casos de 24–48 h, menos de 24 h, ausencia y si cancela Mar. Dev puede preparar un borrador con los datos reales para revisión.
- [ ] **[Mar + Dev]** «Cuéntame por correo» (la consulta de 19 €): hoy depende de que la familia vuelva a la web. Propuesta E3: el pago avisa a Mar y a la familia por webhook, el formulario se mantiene con 3 reintentos y, si falla, texto copiable y botón de correo preparado; sin guardar el caso en ningún servidor. Incluye arreglar tres fallos actuales (redirige a /consultas si Stripe tarda, JSON crudo si el correo no coincide o falla el envío) y que un pago reembolsado no permita enviar caso. Mar escribe los correos que recibe la familia. Diseño y casos de uso en la página «Consulta por correo» de Claude. El checkout Live sigue cerrado hasta tenerlo.

# B. Pendiente: esperan a una respuesta o a otra tarea

## Esperan al gestor (correo enviado el 2 oct; si en una semana no responde, volver a escribirle)

- [ ] **[Gestor]** IVA o exención de guías y consultas, qué pone la factura y que los precios son finales. Se factura a Piel de Pomelo S.L.P con su NIF (ya confirmado). Guías de 4,90 a 14,90 € hoy, con previsión de llegar a 24,90 €; consultas de 19, 49 y 89 €.
- [ ] **[Gestor]** Revisar Aviso legal, Privacidad, Cookies, aviso sanitario del footer (Mar ya lo aprobó) y las capas de privacidad de los formularios. Mar lo prioriza («estar bien blindada legalmente»); Rafael lo ve opcional.
- [ ] **[Gestor]** Echar un vistazo a las Condiciones, el desistimiento y las cancelaciones cuando Rafael y Mar las tengan redactadas. Si nadie cualificado los mira y la web informa mal del desistimiento, la normativa de consumo suele ampliar el plazo de devolución.
- [ ] **[Mar + gestor]** Datos de salud: qué se guarda de cada consulta, cuánto tiempo y quién accede; canal seguro para fotos y vídeos (no Instagram); buzón restringido con MFA. Un gestor fiscal puede no llevar protección de datos: si no lo lleva, preguntar con quién verlo.

## Esperan a la clínica (prioridad de Mar para abrir consultas)

- [ ] **[Empresa]** Autorización sanitaria (titular, dirección, nº registral, U.2) con confirmación escrita de que cubre videollamada, formulario, correo y seguimiento. Después, **[Dev]** la publica.
- [ ] **[Empresa]** Confirmación escrita del seguro: sociedad, Mar, menores y atención remota.

## Esperan a lo anterior (Dev, salvo indicación)

- [ ] **[Dev]** Con las Condiciones y la respuesta del IVA: sustituir el texto provisional de `src/lib/checkout-consent.ts`, publicar las Condiciones, poner su URL en Stripe **Live** (Settings → Public details) y decidir `tax_behavior` de los Prices. **Quitar el `noindex` de `/condiciones-venta`** al publicarlas.
- [ ] **[Dev + gestor]** Casilla de condiciones en la reserva de Cal.com, y reprogramaciones (hasta 2, hasta 24 h): Cal.com no las limita por sí mismo.
- [ ] **[Mar + Rafael]** Reservar y reembolsar una prueba de cada consulta de Cal.com, cuando haya disponibilidad: el cobro debe aparecer en el Stripe de Pomelo.
- [ ] **[Mar + Dev]** Compra real de 4,90 € (`conservacion-alimentos`): webhook 200 en Stripe, correo (¿spam en Gmail, Outlook y móvil?) y descarga; reembolsarla. Si cae en spam, revisar los informes DMARC: el `rua` ya está configurado y llegan a `dmarc@pomelobaby.es`. Después, `GUIDES_ENABLED = true` y push.
- [ ] **[Mar + Dev]** «Cuéntame por correo»: compra de prueba y compra real controlada antes de abrirla.
- [ ] **[Dev]** QA final: ya hecho enlaces (0 rotos), 404 (existe, sin enlace de vuelta; una 404 propia sería texto nuevo y la decide Mar), SEO (100), velocidad y Contacto en Production. Revisión manual de móvil, teclado y foco hecha por Rafael el 2 oct (funciona de 10 en móvil). Falta probar en Production los formularios que se abran.

# C. Migración a Cloudflare

Decidido el 2 oct 2026: Vercel Hobby no permite uso comercial (cobrar ni anunciar ventas). **Antes de cobrar o de enseñar la web en redes, la web tiene que estar en Cloudflare.** Lista completa, con tiempos de despliegue y de propagación del DNS: **[`TODO-cloudflare.md`](TODO-cloudflare.md)**.

# Más adelante

El Chisme (Mar: 3 ediciones y el primer Broadcast con enlace de baja; limpiar los 2 contactos de prueba de Resend; el flujo de alta, confirmación, baja y reactivación ya está probado en local), Manual de supervivencia (PDF de Mar) y fuentes en los artículos de salud.

## Documentación

[Cal.com](docs/configuracion-cal-com.md) · [Resend](docs/configuracion-resend.md) · [Correo profesional](docs/configuracion-correo-profesional.md) · [Doble opt-in](docs/arquitectura-doble-opt-in.md) · [El Chisme](docs/estrategia-blog-y-el-chisme.md) · [Guías de pago](docs/guias-de-pago.md) · [Archivos sanitarios](docs/canales-archivos-consultas.md) · [Enlaces](docs/urls.md)
