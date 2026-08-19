# WEB — pomelo.bby

> Notas históricas de producto. El estado operativo vigente se mantiene en `TODO.md`.

## Resumen

Web de enfermería pediátrica vinculada a la cuenta de Instagram @pomelo.bby.
Acompañamiento en crianza y salud infantil. Venta de guías (PDFs) y consultas 1:1.

## Stack

- **Framework:** Astro 6.3 (static + server endpoints)
- **Hosting:** Vercel (plan gratuito, subdominio .vercel.app hasta comprar dominio)
- **Pagos:** Stripe (checkout sessions + webhook)
- **Reservas:** Cal.com (popup embebido, cobro via Stripe)
- **Formulario de contacto:** Resend (email directo + honeypot anti-spam)
- **Email marketing:** Resend Contacts, Segments, Topics, Broadcasts y Automations
- **Almacenamiento PDFs:** Vercel Blob privado; el lead magnet ya está alojado
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
4. Consultas — 3 servicios:
   - Cuéntame por correo (19 €) — respuesta escrita en 24-48 h laborables
   - Duda concreta (49 €) — videollamada de unos 20 min
   - Hablemos tranquilamente (89 €) — videollamada y seguimiento durante 14 días
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
| `RESEND_API_KEY` | Correo transaccional y marketing | Configurada |
| `RESEND_NEWSLETTER_SEGMENT_ID` | Segmento de El Chisme | Configurado |
| `RESEND_NEWSLETTER_TOPIC_ID` | Preferencia pública de El Chisme | Configurado |
| `BLOB_STORE_ID` + OIDC | Vercel Blob (PDF gratuito) | Configurado |
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
- [x] Rediseño consultas: 3 servicios con nombres propios, precios y checklist
- [x] Rediseño contacto: orientación por intención + formulario para el resto
- [x] Fix sobre-mi: "profesional sanitario" + "con interés y ganas"

## Pendientes

### Para lanzar ventas (bloqueante)

- [ ] Tener los PDFs finales de las guías
- [ ] Subir PDFs a Vercel Blob (configurar blobKey en guias.ts)
- [ ] Implementar entrega por email en el webhook (enviar link de descarga tras pago)
- [ ] Pasar Stripe a producción (claves live + nuevos product/price IDs)
- [ ] Crear los precios definitivos de las consultas (19 €, 49 € y 89 €) en las cuentas de Stripe y Cal.com de pomelo.bby
- [ ] Implementar flujo de pago para "Cuéntame por mensaje" (Stripe checkout → formulario)
- [ ] Configurar Cal.com con los nombres, precios y duraciones definitivos

### Pendiente de Mar

- [x] Renombrar "Sobre mí" → "Quién soy" o "Conóceme" (en nav y página)
- [x] Decidir textos en cursiva definitivos para cada card de consultas
- [ ] Imágenes de portada para las guías (ahora son placeholders SVG)
- [ ] Textos legales definitivos (profesional legal)
- [ ] Testimonios / social proof (necesita tiempo + clientes)
- [x] Lead magnet — “25 cosas normales en los bebés” alojado en Vercel Blob privado

### Mejoras técnicas (opcionales)

- [ ] Schema markup (FAQ, Article, Product) para SEO
- [ ] Configurar Resend para lead magnet, Broadcasts y Automations
- [ ] Internal linking entre posts y productos
- [ ] Más artículos de blog (keywords de baja competencia)
- [ ] Implementar upload de archivos en consulta por mensaje (ver opciones abajo)

### Upload de archivos en "Cuéntame por mensaje"

**Contexto:** En pediatría los vídeos son clave (respiración, llanto, movimientos, alimentación, sueño). Un vídeo de 15 segundos dice más que 3 párrafos. No podemos prescindir de ellos.

**Problema:** Los vídeos pesan mucho (50-100MB). El email tiene límites (Resend max 40MB, Gmail 25MB adjuntos).

**Opciones:**

| Opción | Cómo funciona | Pros | Contras |
|--------|--------------|------|---------|
| **A: Vercel Blob** | Subir archivos a Blob, enviar links en el email | Todo en un sitio, Mar recibe links | 500MB gratis total, se llena rápido con vídeos, hay que limpiar |
| **B: Cloudflare R2** | Subir a R2 (S3-compatible) | 10GB gratis/mes, más escalable | Más setup, otro servicio |
| **C: Link externo (Google Drive, WeTransfer)** | El usuario sube su vídeo a un servicio y pega el link en el formulario | Cero coste, sin límites | Fricción para el usuario, depende de que sepan usar Drive |
| **D: WhatsApp Business API** | Tras el formulario, se abre un chat de WhatsApp con un mensaje pre-rellenado para enviar archivos | Natural, sin límites, Mar ya usa WhatsApp | Coste de API, mezcla canales, difícil de trazar |
| **E: Campo de texto + "envíalo por email"** | No hay upload. Mar pide el vídeo por email si lo necesita | Cero complejidad | Añade un paso extra, retrasa la respuesta |

**Recomendación:** Empezar con **E** (sin upload, Mar pide si necesita) y migrar a **A** o **B** cuando haya volumen. La opción C es un buen intermedio si no queremos implementar nada pero queremos dar la posibilidad.

**Decisión pendiente:** ¿Por dónde responde Mar? Email es lo más profesional y trazable. Todo el flujo debería ser por email (reply al hilo).

### Plan de uso de PDFs existentes

PDFs disponibles en `/pdfs/`:
- ALIMENTACION COMPLEMENTARIA.pdf
- ATRAGANTAMIENTOS.pdf
- CONSEJOS RN.pdf
- CONSERVACIÓN LECHE MATERNA.pdf
- POMADA DE ACEITE DE UVA.pdf

Estrategia:

| PDF | Uso recomendado | Acción |
|-----|----------------|--------|
| Alimentación complementaria | **Venta** (guía completa) | Subir a Blob, crear producto Stripe, generar 2-3 posts de blog como aperitivo |
| Atragantamientos | **Venta** (complementa alimentación) | Subir a Blob, crear producto Stripe |
| Consejos RN | **Venta** o **lead magnet** | Evaluar extensión — si es corto, lead magnet; si es completo, venta |
| Conservación leche materna | **Lead magnet** (tema concreto, útil, corto) | Usar para captar emails con Resend |
| Pomada de aceite de uva | **Blog post** gratuito | Es un tip, no una guía — convertir en artículo |

Cada PDF de venta puede generar 2-3 artículos de blog que sirven como contenido SEO gratuito y empujan al embudo (blog → guía de pago → consulta).

### Escalado página de contacto (cuando haya volumen)

Cuando Mar reciba +50 emails/semana de dudas pediátricas gratuitas por el formulario:

1. **Fase 1:** Añadir selector de tema obligatorio (Colaboración / Problema con compra / Otra consulta). NO incluir "duda sobre mi peque" como opción — fuerza la redirección a consultas.
2. **Fase 2:** Sustituir el formulario por un Help Center / FAQ expandido (tipo Headspace). Solo dejar formulario para casos que no se resuelven con las FAQs.
3. **Fase 3:** Respuesta automática a emails que contengan palabras clave pediátricas ("fiebre", "caca", "duerme", "come") con un mensaje amable que redirige a consultas.

Señales para actuar:
- Mar dedica +2h/semana a responder emails que debería cobrar
- Más del 50% de los emails son dudas sobre peques (no colaboraciones ni incidencias)
- La conversión de consultas por mensaje baja porque la gente usa el formulario gratis
