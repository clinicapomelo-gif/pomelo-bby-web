import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const resendKey = import.meta.env.RESEND_API_KEY;
  if (!resendKey) {
    return new Response(
      JSON.stringify({ error: 'Resend no está configurado.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const resend = new Resend(resendKey);

  const formData = await request.formData();
  const nombre = formData.get('nombre')?.toString() || '';
  const email = formData.get('email')?.toString() || '';
  const edad = formData.get('edad')?.toString() || '';
  const motivo = formData.get('motivo')?.toString() || '';
  const contexto = formData.get('contexto')?.toString() || '';

  if (!nombre || !email || !edad || !motivo) {
    return new Response(
      JSON.stringify({ error: 'Faltan campos obligatorios.' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // TODO: Manejar archivos adjuntos (fotos/vídeos)
  // Por ahora se ignoran — en el futuro se pueden subir a Vercel Blob
  // y adjuntar los links en el email

  try {
    await resend.emails.send({
      from: 'pomelo.bby <onboarding@resend.dev>',
      to: 'rafallytbprm@gmail.com',
      replyTo: email,
      subject: `Consulta por mensaje de ${nombre} — pomelo.bby`,
      html: `
        <h2>Nueva consulta por mensaje</h2>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Edad del bebé:</strong> ${edad}</p>
        <hr />
        <h3>¿Qué le preocupa?</h3>
        <p>${motivo.replace(/\n/g, '<br />')}</p>
        ${contexto ? `<hr /><h3>Contexto adicional</h3><p>${contexto.replace(/\n/g, '<br />')}</p>` : ''}
        <hr />
        <p><em>Responder a este email contesta directamente a ${nombre} (${email})</em></p>
      `,
    });

    return redirect('/consulta-mensaje/enviado', 303);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido';
    console.error('Resend error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
