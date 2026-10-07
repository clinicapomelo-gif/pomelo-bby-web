# ADR 0004 — WhatsApp Business como canal de consultas

## Estado
Aceptado

## Fecha
2026-10-07

## Contexto

`docs/canales-archivos-consultas.md` descartaba WhatsApp como canal oficial: mezclaba lo profesional con lo personal, dificultaba la conservación y podía crear expectativas de atención urgente. Las videollamadas se hacían solo por Google Meet.

Pomelo Baby tiene ahora un número de teléfono propio, separado del personal de Mar. Hablar por WhatsApp es más rápido y cercano para las familias, y permite a Mar recuperar el contacto cuando el correo falla.

## Decisión

Usamos **WhatsApp Business**, en el número de Pomelo Baby, como canal de comunicación de las consultas. **Mar decide cuándo abrirlo**; las familias no reciben el número por defecto.

- **Contacto:** el formulario pide un teléfono opcional. Si la familia lo deja, Mar puede escribirle por WhatsApp cuando sea más fácil aclarar algo; si no, responde por correo y, si quiere pasar a WhatsApp, lo ofrece en su respuesta. El texto de ayuda del campo lo aprobó Mar.
- **Videollamadas (Cal.com):** cada consulta ofrece Google Meet o la ubicación «teléfono del asistente». Si la familia deja su teléfono, Mar la llama por videollamada de WhatsApp a la hora reservada. La opción WhatsApp de Cal.com no se usa, porque publicaría el número de Mar.
- **Fotos y vídeos:** solo cuando Mar los pide, y siempre con la opción «ver una vez». Mar los abre desde el móvil cuando va a valorarlos y describe en el registro lo que ve. No se conservan.
- **Registro:** la historia clínica de cada consulta se guarda en Clinic, el programa de Piel de Pomelo, como texto, al menos 5 años desde el cierre de la consulta (Ley 41/2002, art. 17; la Comunitat Valenciana no fija otro plazo). WhatsApp nunca es el archivo.
- **Cierre de cada conversación:** mensaje de cierre, pasar lo importante a Clinic, borrar el chat con sus archivos y bloquear el número. Mar bloquea al terminar cualquier conversación, no solo las consultas; si la familia vuelve a reservar, la desbloquea.

## Consecuencias

- La política de privacidad nombra el teléfono, WhatsApp (Meta), «ver una vez», el plazo de 5 años y Clinic como proveedor.
- WhatsApp Business se configura con verificación en dos pasos, sin guardar en galería y con la copia de seguridad desactivada o cifrada. Respuestas rápidas `/aviso`, `/fotos` y `/cierre`, con textos de Mar.
- Cal.com envía un recordatorio con su plantilla estándar 2 horas antes; el aviso de que llama Mar lo da ella con `/aviso` unos minutos antes. Las plantillas personalizadas de Cal.com son de pago y no hacen falta.
- Sustituye la búsqueda de un canal de archivos de `docs/canales-archivos-consultas.md`, salvo que la asesoría exija conservar las imágenes.
- Pendiente de la asesoría: si basta con describir la imagen en el registro, si conviene un plazo mayor por tratarse de menores y si WhatsApp Business es admisible para datos de salud de menores. Si alguna respuesta es negativa, esta decisión se revisa.
