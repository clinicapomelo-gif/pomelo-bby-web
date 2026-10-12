// «Otro horario»: el formulario pide la consulta, los días, la franja y unas notas en campos
// propios y aquí se convierten en el mensaje que recibe Mar. Sin JavaScript se usa el
// mensaje libre.
export const HORARIO_CONSULTAS = {
  calma: 'Necesito hablar con calma',
  plan: 'Necesito un plan',
};

export const HORARIO_DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes'];

export const HORARIO_FRANJAS = {
  manana: 'mañana',
  tarde: 'tarde',
  igual: 'me da igual',
};

export const HORARIO_NOTAS_MAX = 300;

export const composeHorarioMessage = ({ consulta, dias, franja, notas } = {}) => {
  if (typeof consulta !== 'string' || !Object.hasOwn(HORARIO_CONSULTAS, consulta)) return undefined;
  if (typeof franja !== 'string' || !Object.hasOwn(HORARIO_FRANJAS, franja)) return undefined;
  if (!Array.isArray(dias) || dias.some((dia) => !HORARIO_DIAS.includes(dia))) return undefined;
  const elegidos = HORARIO_DIAS.filter((dia) => dias.includes(dia));
  if (elegidos.length === 0) return undefined;
  const texto = typeof notas === 'string' ? notas.trim() : '';
  if (texto.length > HORARIO_NOTAS_MAX) return undefined;

  return [
    `Consulta que quiere: ${HORARIO_CONSULTAS[consulta]}`,
    `Días que le vienen bien: ${elegidos.join(', ')}`,
    `Franja: ${HORARIO_FRANJAS[franja]}`,
    ...(texto ? [`Notas: ${texto}`] : []),
  ].join('\n');
};
