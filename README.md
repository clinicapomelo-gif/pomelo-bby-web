# pomelo.bby

## Documentación operativa

- [Compra y entrega de guías de pago](docs/guias-de-pago.md)
- [Estrategia de Blog, El Chisme de Mar y guía gratuita](docs/estrategia-blog-y-el-chisme.md)

## Lead magnet: “25 cosas normales en los bebés”

### Estado actual

La página, el formulario y el envío desde el servidor están implementados, pero la integración externa está **pendiente de configurar**. Mientras no se complete, un envío válido mostrará “Ahora mismo no he podido guardar tu suscripción. Inténtalo de nuevo en unos minutos”. Es el comportamiento esperado: la web no debe confirmar una entrega que no ha podido realizar.

### Pendiente antes de publicar

La lista operativa y legal completa está en [`TODO.md`](./TODO.md). No debe publicarse el formulario hasta disponer, como mínimo, del PDF final, Resend, una baja funcional, la política de privacidad y las primeras ediciones de El Chisme de Mar.

### Variables necesarias

- `RESEND_API_KEY`: clave privada de Resend.
- `RESEND_AUDIENCE_ID`: Audience donde se crea o actualiza el contacto.
- `RESEND_FROM_EMAIL`: remitente verificado, con el formato `pomelo.bby <correo@dominio-verificado>`.
- `RESEND_TO_EMAIL`: buzón profesional que recibe contacto y consultas.
- `LEAD_MAGNET_25_COSAS_URL`: URL real y estable del PDF.
- `SITE_URL`: URL pública de la web usada para validar el origen de las solicitudes.

No se deben guardar secretos en Git ni configurar una URL ficticia para el PDF. La guía y “El Chisme de Mar” tienen páginas diferentes, pero solicitar la guía también da de alta el contacto en la newsletter, tal como explican el texto y el CTA del formulario. La cadencia editorial acordada es quincenal.
