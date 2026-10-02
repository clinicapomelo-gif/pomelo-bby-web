# TODO — Pomelo Baby

Solo lo que bloquea o tiene fecha. Última revisión: 2 oct 2026.

**Estado:** web publicada. Guías, consultas y El Chisme apagados por código (`GUIDES_ENABLED`, `CONSULTATIONS_ENABLED`, `CHISME_ENABLED`; la guía gratuita tiene el suyo, `FREE_GUIDES_ENABLED`). Stripe Live y Vercel Production listos para las guías, probadas en Sandbox (`docs/guias-de-pago.md`). Cal.com configurado (precios 49 € y 89 €) salvo la disponibilidad (`docs/configuracion-cal-com.md`). Mar envió el 2 oct el correo al gestor. Los textos actuales los ha revisado Mar: no se tocan.

# A. Podemos hacer ahora mismo

No dependen de ninguna respuesta externa.

## Esta semana, con fecha

Push hecho el 2 oct 2026 (`d07042b`): Production tiene el aviso de error de Contacto, los datos de empresa, `noindex` de las Condiciones y el precio de 89 €, y sigue sin poder cobrarse nada.

- [ ] **[Rafael + Dev]** **5 oct:** activar la guía gratuita: `FREE_GUIDES_ENABLED = true` en `src/data/guias.ts`, quitar `"downloadEnabled": false` en `src/data/guias.json`, build y push. `GUIDES_ENABLED` se queda en `false`.

## Pequeñas, de una sesión

- [ ] **[Mar]** Respuesta rápida de Instagram que derive las dudas de salud a `/consultas`.
- [ ] **[Rafael]** El enlace al Código Deontológico del Aviso legal (`consejogeneralenfermeria.org/codigo-deontologico`) da **404**. Localizar en su web, desde el navegador, la dirección actual: en 2025 se aprobó el «Código Ético y Deontológico de la Enfermera Española» (Resolución 5/2025), que puede sustituir al citado. El gestor confirma qué documento citar y Dev actualiza el enlace.
- [ ] **[Rafael / Vicente]** Buscar los datos de inscripción en el Registro Mercantil de Piel de Pomelo S.L.P (provincia, tomo, folio, hoja e inscripción; están en la escritura o en una nota simple).
- [ ] **[Rafael + Mar]** Correo profesional: los buzones `hola@` y `mar@pomelobaby.es` ya funcionan. Falta integrarlos con Gmail: redirigirlos a una cuenta de Gmail dedicada y configurar **Enviar como** con el SMTP de DonDominio (pasos en `docs/configuracion-correo-profesional.md`).
- [ ] **[Mar + Rafael]** Cal.com: conectar Google Calendar como calendario de conflictos (el de Mar y **Pomelo — bloqueos**; ya hay una cuenta de destino, clinicapomelo@gmail.com) y definir la disponibilidad real.

## Decisiones

- [ ] **[Mar + Rafael]** **Decidir el alojamiento antes de cobrar y antes de enseñar la web en redes.** Vercel Hobby es solo para uso personal no comercial (comprobado en su documentación el 2 oct 2026), y cuenta como comercial cualquier cobro y también anunciar la venta de un producto o servicio. Opciones: pasar a **Vercel Pro** (20 $/mes con 1 usuario que despliega y 20 $ de crédito de uso, sin cambios de código) o **migrar a Cloudflare** (plan en «A evaluar»). Mi recomendación: Pro ahora, y valorar Cloudflare después como proyecto aparte.
- [ ] **[Mar]** ¿La web debe decir los 40 minutos de «Necesito un plan»? En Cal.com están en 40; la web solo dice los 20 minutos de la otra consulta. Sería texto nuevo.
- [ ] **[Mar + Rafael]** Decidir cuándo enseñar la web en redes (Mar quiere hacerlo pronto). La web ya está pública y las ventas siguen cerradas: antes, comprobar que todo lo visible es correcto (precios, «Próximamente», textos legales) y que el límite de envíos de Vercel sigue en modo registro.
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
- [ ] **[Dev]** Añadir los datos del Registro Mercantil al Aviso legal cuando se encuentren.
- [ ] **[Dev + gestor]** Casilla de condiciones en la reserva de Cal.com, y reprogramaciones (hasta 2, hasta 24 h): Cal.com no las limita por sí mismo.
- [ ] **[Mar + Rafael]** Reservar y reembolsar una prueba de cada consulta de Cal.com, cuando haya disponibilidad: el cobro debe aparecer en el Stripe de Pomelo.
- [ ] **[Mar + Dev]** Compra real de 4,90 € (`conservacion-alimentos`): webhook 200 en Stripe, correo (¿spam en Gmail, Outlook y móvil?) y descarga; reembolsarla. Si cae en spam: añadir `rua` al DMARC. Después, `GUIDES_ENABLED = true` y push.
- [ ] **[Mar + Dev]** «Cuéntame por correo»: compra de prueba y compra real controlada antes de abrirla.
- [ ] **[Dev]** QA final: ya hecho enlaces (0 rotos), 404 (existe, sin enlace de vuelta; una 404 propia sería texto nuevo y la decide Mar), SEO (100), velocidad y Contacto en Production. Revisión manual de móvil, teclado y foco hecha por Rafael el 2 oct (funciona de 10 en móvil). Falta probar en Production los formularios que se abran.

# A evaluar

- [ ] **[Mar + Rafael]** Migrar de Vercel a **Cloudflare**: web en Workers con `@astrojs/cloudflare` (requiere Astro 6 o superior; aquí hay Astro 7.2.4, por comprobar), PDF de Vercel Blob a **R2** (10 GB gratis, 1 millón de operaciones de escritura y 10 millones de lectura al mes, y descarga sin coste), DonDominio para dominio y correo. Motivos: Hobby no permite uso comercial, y el almacén Blob de Hobby tiene 1 GB, 10 GB de transferencia y 10.000 operaciones simples al mes, y al pasarse deja de funcionar 30 días. El plan propuesto es válido pero omite trabajo:
  - Código: 4 archivos usan `@vercel/blob` (`guide-delivery.ts` y los tres endpoints de descarga) más `scripts/guide-catalog.mjs`; 7 archivos leen `VERCEL_ENV` o `VERCEL_URL` para distinguir producción y preview; 18 leen secretos con `import.meta.env` (en Workers van por bindings y `wrangler`); `@vercel/analytics` en el layout.
  - Mantener las claves actuales de los PDF en R2 (hay 14 archivos, 28,5 MiB, incluidas versiones antiguas que el catálogo referencia).
  - Probar que los SDK de Stripe y Resend funcionan con `nodejs_compat`, y que el plan gratuito de Workers (100.000 peticiones al día, 10 ms de CPU por petición sin contar la espera de red) alcanza para el webhook.
  - DNS: pasar los nameservers a Cloudflare exige replicar todos los registros de DonDominio (MX, SPF, DKIM, DMARC, los de Resend y la verificación de Search Console), o se rompe el correo.
  - Reproducir el límite de envíos (WAF de Cloudflare), el despliegue desde GitHub y los entornos de preview. Repetir las pruebas de pago, webhook, correo y descarga.
  - Más adelante, si se quiere: descargas con PDF identificado por comprador (trazabilidad); revisar antes la parte legal.

# Más adelante

Pasar la regla de Vercel `Limitar formularios` de `log` a `deny` cuando se vea el tráfico real. El Chisme (Mar: 3 ediciones y el primer Broadcast con enlace de baja; limpiar los 2 contactos de prueba de Resend; el flujo de alta, confirmación, baja y reactivación ya está probado en local), Manual de supervivencia (PDF de Mar) y fuentes en los artículos de salud.

## Documentación

[Cal.com](docs/configuracion-cal-com.md) · [Resend](docs/configuracion-resend.md) · [Correo profesional](docs/configuracion-correo-profesional.md) · [Doble opt-in](docs/arquitectura-doble-opt-in.md) · [El Chisme](docs/estrategia-blog-y-el-chisme.md) · [Guías de pago](docs/guias-de-pago.md) · [Archivos sanitarios](docs/canales-archivos-consultas.md) · [Enlaces](docs/urls.md)
