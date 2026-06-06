/**
 * Neblina blanca/gris — volutas orgánicas que suben y bajan (estilo referencia).
 */
(function (global) {
  'use strict';

  const DEFAULT_CONFIG = {
    canvasOpacity: 0.42,
    blobAlpha: 0.1,
    particleCount: 14,
    mobileParticleCount: 10,
    lowPowerParticleCount: 7,
    minRadius: 0.1,
    maxRadius: 0.28,
    speed: 0.3,
    verticalRangeMin: 0.14,
    verticalRangeMax: 0.28,
    swayRange: 0.055,
    colorBright: '255, 255, 255',
    colorMid: '226, 232, 240',
    colorSoft: '203, 213, 225',
    maxDeltaMs: 48,
    lowPowerFrameSkip: 1,
    mode: 'campfire',
  };

  function debounce(fn, wait) {
    let timer = null;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => fn(...args), wait);
    };
  }

  function readDataConfig(root) {
    const num = (key, fallback) => {
      const raw = root.dataset[key];
      if (raw === undefined || raw === '') return fallback;
      const parsed = parseFloat(raw);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    return {
      canvasOpacity: num('fogOpacity', DEFAULT_CONFIG.canvasOpacity),
      blobAlpha: num('fogBlobAlpha', DEFAULT_CONFIG.blobAlpha),
      speed: num('fogSpeed', DEFAULT_CONFIG.speed),
      particleCount: Math.round(num('fogDensity', DEFAULT_CONFIG.particleCount)),
      mode: root.dataset.fogMode || DEFAULT_CONFIG.mode,
    };
  }

  class AmbientFog {
    constructor(canvas, options = {}) {
      this.canvas = canvas;
      this.root = canvas.closest('.ambient-fog');
      this.ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
      this.config = { ...DEFAULT_CONFIG, ...options };
      this.blobs = [];
      this.running = false;
      this.paused = false;
      this.reducedMotion = false;
      this.lowPower = false;
      this.rafId = 0;
      this.lastTime = 0;
      this.frameIndex = 0;
      this.width = 0;
      this.height = 0;
      this.dpr = 1;
      this._onResize = debounce(() => this.resize(), 180);
      this._onVisibility = () => {
        if (document.hidden) this.pause();
        else this.resume();
      };
    }

    detectProfile() {
      const mobile = window.innerWidth < 768;
      this.lowPower = mobile || document.documentElement.classList.contains('perf-lite');
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    particleCount() {
      if (this.reducedMotion) return this.config.lowPowerParticleCount;
      if (this.lowPower) return this.config.lowPowerParticleCount;
      if (window.innerWidth < 1024) return this.config.mobileParticleCount;
      return this.config.particleCount;
    }

    resize() {
      if (!this.root) return;
      this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = this.root.getBoundingClientRect();
      this.width = Math.max(1, rect.width);
      this.height = Math.max(1, rect.height);
      this.canvas.width = Math.floor(this.width * this.dpr);
      this.canvas.height = Math.floor(this.height * this.dpr);
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
      if (this.ctx) {
        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
      }
    }

    createBlob(index, total) {
      const { width, height, config } = this;
      const minSide = Math.min(width, height);
      const span = config.maxRadius - config.minRadius;
      const radius = minSide * (config.minRadius + Math.random() * span);
      const spread = 0.08 + (index / Math.max(1, total - 1)) * 0.84;

      return {
        originX: width * (spread + (Math.random() - 0.5) * 0.1),
        originY: height * (0.74 + Math.random() * 0.22),
        radius,
        phase: Math.random() * Math.PI * 2,
        phaseSpeed: 0.00085 + Math.random() * 0.0012,
        swayPhase: Math.random() * Math.PI * 2,
        rotPhase: Math.random() * Math.PI * 2,
        verticalRange: height * (
          config.verticalRangeMin
          + Math.random() * (config.verticalRangeMax - config.verticalRangeMin)
        ),
        swayRange: width * (config.swayRange * (0.65 + Math.random() * 0.7)),
        layer: Math.random(),
        stretch: 1.2 + Math.random() * 1.4,
      };
    }

    initBlobs() {
      const count = this.particleCount();
      this.blobs = Array.from({ length: count }, (_, i) => this.createBlob(i, count));
    }

    update(dt) {
      for (const blob of this.blobs) {
        blob.phase += blob.phaseSpeed * dt * this.config.speed;
        blob.swayPhase += blob.phaseSpeed * 0.7 * dt;
        blob.rotPhase += blob.phaseSpeed * 0.45 * dt;
      }
    }

    /**
     * Voluta alargada (filamento de humo).
     */
    drawWisp(x, y, radius, alpha, rgbBright, rgbMid, angle, scaleX, scaleY) {
      const { ctx } = this;
      const [br, bg, bb] = rgbBright;
      const [mr, mg, mb] = rgbMid;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.scale(scaleX, scaleY);

      const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      grad.addColorStop(0, `rgba(${br},${bg},${bb},${alpha})`);
      grad.addColorStop(0.32, `rgba(${mr},${mg},${mb},${alpha * 0.55})`);
      grad.addColorStop(0.68, `rgba(${mr},${mg},${mb},${alpha * 0.14})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');

      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    drawBaseMist() {
      const { ctx, width, height, config } = this;
      const [sr, sg, sb] = config.colorSoft.split(',').map((v) => parseInt(v.trim(), 10));
      const grad = ctx.createLinearGradient(0, height * 0.45, 0, height);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.55, `rgba(${sr},${sg},${sb},0.04)`);
      grad.addColorStop(1, `rgba(255,255,255,0.08)`);
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = grad;
      ctx.fillRect(0, height * 0.4, width, height * 0.6);
    }

    draw() {
      if (!this.ctx) return;
      const { ctx, width, height, config } = this;

      ctx.clearRect(0, 0, width, height);
      this.drawBaseMist();

      const base = this.reducedMotion ? config.blobAlpha * 0.55 : config.blobAlpha;
      const rgbBright = config.colorBright.split(',').map((v) => parseInt(v.trim(), 10));
      const rgbMid = config.colorMid.split(',').map((v) => parseInt(v.trim(), 10));

      for (const blob of this.blobs) {
        const rise = Math.sin(blob.phase);
        const x = blob.originX + Math.sin(blob.swayPhase) * blob.swayRange;
        const y = blob.originY - rise * blob.verticalRange;
        const lift = Math.max(0, -rise);
        const alpha = base * (0.55 + Math.abs(rise) * 0.65) * (0.75 + blob.layer * 0.35);
        const r = blob.radius * (0.85 + lift * 0.2);
        const angle = blob.rotPhase + Math.sin(blob.swayPhase) * 0.6;

        this.drawWisp(x, y, r, alpha, rgbBright, rgbMid, angle, blob.stretch, 0.42);
        this.drawWisp(
          x + Math.cos(blob.swayPhase) * r * 0.35,
          y - r * 0.12,
          r * 0.72,
          alpha * 0.65,
          rgbBright,
          rgbMid,
          angle + 0.9,
          0.85,
          0.55
        );
        this.drawWisp(
          x - Math.sin(blob.swayPhase) * r * 0.28,
          y + r * 0.08,
          r * 0.5,
          alpha * 0.4,
          rgbMid,
          rgbMid,
          angle - 0.7,
          1.1,
          0.35
        );
      }

      ctx.globalCompositeOperation = 'source-over';
    }

    loop(time) {
      if (!this.running || this.paused) return;

      const delta = this.lastTime ? Math.min(time - this.lastTime, this.config.maxDeltaMs) : 16;
      this.lastTime = time;
      this.frameIndex += 1;

      const shouldRender =
        !this.reducedMotion
        && (!this.lowPower || this.frameIndex % this.config.lowPowerFrameSkip === 0);

      if (shouldRender) {
        this.update(delta);
        this.draw();
      } else if (this.reducedMotion) {
        this.draw();
      }

      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    start() {
      if (this.running || !this.ctx) return;

      this.detectProfile();
      this.resize();
      this.initBlobs();
      this.draw();

      if (this.reducedMotion) {
        this.root?.classList.add('ambient-fog--reduced');
        return;
      }

      this.running = true;
      this.lastTime = 0;
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    pause() {
      if (this.paused) return;
      this.paused = true;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.root?.classList.add('ambient-fog--paused');
    }

    resume() {
      if (!this.running || !this.paused) return;
      this.paused = false;
      this.lastTime = 0;
      this.root?.classList.remove('ambient-fog--paused');
      this.rafId = requestAnimationFrame((t) => this.loop(t));
    }

    destroy() {
      this.running = false;
      this.paused = false;
      if (this.rafId) cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      this.blobs = [];
      window.removeEventListener('resize', this._onResize);
      document.removeEventListener('visibilitychange', this._onVisibility);
    }

    bindEvents() {
      window.addEventListener('resize', this._onResize, { passive: true });
      document.addEventListener('visibilitychange', this._onVisibility);
    }

    setConfig(next) {
      this.config = { ...this.config, ...next };
      if (this.root && next.canvasOpacity !== undefined) {
        this.root.style.setProperty('--fog-canvas-opacity', String(next.canvasOpacity));
      }
      this.initBlobs();
      this.draw();
    }
  }

  function initAmbientFog() {
    const root = document.getElementById('ambientFog');
    const canvas = document.getElementById('ambientFogCanvas');
    if (!root || !canvas) return null;

    const dataConfig = readDataConfig(root);
    if (dataConfig.canvasOpacity !== undefined) {
      root.style.setProperty('--fog-canvas-opacity', String(dataConfig.canvasOpacity));
    }

    const fog = new AmbientFog(canvas, dataConfig);
    fog.bindEvents();
    fog.start();

    global.__ambientFog = fog;
    return fog;
  }

  global.AmbientFog = AmbientFog;
  global.initAmbientFog = initAmbientFog;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAmbientFog);
  } else {
    initAmbientFog();
  }
})(typeof window !== 'undefined' ? window : globalThis);
