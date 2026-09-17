# ADR 0002 — Stripe directo para pagos (sin Lemon Squeezy)

## Estado
Aceptado

## Fecha
2026-05-21

## Contexto
La tienda de Pomelo Baby vende Guías (PDFs) a precio fijo individual. Necesitamos una solución de pagos. Las opciones evaluadas fueron:

1. **Lemon Squeezy** — plataforma especializada en productos digitales. Gestiona pagos, IVA europeo, entrega del archivo y checkout. Comisión ~5% + 0.50€ por venta.
2. **Stripe directo** — pasarela de pagos genérica. Comisión ~1.5% + 0.25€. Requiere construir la lógica de checkout, entrega del archivo y gestión de IVA.

## Decisión
Usamos Stripe directo con funciones serverless en Vercel.

## Razones
- Mar es autónoma con SL asociada y gestiona su propia facturación e IVA — no necesita que un tercero gestione el IVA europeo por ella.
- La comisión de Stripe es significativamente menor que Lemon Squeezy.
- Vercel ofrece funciones serverless gratuitas suficientes para el webhook de Stripe y la generación de links de descarga temporales.
- Control total sobre la experiencia de compra y los datos del cliente.

## Consecuencias
- Hay que construir la lógica de entrega del PDF (webhook de Stripe → link de descarga temporal).
- La gestión del IVA y la facturación recae en la gestoría de Mar, no en la plataforma.
- Si el volumen de ventas crece mucho, la diferencia de comisión justifica con creces el desarrollo adicional.
- Si en el futuro se quiere delegar la gestión fiscal a un tercero, migrar a Lemon Squeezy es viable pero requiere cambiar el flujo de checkout.
