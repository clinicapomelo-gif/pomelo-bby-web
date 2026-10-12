import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizePhone } from '../src/lib/phone.mjs';

test('un móvil español con el prefijo del selector se guarda agrupado', () => {
  assert.equal(normalizePhone('612345678'), '+34 612 345 678');
  assert.equal(normalizePhone(' 612 34 56 78 ', '+34'), '+34 612 345 678');
  assert.equal(normalizePhone('+34 612-345-678'), '+34 612 345 678');
  assert.equal(normalizePhone('0034612345678'), '+34 612 345 678');
});

test('otros países: el prefijo del selector o el escrito con + o 00', () => {
  assert.equal(normalizePhone('7911 123456', '+44'), '+44 7911123456');
  assert.equal(normalizePhone('07911 123456', '+44'), '+44 7911123456');
  assert.equal(normalizePhone('0612345678', '+39'), '+39 0612345678');
  assert.equal(normalizePhone('1123456789', '+54'), '+54 1123456789');
  assert.equal(normalizePhone('+44 7911 123456', '+34'), '+447911123456');
  assert.equal(normalizePhone('0044 7911 123456'), '+447911123456');
});

test('vacío es válido y lo que no se entiende devuelve undefined', () => {
  assert.equal(normalizePhone(''), '');
  assert.equal(normalizePhone('   '), '');
  assert.equal(normalizePhone(undefined), '');
  assert.equal(normalizePhone('12345'), undefined);
  assert.equal(normalizePhone('hola'), undefined);
  assert.equal(normalizePhone('+34 12345'), undefined);
  assert.equal(normalizePhone('7911123456', ''), undefined);
  assert.equal(normalizePhone('7911123456', 'abc'), undefined);
  assert.equal(normalizePhone('+1234567890123456'), undefined);
});
