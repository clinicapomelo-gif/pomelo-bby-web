import test from 'node:test';
import assert from 'node:assert/strict';
import { getSurveySendAt, parseNota, renderSurveyEmail } from '../src/lib/encuesta.mjs';

const seconds = (iso) => Date.parse(iso) / 1000;

test('programa la encuesta a las 10:00 de Madrid una semana después', () => {
  // Compra a las 22:39 de Madrid en horario de verano; la semana cae ya en horario de invierno.
  assert.equal(getSurveySendAt(seconds('2026-10-25T20:39:00Z')), '2026-11-01T09:00:00.000Z');
  // Compra en horario de verano.
  assert.equal(getSurveySendAt(seconds('2026-06-10T08:00:00Z')), '2026-06-17T08:00:00.000Z');
  // Compra de madrugada en Madrid, que en UTC aún es el día anterior.
  assert.equal(getSurveySendAt(seconds('2026-01-14T23:30:00Z')), '2026-01-22T09:00:00.000Z');
});

test('solo acepta las tres respuestas', () => {
  assert.equal(parseNota('1'), 1);
  assert.equal(parseNota(3), 3);
  for (const value of ['0', '4', '2.5', '', null, undefined, 'x', '1e0x']) assert.equal(parseNota(value), undefined);
});

test('cada respuesta del correo abre /opinion con ella marcada', () => {
  const { subject, text, html } = renderSurveyEmail({
    siteUrl: 'https://pomelobaby.es',
    sessionId: 'cs_live_abc',
    product: 'guia',
    productName: 'Sueño infantil',
  });
  assert.equal(subject, '¿Te está sirviendo la guía?');
  assert.match(text, /Sueño infantil/);
  for (const nota of [1, 2, 3]) {
    assert.match(text, new RegExp(`https://pomelobaby\\.es/opinion\\?session_id=cs_live_abc&nota=${nota}`));
    assert.match(html, new RegExp(`href="https://pomelobaby\\.es/opinion\\?session_id=cs_live_abc&amp;nota=${nota}"`));
  }
  assert.match(text, /Sí, mucho:\nhttps:\/\/pomelobaby\.es\/opinion\?session_id=cs_live_abc&nota=3/);
  assert.match(text, /https:\/\/pomelobaby\.es\/contacto/);
});
