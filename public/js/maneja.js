  /* ── TEMA CLARO / OSCURO ── */
  (function () {
    const STORAGE_KEY = 'tsa-theme';
    const root = document.documentElement;
    const btn  = document.getElementById('themeToggle');
    if (!btn) return;

    function sync(theme) {
      const isLight = theme === 'light';
      btn.setAttribute('aria-pressed', String(isLight));
      btn.setAttribute('aria-label', isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro');
      const icon = btn.querySelector('i');
      if (icon) icon.className = isLight ? 'ph ph-sun' : 'ph ph-moon';
    }

    sync(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

    btn.addEventListener('click', () => {
      const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
      sync(next);
    });
  })();

  const form    = document.getElementById('empleoForm');
  const submit  = document.getElementById('empleoSubmit');

  function setErr(id, val) {
    const fg = document.getElementById('fg-' + id);
    if (fg) fg.classList.toggle('has-error', val);
  }

  function validate() {
    let ok = true;
    const nombre     = document.getElementById('e-nombre').value.trim();
    const rut        = document.getElementById('e-rut').value.trim();
    const telefono   = document.getElementById('e-telefono').value.trim();
    const correo     = document.getElementById('e-correo').value.trim();
    const licencia   = document.getElementById('e-licencia').value;
    const experiencia = document.getElementById('e-experiencia').value;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const telRe   = /^[\d\s\+\-\(\)]{7,20}$/;
    const rutRe   = /^[\d]{1,2}\.?[\d]{3}\.?[\d]{3}-?[\dkK]$/;

    if (!nombre || nombre.length < 3)  { setErr('nombre', true);     ok = false; } else setErr('nombre', false);
    if (!rutRe.test(rut.replace(/\./g,'')))  { setErr('rut', true);  ok = false; } else setErr('rut', false);
    if (!telRe.test(telefono))         { setErr('telefono', true);   ok = false; } else setErr('telefono', false);
    if (!emailRe.test(correo))         { setErr('correo', true);     ok = false; } else setErr('correo', false);
    if (!licencia)                     { setErr('licencia', true);   ok = false; } else setErr('licencia', false);
    if (!experiencia)                  { setErr('experiencia', true); ok = false; } else setErr('experiencia', false);
    return ok;
  }

  const statusEl = document.getElementById('empleoStatus');

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validate()) return;
    submit.disabled = true;
    submit.textContent = 'Enviando...';
    if (statusEl) statusEl.textContent = 'Enviando tu postulación…';

    const payload = {
      nombre:      document.getElementById('e-nombre').value.trim(),
      rut:         document.getElementById('e-rut').value.trim(),
      telefono:    document.getElementById('e-telefono').value.trim(),
      correo:      document.getElementById('e-correo').value.trim(),
      licencia:    document.getElementById('e-licencia').value,
      experiencia: document.getElementById('e-experiencia').value,
      tipo:        document.getElementById('e-tipo').value,
      mensaje:     document.getElementById('e-mensaje').value.trim(),
      website:     (document.getElementById('e-website') || {}).value || ''
    };

    function restore(label) {
      submit.textContent      = label;
      submit.style.background = '';
      submit.style.clipPath   = '';
      submit.disabled         = false;
    }

    try {
      const res  = await fetch('/api/postulacion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        if (Array.isArray(data.campos)) data.campos.forEach(id => setErr(id, true));
        throw new Error(data.error || 'envio');
      }

      submit.textContent = '✓ Postulación enviada';
      submit.style.background = '#1a6b2e';
      submit.style.clipPath = 'none';
      if (statusEl) statusEl.textContent = 'Recibimos tu postulación. Te enviamos una confirmación a ' + payload.correo + '.';

      form.reset();
      ['nombre','rut','telefono','correo','licencia','experiencia'].forEach(id => setErr(id, false));

      setTimeout(() => {
        restore('Enviar postulación →');
        if (statusEl) statusEl.textContent = '';
      }, 6000);
    } catch (err) {
      restore('Reintentar envío →');
      if (statusEl) {
        statusEl.textContent = 'No pudimos enviar tu postulación. Vuelve a intentarlo o escríbenos a ' +
                               'tsasesoriaspublicas@outlook.com.';
      }
    }
  });
