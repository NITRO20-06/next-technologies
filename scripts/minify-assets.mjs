/**
 * Minifica JS y CSS antes del build de Vercel (equivalente a build.ps1).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { minify as minifyJs } from 'terser';
import CleanCSS from 'clean-css';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

async function minifyJavaScript() {
  const files = ['js/main.js'].map((f) => path.join(root, f));
  const combined = files.map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  const result = await minifyJs(combined, {
    compress: true,
    mangle: true,
    format: { comments: false },
  });

  if (!result.code) {
    throw new Error('Terser no devolvió código minificado');
  }

  fs.writeFileSync(path.join(root, 'js/app.min.js'), result.code, 'utf8');
  console.log('  - js/app.min.js');
}

function minifyStyles() {
  const inputs = ['css/style.css'].map((f) =>
    fs.readFileSync(path.join(root, f), 'utf8')
  );
  const output = new CleanCSS({ level: 2 }).minify(inputs.join('\n'));
  if (output.errors?.length) {
    throw new Error(output.errors.join('; '));
  }
  fs.writeFileSync(path.join(root, 'css/app.min.css'), output.styles, 'utf8');
  console.log('  - css/app.min.css');
}

console.log('Minificando assets...');
await minifyJavaScript();
minifyStyles();
console.log('Assets minificados.');
