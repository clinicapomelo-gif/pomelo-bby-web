# TODO

## Dominio

- [ ] Comprar `pomelobebes.com` (dominio principal, ~$10/año)
- [ ] Opcional: comprar `pomelobby.com` como redirect
- [ ] Registrador recomendado: Cloudflare Registrar o Porkbun
- [ ] Configurar DNS para apuntar a Vercel

## Newsletter (Resend Audiences)

- [ ] Obtener el Audience ID desde Resend (dashboard → Audiences → copiar ID de la URL)
- [ ] Añadir `RESEND_AUDIENCE_ID` al `.env` local
- [ ] Añadir `RESEND_AUDIENCE_ID` en Vercel → Settings → Environment Variables
- [ ] Probar suscripción en local (`npm run dev` → formulario en homepage)
- [ ] Configurar Broadcast semanal desde Resend dashboard

## Dominios descartados

- `pomelobaby.com` — HugeDomains pide $7.095 (especulador)
- `pomelo.bb` — ccTLD de Barbados, caro (~$100-200/año), restricciones, baja confianza en ES
- `pomelobby.com` — se lee "pome-lobby", genera errores al dictarlo
