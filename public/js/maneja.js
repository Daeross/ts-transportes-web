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

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validate()) return;
    submit.disabled = true;
    submit.textContent = 'Enviando...';

    const nombre      = document.getElementById('e-nombre').value.trim();
    const rut         = document.getElementById('e-rut').value.trim();
    const telefono    = document.getElementById('e-telefono').value.trim();
    const correo      = document.getElementById('e-correo').value.trim();
    const licencia    = document.getElementById('e-licencia').value;
    const experiencia = document.getElementById('e-experiencia').value;
    const tipo        = document.getElementById('e-tipo').value;
    const mensaje     = document.getElementById('e-mensaje').value.trim();

    const subject = encodeURIComponent('Postulación Conductor — TSA Logística');
    const body    = encodeURIComponent(
      'POSTULACIÓN CONDUCTOR\n' +
      '=====================\n' +
      'Nombre: ' + nombre + '\n' +
      'RUT: ' + rut + '\n' +
      'Teléfono: ' + telefono + '\n' +
      'Correo: ' + correo + '\n' +
      'Licencia: ' + licencia + '\n' +
      'Experiencia: ' + experiencia + ' años\n' +
      (tipo ? 'Tipo de carga: ' + tipo + '\n' : '') +
      (mensaje ? '\nAcerca del postulante:\n' + mensaje : '')
    );

    window.location.href = 'mailto:tsasesoriaspublicas@outlook.com?subject=' + subject + '&body=' + body;

    setTimeout(() => {
      submit.textContent = '✓ Abriendo tu correo…';
      submit.style.background = '#1a6b2e';
      submit.style.clipPath = 'none';
      setTimeout(() => {
        submit.textContent = 'Enviar postulación →';
      // (el mailto abre el cliente de correo; no hay envío automático)
        submit.style.background = '';
        submit.style.clipPath = '';
        submit.disabled = false;
        form.reset();
        ['nombre','rut','telefono','correo','licencia','experiencia'].forEach(id => setErr(id, false));
      }, 4000);
    }, 800);
  });
