import test from 'node:test';
import assert from 'node:assert/strict';
import { renderEmail } from '../src/lib/email-template.mjs';

const base = {
  siteUrl: 'https://pomelobaby.es/',
  greeting: 'Hola, <Laura>.',
  paragraphs: [['Tu referencia es ', { strong: 'PB-ABC123' }, '.']],
};

test('escapa el contenido en el HTML y lo deja intacto en el texto', () => {
  const { html, text } = renderEmail(base);
  assert.match(html, /Hola, &lt;Laura&gt;\./);
  assert.doesNotMatch(html, /<Laura>/);
  assert.match(text, /Hola, <Laura>\./);
  assert.match(html, /<strong>PB-ABC123<\/strong>/);
});

test('el HTML y el texto llevan el mismo contenido y la firma', () => {
  const { html, text } = renderEmail({
    ...base,
    button: { label: 'Contar mi caso', href: 'https://pomelobaby.es/consulta-mensaje/gracias?session_id=cs_test_1&x=2' },
    afterButton: [['Si tienes problemas, ', { link: 'escríbeme', href: 'https://pomelobaby.es/contacto' }, '.']],
  });
  assert.equal(text, 'Hola, <Laura>.\n\nTu referencia es PB-ABC123.\n\nContar mi caso:\nhttps://pomelobaby.es/consulta-mensaje/gracias?session_id=cs_test_1&x=2\n\nSi tienes problemas, escríbeme (https://pomelobaby.es/contacto).\n\nMar · Pomelo Baby');
  assert.match(html, /href="https:\/\/pomelobaby\.es\/consulta-mensaje\/gracias\?session_id=cs_test_1&amp;x=2"/);
  assert.match(html, />Contar mi caso<\/a>/);
  assert.match(html, /Mar · Pomelo Baby/);
});

test('el logo y el pie usan la URL del sitio sin barra final', () => {
  const { html } = renderEmail(base);
  assert.match(html, /src="https:\/\/pomelobaby\.es\/logo-pomelo-email\.png"/);
  assert.match(html, />pomelobaby\.es<\/a>/);
});

test('sin botón no hay enlace de respaldo', () => {
  const { html } = renderEmail(base);
  assert.doesNotMatch(html, /Si el botón no funciona/);
  assert.match(renderEmail({ ...base, button: { label: 'Ir', href: 'https://pomelobaby.es' } }).html, /Si el botón no funciona/);
});

test('el botón es coral con letras blancas', () => {
  const { html } = renderEmail({ ...base, button: { label: 'Ir', href: 'https://pomelobaby.es' } });
  assert.match(html, /background:#EF6E71[^>]*>\s*<a [^>]*color:#FFFFFF/);
});
