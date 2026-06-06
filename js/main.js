/**
 * NEXT TECHNOLOGIES — Main JavaScript
 * GSAP animations, ScrollTrigger, UI interactions
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const lowPowerDevice =
    isTouchDevice
    || window.innerWidth < 769
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  const loader = document.getElementById('loader');
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link, .nav__cta');
  const backTop = document.getElementById('backTop');
  const cursor = document.getElementById('cursor');
  const contactForm = document.getElementById('contactForm');
  const formSuccess = document.getElementById('formSuccess');
  const yearEl = document.getElementById('year');

  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function debounce(fn, wait) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function hideLoader() {
    if (!loader) {
      document.body.classList.add('loaded');
      return;
    }
    loader.classList.add('hidden');
    loader.setAttribute('aria-hidden', 'true');
    document.body.classList.add('loaded');
  }

  /* ─── Al recargar (F5): volver al inicio ─── */
  function initScrollOnReload() {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    function goToTop() {
      window.scrollTo(0, 0);
      if (window.location.hash) {
        history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      setActiveNav('inicio');
    }

    if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
      goToTop();
    }

    window.addEventListener('pageshow', () => {
      if (performance.getEntriesByType('navigation')[0]?.type === 'reload') {
        goToTop();
      }
    });
  }

  function setActiveNav(id) {
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
    });
  }

  /* ─── Funciones básicas (sin GSAP) ─── */
  function initEssentials() {
    const closeNavMenu = () => {
      navMenu?.classList.remove('open');
      document.body.classList.remove('menu-open');
      navToggle?.setAttribute('aria-expanded', 'false');
      if (navToggle) navToggle.querySelector('i').className = 'ph ph-list';
    };

    navToggle?.addEventListener('click', () => {
      const open = navMenu.classList.toggle('open');
      document.body.classList.toggle('menu-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.querySelector('i').className = open ? 'ph ph-x' : 'ph ph-list';
    });

    navLinks.forEach((link) => link.addEventListener('click', closeNavMenu));

    const onScrollHeader = () => header?.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScrollHeader, { passive: true });
    onScrollHeader();

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveNav(entry.target.id);
          });
        },
        { rootMargin: '-45% 0px -45% 0px', threshold: 0 }
      );
      document.querySelectorAll('section[id]').forEach((section) => io.observe(section));
    }

    const toggleBackTop = () => {
      const show = window.scrollY > 400;
      backTop?.classList.toggle('visible', show);
      if (backTop) backTop.hidden = !show;
    };
    window.addEventListener('scroll', toggleBackTop, { passive: true });
    toggleBackTop();

    backTop?.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });

    contactForm?.addEventListener('submit', () => {
      const btn = contactForm.querySelector('button[type="submit"]');
      if (!contactForm.checkValidity()) return;
      btn.disabled = true;
      const icon = document.createElement('i');
      icon.className = 'ph ph-circle-notch';
      btn.replaceChildren(icon, document.createTextNode(' Enviando...'));
      if (formSuccess) {
        formSuccess.hidden = false;
        formSuccess.textContent = 'Redirigiendo a WhatsApp...';
      }
    });

    const csrfField = document.getElementById('csrfTokenField')
      || contactForm?.querySelector('input[name="csrf_token"]');
    if (csrfField && !csrfField.value) {
      fetch('/api/csrf', { credentials: 'same-origin' })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.token) csrfField.value = data.token;
        })
        .catch(() => {});
    }

    const contactErrors = {
      sesion: 'La sesión expiró. Recarga la página (F5) e intenta de nuevo.',
      datos: 'Revisa los datos: correo válido, teléfono con al menos 7 dígitos y mensaje de al menos 5 caracteres.',
      limite: 'Has enviado demasiados mensajes. Espera un momento e inténtalo de nuevo.',
    };
    const params = new URLSearchParams(window.location.search);
    const contactStatus = params.get('contacto');
    if (contactStatus === 'error') {
      const motivo = params.get('motivo') || '';
      const errorEl = document.getElementById('contactFormError');
      if (errorEl) {
        errorEl.textContent = contactErrors[motivo] || 'No se pudo enviar el mensaje. Intenta de nuevo.';
        errorEl.hidden = false;
      }
      document.getElementById('contacto')?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      if (window.history.replaceState) {
        history.replaceState(null, '', `${window.location.pathname}#contacto`);
      }
    } else if (contactStatus === 'ok' && formSuccess) {
      formSuccess.hidden = false;
      formSuccess.textContent = 'Mensaje enviado. Te redirigimos a WhatsApp.';
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const id = anchor.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - (header?.offsetHeight || 72);
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    });
  }

  /* ─── Loader transformación sci-fi ─── */
  const LOADER_LABELS = [
    { at: 0, text: 'Iniciando secuencia' },
    { at: 35, text: 'Sincronizando núcleo' },
    { at: 70, text: 'NEXT TECHNOLOGIES' },
    { at: 94, text: 'Activación completa' },
  ];

  const SPARK_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

  function initLoader(onHeroReady) {
    if (!loader) {
      onHeroReady?.();
      return;
    }

    const progress = loader.querySelector('.loader__progress');
    const progressBar = document.getElementById('loaderProgress');
    const labelEl = document.getElementById('loaderLabel');

    const failsafe = setTimeout(() => {
      if (loader && !loader.classList.contains('hidden')) {
        hideLoader();
        onHeroReady?.();
      }
    }, 9000);

    const finishLoader = () => {
      clearTimeout(failsafe);
      if (prefersReducedMotion) {
        hideLoader();
        onHeroReady?.();
        return;
      }

      const exitTl = gsap.timeline({
        onComplete: () => {
          hideLoader();
          loader.classList.remove('loader--exit');
          gsap.set(['.loader__inner', '.loader__plate', '.loader__logo', '.loader__hex', '.loader__sparks span'], { clearProps: 'all' });
          onHeroReady?.();
        },
      });

      loader.classList.add('loader--exit');
      exitTl
        .to('.loader__flash', { opacity: 0.7, duration: 0.12, ease: 'power2.out' }, 0)
        .to('.loader__plate', {
          opacity: 0,
          scale: 1.4,
          stagger: 0.04,
          duration: 0.5,
          ease: 'power3.in',
        }, 0.02)
        .to('.loader__logo', { opacity: 0, scale: 1.08, duration: 0.35, ease: 'power2.in' }, 0.08)
        .to('.loader__footer', { opacity: 0, duration: 0.28 }, 0.1)
        .to('.loader__hex, .loader__core', { opacity: 0, scale: 1.3, duration: 0.4 }, 0.1)
        .to('.loader__flash', { opacity: 0, duration: 0.45 }, 0.15)
        .to('.loader__bloom', { opacity: 0, duration: 0.4 }, 0.18)
        .to('.loader__veil, .loader__grid', { opacity: 0, duration: 0.35 }, 0.12)
        .to(loader, { opacity: 0, duration: 0.42, ease: 'power2.inOut' }, 0.3);
    };

    if (prefersReducedMotion) {
      if (progress) progress.style.width = '100%';
      if (progressBar) progressBar.setAttribute('aria-valuenow', '100');
      if (labelEl) labelEl.textContent = 'NEXT TECHNOLOGIES';
      setTimeout(finishLoader, 350);
      return;
    }

    const progressProxy = { value: 0 };
    const sparks = loader.querySelectorAll('.loader__sparks span');

    const updateLabel = (pct) => {
      if (!labelEl) return;
      const step = [...LOADER_LABELS].reverse().find((s) => pct >= s.at);
      if (step) labelEl.textContent = step.text;
    };

    const plateStarts = [
      { x: -280, y: -120, rotation: -45, scale: 0.3 },
      { x: 220, y: -180, rotation: 80, scale: 0.25 },
      { x: 260, y: 140, rotation: -70, scale: 0.25 },
      { x: -40, y: 200, rotation: 35, scale: 0.3 },
      { x: -240, y: 160, rotation: -90, scale: 0.25 },
      { x: -200, y: -160, rotation: 60, scale: 0.25 },
    ];

    plateStarts.forEach((start, i) => {
      gsap.set(`.loader__plate--${i + 1}`, { ...start, opacity: 0 });
    });

    sparks.forEach((spark, i) => {
      gsap.set(spark, { x: 0, y: 0, opacity: 0, scale: 0 });
    });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    tl.to('.loader__veil', { opacity: 1, duration: 0.5 }, 0)
      .to('.loader__grid', { opacity: 0.5, scale: 1, duration: 0.8 }, 0.06)
      .to('.loader__core', { opacity: 1, duration: 0.7 }, 0.15)
      .to('.loader__hex', { opacity: 0.9, rotation: 360, duration: 3, ease: 'none' }, 0.2)
      .to('.loader__footer', { opacity: 1, duration: 0.4 }, 0.25)
      .to('.loader__plate--1', { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: 'back.out(2)' }, 0.3)
      .to('.loader__plate--2', { opacity: 1, x: 0, y: 0, rotation: 60, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.38)
      .to('.loader__plate--3', { opacity: 1, x: 0, y: 0, rotation: -60, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.44)
      .to('.loader__plate--4', { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.55, ease: 'back.out(2)' }, 0.5)
      .to('.loader__plate--5', { opacity: 1, x: 0, y: 0, rotation: 60, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.56)
      .to('.loader__plate--6', { opacity: 1, x: 0, y: 0, rotation: -60, scale: 1, duration: 0.5, ease: 'back.out(2)' }, 0.62)
      .to('.loader__flare', { opacity: 1, scaleX: 1, duration: 0.35, ease: 'power4.out' }, 0.85)
      .to('.loader__flare', { opacity: 0, duration: 0.3 }, 1.2)
      .fromTo('.loader__scan',
        { top: '8%', opacity: 0 },
        { top: '92%', opacity: 1, duration: 0.7, ease: 'power2.inOut' },
        0.9
      )
      .to('.loader__scan', { opacity: 0, duration: 0.2 }, 1.6)
      .to(sparks, {
        opacity: 1,
        scale: 1,
        duration: 0.15,
        stagger: 0.03,
        onStart: () => {
          sparks.forEach((spark, i) => {
            const rad = (SPARK_ANGLES[i] * Math.PI) / 180;
            const dist = 80 + Math.random() * 40;
            gsap.to(spark, {
              x: Math.cos(rad) * dist,
              y: Math.sin(rad) * dist,
              opacity: 0,
              scale: 0.2,
              duration: 0.55,
              ease: 'power2.out',
            });
          });
        },
      }, 1.05)
      .to('.loader__bloom', { opacity: 0.35, duration: 0.15 }, 1.08)
      .to('.loader__flash', { opacity: 0.5, duration: 0.1 }, 1.1)
      .to('.loader__flash', { opacity: 0, duration: 0.4 }, 1.2)
      .to('.loader__chromatic', { opacity: 0.35, x: 2, duration: 0.08, yoyo: true, repeat: 1 }, 1.12)
      .to('.loader__logo', {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        filter: 'blur(0px) brightness(1)',
        duration: 0.85,
        ease: 'power4.out',
      }, 1.05)
      .to(progressProxy, {
        value: 100,
        duration: 2.4,
        ease: 'power1.inOut',
        onUpdate: () => {
          const pct = Math.round(progressProxy.value);
          if (progress) progress.style.width = `${pct}%`;
          if (progressBar) progressBar.setAttribute('aria-valuenow', String(pct));
          updateLabel(pct);
        },
      }, 0.35)
      .to('.brand-logo--loader', {
        filter: 'drop-shadow(0 0 32px rgba(0,229,255,0.55)) drop-shadow(0 0 14px rgba(255,140,0,0.35))',
        duration: 0.5,
      }, 1.5)
      .add(finishLoader, 3.1);
  }

  /* ─── Modo ligero (menos CPU y GPU) ─── */
  function initPerformance() {
    if (lowPowerDevice || prefersReducedMotion) {
      document.documentElement.classList.add('perf-lite');
    }

    const tuneAmbientFog = () => {
      const ambientFog = globalThis.__ambientFog;
      if (!ambientFog || !document.documentElement.classList.contains('perf-lite')) return;
      ambientFog.setConfig({
        speed: ambientFog.config.speed * 0.85,
        particleCount: ambientFog.config.lowPowerParticleCount,
        canvasOpacity: ambientFog.config.canvasOpacity * 0.9,
      });
    };

    tuneAmbientFog();
    if (!globalThis.__ambientFog) {
      requestAnimationFrame(tuneAmbientFog);
    }
  }

  /* ─── Custom cursor ─── */
  function initCursor() {
    if (prefersReducedMotion || isTouchDevice || !cursor) {
      document.body.classList.add('no-cursor');
      cursor?.remove();
      return;
    }

    const dot = cursor.querySelector('.cursor__dot');
    const ring = cursor.querySelector('.cursor__ring');
    let cursorFrame = null;
    let lastX = 0;
    let lastY = 0;

    document.addEventListener('mousemove', (e) => {
      lastX = e.clientX;
      lastY = e.clientY;
      if (cursorFrame) return;
      cursorFrame = requestAnimationFrame(() => {
        cursorFrame = null;
        gsap.to(dot, { x: lastX, y: lastY, duration: 0.08, ease: 'power2.out', overwrite: true });
        gsap.to(ring, { x: lastX, y: lastY, duration: 0.35, ease: 'power2.out', overwrite: true });
      });
    }, { passive: true });

    document.querySelectorAll(
      'a, button, .btn, .service-card, .gallery__item, .social-link, input, textarea'
    ).forEach((el) => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }

  /* ─── Hero animation ─── */
  function initHeroAnimation() {
    if (prefersReducedMotion) {
      gsap.set('[data-hero], .hero__caption', { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('[data-hero="badge"]', { opacity: 0, y: 36, scale: 0.92, duration: 0.65 })
      .from('[data-hero="title"]', { opacity: 0, y: 56, scale: 0.94, duration: 0.95 }, '-=0.35')
      .from('[data-hero="subtitle"]', { opacity: 0, y: 40, duration: 0.7 }, '-=0.5')
      .from('[data-hero="actions"] .btn', { opacity: 0, y: 30, stagger: 0.15, duration: 0.6 }, '-=0.4')
      .from('[data-hero="mini"] .hero__stat-item', { opacity: 0, x: -20, stagger: 0.1, duration: 0.5 }, '-=0.3')
      .from('[data-hero="visual"]', { opacity: 0, x: 80, scale: 0.95, duration: 1 }, '-=0.8')
      .from('.hero__caption', { opacity: 0, y: 20, duration: 0.5, ease: 'back.out(1.7)' }, '-=0.5');
  }

  /* ─── Parallax backgrounds ─── */
  function initParallax() {
    if (prefersReducedMotion || lowPowerDevice) return;

    document.querySelectorAll('[data-parallax]').forEach((el) => {
      const speed = parseFloat(el.dataset.parallax) || 0.3;
      gsap.to(el, {
        y: () => speed * 120,
        ease: 'none',
        scrollTrigger: {
          trigger: el.parentElement || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  /* ─── Scroll animations ─── */
  function initScrollAnimations() {
    if (prefersReducedMotion) {
      gsap.set('[data-animate]', { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.utils.toArray('[data-animate="header"]').forEach((el) => {
      gsap.from(el.children, {
        opacity: 0,
        y: 40,
        stagger: 0.12,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('[data-animate="card"]').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 60,
        scale: 0.95,
        duration: 0.7,
        delay: (i % 4) * 0.05,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('[data-animate="why"]').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        x: i % 2 === 0 ? -40 : 40,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });

    document.querySelectorAll('[data-animate="image"]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        scale: 0.9,
        x: 60,
        duration: 1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 80%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('[data-animate="gallery"]').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 50,
        scale: 0.92,
        duration: 0.8,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });

    document.querySelectorAll('[data-animate="form"]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        x: 50,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    });

    document.querySelectorAll('[data-animate="map"]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 50,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });
  }

  /* ─── Horizontal scroll section ─── */
  function initHorizontalScroll() {
    const section = document.querySelector('.horizontal');
    const track = document.getElementById('horizontalTrack');
    if (!section || !track || prefersReducedMotion) return;

    const mm = gsap.matchMedia();
    mm.add('(min-width: 1025px)', () => {
      const getScrollAmount = () => Math.max(0, track.scrollWidth - window.innerWidth + 80);

      gsap.to(track, {
        x: () => -getScrollAmount(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => `+=${getScrollAmount()}`,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });

      return () => {
        ScrollTrigger.getAll().forEach((st) => {
          if (st.trigger === section) st.kill();
        });
      };
    });
  }

  /* ─── Counter animation ─── */
  function initCounters() {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10);
      if (Number.isNaN(target)) return;

      if (prefersReducedMotion) {
        el.textContent = String(target);
        return;
      }

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 2.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el.closest('.stat-item'),
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.val));
        },
      });
    });

    gsap.utils.toArray('[data-animate="stat"]').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });
  }

  /* ─── Magnetic buttons ─── */
  function initMagneticButtons() {
    if (prefersReducedMotion || isTouchDevice) return;

    document.querySelectorAll('.btn--magnetic').forEach((btn) => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * 0.25, y: y * 0.25, duration: 0.3, ease: 'power2.out' });
      });
      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: 'power2.out', clearProps: 'transform' });
      });
    });
  }

  /* ─── Service card hover ─── */
  function initCardHover() {
    document.querySelectorAll('.service-card').forEach((card) => {
      const icon = card.querySelector('.service-card__icon');
      if (!icon) return;

      card.addEventListener('mouseenter', () => {
        if (prefersReducedMotion) return;
        gsap.to(icon, { scale: 1.15, rotation: 5, duration: 0.4, ease: 'back.out(1.7)' });
      });
      card.addEventListener('mouseleave', () => {
        gsap.to(icon, { scale: 1, rotation: 0, duration: 0.4, ease: 'power2.out' });
      });
    });
  }

  /* ─── Testimonials slider ─── */
  function initTestimonialsSlider() {
    const track = document.getElementById('testimonialsTrack');
    const dotsContainer = document.getElementById('testimonialsDots');
    if (!track || !dotsContainer) return;

    const cards = track.querySelectorAll('.testimonial-card');
    if (!cards.length) return;

    let current = 0;
    let interval;
    let slidesPerView = window.innerWidth > 900 ? 2 : 1;
    let dots = [];

    const getPageCount = () => Math.max(1, cards.length - slidesPerView + 1);

    function buildDots() {
      dotsContainer.replaceChildren();
      const pages = getPageCount();
      current = Math.min(current, pages - 1);

      for (let i = 0; i < pages; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `testimonials__dot${i === current ? ' active' : ''}`;
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', i === current ? 'true' : 'false');
        dot.setAttribute('aria-label', `Testimonio ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
      dots = dotsContainer.querySelectorAll('.testimonials__dot');
    }

    function goTo(index) {
      const pages = getPageCount();
      current = Math.max(0, Math.min(index, pages - 1));

      const card = cards[0];
      const gap = 24;
      const offset = (card.offsetWidth + gap) * current;

      if (typeof gsap !== 'undefined') {
        gsap.to(track, { x: -offset, duration: 0.6, ease: 'power3.inOut' });
      } else {
        track.style.transform = `translateX(-${offset}px)`;
      }

      dots.forEach((d, i) => {
        d.classList.toggle('active', i === current);
        d.setAttribute('aria-selected', i === current ? 'true' : 'false');
      });
    }

    function next() {
      const pages = getPageCount();
      current = current >= pages - 1 ? 0 : current + 1;
      goTo(current);
    }

    function startAutoplay() {
      clearInterval(interval);
      interval = setInterval(next, 5000);
    }

    function stopAutoplay() {
      clearInterval(interval);
    }

    buildDots();
    goTo(0);

    const slider = document.getElementById('testimonialsSlider');
    slider?.addEventListener('mouseenter', stopAutoplay);
    slider?.addEventListener('mouseleave', startAutoplay);

    window.addEventListener(
      'resize',
      debounce(() => {
        slidesPerView = window.innerWidth > 900 ? 2 : 1;
        buildDots();
        goTo(current);
        if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
      }, 200)
    );

    if (!prefersReducedMotion && typeof gsap !== 'undefined') {
      gsap.from('.testimonial-card', {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: { trigger: track, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    }

    startAutoplay();
  }

  /* ─── WhatsApp float ─── */
  function initWhatsAppFloat() {
    const wa = document.getElementById('whatsappFloat');
    if (!wa) return;

    gsap.set(wa, { opacity: 1, scale: 1, visibility: 'visible' });

    if (!prefersReducedMotion) {
      gsap.fromTo(
        wa,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, delay: 2, ease: 'back.out(1.7)' }
      );
    }
  }

  function initGsapFeatures() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true });

    initLoader(initHeroAnimation);
    initCursor();
    initParallax();
    initScrollAnimations();
    initHorizontalScroll();
    initCounters();
    initMagneticButtons();
    initCardHover();
    initTestimonialsSlider();
    initWhatsAppFloat();

    window.addEventListener('load', () => ScrollTrigger.refresh());
    window.addEventListener('resize', debounce(() => ScrollTrigger.refresh(), 250));
  }

  function init() {
    initScrollOnReload();
    initEssentials();
    initPerformance();

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP no se cargó. El sitio funciona en modo básico.');
      hideLoader();
      initTestimonialsSlider();
      return;
    }

    initGsapFeatures();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
