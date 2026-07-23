/**
 * Gradient Blinds — vanilla port of React Bits
 * https://reactbits.dev/backgrounds/gradient-blinds
 * Uses OGL (WebGL). Place in a full-size container.
 */
import { Renderer, Program, Mesh, Triangle } from 'https://cdn.jsdelivr.net/npm/ogl@1.0.11/+esm';

const MAX_COLORS = 8;

function hexToRGB(hex) {
  const c = hex.replace('#', '').padEnd(6, '0');
  return [
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255,
  ];
}

function prepStops(stops) {
  const base = (stops && stops.length ? stops : ['#0a3040', '#1ecad3']).slice(0, MAX_COLORS);
  if (base.length === 1) base.push(base[0]);
  while (base.length < MAX_COLORS) base.push(base[base.length - 1]);
  const arr = [];
  for (let i = 0; i < MAX_COLORS; i += 1) arr.push(hexToRGB(base[i]));
  const count = Math.max(2, Math.min(MAX_COLORS, stops?.length ?? 2));
  return { arr, count };
}

const VERTEX = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT = `
#ifdef GL_ES
precision mediump float;
#endif

uniform vec3 iResolution;
uniform vec2 iMouse;
uniform float iTime;
uniform float uAngle;
uniform float uNoise;
uniform float uBlindCount;
uniform float uSpotlightRadius;
uniform float uSpotlightSoftness;
uniform float uSpotlightOpacity;
uniform float uMirror;
uniform float uDistort;
uniform float uShineFlip;
uniform vec3 uColor0;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uColor4;
uniform vec3 uColor5;
uniform vec3 uColor6;
uniform vec3 uColor7;
uniform int uColorCount;
varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co, vec2(12.9898,78.233))) * 43758.5453);
}

vec2 rotate2D(vec2 p, float a){
  float c = cos(a);
  float s = sin(a);
  return mat2(c, -s, s, c) * p;
}

vec3 getGradientColor(float t){
  float tt = clamp(t, 0.0, 1.0);
  int count = uColorCount;
  if (count < 2) count = 2;
  float scaled = tt * float(count - 1);
  float seg = floor(scaled);
  float f = fract(scaled);
  if (seg < 1.0) return mix(uColor0, uColor1, f);
  if (seg < 2.0 && count > 2) return mix(uColor1, uColor2, f);
  if (seg < 3.0 && count > 3) return mix(uColor2, uColor3, f);
  if (seg < 4.0 && count > 4) return mix(uColor3, uColor4, f);
  if (seg < 5.0 && count > 5) return mix(uColor4, uColor5, f);
  if (seg < 6.0 && count > 6) return mix(uColor5, uColor6, f);
  if (seg < 7.0 && count > 7) return mix(uColor6, uColor7, f);
  if (count > 7) return uColor7;
  if (count > 6) return uColor6;
  if (count > 5) return uColor5;
  if (count > 4) return uColor4;
  if (count > 3) return uColor3;
  if (count > 2) return uColor2;
  return uColor1;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 uv0 = fragCoord.xy / iResolution.xy;
  float aspect = iResolution.x / iResolution.y;
  vec2 p = uv0 * 2.0 - 1.0;
  p.x *= aspect;
  vec2 pr = rotate2D(p, uAngle);
  pr.x /= aspect;
  vec2 uv = pr * 0.5 + 0.5;

  vec2 uvMod = uv;
  if (uDistort > 0.0) {
    float a = uvMod.y * 6.0;
    float b = uvMod.x * 6.0;
    float w = 0.01 * uDistort;
    uvMod.x += sin(a) * w;
    uvMod.y += cos(b) * w;
  }
  float t = uvMod.x;
  if (uMirror > 0.5) {
    t = 1.0 - abs(1.0 - 2.0 * fract(t));
  }
  vec3 base = getGradientColor(t);

  vec2 offset = vec2(iMouse.x / iResolution.x, iMouse.y / iResolution.y);
  float d = length(uv0 - offset);
  float r = max(uSpotlightRadius, 1e-4);
  float dn = d / r;
  float spot = (1.0 - 2.0 * pow(dn, uSpotlightSoftness)) * uSpotlightOpacity;
  vec3 cir = vec3(spot);
  float stripe = fract(uvMod.x * max(uBlindCount, 1.0));
  if (uShineFlip > 0.5) stripe = 1.0 - stripe;

  vec3 col = cir + base - vec3(stripe);
  col += (rand(gl_FragCoord.xy + iTime) - 0.5) * uNoise;
  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color;
  mainImage(color, vUv * iResolution.xy);
  gl_FragColor = color;
}
`;

/**
 * @param {HTMLElement} container
 * @param {object} [options]
 * @returns {{ destroy: () => void, setPaused: (v: boolean) => void } | null}
 */
export function initGradientBlinds(container, options = {}) {
  if (!container) return null;

  const {
    dpr = Math.min(window.devicePixelRatio || 1, 1.75),
    gradientColors = ['#061018', '#0a4a55', '#129aa2', '#1ecad3'],
    angle = 18,
    noise = 0.22,
    blindCount = 14,
    blindMinWidth = 70,
    mouseDampening = 0.18,
    mirrorGradient = false,
    spotlightRadius = 0.55,
    spotlightSoftness = 1.1,
    spotlightOpacity = 0.75,
    distortAmount = 0.4,
    shineDirection = 'left',
    mixBlendMode = 'lighten',
  } = options;

  let paused = Boolean(options.paused);
  let rafId = 0;
  let lastTime = 0;
  let firstResize = true;
  const mouseTarget = [0, 0];

  const renderer = new Renderer({ dpr, alpha: true, antialias: true });
  const gl = renderer.gl;
  const canvas = gl.canvas;
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.display = 'block';
  canvas.style.pointerEvents = 'none';
  canvas.setAttribute('aria-hidden', 'true');
  container.appendChild(canvas);
  if (mixBlendMode) container.style.mixBlendMode = mixBlendMode;

  const { arr: colorArr, count: colorCount } = prepStops(gradientColors);
  const uniforms = {
    iResolution: { value: [gl.drawingBufferWidth, gl.drawingBufferHeight, 1] },
    iMouse: { value: [0, 0] },
    iTime: { value: 0 },
    uAngle: { value: (angle * Math.PI) / 180 },
    uNoise: { value: noise },
    uBlindCount: { value: Math.max(1, blindCount) },
    uSpotlightRadius: { value: spotlightRadius },
    uSpotlightSoftness: { value: spotlightSoftness },
    uSpotlightOpacity: { value: spotlightOpacity },
    uMirror: { value: mirrorGradient ? 1 : 0 },
    uDistort: { value: distortAmount },
    uShineFlip: { value: shineDirection === 'right' ? 1 : 0 },
    uColor0: { value: colorArr[0] },
    uColor1: { value: colorArr[1] },
    uColor2: { value: colorArr[2] },
    uColor3: { value: colorArr[3] },
    uColor4: { value: colorArr[4] },
    uColor5: { value: colorArr[5] },
    uColor6: { value: colorArr[6] },
    uColor7: { value: colorArr[7] },
    uColorCount: { value: colorCount },
  };

  const program = new Program(gl, { vertex: VERTEX, fragment: FRAGMENT, uniforms });
  const geometry = new Triangle(gl);
  const mesh = new Mesh(gl, { geometry, program });

  const resize = () => {
    const rect = container.getBoundingClientRect();
    const w = Math.max(1, rect.width);
    const h = Math.max(1, rect.height);
    renderer.setSize(w, h);
    uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1];

    if (blindMinWidth > 0) {
      const maxByMinWidth = Math.max(1, Math.floor(w / blindMinWidth));
      uniforms.uBlindCount.value = Math.max(1, Math.min(blindCount, maxByMinWidth));
    } else {
      uniforms.uBlindCount.value = Math.max(1, blindCount);
    }

    if (firstResize) {
      firstResize = false;
      const cx = gl.drawingBufferWidth / 2;
      const cy = gl.drawingBufferHeight / 2;
      uniforms.iMouse.value = [cx, cy];
      mouseTarget[0] = cx;
      mouseTarget[1] = cy;
    }
  };

  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const onPointerMove = (e) => {
    const rect = container.getBoundingClientRect();
    const scale = renderer.dpr || 1;
    const x = (e.clientX - rect.left) * scale;
    const y = (rect.height - (e.clientY - rect.top)) * scale;
    mouseTarget[0] = x;
    mouseTarget[1] = y;
    if (mouseDampening <= 0) {
      uniforms.iMouse.value = [x, y];
    }
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const loop = (t) => {
    rafId = requestAnimationFrame(loop);
    uniforms.iTime.value = t * 0.001;

    if (mouseDampening > 0) {
      if (!lastTime) lastTime = t;
      const dt = (t - lastTime) / 1000;
      lastTime = t;
      const tau = Math.max(1e-4, mouseDampening);
      let factor = 1 - Math.exp(-dt / tau);
      if (factor > 1) factor = 1;
      const cur = uniforms.iMouse.value;
      cur[0] += (mouseTarget[0] - cur[0]) * factor;
      cur[1] += (mouseTarget[1] - cur[1]) * factor;
    } else {
      lastTime = t;
    }

    if (!paused) {
      try {
        renderer.render({ scene: mesh });
      } catch (err) {
        console.error('[GradientBlinds]', err);
      }
    }
  };
  rafId = requestAnimationFrame(loop);

  return {
    setPaused(value) {
      paused = Boolean(value);
    },
    destroy() {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      ro.disconnect();
      if (canvas.parentElement === container) container.removeChild(canvas);
      try {
        geometry.remove?.();
        program.remove?.();
        renderer.destroy?.();
      } catch {
        /* ignore */
      }
    },
  };
}

function boot() {
  const el = document.getElementById('heroBlinds');
  if (!el) return;

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  if (reduced) {
    el.classList.add('gradient-blinds--static');
    return;
  }

  const instance = initGradientBlinds(el, {
    paused: false,
    dpr: coarse ? 1 : Math.min(window.devicePixelRatio || 1, 1.75),
    blindCount: coarse ? 10 : 14,
    noise: 0.2,
    spotlightOpacity: 0.7,
  });
  if (!instance) return;

  const hero = el.closest('.hero') || el;
  const io = new IntersectionObserver(
    ([entry]) => instance.setPaused(!entry.isIntersecting),
    { threshold: 0.05 }
  );
  io.observe(hero);

  document.addEventListener('visibilitychange', () => {
    instance.setPaused(document.hidden);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
