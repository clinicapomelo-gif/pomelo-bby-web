# WEB — pomelo.bby

## Resumen

Web de enfermeria pediatrica vinculada a la cuenta de Instagram @pomelo.bby.
Consejos, tips y guias para padres/madres. Venta de PDFs y consultas 1:1.

## Preguntas:

### Para la sección "Sobre mí"

1. Cómo quieres que te presenten? Solo "Mar" o "Mar Vall Requena"?
2. Tienes una frase corta que te defina como profesional, más allá del tagline de Instagram?
3. Cuántos años llevas trabajando en total como enfermera?
4. Qué te motivó a crear pomelo.bby? Hay una historia detrás?
5. Tienes número de colegiada? (Refuerza mucho la credibilidad y el SEO de salud)
6. Tienes foto profesional o una foto que quieras usar en la web?

### Para las FAQs

7. Qué preguntas te hacen más en Instagram o en consulta que se repiten siempre?
8. Cuánto dura una consulta 1:1? Qué temas se pueden tratar?
9. Cuál es el precio orientativo de las consultas? (Aunque sea un rango)
10. Qué temas van a cubrir los primeros PDFs? (Alimentación, sueño, fiebre, vacunas...?)
11. Hay algo que NO haces o que quieras dejar claro desde el principio? (Por ejemplo: "no hago diagnósticos", "no atiendo urgencias", etc.)
12. En qué idioma atiende las consultas? Solo español?

## Stack

- **Framework:** Astro (static site)
- **Hosting:** Vercel (plan gratuito, subdominio .vercel.app hasta comprar dominio)
- **Pagos:** Stripe directo (productos individuales, precio fijo)
- **Reservas:** Cal.com (widget embebido, cobro via Stripe)
- **Email marketing:** Kit (ConvertKit) — lead magnet + newsletters
- **Analytics:** Vercel Analytics (sin cookies, sin banner)
- **Contenido:** Content Collections (markdown en repo)

## Diseno

- **Estilo:** Calido, cercano, limpio. Inspirado en clinicapomelo.com
- **Paleta:** Blancos + tonos nude + acento melocoton/coral
- **Tipografia:** Montserrat
- **Idioma:** Solo espanol

## Paginas

1. Home — Hero, CTAs, propuesta de valor
2. Blog — Listado con categorias/tags + pagina individual por post
3. Tienda — Catalogo de PDFs + pagina de producto + Stripe Checkout
4. Consultas — Explicacion del servicio + widget Cal.com
5. Sobre mi / FAQ — Bio con credenciales + preguntas frecuentes
6. Contacto — Email + Instagram + formulario
7. Recurso gratuito — Lead magnet (PDF gratis a cambio de email)
8. Links — Pagina tipo linktree propia (enlace en bio de Instagram)
9. Legales — Aviso legal, proteccion de datos, cookies, condiciones de venta (placeholders)

## SEO y conversion

- URLs cortas y descriptivas
- Title tags + meta descriptions en cada pagina
- Schema markup (FAQ, Article, Product)
- Open Graph / social cards para compartir en redes
- FAQ sections en posts del blog (long-tail keywords)
- Secuencia de email automatizada tras lead magnet
- Contenido optimizado para AI Search (E-E-A-T, respuestas directas)
- Internal linking entre posts y productos
- Blog orientado a keywords de baja competencia en pediatria

## Pendientes

- [ ] Crear email hola@pomelobby.com (usado en contacto, legales y formulario)
- [ ] Rellenar textos legales con un profesional (aviso legal, proteccion de datos, cookies, condiciones de venta)
- [ ] Completar preguntas de la seccion "Sobre mi" con Mar (ver seccion Preguntas arriba)
- [ ] Anadir numero de colegiada de Mar cuando este disponible
- [ ] Cambiar email de cuenta Stripe al email definitivo (ahora mismo usa el email de re ytb premium)

## Fases de implementacion

1. Setup proyecto (Astro + Vercel adapter + fuentes + paleta + layout base)
2. Paginas estaticas (Home, Sobre mi, Contacto, Links, Legales)
3. Blog (Content Collections, listado, template de post, posts de ejemplo)
4. SEO y meta (componente SEO, sitemap, robots.txt, OG tags, Vercel Analytics)
5. Deploy inicial (GitHub + Vercel)
6. Tienda (catalogo, producto, Stripe Checkout, webhook, pagina de exito)
7. Consultas (pagina + Cal.com embebido)
8. Lead magnet (pagina + integracion Kit + entrega automatica)
