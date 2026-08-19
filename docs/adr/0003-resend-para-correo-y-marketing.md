# ADR 0003 — Resend para correo transaccional y marketing

## Estado
Aceptado

## Fecha
2026-08-19

## Contexto

pomelo.bby necesita enviar correos transaccionales de Contacto, consultas y compras, además de gestionar suscriptores y enviar El Chisme de Mar.

Se valoró separar estas responsabilidades entre Resend y Kit. Resend dispone actualmente de Contactos globales, Segmentos, Topics, Broadcasts, Automations, personalización y gestión automática de bajas, suficientes para la primera fase del proyecto.

También existe una base de datos Supabase en Vercel, pero mantener otra fuente de suscriptores añadiría sincronización y tratamiento de datos sin una necesidad actual.

## Decisión

Usamos Resend para correo transaccional y marketing:

- Contactos globales como registro operativo de suscriptores.
- Segmentos para organización interna y destinatarios de Broadcasts.
- Topics para preferencias visibles y bajas.
- Broadcasts para El Chisme de Mar.
- Automations cuando se necesiten secuencias de bienvenida.
- API de envío individual para correos transaccionales.

Supabase no será la fuente de suscriptores. El doble opt-in se resolverá con un token cifrado y de corta duración. Supabase se reserva para casos persistentes que Resend no cubra bien, como un historial inmutable de consentimientos o la conservación fiable de consultas pagadas.

## Consecuencias

- No se integra Kit en esta fase.
- Los antiguos Audience ID se sustituyen por Segment ID y Topic ID.
- Todos los Broadcasts de marketing deben incluir la baja gestionada por Resend.
- Hace falta un dominio verificado para enviar a destinatarios distintos de la dirección asociada a la cuenta de Resend.
- La API Batch no se utilizará para newsletters; las campañas se enviarán como Broadcasts.
- El alta usa doble opt-in con token cifrado. Supabase solo se añadirá si se necesita persistencia o un historial inmutable.
