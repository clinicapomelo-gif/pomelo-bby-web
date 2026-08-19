# Tarea 03 — Integrar el logo global

## Objetivo

Sustituir la marca escrita usada como recurso provisional por el logo oficial de pomelo.bby en los lugares globales de la web.

## Prerrequisito bloqueante

Debe existir un archivo oficial del logo, preferiblemente SVG, o PNG transparente de buena resolución. Si no se ha proporcionado, no inventar uno ni convertir texto arbitrario en logo: informar del bloqueo.

## Alcance

- `src/layouts/Layout.astro`
- `src/components/SEO.astro`, solo si hace falta para la imagen social
- `public/` para los recursos oficiales proporcionados
- Se puede crear `src/components/Logo.astro` si evita duplicación

## Requisitos

1. Mostrar el logo en:
   - Cabecera, enlazado a `/`.
   - Pie de página.
2. Usar una versión compacta o isotipo para favicon únicamente si se proporciona.
3. Configurar una imagen social por defecto solo si se proporciona un recurso apto para Open Graph.
4. Incluir texto alternativo adecuado y conservar un nombre accesible en el enlace de Inicio.
5. Mantener proporciones, evitar deformación y prevenir saltos de layout.
6. Asegurar contraste y tamaño correcto en móvil y escritorio.
7. No repetir el logo dentro de todas las tarjetas o secciones: “en todos lados” significa presencia global coherente, no decoración redundante.
8. No modificar navegación, textos comerciales o colores fuera de lo imprescindible.

## Criterios de aceptación

- Cabecera y pie usan el recurso oficial.
- El logo enlaza correctamente y es accesible.
- No hay deformaciones ni desbordes en móvil.
- Favicon y Open Graph solo se cambian si hay recursos oficiales adecuados.
- `npm run build` finaliza correctamente.
