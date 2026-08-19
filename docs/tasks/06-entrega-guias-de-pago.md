# Tarea 06 — Activar compra y entrega de las guías de pago

## Objetivo

Completar la infraestructura existente para que una guía marcada como disponible pueda comprarse con Stripe y entregarse automáticamente por correo.

## Prerrequisitos bloqueantes

Para cada guía que vaya a activarse hacen falta:

- PDF final.
- Portada final.
- Descripción e índice aprobados.
- Producto y Price ID real en Stripe.
- Archivo subido a la ubicación de entrega aprobada.
- Dominio remitente verificado en Resend.

No activar una guía si falta cualquiera de estos elementos.

## Alcance

- `src/data/guias.ts`
- `src/pages/api/checkout.ts`
- `src/pages/api/webhook.ts`
- `src/pages/tienda/gracias.astro`
- Páginas de detalle de Tienda
- Configuración documentada de Stripe, Resend y almacenamiento

## Requisitos

1. Activar exclusivamente productos con estado `available`, `stripePriceId` real y PDF real.
2. Mantener el precio del catálogo como presentación, pero usar siempre el Price ID de Stripe para cobrar.
3. Verificar la firma del webhook antes de procesar compras.
4. Gestionar `checkout.session.completed` de forma idempotente para reducir emails duplicados.
5. Asociar de forma fiable el `guiaId` mediante metadata.
6. Enviar al email confirmado por Stripe un mensaje con el enlace de descarga.
7. No registrar datos personales innecesarios.
8. No exponer rutas internas o credenciales de almacenamiento.
9. Si los enlaces expiran, explicar la caducidad y ofrecer una vía de soporte.
10. La página de gracias no debe afirmar que el email se ha enviado si la sesión no es válida. Verificar `session_id` en servidor o usar un mensaje prudente.
11. Gestionar errores de Stripe, Resend y almacenamiento sin revelar información sensible.
12. Documentar variables de entorno y pasos de configuración del webhook.
13. Probar primero en modo test de Stripe.

## Activación individual

Repetir la validación completa para cada guía:

- El sueño infantil explicado en palabras normales — 14,90 €
- La guía de las rabietas — 14,90 €
- Retirada del pañal sin dramas — 12,90 €
- Destete sin culpa — 12,90 €
- Alimentación complementaria para familias reales — 14,90 €

No es necesario esperar a tener las cinco: cada una puede pasar de `coming-soon` a `available` de forma independiente.

## Criterios de aceptación

- Un pago test válido produce una sola entrega correcta.
- Un producto próximo o mal configurado no puede comprarse.
- Un webhook con firma inválida se rechaza.
- La página de gracias maneja sesiones válidas e inválidas.
- Las variables y pasos externos están documentados.
- `npm run build` finaliza correctamente.
