  /* ── TEMA CLARO / OSCURO ──
     El atributo data-theme ya lo aplica el script anti-flash del <head>.
     Aquí solo gestionamos el botón, localStorage y la sincronización. */
  (function () {
    const STORAGE_KEY = 'tsa-theme';
    const root    = document.documentElement;
    const toggles = [
      document.getElementById('themeToggle'),
      document.getElementById('themeToggleMobile')
    ].filter(Boolean);
    if (!toggles.length) return;

    function currentTheme() {
      return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
    }

    function syncButtons(theme) {
      const isLight = theme === 'light';
      const iconClass = isLight ? 'ph ph-sun' : 'ph ph-moon';
      const label     = isLight ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro';
      const textLabel = isLight ? 'Modo oscuro' : 'Modo claro';
      toggles.forEach(btn => {
        btn.setAttribute('aria-pressed', String(isLight));
        btn.setAttribute('aria-label', label);
        const icon = btn.querySelector('i');
        if (icon) icon.className = iconClass;
        const txt = btn.querySelector('.tt-label');
        if (txt) txt.textContent = textLabel;
      });
    }

    function applyTheme(theme) {
      root.setAttribute('data-theme', theme);
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
      syncButtons(theme);
    }

    // Estado inicial coherente con lo que ya pintó el anti-flash
    syncButtons(currentTheme());

    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        applyTheme(currentTheme() === 'light' ? 'dark' : 'light');
      });
    });

    // Si el usuario no eligió manualmente, seguir la preferencia del sistema
    const media = window.matchMedia('(prefers-color-scheme: light)');
    media.addEventListener('change', e => {
      let stored = null;
      try { stored = localStorage.getItem(STORAGE_KEY); } catch (err) {}
      if (!stored) {
        const theme = e.matches ? 'light' : 'dark';
        root.setAttribute('data-theme', theme);
        syncButtons(theme);
      }
    });
  })();

  /* ── LOGO ACTIVO EN CARRUSEL ── */
  (function(){
    const carousel  = document.getElementById('logosCarousel');
    const nameEl    = document.getElementById('logoActiveName');
    if (!carousel || !nameEl) return;
    const slides = carousel.querySelectorAll('.logo-slide');
    let current = '';

    function update() {
      const cr = carousel.getBoundingClientRect();
      const centerX = cr.left + cr.width / 2;
      let best = null, minDist = Infinity;
      slides.forEach(slide => {
        const sr = slide.getBoundingClientRect();
        const dist = Math.abs((sr.left + sr.width / 2) - centerX);
        if (dist < minDist) { minDist = dist; best = slide; }
      });
      if (best) {
        const name = best.dataset.name || '';
        if (name !== current) {
          current = name;
          nameEl.classList.remove('show');
          setTimeout(() => { nameEl.textContent = name; nameEl.classList.add('show'); }, 200);
        }
      }
    }
    setInterval(update, 300);
    update();
  })();

  /* ── MOBILE MENU ── */
  const hamburger   = document.getElementById('hamburger');
  const mobileMenu  = document.getElementById('mobileMenu');

  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  function closeMobile() {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  /* ── NAV ACTIVE LINK ── */
  const secs  = document.querySelectorAll('section[id]');
  const links = document.querySelectorAll('.nav-links a');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        let cur = '';
        secs.forEach(s => { if (window.scrollY >= s.offsetTop - 130) cur = s.id; });
        links.forEach(a => {
          a.style.color = '';
          if (a.getAttribute('href') === '#' + cur) a.style.color = 'var(--red)';
        });
        ticking = false;
      });
      ticking = true;
    }
  });

  /* ── PANEL OPERACIONES ── */
  const opData = {
    agricola:   { label:'Equipo Agrícola',  srcs: [
      '/assets/imagenes_optimizadas/equipo_agricola/img1.jpeg.jpg',
      '/assets/imagenes_optimizadas/equipo_agricola/img2.jpeg.jpg',
      '/assets/imagenes_optimizadas/equipo_agricola/img3.jpeg.jpg'
    ]},
    industrial: { label:'Carga Industrial', srcs: [
      '/assets/imagenes_optimizadas/carga_industrial/img1.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_industrial/img2.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_industrial/WhatsApp%20Image%202026-04-06%20at%2021.46.58.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_industrial/WhatsApp%20Image%202026-04-06%20at%2021.59.28.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_industrial/WhatsApp%20Image%202026-04-19%20at%2020.29.57.jpeg.jpg'
    ]},
    maquinaria: { label:'Carga Maquinaria', srcs: [
      '/assets/imagenes_optimizadas/carga_maquinaria/img1.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_maquinaria/img3.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_maquinaria/img5.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_maquinaria/WhatsApp%20Image%202026-04-06%20at%2021.59.24.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_maquinaria/WhatsApp%20Image%202026-04-06%20at%2021.59.27.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_maquinaria/ChatGPT%20Image%2019%20abr%202026%2020_15_38.png.png'
    ]},
    cerrada:    { label:'Carga Cerrada',    srcs: [
      '/assets/imagenes_optimizadas/carga_cerrada/img1.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_cerrada/img2.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_cerrada/WhatsApp%20Image%202026-04-19%20at%2020.33.14.jpeg.jpg',
      '/assets/imagenes_optimizadas/carga_cerrada/WhatsApp%20Image%202026-04-28%20at%2018.52.46.jpeg.jpg'
    ]},
    mineria:    { label:'Minería',          srcs: [
      '/assets/imagenes_optimizadas/mineria/img2.jpeg.jpg',
      '/assets/imagenes_optimizadas/mineria/img6.jpeg.jpg',
      '/assets/imagenes_optimizadas/mineria/WhatsApp%20Image%202026-04-19%20at%2020.35.38.jpeg.jpg',
      '/assets/imagenes_optimizadas/mineria/ChatGPT%20Image%2019%20abr%202026%2020_19_31.png.png'
    ]}
  };

  let opCat = null, opIdx = 0;
  const opOverlay  = document.getElementById('opOverlay');
  const opImg      = document.getElementById('opImg');
  const opCounter  = document.getElementById('opCounter');
  const opCatTitle = document.getElementById('opCatTitle');
  const opDots     = document.getElementById('opDots');

  document.getElementById('opCloseBtn').addEventListener('click', () => {
    opOverlay.classList.remove('open');
    document.body.style.overflow = '';
  });

  function openOpPanel(cat, idx) {
    opCat = cat; opIdx = idx || 0;
    opCatTitle.textContent = opData[cat].label;
    opUpdate();
    opOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeOpPanel(e) {
    if (e && e.target !== opOverlay) return;
    opOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function opNav(dir) {
    const d = opData[opCat];
    opIdx = (opIdx + dir + d.srcs.length) % d.srcs.length;
    opUpdate();
  }

  function opUpdate() {
    const d = opData[opCat];
    opImg.src = d.srcs[opIdx];
    opImg.alt = d.label + ' ' + (opIdx + 1);
    opCounter.textContent = (opIdx + 1) + ' / ' + d.srcs.length;
    opDots.innerHTML = d.srcs.map((_, i) =>
      '<div class="op-dot' + (i === opIdx ? ' active' : '') + '" onclick="openOpPanel(\'' + opCat + '\',' + i + ')"></div>'
    ).join('');
  }

  document.addEventListener('keydown', e => {
    if (!opOverlay.classList.contains('open')) return;
    if (e.key === 'Escape')     { opOverlay.classList.remove('open'); document.body.style.overflow = ''; }
    if (e.key === 'ArrowRight') opNav(1);
    if (e.key === 'ArrowLeft')  opNav(-1);
  });

  /* ── FORM VALIDATION ── */
  const form    = document.getElementById('contactForm');
  const fsubmit = document.getElementById('fsubmit');

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }

  function setError(id, hasError) {
    const fg = document.getElementById('fg-' + id);
    if (!fg) return;
    fg.classList.toggle('has-error', hasError);
  }

  function validateForm() {
    let valid = true;

    const nombre   = document.getElementById('f-nombre').value.trim();
    const telefono = document.getElementById('f-telefono').value.trim();
    const correo   = document.getElementById('f-correo').value.trim();
    const servicio = document.getElementById('f-servicio').value;

    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const telRe   = /^[\d\s\+\-\(\)]{7,20}$/;

    if (!nombre || nombre.length < 2) { setError('nombre', true);   valid = false; } else setError('nombre', false);
    if (!telRe.test(telefono))         { setError('telefono', true); valid = false; } else setError('telefono', false);
    if (!emailRe.test(correo))         { setError('correo', true);   valid = false; } else setError('correo', false);
    if (!servicio)                     { setError('servicio', true); valid = false; } else setError('servicio', false);

    return valid;
  }

  const FORM_IDLE_NOTE = 'Te responderemos a la brevedad. También recibirás una copia de tu solicitud por correo.';

  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (!validateForm()) return;

    const status = document.getElementById('formStatus');

    fsubmit.disabled    = true;
    fsubmit.textContent = 'Enviando...';
    if (status) status.textContent = 'Enviando tu solicitud…';

    const payload = {
      nombre:   document.getElementById('f-nombre').value.trim(),
      empresa:  document.getElementById('f-empresa').value.trim(),
      telefono: document.getElementById('f-telefono').value.trim(),
      correo:   document.getElementById('f-correo').value.trim(),
      servicio: document.getElementById('f-servicio').value,
      detalle:  document.getElementById('f-detalle').value.trim(),
      website:  (document.getElementById('f-website') || {}).value || ''
    };

    function restore(label) {
      fsubmit.textContent      = label;
      fsubmit.style.background = '';
      fsubmit.style.clipPath   = '';
      fsubmit.disabled         = false;
    }

    try {
      const res  = await fetch('/api/cotizacion', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.ok) {
        /* El servidor valida de nuevo: si algo no pasa, marcamos esos campos */
        if (Array.isArray(data.campos)) data.campos.forEach(id => setError(id, true));
        throw new Error(data.error || 'envio');
      }

      fsubmit.textContent       = '✓ Solicitud enviada';
      fsubmit.style.background  = '#1a6b2e';
      fsubmit.style.clipPath    = 'none';
      if (status) status.textContent = 'Recibimos tu solicitud. Te enviamos una confirmación a ' + payload.correo + '.';

      form.reset();
      ['nombre','telefono','correo','servicio'].forEach(id => setError(id, false));

      setTimeout(() => {
        restore('Enviar Solicitud →');
        if (status) status.textContent = FORM_IDLE_NOTE;
      }, 6000);
    } catch (err) {
      restore('Reintentar envío →');
      if (status) {
        status.textContent = 'No pudimos enviar tu solicitud. Vuelve a intentarlo o escríbenos a ' +
                             'tsasesoriaspublicas@outlook.com / +56 9 91617552.';
      }
    }
  });

  /* ── SCROLL REVEAL ── */
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity   = '1';
        e.target.style.transform = 'translateY(0)';
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07 });

  document.querySelectorAll('.scard,.spec,.citem,.ci,.mitem').forEach(el => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease';
    revealObs.observe(el);
  });

  /* ── CONTADOR ANIMADO DE ESTADÍSTICAS ──
     Al entrar en pantalla, los números suben desde 0 hasta su valor
     y quedan estáticos. Conserva prefijos/sufijos (+, t, $, etc.) y
     los separadores de miles. Respeta prefers-reduced-motion. */
  (function () {
    const nums = document.querySelectorAll('.hero-stats .stat-num, .ruta-stat-item .rn');
    if (!nums.length) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return; // dejar los valores finales tal cual, sin animación

    function animateCount(el) {
      const raw = el.textContent.trim();
      // prefijo (no dígitos) + número (con puntos de miles) + sufijo
      const m = raw.match(/^(\D*?)([\d.]*\d)(\D*)$/);
      if (!m) return;                       // sin dígitos (ej. "GPS") → no anima
      const prefix = m[1], suffix = m[3];
      const hasThousands = m[2].includes('.');
      const target = parseInt(m[2].replace(/\./g, ''), 10);
      if (isNaN(target)) return;

      const fmt = n => hasThousands ? n.toLocaleString('es-CL') : String(n);
      const dur = 1600;
      const start = performance.now();

      function step(now) {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
        el.textContent = prefix + fmt(Math.round(target * eased)) + suffix;
        if (p < 1) requestAnimationFrame(step);
        else el.textContent = prefix + fmt(target) + suffix; // valor final exacto
      }
      requestAnimationFrame(step);
    }

    const countObs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          animateCount(e.target);
          countObs.unobserve(e.target);
        }
      });
    }, { threshold: 0.5 });

    nums.forEach(el => countObs.observe(el));
  })();

  /* ── MAPA INTERACTIVO COBERTURA ── */
  (function(){
    const mapa    = document.getElementById('chileMap');
    const tooltip = document.getElementById('mapaTooltip');
    const wrap    = document.querySelector('.mapa-wrap');
    const rotor   = document.getElementById('mapRotor');
    if (!mapa || !tooltip || !wrap || !rotor) return;

    /* Orientación: horizontal en desktop, vertical en móvil.
       Misma geometría real; solo rota el grupo y cambia el viewBox. */
    const horiz = window.matchMedia('(min-width:769px)');
    function orientMap() {
      if (horiz.matches) {
        mapa.setAttribute('viewBox', '-14 -382 2014 360');
        rotor.setAttribute('transform', 'rotate(-90)');
      } else {
        mapa.setAttribute('viewBox', '22 -14 360 2014');
        rotor.removeAttribute('transform');
      }
    }
    horiz.addEventListener('change', orientMap);
    orientMap();

    let regionActiva = null;

    function setRegion(r) {
      if (regionActiva) regionActiva.classList.remove('active');
      regionActiva = r || null;
      if (regionActiva) {
        regionActiva.classList.add('active');
        tooltip.textContent = regionActiva.dataset.name;
        const rb = regionActiva.getBoundingClientRect();
        const wb = wrap.getBoundingClientRect();
        tooltip.classList.add('on');
        const tw = tooltip.offsetWidth, th = tooltip.offsetHeight;
        let left = rb.left - wb.left + rb.width / 2 - tw / 2;
        let top  = rb.top  - wb.top  - th - 10;
        left = Math.max(0, Math.min(left, wb.width - tw));
        if (top < -th) top = rb.bottom - wb.top + 10;
        tooltip.style.left = left + 'px';
        tooltip.style.top  = top + 'px';
      } else {
        tooltip.classList.remove('on');
      }
    }

    /* Hover (desktop) y tap (móvil) */
    mapa.addEventListener('pointerover', e => {
      const r = e.target.closest('.region');
      if (r) setRegion(r);
    });
    /* Solo el mouse limpia al salir; en touch la selección persiste */
    mapa.addEventListener('pointerleave', e => {
      if (e.pointerType === 'mouse') setRegion(null);
    });
    mapa.addEventListener('click', e => {
      const r = e.target.closest('.region');
      if (r) setRegion(r);
    });
    /* Navegación por teclado (focus en captura: focusin no siempre se
       propaga desde paths SVG) */
    mapa.addEventListener('focus', e => {
      const r = e.target.closest ? e.target.closest('.region') : null;
      if (r) setRegion(r);
    }, true);
    mapa.addEventListener('blur', () => setRegion(null), true);
    mapa.addEventListener('keydown', e => {
      if ((e.key === 'Enter' || e.key === ' ') && e.target.classList && e.target.classList.contains('region')) {
        e.preventDefault();
        setRegion(e.target);
      }
    });
  })();
