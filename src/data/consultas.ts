// Solo en la preview de Cloudflare, para probar la reserva con Cal.com. En Production y en
// local siguen apagadas; para abrirlas, cambiar a `true`.
export const CONSULTATIONS_ENABLED = process.env.APP_ENV === 'preview';

// Consultas por correo que se pueden vender cada día (hora de Madrid), contando los pagos abiertos.
export const CONSULTA_CORREO_MAXIMO_DIARIO = 10;

// Pausa solo la consulta por correo (vacaciones, semanas cargadas). Se cambia aquí y se publica.
export const CONSULTA_CORREO_PAUSADA = false;
