# Configuración de Resend para Pomelo Baby

Resend gestionará tanto el correo transaccional como El Chisme de Mar. Supabase no será la fuente de suscriptores; se reserva para auditoría inmutable o persistencia de consultas si más adelante hace falta.

## Crear el dominio remitente

El dominio web definitivo es `pomelobaby.es`, pero añadirlo a Vercel no lo verifica automáticamente en Resend. Hay que hacer una segunda configuración:

1. Entrar en **Resend → Domains → Add Domain**.
2. Añadir `pomelobaby.es` y elegir la región europea si Resend ofrece esa opción.
3. Copiar en el proveedor DNS todos los registros que muestre Resend para SPF y DKIM, sin modificar sus nombres ni valores.
4. No reemplazar los registros de Vercel ni los MX del futuro buzón profesional: solo añadir los registros indicados por Resend.
5. Esperar a que el dominio aparezca como **Verified**.
6. Añadir el registro DMARC `_dmarc.pomelobaby.es`, empezando con una política de observación `p=none` hasta validar la entrega.

Los valores concretos de los registros deben copiarse del Dashboard porque Resend los genera para la cuenta. No son variables de la aplicación.

Hasta que el dominio esté verificado, `onboarding@resend.dev` solo permite enviar correos reales a la dirección asociada a la cuenta de Resend. Por eso la captación pública debe seguir cerrada.

## Modelo de contactos

Resend usa Contactos globales. Cada email corresponde a un único Contacto, que puede pertenecer a varios Segmentos y Topics.

### Segmento interno

Crear en **Audience → Segments**:

- **El Chisme de Mar**: todas las personas que aceptan recibir la newsletter, tanto desde el formulario general como desde la guía gratuita.

No hace falta un Segmento separado para “25 cosas normales en los bebés”: la propiedad `signup_source` ya identifica el origen y evitamos mantener una clasificación que todavía no tiene un uso real. El Segmento sirve para seleccionar destinatarios de Broadcasts; no representa por sí solo las preferencias de baja.

### Topic público

Crear en **Audience → Topics**:

- Nombre: **El Chisme de Mar**.
- Descripción: `Historias reales, información clara y crianza sin ruido.`
- Visibilidad: **Public**.
- Suscripción predeterminada: la opción que no suscribe automáticamente a todos los Contactos. El formulario web realizará un `opt_in` explícito después de aceptar la política de privacidad.

Esta decisión predeterminada no puede modificarse después de crear el Topic. Conviene revisarla antes de confirmar.

Todos los Broadcasts de El Chisme deben enviarse con este Topic. Así la persona puede darse de baja de El Chisme o de todo el correo de marketing desde la página de preferencias de Resend.

### Propiedades de contacto

Crear en **Audience → Properties** estas propiedades de tipo `string`:

| Propiedad | Uso |
| --- | --- |
| `signup_source` | `newsletter` o `lead_magnet_25_cosas` |
| `consent_version` | Versión del texto aceptado, actualmente `newsletter_v1` |
| `consented_at` | Fecha y hora ISO de la última confirmación procesada |

Estas propiedades guardan el estado más reciente, no un historial inmutable. Si asesoría exige conservar todo el historial de consentimientos, se añadirá una tabla de auditoría en Supabase.

## Variables de entorno

Configurar sin guardar valores reales en Git:

| Variable | Uso |
| --- | --- |
| `RESEND_API_KEY` | Contactos y envío de emails. Debe tener permisos para las operaciones utilizadas. |
| `RESEND_NEWSLETTER_SEGMENT_ID` | Segmento “El Chisme de Mar”. |
| `RESEND_NEWSLETTER_TOPIC_ID` | Topic público “El Chisme de Mar”. |
| `RESEND_FROM_EMAIL` | Remitente del dominio verificado para correos automáticos. |
| `RESEND_NEWSLETTER_FROM_EMAIL` | Remitente de El Chisme y sus correos de confirmación. |
| `RESEND_TO_EMAIL` | Buzón que recibe Contacto. |
| `RESEND_CONSULTA_TO_EMAIL` | Buzón reservado para las consultas pagadas. |
| `BLOB_STORE_ID` y `VERCEL_OIDC_TOKEN` | Acceso OIDC al PDF privado; Vercel los proporciona al conectar el store. |
| `NEWSLETTER_CONFIRMATION_SECRET` | Clave aleatoria de 32 bytes para cifrar los enlaces de confirmación. |

La API key no debe compartirse por chat ni registrarse en logs. Puede configurarse directamente en **Vercel → Project → Settings → Environment Variables**.

## Dominio y direcciones

Para enviar a cualquier familia hace falta comprar un dominio y verificarlo en Resend mediante los registros DNS indicados por su Dashboard.

Resend permite enviar desde cualquier dirección del dominio verificado, pero no crea un buzón tradicional. Para recibir y responder correos usaremos DonDominio con redirección a un Gmail dedicado, según [`configuracion-correo-profesional.md`](configuracion-correo-profesional.md).

Configuración inicial:

- Remitente de correos automáticos: `Mar de Pomelo Baby <mar@pomelobaby.es>`.
- Remitente de El Chisme: `El Chisme de Mar <chisme@pomelobaby.es>`.
- Contacto general e incidencias: `hola@pomelobaby.es`.
- Consultas pagadas: `mar@pomelobaby.es`.

Resend permite enviar desde `mar@pomelobaby.es` después de verificar el dominio, pero no crea buzones. DonDominio recibe el correo dirigido a ambas direcciones.

## Almacenamiento de los PDF

Los PDF se alojarán en el almacén privado de Vercel Blob conectado al proyecto para no repartir archivos entre varios proveedores:

- **Guía gratuita:** se servirá desde una URL estable de la propia web, que leerá el PDF privado en servidor. Que ese enlace de la web pueda compartirse es aceptable para un recurso gratuito.
- **Guías de pago:** se servirán únicamente desde el endpoint que verifica la compra de Stripe.

La URL privada de Blob no se usa directamente en el email. La guía gratuita se envía como enlace a `/api/recursos/25-cosas-normales-bebes/download`, que lee el archivo privado en servidor. El pathname actual está configurado en ese endpoint.

## Broadcasts y bajas

El Chisme debe enviarse como **Broadcast**, no mediante la API Batch de emails transaccionales.

Cada Broadcast debe:

1. Seleccionar el Segmento “El Chisme de Mar”.
2. Seleccionar el Topic “El Chisme de Mar”.
3. Incluir el footer de baja o `{{{RESEND_UNSUBSCRIBE_URL}}}`.
4. Enviarse primero a una lista o Segmento de prueba.
5. Revisar entregas, rebotes, quejas, clics y bajas.

Personalizar la página en **Settings → Unsubscribe Page** antes del primer envío con estos colores:

- Fondo: `#F6EFE7`.
- Texto: `#2D2D2D`.
- Acento: `#EF6E71`.

Es el coral principal de la identidad visual de Pomelo Baby.

## Automations

Las Automations pueden utilizarse más adelante para la bienvenida y la secuencia inicial. La aplicación enviaría un evento como `newsletter.subscribed` o `lead_magnet.requested`, y Resend ejecutaría los pasos configurados.

La entrega directa de la guía ya está implementada en la web. No hace falta migrarla a una Automation para lanzar la primera versión.

## Doble opt-in

El formulario envía un enlace cifrado y el Contacto no se crea ni recibe Broadcasts hasta pulsar el botón de confirmación.

No hace falta guardar solicitudes en Supabase: el token opaco contiene los datos mínimos, caduca en 48 horas y Resend conserva el estado operativo. El diseño está en [`arquitectura-doble-opt-in.md`](arquitectura-doble-opt-in.md).

## Prueba mínima

1. Configurar los tres IDs de Resend y las propiedades.
2. Dar de alta un contacto nuevo con nombre.
3. Repetir el alta y comprobar que no se duplica.
4. Confirmar que aparece en el Segmento “El Chisme de Mar” y que `signup_source` identifica si llegó desde la guía.
5. Confirmar que está en `opt_in` para el Topic.
6. Enviar la guía a la dirección asociada a la cuenta durante las pruebas con `resend.dev`.
7. Probar un Broadcast con enlace de baja.
8. Darse de baja y comprobar que deja de recibir Broadcasts.
9. Probar una nueva alta explícita y documentar el comportamiento acordado.
10. Después de verificar el dominio, repetir con Gmail, Outlook y móvil.

### Prueba local del 2 de octubre de 2026

Probado en local con una variante `+alias` de un correo propio, sin activar El Chisme en Production: alta nueva (el contacto no se crea hasta confirmar), confirmación (Segmento, Topic `opt_in` y propiedades correctos), reutilizar el enlace, repetir el alta ya suscrito (sin segundo correo), baja solo del Topic, baja global, nueva alta explícita tras cada baja (envía confirmación y reactiva) y token manipulado (rechazado). Resend tarda unos segundos en reflejar un cambio de Topic o de baja; hay que esperar antes de leerlo. Los contactos de prueba se borraron.
