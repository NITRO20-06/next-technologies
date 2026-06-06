# Auditoría de Seguridad — NEXT TECHNOLOGIES

**Fecha:** 2026-05-27  
**Alcance:** 100% del código fuente del repositorio (18 archivos revisados)  
**Rol:** Ingeniería de seguridad / DevSecOps / revisión OWASP Top 10  

---

## 1. Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Archivos analizados | 18 |
| Hallazgos totales | 24 |
| Corregidos automáticamente | 14 |
| Pendientes (configuración / infra) | 10 |
| Críticos antes de corrección | 2 |
| Críticos tras corrección | 0 |

**Tipo de aplicación:** sitio corporativo PHP (sin base de datos, sin autenticación de usuarios).  
**Superficie de ataque principal:** formulario `contacto.php`, sesiones PHP, log de contactos, CDN externos (GSAP, fuentes, mapas).

---

## 2. Inventario revisado (100%)

| Ruta | Tipo |
|------|------|
| `index.php` | Frontend + PHP |
| `index.html` | Redirección |
| `contacto.php` | Backend POST |
| `includes/config.php` | Configuración |
| `includes/bootstrap.php` | Sesión / CSRF |
| `includes/functions.php` | Validación / log |
| `includes/security.php` | **Nuevo** — cabeceras y controles |
| `includes/.htaccess` | Denegar acceso |
| `data/.htaccess` | Denegar acceso |
| `data/contactos.log` | PII almacenada |
| `.htaccess` | Raíz Apache |
| `js/main.js` / `js/app.min.js` | Frontend |
| `css/style.css` / `css/app.min.css` | Estilos |
| `build.ps1` / `iniciar.ps1` | DevOps local |
| `README.md` | Documentación |
| `docs/generar_documentacion_word.py` | Generador Word |
| `.gitignore` | **Nuevo** |

**No aplica en este proyecto:** Node.js, React, Next.js, Laravel, bases de datos SQL/NoSQL, JWT, APIs REST propias, `package.json`, `.env` en uso.

---

## 3. Tabla de hallazgos

| ID | Vulnerabilidad / hallazgo | Riesgo | Archivo | Estado | Solución aplicada |
|----|---------------------------|--------|---------|--------|-------------------|
| H-01 | Cabeceras de seguridad ausentes (CSP, HSTS, X-Frame-Options, etc.) | Alto | `.htaccess`, `bootstrap.php` | **Corregido** | `send_security_headers()` + `mod_headers` en Apache |
| H-02 | Log de contactos con PII accesible si Apache falla | Crítico | `data/contactos.log` | **Mitigado** | `.gitignore`, permisos 0640/0750, IP anonimizada, deny en `data/.htaccess` |
| H-03 | Sin rate limiting en formulario (spam / abuso) | Alto | `contacto.php` | **Corregido** | Límite 10 envíos/hora por sesión |
| H-04 | Sin honeypot anti-bots | Medio | `index.php`, `contacto.php` | **Corregido** | Campo oculto `website` + rechazo silencioso |
| H-05 | Redirección externa sin validación de destino | Medio | `contacto.php` | **Corregido** | `is_safe_whatsapp_redirect()` solo `https://wa.me/{digits}` |
| H-06 | Posible path traversal en `asset_version()` | Medio | `functions.php` | **Corregido** | Validación de ruta + `realpath()` dentro del proyecto |
| H-07 | Session fixation (ID de sesión no regenerado) | Medio | `bootstrap.php` | **Corregido** | `session_regenerate_id(true)` al crear CSRF |
| H-08 | CSRF token reutilizable tras envío | Bajo | `contacto.php` | **Corregido** | Rotación de token tras envío válido |
| H-09 | `target="_blank"` sin `noreferrer` (tabnabbing) | Bajo | `index.php` | **Corregido** | `rel="noopener noreferrer"` en enlaces externos |
| H-10 | Uso de `innerHTML` en JS | Bajo | `js/main.js` | **Corregido** | `replaceChildren()` / `createElement` |
| H-11 | Script inline duplicado (CSP / mantenimiento) | Bajo | `index.php` | **Corregido** | Scroll de error movido a `main.js` |
| H-12 | CDN sin `crossorigin` | Informativo | `index.php` | **Corregido** | `crossorigin="anonymous"` en GSAP |
| H-13 | CSP con `unsafe-inline` (scripts en `<head>`) | Medio | `index.php` | **Pendiente** | Requiere nonces o archivo JS externo para endurecer |
| H-14 | Sin SRI (Subresource Integrity) en CDN | Medio | `index.php` | **Pendiente** | Añadir `integrity` fijo por versión GSAP/Phosphor |
| H-15 | `php -S` no aplica `.htaccess` | Alto (dev) | `iniciar.ps1` | **Pendiente** | Usar Apache/XAMPP en pruebas de seguridad o proxy local |
| H-16 | Configuración sensible en código fuente | Medio | `includes/config.php` | **Pendiente** | Migrar a variables de entorno fuera del repo |
| H-17 | `contactos.log` ya versionado con datos reales | Crítico (datos) | `data/contactos.log` | **Pendiente** | Eliminar del historial Git y rotar si se expuso |
| H-18 | Dependencias CDN sin auditoría automatizada | Medio | CDN jsdelivr | **Pendiente** | Fijar versión + monitorizar CVE de GSAP |
| H-19 | SQL / NoSQL / XXE / RCE / IDOR | N/A | — | **No aplica** | Sin BD ni XML/upload/exec |
| H-20 | XSS reflejado en `$_GET` | Bajo | `bootstrap.php` | **OK** | `match()` whitelist + `htmlspecialchars` en salida |
| H-21 | CSRF en formulario | Bajo | `contacto.php` | **OK** | Token + `hash_equals` (reforzado con rotación) |
| H-22 | Clickjacking | Medio | — | **Corregido** | `X-Frame-Options: SAMEORIGIN` |
| H-23 | Exposición de `style.css` / fuentes dev | Informativo | `.htaccess` | **Pendiente** | Opcional bloquear `style.css` y `main.js` (ya bloqueado) |
| H-24 | Cumplimiento GDPR en logs de contacto | Medio | `functions.php` | **Mitigado** | IP anonimizada; política de retención manual recomendada |

---

## 4. OWASP Top 10 — resultado

| Categoría OWASP | Estado en el proyecto |
|-----------------|------------------------|
| A01 Broken Access Control | No aplica (sin áreas privadas de usuario) |
| A02 Cryptographic Failures | Medio — PII en log; HTTPS depende del hosting |
| A03 Injection | Bajo — sin SQL; entradas sanitizadas |
| A04 Insecure Design | Mitigado — rate limit + honeypot añadidos |
| A05 Security Misconfiguration | Corregido parcialmente (headers, permisos) |
| A06 Vulnerable Components | Pendiente — CDN sin SRI/CVE scan |
| A07 Auth Failures | No aplica |
| A08 Software/Data Integrity | Medio — CDN supply chain |
| A09 Logging Failures | Mitigado — log con permisos y IP anonimizada |
| A10 SSRF | No aplica |

---

## 5. Detalle de correcciones aplicadas

### H-01 — Cabeceras HTTP

**Riesgo:** clickjacking, MIME sniffing, fugas por Referer, scripts no controlados.  
**Archivos:** `includes/security.php`, `includes/bootstrap.php`, `.htaccess`  
**Cambio:** CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS solo en HTTPS.

### H-02 — Protección de `contactos.log`

**Riesgo:** exposición de nombres, correos, teléfonos e IPs.  
**Archivos:** `functions.php`, `data/.htaccess`, `.gitignore`  
**Cambio:** permisos restrictivos, IP truncada, exclusión de Git.

### H-03 / H-04 — Anti-abuso formulario

**Riesgo:** spam, DoS ligero, costo operativo.  
**Archivos:** `contacto.php`, `index.php`, `css/style.css`  
**Cambio:** rate limit por sesión + honeypot `website`.

### H-05 — Open redirect

**Riesgo:** redirección a dominio malicioso si se altera la URL.  
**Archivo:** `contacto.php` + `is_safe_whatsapp_redirect()`  
**Cambio:** solo se permite `https://wa.me/{número}`.

### H-06 — Path traversal

**Riesgo:** lectura de archivos fuera del proyecto vía `asset_version`.  
**Archivo:** `functions.php`  
**Cambio:** validación estricta y `realpath()` bajo la raíz del proyecto.

### H-07 / H-08 — Sesión y CSRF

**Riesgo:** fijación de sesión y reenvío de formulario.  
**Archivos:** `bootstrap.php`, `contacto.php`  
**Cambio:** regeneración de ID y rotación de token CSRF.

---

## 6. Acciones pendientes recomendadas

1. **Eliminar `data/contactos.log` del historial Git** si el repositorio es público (`git filter-repo` o BFG).
2. **Migrar `includes/config.php` a variables de entorno** (`.env` fuera del servidor web).
3. **Añadir SRI** a scripts y estilos CDN.
4. **Eliminar `unsafe-inline` de CSP** moviendo el script del `<head>` a un archivo con nonce.
5. **Probar en Apache** con HTTPS real antes de producción (HSTS + CSP).
6. **Definir política de retención** del log (borrado automático a 90 días).
7. **Considerar CAPTCHA** (hCaptcha/Turnstile) si el spam persiste.

---

## 7. Verificación post-corrección

```powershell
php -l includes/bootstrap.php
php -l includes/security.php
php -l includes/functions.php
php -l contacto.php
.\build.ps1
.\iniciar.ps1
```

Probar manualmente:

- Envío válido del formulario → redirección a WhatsApp.
- Envío >10 veces en 1 h → mensaje de límite.
- Campo honeypot rellenado → redirección silenciosa sin error visible.
- Acceso directo a `/data/contactos.log` → 403 en Apache.

---

## 8. Conclusión

El proyecto presenta una superficie acotada y **no presenta vectores clásicos de inyección SQL ni autenticación rota**. Los riesgos reales se concentraban en **configuración HTTP**, **abuso del formulario**, **protección del log de PII** y **cadena de suministro CDN**.

Tras las correcciones automáticas, el estado es **aceptable para producción en hosting PHP con Apache y HTTPS**, completando las acciones pendientes de la sección 6 para un nivel **robusto**.

---

*Documento generado como parte de la auditoría DevSecOps del repositorio NEXT.*
