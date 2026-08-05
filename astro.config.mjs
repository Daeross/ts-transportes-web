// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // Dominio del sitio publicado: se usa para canonical y Open Graph absolutos.
  site: 'https://tstransportes.netlify.app',

  // Las URLs del sitio antiguo (/web/*.html) se redirigen con 301 reales desde
  // public/_redirects, que lee el host (Cloudflare Pages / Netlify). No se usa
  // `redirects` de Astro porque genera una carpeta llamada "algo.html".

  vite: {
    plugins: [tailwindcss()]
  }
});