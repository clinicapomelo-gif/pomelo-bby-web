# Tarea 05 — Regalar “25 cosas normales en los bebés” a cambio del correo

## Objetivo

Crear un flujo completo de lead magnet: la persona deja su correo, acepta la política de privacidad, entra en la audiencia y recibe el PDF gratuito.

## Dependencias

- Integrar primero las tareas 02 y 04.
- Disponer del PDF final en Vercel Blob privado.
- Tener configurados en Resend los Contactos globales, el Segmento y el Topic de El Chisme.

El PDF está en Vercel Blob privado y se sirve mediante `/api/recursos/25-cosas-normales-bebes/download`. No exponer su URL privada.

## Alcance sugerido

- Un componente específico como `src/components/LeadMagnetForm.astro`
- `src/pages/api/subscribe.ts` o un endpoint específico si simplifica el flujo
- `src/pages/newsletter/*` o una landing específica para el recurso
- `src/pages/index.astro` para mostrar el regalo
- Integración del CTA gratuito de `/tienda`
- `.env.example`, sin secretos, para documentar las variables nuevas

## Requisitos funcionales

1. Mostrar claramente qué recibe la familia: “25 cosas normales en los bebés”.
2. Pedir correo electrónico y nombre; ambos son obligatorios para personalizar la comunicación.
3. Exigir aceptación explícita de la política de privacidad.
4. Mantener protección básica contra bots, como el honeypot existente.
5. Validar el correo en servidor.
6. Añadir o actualizar el Contacto global de Resend, asociarlo al Segmento y suscribirlo explícitamente al Topic de El Chisme.
7. Enviar un correo transaccional con el enlace real de descarga.
8. Mostrar una confirmación clara después del envío.
9. No mostrar éxito si el alta o el envío han fallado.
10. No exponer claves ni secretos al navegador.
11. Usar variables de entorno para:
    - URL estable del endpoint de descarga.
    - Remitente verificado, si todavía no existe una variable común.
    - API key, Segment ID y Topic ID usados por el proyecto.
12. El formulario debe poder distinguir este alta de una suscripción normal si eso es útil para el contenido del email.

## Contenido mínimo visible

- Título: “25 cosas normales en los bebés”.
- Indicación de que es gratis.
- Explicación sencilla: dejar el correo para recibir el PDF.
- CTA claro, por ejemplo “Quiero la guía gratis”.
- Enlace a protección de datos.

## Seguridad y privacidad

- No registrar emails completos ni datos personales en logs.
- Escapar contenido introducido por la persona usuaria.
- No adjuntar un PDF pesado si un enlace estable es suficiente.
- Mantener un mensaje sanitario prudente: el recurso informa y no sustituye una valoración profesional.

## Criterios de aceptación

- El CTA de Inicio y el de Tienda llegan al formulario correcto.
- Un envío válido crea o actualiza el contacto y dispara el email.
- Los errores son comprensibles y no ocultan fallos.
- El flujo funciona en móvil y con teclado.
- Las variables necesarias quedan documentadas sin valores secretos.
- `npm run build` finaliza correctamente.
