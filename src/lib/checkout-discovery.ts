import type Stripe from 'stripe';

// Pregunta opcional en Stripe Checkout. La respuesta se guarda en el pago y se ve en el
// Dashboard (Pagos → el pago → Campos personalizados) y en la exportación de pagos.
// Stripe exige claves y valores alfanuméricos y una etiqueta de 50 caracteres como máximo.
const DISCOVERY_KEY = 'conocido';
const DISCOVERY_OPTIONS = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'google', label: 'Google u otro buscador' },
  { value: 'recomendacion', label: 'Me lo recomendó alguien' },
  { value: 'chisme', label: 'El Chisme de Mar' },
  { value: 'otro', label: 'Otro' },
];

export const discoveryField = () => ({
  custom_fields: [{
    key: DISCOVERY_KEY,
    label: { type: 'custom' as const, custom: '¿Cómo has conocido Pomelo Baby?' },
    type: 'dropdown' as const,
    optional: true,
    dropdown: { options: DISCOVERY_OPTIONS },
  }],
});

export const getDiscoveryAnswer = (session: Stripe.Checkout.Session) => {
  const value = session.custom_fields?.find((field) => field.key === DISCOVERY_KEY)?.dropdown?.value;
  return DISCOVERY_OPTIONS.find((option) => option.value === value)?.label;
};
