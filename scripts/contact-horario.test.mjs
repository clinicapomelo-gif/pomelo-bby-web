import assert from 'node:assert/strict';
import test from 'node:test';
import { composeHorarioMessage, HORARIO_NOTAS_MAX } from '../src/lib/contact-horario.mjs';

const valido = { consulta: 'plan', dias: ['jueves', 'lunes'], franja: 'tarde', notas: '  a partir de las 18:30 ' };

test('compone el mensaje ordenando los días y con las notas', () => {
  assert.equal(
    composeHorarioMessage(valido),
    'Consulta que quiere: Necesito un plan\nDías que le vienen bien: lunes, jueves\nFranja: tarde\nNotas: a partir de las 18:30',
  );
});

test('las notas son opcionales', () => {
  assert.equal(
    composeHorarioMessage({ ...valido, dias: ['viernes'], franja: 'igual', notas: undefined }),
    'Consulta que quiere: Necesito un plan\nDías que le vienen bien: viernes\nFranja: me da igual',
  );
});

test('rechaza valores desconocidos, sin días o con notas demasiado largas', () => {
  assert.equal(composeHorarioMessage({ ...valido, consulta: 'otra' }), undefined);
  assert.equal(composeHorarioMessage({ ...valido, franja: 'noche' }), undefined);
  assert.equal(composeHorarioMessage({ ...valido, dias: [] }), undefined);
  assert.equal(composeHorarioMessage({ ...valido, dias: ['sábado'] }), undefined);
  assert.equal(composeHorarioMessage({ ...valido, dias: 'lunes' }), undefined);
  assert.equal(composeHorarioMessage({ ...valido, notas: 'x'.repeat(HORARIO_NOTAS_MAX + 1) }), undefined);
  assert.ok(composeHorarioMessage({ ...valido, notas: 'x'.repeat(HORARIO_NOTAS_MAX) }));
});
