# Canales para solicitar fotografías y vídeos en consultas

## Estado

**Sustituido por el [ADR 0004](adr/0004-whatsapp-business-para-consultas.md)** (7 oct 2026): fotos y vídeos por WhatsApp Business con la opción «ver una vez», sin conservarlos; Mar describe en Clinic lo que ve. Este documento se mantiene como referencia por si la asesoría exige conservar las imágenes; en ese caso, Tresorit Send era el primer candidato.

Este documento compara alternativas para los casos en los que Mar, después de leer una consulta pagada, necesite solicitar una fotografía o un vídeo. Las familias no deben enviar archivos de forma preventiva.

## Requisitos

El canal debería:

- Ser sencillo desde un móvil y no exigir conocimientos técnicos.
- Ser gratuito o tener un coste despreciable con el volumen inicial.
- No acumular archivos permanentemente.
- Cifrar el contenido durante el envío y mientras permanezca almacenado.
- Permitir caducidad, borrado y acceso limitado.
- Evitar nombres públicos, enlaces indexables y datos identificativos innecesarios.
- Ser compatible con las obligaciones aplicables a datos de salud de niños y niñas.

Un envío asíncrono sin ningún almacenamiento no es posible: el archivo debe permanecer temporalmente en el dispositivo emisor, en el receptor o en un intermediario. El objetivo realista es que el almacenamiento sea cifrado, mínimo y con un borrado definido.

## Cuestión previa que condiciona la decisión

Antes de aprobar un canal hay que determinar con el profesional legal si una imagen utilizada para prestar la consulta:

1. Puede eliminarse después de que Mar documente únicamente la observación y la orientación ofrecida; o
2. Debe conservarse como parte de la documentación clínica durante el plazo legal correspondiente.

Si el archivo debe conservarse, un servicio temporal no es suficiente. Haría falta un repositorio clínico con control de acceso, integridad, disponibilidad, trazabilidad y una política de conservación adecuada.

El cifrado por sí solo tampoco garantiza el cumplimiento del RGPD. Hay que revisar el contrato del proveedor, sus subencargados, transferencias internacionales, metadatos, dispositivos y procedimiento de borrado.

## Alternativas

### 1. Tresorit Send

<https://send.tresorit.com/>

**Encaje:** mejor candidato inicial para probar con familias.

Ventajas:

- Funciona en el navegador y la familia no necesita crear una cuenta.
- Hasta 5 GB por envío según las condiciones actuales.
- Tresorit declara cifrado en el navegador y de extremo a extremo.
- Permite proteger el enlace con contraseña.
- El enlace caduca automáticamente; actualmente se documentan 7 días y un máximo de 10 descargas.
- El proveedor es una empresa suiza orientada a almacenamiento cifrado.

Inconvenientes:

- La contraseña debería comunicarse por un canal diferente al enlace; ese paso puede resultar confuso para algunas familias.
- Mar debe descargar el archivo y eliminar después la copia local y la papelera.
- No está confirmado que el servicio gratuito ofrezca un contrato de encargado del tratamiento del artículo 28 del RGPD adecuado para una profesional sanitaria.
- La caducidad del enlace no elimina las copias que ya se hayan descargado.

**Siguiente paso:** realizar una prueba desde iPhone y Android con una persona no técnica antes de adoptarlo.

### 2. Wormhole

<https://wormhole.app/>

Ventajas:

- Funciona en el navegador y no requiere cuenta.
- Cifra el archivo en el navegador; la clave forma parte del fragmento privado del enlace.
- Los archivos pequeños permanecen cifrados y caducan actualmente a las 24 horas o al alcanzar el límite de descargas.
- Reduce más que Tresorit el tiempo de almacenamiento en el proveedor.

Inconvenientes:

- El enlace completo es la credencial: quien lo obtenga puede descargar y descifrar el archivo.
- No ofrece una segunda contraseña independiente.
- La caducidad de 24 horas puede provocar reenvíos y frustración si Mar no puede revisarlo a tiempo.
- El proveedor es estadounidense y no está confirmado un contrato profesional de encargado del tratamiento.

**Encaje:** alternativa técnica muy efímera, pero menos cómoda y con más incertidumbre contractual.

### 3. Proton Drive

<https://proton.me/drive>

Ventajas:

- Cifrado de extremo a extremo.
- Proveedor suizo consolidado.
- Los enlaces compartidos pueden protegerse y revocarse.
- El plan gratuito ofrece almacenamiento limitado.

Inconvenientes:

- No se ha confirmado un buzón gratuito de recepción que permita a cualquier familia subir sin cuenta.
- En el flujo disponible, la familia tendría que crear una cuenta, subir el archivo y compartirlo.
- El archivo permanece hasta que la persona propietaria lo elimine; no resuelve bien el borrado automático.

**Encaje:** buena seguridad, pero demasiada fricción para las familias.

### 4. SwissTransfer

<https://www.swisstransfer.com/>

Ventajas:

- No requiere cuenta.
- Permite archivos grandes, contraseña, caducidad y límite de descargas.
- Almacenamiento en Suiza.

Inconvenientes:

- No se ha confirmado cifrado de extremo a extremo con claves inaccesibles para el proveedor.
- El plazo de conservación es mayor que en otras alternativas.
- Sigue pendiente revisar su encaje contractual para datos sanitarios.

**Encaje:** cómodo para archivos generales, pero no sería la primera opción para material clínico.

### 5. Google Drive con acceso restringido

Ventajas:

- Es conocido por muchas familias.
- Puede compartirse solo con una cuenta profesional concreta, sin utilizar “cualquiera con el enlace”.
- Si el archivo continúa siendo propiedad de la familia, no consume el almacenamiento de Mar.

Inconvenientes:

- Las familias pueden configurar mal los permisos.
- No hay borrado automático garantizado.
- Puede exigir una cuenta de Google y una cuenta profesional adecuada para Mar.
- Quedan pendientes la idoneidad contractual, la conservación y la actualización de la información de privacidad.

**Encaje:** posible excepción, pero no un flujo uniforme y controlable.

### 6. Signal

Ventajas:

- Cifrado de extremo a extremo.
- Gratuito y con mensajes temporales.
- Los nombres de usuario permiten reducir la exposición del número de teléfono.

Inconvenientes:

- Obliga a instalar una aplicación y crea un nuevo canal de atención.
- Los mensajes temporales no garantizan que no existan capturas, descargas o copias locales.
- Dificulta vincular cada archivo con la consulta correspondiente y controlar la conservación.
- Puede generar la expectativa de atención continuada o urgente por mensajería.

**Encaje:** no recomendado como canal oficial de consultas.

### 7. Transferencia P2P desde el navegador

Servicios como PairDrop o ToffeeShare intentan transferir directamente entre dispositivos sin conservar el archivo en un servidor.

Ventajas:

- No hay almacenamiento intermedio permanente.
- Pueden ofrecer cifrado y no requieren cuenta.

Inconvenientes:

- Mar y la familia deben estar conectados al mismo tiempo.
- La transferencia puede fallar al bloquear el móvil, cambiar de red o cerrar la pestaña.
- Proveedores pequeños, soporte limitado y experiencia difícil de estandarizar.

**Encaje:** cumple mejor el objetivo de no almacenar, pero no el requisito de facilidad asíncrona.

### 8. Subida privada propia con Vercel Blob

Ventajas:

- Experiencia integrada en pomelobaby.es.
- Control sobre límites, caducidad y textos mostrados a la familia.
- Vercel ya es un proveedor del proyecto.

Inconvenientes:

- Un Blob privado no incluye por sí solo cifrado de extremo a extremo ni borrado automático.
- Habría que construir autorización de carga, acceso profesional, validación de archivos, límites, registros seguros, protección contra reutilización y limpieza automática.
- Cal.com y Stripe tendrían que proporcionar una forma fiable de vincular el archivo a una consulta pagada.
- Aumenta la responsabilidad técnica y de protección de datos.

**Encaje:** no compensa para envíos ocasionales. Solo reconsiderarlo si el volumen demuestra una necesidad real y ya está definida la conservación clínica.

### 9. Plataforma clínica o plan empresarial

Ventajas:

- Puede ofrecer contrato de encargado, control de acceso, auditoría, conservación y soporte profesional.
- Es la opción adecuada si los archivos deben formar parte de la documentación clínica.

Inconvenientes:

- Normalmente tiene coste.
- Requiere evaluar e implantar otra herramienta.

**Encaje:** opción correcta si la revisión legal exige garantías que los servicios gratuitos no proporcionan.

## Opciones descartadas como canal oficial

- Adjuntos por email: dejan copias en varios buzones, redirecciones, dispositivos y copias de seguridad.
- Instagram: mezcla el canal profesional con mensajería general, dificulta la conservación y puede generar expectativas de atención urgente.
- WhatsApp quedó descartado por los mismos motivos hasta que Pomelo Baby tuvo un número propio. Desde el 7 oct 2026 es el canal de consultas, con las condiciones del [ADR 0004](adr/0004-whatsapp-business-para-consultas.md).
- Enlaces públicos de Drive: cualquier persona con el enlace podría acceder.
- Subidas preventivas: recogen datos que quizá Mar no necesita.

## Prueba de usabilidad propuesta para Tresorit Send

Antes de tomar una decisión, hacer una prueba controlada sin datos reales:

1. Mar solicita una fotografía y un vídeo ficticios mediante el correo de consulta.
2. Una persona no técnica abre Tresorit Send desde iPhone y otra desde Android.
3. Ambas intentan subir, proteger y compartir el archivo sin ayuda.
4. Mar abre el enlace desde ordenador y móvil.
5. Se comprueba cuánto tarda el proceso y dónde se guarda la descarga.
6. Se verifica la caducidad, el límite de descargas y el borrado local.
7. Se anota si la contraseña por un segundo canal hace el flujo demasiado complejo.

Criterios para aprobar la experiencia:

- La familia completa el envío en menos de tres minutos.
- No necesita crear una cuenta ni instalar una aplicación.
- Comprende qué debe enviar y qué no.
- El enlace no queda público.
- Mar puede localizar, revisar y eliminar la copia sin acumular archivos.
- El proveedor y el flujo reciben aprobación legal para este uso.

## Decisión provisional

1. Probar primero **Tresorit Send** por su equilibrio entre facilidad, cifrado y caducidad.
2. Mantener **Wormhole** únicamente como alternativa a comparar, no como canal aprobado.
3. No desarrollar una subida propia mientras el uso sea ocasional.
4. Si ningún servicio gratuito supera la revisión contractual o los archivos deben conservarse, seleccionar una **plataforma clínica o empresarial**.
5. Cuando se elija proveedor, actualizar la Política de privacidad, las instrucciones del formulario y este documento con el procedimiento definitivo.

Las capacidades y límites de los planes gratuitos pueden cambiar. Deben comprobarse de nuevo en la documentación y condiciones del proveedor antes de aprobar el canal.
