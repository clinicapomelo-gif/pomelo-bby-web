# AGENTS.md — pomelo.bby

## Proyecto

Web de enfermería pediátrica de Mar Vall Requena, dirigida a familias. Está construida con Astro 6, TypeScript estricto, el adaptador de Vercel y contenido en español.

Antes de cambiar comportamiento de negocio, consulta `CONTEXT.md` y los ADR de `docs/adr/`.

## Comandos

Requiere Node.js 22.12 o superior. Prefiere Node.js 24 para reproducir el runtime de Vercel; Node.js 26 genera una advertencia del adaptador.

```bash
npm install
npm run dev
npm run build
npm run preview
```

No hay una suite de tests ni un script de lint. Después de cambios de código, ejecuta como mínimo `npm run build`.

## Estructura y convenciones

- `src/pages/`: páginas y rutas API. Las API dinámicas deben declarar `export const prerender = false`.
- `src/layouts/Layout.astro`: layout común, navegación, footer y Analytics.
- `src/components/`: componentes reutilizables, incluido SEO y formularios.
- `src/content/blog/`: posts Markdown gestionados con Astro Content Collections.
- `src/content.config.ts`: esquema y categorías válidas del blog. Si cambian las categorías, sincroniza `src/pages/blog/index.astro`.
- `src/data/guias.ts`: catálogo y referencias de Stripe de las guías.
- `src/styles/global.css`: tokens visuales, reset y utilidades globales. Reutiliza las variables CSS existentes.
- `public/`: recursos estáticos.

No edites artefactos generados en `.astro/`, `dist/` o `.vercel/`. Mantén los componentes accesibles, responsive y coherentes con los patrones Astro/CSS existentes. Evita dependencias y abstracciones nuevas si la plataforma o el código actual ya resuelven el caso.

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

## Backend, pagos y datos

- Stripe se usa directamente desde endpoints server-side; Resend gestiona correo transaccional, contactos y El Chisme mediante Segmentos, Topics, Broadcasts y Automations.
- Nunca expongas, registres ni confirmes secretos o datos personales. No leas ni versiones `.env`.
- Variables usadas: `SITE_URL`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CONSULTA_MENSAJE_PRICE_ID`, `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `RESEND_TO_EMAIL`, `RESEND_NEWSLETTER_SEGMENT_ID`, `RESEND_NEWSLETTER_TOPIC_ID`, `NEWSLETTER_CONFIRMATION_SECRET`, `BLOB_STORE_ID`, `VERCEL_OIDC_TOKEN` y `BLOB_READ_WRITE_TOKEN`.
- Valida los datos del cliente en servidor. No confíes en precios, productos, estados de pago ni identificadores enviados por el navegador.
- Conserva la verificación de firma de los webhooks de Stripe y la verificación de sesión antes de mostrar o procesar una consulta pagada.

## Servicios y operación

- **Vercel:** proyecto `pomelo-bby/pomelo-bby-web`. `main` despliega Production. La URL estable de Vercel es `https://pomelo-bby-web.vercel.app` y el dominio definitivo es `https://pomelobaby.es` cuando su DNS esté operativo.
- **Dominio y correo:** `pomelobaby.es` se compró en **DonDominio**, que actúa como registrador y proveedor DNS. La web sigue alojada en Vercel; la recepción y el SMTP del correo profesional se configurarán en DonDominio según `docs/configuracion-correo-profesional.md`. Consulta ese documento antes de cambiar registros DNS, MX o SMTP.
- **Resend:** gestiona correo transaccional y El Chisme. La configuración de dominios, Segmento, Topic, propiedades, Broadcasts y bajas está en `docs/configuracion-resend.md`; el diseño del doble opt-in está en `docs/arquitectura-doble-opt-in.md`.
- **Stripe y Blob:** el flujo de las guías de pago está documentado en `docs/guias-de-pago.md`. No cambies precios, webhooks ni rutas privadas sin revisar ese documento.

Comandos operativos seguros de Vercel:

```bash
npx --yes vercel@latest whoami
npx --yes vercel@latest env ls production
npx --yes vercel@latest redeploy pomelo-bby-web.vercel.app --target production
```

Para activar o desactivar el mantenimiento en Production, solo con petición expresa:

```bash
npx --yes vercel@latest env add MAINTENANCE_MODE production --value true --force --no-sensitive --yes
npx --yes vercel@latest env add MAINTENANCE_MODE production --value false --force --no-sensitive --yes
npx --yes vercel@latest redeploy pomelo-bby-web.vercel.app --target production
```

Prefiere el despliegue automático al hacer `push` de `main`. No ejecutes `vercel --prod` desde un árbol con cambios locales. Resend y DonDominio se administran desde sus paneles; no guardes credenciales ni valores DNS generados en `AGENTS.md`.

## Git y commits

Todos los commits de este repositorio deben usar esta identidad como **autor y committer**:

```text
Rafael Llorens Blanes <rafalb190@gmail.com>
```

El entorno de Pi puede inyectar variables `GIT_AUTHOR_*` y `GIT_COMMITTER_*` corporativas que tienen prioridad sobre `.git/config`. Por eso no basta con configurar Git: cada commit debe forzar explícitamente los cuatro valores.

```bash
git config --local user.name "Rafael Llorens Blanes"
git config --local user.email "rafalb190@gmail.com"

GIT_AUTHOR_NAME="Rafael Llorens Blanes" \
GIT_AUTHOR_EMAIL="rafalb190@gmail.com" \
GIT_COMMITTER_NAME="Rafael Llorens Blanes" \
GIT_COMMITTER_EMAIL="rafalb190@gmail.com" \
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
