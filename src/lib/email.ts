/**
 * Envío de correos a través de la API REST de Resend.
 *
 * Se usa `fetch` directo en vez del SDK: el Worker queda más liviano y no
 * arrastra dependencias de Node que Cloudflare tendría que emular.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** Remitente. Debe ser un dominio verificado en Resend. */
export const DEFAULT_FROM = 'TSA Logística <cotizaciones@tstransportes.cl>';

/** Destinatario interno: donde la empresa recibe las solicitudes. */
export const DEFAULT_TO = 'tsasesoriaspublicas@outlook.com';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}

/** Escapa el texto del usuario antes de meterlo en el HTML del correo. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Corta cabeceras inyectadas: si alguien mete saltos de línea en el asunto o en
 * el remitente puede añadir destinatarios ocultos.
 */
export function sanitizeHeader(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').trim();
}

export async function sendEmail(apiKey: string, payload: EmailPayload, from = DEFAULT_FROM) {
  const response = await fetch(RESEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [payload.to],
      subject: sanitizeHeader(payload.subject),
      html: payload.html,
      text: payload.text,
      ...(payload.replyTo ? { reply_to: sanitizeHeader(payload.replyTo) } : {}),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend respondió ${response.status}: ${detail}`);
  }

  return response.json();
}

/* ── Plantilla visual compartida por todos los correos ── */

const BRAND_BLUE = '#1a4fcc';
const BRAND_RED = '#cc1f1f';

export function layout(title: string, accent: 'blue' | 'red', bodyHtml: string): string {
  const color = accent === 'red' ? BRAND_RED : BRAND_BLUE;
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f2f4f8;font-family:Arial,Helvetica,sans-serif;color:#1a1d26;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;">
    <tr><td style="height:5px;background:${color};"></td></tr>
    <tr>
      <td style="padding:28px 32px 8px;">
        <h1 style="margin:0 0 4px;font-size:20px;line-height:1.3;color:#0d1018;">${escapeHtml(title)}</h1>
        <p style="margin:0;font-size:13px;color:#7a8299;">TSA Logística y Transporte</p>
      </td>
    </tr>
    <tr><td style="padding:16px 32px 28px;font-size:15px;line-height:1.6;">${bodyHtml}</td></tr>
    <tr>
      <td style="padding:18px 32px;background:#0d1018;color:#c8d0e8;font-size:12px;line-height:1.6;">
        TS Asesorías Públicas SPA — RUT 76.426.367-7<br>
        Tucapel 2185, La Pintana, Santiago<br>
        +56 9 91617552 · +56 9 40416543<br>
        <a href="https://tstransportes.cl" style="color:#7fa5ff;">tstransportes.cl</a>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Fila etiqueta/valor para los correos internos. */
export function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 12px 6px 0;font-size:13px;color:#7a8299;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:15px;color:#1a1d26;">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
  </tr>`;
}
