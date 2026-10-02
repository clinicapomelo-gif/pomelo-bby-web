# AGENTS.md — Pomelo Baby

## Proyecto

Web de enfermería pediátrica de Mar Vall Requena, dirigida a familias. Está construida con Astro 7, TypeScript estricto, el adaptador de Cloudflare (`@astrojs/cloudflare`, Workers) y contenido en español.

Antes de cambiar comportamiento de negocio, consulta `CONTEXT.md` y los ADR de `docs/adr/`.

## Comandos

Requiere Node.js 22.19 o superior (`engines`). **Se construye con Node.js 24** (local y Workers Builds, `NODE_VERSION=24`). En producción la web no corre en Node sino en el runtime de Workers (workerd) con `nodejs_compat`: Stripe, Resend y `node:crypto` funcionan (probado), pero no uses APIs de Node sin comprobarlas con `wrangler dev`.

```bash
npm install
npm run dev
npm run build
npm run preview
npm test
npm run check
npm run guides:test
npm run guides:check
```

npm y `package-lock.json` son canónicos; no mantengas lockfiles de otros gestores. No hay un script de lint. `npm run build` ejecuta los tests, valida el catálogo, comprueba Astro y genera la web; después de cambios de código, ejecuta como mínimo ese comando.

## Estructura y convenciones

- `src/pages/`: páginas y rutas API. Las API dinámicas deben declarar `export const prerender = false`.
- `src/layouts/Layout.astro`: layout común, navegación, footer y Analytics.
- `src/components/`: componentes reutilizables, incluido SEO y formularios.
- `src/content/blog/`: posts Markdown gestionados con Astro Content Collections.
- `src/content.config.ts`: esquema y categorías válidas del blog. Si cambian las categorías, sincroniza `src/pages/blog/index.astro`.
- `PROMPT-BLOG.md`: guía editorial y visual obligatoria. Consúltala antes de crear o modificar cualquier artículo.
- `src/data/guias.json`: catálogo editable y referencias Stripe test/live de las guías.
- `src/data/guias.ts`: tipos y API del catálogo usada por Astro.
- `src/styles/global.css`: tokens visuales, reset y utilidades globales. Reutiliza las variables CSS existentes.
- `public/`: recursos estáticos.

No edites artefactos generados en `.astro/`, `dist/` o `.wrangler/`. Mantén los componentes accesibles, responsive y coherentes con los patrones Astro/CSS existentes. Evita dependencias y abstracciones nuevas si la plataforma o el código actual ya resuelven el caso.

## Paleta visual de Pomelo

- `#EF6E71` — **Coral Pomelo:** color principal; CTA, elementos activos y acentos. No sustituirlo globalmente.
- `#92363A` — **Granate:** hover, foco y texto cuando el coral no tenga contraste suficiente.
- `#EAC4C6` — **Rosa melocotón:** fondos suaves, etiquetas y bordes.
- `#F5ECEC` — **Rosa nude:** secciones y tarjetas destacadas.
- `#F6EFE7` — **Crema:** fondo general.
- `#FFFFFF` — **Blanco:** tarjetas, formularios, header y footer.
- `#2D2D2D` — **Gris oscuro:** títulos y texto principal.
- `#5A5A5A` — **Gris medio:** texto secundario.
- `#7A7A7A` — **Gris claro:** metadatos, solo con contraste suficiente.
- `#7CB69D` — **Verde suave:** evitarlo; preferir granate o neutros, salvo estados de éxito imprescindibles.

Coral primero; granate solo como apoyo. No introducir colores ni cambiar esta jerarquía sin aprobación expresa.

Como rasgo identitario heredado de Instagram, los recuadros en Coral Pomelo llevan las letras en blanco. Conserva esta combinación en CTA y piezas visuales equivalentes.

## Reglas de diseño

- No cambies globalmente la paleta, tipografía o layout para resolver un problema local sin aprobación expresa.
- Mantén tres familias: landings con personalidad (Inicio, Sobre mí y Chisme), índices consistentes (Blog, Tienda, Consultas y Contacto) y páginas de lectura o detalle.
- Usa un solo CTA principal por bloque. Aplica hover o elevación a una tarjeta solo si toda ella es interactiva.
- La marca pública es **Pomelo Baby**. En títulos y textos destacados escribe `Pomelo&nbsp;Baby` para que nunca se parta entre dos líneas; comprueba el resultado en 1440, 1024, 390 y 320 px.
- `@pomelo.bby` es solo el usuario de Instagram. `pomelo-bby` es un identificador técnico (npm, Cloudflare, Cal.com y `metadata.app` de Stripe): no lo renombres ni lo muestres como marca.

## Backend, pagos y datos

- Stripe se usa directamente desde endpoints server-side; Resend gestiona correo transaccional, contactos y El Chisme mediante Segmentos, Topics, Broadcasts y Automations.
- Nunca expongas, registres ni confirmes secretos o datos personales. No leas ni versiones `.env`.
- Variables usadas: `SITE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_CATALOG_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONSULTA_MENSAJE_PRICE_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_NEWSLETTER_FROM_EMAIL`, `RESEND_TO_EMAIL`, `RESEND_CONSULTA_TO_EMAIL`, `RESEND_NEWSLETTER_SEGMENT_ID`, `RESEND_NEWSLETTER_TOPIC_ID`, `NEWSLETTER_CONFIRMATION_SECRET`, `APP_ENV` y `MAINTENANCE_MODE`. Se leen con `process.env` en tiempo de ejecución: en Workers, `import.meta.env` se fija al construir y los secretos no llegarían. Los PDF privados están en R2 (binding `GUIAS`, bucket `pomelo-guias`); se accede a ellos solo desde `src/lib/guide-storage.ts`.
- Valida los datos del cliente en servidor. No confíes en precios, productos, estados de pago ni identificadores enviados por el navegador.
- Conserva la verificación de firma de los webhooks de Stripe y la verificación de sesión antes de mostrar o procesar una consulta pagada.

### Entornos Stripe y guías

No hace falta una rama `develop`: cualquier rama distinta de `main` despliega el Worker de Preview (`pomelo-bby-web-preview`); `main` despliega Production (`pomelo-bby-web`). Son Workers separados porque las versiones de un mismo Worker comparten secretos: así Preview nunca ve claves Live. `npm run build:cf` elige el entorno según `WORKERS_CI_BRANCH`.

- **Development:** usa Sandbox. `STRIPE_CATALOG_KEY` restringida `rk_test_...` en `.env` y sesión de `npx wrangler login` para R2. En local, R2 es simulado y empieza vacío (ver `wrangler.jsonc`). No necesita ni debe usar claves Live para desarrollar o probar compras.
- **Preview:** usa Sandbox. `STRIPE_SECRET_KEY=sk_test_...` y `STRIPE_WEBHOOK_SECRET=whsec_...` del mismo Sandbox.
- **Production mientras no haya ventas live:** ya tiene `STRIPE_SECRET_KEY=sk_live_...` de la cuenta de Pomelo, `STRIPE_WEBHOOK_SECRET` del webhook Live y `STRIPE_CONSULTA_MENSAJE_PRICE_ID`, y el catálogo incluye los mapeos `stripe.live`. Aun así no se puede cobrar porque `GUIDES_ENABLED=false`. Esas claves viven solo en Production: Preview no debe tener ninguna clave Live.
- **Production live:** usa exclusivamente `STRIPE_SECRET_KEY=sk_live_...`, el `STRIPE_WEBHOOK_SECRET=whsec_...` del webhook Live y mapeos `stripe.live` propios. Nunca reutilizar claves, IDs de Product/Price ni secretos de webhook del Sandbox. La creación de nuevas compras de la consulta por correo seguirá bloqueada hasta disponer de persistencia duradera aprobada; una sesión ya pagada y válida sí debe poder enviar su caso.
- **Reconciliación Live local:** si los Products ya se han migrado a Live, guardar temporalmente `STRIPE_LIVE_SECRET_KEY=sk_live_...` solo en el `.env` ignorado y ejecutar `npm run guide:sync-live`. El comando solo lee Stripe Live y muestra los IDs; `npm run guide:sync-live -- --apply` escribe únicamente `stripe.live` en `src/data/guias.json`. No crea recursos, no cambia Stripe/Cloudflare, no sustituye `STRIPE_SECRET_KEY` y no habilita las guías. Eliminar esa variable local cuando termine la reconciliación.
- **Products migrados:** `guide:sync-live` identifica cada Product Live por `metadata.app=pomelo-bby` y `metadata.guiaId=<slug>`, y exige un Price predeterminado activo, EUR y de pago único con el importe del catálogo. Si faltan esos metadatos, añadirlos en Stripe Live o reconciliar los IDs manualmente; no adivinarlos por el nombre.
- **Activación de ventas:** actualmente `GUIDES_ENABLED=false`, por lo que no se puede cobrar aunque existan claves o Products. Antes de cambiarlo, cada guía disponible necesita su mapeo `stripe.live`, un webhook Live configurado, remitente Resend funcional y PDFs accesibles en R2. Desplegar y hacer una compra Live controlada de la guía más barata, verificando pago, webhook, email y descarga, antes de abrir el resto.
- **Secretos:** nunca usar una clave, token, contraseña o ID sensible como nombre de una variable de entorno. Si ocurre, rotar inmediatamente el secreto en el proveedor y eliminar la variable mal creada. Los listados de Cloudflare pueden mostrar los nombres de variables.
- **Verificación de Production:** `npx wrangler secret list --env production` confirma que un secreto existe, no que su valor sea correcto. Verificar el prefijo y la relación entre secretos en los paneles de Cloudflare y Stripe: `STRIPE_SECRET_KEY` debe ser `sk_live_...` y `STRIPE_WEBHOOK_SECRET` debe pertenecer al webhook Live de `https://pomelobaby.es/api/webhook`.

Alta y cambio de precio, siempre con dry-run primero:

```bash
node --env-file=.env scripts/guide-catalog.mjs provision --pdf /ruta/guia.pdf
node --env-file=.env scripts/guide-catalog.mjs provision --pdf /ruta/guia.pdf --apply
node --env-file=.env scripts/guide-catalog.mjs price <guiaId> --price 5,99
node --env-file=.env scripts/guide-catalog.mjs price <guiaId> --price 5,99 --apply
```

La provisión solo admite claves `rk_test_`, valida el PDF indicado, pide `APLICAR` antes de escribir y no hace commit, push ni despliegue. Consulta `docs/guias-de-pago.md` antes de operar.

## Servicios y operación

- **Cloudflare:** cuenta de clinicapomelo@gmail.com. Workers `pomelo-bby-web` (Production, rama `main`) y `pomelo-bby-web-preview` (otras ramas), desplegados por Workers Builds desde GitHub. Configuración en `wrangler.jsonc`; secretos con `npx wrangler secret put <NOMBRE> --env production|preview`. Las cabeceras de seguridad están en `public/_headers` (estáticos) y en `src/middleware.ts` (respuestas del Worker): si cambias una, cambia las dos.
- **Opciones de Cloudflare que deben estar desactivadas en la zona:** Email Address Obfuscation (rompe el CSP y oculta los emails), Rocket Loader, Bot Fight Mode (puede bloquear los webhooks de Stripe) y la inyección automática de Web Analytics.
- **Condiciones de venta con `noindex`:** `src/pages/condiciones-venta.astro` lleva `noindex={true}` porque su texto es un placeholder. **Quitarlo al publicar las Condiciones reales**, o Google no las mostrará. Lo mismo para cualquier página legal provisional.
- **Límite de envíos (WAF de Cloudflare, plan Free: 1 regla de rate limit, periodo de 10 s):** se aplica a POST en `/api/contact`, `/api/subscribe`, `/api/consulta-mensaje`, `/api/checkout` y `/api/checkout-consulta`. **Nunca incluir `/api/webhook`**: Stripe debe poder entregar los pagos.
- **Dominio y correo:** `pomelobaby.es` se compró en **DonDominio**, que sigue siendo el registrador y aloja el correo; el DNS está en Cloudflare. Los registros de correo (MX, SPF, DKIM, DMARC y los de Resend) van siempre en «DNS only». Consulta `docs/configuracion-correo-profesional.md` antes de cambiar registros DNS, MX o SMTP.
- **Resend:** gestiona correo transaccional y El Chisme. La configuración de dominios, Segmento, Topic, propiedades, Broadcasts y bajas está en `docs/configuracion-resend.md`; el diseño del doble opt-in está en `docs/arquitectura-doble-opt-in.md`.
- **Stripe y R2:** el flujo de las guías de pago está documentado en `docs/guias-de-pago.md`. No cambies precios, webhooks ni rutas privadas sin revisar ese documento.

Comandos operativos seguros de Cloudflare:

```bash
npx wrangler whoami
npx wrangler secret list --env production
npx wrangler deployments list --env production
```

Para activar o desactivar el mantenimiento en Production, solo con petición expresa: añadir o quitar `"MAINTENANCE_MODE": "true"` en `env.production.vars` de `wrangler.jsonc`, y hacer commit y push de `main`. Debe ser una variable de la configuración y no un secreto, porque las páginas estáticas se generan al construir y solo ven las variables de `wrangler.jsonc`.

Prefiere el despliegue automático al hacer `push` de `main`. No ejecutes `wrangler deploy` a mano desde un árbol con cambios locales. Resend y DonDominio se administran desde sus paneles; no guardes credenciales ni valores DNS generados en `AGENTS.md`.

## Git y commits

Todos los commits de este repositorio deben usar esta identidad como **autor y committer**:

```text
Pomelo Baby <clinicapomelo@gmail.com>
```

Algunos entornos de ejecución pueden inyectar variables `GIT_AUTHOR_*` y `GIT_COMMITTER_*` que tienen prioridad sobre `.git/config`. Por eso no basta con configurar Git: cada commit debe forzar explícitamente los cuatro valores.

```bash
git config --local user.name "Pomelo Baby"
git config --local user.email "clinicapomelo@gmail.com"

GIT_AUTHOR_NAME="Pomelo Baby" \
GIT_AUTHOR_EMAIL="clinicapomelo@gmail.com" \
GIT_COMMITTER_NAME="Pomelo Baby" \
GIT_COMMITTER_EMAIL="clinicapomelo@gmail.com" \
git commit ...
```

Después del commit, comprueba ambas identidades con:

```bash
git show -s --format='autor: %an <%ae>%ncommitter: %cn <%ce>' HEAD
```

No incluyas cambios preexistentes o ajenos a la tarea y no reescribas commits sin petición expresa.

# Voz y tono de Mar

## Quién es Mar

Enfermera pediátrica, casi 10 años de experiencia. Urgencias pediátricas, UCI Pediátrica, UCI Neonatal y consulta de Niño Sano. Su vocación no es solo tratar enfermedades, sino acompañar a familias. Mezcla ciencia, experiencia clínica real y crianza respetuosa — siempre desde un lugar humano y aterrizado.

## Cómo habla Mar

**Tono:** Cercano, cálido, directo. Como una profesional muy formada que además podría ser tu amiga.

**Reglas de escritura:**
- Lenguaje claro y sencillo. Traduce medicina a lenguaje cotidiano.
- Frases cortas. Ritmo ágil. Sin florituras.
- Género neutro siempre (incluir femenino y masculino: "tranquilo/a", "hijo o hija", "madres y padres").
- Nunca alarma, nunca culpabiliza, nunca infantiliza.
- Emocional cuando hace falta, pero sin dramatismo artificial.
- Humor sutil y natural cuando encaja.
- Evidencia científica + validación emocional, siempre juntas.
- Protectora y resolutiva a la vez: calma + herramientas prácticas.
- No transmite perfeccionismo. Transmite calma y seguridad.

**Frases que resumen su voz:**
> "Te acompaño, no te juzgo."
> "No necesitas hacerlo perfecto para hacerlo bien."
> "La crianza real no se parece a Instagram."

## Cómo trata a las familias

- Nunca juzga. Entiende el miedo y la culpa parental.
- Baja la ansiedad explicando qué es normal y qué no.
- Hace sentir capaces a madres y padres. Acompaña más que corrige.
- Da herramientas prácticas y realistas. Normaliza dudas, errores y emociones.
- Con los niños y niñas: dulce, calmada, paciente. Prioriza que se sientan seguros.

## Qué NO hace

- No habla desde la superioridad médica ni desde el "manual perfecto".
- No usa lenguaje técnico sin explicar.
- No dramatiza ni exagera para generar urgencia.
- No es corporativa, fría ni distante.
- No da lecciones. No corrige desde arriba.
- No usa solo femenino ni solo masculino.

## La sensación que debe dejar la web

Más refugio que autoridad. Más hogar que clínica. Profesional pero nada rígida.

Quien entra debe sentir:
> "Aquí puedo preguntar sin miedo."
> "Aquí me explican las cosas sin asustarme."
> "Aquí me siento acompañado/a."

## Filosofía (para decisiones de contenido)

- La información bien explicada baja la ansiedad.
- La crianza no debería vivirse desde la culpa.
- No todo es blanco o negro.
- Las familias necesitan herramientas, no juicios.
- Educa desde la calma, no desde el miedo.
