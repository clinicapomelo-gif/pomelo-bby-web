# TODO — Migración de Vercel a Cloudflare

Objetivo: dejar Vercel, porque el plan Hobby no permite uso comercial. Última revisión: 2 oct 2026.

**Estado:** el código está terminado y probado en local en la rama `cloudflare`, que no está subida a GitHub. Probado en local:
- compra completa: pago, webhook, un solo correo y descarga desde R2;
- `npm run dev` y la build;
- la ventana de Cal.com abriéndose sobre la página.

Ya existen la cuenta de Cloudflare (clinicapomelo@gmail.com), el bucket R2 `pomelo-guias` con los PDF y el token de Web Analytics. Paso a paso detallado: `docs/migracion-cloudflare.md`.

Para retomarlo: `git checkout cloudflare && npm ci`. La rama usa Astro 7.3.5 y el adaptador de Cloudflare; `main` sigue con Vercel.

## Tiempos a tener en cuenta

- **Despliegue:** cada push tarda **unos 3–5 minutos** en estar publicado en Workers Builds: cola, `npm ci`, tests, `astro check` y build. En Vercel era parecido. Cambiar un secreto (`wrangler secret put`) es inmediato y no necesita build. Activar el modo mantenimiento sí necesita build, porque va en `wrangler.jsonc`.
- **Propagación del DNS:**
  - Bajar el TTL a 300 s en DonDominio solo sirve si se hace **48 h antes**, para que caduque el TTL antiguo.
  - El cambio de **nameservers** lo publica el registro `.es` y puede tardar **de unas horas a 24–48 h**. Mientras tanto, unas personas verán Vercel y otras Cloudflare.
  - Por eso los dos sitios deben funcionar a la vez, con las mismas claves Live. Los webhooks de Stripe pueden llegar a cualquiera de los dos; no hay correos duplicados porque la entrega es idempotente.
  - El correo sigue funcionando solo si **todos los registros de correo ya están copiados en Cloudflare antes** de cambiar los nameservers.
- **Certificado HTTPS:** al conectar `pomelobaby.es` al Worker, Cloudflare emite el certificado en unos minutos (puede llegar a 15–30). Mientras tanto, HTTPS puede fallar.
- **Ventana del cambio:** un día entre semana por la mañana, nunca en viernes, con unas 2 horas libres para comprobar. No hay que tocar nada más del DNS hasta 48 h después.
- **Vuelta atrás:** apuntar el dominio otra vez a Vercel desde el DNS de Cloudflare tarda los 5 minutos del TTL. Funciona mientras Vercel no se borre: el paso 20 va siempre una semana después.

## 1. Decidir y preparar (sin publicar nada)

- [ ] 1. **[Mar + Rafael]** Decidir la migración y el día del cambio. Avisar a Mar.
- [ ] 2. **[Rafael / Vicente]** Cloudflare → Manage Account → Billing: tarjeta y dirección de facturación de Piel de Pomelo S.L.P. Crear la alerta de gasto de 1 $ en Billing → Billable Usage → Create budget alert.
- [ ] 3. **[Dev → Mar + asesoría]** Privacidad y Cookies: cambiar Vercel por Cloudflare (alojamiento, almacenamiento de las guías y analítica). Se publica el día del cambio, no antes.
- [ ] 4. **[Dev]** Cal.com: cambiar la opción obsoleta `styles` por `cssVarsPerTheme` en `src/scripts/cal-embed.js`.

## 2. Preview en internet (no afecta a Vercel ni a pomelobaby.es)

- [ ] 5. **[Rafael + Dev]** Cloudflare → Workers & Pages → conectar el repositorio de GitHub (Workers Builds):
  - comando de build `npm run build:cf`;
  - comando de deploy `npx wrangler deploy`, también para las ramas que no son de producción (no `versions upload`);
  - variable de build `NODE_VERSION=24`;
  - rama de producción `main`.
  - Si falta el subdominio `workers.dev`, abrir una vez Workers & Pages en el panel.
- [ ] 6. **[Rafael]** Vercel → Settings → Git → Ignored Build Step: que no construya la rama `cloudflare`.
- [ ] 7. **[Dev]** Subir la rama `cloudflare`. Se publica `pomelo-bby-web-preview` en `*.workers.dev`; tarda unos 5 minutos.
- [ ] 8. **[Dev]** Secretos de la preview con las claves de **Sandbox** (`npx wrangler secret put … --env preview`). Crear en Stripe Sandbox un webhook que apunte a `https://<preview>.workers.dev/api/webhook`. Pedir a Rafael `RESEND_FROM_EMAIL` y las demás claves que no están en `.env`.
- [ ] 9. **[Rafael + Mar]** Probar la preview:
  - comprar una guía y descargarla desde el enlace real del correo (¿cae en spam?);
  - Contacto;
  - el calendario de Cal.com, con las consultas activadas solo en la preview;
  - desde el móvil;
  - que Mar la vea.
- [ ] 10. **[Dev]** En Workers → Logs, comprobar que el webhook y las páginas de gracias usan **menos de 10 ms de CPU**, el límite del plan gratuito. Si no, valorar el plan de pago (5 $/mes).

## 3. Preparar producción (48 h antes del cambio)

- [ ] 11. **[Dev]** Secretos **Live** en `pomelo-bby-web`, los mismos que tiene hoy Vercel Production. Comprobar con `npx wrangler secret list --env production`.
- [ ] 12. **[Rafael]** DonDominio: bajar el TTL de todos los registros a 300 s. **Tiene que ser 48 h antes.**
- [ ] 13. **[Rafael + Dev]** Añadir `pomelobaby.es` a Cloudflare (plan Free) **sin cambiar aún los nameservers**. Revisar uno a uno los registros importados con la tabla de `docs/migracion-cloudflare.md`:
  - MX y SPF de DonDominio;
  - Search Console;
  - DMARC;
  - DKIM, MX y SPF de Resend (`send`);
  - `mail`, `autodiscover` y `autoconfig`.
  
  Todo lo de correo, en «DNS only».
- [ ] 14. **[Rafael + Dev]** En Cloudflare, desactivar Email Address Obfuscation, Rocket Loader, Bot Fight Mode y la inyección automática de Web Analytics. Activar SSL «Full (strict)» y «Always Use HTTPS».

## 4. Día del cambio

- [ ] 15. **[Rafael]** Vercel → Settings → Git: desconectar el repositorio. La web sigue funcionando con el último despliegue.
- [ ] 16. **[Dev]** Fusionar `cloudflare` en `main` y subir. Esperar unos 5 minutos y comprobar la web en la URL `*.workers.dev` de producción.
- [ ] 17. **[Rafael]** DonDominio: cambiar los nameservers a los dos de Cloudflare. DNSSEC está desactivado, así que no hay que tocarlo. Esperar a que Cloudflare marque la zona como activa: de minutos a horas.
- [ ] 18. **[Dev]**
  - Quitar los registros A y CNAME de Vercel y añadir `pomelobaby.es` como Custom Domain del Worker. Esperar al certificado.
  - Redirect Rule 301 de `www` al dominio principal.
  - Regla de WAF de límite de envíos, **sin `/api/webhook`**.
  - Commit con `"workers_dev": false` en producción.
- [ ] 19. **[Rafael + Dev]** Comprobar:
  - la web y `www`;
  - HTTPS y HSTS;
  - `robots.txt`;
  - un correo de entrada y otro de salida en `hola@` y `mar@`;
  - Resend verificado;
  - Search Console;
  - Web Analytics;
  - el webhook de Stripe.
  
  **Repetir las comprobaciones de correo a las 24 h y a las 48 h**, por la propagación.

## 5. Una semana después, sin problemas

- [ ] 20. **[Rafael]** Borrar el proyecto de Vercel y su almacén Blob. A partir de aquí ya no se puede volver atrás a Vercel.
- [ ] 21. **[Dev]** Borrar de R2 las dos copias antiguas con tildes («CONSERVACIÓN LECHE MATERNA.pdf» y «25 cosas normales en bebés… -3.pdf»).
- [ ] 22. **[Dev]** Actualizar `scripts/check-domain.sh` y los documentos de DNS y correo que todavía nombran Vercel. Quitar este archivo y la sección C de `TODO.md`.
