# Configuración de Stripe

## Pendiente

- Cambiar el usuario y el email de Stripe a los datos profesionales cuando estén listos.

## Pasar de Sandbox a Live

- Completar primero la verificación de identidad de Stripe.
- Los Products y Prices ya migrados a Stripe Live deben conservar IDs distintos de Sandbox.
- Añadir sus `productId` y `priceId` en `stripe.live` dentro de `src/data/guias.json`.
- Añadir temporalmente `STRIPE_LIVE_SECRET_KEY=sk_live_...` solo al `.env` local y ejecutar `npm run guide:sync-live`. El comando solo lee Stripe Live y muestra el plan; con `-- --apply` guarda los IDs únicamente en el catálogo local. Eliminar esa variable local al terminar.
- Crear un webhook Live para `https://pomelobaby.es/api/webhook`.
- Copiar su secreto `whsec_...` en Vercel Production.
- En Vercel Production configurar:
  - `STRIPE_SECRET_KEY`: clave `sk_live_...`.
  - `STRIPE_WEBHOOK_SECRET`: secreto del webhook Live.
  - `SITE_URL`: `https://pomelobaby.es`.
- Mantener las claves `sk_test_...` y `whsec_...` del Sandbox en Preview.
- Mantener `STRIPE_CATALOG_KEY` como clave restringida `rk_test_...` solo en Development.
- No activar todavía las consultas Live: el código las mantiene bloqueadas hasta aprobar la persistencia de datos sanitarios.
- Probar una compra Live de una guía barata antes de publicar el resto.

## Stripe Elements

- No configurarlo ahora.
- La web usa Stripe Checkout alojado, no formularios de pago propios con Elements.
- Revisarlo solo si en el futuro queremos diseñar el formulario de pago dentro de la web.

## Verificación de identidad

- Verificar la identidad de **Mar Vall Requena** en Stripe.
- Entrar en **Empezar** y completar los datos y documentos solicitados.
- Los pagos y los ingresos no estarán activos hasta terminar la verificación.

## Radar

- Panel: https://stripe.com/en-es/radar
- Usar **Radar Lite** al principio.
- Cambiar a **Radar Standard** cuando haya más ventas o fraude.
- No usar Plus ni Pro por ahora.

## Impuestos

- Seleccionar la categoría **producto digital descargable** para las guías PDF.
- No activar Stripe Tax todavía.
- El código ya mantiene los impuestos desactivados:

```ts
automatic_tax: { enabled: false }
```

- Antes de activarlo, confirmar con la gestoría el IVA, los precios finales y OSS.
- Cuando esté confirmado, activar Stripe Tax en los dos checkouts y probar primero en sandbox.

## Stripe Climate

- No activar la contribución por ahora.
- No seleccionar el 0,5 %, 1 % ni 1,5 %.
- No activar la insignia de Stripe Climate.
- Revisarlo cuando haya ventas estables y margen suficiente.

## Dominio personalizado

- No añadir ahora `pay.pomelobaby.es`.
- Stripe cobra **10 USD al mes**.
- El checkout normal de Stripe es seguro y funciona bien.
- Revisarlo cuando haya muchas ventas y compense pagar unos 120 USD al año.

## Emails de Stripe

- Idioma: **Español (España)**.
- Activar emails de **pagos correctos**.
- Activar emails de **reembolsos**.
- Dejar desactivados los emails de adeudos bancarios, transferencias y otros métodos que no usemos.
- Mantener los emails SEPA activados si Stripe indica que son obligatorios.
- Cambiar el email de soporte de Gmail a `@pomelobaby.es` cuando el correo profesional esté listo.
- Mantener `pomelobaby.es` en verificación hasta que Stripe confirme el dominio.
