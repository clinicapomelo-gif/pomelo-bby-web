# Correo profesional de Pomelo Baby

## Decisión inicial

Usaremos el plan **Mini de DonDominio** con dos buzones: `hola@pomelobaby.es` para contacto general y `mar@pomelobaby.es` para consultas pagadas. `chisme@pomelobaby.es` es un tercer buzón (no un alias). Desde el 8 oct 2026, `hola@` y `mar@` se reenvían sin copia al Gmail de Pomelo (ver «Gmail»).

No hace falta Google Workspace para esta configuración. DonDominio recibe el correo y proporciona el SMTP; Gmail se utilizará más adelante como bandeja de entrada. Resend envía los correos automáticos desde `mar@pomelobaby.es` y El Chisme desde `chisme@pomelobaby.es`.

## Arquitectura

```text
Contacto general → hola@pomelobaby.es → DonDominio → futura redirección → Gmail dedicado
Consulta pagada → mar@pomelobaby.es → DonDominio → futura redirección → Gmail dedicado

Gmail → SMTP de DonDominio → respuesta como hola@pomelobaby.es o mar@pomelobaby.es

Web → Resend desde mar@pomelobaby.es → confirmaciones transaccionales y guías
Web → Resend desde chisme@pomelobaby.es → El Chisme y su doble confirmación
```

## Configuración en DonDominio

1. Contratar el plan Mini.
2. Crear los buzones `hola@pomelobaby.es` y `mar@pomelobaby.es`.
3. Crear el alias `chisme@pomelobaby.es` con destino `mar@pomelobaby.es`.
4. Configurar el MX del dominio principal con host `@`, servidor `mx01.dondominio.com`, prioridad `10` y TTL por defecto.
5. Más adelante, redirigir ambos buzones a una cuenta de Gmail dedicada a Pomelo Baby, no a una cuenta personal de uso cotidiano.
6. Usar los servidores MX y SMTP exactos que muestre DonDominio.
7. Activar 2FA en DonDominio.
8. Comprobar después de contratar el plan que no se haya cambiado la web:
   - `pomelobaby.es` debe conservar el registro A de Vercel.
   - `www.pomelobaby.es` debe conservar el CNAME de Vercel.

El espacio web incluido no se utilizará. La web permanece alojada en Vercel.

## Gmail (hecho el 8 oct 2026)

Los buzones `hola@` y `mar@` se leen y se responden desde el Gmail de Pomelo (`clinicapomelo@gmail.com`).

**Reenvío sin copia (DonDominio):** en el WebMail de cada buzón, Configuración → Filtros, un filtro «Reenviar a gmail» con ámbito «todos los mensajes» y una sola acción, «Redirigir mensaje a» el Gmail. Sin la acción «Copiar mensaje a», el correo reenviado se borra del servidor ([ayuda de DonDominio](https://www.dondominio.com/es/help/228/crear-reenvio-correos-desde-webmail/)). Los filtros van dentro de un conjunto (`roundcube`) que tiene que estar activo. Los buzones no se borran: reciben el correo y su contraseña es la del envío.

**Filtros en Gmail:** `Para: hola@pomelobaby.es` y `Para: mar@pomelobaby.es` con «No enviarlo nunca a Spam» y sus etiquetas. Como no queda copia en DonDominio, un mensaje que acabara en spam podría perderse.

**Enviar como** (Gmail → Cuentas e importación → Enviar correo como), una entrada por buzón, «Tratar como un alias»:

| Campo | Valor |
| --- | --- |
| Servidor SMTP | `smtp.dondominio.com` |
| Puerto y seguridad | `465`, SSL |
| Usuario | la dirección completa (`hola@pomelobaby.es`, `mar@pomelobaby.es`) |
| Contraseña | la del buzón |

No usar `mailsrv1.dondominio.com` (al que apunta `smtp.pomelobaby.es`): tiene un certificado autofirmado y Gmail lo rechaza, aunque lo muestra como «Error de autenticación». Activar «Responder desde la misma dirección a la que se envió el mensaje».

**Pendiente:** `chisme@pomelobaby.es` es un tercer buzón, no un alias, y no tiene reenvío: lo que llegue ahí se queda en DonDominio. Configurarlo igual cuando se active El Chisme.

Las contraseñas y códigos de verificación no deben guardarse en Git ni compartirse por chat.

## Resend

Resend y el buzón cumplen funciones diferentes:

- **Resend Sending activado:** correos automáticos, doble opt-in, Contacto y Broadcasts.
- **Resend Receiving desactivado:** no necesitamos recibir correos mediante webhooks.
- **DonDominio:** recepción, redirección y SMTP para respuestas manuales.
- **Gmail:** interfaz diaria de lectura y respuesta.

Los registros de Resend bajo `send.pomelobaby.es` pueden convivir con los registros de correo de DonDominio en el dominio principal.

Cuando el dominio esté verificado, configurar como secretos del Worker:

```text
RESEND_FROM_EMAIL="Mar de Pomelo Baby <mar@pomelobaby.es>"
RESEND_NEWSLETTER_FROM_EMAIL="El Chisme de Mar <chisme@pomelobaby.es>"
RESEND_TO_EMAIL="hola@pomelobaby.es"
RESEND_CONSULTA_TO_EMAIL="mar@pomelobaby.es"
```

## Fotografías y vídeos de consultas

No se piden ni se aceptan fotos o vídeos por correo: dejan copias en varios buzones, redirecciones y copias de seguridad. Desde el [ADR 0004](adr/0004-whatsapp-business-para-consultas.md) (7 oct 2026):

1. La familia envía primero la consulta escrita. No envía archivos de forma preventiva.
2. El correo sirve para que Mar abra la conversación. Si la familia quiere, la consulta sigue por WhatsApp Business.
3. Si Mar necesita una foto o un vídeo, lo pide por WhatsApp con la opción «ver una vez». Lo abre al valorarlo y describe en Clinic lo que ve.
4. Al cerrar la consulta, lo importante queda en Clinic. El buzón no es el archivo clínico.

Si la asesoría exige conservar las imágenes, las alternativas están en [`canales-archivos-consultas.md`](canales-archivos-consultas.md).

## Prueba final

- Recibir en Gmail mensajes enviados a `hola@pomelobaby.es` y `mar@pomelobaby.es`.
- Responder desde Gmail mostrando la dirección correspondiente.
- Confirmar SPF, DKIM y DMARC.
- Probar Contacto y una consulta controlada.
- Comprobar que no se acumulan copias innecesarias en DonDominio.
- Revisar periódicamente el uso de los 100 MB y ampliar el plan solo cuando haga falta.
