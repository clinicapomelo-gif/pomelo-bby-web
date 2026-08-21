#!/usr/bin/env bash

DOMAIN="pomelobaby.es"
DNS_SERVER="1.1.1.1"
SECONDARY_DNS_SERVER="8.8.8.8"
WATCH_INTERVAL=30
WATCH=false

if [[ "${1:-}" == "--watch" ]]; then
  WATCH=true
fi

pass() {
  printf '✓ %s: %s\n' "$1" "$2"
  passed=$((passed + 1))
}

fail() {
  printf '✗ %s: %s\n' "$1" "${2:-todavía no publicado}"
}

contains() {
  printf '%s\n' "$1" | grep -Fq "$2"
}

dns() {
  local type="$1"
  local name="$2"
  dig +short "@$DNS_SERVER" "$name" "$type" 2>/dev/null
}

run_checks() {
  passed=0
  total=11
  printf '\nComprobación de %s — %s\n\n' "$DOMAIN" "$(date '+%d/%m/%Y %H:%M:%S')"

  status="$(curl -sSL -o /dev/null -w '%{http_code}' --max-time 10 https://pomelo-bby-web.vercel.app 2>/dev/null || true)"
  if [[ "$status" == "200" ]]; then
    pass "Despliegue de Vercel disponible" "HTTP $status"
  else
    fail "Despliegue de Vercel disponible" "${status:+HTTP $status}"
  fi

  records="$(dns NS "$DOMAIN")"
  secondary_records="$(dig +short "@$SECONDARY_DNS_SERVER" "$DOMAIN" NS 2>/dev/null)"
  if contains "$records" "ns1.dondominio.com." && contains "$records" "ns2.dondominio.com." &&
     contains "$secondary_records" "ns1.dondominio.com." && contains "$secondary_records" "ns2.dondominio.com."; then
    pass "Delegación pública en DonDominio" "Cloudflare y Google la publican"
  else
    fail "Delegación pública en DonDominio" "Cloudflare: ${records:-sin datos}; Google: ${secondary_records:-sin datos}"
  fi

  records="$(dns A "$DOMAIN")"
  if contains "$records" "216.198.79.1"; then
    pass "Dominio raíz apuntando a Vercel" "$records"
  else
    fail "Dominio raíz apuntando a Vercel" "$records"
  fi

  records="$(dns CNAME "www.$DOMAIN")"
  if contains "$records" "309324ecb7b8fada.vercel-dns-017.com."; then
    pass "www apuntando a Vercel" "$records"
  else
    fail "www apuntando a Vercel" "$records"
  fi

  records="$(dns MX "$DOMAIN")"
  if contains "$records" "10 mx01.dondominio.com."; then
    pass "Correo entrante en DonDominio" "$records"
  else
    fail "Correo entrante en DonDominio" "$records"
  fi

  records="$(dns TXT "resend._domainkey.$DOMAIN")"
  if contains "$records" "p="; then
    pass "DKIM de Resend publicado" "encontrado"
  else
    fail "DKIM de Resend publicado" "$records"
  fi

  records="$(dns TXT "send.$DOMAIN")"
  if contains "$records" "include:amazonses.com"; then
    pass "SPF de Resend publicado" "encontrado"
  else
    fail "SPF de Resend publicado" "$records"
  fi

  records="$(dns MX "send.$DOMAIN")"
  if contains "$records" "10 feedback-smtp.eu-west-1.amazonses.com."; then
    pass "MX de Resend publicado" "$records"
  else
    fail "MX de Resend publicado" "$records"
  fi

  records="$(dns TXT "_dmarc.$DOMAIN")"
  if contains "$records" "v=DMARC1;"; then
    pass "DMARC publicado" "encontrado"
  else
    fail "DMARC publicado" "$records"
  fi

  apex_ip="$(dns A "$DOMAIN" | grep -E '^[0-9.]+$' | head -n 1)"
  body=""
  page_status=""
  if [[ -n "$apex_ip" ]]; then
    body_file="$(mktemp -t pomelobaby-domain.XXXXXX)"
    page_status="$(curl -sS -o "$body_file" -w '%{http_code}' --max-time 10 --resolve "$DOMAIN:443:$apex_ip" "https://$DOMAIN" 2>/dev/null || true)"
    body="$(cat "$body_file")"
    rm -f "$body_file"
  fi

  if [[ "$page_status" == "200" ]]; then
    page_title="$(printf '%s' "$body" | grep -o '<title>[^<]*' | head -n 1 | sed 's/<title>//')"
    pass "Web pública disponible por HTTPS" "HTTP 200 — ${page_title:-sin título}"
  else
    fail "Web pública disponible por HTTPS" "${page_status:+HTTP $page_status}"
  fi

  redirect_result=""
  if [[ -n "$apex_ip" ]]; then
    redirect_result="$(curl -sS -o /dev/null -w '%{http_code}|%{redirect_url}' --max-time 10 --resolve "www.$DOMAIN:443:$apex_ip" "https://www.$DOMAIN" 2>/dev/null || true)"
  fi
  redirect_status="${redirect_result%%|*}"
  redirect_url="${redirect_result#*|}"
  if [[ "$redirect_status" =~ ^(301|308)$ ]] && [[ "$redirect_url" == "https://$DOMAIN/" ]]; then
    pass "www redirige al dominio principal" "HTTP $redirect_status → $redirect_url"
  elif [[ "$redirect_status" == "200" ]]; then
    fail "www redirige al dominio principal" "HTTP 200: sirve la web en www, sin redirigir"
  elif [[ -n "$redirect_status" ]]; then
    fail "www redirige al dominio principal" "HTTP $redirect_status${redirect_url:+ → $redirect_url}"
  else
    fail "www redirige al dominio principal" "no disponible"
  fi

  printf '\n%s/%s comprobaciones correctas.\n' "$passed" "$total"
  [[ "$passed" -eq "$total" ]]
}

while true; do
  if run_checks; then
    printf '\nEl dominio, el correo y la web están operativos.\n'
    exit 0
  fi

  if [[ "$WATCH" != true ]]; then
    printf '\nTodavía no está todo listo. Usa --watch para repetir cada 30 segundos.\n'
    exit 1
  fi

  printf '\nNueva comprobación en %s segundos…\n' "$WATCH_INTERVAL"
  sleep "$WATCH_INTERVAL"
done
