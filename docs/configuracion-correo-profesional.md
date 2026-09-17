# Correo profesional de Pomelo Baby

## Decisión inicial

Usaremos el plan **Mini de DonDominio** con dos buzones: `hola@pomelobaby.es` para contacto general y `mar@pomelobaby.es` para consultas pagadas. El alias `chisme@pomelobaby.es` redirige a `mar@pomelobaby.es`. En una fase posterior, ambos buzones redirigirán los mensajes a una cuenta de Gmail dedicada exclusivamente a Pomelo Baby.

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

## Configuración futura en Gmail

1. Activar 2FA en la cuenta dedicada.
2. Ir a **Configuración → Cuentas e importación → Enviar como**.
3. Añadir `hola@pomelobaby.es` y `mar@pomelobaby.es`.
4. Configurar cada dirección con su propio usuario y contraseña SMTP de DonDominio.
5. Completar las verificaciones recibidas mediante las redirecciones.
6. Configurar Gmail para responder desde la misma dirección a la que llegó el mensaje.
7. Enviar pruebas y comprobar que el remitente visible es el correcto y que las respuestas vuelven correctamente.

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
RESEND_FROM_EMAIL="Mar de Pomelo Baby <mar@pomelobaby.es>"
RESEND_NEWSLETTER_FROM_EMAIL="El Chisme de Mar <chisme@pomelobaby.es>"
RESEND_TO_EMAIL="hola@pomelobaby.es"
RESEND_CONSULTA_TO_EMAIL="mar@pomelobaby.es"
```

## Fotografías y vídeos de consultas

La redirección también reenvía archivos adjuntos, por lo que puede servir para fotografías pequeñas. No debe dependerse del email para vídeos: suelen superar los límites de los proveedores y pueden dejar copias en varios sistemas.

Flujo acordado por ahora:

1. La familia envía primero la consulta escrita.
2. No envía fotografías o vídeos de forma preventiva.
3. Mar decide si necesita algún archivo.
4. Las fotografías pequeñas pueden solicitarse únicamente por el canal que se apruebe.
5. No se ha decidido todavía entre un servicio temporal cifrado, una plataforma profesional o una subida privada propia.

Las alternativas, sus riesgos y la prueba de usabilidad propuesta están en [`canales-archivos-consultas.md`](canales-archivos-consultas.md).

Antes de aceptar imágenes de menores hay que definir con el profesional legal la información previa, legitimación, acceso, conservación y borrado. El buzón no debe utilizarse como único archivo clínico.

## Prueba final

- Recibir en Gmail mensajes enviados a `hola@pomelobaby.es` y `mar@pomelobaby.es`.
- Responder desde Gmail mostrando la dirección correspondiente.
- Confirmar SPF, DKIM y DMARC.
- Probar Contacto y una consulta controlada.
- Comprobar que no se acumulan copias innecesarias en DonDominio.
- Revisar periódicamente el uso de los 100 MB y ampliar el plan solo cuando haga falta.
