# Subir a GitHub y desplegar en Vercel

Guía paso a paso para publicar **NEXT TECHNOLOGIES** en producción.

---

## 1. Qué se sube a GitHub

| Sí se versiona | No se sube (`.gitignore`) |
|----------------|---------------------------|
| Código fuente (`index.php`, `css/`, `js/`, `api/`, `lib/`) | `node_modules/` |
| Imágenes (`images/`) | `public/` (build generado) |
| Configuración (`vercel.json`, `site.config.json`) | `.env` / secretos |
| Documentación (`docs/`) | `data/contactos.log` |
| Assets minificados (`app.min.css`, `app.min.js`) | `.vercel/` |

---

## 2. Crear repositorio en GitHub

1. Entra a [github.com/new](https://github.com/new).
2. Nombre sugerido: `next-technologies` o `next-technologies-web`.
3. **No** marques “Add README” si ya tienes uno en el proyecto.
4. Crea el repositorio y copia la URL (ej. `https://github.com/TU_USUARIO/next-technologies.git`).

---

## 3. Subir el proyecto (primera vez)

En PowerShell, desde la carpeta del proyecto:

```powershell
cd c:\PROYECTOS-CURSOR\NEXT

# Inicializar Git (solo la primera vez)
git init
git branch -M main

# Instalar dependencias y verificar que el build funciona
npm install
npm run build

# Añadir archivos y primer commit
git add .
git commit -m "Sitio corporativo NEXT TECHNOLOGIES listo para Vercel"

# Enlazar con GitHub (cambia la URL por la tuya)
git remote add origin https://github.com/TU_USUARIO/next-technologies.git
git push -u origin main
```

---

## 4. Conectar GitHub con Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New → Project**.
2. Importa el repositorio de GitHub.
3. Vercel detectará la configuración de `vercel.json`:

| Ajuste | Valor |
|--------|-------|
| Framework Preset | **Other** |
| Build Command | `npm run build` |
| Output Directory | `public` |
| Install Command | `npm install` |

4. **No cambies** esos valores; ya están en `vercel.json`.

---

## 5. Variables de entorno en Vercel (obligatorio)

En **Settings → Environment Variables**, añade:

| Variable | Entornos | Valor |
|----------|----------|-------|
| `CSRF_SECRET` | Production, Preview, Development | Cadena aleatoria de 32+ caracteres |

Generar secreto en PowerShell:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Opcionales (si cambias datos respecto a `site.config.json`):

- `WHATSAPP_NUMBER`
- `WHATSAPP_DISPLAY`
- `CONTACT_EMAIL`
- `ADDRESS`
- `MAPS_EMBED`
- `MAPS_LINK`
- `SAVE_CONTACT_LOG` → `true`

Copia el resto desde `.env.example`.

---

## 6. Desplegar

- **Automático:** cada `git push` a `main` despliega en producción (si activas Production Branch en Vercel).
- **Manual desde CLI:**

```powershell
npm run vercel:prod
```

Vercel te dará una URL tipo `https://next-technologies-xxx.vercel.app`.

---

## 7. Comprobar que todo funciona

Tras el despliegue, verifica:

- [ ] La página carga (hero, servicios, galería).
- [ ] Las imágenes se ven (`/images/logo-next.png`).
- [ ] El loader y animaciones funcionan.
- [ ] El formulario de contacto envía y redirige a WhatsApp.
- [ ] El botón flotante de WhatsApp abre el chat.
- [ ] El mapa de Google Maps carga en la sección contacto.

Si el formulario falla con “sesión expiró”, revisa que `CSRF_SECRET` esté configurado.

---

## 8. Dominio personalizado (opcional)

1. Vercel Dashboard → tu proyecto → **Settings → Domains**.
2. Añade tu dominio (ej. `www.next.net.pe`).
3. Configura los DNS en tu proveedor según las instrucciones de Vercel.

---

## 9. Flujo de trabajo diario

```text
Editar código → npm run build (prueba local) → git add → git commit → git push
                                                      ↓
                                            Vercel despliega automáticamente
```

| Entorno | Comando |
|---------|---------|
| Desarrollo PHP local | `.\iniciar.ps1` → `http://localhost:8000/index.php` |
| Build completo | `npm run build` |
| Solo minificar CSS/JS | `npm run build:assets` o `.\build.ps1` |

---

## 10. Mantener sincronizada la configuración

Si cambias teléfono, dirección o mapa, actualiza **ambos**:

1. `includes/config.php` (desarrollo local con PHP)
2. `site.config.json` (build estático para Vercel)

---

## Referencias

- [DESPLIEGUE-VERCEL.md](DESPLIEGUE-VERCEL.md) — Detalles técnicos del build
- [TECNOLOGIAS.md](TECNOLOGIAS.md) — Stack completo del proyecto
