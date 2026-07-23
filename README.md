# NEXT TECHNOLOGIES

Sitio web corporativo de **NEXT TECHNOLOGIES** (soporte técnico en Jaén, Perú). Página de una sola vista con formulario de contacto que redirige a WhatsApp. Backend en PHP; frontend con animaciones GSAP y Anime.js.

---

## Qué incluye

| Área | Contenido |
|------|-----------|
| **Servicios** | 8 tarjetas (soporte, redes, cámaras, etc.) |
| **Nosotros** | Ventajas, estadísticas animadas, foto del equipo |
| **Galería / testimonios** | Imágenes y slider de clientes |
| **Contacto** | Formulario, mapa Google Maps, datos de la empresa |
| **Extras** | Modo oscuro, loader, cursor personalizado (desktop), botón WhatsApp flotante, volver arriba |

El formulario valida en servidor (CSRF), puede guardar un log y abre WhatsApp con el mensaje ya redactado.

---

## Tecnologías

- **PHP 8+** — sesiones, validación, redirección a WhatsApp  
- **HTML / CSS / JS** — `style.css` y `main.js` en desarrollo; `app.min.*` en producción  
- **GSAP 3 + ScrollTrigger** — animaciones de UI y scroll (CDN)
- **Anime.js 3** — timelines del ensamblaje 3D del PC en el hero (CDN)
- **Three.js** — modelo 3D interactivo del PC (CDN / import map)  
- **Phosphor Icons**, fuentes **Outfit** y **JetBrains Mono**

Documentación técnica detallada: **[docs/TECNOLOGIAS.md](docs/TECNOLOGIAS.md)** · Word: **[docs/TECNOLOGIAS.docx](docs/TECNOLOGIAS.docx)**

---

## Requisitos

- PHP 8.0+ (sesiones activas; no requiere `mbstring` gracias a helpers propios)
- Apache con `.htaccess` **o** servidor integrado `php -S`

---

## Inicio rápido (local)

```powershell
cd c:\PROYECTOS-CURSOR\NEXT
.\iniciar.ps1
```

Abre **http://localhost:8000/index.php**

Si `php` no existe:

```powershell
winget install PHP.PHP.8.3
```

Cierra y reabre la terminal. No uses solo `index.html` en el explorador: el formulario necesita PHP.

---

## Estructura del proyecto

```
NEXT/
├── index.php              # Página principal (entrada real)
├── index.html             # Redirige a index.php
├── contacto.php           # POST del formulario → log + WhatsApp
├── iniciar.ps1            # Servidor local en :8000
├── build.ps1              # Genera app.min.js y app.min.css
├── includes/              # No público (.htaccess)
│   ├── config.php         # WhatsApp, email, mapa, dirección
│   ├── bootstrap.php      # Sesión, CSRF, variables globales
│   └── functions.php      # Validación, URL WhatsApp, caché assets
├── data/                  # contactos.log (bloqueado)
├── css/  style.css | app.min.css
├── js/   main.js   | app.min.js
└── images/              # equipo-next.png, etc.
```

---

## Configuración

Edita **`includes/config.php`**:

| Constante | Uso |
|-----------|-----|
| `WHATSAPP_NUMBER` / `WHATSAPP_DISPLAY` | Número y texto mostrado |
| `CONTACT_EMAIL`, `ADDRESS`, `LOCATION` | Datos de contacto |
| `MAPS_EMBED`, `MAPS_LINK` | Mapa en la sección contacto |
| `SAVE_CONTACT_LOG` | `true` guarda en `data/contactos.log` |

Redes sociales en el HTML siguen como `#` hasta que las enlaces manualmente.

---

## Formulario de contacto

1. POST a `contacto.php` con token CSRF.  
2. Validación de nombre, email, teléfono y mensaje.  
3. Opcional: línea en `data/contactos.log`.  
4. Redirección a `https://wa.me/...` con el mensaje codificado (límite ~2048 caracteres en URL).

La lógica sensible (número, plantilla del mensaje) está solo en PHP, no en el JS del cliente.

---

## Build de assets

Tras cambiar `css/style.css` o `js/main.js`:

```powershell
.\build.ps1
```

El sitio carga `app.min.css` y `app.min.js`. En Apache, `main.js` queda bloqueado por `.htaccess`; el servidor `php -S` no aplica esas reglas.

---

## Subir a GitHub y desplegar en Vercel

> **Importante:** este sitio **no es React/Next.js**. En local usa PHP; en Vercel se publica como HTML estático + API serverless (`/api/contact`).

### Primera vez (GitHub + Vercel)

```powershell
npm install
npm run build
.\github-setup.ps1     # login GitHub + crear repo + push
```

> Si `gh` no se reconoce, cierra y abre la terminal, o usa `.\github-setup.ps1` (actualiza el PATH automáticamente).

Luego importa el repo en [vercel.com/new](https://vercel.com/new) y configura `CSRF_SECRET` en Environment Variables.

**Guía completa:** **[docs/DESPLIEGUE-GITHUB.md](docs/DESPLIEGUE-GITHUB.md)**  
**Detalles del build:** **[docs/DESPLIEGUE-VERCEL.md](docs/DESPLIEGUE-VERCEL.md)**

Variable obligatoria en Vercel: `CSRF_SECRET` (ver `.env.example`).

---

## Notas

- **Puerto 0000 ocupado:** cierra otra instancia de `php -S` o cambia el puerto en `iniciar.ps1`.  
- **Inspección (F12):** HTML y `.min` son visibles; PHP e `includes/` no se ejecutan en el navegador.  
- **Mantenimiento:** optimizar `images/equipo-next.png` si el peso importa; actualizar testimonios/galería en `index.php`.
