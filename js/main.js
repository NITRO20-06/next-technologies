/**
 * NEXT TECHNOLOGIES — Main JavaScript
 * GSAP scroll animations & UI interactions (sin loader)
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const lowPowerDevice =
    isTouchDevice
    || window.innerWidth < 769
    || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);

  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav__link, .nav__cta');
  const backTop = document.getElementById('backTop');
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

    const onScrollHeader = () => header?.classList.toggle('scrolled', window.scrollY > 40);
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

  function initHeroAnimation() {
    if (typeof gsap === 'undefined') return;
    if (prefersReducedMotion) {
      gsap.set('[data-hero]', { opacity: 1, y: 0 });
      return;
    }

    gsap.timeline({ defaults: { ease: 'power3.out' } })
      .from('[data-hero="brand"]', { opacity: 0, y: 28, duration: 0.7 })
      .from('[data-hero="title"]', { opacity: 0, y: 40, duration: 0.85 }, '-=0.4')
      .from('[data-hero="subtitle"]', { opacity: 0, y: 28, duration: 0.65 }, '-=0.45')
      .from('[data-hero="actions"] .btn', { opacity: 0, y: 20, stagger: 0.12, duration: 0.55 }, '-=0.35')
      .from('[data-hero="photo"]', { opacity: 0, y: 28, scale: 0.98, duration: 0.8 }, '-=0.7');
  }

  function initScrollAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    if (prefersReducedMotion) {
      gsap.set('[data-animate]', { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    gsap.utils.toArray('[data-animate="header"]').forEach((el) => {
      gsap.from(el.children, {
        opacity: 0,
        y: 32,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('[data-animate="card"]').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.65,
        delay: (i % 4) * 0.04,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });

    document.querySelectorAll('[data-animate="image"]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 36,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 82%', toggleActions: 'play none none reverse' },
      });
    });

    gsap.utils.toArray('[data-animate="gallery"]').forEach((item, i) => {
      gsap.from(item, {
        opacity: 0,
        y: 30,
        duration: 0.6,
        delay: (i % 3) * 0.06,
        ease: 'power3.out',
        scrollTrigger: { trigger: item, start: 'top 90%', toggleActions: 'play none none reverse' },
      });
    });

    document.querySelectorAll('[data-animate="form"], [data-animate="map"]').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 36,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none reverse' },
      });
    });
  }

  function initCounters() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    document.querySelectorAll('[data-count]').forEach((el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = String(target);
        return;
      }

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none reverse',
        },
        onUpdate: () => {
          el.textContent = String(Math.round(obj.val));
        },
      });
    });
  }

  function initTestimonialsSlider() {
    const track = document.getElementById('testimonialsTrack');
    const dotsWrap = document.getElementById('testimonialsDots');
    if (!track || !dotsWrap) return;

    const cards = Array.from(track.children);
    if (!cards.length) return;

    let slidesPerView = window.innerWidth > 900 ? 2 : 1;
    let current = 0;
    let timer = null;

    function maxIndex() {
      return Math.max(0, cards.length - slidesPerView);
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex()));
      const gap = 18;
      const cardWidth = cards[0].getBoundingClientRect().width;
      track.style.transform = `translateX(-${current * (cardWidth + gap)}px)`;
      dotsWrap.querySelectorAll('.testimonials__dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }

    function buildDots() {
      dotsWrap.replaceChildren();
      const count = maxIndex() + 1;
      for (let i = 0; i < count; i += 1) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `testimonials__dot${i === current ? ' active' : ''}`;
        btn.setAttribute('aria-label', `Ir al testimonio ${i + 1}`);
        btn.addEventListener('click', () => {
          goTo(i);
          stopAutoplay();
          startAutoplay();
        });
        dotsWrap.appendChild(btn);
      }
    }

    function next() {
      goTo(current >= maxIndex() ? 0 : current + 1);
    }

    function startAutoplay() {
      if (prefersReducedMotion || cards.length <= slidesPerView) return;
      stopAutoplay();
      timer = setInterval(next, 5000);
    }

    function stopAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
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

    startAutoplay();
  }

  function initWhatsAppFloat() {
    const wa = document.getElementById('whatsappFloat');
    if (!wa || typeof gsap === 'undefined') return;

    if (!prefersReducedMotion) {
      gsap.fromTo(
        wa,
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, delay: 0.8, ease: 'power3.out' }
      );
    }
  }

  function initGsapFeatures() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true });

    if (lowPowerDevice || prefersReducedMotion) {
      document.documentElement.classList.add('perf-lite');
    }

    initHeroAnimation();
    initScrollAnimations();
    initCounters();
    initTestimonialsSlider();
    initWhatsAppFloat();

    window.addEventListener('load', () => ScrollTrigger.refresh());
    window.addEventListener('resize', debounce(() => ScrollTrigger.refresh(), 250));
  }

  function init() {
    initScrollOnReload();
    initEssentials();

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('GSAP no se cargó. El sitio funciona en modo básico.');
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
