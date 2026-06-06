# Documentación técnica — Tecnologías del sitio NEXT TECHNOLOGIES

**Versión del documento:** 1.0  
**Proyecto:** Sitio web corporativo de NEXT TECHNOLOGIES (soporte técnico en Jaén, Perú)  
**Tipo de aplicación:** Página de una sola vista (Single Page) con backend ligero para formulario de contacto

---

## 1. Resumen ejecutivo

Este sitio **no utiliza React, Next.js ni ningún framework de componentes en el frontend**. Es una aplicación web clásica construida con **PHP en el servidor** y **HTML, CSS y JavaScript vanilla en el cliente**, enriquecida con animaciones profesionales mediante **GSAP** y efectos visuales en **Canvas 2D**.

La arquitectura está pensada para dos entornos complementarios:

| Entorno | Rol | Tecnología principal |
|---------|-----|-------------------|
| **Desarrollo y hosting PHP** | Entrada real del sitio, sesiones, formulario | PHP 8+ con servidor integrado o Apache |
| **Producción en Vercel** | Hosting estático + API serverless | Node.js 18+, HTML estático, funciones en `/api` |

El mismo diseño y experiencia de usuario se mantienen en ambos escenarios; solo cambia **cómo se procesa el formulario de contacto** y **cómo se inyectan datos dinámicos** (PHP en local vs. build estático en Vercel).

---

## 2. Arquitectura general

```mermaid
flowchart TB
    subgraph cliente [Navegador del usuario]
        HTML[HTML semántico]
        CSS[CSS + Design System]
        JS[app.min.js]
        GSAP[GSAP + ScrollTrigger CDN]
        Canvas[Canvas neblina ambiental]
    end

    subgraph local [Entorno local / Apache + PHP]
        PHP[index.php + bootstrap]
        ContactoPHP[contacto.php]
        Includes[includes/ config seguridad funciones]
        Data[data/contactos.log]
    end

    subgraph vercel [Producción Vercel]
        Static[public/index.html]
        API[/api/contact.js]
        CSRF[/api/csrf.js]
        Build[scripts/build-vercel.mjs]
    end

    HTML --> PHP
    JS --> GSAP
    JS --> Canvas
    ContactoPHP --> Includes
    ContactoPHP --> Data
    Build --> Static
    Static --> API
```

### 2.1 Flujo de una visita típica

1. El usuario carga `index.php` (local) o `index.html` (Vercel).
2. Se muestra el **loader de entrada** (animación estilo transformación sci-fi con GSAP).
3. Tras la animación, se revela el **hero** y el resto de secciones en scroll vertical.
4. La **neblina ambiental** (Canvas) corre en segundo plano durante toda la sesión.
5. Al enviar el formulario, el servidor valida datos, opcionalmente registra un log y **redirige a WhatsApp** con el mensaje preformateado.

---

## 3. Backend y lógica de servidor

### 3.1 PHP 8+ (entorno principal)

**Archivos clave:**

| Archivo | Función |
|---------|---------|
| `index.php` | Plantilla HTML principal; incluye `bootstrap.php` y renderiza toda la página |
| `contacto.php` | Endpoint POST del formulario de contacto |
| `includes/bootstrap.php` | Inicialización de sesión, CSRF, variables globales y cabeceras |
| `includes/config.php` | Constantes de negocio (WhatsApp, email, mapa, dirección) |
| `includes/functions.php` | Validación, sanitización, URLs de WhatsApp, versionado de assets |
| `includes/security.php` | CSP, rate limiting, honeypot, anonimización de IP |

**Características técnicas:**

- **`declare(strict_types=1)`** en todos los módulos PHP para tipado estricto.
- **Sesiones PHP** con cookies seguras (`httponly`, `samesite=Lax`, `secure` en HTTPS).
- **Token CSRF** de 32 bytes (`random_bytes`) regenerado tras envío exitoso.
- **Validación server-side** de nombre, correo, teléfono y mensaje (no depende del JavaScript del cliente).
- **Rate limiting** por sesión: máximo 10 envíos por hora.
- **Honeypot** en campo oculto `website` para filtrar bots.
- **Log opcional** en `data/contactos.log` (JSON por línea, IP anonimizada).
- **Redirección 303** a `https://wa.me/...` con mensaje codificado (límite URL ~2048 caracteres).

### 3.2 Protección de archivos sensibles

- Carpeta `includes/` bloqueada vía `.htaccess` (`RedirectMatch 403`).
- Carpeta `data/` bloqueada; solo el servidor escribe en el log.
- `main.js` (fuente sin minificar) denegado en Apache para dificultar lectura directa del código fuente en producción tradicional.

### 3.3 API serverless en Vercel (producción alternativa)

Cuando el sitio se despliega en Vercel, PHP **no se ejecuta**. Un script de build convierte el proyecto a estático:

| Componente | Tecnología | Descripción |
|------------|------------|-------------|
| `scripts/build-vercel.mjs` | Node.js ESM | Convierte `index.php` → `public/index.html`, sustituye variables PHP por valores de `site.config.json` |
| `api/contact.js` | Vercel Serverless Function | Replica la lógica de `contacto.php` |
| `api/csrf.js` | Vercel Serverless Function | Emite token CSRF firmado con HMAC (`CSRF_SECRET`) |
| `lib/contact.js` | Módulo Node compartido | Validación y utilidades reutilizadas por las APIs |

**Rewrite en `vercel.json`:** las peticiones a `/contacto.php` se redirigen internamente a `/api/contact`, manteniendo compatibilidad con el `action` del formulario tras el build.

---

## 4. Frontend: HTML y estructura

### 4.1 HTML5 semántico

La página está organizada en secciones accesibles con landmarks claros:

- `<header>` — Navegación fija con logo y menú responsive.
- `<section>` — Hero, servicios, nosotros, galería, testimonios, contacto.
- `<footer>` — Datos legales y redes sociales.
- Atributos **ARIA** en loader, formulario, botones flotantes y controles interactivos.

### 4.2 Meta y SEO básico

- `lang="es"`, `viewport` con `viewport-fit=cover` (safe areas en móviles).
- `meta description` y `theme-color` para navegadores y PWA-like behavior.
- Imágenes con `width`, `height`, `loading`, `decoding` y `fetchpriority` donde corresponde.

### 4.3 Formulario de contacto

- Método **POST** tradicional (funciona sin JavaScript).
- Campo oculto CSRF inyectado por PHP (o por fetch a `/api/csrf` en Vercel).
- Mensajes de error vía query string (`?contacto=error&motivo=...`) en PHP; vía JS en build estático.

---

## 5. CSS y sistema de diseño

### 5.1 Hoja de estilos principal

| Archivo | Contenido |
|---------|-----------|
| `css/style.css` | Design system completo (~1.600 líneas): variables, layout, componentes, responsive |
| `css/fog-ambient.css` | Estilos de la capa de neblina (posición fija, máscaras, opacidad) |
| `css/app.min.css` | **Producción:** concatenación minificada de `fog-ambient.css` + `style.css` |

### 5.2 Design tokens (`:root`)

El sitio usa **CSS Custom Properties** como fuente única de verdad visual:

- **Colores:** fondos oscuros (`#0a0e17`), acentos azul/cian, gradientes corporativos.
- **Tipografía:** `--font-sans` (Outfit), `--font-mono` (JetBrains Mono).
- **Espaciado:** `--section-pad`, `--gutter` con `clamp()` y `env(safe-area-inset-*)`.
- **Efectos:** sombras, bordes semitransparentes, `--transition` con curva cubic-bezier.

### 5.3 Técnicas CSS modernas empleadas

- **Flexbox y CSS Grid** para layouts responsive.
- **`clamp()`** para tipografía y espaciado fluido.
- **`backdrop-filter`** en botones outline y overlays.
- **`clip-path`** en el loader (paneles metálicos, hexágono).
- **`mix-blend-mode`** en efectos de neblina y aberración cromática.
- **Media queries** y contenedor `min()` / `max()` para breakpoints.
- **`:focus-visible`** para accesibilidad de teclado.
- **`prefers-reduced-motion`** respetado desde JavaScript (desactiva animaciones pesadas).

### 5.4 Modo rendimiento (`perf-lite`)

En dispositivos táctiles, pantallas estrechas o con `prefers-reduced-motion`, el JS añade la clase `perf-lite` al `<html>`, reduciendo partículas de neblina y simplificando animaciones.

---

## 6. JavaScript (cliente)

### 6.1 Módulos fuente

| Archivo | Responsabilidad |
|---------|-----------------|
| `js/main.js` | Orquestador principal: UI, GSAP, formulario, slider, cursor |
| `js/fog-ambient.js` | Motor Canvas 2D de neblina orgánica (`AmbientFog` class) |
| `js/app.min.js` | **Producción:** `fog-ambient.js` + `main.js` minificados con Terser |

**Patrón de código:** IIFE (`(function () { 'use strict'; ... })();`) sin dependencias de bundler en desarrollo; exposición mínima al scope global.

### 6.2 Funcionalidades implementadas en `main.js`

| Módulo | Descripción |
|--------|-------------|
| `initLoader` | Entrada cinematográfica estilo transformación mecánica (paneles, hexágono, chispas, barra de progreso) |
| `initHeroAnimation` | Timeline de aparición del hero (badge, título, CTAs, estadísticas) |
| `initScrollAnimations` | Revelado de secciones, tarjetas y cabeceras con ScrollTrigger |
| `initHorizontalScroll` | Scroll horizontal pinneado en desktop (sección “Tecnología que impulsa”) |
| `initParallax` | Orbes del hero con desplazamiento ligado al scroll |
| `initCounters` | Contadores numéricos animados en la sección “Nosotros” |
| `initMagneticButtons` | Botones con atracción magnética al cursor (solo desktop) |
| `initCursor` | Cursor personalizado (punto + anillo) |
| `initTestimonialsSlider` | Carrusel de testimonios con autoplay y controles |
| `initWhatsAppFloat` | Animación sutil del botón flotante de WhatsApp |
| `initEssentials` | Navegación, menú móvil, scroll suave, header al scroll, back-to-top |
| `initPerformance` | Detección de dispositivo y ajuste de neblina |

### 6.3 Degradación elegante

Si GSAP no carga desde el CDN, el sitio:

- Oculta el loader de inmediato.
- Mantiene navegación, formulario y slider básico.
- Registra advertencia en consola (`GSAP no se cargó`).

---

## 7. Animaciones: GSAP 3 y ScrollTrigger

### 7.1 Biblioteca

| Recurso | Versión | Origen |
|---------|---------|--------|
| GSAP Core | 3.12.7 | jsDelivr CDN |
| ScrollTrigger | 3.12.7 | jsDelivr CDN (plugin registrado en runtime) |

**GSAP (GreenSock Animation Platform)** es la biblioteca principal de animación. Se eligió por:

- Timelines encadenables con precisión de milisegundos.
- Excelente rendimiento (usa `transform` y `opacity` preferentemente).
- Plugin **ScrollTrigger** para animaciones ligadas al scroll, pin y scrub.
- API `matchMedia` para comportamientos distintos por breakpoint.

### 7.2 Loader de entrada (`loader--tf`)

Animación de ~3,1 segundos con:

- 6 paneles metálicos que convergen al centro (`back.out` easing).
- Hexágono rotatorio y núcleo energético.
- Rayo horizontal, barrido de escaneo y chispas radiales.
- Revelado del logo con flash, bloom y aberración cromática suave.
- Barra de progreso y etiquetas de estado monoespaciadas.
- Failsafe a 9 segundos si la animación no completa.

### 7.3 Scroll horizontal

En viewports **≥ 1025px**, la sección `.horizontal` usa ScrollTrigger para:

- **Pin** de la sección mientras el usuario hace scroll vertical.
- Traslación horizontal del track (`scrub: 1`) proporcional al desplazamiento.
- `invalidateOnRefresh` para recalcular anchos al redimensionar.

---

## 8. Gráficos en Canvas: neblina ambiental

**Archivo:** `js/fog-ambient.js`  
**Clase:** `AmbientFog`

### 8.1 Tecnología

- **Canvas 2D API** nativa del navegador (`getContext('2d', { alpha: true, desynchronized: true })`).
- Bucle **`requestAnimationFrame`** con control de delta time (`maxDeltaMs: 48`).
- Partículas tipo “blob” con gradientes radiales RGBA configurables.

### 8.2 Configuración vía data-attributes

El elemento `#ambientFog` expone parámetros sin recompilar JS:

```html
data-fog-opacity="0.42"
data-fog-blob-alpha="0.1"
data-fog-speed="0.3"
data-fog-density="14"
data-fog-mode="mist"
```

### 8.3 Optimizaciones

- Menos partículas en móvil y modo `perf-lite`.
- Pausa automática cuando la pestaña está oculta (`document.hidden`).
- `ResizeObserver` / debounce en resize.
- Respeta `prefers-reduced-motion` (no inicia animación).

---

## 9. Tipografía e iconografía

### 9.1 Fuentes web (Google Fonts)

| Familia | Uso | Pesos |
|---------|-----|-------|
| **Outfit** | Texto general, títulos, UI | 300–800 |
| **JetBrains Mono** | Etiquetas técnicas del loader, detalles mono | 400, 500 |

Carga con `preconnect` a `fonts.googleapis.com` y `fonts.gstatic.com` para reducir latencia.

### 9.2 Phosphor Icons

- **Paquete:** Phosphor Regular (fuente de iconos, no SVG sprite).
- **Ubicación:** `css/vendor/phosphor/phosphor-regular.css` (autocontenido en el proyecto).
- **Uso:** Iconos en navegación, servicios, contacto, redes sociales y WhatsApp flotante.
- Clases tipo `ph ph-desktop-tower`, `ph ph-whatsapp-logo`, etc.

---

## 10. Integraciones de terceros

| Servicio | Integración | Notas |
|----------|-------------|-------|
| **WhatsApp (wa.me)** | Redirección server-side con mensaje URL-encoded | Número configurado en `config.php` / `site.config.json` |
| **Google Maps** | iframe embed + enlace externo | Solo `frame-src` permitido en CSP |
| **Google Fonts** | CDN de estilos y fuentes | Permitido en CSP `style-src` y `font-src` |
| **jsDelivr** | CDN de GSAP | Permitido en CSP `script-src` |
| **Facebook / Instagram** | Enlaces directos en footer y contacto | URLs en configuración |

**No hay** base de datos SQL, CMS headless, ni servicio de email transaccional: el contacto termina en WhatsApp.

---

## 11. Pipeline de build y herramientas de desarrollo

### 11.1 Build local de assets (`build.ps1`)

```powershell
npx terser js/fog-ambient.js js/main.js -c -m --toplevel -o js/app.min.js
npx clean-css-cli -o css/app.min.css css/fog-ambient.css css/style.css
```

| Herramienta | Versión | Función |
|-------------|---------|---------|
| **Terser** | vía npx | Minificación y ofuscación ligera de JavaScript |
| **clean-css-cli** | vía npx | Minificación de CSS (concatena fog + style) |

El sitio en producción referencia siempre `app.min.css` y `app.min.js` con **cache busting** (`?v=filemtime`).

### 11.2 Build para Vercel (`npm run build`)

| Paso | Acción |
|------|--------|
| 1 | Lee `site.config.json` y `index.php` |
| 2 | Elimina bloques PHP y sustituye `htmlspecialchars(...)` por HTML escapado |
| 3 | Cambia `action="contacto.php"` → `action="/api/contact"` |
| 4 | Genera `public/index.html` y copia assets estáticos |
| 5 | Vercel publica la carpeta `public/` |

### 11.3 Servidor de desarrollo (`iniciar.ps1`)

- **PHP built-in server:** `php -S localhost:8000`
- Entrada obligatoria: `http://localhost:8000/index.php` (sesiones y CSRF requieren PHP).

### 11.4 Node.js y npm

`package.json` declara:

- `"type": "module"` para scripts ESM.
- `"engines": { "node": ">=18" }` para build y APIs Vercel.
- Sin dependencias npm fijas en `dependencies`; herramientas de minificación se invocan con `npx --yes`.

---

## 12. Seguridad

### 12.1 Cabeceras HTTP

Implementadas en PHP (`send_security_headers`), Apache (`.htaccess`) y Vercel (`vercel.json`):

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: SAMEORIGIN`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (geolocalización, micrófono y cámara deshabilitados)
- `Strict-Transport-Security` (solo HTTPS)
- **Content-Security-Policy** restrictiva con whitelist de dominios

### 12.2 Medidas aplicación

| Medida | Implementación |
|--------|----------------|
| CSRF | Token en sesión (PHP) o cookie firmada HMAC (Vercel) |
| XSS | `htmlspecialchars(..., ENT_QUOTES, 'UTF-8')` en toda salida dinámica PHP |
| Validación de entrada | `strip_tags`, límites de longitud, `filter_var` para email |
| Anti-spam | Honeypot + rate limiting |
| Redirección segura | Regex estricta para URLs `wa.me` |
| Privacidad en logs | IP anonimizada (último octeto / sufijo IPv6) |

Documentación ampliada de auditoría: [`AUDITORIA-SEGURIDAD.md`](AUDITORIA-SEGURIDAD.md).

---

## 13. Rendimiento y accesibilidad

### 13.1 Rendimiento

- Assets minificados en producción.
- Una sola petición JS y una CSS principal (más GSAP externo).
- Imágenes con dimensiones explícitas para evitar CLS.
- `will-change` solo donde la animación lo justifica (loader).
- `ScrollTrigger.config({ limitCallbacks: true })` para reducir trabajo en scroll.
- Neblina con menos partículas en móvil y pausa en pestaña inactiva.

### 13.2 Accesibilidad

- Roles ARIA en loader (`role="status"`, `aria-live="polite"`).
- `aria-label` en controles iconográficos.
- Navegación por teclado con `:focus-visible`.
- Respeto a **`prefers-reduced-motion`**: animaciones sustituidas por aparición instantánea o duraciones mínimas.
- Cursor personalizado desactivado en touch y reduced motion (`body.no-cursor`).

---

## 14. Estructura de archivos (referencia)

```
NEXT/
├── index.php                 # Entrada PHP (desarrollo / Apache)
├── index.html                # Redirección a index.php
├── contacto.php              # Procesamiento POST (PHP)
├── iniciar.ps1               # Servidor local PHP :8000
├── build.ps1                 # Minificación CSS/JS
├── package.json              # Scripts Vercel
├── vercel.json               # Config despliegue estático + rewrites
├── site.config.json          # Datos para build Vercel (sin PHP)
│
├── includes/                 # Backend PHP (no público)
│   ├── bootstrap.php
│   ├── config.php
│   ├── functions.php
│   └── security.php
│
├── api/                      # Serverless Vercel
│   ├── contact.js
│   └── csrf.js
├── lib/contact.js            # Lógica compartida Node
├── scripts/build-vercel.mjs  # Generador de /public
│
├── css/
│   ├── style.css             # Design system + componentes
│   ├── fog-ambient.css
│   ├── app.min.css           # Build producción
│   └── vendor/phosphor/      # Iconos
│
├── js/
│   ├── main.js               # Lógica principal
│   ├── fog-ambient.js        # Canvas neblina
│   └── app.min.js            # Build producción
│
├── images/                   # Logo, equipo, galería
├── data/                     # Logs de contacto (protegido)
├── public/                   # Salida build Vercel
└── docs/                     # Documentación del proyecto
```

---

## 15. Lo que este proyecto **no** utiliza

Para evitar confusiones con el nombre de la carpeta (`NEXT`) o expectativas de stack moderno:

| Tecnología | ¿Se usa? |
|------------|----------|
| Next.js / React / Vue / Angular | No |
| TypeScript | No |
| Webpack / Vite / Turbopack | No (solo npx puntual para minificar) |
| Tailwind CSS | No (CSS custom properties + clases propias) |
| Base de datos (MySQL, PostgreSQL, etc.) | No |
| Prisma / ORM | No |
| Three.js / WebGL | No (se evaluó y se descartó por estabilidad) |
| jQuery | No |
| Bootstrap / Material UI | No |

---

## 16. Variables de entorno (Vercel)

| Variable | Obligatoria | Uso |
|----------|-------------|-----|
| `CSRF_SECRET` | Sí | Firma HMAC del token CSRF en cookies |

Ver `.env.example` para referencia local de APIs.

---

## 17. Mantenimiento habitual

| Tarea | Archivo(s) a editar | Post-cambio |
|-------|---------------------|-------------|
| Cambiar teléfono o dirección | `includes/config.php`, `site.config.json` | `.\build.ps1` si tocas CSS/JS; `npm run build` antes de Vercel |
| Modificar animaciones | `js/main.js`, `css/style.css` | `.\build.ps1` |
| Ajustar neblina | `js/fog-ambient.js`, data-attrs en `index.php` | `.\build.ps1` |
| Nuevo servicio en tarjetas | `index.php` | Build según entorno |
| Políticas de seguridad | `includes/security.php`, `.htaccess` | Reiniciar / redesplegar |

---

## 18. Referencias cruzadas

- [README.md](../README.md) — Inicio rápido y visión general  
- [TECNOLOGIAS.docx](TECNOLOGIAS.docx) — Misma documentación en formato Microsoft Word  
- [DESPLIEGUE-VERCEL.md](DESPLIEGUE-VERCEL.md) — Guía de despliegue en Vercel  
- [AUDITORIA-SEGURIDAD.md](AUDITORIA-SEGURIDAD.md) — Revisión de seguridad del formulario y cabeceras  

---

*Documento generado para el equipo de desarrollo y stakeholders técnicos de NEXT TECHNOLOGIES.*
