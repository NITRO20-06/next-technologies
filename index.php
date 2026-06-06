<?php require_once __DIR__ . '/includes/bootstrap.php'; ?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <meta name="description" content="NEXT TECHNOLOGIES — Soporte técnico especializado en computadoras, laptops e impresoras en Jaén, Perú.">
  <meta name="theme-color" content="#0a0e17">
  <title>NEXT TECHNOLOGIES | Soporte Técnico en Jaén, Perú</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/vendor/phosphor/phosphor-regular.css?v=<?= asset_version('css/vendor/phosphor/phosphor-regular.css') ?>">
  <link rel="stylesheet" href="css/app.min.css?v=<?= asset_version('css/app.min.css') ?>">
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
  <!-- Capa 2: Neblina ambiental global (detrás del contenido) -->
  <div
    class="ambient-fog"
    id="ambientFog"
    aria-hidden="true"
    data-fog-opacity="0.42"
    data-fog-blob-alpha="0.1"
    data-fog-speed="0.3"
    data-fog-density="14"
    data-fog-mode="mist"
  >
    <canvas class="ambient-fog__canvas" id="ambientFogCanvas"></canvas>
  </div>

  <!-- Loader — transformación estilo sci-fi mecánico -->
  <div class="loader loader--tf" id="loader" role="status" aria-live="polite" aria-label="Cargando sitio">
    <div class="loader__veil loader__veil--tf" aria-hidden="true"></div>
    <div class="loader__grid loader__grid--tf" aria-hidden="true"></div>
    <div class="loader__flare" aria-hidden="true"></div>
    <div class="loader__sparks" aria-hidden="true">
      <span></span><span></span><span></span><span></span>
      <span></span><span></span><span></span><span></span>
    </div>
    <div class="loader__inner">
      <div class="loader__transform">
        <div class="loader__plates" aria-hidden="true">
          <span class="loader__plate loader__plate--1"></span>
          <span class="loader__plate loader__plate--2"></span>
          <span class="loader__plate loader__plate--3"></span>
          <span class="loader__plate loader__plate--4"></span>
          <span class="loader__plate loader__plate--5"></span>
          <span class="loader__plate loader__plate--6"></span>
        </div>
        <span class="loader__core" aria-hidden="true"></span>
        <span class="loader__hex" aria-hidden="true"></span>
        <span class="loader__scan" aria-hidden="true"></span>
        <div class="loader__logo">
          <span class="loader__chromatic" aria-hidden="true"></span>
          <img
            class="brand-logo brand-logo--loader"
            src="images/logo-next.png?v=<?= asset_version('images/logo-next.png') ?>"
            alt="NEXT TECHNOLOGIES"
            width="340"
            height="96"
            decoding="async"
          >
        </div>
      </div>
      <div class="loader__footer">
        <div
          class="loader__line loader__line--tf"
          id="loaderProgress"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow="0"
          aria-label="Cargando sitio"
        >
          <span class="loader__progress"></span>
        </div>
        <p class="loader__label" id="loaderLabel">Iniciando secuencia</p>
      </div>
    </div>
    <div class="loader__flash" aria-hidden="true"></div>
    <div class="loader__bloom loader__bloom--tf" aria-hidden="true"></div>
  </div>

  <!-- Custom cursor -->
  <div class="cursor" id="cursor" aria-hidden="true">
    <span class="cursor__dot"></span>
    <span class="cursor__ring"></span>
  </div>

  <!-- Navbar -->
  <header class="header" id="header">
    <nav class="nav container" aria-label="Navegación principal">
      <a href="#inicio" class="nav__logo" aria-label="NEXT TECHNOLOGIES - Inicio">
        <img
          class="brand-logo brand-logo--nav"
          src="images/logo-next.png?v=<?= asset_version('images/logo-next.png') ?>"
          alt=""
          width="220"
          height="48"
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
    <!-- Hero -->
    <section class="hero section" id="inicio">
      <div class="hero__bg">
        <div class="hero__grid"></div>
        <div class="hero__orb hero__orb--1" data-parallax="0.3"></div>
        <div class="hero__orb hero__orb--2" data-parallax="0.5"></div>
        <div class="hero__orb hero__orb--3" data-parallax="0.2"></div>
      </div>
      <div class="container hero__container">
        <div class="hero__content">
          <span class="hero__badge" data-hero="badge">
            <i class="ph ph-map-pin"></i> Jaén, Perú
          </span>
          <h1 class="hero__title" data-hero="title">
            Soluciones Tecnológicas <span class="gradient-text">Profesionales</span> para tus Equipos
          </h1>
          <p class="hero__subtitle" data-hero="subtitle">
            Especialistas en soporte técnico de computadoras, laptops e impresoras en Jaén - Perú
          </p>
          <div class="hero__actions" data-hero="actions">
            <a href="#contacto" class="btn btn--primary btn--magnetic">
              <i class="ph ph-headset"></i> Solicitar servicio
            </a>
            <a href="#servicios" class="btn btn--outline btn--magnetic">
              <i class="ph ph-wrench"></i> Ver servicios
            </a>
          </div>
          <div class="hero__stats-mini" data-hero="mini">
            <div class="hero__stat-item">
              <i class="ph ph-shield-check"></i>
              <span>Garantía incluida</span>
            </div>
            <div class="hero__stat-item">
              <i class="ph ph-clock"></i>
              <span>Atención rápida</span>
            </div>
          </div>
        </div>
        <div class="hero__visual" data-hero="visual">
          <div class="hero__image-wrap hero__image-wrap--team">
            <img
              src="images/equipo-next.png"
              alt="Equipo de NEXT TECHNOLOGIES en nuestro local de soporte técnico en Jaén, Perú"
              width="800"
              height="640"
              loading="eager"
              fetchpriority="high"
              decoding="async"
            >
            <div class="hero__caption" data-hero="caption">
              <span class="hero__caption-icon"><i class="ph ph-storefront"></i></span>
              <div>
                <strong>NEXT TECHNOLOGIES</strong>
                <span>Soporte técnico autorizado · Jaén</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <a href="#servicios" class="hero__scroll" aria-label="Desplazarse a servicios">
        <span>Explorar</span>
        <i class="ph ph-caret-down"></i>
      </a>
    </section>

    <!-- Servicios -->
    <section class="services section" id="servicios">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Nuestros servicios</span>
          <h2 class="section__title">Soporte técnico <span class="gradient-text">integral</span></h2>
          <p class="section__desc">Soluciones completas para mantener tus equipos funcionando al máximo rendimiento.</p>
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
            <p>Asistencia remota y presencial con técnicos certificados y experimentados.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-package"></i></div>
            <h3>Instalación de software</h3>
            <p>Instalación, configuración y licenciamiento de programas y sistemas operativos.</p>
          </article>
          <article class="service-card" data-animate="card">
            <div class="service-card__icon"><i class="ph ph-broom"></i></div>
            <h3>Limpieza interna y optimización</h3>
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

    <!-- Horizontal scroll showcase -->
    <section class="horizontal section" id="showcase">
      <div class="horizontal__sticky">
        <div class="container">
          <h2 class="horizontal__title" data-animate="header">Tecnología que <span class="gradient-text">impulsa</span> tu negocio</h2>
        </div>
        <div class="horizontal__track" id="horizontalTrack">
          <div class="horizontal__panel">
            <i class="ph ph-gear-six"></i>
            <h3>Diagnóstico avanzado</h3>
            <p>Herramientas de última generación para identificar problemas al instante.</p>
          </div>
          <div class="horizontal__panel">
            <i class="ph ph-lightning"></i>
            <h3>Respuesta inmediata</h3>
            <p>Soporte urgente para minimizar el tiempo de inactividad de tus equipos.</p>
          </div>
          <div class="horizontal__panel">
            <i class="ph ph-seal-check"></i>
            <h3>Calidad garantizada</h3>
            <p>Cada servicio respaldado por nuestra garantía de satisfacción.</p>
          </div>
          <div class="horizontal__panel">
            <i class="ph ph-users-three"></i>
            <h3>Atención personalizada</h3>
            <p>Planes adaptados a empresas, hogares y profesionales independientes.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Por qué elegirnos -->
    <section class="why section" id="nosotros">
      <div class="container">
        <div class="why__layout">
          <header class="section__header why__header" data-animate="header">
            <span class="section__tag">¿Por qué elegirnos?</span>
            <h2 class="section__title">Tu aliado tecnológico en <span class="gradient-text">Jaén</span></h2>
            <p class="section__desc">Combinamos experiencia, rapidez y precios justos para ofrecerte el mejor servicio técnico de la región.</p>
          </header>
          <div class="why__grid">
            <article class="why-card" data-animate="why">
              <div class="why-card__icon"><i class="ph ph-lightning"></i></div>
              <h3>Atención rápida</h3>
              <p>Resolvemos tus problemas en el menor tiempo posible sin comprometer la calidad.</p>
            </article>
            <article class="why-card" data-animate="why">
              <div class="why-card__icon"><i class="ph ph-user-gear"></i></div>
              <h3>Personal especializado</h3>
              <p>Técnicos capacitados y en constante actualización con las últimas tecnologías.</p>
            </article>
            <article class="why-card" data-animate="why">
              <div class="why-card__icon"><i class="ph ph-shield-check"></i></div>
              <h3>Garantía de servicio</h3>
              <p>Todos nuestros trabajos incluyen garantía por escrito y seguimiento post-servicio.</p>
            </article>
            <article class="why-card" data-animate="why">
              <div class="why-card__icon"><i class="ph ph-currency-circle-dollar"></i></div>
              <h3>Precios accesibles</h3>
              <p>Tarifas transparentes y competitivas adaptadas a tu presupuesto.</p>
            </article>
            <article class="why-card" data-animate="why">
              <div class="why-card__icon"><i class="ph ph-handshake"></i></div>
              <h3>Soporte confiable</h3>
              <p>Más de 5 años brindando soluciones tecnológicas confiables a la comunidad.</p>
            </article>
          </div>
        </div>
        <div class="why__image" data-animate="image">
          <img
            src="images/equipo-next.png"
            alt="Personal especializado de NEXT TECHNOLOGIES"
            width="500"
            height="400"
            loading="lazy"
          >
          <div class="why__image-glow"></div>
        </div>
      </div>
    </section>

    <!-- Estadísticas -->
    <section class="stats section" id="estadisticas">
      <div class="stats__bg" data-parallax="0.15"></div>
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

    <!-- Galería -->
    <section class="gallery section" id="galeria">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Galería</span>
          <h2 class="section__title">Nuestro trabajo en <span class="gradient-text">acción</span></h2>
          <p class="section__desc">Conoce algunos de los servicios que hemos realizado para nuestros clientes.</p>
        </header>
        <div class="gallery__grid">
          <figure class="gallery__item gallery__item--large" data-animate="gallery">
            <img src="images/equipo-next.png" alt="Equipo y local de NEXT TECHNOLOGIES en Jaén" loading="lazy">
            <figcaption class="gallery__overlay">
              <span>Nuestro equipo en Jaén</span>
              <i class="ph ph-arrow-up-right"></i>
            </figcaption>
          </figure>
          <figure class="gallery__item" data-animate="gallery">
            <img src="images/mantenimiento-pcs.png" alt="Mantenimiento de PCs" loading="lazy">
            <figcaption class="gallery__overlay">
              <span>Mantenimiento de PCs</span>
              <i class="ph ph-arrow-up-right"></i>
            </figcaption>
          </figure>
          <figure class="gallery__item" data-animate="gallery">
            <img src="images/mantenimiento-impresoras.png" alt="Mantenimiento de impresoras" loading="lazy">
            <figcaption class="gallery__overlay">
              <span>Impresoras</span>
              <i class="ph ph-arrow-up-right"></i>
            </figcaption>
          </figure>
          <figure class="gallery__item" data-animate="gallery">
            <img src="images/mantenimiento-laptops.png" alt="Mantenimiento de laptops" loading="lazy">
            <figcaption class="gallery__overlay">
              <span>Mantenimiento de laptops</span>
              <i class="ph ph-arrow-up-right"></i>
            </figcaption>
          </figure>
          <figure class="gallery__item gallery__item--wide" data-animate="gallery">
            <img src="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=900&q=80" alt="Centro de datos y redes" loading="lazy">
            <figcaption class="gallery__overlay">
              <span>Configuración de redes</span>
              <i class="ph ph-arrow-up-right"></i>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>

    <!-- Testimonios -->
    <section class="testimonials section" id="testimonios">
      <div class="container">
        <header class="section__header" data-animate="header">
          <span class="section__tag">Testimonios</span>
          <h2 class="section__title">Lo que dicen nuestros <span class="gradient-text">clientes</span></h2>
        </header>
        <div class="testimonials__slider" id="testimonialsSlider">
          <div class="testimonials__track" id="testimonialsTrack">
            <article class="testimonial-card">
              <div class="testimonial-card__stars" aria-label="5 estrellas">
                <i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i><i class="ph ph-star"></i>
              </div>
              <blockquote>
                <p>"Repararon mi laptop en menos de 24 horas. Excelente servicio y precios muy justos. Totalmente recomendados."</p>
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
                <p>"Llevamos 2 años con NEXT TECHNOLOGIES para el mantenimiento de nuestras oficinas. Siempre puntuales y profesionales."</p>
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
                <p>"Configuraron toda la red de mi negocio y dejaron todo funcionando perfecto. Muy satisfecho con el resultado."</p>
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
                <p>"Mi impresora dejó de funcionar y la repararon el mismo día. Personal muy amable y conocedor. ¡Gracias NEXT TECHNOLOGIES!"</p>
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

    <!-- Contacto -->
    <section class="contact section" id="contacto">
      <div class="container">
        <div class="contact__layout">
          <header class="section__header contact__header" data-animate="header">
            <span class="section__tag">Contacto</span>
            <h2 class="section__title">¿Necesitas <span class="gradient-text">ayuda</span>?</h2>
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
              <p class="form-error" role="alert"><?= htmlspecialchars($contactErrorMsg, ENT_QUOTES, 'UTF-8') ?></p>
            <?php endif; ?>
            <div class="form-group">
              <label for="nombre">Nombre</label>
              <input type="text" id="nombre" name="nombre" required placeholder=" " autocomplete="name">
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="correo">Correo</label>
                <input type="email" id="correo" name="correo" required placeholder=" " autocomplete="email">
              </div>
              <div class="form-group">
                <label for="telefono">Teléfono</label>
                <input type="tel" id="telefono" name="telefono" required placeholder=" " autocomplete="tel">
              </div>
            </div>
            <div class="form-group">
              <label for="mensaje">Mensaje</label>
              <textarea id="mensaje" name="mensaje" rows="4" required minlength="5" placeholder="Describe tu problema o consulta"></textarea>
            </div>
            <button type="submit" class="btn btn--primary btn--full btn--magnetic">
              <i class="ph ph-paper-plane-tilt"></i> Enviar mensaje
            </button>
            <p class="form-success" id="formSuccess" hidden>Redirigiendo a WhatsApp...</p>
          </form>
        </div>

        <div class="contact__map" data-animate="map">
          <div class="contact__map-header">
            <div>
              <span class="section__tag">Ubicación</span>
              <h3 class="contact__map-title">Visítanos en <span class="gradient-text">Jaén</span></h3>
              <p class="contact__map-address">
                <i class="ph ph-map-pin"></i>
                <?= htmlspecialchars(ADDRESS, ENT_QUOTES, 'UTF-8') ?>
              </p>
            </div>
            <a
              href="<?= htmlspecialchars(MAPS_LINK, ENT_QUOTES, 'UTF-8') ?>"
              class="btn btn--outline btn--sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="ph ph-navigation-arrow"></i> Abrir en Google Maps
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

  <!-- Footer -->
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="#inicio" class="footer__logo">
          <img
            class="brand-logo brand-logo--footer"
            src="images/logo-next.png?v=<?= asset_version('images/logo-next.png') ?>"
            alt="NEXT TECHNOLOGIES"
            width="240"
            height="52"
            loading="lazy"
            decoding="async"
          >
        </a>
        <p>Soporte técnico especializado en Jaén, Perú. Tu tecnología en las mejores manos.</p>
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

  <!-- WhatsApp flotante -->
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
    <span class="whatsapp-float__pulse" aria-hidden="true"></span>
  </a>

  <!-- Volver arriba -->
  <button class="back-top" id="backTop" aria-label="Volver arriba" hidden>
    <i class="ph ph-arrow-up"></i>
  </button>

  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/gsap.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.7/dist/ScrollTrigger.min.js" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
  <script src="js/app.min.js?v=<?= asset_version('js/app.min.js') ?>"></script>
</body>
</html>
