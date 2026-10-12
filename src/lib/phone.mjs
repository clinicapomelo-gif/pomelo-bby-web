// Teléfono opcional de los formularios, de cualquier país. Se guarda siempre con prefijo para
// que Mar pueda escribir por WhatsApp. Se escribe con el prefijo del selector («+34» por
// defecto) o con su propio «+» / «00»; sin prefijo del selector, hace falta el «+».
// Vacío es válido (''); un número que no se entiende devuelve undefined.
export const normalizePhone = (value, prefix = '+34') => {
  const raw = typeof value === 'string' ? value.trim() : '';
  if (!raw) return '';
  if (!/^\+?[\d\s().-]+$/.test(raw)) return undefined;

  let digits = raw.replace(/\D/g, '');
  let country = '';
  if (raw.startsWith('+')) {
    // El prefijo va incluido: no se separa del resto.
  } else if (digits.startsWith('00')) {
    digits = digits.slice(2);
  } else {
    if (typeof prefix !== 'string' || !/^\+\d{1,3}$/.test(prefix)) return undefined;
    country = prefix.slice(1);
    // ponytail: el 0 inicial es el prefijo troncal de casi todos los países; Italia lo conserva.
    if (digits.startsWith('0') && country !== '39') digits = digits.slice(1);
    digits = country + digits;
  }

  if (digits.startsWith('34')) {
    return /^34[6-9]\d{8}$/.test(digits)
      ? `+34 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`
      : undefined;
  }
  if (digits.length < 8 || digits.length > 15) return undefined;
  return country ? `+${country} ${digits.slice(country.length)}` : `+${digits}`;
};
