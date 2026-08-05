import type { APIRoute } from 'astro';
// En Astro 7 las variables del Worker se leen así (antes: Astro.locals.runtime.env)
import { env } from 'cloudflare:workers';
import { DEFAULT_FROM, DEFAULT_TO, escapeHtml, layout, row, sendEmail } from '../../lib/email';
import { EMAIL_RE, SERVICIOS, TEL_RE, field, json } from '../../lib/validation';

// Este endpoint necesita servidor: el resto del sitio sigue siendo estático.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const vars = env as Record<string, string | undefined>;
  const apiKey = vars.RESEND_API_KEY;
  const to = vars.MAIL_TO ?? DEFAULT_TO;
  const from = vars.MAIL_FROM ?? DEFAULT_FROM;

  if (!apiKey) {
    console.error('Falta RESEND_API_KEY en las variables del Worker');
    return json({ ok: false, error: 'config' }, 503);
  }

  let data: Record<string, unknown>;
  try {
    data = await request.json();
  } catch {
    return json({ ok: false, error: 'formato' }, 400);
  }

  // Trampa anti-bots: campo oculto que una persona nunca rellena.
  if (field(data.website, 200)) return json({ ok: true });

  const nombre = field(data.nombre, 100);
  const empresa = field(data.empresa, 120);
  const telefono = field(data.telefono, 20);
  const correo = field(data.correo, 120);
  const servicio = field(data.servicio, 40);
  const detalle = field(data.detalle, 1000);

  const errores: string[] = [];
  if (nombre.length < 3) errores.push('nombre');
  if (!TEL_RE.test(telefono)) errores.push('telefono');
  if (!EMAIL_RE.test(correo)) errores.push('correo');
  if (!SERVICIOS[servicio]) errores.push('servicio');
  if (errores.length) return json({ ok: false, error: 'validacion', campos: errores }, 400);

  const servicioLabel = SERVICIOS[servicio];

  /* ── Correo interno: la solicitud para la empresa ── */
  const internoHtml = layout(
    'Nueva solicitud de cotización',
    'red',
    `<table role="presentation" cellpadding="0" cellspacing="0">
      ${row('Nombre', nombre)}
      ${empresa ? row('Empresa', empresa) : ''}
      ${row('Teléfono', telefono)}
      ${row('Correo', correo)}
      ${row('Servicio', servicioLabel)}
      ${detalle ? row('Detalle', detalle) : ''}
     </table>
     <p style="margin:20px 0 0;font-size:13px;color:#7a8299;">
       Puedes responder directamente a este correo: la respuesta le llegará a ${escapeHtml(nombre)}.
     </p>`
  );

  const internoText = [
    'NUEVA SOLICITUD DE COTIZACIÓN',
    '',
    `Nombre: ${nombre}`,
    empresa ? `Empresa: ${empresa}` : null,
    `Teléfono: ${telefono}`,
    `Correo: ${correo}`,
    `Servicio: ${servicioLabel}`,
    detalle ? `\nDetalle:\n${detalle}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  /* ── Acuse de recibo para el cliente ── */
  const clienteHtml = layout(
    'Recibimos tu solicitud',
    'blue',
    `<p style="margin:0 0 14px;">Hola ${escapeHtml(nombre.split(' ')[0])},</p>
     <p style="margin:0 0 14px;">
       Gracias por escribirnos. Recibimos tu solicitud de cotización y un miembro
       de nuestro equipo la está revisando. Te contactaremos a la brevedad.
     </p>
     <p style="margin:0 0 8px;font-size:13px;color:#7a8299;">Esto fue lo que nos enviaste:</p>
     <table role="presentation" cellpadding="0" cellspacing="0" style="background:#f2f4f8;border-radius:6px;padding:12px 16px;">
       ${row('Servicio', servicioLabel)}
       ${detalle ? row('Detalle', detalle) : ''}
     </table>
     <p style="margin:18px 0 0;">
       Si necesitas algo urgente, llámanos al <strong>+56 9 91617552</strong>.
     </p>`
  );

  const clienteText = [
    `Hola ${nombre.split(' ')[0]},`,
    '',
    'Gracias por escribirnos. Recibimos tu solicitud de cotización y un miembro de',
    'nuestro equipo la está revisando. Te contactaremos a la brevedad.',
    '',
    `Servicio: ${servicioLabel}`,
    detalle ? `Detalle: ${detalle}` : null,
    '',
    'Si necesitas algo urgente, llámanos al +56 9 91617552.',
    '',
    'TSA Logística y Transporte — tstransportes.cl',
  ]
    .filter(Boolean)
    .join('\n');

  try {
    // El correo interno es el que no se puede perder: si falla, es un error.
    await sendEmail(
      apiKey,
      {
        to,
        subject: `Cotización — ${nombre}${empresa ? ` (${empresa})` : ''} — ${servicioLabel}`,
        html: internoHtml,
        text: internoText,
        replyTo: correo,
      },
      from
    );
  } catch (error) {
    console.error('Fallo al enviar la solicitud a la empresa', error);
    return json({ ok: false, error: 'envio' }, 502);
  }

  try {
    await sendEmail(
      apiKey,
      {
        to: correo,
        subject: 'Recibimos tu solicitud — TSA Logística y Transporte',
        html: clienteHtml,
        text: clienteText,
      },
      from
    );
  } catch (error) {
    // La solicitud ya llegó a la empresa; que falle el acuse no es motivo para
    // decirle al cliente que hubo un error.
    console.error('Fallo al enviar el acuse al cliente', error);
  }

  return json({ ok: true });
};
