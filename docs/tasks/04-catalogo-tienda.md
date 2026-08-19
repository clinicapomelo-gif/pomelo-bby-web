# Tarea 04 — Actualizar el catálogo de la Tienda

## Objetivo

Convertir `/tienda` en “Las guías Pomelo Bby” y mostrar el catálogo aprobado, sin permitir comprar productos que todavía no tienen PDF ni configuración real.

## Catálogo obligatorio

1. 25 cosas normales en los bebés — GRATIS
2. El sueño infantil explicado en palabras normales — 14,90 €
3. La guía de las rabietas — 14,90 €
4. Retirada del pañal sin dramas — 12,90 €
5. Destete sin culpa — 12,90 €
6. Alimentación complementaria para familias reales — 14,90 €

## Alcance

- `src/data/guias.ts`
- `src/pages/tienda/index.astro`
- `src/pages/tienda/[id].astro`
- `src/pages/api/checkout.ts`, solo para impedir checkouts no disponibles
- Ajustes mínimos derivados en componentes que consuman `guias`

## Requisitos

1. Sustituir el catálogo provisional por los seis títulos y precios aprobados.
2. Modelar explícitamente el estado del producto, por ejemplo:
   - `free` o `lead-magnet`
   - `coming-soon`
   - `available`
3. “25 cosas normales en los bebés” debe tener un CTA “Descargar gratis” o equivalente. Puede apuntar temporalmente a `/newsletter?recurso=25-cosas-normales-bebes`; la entrega real se implementa en la tarea 05.
4. Las cinco guías de pago deben quedar como “Próximamente” hasta que cada PDF, precio de Stripe y entrega estén listos.
5. No usar `price_PLACEHOLDER`, productos inventados ni botones de compra activos para productos incompletos.
6. Hacer opcionales los identificadores de Stripe y Blob para productos no disponibles.
7. El endpoint de checkout debe rechazar explícitamente productos gratuitos, próximos o sin `stripePriceId` real.
8. Formatear precios en español: `14,90 €`, `12,90 €` y `Gratis`.
9. No inventar descripciones médicas extensas. Se permiten descripciones breves y prudentes basadas únicamente en el título.
10. Mantener responsive la cuadrícula y las páginas de detalle.

## Fuera de alcance

- Enviar el PDF gratuito por correo.
- Crear productos en Stripe.
- Entregar automáticamente PDF de pago.
- Crear las portadas o el contenido de las guías.

## Criterios de aceptación

- La tienda muestra exactamente los seis productos en el orden aprobado.
- Ningún producto incompleto se puede comprar.
- El recurso gratuito dirige al flujo que completará la tarea 05.
- La API no intenta crear un checkout sin un precio válido.
- `npm run build` finaliza correctamente.
