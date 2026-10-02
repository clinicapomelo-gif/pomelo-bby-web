# Compra y entrega de guías de pago

Las guías de pago usan Stripe como registro de la compra, Resend para el correo y un bucket privado de Cloudflare R2 (`pomelo-guias`, binding `GUIAS`) para los PDF. La aplicación no mantiene una base de datos propia de pedidos.

## Variables de entorno

En local van en `.env` (o `.dev.vars`); en Cloudflare, como secretos de cada Worker: `npx wrangler secret put <NOMBRE> --env production|preview`. Nunca guardar valores reales en Git.

| Variable | Uso |
| --- | --- |
| `SITE_URL` | URL pública usada en los retornos de Stripe y los enlaces de descarga. |
| `STRIPE_SECRET_KEY` | Clave test o live del entorno actual. Una clave test se rechaza en Production. |
| `STRIPE_CATALOG_KEY` | Clave restringida `rk_test_` usada solo al provisionar desde Development. |
| `STRIPE_WEBHOOK_SECRET` | Firma del endpoint `/api/webhook` del entorno actual. |
| `RESEND_API_KEY` | Envío del correo de entrega. |
| `RESEND_FROM_EMAIL` | Remitente perteneciente a un dominio verificado. |
| `APP_ENV` | `production` o `preview`, fijado en `wrangler.jsonc`. Sin valor es desarrollo local. |

R2 no necesita credenciales en la web: el Worker accede por el binding `GUIAS`. Los scripts de alta usan la sesión de `npx wrangler login`. Los Product ID, Price ID y `blobKey` no son secretos, pero deben corresponder al mismo producto y entorno.

## Provisionar una guía nueva

La fuente editable es `src/data/guias.json`; `src/data/guias.ts` solo expone el catálogo a la aplicación. La automatización no extrae ni inventa contenido sanitario del PDF: solicita título, tipo (`practical` o `complete`), número de páginas, categoría, descripción, tres beneficios aprobados y precio.

Guardar una clave restringida `rk_test_` como `STRIPE_CATALOG_KEY` en el `.env` local e iniciar sesión en Cloudflare con `npx wrangler login`. Después ejecutar primero el dry-run:

```bash
node --env-file=.env scripts/guide-catalog.mjs provision --pdf /ruta/guia.pdf
node --env-file=.env scripts/guide-catalog.mjs provision --pdf /ruta/guia.pdf --apply
```

El segundo comando vuelve a pedir `APLICAR`, sube el PDF privado con una clave basada en su SHA-256, crea o reutiliza Product y Price en Stripe test, actualiza el catálogo de forma atómica y ejecuta el build. La guía queda en `testing`; solo debe cambiarse manualmente a `available` después de una compra test completa.

Para cambiar un precio test sin romper compras anteriores:

```bash
node --env-file=.env scripts/guide-catalog.mjs price <guiaId> --price 5,99
node --env-file=.env scripts/guide-catalog.mjs price <guiaId> --price 5,99 --apply
```

La automatización no sustituye PDF existentes ni opera en Stripe live. La activación live continúa siendo manual.

## Actualizar el PDF de una guía

Las revisiones conservan el PDF anterior para no romper compras históricas. `blobKey` identifica la versión actual y `previousBlobKeys` contiene las versiones anteriores, que deben permanecer privadas e inmutables.

Para publicar una revisión:

1. Subir el PDF nuevo con una clave basada en su SHA-256 y sin sobrescribir ningún PDF de R2.
2. Mover el `blobKey` anterior a `previousBlobKeys` y asignar la clave nueva a `blobKey`.
3. Validar el catálogo y ejecutar el build.
4. Probar una compra nueva y la descarga de una sesión anterior.

`guide:provision` no automatiza revisiones. No deben borrarse los PDF históricos de R2 al caducar los 30 días, porque soporte puede ampliar posteriormente una descarga.

## Flujo y seguridad

- El navegador solo envía `guiaId`; precio, Price ID y PDF se resuelven en servidor según el modo Stripe.
- El checkout comprueba que el webhook, el correo y el PDF privado están disponibles antes de cobrar.
- Checkout guarda el Price ID y `blobKey` exactos de la compra; el webhook verifica firma, entorno, pago y línea de compra antes de entregar.
- Los Price ID y PDF anteriores se conservan para no romper descargas históricas; no se emparejan por posición, sino mediante la copia exacta guardada en cada compra.
- Resend usa la sesión como clave de idempotencia y Stripe conserva `deliveryEmailId`, `deliveredAt` y `downloadExpiresAt` en metadata.
- El correo enlaza a `/api/guias/download`; nunca expone `blobKey`.
- La descarga vuelve a verificar el pago y caduca 30 días después de crear la sesión, salvo que soporte amplíe `downloadExpiresAt` en Stripe.
- Los logs no deben contener emails, URLs de descarga ni IDs completos de Checkout Session.

## Prueba mínima

1. Confirmar que una guía `coming-soon` devuelve `409` y no abre Stripe.
2. Confirmar que una firma de webhook inválida devuelve `400`.
3. Completar un pago test y comprobar que llega un solo correo.
4. Reenviar el mismo evento y comprobar que Resend no duplica la entrega.
5. Descargar el PDF con el enlace recibido.
6. Probar `/tienda/gracias` y la descarga con una sesión inventada.
7. Simular un fallo de Resend o R2 y comprobar que no se muestran detalles sensibles.
8. Ejecutar `npm run guides:test` y `npm run build`.

## Probar en local con Sandbox

Sirve para probar las guías sin dinero real y sin Preview, con el mismo runtime de Cloudflare. Necesita `STRIPE_SECRET_KEY=sk_test_...` y `RESEND_API_KEY` en `.env` (Wrangler lo carga solo si no hay `.dev.vars`) y la Stripe CLI conectada al Sandbox.

1. Cargar en el R2 local los PDF que se vayan a probar (empieza vacío): `npx wrangler r2 object put pomelo-guias/<blobKey> --file <pdf> --content-type application/pdf --local --persist-to .wrangler/state`.
2. Poner `GUIDES_ENABLED = true` en `src/data/guias.ts` solo en local. No se commitea; hay que revertirlo al terminar.
3. Construir y arrancar el Worker: `npx astro build`, después `npx wrangler dev --config dist/server/wrangler.json --port 8788 --persist-to .wrangler/state --var STRIPE_WEBHOOK_SECRET:$(stripe listen --print-secret)`.
4. Reenviar los webhooks: `stripe listen --forward-to localhost:8788/api/webhook`.
5. Comprar cada guía en `localhost:8788/guias/<id>` con la tarjeta `4242 4242 4242 4242`, fecha futura, CVC cualquiera y un email propio.
6. Comprobar página de gracias, un solo correo (revisar Spam), PDF correcto y los metadatos `deliveryEmailId`, `deliveredAt` y `downloadExpiresAt` de la sesión en Stripe.

Las claves de R2 deben ser ASCII: las claves con tildes (sobre todo si vienen de un Mac, en forma Unicode descompuesta) pueden no encontrarse. El enlace del correo usa `SITE_URL`, que en local es `localhost`, así que los correos de prueba pueden caer en spam aunque los de producción no.

Para soporte, buscar la compra por email o referencia en Stripe, comprobar la metadata de entrega en Resend y ampliar `downloadExpiresAt` si corresponde.
