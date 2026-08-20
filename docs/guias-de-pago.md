# Compra y entrega de guías de pago

Las guías de pago usan Stripe como registro de la compra, Resend para el correo y un almacén privado de Vercel Blob para los PDF. La aplicación no mantiene una base de datos propia de pedidos.

## Variables de entorno

Configurar estos valores en local y en los entornos de Vercel que correspondan. Nunca guardar valores reales en Git.

| Variable | Uso |
| --- | --- |
| `SITE_URL` | URL pública usada en los retornos de Stripe y los enlaces de descarga. |
| `STRIPE_SECRET_KEY` | Clave test o live del entorno actual. Una clave test se rechaza en Production. |
| `STRIPE_CATALOG_KEY` | Clave restringida `rk_test_` usada solo al provisionar desde Development. |
| `STRIPE_WEBHOOK_SECRET` | Firma del endpoint `/api/webhook` del entorno actual. |
| `RESEND_API_KEY` | Envío del correo de entrega. |
| `RESEND_FROM_EMAIL` | Remitente perteneciente a un dominio verificado. |
| `BLOB_STORE_ID` | Identificador del almacén privado conectado al proyecto. |
| `VERCEL_OIDC_TOKEN` | Credencial temporal inyectada automáticamente por Vercel para acceder a Blob. |
| `BLOB_READ_WRITE_TOKEN` | Alternativa solo para desarrollo local cuando no hay OIDC. |

En Vercel se prioriza OIDC para no mantener una credencial Blob de larga duración. Los Product ID, Price ID y `blobKey` no son secretos, pero deben corresponder al mismo producto y entorno.

## Provisionar una guía nueva

La fuente editable es `src/data/guias.json`; `src/data/guias.ts` solo expone el catálogo a la aplicación. La automatización no extrae ni inventa contenido sanitario del PDF: solicita título, categoría, descripción, tres beneficios aprobados y precio.

Configurar una clave restringida `rk_test_` como `STRIPE_CATALOG_KEY` únicamente en Vercel Development. Después ejecutar primero el dry-run:

```bash
npx --yes vercel@latest env run -e development -- npm run guide:provision
npx --yes vercel@latest env run -e development -- npm run guide:provision -- --apply
```

El segundo comando vuelve a pedir `APLICAR`, sube el PDF privado con una clave basada en su SHA-256, crea o reutiliza Product y Price en Stripe test, actualiza el catálogo de forma atómica y ejecuta el build. La guía queda en `testing`; solo debe cambiarse manualmente a `available` después de una compra test completa.

Para cambiar un precio test sin romper compras anteriores:

```bash
npx --yes vercel@latest env run -e development -- npm run guide:price -- <guiaId> --price 5,99
npx --yes vercel@latest env run -e development -- npm run guide:price -- <guiaId> --price 5,99 --apply
```

La automatización no sustituye PDF existentes ni opera en Stripe live. La activación live continúa siendo manual.

## Flujo y seguridad

- El navegador solo envía `guiaId`; precio, Price ID y PDF se resuelven en servidor según el modo Stripe.
- El checkout comprueba que el webhook, el correo y el PDF privado están disponibles antes de cobrar.
- Checkout guarda el Price ID y `blobKey` exactos de la compra; el webhook verifica firma, entorno, pago y línea de compra antes de entregar.
- Los Price ID anteriores se conservan para no romper descargas históricas.
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
7. Simular un fallo de Resend o Blob y comprobar que no se muestran detalles sensibles.
8. Ejecutar `npm run guides:test` y `npm run build`.

Para soporte, buscar la compra por email o referencia en Stripe, comprobar la metadata de entrega en Resend y ampliar `downloadExpiresAt` si corresponde.
