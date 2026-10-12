// Factura que Stripe crea y envía al pagar (requiere los recibos de «Pagos efectuados»
// activados en el Dashboard). El emisor sale de Settings → Business; el NIF va en el pie.
// IVA de las guías: confirmar con la gestoría (21 %, o 4 % si cuentan como libro electrónico).
const GUIDE_VAT_RATE = 21;

const ISSUER = 'Piel de Pomelo S.L.P. · NIF B16353807 · Calle Enric Valor, 2, 03820 Cocentaina (Alicante).';

const FOOTERS = {
  guia: `${ISSUER} IVA incluido (${GUIDE_VAT_RATE} %).`,
  consulta: `${ISSUER} Operación exenta de IVA según el artículo 20.Uno.3.º de la Ley 37/1992.`,
};

export const invoiceCreation = (kind: keyof typeof FOOTERS) => ({
  invoice_creation: { enabled: true, invoice_data: { footer: FOOTERS[kind] } },
});
