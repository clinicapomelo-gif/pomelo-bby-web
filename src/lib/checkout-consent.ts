// Casilla obligatoria de Stripe Checkout sobre el botón Pagar. Requiere una URL de
// condiciones válida en Stripe (Settings → Public details), en Sandbox y en Live.
// TEXTOS PROVISIONALES: los sustituye el texto que apruebe la asesoría.
const MESSAGES = {
  guia: (url: string) =>
    `He leído y acepto las [condiciones de venta](${url}). Quiero recibir la guía ahora y entiendo que, una vez entregada, pierdo mi derecho de desistimiento.`,
  consulta: (url: string) =>
    `He leído y acepto las [condiciones de venta](${url}).`,
};

export const termsConsent = (baseURL: string, kind: keyof typeof MESSAGES) => ({
  consent_collection: { terms_of_service: 'required' as const },
  custom_text: {
    terms_of_service_acceptance: { message: MESSAGES[kind](`${baseURL}/condiciones-venta`) },
  },
});
