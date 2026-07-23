/**
 * Genera /public para Vercel (sin PHP en el hosting).
 * Convierte index.php → index.html y copia assets estáticos.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const publicDir = path.join(root, 'public');
const config = JSON.parse(fs.readFileSync(path.join(root, 'site.config.json'), 'utf8'));

function escHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function assetVersion(relativePath) {
  const full = path.join(root, relativePath.replace(/\//g, path.sep));
  try {
    return String(Math.floor(fs.statSync(full).mtimeMs));
  } catch {
    return String(Date.now());
  }
}

function whatsappUrl(number, message = '') {
  const base = `https://wa.me/${String(number).replace(/\D/g, '')}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

function renderIndex() {
  let html = fs.readFileSync(path.join(root, 'index.php'), 'utf8');

  html = html.replace(/^<\?php require_once[^?]+\?>\s*/i, '');

  html = html.replace(
    /\s*<\?php if \(\$contactError\): \?>[\s\S]*?<\?php endif; \?>/,
    '\n            <p class="form-error" id="contactFormError" role="alert" hidden></p>'
  );

  html = html.replace(/action="contacto\.php"/g, 'action="/api/contact"');

  html = html.replace(
    /<input type="hidden" name="csrf_token" value="<\?=\s*htmlspecialchars\(\$_SESSION\['csrf_token'\][^>]+\?>\s*">/,
    '<input type="hidden" name="csrf_token" id="csrfTokenField" value="">'
  );

  html = html.replace(/<\?=\s*asset_version\('([^']+)'\)\s*\?>/g, (_, assetPath) => assetVersion(assetPath));

  const waUrl = whatsappUrl(config.whatsappNumber);
  const waFloatUrl = whatsappUrl(config.whatsappNumber, config.whatsappFloatMessage);

  const replacements = [
    [/<\?=\s*htmlspecialchars\(MAPS_LINK[^)]+\)\s*\?>/g, escHtml(config.mapsLink)],
    [/<\?=\s*htmlspecialchars\(ADDRESS[^)]+\)\s*\?>/g, escHtml(config.address)],
    [/<\?=\s*htmlspecialchars\(CONTACT_EMAIL[^)]+\)\s*\?>/g, escHtml(config.contactEmail)],
    [/<\?=\s*htmlspecialchars\(FACEBOOK_URL[^)]+\)\s*\?>/g, escHtml(config.facebookUrl)],
    [/<\?=\s*htmlspecialchars\(INSTAGRAM_URL[^)]+\)\s*\?>/g, escHtml(config.instagramUrl)],
    [/<\?=\s*htmlspecialchars\(\$waUrl[^)]+\)\s*\?>/g, escHtml(waUrl)],
    [/<\?=\s*htmlspecialchars\(\$waFloatUrl[^)]+\)\s*\?>/g, escHtml(waFloatUrl)],
    [/<\?=\s*htmlspecialchars\(WHATSAPP_DISPLAY[^)]+\)\s*\?>/g, escHtml(config.whatsappDisplay)],
    [/<\?=\s*htmlspecialchars\(MAPS_EMBED[^)]+\)\s*\?>/g, escHtml(config.mapsEmbed)],
  ];

  for (const [pattern, value] of replacements) {
    html = html.replace(pattern, value);
  }

  if (html.includes('<?')) {
    console.warn('[build-vercel] Aviso: quedan etiquetas PHP sin convertir. Revisa index.php.');
  }

  return html;
}

function copyDir(name) {
  const src = path.join(root, name);
  const dest = path.join(publicDir, name);
  if (!fs.existsSync(src)) return;
  fs.cpSync(src, dest, { recursive: true });
}

if (fs.existsSync(publicDir)) {
  fs.rmSync(publicDir, { recursive: true, force: true });
}
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'index.html'), renderIndex(), 'utf8');

const indexRedirect = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0;url=/">
  <title>Redirigiendo...</title>
  <script>location.replace('/');</script>
</head>
<body><p><a href="/">Ir al sitio</a></p></body>
</html>`;

for (const dir of ['css', 'js', 'images', 'models']) {
  copyDir(dir);
}

console.log('Build Vercel listo → public/');
console.log('  - index.html generado desde index.php');
console.log('  - assets: css/, js/, images/');
