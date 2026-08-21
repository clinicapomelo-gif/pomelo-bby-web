# pomelo.bby

## Documentación operativa

- [Compra y entrega de guías de pago](docs/guias-de-pago.md)
- [Configuración de Resend](docs/configuracion-resend.md)
- [Configuración del correo profesional](docs/configuracion-correo-profesional.md)
- [Arquitectura de doble opt-in](docs/arquitectura-doble-opt-in.md)
- [Estrategia de Blog, El Chisme de Mar y guía gratuita](docs/estrategia-blog-y-el-chisme.md)

## Comprobar el dominio

```bash
npm run check:domain
npm run check:domain -- --watch
```

El script Bash `scripts/check-domain.sh` comprueba la delegación, los registros de la web y del correo, HTTPS y la redirección de `www`. Con `--watch` repite la comprobación cada 30 segundos hasta que todo funciona.

## Lead magnet: “25 cosas normales en los bebés”

### Estado actual

El doble opt-in, el alta en Resend y la descarga están implementados y se han probado en Preview de extremo a extremo. En Production todavía faltan la configuración definitiva de Resend y el remitente del dominio profesional. Mientras falten, la web devolverá un error temporal y no confirmará una suscripción que no haya podido iniciar.

### Pendiente antes de publicar

La lista operativa y legal completa está en [`TODO.md`](./TODO.md). No debe publicarse el formulario hasta disponer, como mínimo, del PDF final, Resend, una baja funcional, la política de privacidad y las primeras ediciones de El Chisme de Mar.

### Variables necesarias

- `RESEND_API_KEY`: clave privada de Resend.
- `RESEND_NEWSLETTER_SEGMENT_ID`: segmento interno con todas las personas de El Chisme.
- `RESEND_NEWSLETTER_TOPIC_ID`: Topic público que controla la preferencia de El Chisme.
- `NEWSLETTER_CONFIRMATION_SECRET`: clave aleatoria de 32 bytes para cifrar enlaces de confirmación.
- `RESEND_FROM_EMAIL`: remitente verificado, con el formato `pomelo.bby <correo@dominio-verificado>`.
- `RESEND_TO_EMAIL`: buzón profesional que recibe contacto y consultas.
- `BLOB_STORE_ID` y `VERCEL_OIDC_TOKEN`: acceso al Blob privado; Vercel los proporciona al conectar el store en cada entorno.
- `SITE_URL`: URL pública de la web usada para validar el origen de las solicitudes.

No se deben guardar secretos en Git ni exponer la URL privada del PDF. La guía y “El Chisme de Mar” tienen páginas diferentes, pero solicitar la guía también da de alta el contacto en la newsletter, tal como explican el texto y el CTA del formulario. La cadencia editorial acordada es quincenal.
