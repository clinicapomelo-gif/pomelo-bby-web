# Consulta por correo (19 €)

Implementa la propuesta E3 (7 oct 2026). La consulta sigue apagada (`CONSULTATIONS_ENABLED = false`) y el cobro Live cerrado (`canCreateConsultationCheckout`): abrirlo es una decisión expresa.

## Flujo

1. **Abrir el pago** (`/api/checkout-consulta`). Antes de crear la sesión:
   - **Pausa:** si el Price de la consulta está desactivado en Stripe, responde 409 «pausada». Mar pausa la venta desde el panel de Stripe, sin tocar la web.
   - **Máximo diario:** cuenta las sesiones de esta consulta creadas desde las 00:00 de Madrid que estén pagadas o abiertas sin caducar. Con `CONSULTA_CORREO_MAXIMO_DIARIO` (10, en `src/data/consultas.ts`) responde 409 «completa». Si Stripe no responde, no vende.
   - La sesión caduca a los 31 minutos, para que un pago abandonado libere su hueco pronto.
2. **Aviso al pagar** (`/api/webhook` → `src/lib/consulta-webhook.ts`): con el pago confirmado, correo a Mar (`RESEND_CONSULTA_TO_EMAIL`, sin datos de salud) y a la familia con el enlace al formulario. Marca `avisoEnviado` en la sesión; las claves de idempotencia evitan duplicados si Stripe reintenta.
3. **Formulario** (`/consulta-mensaje/gracias`): si Stripe no responde, muestra un aviso y un botón para reintentar en lugar de redirigir. Si el caso ya se envió, lleva a «Recibido». El email es el del pago; el teléfono es opcional.
4. **Envío del caso** (`/api/consulta-mensaje`): rechaza pagos devueltos, hace hasta 3 intentos con Resend con la misma clave de idempotencia y, si fallan, el navegador ofrece el caso para copiarlo y enviarlo por correo. Sin JavaScript, los errores vuelven al formulario.
5. **Después** (Mar, a mano): WhatsApp si hay teléfono, si no correo; fotos con «ver una vez»; cierre con registro en Clinic ([ADR 0004](adr/0004-whatsapp-business-para-consultas.md)).

La referencia de cada consulta es `PB-` y los 6 últimos caracteres de la sesión de Stripe. Aparece en los correos y en el formulario.

## Textos provisionales

Marcados con `TODO(Mar)` en el código: correo a la familia al pagar, avisos de «completa» y «pausada», mensaje de «no he podido comprobar tu pago», texto del caso para copiar y la frase del email de respuesta en el formulario.

## Pruebas en Sandbox

- Compra completa: aviso a Mar y a la familia, caso con y sin teléfono, confirmación.
- Webhook repetido desde el panel de Stripe: no duplica correos.
- Límite: bajar temporalmente `CONSULTA_CORREO_MAXIMO_DIARIO` a 1 y comprobar el aviso.
- Pausa: desactivar el Price de Sandbox y comprobar el aviso; reactivarlo después.
- Reembolso: devolver un pago antes de enviar el caso y comprobar el rechazo.
