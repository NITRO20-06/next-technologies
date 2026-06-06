# Despliegue en Vercel — NEXT TECHNOLOGIES

Este sitio **no usa React**. Es HTML/CSS/JS con PHP en local. En Vercel se publica como sitio estático + funciones serverless para el formulario.

## Requisitos

- Cuenta en [vercel.com](https://vercel.com)
- Node.js 18+
- Vercel CLI (opcional): `npm i -g vercel`

## Primera vez

1. Instala dependencias (solo scripts de build):

```powershell
cd c:\PROYECTOS-CURSOR\NEXT
npm install
```

2. Genera el build local (prueba):

```powershell
npm run build
```

3. Inicia sesión y enlaza el proyecto:

```powershell
vercel login
vercel link
```

4. En el dashboard de Vercel → **Settings → Environment Variables**, añade:

| Variable | Obligatoria | Descripción |
|----------|-------------|-------------|
| `CSRF_SECRET` | Sí | Cadena aleatoria (mín. 16 caracteres). Ej: `openssl rand -hex 32` |
| `WHATSAPP_NUMBER` | No | Mismo valor que `includes/config.php` |
| `SAVE_CONTACT_LOG` | No | `true` para registrar contactos en logs de Vercel |

Copia el resto desde `.env.example` si cambias datos de contacto.

5. Despliegue preview:

```powershell
npm run vercel:preview
```

6. Producción:

```powershell
npm run vercel:prod
```

## Flujo de trabajo

| Entorno | Comando |
|---------|---------|
| **Local (PHP)** | `.\iniciar.ps1` → `http://localhost:8000/index.php` |
| **Assets minificados** | `.\build.ps1` o `npm run build:assets` |
| **Build Vercel completo** | `npm run build` (minifica + genera `public/`) |
| **Subir a Vercel** | `npm run vercel:prod` o push a GitHub (si está conectado) |

Guía GitHub: **[DESPLIEGUE-GITHUB.md](DESPLIEGUE-GITHUB.md)**

## Qué hace el build

- Convierte `index.php` → `public/index.html` usando `site.config.json`
- Copia `css/`, `js/`, `images/`
- El formulario envía a `/api/contact` (función serverless)
- El token CSRF se obtiene de `/api/csrf`

## Mantener sincronizada la configuración

Si cambias datos en `includes/config.php`, actualiza también `site.config.json` (o variables de entorno en Vercel).

## Notas

- Vercel **no ejecuta PHP**. `contacto.php` solo sirve en local.
- Los logs de contacto en Vercel van a **Functions → Logs**, no a `data/contactos.log`.
- Dominio personalizado: Vercel Dashboard → **Domains**.
