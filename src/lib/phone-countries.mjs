// Prefijos del selector de teléfono: [prefijo, país]. «Más habituales» va primero (España
// arriba, el resto en orden alfabético); el resto de grupos, también en orden alfabético.
/** @param {[string, string][]} lista */
const porNombre = (lista) => [...lista].sort((a, b) => a[1].localeCompare(b[1], 'es'));

/** @type {[string, [string, string][]][]} */
export const PHONE_GRUPOS = [
  ['Más habituales', [['+34', 'España'], ...porNombre([['+54', 'Argentina'], ['+57', 'Colombia'], ['+52', 'México'], ['+351', 'Portugal']])]],
  ['Europa', porNombre([['+49', 'Alemania'], ['+376', 'Andorra'], ['+32', 'Bélgica'], ['+33', 'Francia'], ['+353', 'Irlanda'], ['+39', 'Italia'], ['+31', 'Países Bajos'], ['+44', 'Reino Unido'], ['+41', 'Suiza']])],
  ['América', porNombre([['+591', 'Bolivia'], ['+56', 'Chile'], ['+506', 'Costa Rica'], ['+53', 'Cuba'], ['+593', 'Ecuador'], ['+503', 'El Salvador'], ['+1', 'Estados Unidos, Canadá y R. Dominicana'], ['+502', 'Guatemala'], ['+504', 'Honduras'], ['+505', 'Nicaragua'], ['+507', 'Panamá'], ['+595', 'Paraguay'], ['+51', 'Perú'], ['+598', 'Uruguay'], ['+58', 'Venezuela']])],
  ['África y otros', [['+212', 'Marruecos']]],
];
