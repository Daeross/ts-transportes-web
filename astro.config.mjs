// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  // Las páginas siguen siendo estáticas (se generan en el build). El adaptador
  // solo existe para los endpoints de /src/pages/api, que sí necesitan servidor
  // porque envían los correos de los formularios.
  adapter: cloudflare(),

  // Dominio del sitio publicado: se usa para canonical y Open Graph absolutos.
  site: 'https://tstransportes.cl',

  // Las URLs del sitio antiguo (/web/*.html) se redirigen con 301 reales desde
  // public/_redirects, que lee el host (Cloudflare Pages / Netlify). No se usa
  // `redirects` de Astro porque genera una carpeta llamada "algo.html".

  vite: {
    plugins: [tailwindcss()]
  }
});