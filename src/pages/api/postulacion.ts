import type { APIRoute } from 'astro';
// En Astro 7 las variables del Worker se leen así (antes: Astro.locals.runtime.env)
import { env } from 'cloudflare:workers';
import { DEFAULT_FROM, DEFAULT_TO, escapeHtml, layout, row, sendEmail } from '../../lib/email';
import { EMAIL_RE, EXPERIENCIAS, LICENCIAS, RUT_RE, TEL_RE, TIPOS_CARGA, field, json } from '../../lib/validation';

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

  if (field(data.website, 200)) return json({ ok: true });

  const nombre = field(data.nombre, 120);
  const rut = field(data.rut, 12);
  const telefono = field(data.telefono, 20);
  const correo = field(data.correo, 120);
  const licencia = field(data.licencia, 10);
  const experiencia = field(data.experiencia, 10);
  const tipo = field(data.tipo, 20);
  const mensaje = field(data.mensaje, 800);

  const errores: string[] = [];
  if (nombre.length < 3) errores.push('nombre');
  if (!RUT_RE.test(rut.replace(/\./g, ''))) errores.push('rut');
  if (!TEL_RE.test(telefono)) errores.push('telefono');
  if (!EMAIL_RE.test(correo)) errores.push('correo');
  if (!LICENCIAS[licencia]) errores.push('licencia');
  if (!EXPERIENCIAS[experiencia]) errores.push('experiencia');
  if (errores.length) return json({ ok: false, error: 'validacion', campos: errores }, 400);

  const licenciaLabel = LICENCIAS[licencia];
  const experienciaLabel = EXPERIENCIAS[experiencia];
  const tipoLabel = TIPOS_CARGA[tipo] ?? '';

  const internoHtml = layout(
    'Nueva postulación de conductor',
    'blue',
    `<table role="presentation" cellpadding="0" cellspacing="0">
      ${row('Nombre', nombre)}
      ${row('RUT', rut)}
      ${row('Teléfono', telefono)}
      ${row('Correo', correo)}
      ${row('Licencia', licenciaLabel)}
      ${row('Experiencia', experienciaLabel)}
      ${tipoLabel ? row('Tipo de carga', tipoLabel) : ''}
      ${mensaje ? row('Sobre el postulante', mensaje) : ''}
     </table>
     <p style="margin:20px 0 0;font-size:13px;color:#7a8299;">
       Puedes responder directamente a este correo: la respuesta le llegará a ${escapeHtml(nombre)}.
     </p>`
  );

  const internoText = [
    'NUEVA POSTULACIÓN DE CONDUCTOR',
    '',
    `Nombre: ${nombre}`,
    `RUT: ${rut}`,
    `Teléfono: ${telefono}`,
    `Correo: ${correo}`,
    `Licencia: ${licenciaLabel}`,
    `Experiencia: ${experienciaLabel}`,
    tipoLabel ? `Tipo de carga: ${tipoLabel}` : null,
    mensaje ? `\nSobre el postulante:\n${mensaje}` : null,
  ]
    .filter(Boolean)
    .join('\n');

  const clienteHtml = layout(
    'Recibimos tu postulación',
    'blue',
    `<p style="margin:0 0 14px;">Hola ${escapeHtml(nombre.split(' ')[0])},</p>
     <p style="margin:0 0 14px;">
       Gracias por tu interés en manejar con nosotros. Recibimos tu postulación y
       la estamos revisando. Si tu perfil calza con lo que buscamos, te
       contactaremos para conversar.
     </p>
     <p style="margin:0;font-size:13px;color:#7a8299;">
       Licencia ${escapeHtml(licenciaLabel)} · ${escapeHtml(experienciaLabel)} de experiencia
     </p>`
  );

  const clienteText = [
    `Hola ${nombre.split(' ')[0]},`,
    '',
    'Gracias por tu interés en manejar con nosotros. Recibimos tu postulación y la',
    'estamos revisando. Si tu perfil calza con lo que buscamos, te contactaremos',
    'para conversar.',
    '',
    `Licencia ${licenciaLabel} · ${experienciaLabel} de experiencia`,
    '',
    'TSA Logística y Transporte — tstransportes.cl',
  ].join('\n');

  try {
    await sendEmail(
      apiKey,
      {
        to,
        subject: `Postulación conductor — ${nombre} — Licencia ${licencia}`,
        html: internoHtml,
        text: internoText,
        replyTo: correo,
      },
      from
    );
  } catch (error) {
    console.error('Fallo al enviar la postulación a la empresa', error);
    return json({ ok: false, error: 'envio' }, 502);
  }

  try {
    await sendEmail(
      apiKey,
      {
        to: correo,
        subject: 'Recibimos tu postulación — TSA Logística y Transporte',
        html: clienteHtml,
        text: clienteText,
      },
      from
    );
  } catch (error) {
    console.error('Fallo al enviar el acuse al postulante', error);
  }

  return json({ ok: true });
};
