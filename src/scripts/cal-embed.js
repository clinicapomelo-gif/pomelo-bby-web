// Fragmento de Cal.com para el embed de reservas, tal cual lo da el proveedor.
// Va en .js para que astro check no lo tipe; consultas.astro lo importa desde un
// script procesado, que Astro incluye en el CSP con su hash.
//
// Cal.com no se carga al entrar en /consultas: pesa unos 360 KB, pone su cookie y llama a
// sus servicios. Se carga al abrir una tarjeta con reserva (y entonces se precarga su
// calendario) o, como muy tarde, al pulsar «Reservar…». Los botones usan data-cal-booking y
// no data-cal-link para que el embed no los enlace por su cuenta y abra el modal dos veces.
const bookingButtons = document.querySelectorAll('[data-cal-booking]');
let calLoaded = false;

const loadCal = () => {
  if (calLoaded) return;
  calLoaded = true;
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", {origin:"https://cal.com"});
  // Coral con letras blancas y granate al pasar por encima, como los CTA de la web.
  const calBrand = {"cal-brand":"#EF6E71","cal-brand-emphasis":"#92363A","cal-brand-text":"#FFFFFF"};
  Cal("ui", {"cssVarsPerTheme":{"light":calBrand,"dark":calBrand},"hideEventTypeDetails":false,"layout":"month_view","locale":"es"});
};

const calOptions = (button) => {
  let config = {};
  try { config = JSON.parse(button.dataset.calConfig || '{}'); } catch { /* sin config */ }
  return { calLink: button.dataset.calBooking, config };
};

bookingButtons.forEach((button) => {
  button.closest('details')?.addEventListener('toggle', (event) => {
    if (!event.currentTarget.open) return;
    loadCal();
    Cal('preload', { calLink: button.dataset.calBooking });
  });
  button.addEventListener('click', () => {
    loadCal();
    Cal('modal', calOptions(button));
  });
});
