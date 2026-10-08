// Plantilla común de los correos a familias. Genera HTML y texto a partir del mismo
// contenido para que nunca digan cosas distintas. Tablas y estilos en línea: es lo que
// entienden Gmail, Outlook y Apple Mail. Colores de la paleta de Pomelo (AGENTS.md).

const COLOR = {
  cream: '#F6EFE7',
  white: '#FFFFFF',
  coral: '#EF6E71',
  text: '#2D2D2D',
  secondary: '#5A5A5A',
  border: '#EAC4C6',
};
const FONT = "Montserrat, 'Helvetica Neue', Helvetica, Arial, sans-serif";

export const escapeHtml = (value) => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

// Un párrafo es un texto o una lista de partes: texto, { strong } o { link, href }.
const partsOf = (paragraph) => Array.isArray(paragraph) ? paragraph : [paragraph];

const partToHtml = (part) => {
  if (typeof part === 'string') return escapeHtml(part);
  if ('strong' in part) return `<strong>${escapeHtml(part.strong)}</strong>`;
  // Las URL largas no tienen espacios: sin cortarlas, ensanchan la tarjeta en el móvil.
  return `<a href="${escapeHtml(part.href)}" style="color:${COLOR.text};text-decoration:underline;word-break:break-all;overflow-wrap:anywhere;">${escapeHtml(part.link)}</a>`;
};

const partToText = (part) => {
  if (typeof part === 'string') return part;
  if ('strong' in part) return part.strong;
  return `${part.link} (${part.href})`;
};

const paragraphHtml = (paragraph, color = COLOR.text, size = 16) =>
  `<p style="margin:0 0 16px;font-family:${FONT};font-size:${size}px;line-height:1.6;color:${color};">${partsOf(paragraph).map(partToHtml).join('')}</p>`;

/**
 * @typedef {string | { strong: string } | { link: string, href: string }} EmailPart
 * @typedef {string | EmailPart[]} EmailParagraph
 * @param {{
 *   siteUrl: string,
 *   preheader?: string,
 *   title?: string,
 *   greeting?: string,
 *   paragraphs?: EmailParagraph[],
 *   button?: { label: string, href: string },
 *   afterButton?: EmailParagraph[],
 *   signature?: string,
 * }} content
 * @returns {{ html: string, text: string }}
 */
export const renderEmail = ({
  siteUrl,
  preheader = '',
  title,
  greeting,
  paragraphs = [],
  button,
  afterButton = [],
  signature = 'Mar · Pomelo Baby',
}) => {
  const site = String(siteUrl).replace(/\/$/, '');
  const logoUrl = `${site}/logo-pomelo-email.png`;

  const buttonHtml = button ? `
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;">
            <tr><td style="background:${COLOR.coral};border-radius:8px;">
              <a href="${escapeHtml(button.href)}" style="display:inline-block;padding:14px 28px;font-family:${FONT};font-size:18px;font-weight:700;line-height:1.3;color:${COLOR.white};text-decoration:none;border-radius:8px;">${escapeHtml(button.label)}</a>
            </td></tr>
          </table>` : '';
  // El enlace de respaldo va al final: junto al botón compite con él y con lo que hay que leer.
  const fallbackHtml = button ? `
        <tr><td style="padding:0 32px 24px;">
          <div style="border-top:1px solid ${COLOR.border};padding-top:16px;">
            ${paragraphHtml(['Si el botón no funciona, copia este enlace en el navegador: ', { link: button.href, href: button.href }], COLOR.secondary, 13)}
          </div>
        </td></tr>` : '';

  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escapeHtml(title ?? 'Pomelo Baby')}</title></head>
<body style="margin:0;padding:0;background:${COLOR.cream};">
  <span style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</span>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${COLOR.cream};">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${COLOR.white};border:1px solid ${COLOR.border};border-radius:12px;">
        <tr><td align="center" style="padding:28px 32px 8px;">
          <a href="${escapeHtml(site)}"><img src="${escapeHtml(logoUrl)}" width="220" height="66" alt="Pomelo Baby" style="display:block;border:0;width:220px;height:auto;font-family:${FONT};font-size:20px;color:${COLOR.coral};"></a>
        </td></tr>
        <tr><td style="padding:24px 32px 16px;">
          ${title ? `<h1 style="margin:0 0 16px;font-family:${FONT};font-size:22px;line-height:1.3;color:${COLOR.text};">${escapeHtml(title)}</h1>` : ''}
          ${greeting ? paragraphHtml(greeting) : ''}
          ${paragraphs.map((paragraph) => paragraphHtml(paragraph)).join('\n          ')}
          ${buttonHtml}
          ${afterButton.map((paragraph) => paragraphHtml(paragraph, COLOR.secondary, 15)).join('\n          ')}
          ${paragraphHtml(signature)}
        </td></tr>${fallbackHtml}
      </table>
      <p style="margin:16px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${COLOR.secondary};">Pomelo Baby · <a href="${escapeHtml(site)}" style="color:${COLOR.secondary};">${escapeHtml(site.replace(/^https?:\/\//, ''))}</a></p>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    title,
    greeting,
    ...paragraphs.map((paragraph) => partsOf(paragraph).map(partToText).join('')),
    button && `${button.label}:\n${button.href}`,
    ...afterButton.map((paragraph) => partsOf(paragraph).map(partToText).join('')),
    signature,
  ].filter(Boolean).join('\n\n');

  return { html, text };
};
