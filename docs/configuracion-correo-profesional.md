# Correo profesional de pomelo.bby

## Decisión inicial

Usaremos el plan **Mini de DonDominio** para crear `hola@pomelobaby.es` y redirigir los mensajes a una cuenta de Gmail dedicada exclusivamente a pomelo.bby.

No hace falta Google Workspace para esta configuración. DonDominio recibe y redirige el correo; Gmail se utiliza como bandeja de entrada. Resend continúa enviando los correos automáticos de la web.

## Arquitectura

```text
Familia → hola@pomelobaby.es → DonDominio → redirección → Gmail dedicado

Gmail → SMTP de DonDominio → respuesta como hola@pomelobaby.es

Web → Resend → confirmaciones, Contacto y El Chisme
```

## Configuración en DonDominio

1. Contratar el plan Mini.
2. Crear el buzón `hola@pomelobaby.es`.
3. Redirigir los mensajes a una cuenta de Gmail dedicada a pomelo.bby, no a una cuenta personal de uso cotidiano.
4. Usar los servidores MX y SMTP exactos que muestre DonDominio.
5. Activar 2FA en DonDominio.
6. Comprobar después de contratar el plan que no se haya cambiado la web:
   - `pomelobaby.es` debe conservar el registro A de Vercel.
   - `www.pomelobaby.es` debe conservar el CNAME de Vercel.

El espacio web incluido no se utilizará. La web permanece alojada en Vercel.

## Configuración en Gmail

1. Activar 2FA en la cuenta dedicada.
2. Ir a **Configuración → Cuentas e importación → Enviar como**.
3. Añadir `hola@pomelobaby.es`.
4. Configurar el SMTP con el servidor, puerto, usuario y contraseña proporcionados por DonDominio.
5. Completar la verificación recibida mediante la redirección.
6. Enviar una prueba y comprobar que el remitente visible es `hola@pomelobaby.es` y que las respuestas vuelven correctamente.

Las contraseñas y códigos de verificación no deben guardarse en Git ni compartirse por chat.

## Resend

Resend y el buzón cumplen funciones diferentes:

- **Resend Sending activado:** correos automáticos, doble opt-in, Contacto y Broadcasts.
- **Resend Receiving desactivado:** no necesitamos recibir correos mediante webhooks.
- **DonDominio:** recepción, redirección y SMTP para respuestas manuales.
- **Gmail:** interfaz diaria de lectura y respuesta.

Los registros de Resend bajo `send.pomelobaby.es` pueden convivir con los registros de correo de DonDominio en el dominio principal.

Cuando el dominio esté verificado, configurar en Vercel:

```text
RESEND_FROM_EMAIL="Mar de pomelo.bby <hola@pomelobaby.es>"
RESEND_TO_EMAIL="hola@pomelobaby.es"
```

## Fotografías y vídeos de consultas

La redirección también reenvía archivos adjuntos, por lo que puede servir para fotografías pequeñas. No debe dependerse del email para vídeos: suelen superar los límites de los proveedores y pueden dejar copias en varios sistemas.

Flujo acordado por ahora:

1. La familia envía primero la consulta escrita.
2. No envía fotografías o vídeos de forma preventiva.
3. Mar decide si necesita algún archivo.
4. Las fotografías pequeñas pueden solicitarse por el canal aprobado.
5. Para vídeos o archivos grandes se implementará una subida privada, vinculada al pago y con acceso temporal.

Antes de aceptar imágenes de menores hay que definir con el profesional legal la información previa, legitimación, acceso, conservación y borrado. El buzón no debe utilizarse como único archivo clínico.

## Prueba final

- Recibir en Gmail un mensaje enviado a `hola@pomelobaby.es`.
- Responder desde Gmail mostrando `hola@pomelobaby.es`.
- Confirmar SPF, DKIM y DMARC.
- Probar Contacto y una consulta controlada.
- Comprobar que no se acumulan copias innecesarias en DonDominio.
- Revisar periódicamente el uso de los 100 MB y ampliar el plan solo cuando haga falta.
