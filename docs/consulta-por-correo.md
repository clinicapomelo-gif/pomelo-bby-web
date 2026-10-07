# Consulta por correo (19 €)

Implementa la propuesta E3 (7 oct 2026). La consulta sigue apagada (`CONSULTATIONS_ENABLED = false`) y el cobro Live cerrado (`canCreateConsultationCheckout`): abrirlo es una decisión expresa.

## Flujo

1. **Abrir el pago** (`/api/checkout-consulta`). Antes de crear la sesión:
   - **Pausa:** `CONSULTA_CORREO_PAUSADA = true` en `src/data/consultas.ts`, commit y push. `/consultas` muestra el botón desactivado con el aviso, y el servidor responde 409 «pausada». Todo bloqueo se hace desde la web, no desde Stripe.
   - **Máximo diario:** cuenta las sesiones de esta consulta creadas desde las 00:00 de Madrid que estén pagadas o abiertas sin caducar. Con `CONSULTA_CORREO_MAXIMO_DIARIO` (10, en `src/data/consultas.ts`) responde 409 «completa». Si Stripe no responde, no vende.
   - La sesión caduca a los 31 minutos, para que un pago abandonado libere su hueco pronto.
2. **Aviso al pagar** (`/api/webhook` → `src/lib/consulta-webhook.ts`): con el pago confirmado, correo a Mar (`RESEND_CONSULTA_TO_EMAIL`, sin datos de salud) y a la familia con el enlace al formulario. Marca `avisoEnviado` en la sesión; las claves de idempotencia evitan duplicados si Stripe reintenta.
3. **Formulario** (`/consulta-mensaje/gracias`): si Stripe no responde, muestra un aviso y un botón para reintentar en lugar de redirigir. Si el caso ya se envió, lleva a «Recibido». El email es el del pago; el teléfono es opcional.
4. **Envío del caso** (`/api/consulta-mensaje`): rechaza pagos devueltos, hace hasta 3 intentos con Resend con la misma clave de idempotencia y, si fallan, el navegador ofrece el caso para copiarlo y enviarlo por correo. Sin JavaScript, los errores vuelven al formulario.
5. **Después** (Mar, a mano): WhatsApp si hay teléfono, si no correo; fotos con «ver una vez»; cierre con registro en Clinic ([ADR 0004](adr/0004-whatsapp-business-para-consultas.md)).

La referencia de cada consulta es `PB-` y los 6 últimos caracteres de la sesión de Stripe. Aparece en los correos y en el formulario.

## Textos y decisiones

- Mar aprobó el 7 oct 2026 los textos nuevos: correo a la familia al pagar, avisos de «completa» y «pausada», «no he podido comprobar tu pago», el caso para copiar y «Te responderé al email con el que has pagado».
- El máximo de 10 se aplica todos los días de la semana, también sábado y domingo.

## Pruebas en Sandbox

- Compra completa: aviso a Mar y a la familia, caso con y sin teléfono, confirmación.
- Webhook repetido desde el panel de Stripe: no duplica correos.
- Límite: bajar temporalmente `CONSULTA_CORREO_MAXIMO_DIARIO` a 1 y comprobar el aviso.
- Pausa: poner `CONSULTA_CORREO_PAUSADA = true` en local y comprobar el botón desactivado y el 409.
- Reembolso: devolver un pago antes de enviar el caso y comprobar el rechazo.

Probado en local con Sandbox el 7 oct 2026: límite (con el máximo en 1), pausa, aviso a Mar y a la familia, aviso repetido sin duplicados, caso con teléfono, reenvío bloqueado tras enviar y rechazo de un pago devuelto. Sin probar: el texto para copiar cuando Resend falla y el aviso de «no he podido comprobar tu pago».

Para repetirlo en local, además de las claves de Sandbox, el servidor necesita `RESEND_FROM_EMAIL`, `RESEND_CONSULTA_TO_EMAIL` y el `STRIPE_WEBHOOK_SECRET` de `stripe listen --print-secret`, y `stripe listen --forward-to localhost:4321/api/webhook`. Las pruebas abren pagos que reservan hueco 31 minutos: si salta el límite, caducarlos con `stripe checkout sessions expire`.
