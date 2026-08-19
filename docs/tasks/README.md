# Tareas — cambios web pomelo.bby

Cada archivo de esta carpeta es una tarea que se puede entregar a un agente distinto. El texto aprobado está centralizado en [`CONTENT.md`](./CONTENT.md).

## Orden recomendado

1. [`01-consultas.md`](./01-consultas.md)
2. [`02-inicio-y-sobre-mi.md`](./02-inicio-y-sobre-mi.md)
3. [`03-logo-global.md`](./03-logo-global.md)
4. [`04-catalogo-tienda.md`](./04-catalogo-tienda.md)
5. [`05-lead-magnet-25-cosas.md`](./05-lead-magnet-25-cosas.md)
6. [`06-entrega-guias-de-pago.md`](./06-entrega-guias-de-pago.md), cuando existan los PDF finales
7. [`07-qa-final.md`](./07-qa-final.md), al terminar las anteriores

## Qué puede hacerse en paralelo

- 01, 02, 03 y 04 pueden empezar en paralelo, aunque cada agente debe trabajar en una rama distinta.
- 05 debe comenzar después de integrar 02 y 04 porque conecta Inicio y Tienda con el recurso gratuito.
- 06 está bloqueada hasta disponer de los PDF, portadas e identificadores reales de Stripe.
- 07 siempre va al final.

## Reglas comunes para todos los agentes

- Leer `AGENTS.md` antes de modificar código.
- Revisar `git status` y no borrar ni sobrescribir cambios ajenos.
- No editar ni crear archivos `.bak`.
- Mantener el tono, el lenguaje inclusivo y las reglas editoriales de `AGENTS.md`.
- No inventar credenciales, enlaces, logos, PDF, identificadores de Stripe ni eventos de Cal.com.
- No incluir secretos en el repositorio. Usar variables de entorno cuando corresponda.
- Evitar dependencias nuevas salvo que sean imprescindibles.
- Limitar los cambios al alcance de la tarea asignada.
- Ejecutar `npm run build` antes de entregar.
- Informar de los archivos modificados, las pruebas realizadas y cualquier bloqueo externo.
