# Ideas para el futuro: horarios alternativos en las consultas por videollamada

Estado: **ideas, nada implementado** (12 oct 2026). Surgieron al pensar en las familias que no pueden los miércoles. El horario actual y su configuración están en [`configuracion-cal-com.md`](configuracion-cal-com.md).

## Problema

Mar atiende los miércoles de 11:00 a 13:00 y de 16:00 a 18:00, con un máximo de 4 consultas cortas y 2 largas al día. Una familia a la que no le encajan esos horarios, o cuando el miércoles está completo, necesita una salida que no dependa de repartir correos a mano.

Condiciones que hay que respetar:

- Mar quiere sus máximos (4 y 2 al día) para no sobrecargarse.
- El pago se hace siempre al reservar, en Cal.com con Stripe, con las mismas condiciones y reembolsos.
- Nada de datos de salud en los correos que sirven para pedir una hora.
- No se añade ninguna frase visible en la web sin que Mar la apruebe.
- `/consultas` no puede convertirse en una consulta gratuita encubierta ([`diferencias-consultas-online.md`](diferencias-consultas-online.md)).

## Opción 0. Manual (ya posible, sin montar nada)

1. La familia escribe a `hola@pomelobaby.es` con la consulta que quiere y qué días y horas le vienen bien.
2. Mar propone una hora concreta por correo.
3. Mar añade en Cal.com una excepción por fecha con esa hora y le manda el enlace de reserva.
4. La familia reserva y paga en Cal.com. Mar cierra la excepción si no se reserva.

Para tener control, se prepara una sola vez un horario «A petición» **vacío por defecto** y dos eventos **ocultos** que repiten las consultas (mismo precio, duración, ubicación, preguntas, política de cancelación y el recordatorio de 2 horas), con frecuencia de 1 al día. Si el plan de Cal.com lo permite, el enlace puede ser un [enlace privado](https://cal.com/help/event-types/private-links.md) que caduca tras una reserva o en una fecha.

Evitar: agendar fuera de Cal.com con un evento suelto y un enlace de pago de Stripe. Se pierden los recordatorios, los reembolsos automáticos y la coherencia con las condiciones de venta.

## Opción 1. Ventanas extra publicadas (la más automática)

Mar abre de antemano algún otro día u hora, con las mismas horas fijas, usando excepciones por fecha en los dos horarios. Las familias reservan solas.

- ✅ Cero trabajo por familia.
- ❌ Mar se compromete a trabajar fuera del miércoles. Si la familia necesita una hora distinta, no hay salida.

## Opción 2. Petición con un clic

1. Un formulario («Pedir otro horario») envía la petición a Mar con Resend, igual que el formulario de contacto.
2. Mar recibe un correo con la propuesta y un botón **Aceptar** (enlace firmado, como los de El Chisme).
3. El servidor abre el hueco en Cal.com (excepción en el horario «A petición» o enlace privado) y manda a la familia el enlace de reserva y pago.

- ✅ Mar solo hace un clic.
- ❌ Es un proyecto de código: formulario, enlace firmado, secreto de la API de Cal.com en Cloudflare, pruebas.
- Por comprobar: que la API de Cal.com permita añadir excepciones o crear enlaces privados.

## Opción 3. Reserva con aprobación

El evento exige confirmación: la reserva no entra en el calendario hasta que Mar la acepta o la rechaza ([documentación](https://cal.com/help/event-types/how-to-requires.md)).

- ❌ **Sin confirmar cómo se cobra:** si la tarjeta se cobra al reservar, si se retiene hasta aceptar y si se reembolsa sola al rechazar. No usarla hasta probarlo con una reserva de prueba, para no cobrar a quien luego se rechaza.

## Tope total por usuario (útil para todas las opciones)

En Cal.com, **Settings → General → Limit booking frequency** limita las reservas confirmadas **de todos los eventos** por día, semana y mes, a la vez que los límites de cada evento ([documentación](https://cal.com/help/event-types/user-booking-limits.md)). Así Mar puede fijar un máximo total (por ejemplo, 6 al día) que incluya los horarios especiales. Puede requerir ser una organización de Cal.com: Rafael tiene que comprobar si le aparece.

## Orden sugerido

1. Empezar con el horario actual y la opción 0 para casos sueltos.
2. Activar el tope total por usuario si aparece.
3. Si llegan muchas peticiones en el primer mes, valorar la opción 1 o construir la 2.

## Preguntas abiertas para Mar

- ¿Acepta abrir alguna ventana fuera del miércoles? ¿Qué día y qué horario, con los mismos máximos de 4 y 2?
- ¿Hay recargo por horario especial? (Propuesta: mismo precio.)
- ¿Aprueba esta frase para `/consultas`? «¿No te encaja ningún horario? Escríbeme a hola@pomelobaby.es y buscamos uno que te venga bien.»

## Diseño detallado de la opción 2 (petición con respuesta de Mar)

Estado: diseño, sin implementar (12 oct 2026). El horario base de los miércoles (larga, corta, corta, larga, corta, corta) queda como está en `configuracion-cal-com.md`; esto es solo para peticiones fuera de él.

### Flujo

1. **Familia:** rellena un formulario «Pedir otro horario» con su correo, el tipo de consulta (corta o larga) y el día y la hora que le vienen bien. Sin datos de salud ni texto libre largo. Recibe un correo de acuse.
2. **Mar** recibe un correo (con *reply-to* a la familia, para poder contestar a mano) con la petición y un enlace a una página de respuesta. Esa página muestra la petición y tres acciones:
   - **Aceptar** la hora tal cual.
   - **Cambiar la hora** (selector de fecha y hora) y proponer otra.
   - **No puedo:** envía a la familia un correo amable con las salidas habituales (miércoles de siempre o consulta por correo).
3. **Servidor:** al aceptar o cambiar, abre el hueco en Cal.com (excepción de fecha en el horario «A petición», vía `PATCH /v2/schedules/{id}`) y envía a la familia el enlace de reserva del evento oculto con esa fecha. La propia reserva hace de aceptación: no hace falta un segundo «sí».
4. **Familia:** reserva y paga en Cal.com como siempre. El límite de 1 al día del evento oculto cierra el hueco al reservarse.

### Decisiones de diseño

- **Sin base de datos:** los datos de la petición viajan en enlaces firmados (HMAC con caducidad), como en la confirmación de El Chisme. Las claves de idempotencia de Resend evitan correos duplicados si Mar pulsa dos veces.
- **Dos pasos para actuar:** el enlace del correo (GET) solo muestra la página; la acción se ejecuta con un botón (POST). Así los escáneres de enlaces del correo no aceptan nada solos.
- **Seguridad de Mar:** el enlace firmado es la autorización. Opcional y más fuerte: proteger la página con Cloudflare Access (código por correo).
- **Cal.com:** la API sustituye las excepciones del horario por las que se envíen, así que hay que leerlas y reescribirlas todas. Con pocas peticiones, el riesgo de choque es bajo. Por comprobar: el plan y la clave de API, y que el hueco aparezca solo en el evento oculto.
- **Hueco abierto sin plazo:** si la familia no reserva, el hueco se cierra solo 24 h antes (aviso mínimo). Una limpieza periódica de excepciones pasadas es opcional.
- **Antiabuso:** añadir la ruta a la regla de límite de envíos del WAF, un campo trampa y validación de tamaños y formato en servidor.
- **Textos:** todo lo visible (formulario, acuse, correo de hueco abierto, correo de «no puedo») lo aprueba Mar antes de publicarse.

### Trabajo estimado

Una página de formulario, una ruta API, una página de respuesta con su ruta, un módulo para la API de Cal.com, el módulo de enlaces firmados (reutilizable del de El Chisme), correos con `renderEmail`, pruebas, y los secretos en Cloudflare (`CAL_API_KEY` y la clave de firma). Tamaño medio.

### Cambiar la hora y avisar a la familia

La página de respuesta de Mar tiene un selector de fecha y hora (y un mensaje corto opcional, sin datos de salud). Al pulsar **Enviar propuesta**, el servidor:

1. Comprueba que la fecha es futura y respeta el aviso mínimo de 24 h, y que el hueco está libre en Cal.com.
2. Abre ese hueco en el horario «A petición».
3. Envía a la familia un correo (con *reply-to* a Mar) con la hora propuesta y el botón de reserva del evento oculto, con la fecha ya elegida.
4. Muestra a Mar una confirmación con un enlace nuevo para volver a cambiar la hora. Ese enlace lleva dentro la hora anterior, para cerrar su hueco al abrir el nuevo sin guardar nada en una base de datos.

Si la hora no le encaja a la familia, responde al correo (llega a Mar) o vuelve a pedir otro horario. Para proponer varias horas a la vez, cada una abriría su hueco; el límite de «reservas próximas por usuario» a 1 evita que la misma familia reserve dos.

### Proponer varias horas, y que solo una se pueda reservar

Mar puede añadir hasta 3 horas en su página de respuesta. Para que solo una acabe reservada, **ninguna se abre en Cal.com al proponerla**:

1. El correo a la familia enlaza a una página nuestra con las opciones (el enlace firmado lleva dentro la lista de horas y caduca).
2. La familia elige una y pulsa «Reservar esta hora». El servidor comprueba en ese momento que sigue libre en Cal.com, abre **solo ese hueco** y la redirige al evento oculto con la fecha elegida.
3. Si el hueco ya no está libre (por ejemplo, porque Mar propuso la misma hora a otra familia y esta llegó antes), la página lo dice y sugiere responder al correo.

Así no hay huecos sobrantes que cerrar ni estado que guardar. Las propuestas son «blandas»: no bloquean el calendario de Mar hasta que alguien elige. El límite de «reservas próximas por usuario» a 1 evita que la misma familia reserve dos.

Alternativas descartadas: abrir todas las horas y cerrar las demás con un webhook de Cal.com al pagarse (más piezas y un hueco entre el pago y el cierre), o un enlace privado que caduca tras 1 reserva (no cierra los huecos para quien conozca el enlace del evento oculto).
