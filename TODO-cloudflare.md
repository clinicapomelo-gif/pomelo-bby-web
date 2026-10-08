# TODO — Migración de Vercel a Cloudflare

Objetivo: dejar Vercel, porque el plan Hobby no permite uso comercial. Última revisión: 8 oct 2026, 17:00.

**Urgencia:** Vercel considera comercial cualquier despliegue que busque un beneficio económico de quien participa en el proyecto, y pone como ejemplo «anunciar la venta de un producto o servicio», no solo cobrar ([Fair Use Guidelines](https://vercel.com/docs/limits/fair-use-guidelines)). Una web de empresa que presenta consultas y guías, aunque estén en «Próximamente», está como mínimo en zona gris: migrar cuanto antes.

**Estado (8 oct 2026, 18:00):** **migración hecha.** La zona se activó a las 16:12 y `pomelobaby.es` se sirve desde el Worker; comprobaciones superadas. Queda revisar mañana y la limpieza de dentro de una semana.
- `main` tiene el código de Cloudflare; Vercel está desconectado de Git y sigue sirviendo su último despliegue mientras se propaga el DNS.
- Workers `pomelo-bby-web` (producción, claves Live, rama `main`) y `pomelo-bby-web-preview` (Sandbox, rama `cloudflare`) publicados por Workers Builds.
- Zona `pomelobaby.es` creada en Cloudflare (plan Free, nameservers `mark` y `nelly`), con los 20 registros de DonDominio en «DNS only» (incluido el DKIM `dddk._domainkey` del correo de DonDominio).
- `pomelobaby.es` ya es Custom Domain del Worker de producción, con certificado: al activarse la zona, la web pasa sola al Worker.
- **Vuelta atrás:** quitar el Custom Domain y crear el registro A `@` → `216.198.79.1` en «DNS only» (Vercel); `www` apunta a Vercel por CNAME.
- El aviso de DonDominio «servicios del plan de alojamiento inactivos» es genérico con DNS externos: el correo del plan Mini sigue funcionando si los registros están en Cloudflare ([tutorial de DonDominio](https://dondominio.blog/tutoriales/como-configurar-las-dns-de-dondominio-en-cloudflare/)).

## Los Workers

La web corre en **Cloudflare Workers**, el equivalente a las funciones de Vercel, que también sirve los archivos estáticos. Hay dos, definidos en `wrangler.jsonc`:

| Worker | Rama | Claves de Stripe | Dirección |
| --- | --- | --- | --- |
| `pomelo-bby-web` | `main` | Live | `pomelobaby.es`; `*.workers.dev` solo hasta el cambio |
| `pomelo-bby-web-preview` | Las demás | Sandbox | `pomelo-bby-web-preview.<subdominio>.workers.dev`, con `noindex` |

- Se separaron en dos Workers porque las versiones de un mismo Worker comparten secretos: así la preview nunca ve claves Live.
- **Cambio de Cloudflare (1 oct 2026):** los Workers nuevos usan [Worker Previews](https://developers.cloudflare.com/workers/previews/) para las ramas que no son la de producción: `npx wrangler preview`, con variables, secretos y bindings propios (no heredan los de producción) y `noindex` en `workers.dev`. Con ellas, el motivo de tener dos Workers desaparece. **Decidido el 8 oct: opción (a).**
  - **(a) Mantener los dos Workers** con la configuración documentada para entornos ([Advanced setups](https://developers.cloudflare.com/workers/ci-cd/builds/advanced-setups/#wrangler-environments)): conectar el repositorio a cada Worker por separado. Sin cambios de código. Recomendado para migrar ya.
  - **(b) Un solo Worker con Worker Previews:** bloque `previews` en `wrangler.jsonc` y secretos de Sandbox para las previews. Más simple a largo plazo, pero sin probar con el adaptador de Astro (requiere Wrangler 4.135 o superior; el proyecto tiene 4.146).
- Construir sin entorno genera `pomelo-bby-web-dev`, solo para local: nunca pisa producción.
- **Plan gratuito de Workers:**
  - 100.000 peticiones dinámicas al día, que se reinician a medianoche UTC; las páginas estáticas no cuentan y son ilimitadas.
  - Ráfagas de hasta 1.000 peticiones por minuto.
  - 10 ms de CPU por petición, sin contar la espera de red.
  - 50 llamadas externas por petición.
  - Si no basta, el plan de pago cuesta 5 $/mes.
- **Ver qué pasa:** Workers & Pages → Worker → Logs (`observability` activado) y Deployments, para volver a una versión anterior. Por terminal: `npx wrangler deployments list --env production`.

## Tiempos a tener en cuenta

- **Despliegue:** cada push tarda **unos 3–5 minutos** (estimación propia; Cloudflare no publica una cifra) en estar publicado en Workers Builds: cola, `npm ci`, tests, `astro check` y build. En Vercel era parecido. Cambiar un secreto (`wrangler secret put`) es inmediato y no necesita build. Activar el modo mantenimiento sí necesita build, porque va en `wrangler.jsonc`.
- **Propagación del DNS:**
  - **No hace falta bajar el TTL:** el 8 oct los registros de `pomelobaby.es` en DonDominio ya tenían 60 s (comprobado con los resolutores de Google y Cloudflare). Además, el TTL de los registros no controla la delegación de nameservers, que publica el registro `.es`.
  - Según varios proveedores, el `.es` publica los cambios de nameservers **6 veces al día: 02, 06, 10, 14, 18 y 22 h** ([BlumHost](https://blumhost.net/blog/hora-actualizacion-dns-dominios-es/), [ProfesionalHosting](https://www.profesionalhosting.com/blog/dominios/actualizacion-dns-dominios-frecuencia/)); la guía oficial de dominios.es no lo dice. Un cambio a las 11:00 se publica a las 14:00.
  - Después, la propagación puede tardar **de unas horas a 24 h** (Cloudflare: «hasta 24 horas»). Mientras tanto, unas personas verán Vercel y otras Cloudflare.
  - Por eso los dos sitios deben funcionar a la vez, con las mismas claves Live. Los webhooks de Stripe pueden llegar a cualquiera de los dos; no hay correos duplicados porque la entrega es idempotente.
  - El correo sigue funcionando solo si **todos los registros de correo ya están copiados en Cloudflare antes** de cambiar los nameservers.
- **Certificado HTTPS:** al conectar `pomelobaby.es` al Worker, Cloudflare emite el certificado en segundos o pocos minutos ([Custom Domains](https://blog.cloudflare.com/custom-domains-for-workers)). Mientras tanto, HTTPS puede fallar.
- **Ventana del cambio:** un día entre semana, nunca en viernes, con unas 2 horas libres para comprobar. Cambiar los nameservers antes de una ventana del `.es` (por ejemplo, antes de las 10:00 o las 14:00) para tener la tarde para revisar. No hay que tocar nada más del DNS hasta 48 h después.
- **Vuelta atrás:** apuntar el dominio otra vez a Vercel desde el DNS de Cloudflare tarda los 5 minutos del TTL. Funciona mientras Vercel no se borre: el paso 20 va siempre una semana después.

## 1. Decidir y preparar (sin publicar nada)

- [x] 1. **[Mar + Rafael]** Decidir la migración y el día del cambio. Avisar a Mar.
- [ ] 2. **[Rafael / Vicente]** Cloudflare → Manage Account → Billing: tarjeta y dirección de facturación de Piel de Pomelo S.L.P. La alerta de gasto de 1 $ ya está creada (2 oct 2026).
- [x] 3. **[Dev → Mar + asesoría]** Privacidad y Cookies: cambiar Vercel por Cloudflare (alojamiento, almacenamiento de las guías y analítica). **Redactado en la rama `cloudflare` el 8 oct; falta que Mar lo apruebe.** Se publica el día del cambio, no antes: ese día, poner la fecha en «Última actualización» de las dos páginas.
- [x] 4. **[Dev]** Cal.com: cambiada la opción obsoleta `styles` por `cssVarsPerTheme` en `src/scripts/cal-embed.js` (8 oct): coral, letras blancas y granate al pasar por encima. Falta verlo en la preview.

## 2. Preview en internet (no afecta a Vercel ni a pomelobaby.es)

- [x] 5. **[Rafael + Dev]** Cloudflare → Workers & Pages → conectar el repositorio de GitHub (Workers Builds) con la opción (a); la (b) queda como referencia:
  - **(a) Dos Workers:** conectar el repositorio a cada uno. En `pomelo-bby-web`: rama de producción `main`, build `npm run build:cf`, deploy `npx wrangler deploy` y **Preview builds desactivadas**. En `pomelo-bby-web-preview`: rama de producción, la rama de pruebas (hoy `cloudflare`), el mismo build y deploy, y Preview builds desactivadas. `build:cf` elige el entorno por la rama (`WORKERS_CI_BRANCH`).
  - **(b) Worker Previews:** un solo Worker con rama de producción `main`, deploy `npx wrangler deploy` y Preview command `npx wrangler preview`; antes, adaptar `wrangler.jsonc` y probarlo.
  - Ya no hace falta `NODE_VERSION`: Node 24 es el predeterminado de la imagen de build ([Build image](https://developers.cloudflare.com/workers/ci-cd/builds/build-image)).
  - Si falta el subdominio `workers.dev`, abrir una vez Workers & Pages en el panel.
- [x] 6. **[Rafael]** Vercel → Settings → Git → Ignored Build Step: que no construya la rama `cloudflare`.
- [x] 7. **[Dev]** Subir la rama `cloudflare`. Se publica `pomelo-bby-web-preview` en `*.workers.dev`; tarda unos 5 minutos.
- [x] 8. **[Dev]** Secretos de la preview con las claves de **Sandbox** (`npx wrangler secret put … --env preview`). Crear en Stripe Sandbox un webhook que apunte a `https://<preview>.workers.dev/api/webhook`. Pedir a Rafael `RESEND_FROM_EMAIL` y las demás claves que no están en `.env`.
- [x] 9. **[Rafael + Mar]** Probar la preview:
  - comprar una guía y descargarla desde el enlace real del correo (¿cae en spam?);
  - Contacto;
  - el calendario de Cal.com, con las consultas activadas solo en la preview;
  - desde el móvil;
  - que Mar la vea.
- [x] 10. **Medido el 8 oct:** en caliente 1–10 ms; la primera petición de cada instancia (arranque en frío) llega a 21–31 ms en el webhook y las páginas de gracias. Cloudflare tolera excesos ocasionales; vigilar el error 1102 la primera semana y, si aparece, pasar al plan de pago (5 $/mes). **[Dev]** En Workers → Logs, comprobar que el webhook y las páginas de gracias usan **menos de 10 ms de CPU**, el límite del plan gratuito. Si no, valorar el plan de pago (5 $/mes).

## 3. Preparar producción (se puede hacer el mismo día del cambio)

- [x] 11. **[Dev]** Secretos **Live** en `pomelo-bby-web`, los mismos que tiene hoy Vercel Production. Comprobar con `npx wrangler secret list --env production`.
- [x] 12. ~~DonDominio: bajar el TTL 48 h antes.~~ No hace falta: el 8 oct los registros ya tenían 60 s. Solo comprobar que siguen igual el día del cambio.
- [x] 13. **[Rafael + Dev]** Añadir `pomelobaby.es` a Cloudflare (plan Free) **sin cambiar aún los nameservers**. Revisar uno a uno los registros importados con la tabla de `docs/migracion-cloudflare.md`:
  - MX y SPF de DonDominio;
  - Search Console;
  - DMARC;
  - DKIM, MX y SPF de Resend (`send`);
  - `mail`, `autodiscover` y `autoconfig`.
  
  Todo lo de correo, en «DNS only».
- [x] 14. **Hecho y comprobado por API el 8 oct**, más: SPF de la raíz con `~all`, IA de entrenamiento bloqueada (búsqueda y agentes permitidos) y Bot Preference Sync apagado. **[Rafael + Dev]** En Cloudflare, desactivar Email Address Obfuscation, Rocket Loader, Bot Fight Mode y la inyección automática de Web Analytics. Activar SSL «Full (strict)» y «Always Use HTTPS».

## 4. Día del cambio

- [x] 15. **[Rafael]** Vercel → Settings → Git: desconectar el repositorio. La web sigue funcionando con el último despliegue.
- [x] 16. **[Dev]** Fusionar `cloudflare` en `main` y subir. Esperar unos 5 minutos y comprobar la web en la URL `*.workers.dev` de producción.
- [x] 17. **[Rafael]** DonDominio: cambiar los nameservers a los dos de Cloudflare. DNSSEC está desactivado, así que no hay que tocarlo. Esperar a que Cloudflare marque la zona como activa: de minutos a horas.
- [x] 18. **[Dev]** Hecho el 8 oct: Custom Domain (declarado también en `wrangler.jsonc`), `www` con proxy y Redirect Rule 301, regla «Limitar formularios» (probada: 429 a partir de la 11.ª petición, el webhook nunca se bloquea) y `"workers_dev": false` en producción. Zona activa a las 16:12.
  - Quitar los registros A y CNAME de Vercel y añadir `pomelobaby.es` como Custom Domain del Worker. Esperar al certificado.
  - Redirect Rule 301 de `www` al dominio principal.
  - Regla de WAF de límite de envíos, **sin `/api/webhook`**. En el plan gratuito solo hay 1 regla, ventana y bloqueo de 10 s, por IP, y la condición **solo puede usar la ruta** (no el método POST): poner la lista de rutas de `AGENTS.md`, que solo reciben POST ([Rate limiting](https://developers.cloudflare.com/waf/rate-limiting-rules/)).
  - Commit con `"workers_dev": false` en producción.
- [x] 19. **Comprobado el 8 oct:** web, `www` → raíz, `http` → `https`, HSTS, certificado (Google Trust Services, hasta enero de 2027), `robots.txt`, analítica, webhook (400 sin firma), correo de entrada y salida en `hola@` y `mar@` (fuera de spam), Resend verificado y Search Console (URL disponible para Google, sitemap correcto).
- [ ] 19b. **[Rafael]** 9 oct: repetir la prueba de correo (24 h de propagación) y mirar Search Console → Estadísticas de rastreo → Estado del host.
- [ ] 19c. **[Dev]** Primera semana (8 oct, primeras horas: 398 peticiones, 0 errores, CPU mediana 1,8 ms y máxima 17 ms): revisar en Workers → Logs que no aparezca el error 1102 (CPU). Si aparece, plan de pago (5 $/mes).

## Otros ajustes del 8 oct

- DMARC: los informes van a `hola@pomelobaby.es` (antes a `dmarc@`, que no existe). Sigue en `p=none`; pasar a `p=quarantine` cuando los informes salgan limpios unas semanas.
- Stripe Sandbox: borrado el webhook que apuntaba a `pomelobaby.es`; queda solo el de la preview.
- **[Rafael]** Guardar una copia de los PDF originales de las guías fuera de Cloudflare (Drive u ordenador): al borrar Vercel, R2 será la única copia en internet.
- Opcional: activar DNSSEC en Cloudflare y añadir el registro DS en DonDominio.

## 5. Una semana después, sin problemas

- [ ] 20. **[Rafael]** Borrar el proyecto de Vercel y su almacén Blob. A partir de aquí ya no se puede volver atrás a Vercel.
- [x] 21. **[Dev]** Borradas de R2 el 8 oct las dos copias antiguas con tildes; quedan los 14 PDF en uso.
- [ ] 22. **[Dev]** Actualizar `scripts/check-domain.sh` y los documentos de DNS y correo que todavía nombran Vercel. Quitar este archivo y la sección C de `TODO.md`.
