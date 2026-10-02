// Fragmento de Cal.com para el embed de reservas, tal cual lo da el proveedor.
// Va en .js para que astro check no lo tipe; consultas.astro lo importa desde un
// script procesado, que Astro incluye en el CSP con su hash.
if (document.querySelector('[data-cal-link]')) {
  (function (C, A, L) { let p = function (a, ar) { a.q.push(ar); }; let d = C.document; C.Cal = C.Cal || function () { let cal = C.Cal; let ar = arguments; if (!cal.loaded) { cal.ns = {}; cal.q = cal.q || []; d.head.appendChild(d.createElement("script")).src = A; cal.loaded = true; } if (ar[0] === L) { const api = function () { p(api, arguments); }; const namespace = ar[1]; api.q = api.q || []; if(typeof namespace === "string"){cal.ns[namespace] = cal.ns[namespace] || api;p(cal.ns[namespace], ar);p(cal, ["initNamespace", namespace]);} else p(cal, ar); return;} p(cal, ar); }; })(window, "https://app.cal.com/embed/embed.js", "init");
  Cal("init", {origin:"https://cal.com"});
  Cal("ui", {"styles":{"branding":{"brandColor":"#EF6E71"}},"hideEventTypeDetails":false,"layout":"month_view","locale":"es"});
}
