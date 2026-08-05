/**
 * Validación de los formularios en el servidor.
 *
 * El navegador ya valida, pero eso solo mejora la experiencia: cualquiera puede
 * enviar una petición directa al endpoint. Estas reglas son las que mandan.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const TEL_RE = /^[\d\s+\-()]{7,20}$/;
export const RUT_RE = /^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$/;

/** Normaliza un campo: recorta y limita el largo para evitar cuerpos enormes. */
export function field(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export const SERVICIOS: Record<string, string> = {
  maquinaria: 'Maquinaria pesada',
  construccion: 'Materiales de construcción',
  contenedor: 'Contenedor marítimo',
  mineria: 'Equipos de minería',
  vehiculos: 'Vehículos',
  agricola: 'Equipos agrícolas',
  conductor: 'Servicio de conductor',
  otro: 'Otro',
};

export const LICENCIAS: Record<string, string> = {
  A2: 'A2 — Camión simple',
  A3: 'A3 — Camión con acoplado',
  A4: 'A4 — Camión articulado (tracto)',
  otra: 'Otra',
};

export const EXPERIENCIAS: Record<string, string> = {
  '2-5': '2 a 5 años',
  '5-10': '5 a 10 años',
  '10+': 'Más de 10 años',
};

export const TIPOS_CARGA: Record<string, string> = {
  plana: 'Rampla plana',
  'cama-baja': 'Cama baja',
  sider: 'Síder / carga cerrada',
  contenedor: 'Contenedores',
  varios: 'Varios tipos',
};

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}
