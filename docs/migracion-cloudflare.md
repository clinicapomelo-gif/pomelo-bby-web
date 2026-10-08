# Cambio de Vercel a Cloudflare: el día del cambio

Paso a paso para pasar `pomelobaby.es` de Vercel a Cloudflare Workers. El código está en la rama `cloudflare`; hasta que se decida, todo se queda en local. Lo que cambia en el día a día está en `AGENTS.md`.

## Antes de empezar

- [ ] Decisión tomada por Mar y Rafael, y Mar avisada de la ventana del cambio.
- [ ] Privacidad y Cookies con el texto de Cloudflare, aprobado por Mar y el gestor, en la rama.
- [ ] Rama `cloudflare` al día con `main` (`git merge main`) y `npm run build` sin errores.
- [ ] Workers Builds conectado al repositorio en cada Worker (opción (a) de `TODO-cloudflare.md`): build `npm run build:cf`, deploy `npx wrangler deploy` y Preview builds desactivadas. `pomelo-bby-web` con rama de producción `main`; `pomelo-bby-web-preview` con la rama de pruebas. Node 24 ya es el predeterminado.
- [ ] Secretos del Worker `pomelo-bby-web-preview` con las claves de **Sandbox** y un webhook de Sandbox que apunte a su URL `*.workers.dev`.
- [ ] Preview probada:
  - compra de cada guía, con correo y descarga;
  - el mismo evento reenviado no duplica el correo;
  - una sesión inventada se rechaza;
  - Contacto, cabeceras y `noindex`;
  - el calendario de Cal.com (activando las consultas solo en local);
  - en los logs del Worker, el CPU del webhook por debajo de 10 ms.
- [ ] Secretos del Worker `pomelo-bby-web` con las claves **Live** de hoy (las mismas que tiene Vercel Production): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONSULTA_MENSAJE_PRICE_ID`, `RESEND_*` y `NEWSLETTER_CONFIRMATION_SECRET`. Comprobar con `npx wrangler secret list --env production`.

## 48 horas antes

- [x] TTL de los registros en DonDominio: ya está en 60 s (comprobado el 8 oct 2026), no hace falta bajarlo.
- [ ] Añadir `pomelobaby.es` a Cloudflare (plan Free) **sin cambiar todavía los nameservers**, y revisar que la importación ha copiado estos registros. En la columna Proxy, «DNS only» significa la nube gris.

| Nombre | Tipo | Para qué | Proxy |
| --- | --- | --- | --- |
| `pomelobaby.es` | MX | Correo de DonDominio | DNS only |
| `pomelobaby.es` | TXT | SPF (`v=spf1 include:spf.dondominio.com`) | — |
| `pomelobaby.es` | TXT | Verificación de Search Console | — |
| `_dmarc` | TXT | DMARC | — |
| `resend._domainkey` | TXT | DKIM de Resend | — |
| `send` | MX | Rebotes de Resend (Amazon SES) | DNS only |
| `send` | TXT | SPF de Resend | — |
| `mail` | CNAME | Servidor de correo de DonDominio | DNS only |
| `autodiscover`, `autoconfig` | CNAME | Configuración automática del correo | DNS only |
| `pomelobaby.es` (A) y `www` (CNAME) | | Apuntan a Vercel: **se sustituyen** el día del cambio | — |

Valores: copiarlos del panel de DonDominio, no de este documento.

- [ ] En Cloudflare, desactivar:
  - Email Address Obfuscation: rompe el CSP y oculta los emails.
  - Rocket Loader.
  - Bot Fight Mode: puede bloquear los webhooks de Stripe.
  - Inyección automática de Web Analytics: el beacon ya va en el código.
- [ ] Activar SSL/TLS «Full (strict)» y «Always Use HTTPS».

## El día del cambio

1. **Desconectar Git en Vercel** (Project → Settings → Git) para que no intente construir el código de Cloudflare. La web sigue servida por el último despliegue de Vercel.
2. **Fusionar `cloudflare` en `main` y hacer push.** Workers Builds despliega `pomelo-bby-web`. Comprobar en su URL `*.workers.dev` que la web carga.
3. **Cambiar los nameservers en DonDominio** a los dos que indica Cloudflare. DNSSEC está desactivado (no hay registro DS), así que no hay que tocarlo. Esperar a que Cloudflare marque la zona como activa.
4. **Dominio del Worker:** borrar los registros A y CNAME de Vercel, y añadir `pomelobaby.es` como Custom Domain del Worker `pomelo-bby-web`.
5. **Redirección `www`:** una Redirect Rule de `www.pomelobaby.es/*` a `https://pomelobaby.es/${1}`, de tipo 301, conservando la query. `www` necesita un registro proxied (por ejemplo, AAAA a `100::`).
6. **Rate limit:** una regla de WAF por ruta para `/api/contact`, `/api/subscribe`, `/api/consulta-mensaje`, `/api/checkout` y `/api/checkout-consulta` (el plan Free solo filtra por ruta, no por método; son rutas que solo reciben POST). **Nunca incluir `/api/webhook`.**
7. **Commit en `main`:**
   - `"workers_dev": false` en `env.production` de `wrangler.jsonc`;
   - `scripts/check-domain.sh` actualizado para Cloudflare.

## Comprobar

- [ ] Web, `www` → raíz y `http` → `https`.
- [ ] La cabecera `strict-transport-security` está presente.
- [ ] `/robots.txt` permite el rastreo.
- [ ] Un correo de entrada y otro de salida en `hola@` y `mar@`.
- [ ] Resend sigue con el dominio verificado.
- [ ] Search Console sigue verificado y lee el sitemap.
- [ ] El webhook Live de Stripe sigue en `https://pomelobaby.es/api/webhook`. La URL no cambia: comprobar que las entregas responden 200 cuando haya ventas.
- [ ] Web Analytics de Cloudflare empieza a contar visitas.

## Volver atrás

En el DNS de Cloudflare:

1. Quitar el Custom Domain del Worker.
2. Añadir el A de la raíz y el CNAME de `www` hacia Vercel, en «DNS only». Los valores de hoy están en el panel de Vercel → Domains.
3. Volver a conectar Git en Vercel.

El último despliegue de Vercel y su Blob siguen funcionando mientras no se retiren.

## Una semana después

- [ ] Retirar Vercel: el proyecto y el almacén Blob. Los PDF ya están en R2.
- [ ] Borrar de R2 las dos claves antiguas con tildes, que ya no se usan: «CONSERVACIÓN LECHE MATERNA.pdf» y «25 cosas normales en bebés… -3.pdf».
