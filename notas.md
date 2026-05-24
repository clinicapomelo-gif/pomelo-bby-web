# WEB — pomelo.bby

## Resumen

Web de enfermería pediátrica vinculada a la cuenta de Instagram @pomelo.bby.
Acompañamiento en crianza y salud infantil. Venta de guías (PDFs) y consultas 1:1.

## Stack

- **Framework:** Astro 6.3 (static + server endpoints)
- **Hosting:** Vercel (plan gratuito, subdominio .vercel.app hasta comprar dominio)
- **Pagos:** Stripe (checkout sessions + webhook)
- **Reservas:** Cal.com (popup embebido, cobro via Stripe)
- **Formulario de contacto:** Resend (email directo + honeypot anti-spam)
- **Email marketing:** Kit/ConvertKit (previsto, sin implementar)
- **Almacenamiento PDFs:** Vercel Blob (previsto, sin implementar)
- **Analytics:** Vercel Analytics (sin cookies, sin banner)
- **Contenido:** Content Collections (markdown en repo)

## Diseño

- **Estilo:** Cálido, cercano, limpio
- **Paleta:** Blancos + tonos nude/cream + acento coral (#EE9496)
- **Tipografía:** Montserrat
- **Idioma:** Solo español
- **Sistema de diseño:** Variables CSS (--radius-sm: 8px, --radius-md: 12px, --color-coral-text para contraste AA)
- **Botones:** Definición global en global.css (.btn, .btn--primary, .btn--secondary, .btn--full)

## Páginas

1. Home — Hero full-width, guías destacadas, blog, CTA consultas
2. Blog — Listado + página individual por post (Content Collections)
3. Tienda — Catálogo de guías + página de producto + Stripe Checkout
4. Consultas — 4 tiers con checklist ✓/✗:
   - Cuéntame por mensaje (19€) — respuesta escrita en 24-48h
   - Duda rápida (35€) — videollamada 15-20 min
   - Hablemos tranquilamente (79€) — videollamada 45-50 min + 7 días seguimiento ← ESTRELLA
   - Te acompaño (199€) — 3 sesiones en 1-2 meses (pack separado abajo)
   Layout: 3 columnas desktop, 2 tablet, 1 móvil + pack horizontal abajo
5. Quién soy / FAQ — Bio con credenciales + preguntas frecuentes (renombrar "Sobre mí" → "Quién soy" o "Conóceme")
6. Contacto — Orientación (Instagram para saludos, consultas para ayuda profesional) + formulario para todo lo demás (Resend)
7. Links — Página tipo linktree propia (enlace en bio de Instagram)
8. Legales — Aviso legal, protección de datos, cookies, condiciones de venta (placeholders)

## API Endpoints (server-rendered)

- `POST /api/checkout` — Crea sesión de Stripe (usa stripePriceId del servidor, no del cliente)
- `POST /api/webhook` — Recibe eventos de Stripe (valida firma)
- `POST /api/contact` — Envía email con Resend (honeypot anti-spam)

## Variables de entorno

| Variable | Uso | Estado |
|----------|-----|--------|
| `STRIPE_SECRET_KEY` | Checkout y webhook | Configurada (test) |
| `STRIPE_WEBHOOK_SECRET` | Verificar firma webhook | Configurada (test) |
| `RESEND_API_KEY` | Formulario de contacto | Configurada |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (PDFs) | Pendiente |
| `KIT_API_KEY` / `KIT_FORM_ID` | Email marketing | Pendiente |
| `SITE_URL` | URLs de retorno Stripe | Configurada |

## SEO y conversión

- [x] URLs cortas y descriptivas
- [x] Title tags + meta descriptions en cada página
- [x] Open Graph / social cards
- [x] Sitemap automático
- [x] FAQ sections en sobre-mí
- [ ] Schema markup (FAQ, Article, Product)
- [ ] Secuencia de email automatizada tras lead magnet
- [ ] Internal linking entre posts y productos
- [ ] Blog orientado a keywords de baja competencia

## Seguridad

- [x] Checkout usa stripePriceId del servidor (no acepta priceId del cliente)
- [x] Webhook valida firma de Stripe
- [x] Headers de seguridad en vercel.json (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- [x] Honeypot anti-spam en formulario de contacto
- [x] Focus-visible global para accesibilidad
- [x] Contraste AA con --color-coral-text (#C75557)

## Completado

- [x] Setup proyecto (Astro + Vercel + fuentes + paleta + layout)
- [x] Páginas estáticas (Home, Sobre mí, Contacto, Links, Legales)
- [x] Blog (Content Collections, listado, template, 2 posts)
- [x] SEO y meta (componente SEO, sitemap, robots.txt, OG tags, Analytics)
- [x] Deploy (GitHub + Vercel)
- [x] Tienda (catálogo, producto, Stripe Checkout, webhook, página de éxito)
- [x] Consultas (página + Cal.com popup integrado)
- [x] Formulario de contacto (Resend + honeypot)
- [x] Textos adaptados al tono de Mar (AGENTS.md)
- [x] Género neutro en toda la web
- [x] Sistema de diseño unificado (botones, radios, contraste, focus)
- [x] Nav con estado activo
- [x] Headers de seguridad
- [x] Rediseño consultas: 4 tiers con nombres propios, precios redondos, checklist ✓/✗
- [x] Rediseño contacto: orientación por intención + formulario para el resto
- [x] Fix sobre-mi: "profesional sanitario" + "con interés y ganas"

## Pendientes

### Para lanzar ventas (bloqueante)

- [ ] Tener los PDFs finales de las guías
- [ ] Subir PDFs a Vercel Blob (configurar blobKey en guias.ts)
- [ ] Implementar entrega por email en el webhook (enviar link de descarga tras pago)
- [ ] Pasar Stripe a producción (claves live + nuevos product/price IDs)
- [ ] Crear productos en Stripe para las consultas (19€, 35€, 79€, 199€)
- [ ] Implementar flujo de pago para "Cuéntame por mensaje" (Stripe checkout → formulario)
- [ ] Configurar Cal.com con los nuevos precios y duraciones (15-20 min, 45-50 min)

### Pendiente de Mar

- [ ] Renombrar "Sobre mí" → "Quién soy" o "Conóceme" (en nav y página)
- [ ] Decidir textos en cursiva definitivos para cada card de consultas
- [ ] Imágenes de portada para las guías (ahora son placeholders SVG)
- [ ] Textos legales definitivos (profesional legal)
- [ ] Testimonios / social proof (necesita tiempo + clientes)
- [ ] Lead magnet — decidir qué PDF gratuito ofrecer

### Mejoras técnicas (opcionales)

- [ ] Schema markup (FAQ, Article, Product) para SEO
- [ ] Integrar Kit para lead magnet + email marketing
- [ ] Internal linking entre posts y productos
- [ ] Más artículos de blog (keywords de baja competencia)

### Escalado página de contacto (cuando haya volumen)

Cuando Mar reciba +50 emails/semana de dudas pediátricas gratuitas por el formulario:

1. **Fase 1:** Añadir selector de tema obligatorio (Colaboración / Problema con compra / Otra consulta). NO incluir "duda sobre mi peque" como opción — fuerza la redirección a consultas.
2. **Fase 2:** Sustituir el formulario por un Help Center / FAQ expandido (tipo Headspace). Solo dejar formulario para casos que no se resuelven con las FAQs.
3. **Fase 3:** Respuesta automática a emails que contengan palabras clave pediátricas ("fiebre", "caca", "duerme", "come") con un mensaje amable que redirige a consultas.

Señales para actuar:
- Mar dedica +2h/semana a responder emails que debería cobrar
- Más del 50% de los emails son dudas sobre peques (no colaboraciones ni incidencias)
- La conversión de consultas por mensaje baja porque la gente usa el formulario gratis
