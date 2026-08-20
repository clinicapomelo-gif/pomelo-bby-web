# Compra y entrega de guías de pago

Las guías de pago usan Stripe como registro de la compra, Resend para el correo y un almacén privado de Vercel Blob para los PDF. La aplicación no mantiene una base de datos propia de pedidos.

## Variables de entorno

Configurar estos valores en local y en los entornos de Vercel que correspondan. Nunca guardar valores reales en Git.

| Variable | Uso |
| --- | --- |
| `SITE_URL` | URL pública usada en los retornos de Stripe y los enlaces de descarga. |
| `STRIPE_SECRET_KEY` | Clave test o live del entorno actual. |
| `STRIPE_WEBHOOK_SECRET` | Firma del endpoint `/api/webhook` del entorno actual. |
| `RESEND_API_KEY` | Envío del correo de entrega. |
| `RESEND_FROM_EMAIL` | Remitente perteneciente a un dominio verificado. |
| `BLOB_STORE_ID` | Identificador del almacén privado conectado al proyecto. |
| `VERCEL_OIDC_TOKEN` | Credencial temporal inyectada automáticamente por Vercel para acceder a Blob. |
| `BLOB_READ_WRITE_TOKEN` | Alternativa solo para desarrollo local cuando no hay OIDC. |

En Vercel se prioriza OIDC para no mantener una credencial Blob de larga duración. Los Product ID, Price ID y `blobKey` no son secretos, pero deben corresponder al mismo producto y entorno.

## Preparación externa

1. Crear un almacén privado en Vercel Blob.
2. Subir el PDF final con tipo `application/pdf` y anotar su pathname como `blobKey`.
3. Verificar el dominio remitente en Resend y configurar `RESEND_FROM_EMAIL`.
4. Crear el producto y precio primero en Stripe test.
5. Registrar `/api/webhook` para:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
6. Copiar el secreto de firma al entorno correspondiente.
7. Repetir la configuración con IDs y secretos live solo después de superar las pruebas.

## Activación de una guía

Una guía solo puede pasar a `available` cuando tiene:

- PDF y portada finales.
- Descripción e índice aprobados.
- Product ID y Price ID del entorno correcto.
- `blobKey` de un PDF privado real.
- Remitente de Resend verificado.

Actualizar su entrada en `src/data/guias.ts` con los valores reales y ejecutar una compra completa en modo test antes de publicar.

## Flujo y seguridad

- El navegador solo envía `guiaId`; precio, Price ID y PDF se resuelven en servidor.
- El checkout comprueba que el webhook, el correo y el PDF privado están disponibles antes de cobrar.
- El webhook verifica la firma sobre el cuerpo original y vuelve a comprobar el pago en Stripe.
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
8. Ejecutar `npm run build`.

Para soporte, buscar la compra por email o referencia en Stripe, comprobar la metadata de entrega en Resend y ampliar `downloadExpiresAt` si corresponde.
