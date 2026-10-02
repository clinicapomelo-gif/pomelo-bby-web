# TODO — Pomelo Baby

Solo lo que bloquea o tiene fecha. Última revisión: 2 oct 2026.

**Estado:** web publicada. Guías, consultas y El Chisme apagados por código (`GUIDES_ENABLED`, `CONSULTATIONS_ENABLED`, `CHISME_ENABLED`; la guía gratuita tiene el suyo, `FREE_GUIDES_ENABLED`). Stripe Live y Vercel Production listos para las guías, probadas en Sandbox (`docs/guias-de-pago.md`). Cal.com configurado salvo la disponibilidad (`docs/configuracion-cal-com.md`). Los textos actuales los ha revisado Mar: no se tocan.

## Esta semana

- [ ] **[Rafael]** Hacer push. El `pull --rebase` ya está hecho: hay 12 commits locales sin subir (mapeos Stripe Live, flag de la gratuita, aviso de error de Contacto, datos de empresa, casilla de Stripe, `noindex` de las Condiciones y documentación). Tiene que subirse antes de activar la guía gratuita el lunes 5.
- [ ] **[Rafael + Dev]** **5 oct:** activar la guía gratuita: `FREE_GUIDES_ENABLED = true` en `src/data/guias.ts`, quitar `"downloadEnabled": false` en `src/data/guias.json`, build y push. `GUIDES_ENABLED` se queda en `false`.
- [ ] **[Mar]** Respuesta rápida de Instagram que derive las dudas de salud a `/consultas`.
- [ ] **[Mar]** Enviar al gestor el correo de revisión (versión final: IVA y facturas, datos de salud, textos publicados y clínica). Rafael y Mar redactan ellos las Condiciones de venta, el desistimiento y las cancelaciones, y se las pasan después para que les echen un vistazo.
- [ ] **[Mar + Rafael]** Decidir cuándo enseñar la web en redes (Mar quiere hacerlo pronto). La web ya está pública y las ventas siguen cerradas: antes, comprobar que todo lo visible es correcto (precios, «Próximamente», textos legales) y que el límite de envíos de Vercel sigue en modo registro.
- [ ] **[Rafael / Vicente]** Datos del Registro Mercantil de Piel de Pomelo S.L.P; después **[Dev]** los añade al Aviso legal.

## Para cobrar guías

- [ ] **[Rafael + Mar + Dev]** Redactar las Condiciones de venta (hoy placeholder), el texto del desistimiento y la confirmación del contrato, con las cancelaciones: Mar decidió 2 reprogramaciones, hasta 24 h antes, y reembolso con 48 h; faltan los casos de 24–48 h, menos de 24 h, ausencia y si cancela Mar. Dev puede preparar un borrador con los datos reales para revisión. Después, **[Gestor]** les echa un vistazo (riesgo si nadie cualificado los mira: si la web informa mal del desistimiento, la normativa de consumo suele ampliar el plazo de devolución).
- [ ] **[Gestor]** IVA o exención de guías y consultas, qué pone la factura y que los precios son finales. Se factura a Piel de Pomelo S.L.P con su NIF (ya confirmado). Guías hoy de 4,90 a 14,90 €, con previsión de llegar a 24,90 €; consultas de 19, 49 y 89 €.
- [ ] **[Dev]** Con esas respuestas: sustituir el texto provisional de `src/lib/checkout-consent.ts`, publicar las Condiciones, poner su URL en Stripe **Live** (Settings → Public details) y decidir `tax_behavior` de los Prices. **Quitar el `noindex` de `/condiciones-venta`** al publicarlas.
- [ ] **[Gestor]** Revisar Aviso legal, Privacidad, Cookies, aviso sanitario del footer (Mar ya lo aprobó) y las capas de privacidad de los formularios. Mar lo prioriza («estar bien blindada legalmente»); Rafael lo ve opcional.
- [ ] **[Rafael]** El enlace al Código Deontológico del Aviso legal (`consejogeneralenfermeria.org/codigo-deontologico`) da **404**. Localizar en su web, desde el navegador, la dirección actual: en 2025 se aprobó un código nuevo, el «Código Ético y Deontológico de la Enfermera Española» (Resolución 5/2025), que puede sustituir al citado. La asesoría confirma qué documento citar y yo actualizo el enlace.
- [ ] **[Mar + Dev]** Compra real de 4,90 € (`conservacion-alimentos`): webhook 200 en Stripe, correo (¿spam en Gmail, Outlook y móvil?) y descarga; reembolsarla. Si cae en spam: añadir `rua` al DMARC. Después, `GUIDES_ENABLED = true` y push.

## Para abrir consultas

Prioridad de Mar: los dos primeros.

- [ ] **[Empresa]** Autorización sanitaria (titular, dirección, nº registral, U.2) con confirmación escrita de que cubre videollamada, formulario, correo y seguimiento. **[Dev]** la publica.
- [ ] **[Empresa]** Confirmación escrita del seguro: sociedad, Mar, menores y atención remota.
- [ ] **[Mar + gestor]** Datos de salud: qué se guarda de cada consulta, cuánto tiempo y quién accede; canal seguro para fotos y vídeos (no Instagram); buzón restringido con MFA. Un gestor fiscal puede no llevar protección de datos: si no lo lleva, preguntar con quién verlo.
- [ ] **[Mar + Dev]** «Cuéntame por correo» (la consulta de 19 €): hoy depende de que la familia vuelva a la web. Propuesta E3: el pago avisa a Mar y a la familia por webhook, el formulario se mantiene con 3 reintentos y, si falla, texto copiable y botón de correo preparado; sin guardar el caso en ningún servidor. Revisar también tres fallos actuales (redirige a /consultas si Stripe tarda, JSON crudo si el correo no coincide o falla el envío) y que un pago reembolsado no permita enviar caso. Mar escribe los correos que recibe la familia. Diseño y casos de uso en la página «Consulta por correo» de Claude. Mantiene cerrado el checkout Live hasta tenerlo.
- [ ] **[Rafael]** Cambiar en Cal.com el precio de «Necesito un plan» de 99 € a **89 €**, que es lo que ha decidido Mar y lo que ya publica la web. Mientras no se cambie, la web y Cal.com no coinciden.
- [ ] **[Mar + Rafael]** Cal.com: conectar Google Calendar como calendario de conflictos (el de Mar y **Pomelo — bloqueos**; ya hay una cuenta de destino, clinicapomelo@gmail.com), definir la disponibilidad y reservar y reembolsar una prueba de cada consulta. El cobro debe aparecer en el Stripe de Pomelo.
- [ ] **[Dev + asesoría]** Casilla de condiciones en la reserva de Cal.com, y reprogramaciones (hasta 2, hasta 24 h): Cal.com no las limita por sí mismo.
- [ ] **[Mar]** ¿La web debe decir los 40 minutos de «Necesito un plan»? Pendiente: sería texto nuevo.
- [ ] **[Rafael + Mar]** Correo profesional: los buzones `hola@` y `mar@pomelobaby.es` ya funcionan. Falta integrarlos con Gmail: redirigirlos a una cuenta de Gmail dedicada y configurar **Enviar como** con el SMTP de DonDominio para responder desde cada dirección (pasos en `docs/configuracion-correo-profesional.md`).

## Antes de anunciar

- [ ] **[Dev]** QA final: ya hecho enlaces (0 rotos), 404 (existe, sin enlace de vuelta; una 404 propia sería texto nuevo y la decide Mar), SEO (100), velocidad y Contacto en Production. Falta la revisión manual de móvil, teclado y foco, y probar en Production los formularios que se abran.

## Más adelante

Pasar la regla de Vercel `Limitar formularios` de `log` a `deny` cuando se vea el tráfico real. El Chisme (Mar: 3 ediciones y el primer Broadcast con enlace de baja; limpiar los 2 contactos de prueba de Resend. El flujo de alta, confirmación, baja y reactivación ya está probado en local), Manual de supervivencia (PDF de Mar) y fuentes en los artículos de salud.

## Documentación

[Cal.com](docs/configuracion-cal-com.md) · [Resend](docs/configuracion-resend.md) · [Correo profesional](docs/configuracion-correo-profesional.md) · [Doble opt-in](docs/arquitectura-doble-opt-in.md) · [El Chisme](docs/estrategia-blog-y-el-chisme.md) · [Guías de pago](docs/guias-de-pago.md) · [Archivos sanitarios](docs/canales-archivos-consultas.md)
