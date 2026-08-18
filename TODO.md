# TODO — estado real del proyecto

Revisado contra el código actual de `main` y los worktrees de tareas. Debe actualizarse cuando cambie el estado real del proyecto.

## Estado actual

Ya están integrados en `main`:

- Textos nuevos de Consultas, Inicio y Sobre mí.
- Logo y fotografías optimizadas de Mar.
- Catálogo con las seis guías y los productos de pago marcados como “Próximamente”.
- Infraestructura segura para entregar futuras guías de pago mediante Stripe, Resend y Vercel Blob.
- Flujo web del lead magnet “25 cosas normales en los bebés”, pendiente únicamente de configuración y contenidos externos.

El worktree principal conserva materiales y cambios locales ajenos a la tarea del lead magnet. Deben revisarse por separado y nunca incluirse en un commit masivo.

No se ha encontrado ningún PDF, PPT o PPTX definitivo de las guías en el repositorio.

---

# Prioridad 0 — necesario antes de publicar

## 1. Cerrar la integración técnica

- [x] Integrar el catálogo, el logo, las fotografías y la entrega segura de guías.
- [x] Integrar el flujo web del lead magnet sin sobrescribir las versiones nuevas de `main`.
- [ ] Confirmar que los cambios locales ajenos que queden en el worktree principal pertenecen a tareas vigentes.
- [ ] Eliminar los worktrees y ramas ya integrados cuando se confirme que no contienen cambios únicos.
- [ ] Repetir el build y la revisión visual después de ordenar los cambios locales restantes.

## 2. Guardar de verdad los correos

Situación actual:

- **Resend Audiences será el almacenamiento oficial** de suscriptores; no se implementará una base de datos propia en esta fase.
- `/api/subscribe` crea o actualiza contactos existentes y comprueba los errores devueltos por Resend.
- Pedir la guía gratuita implica unirse a El Chisme de Mar. El texto y el CTA del formulario lo explican antes del envío.
- Contacto y Consultas no se añaden a la newsletter.
- Sin las variables reales de Resend, el formulario muestra error y nunca confirma falsamente el alta.

Pendiente:

- [ ] Crear o elegir la Audience de Resend.
- [ ] Configurar `RESEND_API_KEY`, `RESEND_AUDIENCE_ID` y `RESEND_FROM_EMAIL` en local y en todos los entornos de Vercel.
- [ ] Verificar que la API key tiene permisos para crear y actualizar contactos y enviar el correo de entrega.
- [ ] Configurar una baja visible y funcional en todos los emails de marketing.
- [ ] Decidir con asesoría si se utilizará alta simple o doble opt-in.
- [ ] Registrar evidencia suficiente del alta: fecha, origen (`lead-magnet-25-cosas`) y versión del texto informado.
- [ ] Probar un correo nuevo, uno existente, la baja y que un contacto dado de baja no se reactive por accidente.
- [ ] Revisar rebotes, quejas de spam y bajas en Resend.

### Contenido antes de abrir la captación

- [ ] Redactar y revisar tres ediciones de El Chisme de Mar.
- [ ] Preparar el primer artículo del Blog relacionado con uno de esos emails.
- [ ] Elegir la fecha exacta de lanzamiento y programar el primer Chisme entre 3 y 7 días después de entregar la guía.
- [ ] Crear el primer Broadcast en Resend y enviarlo antes a una lista de prueba.
- [x] Definir la cadencia editorial: un artículo mensual y un Chisme cada quince días.
- [ ] Mantener preparadas varias ediciones para cumplir la frecuencia desde el primer envío.
- [ ] Consultar la estrategia editorial completa en `docs/estrategia-blog-y-el-chisme.md`.

## 3. Crear el PDF gratuito

- [ ] Crear el contenido de **“25 cosas normales en los bebés”**.
- [ ] Crear el PowerPoint o archivo fuente editable.
- [ ] Revisar el contenido sanitario y las fuentes.
- [ ] Diseñar la portada con la identidad de pomelo.bby.
- [ ] Exportar y revisar el PDF final en móvil y escritorio.
- [ ] Añadir aviso de que el recurso es informativo y no sustituye una valoración profesional.
- [ ] Decidir dónde alojar el PDF: Vercel Blob, almacenamiento privado o una URL pública estable.
- [ ] Si se usa Vercel Blob, crear y configurar `BLOB_READ_WRITE_TOKEN` en los entornos necesarios.
- [ ] Configurar `LEAD_MAGNET_25_COSAS_URL` con la URL real.
- [ ] Configurar `RESEND_FROM_EMAIL` con un remitente verificado.
- [ ] Probar que el formulario guarda el correo y envía el enlace correcto.
- [ ] Probar el email en Gmail, Outlook y móvil, incluyendo spam y promociones.
- [ ] Evitar que la web muestre éxito si el contacto o el email no se han procesado.

## 4. Terminar la operativa de las Consultas

### Actualizar precios en Stripe

- [ ] Cambiar los precios actuales de Stripe para que coincidan con los precios definitivos de la web.
- [ ] Cuéntame por correo: **25 €**.
- [ ] Duda rápida: **45 €**.
- [ ] Hablemos tranquilamente: **89 €**.
- [ ] Crear precios nuevos en Stripe y archivar los antiguos cuando Stripe no permita modificar el importe existente.
- [ ] Actualizar los Price ID correspondientes en Vercel, Cal.com y las variables de entorno.
- [ ] Comprobar que el importe mostrado antes de pagar coincide con el importe cobrado.

### Cuéntame por correo — 25 €

- [ ] Confirmar que el Price ID configurado en `STRIPE_CONSULTA_MENSAJE_PRICE_ID` corresponde al producto y precio definitivos, tanto en test como en producción.
- [ ] Hacer una compra completa de prueba con Stripe.
- [x] Sustituir en código el remitente y destinatario de prueba por `RESEND_FROM_EMAIL` y `RESEND_TO_EMAIL`.
- [ ] Configurar ambas variables con direcciones profesionales verificadas en local y Vercel.
- [ ] Enviar a la familia un email de confirmación después de recibir el caso.
- [ ] Implementar la posibilidad real de adjuntar fotografías. Actualmente no existe un campo de subida; la web solo dice que se podrán mandar después.
- [ ] Si las fotos se guardan, definir almacenamiento privado, acceso, plazo de conservación y borrado. Pueden contener datos de salud.
- [ ] Evitar que una misma sesión de Stripe permita enviar el formulario varias veces sin control.
- [ ] Guardar el caso o implementar una cola/reintento fiable: ahora mismo, si falla Resend después del pago, los datos del formulario pueden perderse.
- [x] Enviar el caso como texto plano y validar longitudes para evitar interpretar contenido introducido como HTML.
- [ ] Evitar devolver o registrar mensajes internos del proveedor cuando falle el envío.
- [ ] Revisar el texto posterior al envío: actualmente indica que se escriba por Instagram si falta información.

### Duda rápida — 45 €

- [ ] Crear o confirmar el evento real en Cal.com.
- [ ] Sustituir `pomelo-bby/consulta-express` por el usuario y slug reales.
- [ ] Configurar duración de unos 20 minutos, disponibilidad, zona horaria, videollamada y precio.
- [ ] Probar reserva, pago, cancelación, reprogramación y emails automáticos.

### Hablemos tranquilamente — 89 €

- [ ] Crear o confirmar el evento real en Cal.com.
- [ ] Sustituir `pomelo-bby/consulta-personalizada` por el usuario y slug reales.
- [ ] Definir duración de la llamada y preguntas previas.
- [ ] Configurar precio, disponibilidad, videollamada y seguimiento de 14 días.
- [ ] Probar reserva, pago, cancelación, reprogramación y emails automáticos.

## 5. Correo profesional y formularios

- [ ] Verificar un dominio remitente en Resend con SPF, DKIM y, preferiblemente, DMARC.
- [ ] Crear y configurar el correo profesional real de Mar.
- [x] Eliminar los remitentes y destinatarios de prueba del código.
- [x] Configurar el código para usar `RESEND_FROM_EMAIL` y `RESEND_TO_EMAIL`.
- [x] Enviar Contacto como texto plano y validar los campos en servidor.
- [ ] Configurar los valores reales de las variables en local y Vercel.
- [ ] Añadir la información básica de protección de datos que corresponda a Contacto, Newsletter, lead magnet y Consultas.
- [ ] Aplicar límites de frecuencia a los formularios públicos además del honeypot.
- [ ] Confirmar que Vercel, Resend y el buzón receptor no registran cuerpos de formularios ni datos sanitarios en logs.
- [ ] Probar Contacto, Newsletter, lead magnet y Consulta por correo en producción.

## 6. Completar las páginas legales

Actualmente Aviso legal, Protección de datos, Cookies y Condiciones de venta solo muestran un texto provisional.

- [ ] Confirmar el responsable del tratamiento: nombre o razón social, NIF/CIF, domicilio profesional y correo para ejercer derechos.
- [ ] Encargar o revisar con un profesional el Aviso legal.
- [ ] Redactar la Política de protección de datos.
- [ ] Incluir newsletter, lead magnet, formularios, consultas, fotografías/datos de salud, Stripe, Cal.com, Resend, Vercel, proveedor de correo y almacenamiento de archivos.
- [ ] Definir finalidades, base jurídica, conservación, destinatarios, transferencias internacionales y ejercicio de derechos.
- [ ] Determinar la base jurídica y conservación aplicables a datos de salud de menores y si existe obligación de mantener historia clínica.
- [ ] Confirmar cómo se acredita que quien consulta es madre, padre o representante legal del menor.
- [ ] Validar legalmente que pedir la guía implica unirse a El Chisme y que el texto informado es suficiente.
- [ ] Añadir información resumida de primera capa junto a cada formulario.
- [ ] Revisar contratos de encargo, regiones de almacenamiento y transferencias de Vercel, Resend, Stripe, Cal.com y el proveedor del correo.
- [ ] Definir procedimientos para atender derechos y borrar datos al terminar cada plazo de conservación.
- [ ] Redactar la Política de cookies a partir de una auditoría real.
- [ ] Revisar Vercel Analytics, la carga automática de Cal.com y Google Fonts antes del consentimiento.
- [ ] Alojar la tipografía localmente o documentar y gestionar correctamente su carga externa.
- [ ] Añadir banner de consentimiento si las herramientas finalmente usadas lo requieren.
- [ ] Redactar Condiciones de venta para consultas y productos digitales.
- [ ] Definir cancelaciones, reprogramaciones, devoluciones, desistimiento y acceso a contenido digital.
- [ ] Añadir datos reales de la titular, identificación fiscal, domicilio profesional y contacto.
- [ ] Incluir límites del servicio: no sustituye diagnóstico, consulta médica ni atención urgente.
- [ ] Definir qué debe hacer una familia ante una urgencia; la web no debe canalizar urgencias por email.
- [ ] Sustituir `hola@pomelobby.com` en las páginas legales y el pie por el correo definitivo.

---

# Prioridad 1 — guías y tienda

## 7. Crear las cinco guías de pago

Para cada guía hay que crear PowerPoint, PDF, portada, descripción final y revisión sanitaria:

- [ ] **El sueño infantil explicado en palabras normales** — 14,90 €.
- [ ] **La guía de las rabietas** — 14,90 €.
- [ ] **Retirada del pañal sin dramas** — 12,90 €.
- [ ] **Destete sin culpa** — 12,90 €.
- [ ] **Alimentación complementaria para familias reales** — 14,90 €.

Para cada una:

- [ ] Crear el archivo fuente editable.
- [ ] Revisar contenido, bibliografía y avisos sanitarios.
- [ ] Exportar el PDF final.
- [ ] Crear portada e imagen para la tienda.
- [ ] Redactar descripción larga e índice/“qué incluye”.
- [ ] Crear producto y precio real en Stripe.
- [ ] Subir el PDF al almacenamiento elegido.
- [ ] Añadir `stripeProductId`, `stripePriceId` y `blobKey` reales.
- [ ] Cambiar su estado de `coming-soon` a `available` únicamente cuando compra y entrega funcionen.

## 8. Implementar la entrega de las guías de pago

Situación actual: la infraestructura técnica está implementada, pero ninguna guía de pago se activará hasta disponer de productos, precios, PDF y configuración externa reales.

### Cambios técnicos en la web

- [x] Validar en servidor el estado, Price ID y PDF privado antes de crear el cobro.
- [x] Añadir metadata fiable con `type=guia` y `guiaId`.
- [x] Verificar el pago y el producto desde el webhook antes de entregar.
- [x] Hacer idempotente el envío con Resend y metadata de Stripe.
- [x] Guardar referencias operativas de entrega sin duplicar el email en metadata.
- [x] Servir el PDF privado desde un endpoint que verifica la sesión de Stripe sin exponer `blobKey`.
- [x] Evitar registrar emails, enlaces de descarga e identificadores completos de sesión.
- [x] Verificar `/tienda/gracias` y diferenciar pago confirmado, pendiente, inválido y error temporal.
- [x] Mostrar mensajes genéricos ante fallos de Stripe, Resend y Blob.
- [ ] Revisar de nuevo la implementación cuando se active la primera guía real y ejecutar todas las pruebas de esta sección.

### Acciones manuales en Stripe, Resend y Vercel

- [ ] Elegir qué guía de pago se activará primero.
- [ ] Decidir cuánto dura el acceso de descarga; recomendación inicial: 30 días.
- [ ] Crear o conectar un almacén **privado** de Vercel Blob.
- [ ] Configurar `BLOB_READ_WRITE_TOKEN` en local y en los entornos Preview y Production de Vercel, sin guardar el secreto en Git.
- [ ] Subir el PDF final al almacén privado y anotar su `blobKey` exacto.
- [ ] Verificar el dominio remitente en Resend con SPF y DKIM; añadir DMARC cuando corresponda.
- [ ] Elegir la dirección remitente y configurar `RESEND_FROM_EMAIL` en local y Vercel.
- [ ] Comprobar que `RESEND_API_KEY` puede enviar desde el dominio verificado.
- [ ] Crear en Stripe test el producto y Price de la primera guía y anotar sus IDs reales.
- [ ] Registrar en Stripe test el endpoint `/api/webhook` para `checkout.session.completed` y `checkout.session.async_payment_succeeded`.
- [ ] Configurar `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y `SITE_URL` en el entorno de prueba correspondiente.
- [ ] Activar los recibos automáticos de Stripe y proteger las cuentas de Stripe, Resend y Vercel con 2FA.
- [ ] Hacer una compra test completa y comprobar el pago, un único email, la metadata de entrega y la descarga del PDF.
- [ ] Reenviar el mismo evento desde Stripe para comprobar que no se duplica el email.
- [ ] Decidir el procedimiento de soporte para verificar una compra y ampliar o regenerar un enlace caducado.
- [ ] Después de superar todas las pruebas, crear o confirmar el Product y Price equivalentes en Stripe live.
- [ ] Registrar el webhook live, configurar las variables de Production y hacer una compra real controlada antes de abrir la venta.

---

# Prioridad 2 — dominio, despliegue y acabado

## 9. Dominio y URLs definitivas

- [ ] Comprar el dominio principal definitivo.
- [ ] Configurar DNS para Vercel.
- [ ] Configurar el dominio en Vercel.
- [ ] Actualizar `SITE_URL` en local y Vercel.
- [ ] Actualizar la URL de `astro.config.mjs`.
- [ ] Actualizar `public/robots.txt` y sitemap.
- [ ] Unificar las URLs por defecto: ahora aparecen variantes de `pomelo-bby-web.vercel.app` y `pomelo-bby.vercel.app`.
- [ ] Revisar enlaces canónicos y Open Graph después del cambio.
- [ ] Decidir si se compra un segundo dominio únicamente como redirección.

## 10. Recursos visuales y contenido

- [ ] Decidir qué hacer con las imágenes y el ZIP sin seguimiento de `images/`.
- [x] Seleccionar, optimizar e integrar las fotografías de perfil.
- [ ] Convertir el logo a SVG o PNG transparente si se dispone del original; actualmente la web usa JPEG.
- [ ] Crear versiones optimizadas del logo para cabecera, pie, favicon y redes.
- [ ] Crear las portadas de las seis guías.
- [ ] Revisar descripciones de Tienda cuando exista el contenido real de cada PDF.

## 11. Limpieza del repositorio y worktrees

- [ ] Decidir si `docs/tasks/` debe añadirse al repositorio; actualmente está sin seguimiento.
- [ ] Revisar el cambio local de `AGENTS.md` antes de incluirlo.
- [x] Confirmar que no quedan archivos `.bak` en `src/pages/`; actualmente no se encuentra ninguno.
- [ ] Revisar `images/` antes de añadir archivos grandes o datos innecesarios como `.DS_Store` y ZIP.
- [ ] Eliminar `.DS_Store` y añadirlo a `.gitignore` si hace falta.
- [ ] Eliminar los worktrees limpios `task-03` y `task-04` después de confirmar que sus commits ya están integrados.
- [ ] Eliminar el worktree `task-08`, ya integrado, después de confirmar que no contiene cambios únicos.
- [ ] Eliminar las ramas de tareas ya integradas cuando se confirme que no contienen cambios únicos.
- [ ] Comprobar que no se han incluido secretos en Git.
- [ ] Mantener actualizado este TODO según el estado real y eliminar afirmaciones que queden obsoletas.

## 12. QA final

- [ ] Usar Node 24 en local/CI para coincidir con Vercel; el build actual avisa de que Node 26 no está soportado por Vercel Serverless Functions.
- [ ] Ejecutar `npm run build` después de integrar todo.
- [ ] Revisar visualmente móvil, tableta y escritorio.
- [ ] Probar navegación con teclado, foco, etiquetas y mensajes de error.
- [ ] Buscar enlaces rotos y páginas 404.
- [ ] Buscar `TODO`, `PLACEHOLDER`, emails de prueba y URLs provisionales antes de publicar.
- [ ] Probar todos los formularios con variables de producción.
- [ ] Probar Stripe y Cal.com primero en modo test y después con una operación real controlada.
- [ ] Comprobar emails en spam/promociones.
- [ ] Verificar Analytics, sitemap, robots, SEO y vista previa al compartir enlaces.
- [ ] Preparar una lista operativa para responder consultas, gestionar cancelaciones, reenviar guías y borrar datos personales.
