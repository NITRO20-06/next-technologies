<?php require_once __DIR__ . '/includes/bootstrap.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="NEXT TECHNOLOGIES — Soporte técnico especializado en computadoras, laptops e impresoras en Jaén, Perú.">
  <meta name="theme-color" content="#071018">
  <title>NEXT TECHNOLOGIES | Soporte Técnico en Jaén, Perú</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&family=Syne:wght@600;700;800&display=swap" rel="stylesheet">
  <link rel="icon" href="images/logo-next.png" type="image/png">
  <link rel="stylesheet" href="css/vendor/phosphor/phosphor-regular.css?v=<?= asset_version('css/vendor/phosphor/phosphor-regular.css') ?>">
  <link rel="stylesheet" href="css/app.min.css?v=<?= asset_version('css/app.min.css') ?>">
  <script type="importmap">
  {
    "imports": {
      "three": "https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.js",
      "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/"
    }
  }
  </script>
  <script>
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    (function () {
      var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
      if (nav && nav.type === 'reload') {
        window.scrollTo(0, 0);
        if (location.hash) history.replaceState(null, '', location.pathname + location.search);
      }
    })();
  </script>
</head>
<body>
  <header class="header" id="header">
    <nav class="nav container" aria-label="Navegación principal">
      <a href="#inicio" class="nav__logo" aria-label="NEXT TECHNOLOGIES - Inicio">
        <img
          class="brand-logo brand-logo--nav"
          src="images/logo-next.png?v=<?= asset_version('images/logo-next.png') ?>"
          alt=""
          width="200"
          height="44"
          decoding="async"
        >
      </a>
      <button class="nav__toggle" id="navToggle" aria-label="Abrir menú" aria-expanded="false">
        <i class="ph ph-list"></i>
      </button>
      <ul class="nav__menu" id="navMenu">
        <li><a href="#inicio" class="nav__link active">Inicio</a></li>
        <li><a href="#servicios" class="nav__link">Servicios</a></li>
        <li><a href="#nosotros" class="nav__link">Nosotros</a></li>
        <li><a href="#galeria" class="nav__link">Galería</a></li>
        <li><a href="#testimonios" class="nav__link">Testimonios</a></li>
        <li><a href="#contacto" class="nav__link">Contacto</a></li>
        <li><a href="#contacto" class="btn btn--primary btn--sm nav__cta">Solicitar soporte</a></li>
      </ul>
    </nav>
  </header>

  <main id="main">
    <section class="hero" id="inicio">
      <div class="hero__blinds gradient-blinds-container" id="heroBlinds" aria-hidden="true"></div>
      <div class="hero__atmosphere" aria-hidden="true"></div>
      <div class="container hero__layout">
        <div class="hero__content">
          <p class="hero__brand" data-hero="brand">NEXT TECHNOLOGIES</p>
          <h1 class="hero__title" data-hero="title">
            Soporte técnico que mantiene tu negocio en marcha
          </h1>
          <p class="hero__subtitle" data-hero="subtitle">
            Computadoras, laptops e impresoras en Jaén, Perú — diagnóstico preciso y respuesta rápida.
          </p>
          <div class="hero__actions" data-hero="actions">
            <a href="#contacto" class="btn btn--primary">
              <i class="ph ph-headset"></i> Solicitar servicio
            </a>
            <a href="#servicios" class="btn btn--ghost">
              Ver servicios
            </a>
          </div>
        </div>
        <div class="hero__viewer hero__viewer--pc" data-hero="photo">
          <canvas id="pcAssembly" class="hero__pc-canvas" aria-label="Animación 3D de PC armándose"></canvas>
          <p class="hero__pc-label" id="pcAssemblyLabel">Iniciando ensamblaje…</p>
        </div>
      </div>
    </section>

    <section class="services section" id="servicios">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Servicios</span>
          <h2 class="section__title">Soluciones técnicas para cada equipo</h2>
          <p class="section__desc">Mantenimiento, reparación y configuración con garantía y seguimiento.</p>
        </header>
        <div class="services__grid">
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-desktop-tower"></i></div>
            <h3>Mantenimiento de computadoras</h3>
            <p>Limpieza, actualización y optimización para prolongar la vida útil de tu PC.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-laptop"></i></div>
            <h3>Reparación de laptops</h3>
            <p>Diagnóstico y reparación de pantallas, teclados, baterías y componentes internos.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-headset"></i></div>
            <h3>Soporte técnico especializado</h3>
            <p>Asistencia remota y presencial con técnicos capacitados y experimentados.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-package"></i></div>
            <h3>Instalación de software</h3>
            <p>Instalación, configuración y licenciamiento de programas y sistemas operativos.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-broom"></i></div>
            <h3>Limpieza y optimización</h3>
            <p>Eliminación de polvo, malware y archivos innecesarios para mejorar el rendimiento.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-printer"></i></div>
            <h3>Reparación de impresoras</h3>
            <p>Mantenimiento, cambio de consumibles y reparación de impresoras láser e inkjet.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-circuitry"></i></div>
            <h3>Diagnóstico de hardware</h3>
            <p>Detección precisa de fallas en componentes con herramientas profesionales.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-wifi-high"></i></div>
            <h3>Configuración de redes</h3>
            <p>Instalación y configuración de routers, switches y redes empresariales.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="process section" id="proceso">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Cómo trabajamos</span>
          <h2 class="section__title">Un proceso claro, sin sorpresas</h2>
          <p class="section__desc">Desde el primer contacto hasta la entrega, con comunicación constante.</p>
        </header>
        <ol class="process__list">
          <li class="process__step" data-animate="card">
            <span class="process__num">01</span>
            <h3>Diagnóstico</h3>
            <p>Evaluamos el equipo y te explicamos el problema con claridad.</p>
          </li>
          <li class="process__step" data-animate="card">
            <span class="process__num">02</span>
            <h3>Cotización</h3>
            <p>Presupuesto transparente antes de iniciar cualquier trabajo.</p>
          </li>
          <li class="process__step" data-animate="card">
            <span class="process__num">03</span>
            <h3>Reparación</h3>
            <p>Intervención técnica con piezas y procedimientos adecuados.</p>
          </li>
          <li class="process__step" data-animate="card">
            <span class="process__num">04</span>
            <h3>Entrega</h3>
            <p>Pruebas finales, garantía por escrito y seguimiento post-servicio.</p>
          </li>
        </ol>
      </div>
    </section>

    <section class="why section" id="nosotros">
      <div class="container why__grid">
        <div class="why__copy" data-animate="header">
          <span class="section__tag">Nosotros</span>
          <h2 class="section__title">Tu aliado tecnológico en Jaén</h2>
          <p class="section__desc">Combinamos experiencia, rapidez y precios justos para ofrecerte un servicio técnico confiable.</p>
          <ul class="why__points">
            <li><i class="ph ph-lightning"></i> Atención rápida sin sacrificar calidad</li>
            <li><i class="ph ph-user-gear"></i> Personal especializado y actualizado</li>
            <li><i class="ph ph-shield-check"></i> Garantía de servicio por escrito</li>
            <li><i class="ph ph-handshake"></i> Más de 5 años en la comunidad</li>
          </ul>
        </div>
        <div class="why__visual" data-animate="image">
          <img
            src="images/equipo-next.png"
            alt="Personal especializado de NEXT TECHNOLOGIES"
            width="640"
            height="520"
            loading="lazy"
          >
        </div>
      </div>
    </section>

    <section class="stats section" id="estadisticas">
      <div class="container">
        <div class="stats__grid">
          <div class="stat-item" data-animate="stat">
            <div class="stat-item__row">
              <span class="stat-item__number" data-count="500">0</span>
              <span class="stat-item__suffix">+</span>
            </div>
            <p class="stat-item__label">Equipos reparados</p>
          </div>
          <div class="stat-item" data-animate="stat">
            <div class="stat-item__row">
              <span class="stat-item__number" data-count="300">0</span>
              <span class="stat-item__suffix">+</span>
            </div>
            <p class="stat-item__label">Clientes satisfechos</p>
          </div>
          <div class="stat-item" data-animate="stat">
            <div class="stat-item__row">
              <span class="stat-item__number" data-count="5">0</span>
              <span class="stat-item__suffix">+</span>
            </div>
            <p class="stat-item__label">Años de experiencia</p>
          </div>
          <div class="stat-item" data-animate="stat">
            <div class="stat-item__row">
              <span class="stat-item__number" data-count="1000">0</span>
              <span class="stat-item__suffix">+</span>
            </div>
            <p class="stat-item__label">Servicios realizados</p>
          </div>
        </div>
      </div>
    </section>

    <section class="gallery section" id="galeria">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Galería</span>
          <h2 class="section__title">Nuestro trabajo en el taller</h2>
          <p class="section__desc">Algunos de los servicios que realizamos día a día para nuestros clientes.</p>
        </header>
        <div class="gallery__grid">
          <figure class="gallery__item gallery__item--large" data-animate="gallery">
            <img src="images/equipo-next.png" alt="Equipo y local de NEXT TECHNOLOGIES en Jaén" loading="lazy">
            <figcaption>Nuestro equipo en Jaén</figcaption>
          </figure>
          <figure class="gallery__item" data-animate="gallery">
            <img src="images/mantenimiento-pcs.png" alt="Mantenimiento de PCs" loading="lazy">
            <figcaption>Mantenimiento de PCs</figcaption>
          </figure>
          <figure class="gallery__item" data-animate="gallery">
            <img src="images/mantenimiento-impresoras.png" alt="Mantenimiento de impresoras" loading="lazy">
            <figcaption>Impresoras</figcaption>
          </figure>
          <figure class="gallery__item" data-animate="gallery">
            <img src="images/mantenimiento-laptops.png" alt="Mantenimiento de laptops" loading="lazy">
            <figcaption>Mantenimiento de laptops</figcaption>
          </figure>
          <figure class="gallery__item gallery__item--wide" data-animate="gallery">
            <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80" alt="Centro de datos y redes" loading="lazy">
            <figcaption>Configuración de redes</figcaption>
          </figure>
        </div>
      </div>
    </section>

    <section class="testimonials section" id="testimonios">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Testimonios</span>
          <h2 class="section__title">Lo que dicen nuestros clientes</h2>
        </header>
        <div class="testimonials__slider" id="testimonialsSlider">
          <div class="testimonials__track" id="testimonialsTrack">
            <article class="testimonial-card">
              <div class="testimonial-card__stars" aria-label="5 estrellas">
                <i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i>
              </div>
              <blockquote>
                <p>“Repararon mi laptop en menos de 24 horas. Excelente servicio y precios muy justos.”</p>
              </blockquote>
              <footer class="testimonial-card__author">
                <div class="testimonial-card__avatar">MR</div>
                <div>
                  <strong>María Rodríguez</strong>
                  <span>Empresaria — Jaén</span>
                </div>
              </footer>
            </article>
            <article class="testimonial-card">
              <div class="testimonial-card__stars" aria-label="5 estrellas">
                <i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i>
              </div>
              <blockquote>
                <p>“Llevamos 2 años con NEXT TECHNOLOGIES para el mantenimiento de nuestras oficinas. Siempre puntuales.”</p>
              </blockquote>
              <footer class="testimonial-card__author">
                <div class="testimonial-card__avatar">CL</div>
                <div>
                  <strong>Carlos López</strong>
                  <span>Gerente — Distribuidora Norte</span>
                </div>
              </footer>
            </article>
            <article class="testimonial-card">
              <div class="testimonial-card__stars" aria-label="5 estrellas">
                <i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i>
              </div>
              <blockquote>
                <p>“Configuraron toda la red de mi negocio y dejaron todo funcionando perfecto.”</p>
              </blockquote>
              <footer class="testimonial-card__author">
                <div class="testimonial-card__avatar">JV</div>
                <div>
                  <strong>Jorge Vásquez</strong>
                  <span>Dueño de cafetería</span>
                </div>
              </footer>
            </article>
            <article class="testimonial-card">
              <div class="testimonial-card__stars" aria-label="5 estrellas">
                <i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i>
              </div>
              <blockquote>
                <p>“Mi impresora dejó de funcionar y la repararon el mismo día. Personal amable y conocedor.”</p>
              </blockquote>
              <footer class="testimonial-card__author">
                <div class="testimonial-card__avatar">AP</div>
                <div>
                  <strong>Ana Paredes</strong>
                  <span>Contadora independiente</span>
                </div>
              </footer>
            </article>
          </div>
          <div class="testimonials__dots" id="testimonialsDots" role="tablist" aria-label="Testimonios"></div>
        </div>
      </div>
    </section>

    <section class="contact section" id="contacto">
      <div class="container">
        <div class="contact__layout">
          <header class="contact__intro" data-animate="header">
            <span class="section__tag">Contacto</span>
            <h2 class="section__title">¿Necesitas ayuda técnica?</h2>
            <p class="section__desc">Escríbenos y un técnico se comunicará contigo a la brevedad.</p>
            <ul class="contact__info">
              <li>
                <i class="ph ph-map-pin"></i>
                <div>
                  <strong>Dirección</strong>
                  <a href="<?= htmlspecialchars(MAPS_LINK, ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener noreferrer"><?= htmlspecialchars(ADDRESS, ENT_QUOTES, 'UTF-8') ?></a>
                </div>
              </li>
              <li>
                <i class="ph ph-whatsapp-logo"></i>
                <div>
                  <strong>WhatsApp</strong>
                  <a href="<?= htmlspecialchars($waUrl, ENT_QUOTES, 'UTF-8') ?>" target="_blank" rel="noopener noreferrer"><?= htmlspecialchars(WHATSAPP_DISPLAY, ENT_QUOTES, 'UTF-8') ?></a>
                </div>
              </li>
              <li>
                <i class="ph ph-envelope"></i>
                <div>
                  <strong>Correo</strong>
                  <a href="mailto:<?= htmlspecialchars(CONTACT_EMAIL, ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars(CONTACT_EMAIL, ENT_QUOTES, 'UTF-8') ?></a>
                </div>
              </li>
            </ul>
            <div class="contact__social">
              <a href="<?= htmlspecialchars(FACEBOOK_URL, ENT_QUOTES, 'UTF-8') ?>" aria-label="Facebook" class="social-link" target="_blank" rel="noopener noreferrer"><i class="ph ph-facebook-logo"></i></a>
              <a href="<?= htmlspecialchars(INSTAGRAM_URL, ENT_QUOTES, 'UTF-8') ?>" aria-label="Instagram" class="social-link" target="_blank" rel="noopener noreferrer"><i class="ph ph-instagram-logo"></i></a>
              <a href="<?= htmlspecialchars($waUrl, ENT_QUOTES, 'UTF-8') ?>" aria-label="WhatsApp" class="social-link" target="_blank" rel="noopener noreferrer"><i class="ph ph-whatsapp-logo"></i></a>
            </div>
          </header>
          <form class="contact__form" id="contactForm" action="contacto.php" method="post" data-animate="form">
            <input type="hidden" name="csrf_token" value="<?= htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8') ?>">
            <div class="form-honeypot" aria-hidden="true">
              <label for="website">Sitio web</label>
              <input type="text" id="website" name="website" tabindex="-1" autocomplete="off" value="">
            </div>
            <?php if ($contactError): ?>
              <p class="form-error" id="contactFormError" role="alert"><?= htmlspecialchars($contactErrorMsg, ENT_QUOTES, 'UTF-8') ?></p>
            <?php endif; ?>
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" required autocomplete="name">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="correo">Correo</label>
                <input type="email" id="correo" name="correo" required autocomplete="email">
              </div>
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" required autocomplete="tel">
              </div>
            </div>
            <div class="form-group">
              <label for="mensaje">Mensaje</label>
              <textarea id="mensaje" name="mensaje" rows="4" required minlength="5" placeholder="Describe tu problema o consulta"></textarea>
            </div>
            <button type="submit" class="btn btn--primary btn--full">
              <i class="ph ph-paper-plane-tilt"></i> Enviar mensaje
            </button>
            <p class="form-success" id="formSuccess" hidden>Redirigiendo a WhatsApp...</p>
          </form>
        </div>

        <div class="contact__map" data-animate="map">
          <div class="contact__map-header">
            <div>
              <span class="section__tag">Ubicación</span>
              <h3 class="contact__map-title">Visítanos en Jaén</h3>
              <p class="contact__map-address">
                <i class="ph ph-map-pin"></i>
                <?= htmlspecialchars(ADDRESS, ENT_QUOTES, 'UTF-8') ?>
              </p>
            </div>
            <a
              href="<?= htmlspecialchars(MAPS_LINK, ENT_QUOTES, 'UTF-8') ?>"
              class="btn btn--ghost btn--sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="ph ph-navigation-arrow"></i> Abrir en Maps
            </a>
          </div>
          <div class="contact__map-frame">
            <iframe
              src="<?= htmlspecialchars(MAPS_EMBED, ENT_QUOTES, 'UTF-8') ?>"
              title="Mapa de ubicación de NEXT TECHNOLOGIES en Jaén, Perú"
              loading="lazy"
              referrerpolicy="no-referrer-when-downgrade"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  </main>

  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="#inicio" class="footer__logo">
          <img
            class="brand-logo brand-logo--footer"
            src="images/logo-next.png?v=<?= asset_version('images/logo-next.png') ?>"
            alt="NEXT TECHNOLOGIES"
            width="220"
            height="48"
            loading="lazy"
            decoding="async"
          >
        </a>
        <p>Soporte técnico especializado en Jaén, Perú. Tu tecnología en buenas manos.</p>
      </div>
      <nav class="footer__links" aria-label="Enlaces rápidos">
        <h4>Enlaces</h4>
        <ul>
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#nosotros">Nosotros</a></li>
          <li><a href="#galeria">Galería</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
      <div class="footer__services">
        <h4>Servicios</h4>
        <ul>
          <li>Reparación de laptops</li>
          <li>Mantenimiento de PCs</li>
          <li>Impresoras</li>
          <li>Redes</li>
        </ul>
      </div>
      <div class="footer__social-wrap">
        <h4>Síguenos</h4>
        <div class="footer__social">
          <a href="<?= htmlspecialchars(FACEBOOK_URL, ENT_QUOTES, 'UTF-8') ?>" aria-label="Facebook" target="_blank" rel="noopener noreferrer"><i class="ph ph-facebook-logo"></i></a>
          <a href="<?= htmlspecialchars(INSTAGRAM_URL, ENT_QUOTES, 'UTF-8') ?>" aria-label="Instagram" target="_blank" rel="noopener noreferrer"><i class="ph ph-instagram-logo"></i></a>
        </div>
      </div>
    </div>
    <div class="footer__bottom container">
      <p>&copy; <span id="year"></span> NEXT TECHNOLOGIES. Todos los derechos reservados.</p>
      <p>Jaén, Perú</p>
    </div>
  </footer>

  <a
    href="<?= htmlspecialchars($waFloatUrl, ENT_QUOTES, 'UTF-8') ?>"
    class="whatsapp-float"
    id="whatsappFloat"
    target="_blank"
    rel="noopener noreferrer"
    aria-label="Chatear por WhatsApp al <?= htmlspecialchars(WHATSAPP_DISPLAY, ENT_QUOTES, 'UTF-8') ?>"
  >
    <span class="whatsapp-float__icon" aria-hidden="true"><i class="ph ph-whatsapp-logo"></i></span>
    <span class="whatsapp-float__label">WhatsApp</span>
  </a>

  <button class="back-top" id="backTop" aria-label="Volver arriba" hidden>
    <i class="ph ph-arrow-up"></i>
  </button>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script type="module" src="js/vendor/gradient-blinds.js?v=<?= asset_version('js/vendor/gradient-blinds.js') ?>"></script>
  <script type="module" src="js/vendor/pc-assembly.js?v=<?= asset_version('js/vendor/pc-assembly.js') ?>"></script>
  <script src="js/vendor/splash-cursor.js?v=<?= asset_version('js/vendor/splash-cursor.js') ?>" defer></script>
  <script src="js/app.min.js?v=<?= asset_version('js/app.min.js') ?>"></script>
  <script>
    window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
    if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
      var s = document.createElement('script');
      s.defer = true;
      s.src = '/_vercel/insights/script.js';
      document.body.appendChild(s);
    }
  </script>
</body>
</html>
