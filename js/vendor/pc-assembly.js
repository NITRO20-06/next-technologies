/**
 * NEXT TECHNOLOGIES — Hero PC Assembly (Three.js + Anime.js)
 * Ensamblaje cinematico pieza a pieza, vista lateral abierta.
 * Animaciones de piezas: Anime.js (https://animejs.com)
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** Anime.js v3 global (CDN). Fallback no-op if missing. */
function getAnime() {
  return typeof window !== 'undefined' ? window.anime : null;
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Shared local +Z axis for fan rotors (avoid allocating per frame) */
const _fanSpinAxis = new THREE.Vector3(0, 0, 1);

function M(color, o = {}) {
  const transparent = !!o.op;
  return new THREE.MeshStandardMaterial({
    color,
    metalness: o.metal ?? 0.6,
    roughness: o.rough ?? 0.32,
    emissive: o.em ?? 0x000000,
    emissiveIntensity: o.ei ?? 0,
    transparent,
    opacity: o.op ?? 1,
    // Transparent stacks without depthWrite cause less z-flicker when overlapping
    depthWrite: transparent ? false : true,
    side: o.side ?? THREE.FrontSide,
    polygonOffset: !!o.po,
    polygonOffsetFactor: o.po ?? 0,
    polygonOffsetUnits: o.po ?? 0,
  });
}

function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function cyl(rt, rb, h, seg, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat);
  m.position.set(x, y, z);
  m.castShadow = true;
  return m;
}

function texLabel(lines, opt = {}) {
  const c = document.createElement('canvas');
  c.width = opt.w || 512;
  c.height = opt.h || 192;
  const g = c.getContext('2d');
  g.fillStyle = opt.bg || '#0b1018';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = opt.border || '#1ecad3';
  g.lineWidth = 5;
  g.strokeRect(6, 6, c.width - 12, c.height - 12);
  g.fillStyle = opt.color || '#e8f7fa';
  g.font = `bold ${opt.size || 44}px Arial, sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const gap = opt.gap || 46;
  const y0 = c.height / 2 - ((lines.length - 1) * gap) / 2;
  lines.forEach((t, i) => g.fillText(t, c.width / 2, y0 + i * gap));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function makeMoboTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1152;
  const g = c.getContext('2d');
  const W = c.width;
  const H = c.height;

  // Dark PCB base (ROG-like near-black with purple cast)
  const base = g.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#0c0814');
  base.addColorStop(0.45, '#120a1c');
  base.addColorStop(1, '#0a0610');
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  // Fine weave / fiberglass noise
  for (let i = 0; i < 9000; i += 1) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    g.fillStyle = `rgba(${20 + Math.random() * 40},${10 + Math.random() * 20},${30 + Math.random() * 50},${0.04 + Math.random() * 0.06})`;
    g.fillRect(x, y, 1.2, 1.2);
  }

  // Dense PCB traces
  const drawTrace = (x0, y0, x1, y1, color, w = 2) => {
    g.strokeStyle = color;
    g.lineWidth = w;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(x0, y0);
    const mx = (x0 + x1) / 2 + (Math.random() - 0.5) * 40;
    const my = (y0 + y1) / 2 + (Math.random() - 0.5) * 40;
    g.quadraticCurveTo(mx, my, x1, y1);
    g.stroke();
  };
  for (let i = 0; i < 70; i += 1) {
    const gold = i % 4 === 0;
    drawTrace(
      40 + Math.random() * (W - 80),
      40 + Math.random() * (H - 80),
      40 + Math.random() * (W - 80),
      40 + Math.random() * (H - 80),
      gold ? 'rgba(201,162,39,0.45)' : 'rgba(26,92,255,0.35)',
      gold ? 2.2 : 1.4
    );
  }

  // Grid vias
  g.fillStyle = 'rgba(180,160,80,0.55)';
  for (let row = 0; row < 28; row += 1) {
    for (let col = 0; col < 24; col += 1) {
      if ((row + col) % 3 !== 0) continue;
      g.beginPath();
      g.arc(60 + col * 38, 50 + row * 38, 1.6, 0, Math.PI * 2);
      g.fill();
    }
  }

  // CPU socket silkscreen area
  g.fillStyle = '#1a1a1a';
  g.fillRect(90, 70, 300, 300);
  g.strokeStyle = '#555';
  g.lineWidth = 3;
  g.strokeRect(90, 70, 300, 300);
  g.fillStyle = '#0e0e0e';
  g.fillRect(115, 95, 250, 250);
  // LGA pad grid
  g.fillStyle = '#c9a227';
  for (let r = 0; r < 14; r += 1) {
    for (let c2 = 0; c2 < 14; c2 += 1) {
      g.fillRect(125 + c2 * 17, 105 + r * 17, 10, 10);
    }
  }
  g.fillStyle = '#8a929c';
  g.font = 'bold 22px Arial, sans-serif';
  g.fillText('LGA 1851', 175, 380);

  // DIMM silkscreen
  for (let i = 0; i < 4; i += 1) {
    const x = 430 + i * 115;
    g.fillStyle = i % 2 ? '#0d1a3a' : '#1a1a22';
    g.fillRect(x, 160, 95, 460);
    g.strokeStyle = i % 2 ? '#1a5cff' : '#444';
    g.lineWidth = 3;
    g.strokeRect(x, 160, 95, 460);
    g.fillStyle = '#c0c8d0';
    g.font = 'bold 16px Arial, sans-serif';
    g.save();
    g.translate(x + 48, 390);
    g.rotate(-Math.PI / 2);
    g.fillText(`DIMM_A${i + 1}`, 0, 0);
    g.restore();
  }

  // PCIe silkscreen
  const pcieYs = [720, 820, 900];
  const pcieLens = [720, 480, 360];
  pcieYs.forEach((y, i) => {
    g.fillStyle = i === 0 ? '#0a1840' : '#151515';
    g.fillRect(80, y, pcieLens[i], 42);
    g.strokeStyle = i === 0 ? '#1a5cff' : '#333';
    g.lineWidth = 2;
    g.strokeRect(80, y, pcieLens[i], 42);
    g.fillStyle = '#8899aa';
    g.font = '14px Arial, sans-serif';
    g.fillText(i === 0 ? 'PCIEX16_1' : `PCIEX${i === 1 ? '8' : '4'}_${i + 1}`, 90, y + 28);
  });

  // Chipset zone
  g.fillStyle = '#111820';
  g.fillRect(520, 700, 200, 180);
  g.strokeStyle = '#9945ff';
  g.lineWidth = 2;
  g.strokeRect(520, 700, 200, 180);
  g.fillStyle = '#c9b6ff';
  g.font = 'bold 28px Arial, sans-serif';
  g.fillText('ROG', 575, 790);
  g.font = '16px Arial, sans-serif';
  g.fillText('CHIPSET', 565, 820);

  // M.2 silkscreen
  g.fillStyle = '#0d3d2a';
  g.fillRect(160, 980, 420, 90);
  g.strokeStyle = '#1ecad3';
  g.strokeRect(160, 980, 420, 90);
  g.fillStyle = '#1ecad3';
  g.font = 'bold 18px Arial, sans-serif';
  g.fillText('M.2_1 · PCIe 5.0', 280, 1035);

  // I/O silkscreen edge
  g.fillStyle = '#2a3038';
  g.fillRect(20, 40, 45, 520);
  g.fillStyle = '#1ecad3';
  g.font = '12px Arial, sans-serif';
  g.save();
  g.translate(42, 280);
  g.rotate(-Math.PI / 2);
  g.fillText('I/O BACKPLATE', 0, 0);
  g.restore();

  // Branding
  g.fillStyle = 'rgba(255,75,232,0.85)';
  g.font = 'bold 36px Arial, sans-serif';
  g.fillText('ROG STRIX', 70, 1120);
  g.fillStyle = 'rgba(30,202,211,0.7)';
  g.font = '18px Arial, sans-serif';
  g.fillText('Z890-E GAMING WIFI', 280, 1120);

  // Mounting holes
  [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50], [50, H / 2], [W - 50, H / 2]].forEach(([x, y]) => {
    g.fillStyle = '#050508';
    g.beginPath();
    g.arc(x, y, 14, 0, Math.PI * 2);
    g.fill();
    g.strokeStyle = '#666';
    g.lineWidth = 2;
    g.stroke();
  });

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

function makeBrushedMetalTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const g = c.getContext('2d');
  g.fillStyle = '#12161c';
  g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 256; i += 1) {
    const a = 0.03 + Math.random() * 0.06;
    g.strokeStyle = `rgba(180,200,220,${a})`;
    g.beginPath();
    g.moveTo(0, i * 2);
    g.lineTo(512, i * 2 + (Math.random() - 0.5) * 3);
    g.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeHandleTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 96;
  const g = c.getContext('2d');
  g.fillStyle = '#1a1e24';
  g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#8a929c';
  g.font = 'bold 28px Arial, sans-serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('REPUBLIC OF GAMERS', 256, 48);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeFan(r = 0.2, depth = 0.045, rgb = true) {
  const g = new THREE.Group();
  const frameMat = M(0x121820, { metal: 0.75, rough: 0.35 });
  const t = r * 0.12; // frame rail thickness

  // Hollow square frame (4 rails) — solid box hid the blades before
  g.add(box(r * 2.15, t, depth, frameMat, 0, r * 1.02, 0));
  g.add(box(r * 2.15, t, depth, frameMat, 0, -r * 1.02, 0));
  g.add(box(t, r * 2.15 - t * 2, depth, frameMat, r * 1.02, 0, 0));
  g.add(box(t, r * 2.15 - t * 2, depth, frameMat, -r * 1.02, 0, 0));

  // Thin rear grille (behind blades, does not cover them)
  g.add(box(r * 1.7, r * 1.7, depth * 0.15, M(0x0c1016, { metal: 0.7, rough: 0.45 }), 0, 0, -depth * 0.35));

  // chrome outer ring — torus default faces +Z (fan forward)
  const chromeRing = new THREE.Mesh(
    new THREE.TorusGeometry(r * 1.02, 0.012, 10, 48),
    M(0xe8eef5, { metal: 0.98, rough: 0.08 })
  );
  chromeRing.position.z = depth * 0.42;
  g.add(chromeRing);

  // corner mounts
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    const mount = cyl(0.018, 0.018, depth * 1.1, 10, M(0x2a3340, { metal: 0.9 }), sx * r * 0.92, sy * r * 0.92, 0);
    mount.rotation.x = Math.PI / 2;
    g.add(mount);
  });

  // Spinner: hub + blades share one group — spins around local +Z (fan axis)
  const rotor = new THREE.Group();
  rotor.position.z = depth * 0.08;

  const hub = cyl(r * 0.2, r * 0.2, depth * 0.9, 24, M(0x1a2430, { metal: 0.85, rough: 0.2 }));
  hub.rotation.x = Math.PI / 2;
  rotor.add(hub);

  // Opaque blades — any transparency here causes scene-wide sorting flicker
  const bMatA = M(0xc5d0dc, {
    metal: 0.35,
    rough: 0.38,
    em: rgb ? 0x1ecad3 : 0x000000,
    ei: rgb ? 0.2 : 0,
  });
  const bMatB = M(0x7a8896, {
    metal: 0.4,
    rough: 0.42,
    em: rgb ? 0x9945ff : 0x000000,
    ei: rgb ? 0.15 : 0,
  });
  for (let i = 0; i < 7; i += 1) {
    const bMat = i % 2 ? bMatB : bMatA;
    const blade = box(r * 0.16, r * 0.82, depth * 0.18, bMat, 0, r * 0.38, 0);
    blade.rotation.z = 0.22;
    blade.rotation.y = 0.42;
    blade.castShadow = false;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 7) * Math.PI * 2;
    pivot.add(blade);
    rotor.add(pivot);
  }
  g.add(rotor);

  g.userData.isFan = true;
  g.userData.blades = rotor;
  g.userData.rotor = rotor;
  g.userData.spinDir = 1;
  g.userData.spinAxis = _fanSpinAxis;

  // Only the RGB ring animates — not blade materials (avoids flicker)
  const rgbParts = [];
  if (rgb) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.95, 0.016, 12, 48),
      M(0x1ecad3, { metal: 0.2, rough: 0.25, em: 0x1ecad3, ei: 1.55 })
    );
    ring.position.z = depth * 0.45;
    g.add(ring);
    rgbParts.push(ring.material);
  }
  g.userData.rgbParts = rgbParts;
  return g;
}

/**
 * DDR5 stick — vertical in the DIMM slot (thin X, long Y, tall Z above PCB).
 * @param {number} index slot index 0–3 (for RGB hue offset / label)
 */
function makeRam(index = 0) {
  const g = new THREE.Group();
  // PCB: thin in X (slot pitch), long in Y, short body before heatspreader height in Z
  const pcb = box(0.014, 0.54, 0.32, M(0x0a4a32, { metal: 0.35, rough: 0.5 }), 0, 0, 0.12);
  g.add(pcb);

  // Dual-sided aluminum heatspreader (grooved)
  const spreaderMat = M(0x1c2430, { metal: 0.92, rough: 0.16 });
  const grooveMat = M(0x2a3340, { metal: 0.9, rough: 0.2 });
  [-1, 1].forEach((side) => {
    const plate = new THREE.Group();
    plate.add(box(0.01, 0.5, 0.28, spreaderMat, 0, 0, 0.14));
    for (let i = 0; i < 8; i += 1) {
      plate.add(box(0.012, 0.48, 0.012, grooveMat, 0.002 * side, 0, 0.04 + i * 0.032));
    }
    plate.position.x = side * 0.012;
    g.add(plate);
  });

  // Gold edge contacts — bottom edge into the slot (along Y, at z≈0)
  for (let i = 0; i < 16; i += 1) {
    g.add(
      box(0.008, 0.018, 0.055, M(0xd4af37, { metal: 0.96, rough: 0.12 }), 0, -0.24 + i * 0.032, 0.01)
    );
  }
  // Notch key (DDR5 position)
  g.add(box(0.02, 0.04, 0.04, M(0x0a4a32, { metal: 0.3 }), 0, 0.02, 0.005));

  // DRAM chips on outer face (+X toward open side)
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      g.add(
        box(0.006, 0.048, 0.032, M(0x111111, { metal: 0.35, rough: 0.45 }), 0.02, -0.16 + col * 0.1, 0.1 + row * 0.12)
      );
    }
  }

  // Top RGB light bar
  const rgb = box(
    0.022,
    0.52,
    0.028,
    M(0xff2bd6, { metal: 0.12, rough: 0.28, em: 0xff2bd6, ei: 1.55 }),
    0,
    0,
    0.32
  );
  g.add(rgb);

  // Side accent strip
  const accent = box(
    0.006,
    0.4,
    0.02,
    M(0x1ecad3, { metal: 0.2, rough: 0.3, em: 0x1ecad3, ei: 0.9 }),
    0.018,
    0,
    0.28
  );
  g.add(accent);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09, 0.028),
    new THREE.MeshBasicMaterial({
      map: texLabel([`DDR5 · ${8 + index * 8}GB`], {
        w: 220,
        h: 64,
        size: 26,
        color: '#1ecad3',
        border: '#ff2bd6',
        bg: '#0a0812',
      }),
      transparent: true,
    })
  );
  label.rotation.y = Math.PI / 2;
  label.position.set(0.024, 0, 0.18);
  g.add(label);

  // Retention clip notches at ends (visual)
  g.add(box(0.016, 0.03, 0.04, M(0x2a3340, { metal: 0.85 }), 0, 0.28, 0.02));
  g.add(box(0.016, 0.03, 0.04, M(0x2a3340, { metal: 0.85 }), 0, -0.28, 0.02));

  g.userData.rgbParts = [rgb.material, accent.material];
  g.userData.slotIndex = index;
  return g;
}

function makeGpu(gpuTexture) {
  const g = new THREE.Group();
  const rgbParts = [];

  // Dual-slot proportions — shorter in Y so it clears DIMM bank above
  const H = 0.48;

  // PCB (edge seats into PCIe; body parallel to motherboard)
  g.add(box(1.52, H - 0.04, 0.03, M(0x0b3d2a, { metal: 0.45, rough: 0.45 }), 0, 0, -0.02));

  // Shroud / cooler body extending forward (+Z) from the board
  g.add(box(1.56, H, 0.24, M(0x0e141c, { metal: 0.8, rough: 0.25 }), 0, 0, 0.12));

  // Backplate (toward motherboard)
  g.add(box(1.58, H + 0.02, 0.016, M(0x151c28, { metal: 0.92, rough: 0.15 }), 0, 0, -0.045));

  const fans = [];
  const fanPositions = [-0.48, 0, 0.48];

  // Fans on the open face (+Z)
  fanPositions.forEach((x, i) => {
    const f = makeFan(0.175, 0.036, true);
    f.position.set(x, 0.01, 0.265);
    f.userData.spinDir = i % 2 ? -1 : 1;
    f.renderOrder = 2;
    if (f.userData.rotor) f.userData.rotor.renderOrder = 3;
    g.add(f);
    fans.push(f);
  });

  if (gpuTexture) {
    const img = gpuTexture.image;
    const c = document.createElement('canvas');
    c.width = img?.width || 1024;
    c.height = img?.height || 512;
    const ctx = c.getContext('2d');
    if (img) ctx.drawImage(img, 0, 0, c.width, c.height);
    else {
      ctx.fillStyle = '#0e141c';
      ctx.fillRect(0, 0, c.width, c.height);
    }
    const cy = c.height * 0.52;
    const rs = c.height * 0.28;
    [0.2, 0.5, 0.8].forEach((nx) => {
      ctx.save();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(c.width * nx, cy, rs, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
    const punched = new THREE.CanvasTexture(c);
    punched.colorSpace = THREE.SRGBColorSpace;
    punched.anisotropy = 8;

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(1.48, H - 0.04),
      new THREE.MeshStandardMaterial({
        map: punched,
        metalness: 0.15,
        roughness: 0.45,
        transparent: true,
        alphaTest: 0.2,
        depthWrite: true,
      })
    );
    face.position.set(0, 0.01, 0.26);
    g.add(face);

    fanPositions.forEach((x) => {
      const bezel = new THREE.Mesh(
        new THREE.TorusGeometry(0.175, 0.016, 14, 48),
        M(0x1ecad3, { metal: 0.35, rough: 0.2, em: 0x9945ff, ei: 1.35 })
      );
      bezel.position.set(x, 0.01, 0.268);
      g.add(bezel);
      rgbParts.push(bezel.material);
    });
  }

  // RGB top edge (along +Y of card — facing DIMMs but with clearance)
  const topBar = box(1.48, 0.028, 0.02, M(0x9945ff, { metal: 0.2, rough: 0.3, em: 0x9945ff, ei: 1.8 }), 0, H / 2 - 0.01, 0.2);
  g.add(topBar);
  rgbParts.push(topBar.material);

  const sideStrip = box(0.022, H - 0.08, 0.18, M(0x9945ff, { em: 0x9945ff, ei: 1.4 }), 0.78, 0, 0.1);
  g.add(sideStrip);
  rgbParts.push(sideStrip.material);

  // PCIe gold fingers — back edge (-Z) into the motherboard slot
  for (let i = 0; i < 28; i += 1) {
    g.add(box(0.036, 0.028, 0.055, M(0xd4af37, { metal: 0.96, rough: 0.12 }), -0.7 + i * 0.05, 0, -0.08));
  }

  // I/O bracket toward case rear-left
  g.add(box(0.04, H - 0.04, 0.14, M(0xb0b8c0, { metal: 0.9, rough: 0.25 }), -0.8, 0, 0.02));
  [-0.14, -0.04, 0.06, 0.16].forEach((y, i) => {
    g.add(box(0.05, 0.045, 0.035, M(i === 3 ? 0x1a1a1a : 0x222222, { metal: 0.4 }), -0.82, y, 0.04));
  });

  // 12VHPWR on the end opposite bracket
  g.add(box(0.2, 0.09, 0.12, M(0x1a1a1a, { metal: 0.5, rough: 0.4 }), 0.62, -0.02, -0.02));
  g.add(box(0.16, 0.055, 0.07, M(0x333333, { metal: 0.6 }), 0.62, -0.02, -0.1));
  for (let i = 0; i < 6; i += 1) {
    g.add(box(0.02, 0.016, 0.018, M(0xd4af37, { metal: 0.9 }), 0.54 + i * 0.026, -0.02, -0.12));
  }

  // Side aluminum fin stack (exhaust)
  const alum = M(0xb8c0c8, { metal: 0.96, rough: 0.18 });
  const alumDark = M(0x8a949e, { metal: 0.94, rough: 0.22 });
  const copper = M(0xb87333, { metal: 0.92, rough: 0.28 });

  g.add(box(1.45, H - 0.08, 0.012, M(0xc5cdd4, { metal: 0.97, rough: 0.12 }), 0, 0, -0.01));

  for (let i = 0; i < 5; i += 1) {
    const hp = cyl(0.01, 0.01, 1.3, 10, copper, 0, -0.14 + i * 0.06, 0.0);
    hp.rotation.z = Math.PI / 2;
    g.add(hp);
  }

  const finStack = new THREE.Group();
  for (let i = 0; i < 22; i += 1) {
    finStack.add(box(0.05, H - 0.06, 0.004, i % 3 === 0 ? alumDark : alum, 0, 0, i * 0.007));
  }
  finStack.position.set(0.79, 0, -0.02);
  g.add(finStack);

  g.userData.fans = fans;
  g.userData.cardHeight = H;
  g.userData.rgbParts = rgbParts;
  fans.forEach((f) => g.userData.rgbParts.push(...(f.userData.rgbParts || [])));
  return g;
}

/** Striped coolant texture — offset.x scrolls along TubeGeometry length */
function makeCoolantFlowTexture(hot = false) {
  const c = document.createElement('canvas');
  c.width = 256;
  c.height = 64;
  const ctx = c.getContext('2d');
  const bands = [
    hot ? '#ff6b3d' : '#5b2dff',
    hot ? '#ff9a4a' : '#8b5cff',
    hot ? '#ffd166' : '#c4b5ff',
    hot ? '#ff8c5a' : '#3d1fcc',
    hot ? '#ffe0a0' : '#a78bfa',
    hot ? '#ff6b3d' : '#6d28d9',
  ];
  const w = c.width / bands.length;
  bands.forEach((col, i) => {
    ctx.fillStyle = col;
    ctx.fillRect(i * w, 0, w + 1, c.height);
  });
  // Soft blend streaks
  const grad = ctx.createLinearGradient(0, 0, c.width, 0);
  bands.forEach((col, i) => {
    grad.addColorStop(i / (bands.length - 1), col);
  });
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.globalAlpha = 1;
  // Micro bubbles
  for (let i = 0; i < 50; i += 1) {
    ctx.fillStyle = `rgba(255,255,255,${0.15 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(Math.random() * c.width, Math.random() * c.height, 1 + Math.random() * 2.5, 0, Math.PI * 2);
    ctx.fill();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 1);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function makeCoolantTube(curve, radius, flowTex, dir = 1) {
  const group = new THREE.Group();
  // Opaque-ish sleeve (no DoubleSide transparency — was a major flicker source)
  const sleeve = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, radius * 1.15, 10, false),
    M(0x8a9aac, { metal: 0.15, rough: 0.35 })
  );
  sleeve.castShadow = false;
  const liquid = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 72, radius * 0.85, 10, false),
    new THREE.MeshStandardMaterial({
      map: flowTex,
      color: 0xffffff,
      metalness: 0.05,
      roughness: 0.4,
      emissive: dir > 0 ? 0xff6a3d : 0x6a4dff,
      emissiveMap: flowTex,
      emissiveIntensity: 0.75,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    })
  );
  liquid.castShadow = false;
  liquid.userData.flowDir = dir;
  liquid.userData.flowTex = flowTex;
  group.add(sleeve, liquid);
  group.userData.liquid = liquid;
  group.userData.dispose = () => {
    sleeve.geometry.dispose();
    liquid.geometry.dispose();
  };
  return group;
}

/**
 * Complete AIO 360 — pump on CPU, top radiator, 3 fans, dual tubes with flow.
 * Call seatAio(cpuPos, roofY) after build to lock positions and rebuild tubes.
 */
function makeAio() {
  const g = new THREE.Group();
  const rgbParts = [];
  const chrome = M(0xb8c0c8, { metal: 0.95, rough: 0.12 });
  const dark = M(0x121820, { metal: 0.82, rough: 0.28 });
  const alum = M(0xa8b0b8, { metal: 0.94, rough: 0.16 });

  // ——— PUMP BLOCK (on CPU IHS, faces +Z) ———
  const pump = new THREE.Group();

  // Retention bracket + corner screws
  pump.add(box(0.38, 0.38, 0.02, dark, 0, 0, -0.09));
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    pump.add(cyl(0.015, 0.015, 0.03, 10, chrome, sx * 0.15, sy * 0.15, -0.09));
  });

  // Copper cold plate
  const plateMat = M(0xb87333, { metal: 0.95, rough: 0.18, em: 0xff6a2a, ei: 0.2 });
  const plate = cyl(0.13, 0.13, 0.016, 32, plateMat);
  plate.rotation.x = Math.PI / 2;
  plate.position.z = -0.078;
  pump.add(plate);

  // Pump housing
  const body = cyl(0.155, 0.155, 0.1, 32, dark);
  body.rotation.x = Math.PI / 2;
  body.position.z = -0.01;
  pump.add(body);

  // Side tube barbs (hose attach)
  const mkBarb = (x, y) => {
    const barb = cyl(0.022, 0.026, 0.055, 12, chrome);
    barb.rotation.z = Math.PI / 2;
    barb.position.set(x, y, 0);
    pump.add(barb);
  };
  mkBarb(0.14, 0.08);
  mkBarb(0.14, -0.08);

  // Coolant window + impeller
  const swirlTex = makeCoolantFlowTexture(false);
  swirlTex.repeat.set(2, 2);
  const chamberMat = new THREE.MeshStandardMaterial({
    map: swirlTex,
    color: 0xffffff,
    metalness: 0.05,
    roughness: 0.25,
    emissive: 0x7b5cff,
    emissiveMap: swirlTex,
    emissiveIntensity: 0.95,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const chamber = new THREE.Mesh(new THREE.CircleGeometry(0.1, 32), chamberMat);
  chamber.position.z = 0.045;
  pump.add(chamber);

  const impeller = new THREE.Group();
  for (let i = 0; i < 6; i += 1) {
    const vane = box(0.012, 0.078, 0.006, M(0x1a2030, { metal: 0.7, rough: 0.35 }), 0, 0.034, 0);
    vane.castShadow = false;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 6) * Math.PI * 2;
    pivot.add(vane);
    impeller.add(pivot);
  }
  impeller.position.z = 0.05;
  pump.add(impeller);

  const glass = new THREE.Mesh(
    new THREE.CircleGeometry(0.112, 32),
    M(0xe8f0ff, { metal: 0.05, rough: 0.05, op: 0.2 })
  );
  glass.position.z = 0.058;
  glass.renderOrder = 1;
  pump.add(glass);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.14, 0.015, 14, 48),
    M(0x9b5cff, { metal: 0.2, rough: 0.25, em: 0x9b5cff, ei: 1.8 })
  );
  ring.position.z = 0.062;
  pump.add(ring);
  rgbParts.push(ring.material);

  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.055),
    new THREE.MeshBasicMaterial({
      map: texLabel(['AIO'], { w: 192, h: 80, size: 40, color: '#c9b6ff' }),
      transparent: true,
    })
  );
  logo.position.z = 0.07;
  pump.add(logo);

  pump.userData.portHot = new THREE.Vector3(0.17, 0.08, 0);
  pump.userData.portCold = new THREE.Vector3(0.17, -0.08, 0);
  g.add(pump);
  g.userData.pump = pump;
  g.userData.impeller = impeller;
  g.userData.coldPlate = plateMat;
  g.userData.chamberMat = chamberMat;
  g.userData.swirlTex = swirlTex;

  // ——— 360 RADIATOR + 3 FANS (no nested volumes → no z-fighting) ———
  const rad = new THREE.Group();
  const radW = 1.28;
  const radD = 0.42;
  const radH = 0.14;
  const finMatA = alum;
  const finMatB = M(0x9aa3ac, { metal: 0.93, rough: 0.18 });

  // Top + bottom plates only (open sides — fins fill the middle without overlapping a solid core)
  rad.add(box(radW - 0.14, 0.018, radD - 0.06, dark, 0, radH / 2 - 0.01, 0));
  rad.add(box(radW - 0.14, 0.018, radD - 0.06, dark, 0, -radH / 2 + 0.01, 0));

  // Spaced vertical fins (gap > thickness → no coplanar fight)
  const finCount = 26;
  const finSpan = radD * 0.72;
  for (let i = 0; i < finCount; i += 1) {
    const z = -finSpan / 2 + (i / (finCount - 1)) * finSpan;
    const fin = box(radW - 0.2, radH - 0.05, 0.007, i % 2 ? finMatA : finMatB, 0, 0, z);
    fin.castShadow = false; // dense fins + shadows = shadow acne flicker
    rad.add(fin);
  }

  // End tanks clear of fin pack (sit outside along X)
  const tankMat = M(0x1e2834, { metal: 0.9, rough: 0.25 });
  rad.add(box(0.09, radH, radD, tankMat, -radW / 2 + 0.045, 0, 0));
  rad.add(box(0.09, radH, radD, tankMat, radW / 2 - 0.045, 0, 0));
  // Mount flanges above tanks only
  rad.add(box(0.12, 0.02, radD + 0.04, dark, -radW / 2 + 0.04, radH / 2 + 0.01, 0));
  rad.add(box(0.12, 0.02, radD + 0.04, dark, radW / 2 - 0.04, radH / 2 + 0.01, 0));

  // Hose barbs
  const radBarbHot = cyl(0.024, 0.028, 0.055, 12, chrome, -0.52, -radH / 2 - 0.01, radD * 0.35);
  radBarbHot.rotation.x = Math.PI / 2;
  rad.add(radBarbHot);
  const radBarbCold = cyl(0.024, 0.028, 0.055, 12, chrome, 0.52, -radH / 2 - 0.01, radD * 0.35);
  radBarbCold.rotation.x = Math.PI / 2;
  rad.add(radBarbCold);

  rad.userData.portHot = new THREE.Vector3(-0.52, -radH / 2 - 0.02, radD * 0.42);
  rad.userData.portCold = new THREE.Vector3(0.52, -radH / 2 - 0.02, radD * 0.42);

  const radFans = [];
  [-0.42, 0, 0.42].forEach((x, i) => {
    const f = makeFan(0.185, 0.038, true);
    f.rotation.x = Math.PI / 2;
    f.position.set(x, -radH / 2 - 0.095, 0);
    f.userData.spinDir = i % 2 ? 1 : -1;
    f.renderOrder = 2;
    rad.add(f);
    radFans.push(f);
    rgbParts.push(...(f.userData.rgbParts || []));
  });

  g.add(rad);
  g.userData.radiator = rad;
  g.userData.fans = radFans;

  // ——— TUBES ———
  const flowHot = makeCoolantFlowTexture(true);
  const flowCold = makeCoolantFlowTexture(false);
  const tubeRoot = new THREE.Group();
  g.add(tubeRoot);
  g.userData.tubeRoot = tubeRoot;
  g.userData.flowTextures = [flowHot, flowCold, swirlTex];
  g.userData.liquidMats = [chamberMat];
  g.userData.rgbParts = rgbParts;
  g.userData.tubes = [];

  const clearTubes = () => {
    while (tubeRoot.children.length) {
      const child = tubeRoot.children[0];
      tubeRoot.remove(child);
      if (child.userData?.dispose) child.userData.dispose();
    }
    g.userData.tubes = [];
    g.userData.liquidMats = [chamberMat];
  };

  const buildTubes = () => {
    clearTubes();
    const p = pump.position;
    const r = rad.position;
    const pHot = p.clone().add(pump.userData.portHot);
    const pCold = p.clone().add(pump.userData.portCold);
    const rHot = r.clone().add(rad.userData.portHot);
    const rCold = r.clone().add(rad.userData.portCold);

    // Route FORWARD (+Z) then UP — avoid DIMM bank near rear
    const hot = makeCoolantTube(
      new THREE.CatmullRomCurve3([
        pHot,
        new THREE.Vector3(pHot.x - 0.05, pHot.y + 0.15, pHot.z + 0.35),
        new THREE.Vector3(rHot.x, rHot.y - 0.15, rHot.z + 0.2),
        rHot,
      ]),
      0.017,
      flowHot,
      1
    );
    const cold = makeCoolantTube(
      new THREE.CatmullRomCurve3([
        rCold,
        new THREE.Vector3(rCold.x, rCold.y - 0.15, rCold.z + 0.25),
        new THREE.Vector3(pCold.x - 0.05, pCold.y + 0.12, pCold.z + 0.4),
        pCold,
      ]),
      0.017,
      flowCold,
      -1
    );
    tubeRoot.add(hot, cold);
    g.userData.tubes = [hot, cold];
    g.userData.liquidMats = [hot.userData.liquid.material, cold.userData.liquid.material, chamberMat];
  };

  /**
   * High under roof + pushed toward FRONT of case so fans clear RAM (DIMMs near rear).
   */
  g.userData.seatAio = (cpuPos, roofY) => {
    pump.position.set(cpuPos.x, cpuPos.y, cpuPos.z + 0.095);
    rad.position.set(-0.05, roofY - 0.12, 0.22);
    buildTubes();
  };

  pump.position.set(-0.37, 0.66, -0.35);
  rad.position.set(-0.05, 1.22, 0.22);
  buildTubes();

  return g;
}

function buildPc(gpuTexture) {
  const root = new THREE.Group();
  const parts = {};

  // ——— CASE · ATX mid/full tower (open right + open front for showcase) ———
  const chassis = new THREE.Group();
  const brushedMap = makeBrushedMetalTexture();
  const black = new THREE.MeshStandardMaterial({
    color: 0x0e1218,
    map: brushedMap,
    metalness: 0.88,
    roughness: 0.38,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x161c26,
    map: brushedMap,
    metalness: 0.82,
    roughness: 0.42,
  });
  const deep = M(0x080b10, { metal: 0.9, rough: 0.28 });
  const pillarMat = M(0x10151c, { metal: 0.92, rough: 0.25 });
  const meshMat = M(0x1a222c, { metal: 0.7, rough: 0.45 });
  const rgbParts = [];

  // Outer extents (center at y0 on Y)
  const W = 2.15;
  const H = 2.55;
  const D = 1.55;
  const y0 = 0.08;
  const T = 0.08; // wall thickness
  const xL = -W / 2;
  const xR = W / 2;
  const yBot = y0 - H / 2;
  const yTop = y0 + H / 2;
  const zBack = -D / 2;
  const zFront = D / 2;

  // —— Shell: rear / left / floor / roof ——
  // Rear panel with I/O + expansion cutouts (not a solid wall)
  const rear = new THREE.Group();
  // Rear frame rails
  rear.add(box(W, 0.12, T, black, 0, yTop - 0.06, 0));
  rear.add(box(W, 0.12, T, black, 0, yBot + 0.06, 0));
  rear.add(box(0.12, H - 0.24, T, black, xL + 0.06, 0, 0));
  rear.add(box(0.12, H - 0.24, T, black, xR - 0.06, 0, 0));
  // Main rear fill (upper + mid + lower bands) leaving I/O & slots open
  rear.add(box(W - 0.24, 0.55, T * 0.9, black, 0, 0.72, 0)); // above I/O
  rear.add(box(0.55, 0.95, T * 0.9, black, 0.45, 0.15, 0)); // right of I/O
  rear.add(box(W - 0.24, 0.35, T * 0.9, black, 0, -0.55, 0)); // below slots
  // I/O shield aperture (where mobo rear plate seats)
  rear.add(box(0.12, 0.95, 0.02, M(0xc8d0d8, { metal: 0.9, rough: 0.25 }), -0.72, 0.28, 0.02));
  // PCIe expansion slot covers
  for (let i = 0; i < 7; i += 1) {
    rear.add(box(0.85, 0.055, 0.025, meshMat, 0.05, -0.12 - i * 0.07, 0.015));
  }
  // Rear exhaust grille (upper)
  for (let i = 0; i < 8; i += 1) {
    rear.add(box(0.42, 0.018, 0.02, meshMat, 0.35, 0.55 + i * 0.04, 0.02));
  }
  rear.position.z = zBack + T / 2;
  chassis.add(rear);

  // Left solid side panel
  chassis.add(box(T, H, D, black, xL + T / 2, y0, 0));

  // Floor
  chassis.add(box(W, 0.1, D, black, 0, yBot + 0.05, 0));
  // Roof with open radiator bay (sparse grille — AIO fans must stay visible)
  const roof = new THREE.Group();
  roof.add(box(W, 0.1, 0.16, black, 0, 0, zBack + 0.08));
  roof.add(box(W, 0.1, 0.16, black, 0, 0, zFront - 0.08));
  roof.add(box(0.18, 0.1, D - 0.32, black, xL + 0.09, 0, 0));
  roof.add(box(0.18, 0.1, D - 0.32, black, xR - 0.09, 0, 0));
  // Sparse bars only — large gaps so top fans read clearly
  for (let i = 0; i < 5; i += 1) {
    roof.add(box(W - 0.5, 0.01, 0.03, meshMat, 0, 0.02, -0.28 + i * 0.14));
  }
  // Side mount rails (outside fan footprint)
  roof.add(box(0.04, 0.04, 0.55, pillarMat, -0.62, -0.05, 0));
  roof.add(box(0.04, 0.04, 0.55, pillarMat, 0.62, -0.05, 0));
  roof.position.y = yTop - 0.05;
  chassis.add(roof);

  // —— Open right side: one clean frame (no duplicate pillars) ——
  const rightX = xR - 0.05;
  chassis.add(box(0.1, H, 0.1, pillarMat, rightX, y0, zBack + 0.05)); // rear
  chassis.add(box(0.1, H, 0.1, pillarMat, rightX, y0, zFront - 0.05)); // front
  chassis.add(box(0.1, 0.1, D - 0.1, pillarMat, rightX, yTop - 0.05, 0)); // top rail
  chassis.add(box(0.1, 0.1, D - 0.1, pillarMat, rightX, yBot + 0.05, 0)); // bottom rail
  // Mid horizontal brace (structural)
  chassis.add(box(0.08, 0.06, D - 0.2, pillarMat, rightX, y0 - 0.35, 0));

  // —— Open front: posts + rails only (no solid fascia) ——
  chassis.add(box(0.1, H, 0.1, pillarMat, xL + 0.05, y0, zFront - 0.05));
  // (right-front already added above)
  chassis.add(box(W - 0.2, 0.1, 0.1, pillarMat, 0, yTop - 0.05, zFront - 0.05));
  chassis.add(box(W - 0.2, 0.1, 0.1, pillarMat, 0, yBot + 0.05, zFront - 0.05));
  // Front mid crossbar above PSU shroud
  chassis.add(box(W - 0.25, 0.06, 0.08, pillarMat, 0, y0 - 0.48, zFront - 0.06));

  // Top carry handles
  const handleTex = makeHandleTexture();
  [-0.38, 0.38].forEach((z) => {
    const strap = new THREE.Group();
    strap.add(box(0.9, 0.05, 0.12, M(0x1a1e24, { metal: 0.15, rough: 0.75 }), 0, 0, 0));
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.08),
      new THREE.MeshBasicMaterial({ map: handleTex, transparent: true })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.y = 0.028;
    strap.add(label);
    strap.add(box(0.08, 0.1, 0.08, M(0x2a3038, { metal: 0.85 }), -0.4, -0.06, 0));
    strap.add(box(0.08, 0.1, 0.08, M(0x2a3038, { metal: 0.85 }), 0.4, -0.06, 0));
    strap.position.set(0, yTop + 0.08, z);
    chassis.add(strap);
  });

  // Feet under corners
  [
    [xL + 0.2, zBack + 0.2],
    [xR - 0.2, zBack + 0.2],
    [xL + 0.2, zFront - 0.2],
    [xR - 0.2, zFront - 0.2],
  ].forEach(([x, z]) => {
    chassis.add(box(0.18, 0.05, 0.24, M(0x1a222e, { metal: 0.85 }), x, yBot - 0.02, z));
  });

  // —— PSU shroud (bottom chamber) ——
  const shroudY = yBot + 0.42;
  const shroud = new THREE.Group();
  // Top deck
  shroud.add(box(W - 0.3, 0.06, D - 0.35, dark, 0.02, 0.2, 0.02));
  // Front face with ROG window
  shroud.add(box(W - 0.35, 0.4, 0.05, dark, 0.02, 0, (D - 0.35) / 2 - 0.02));
  shroud.add(box(0.5, 0.26, 0.04, deep, 0.5, 0.02, (D - 0.35) / 2));
  // Inner side walls (leave rear + top cable gap toward mobo)
  shroud.add(box(0.05, 0.38, D - 0.45, dark, -0.85, -0.02, 0));
  shroud.add(box(0.05, 0.38, D - 0.45, dark, 0.88, -0.02, 0));
  const psuLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.32, 0.16),
    new THREE.MeshStandardMaterial({
      map: texLabel(['ROG'], { w: 256, h: 128, size: 64, color: '#c44bff', bg: '#0a0c10', border: '#1ecad3' }),
      emissive: 0xb84dff,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.4,
    })
  );
  psuLogo.position.set(0.5, 0.02, (D - 0.35) / 2 + 0.03);
  shroud.add(psuLogo);
  rgbParts.push(psuLogo.material);
  shroud.position.set(0, shroudY, 0.05);
  chassis.add(shroud);

  // —— Motherboard tray + standoffs (against rear, clearance for I/O) ——
  const trayZ = zBack + 0.22;
  chassis.add(box(1.55, 1.9, 0.035, M(0x1a222e, { metal: 0.8 }), -0.05, y0 + 0.18, trayZ));
  // Standoffs (6) — studs along +Z toward motherboard
  [[-0.7, 0.85], [0.6, 0.85], [-0.7, -0.7], [0.6, -0.7], [-0.7, 0.1], [0.6, 0.1]].forEach(([x, y]) => {
    const stud = cyl(0.02, 0.02, 0.055, 10, M(0xb8c0c8, { metal: 0.92 }), x - 0.05, y0 + 0.18 + y, trayZ + 0.035);
    stud.rotation.x = Math.PI / 2;
    chassis.add(stud);
  });

  // Cable-management bar behind tray
  chassis.add(box(0.06, 1.6, 0.08, pillarMat, 0.85, y0 + 0.15, trayZ - 0.08));

  // ARGB bezel channel on open-side front pillar inner face
  const bezelRgb = M(0xb84dff, { em: 0xb84dff, ei: 1.15 });
  chassis.add(box(0.018, H * 0.72, 0.018, bezelRgb, rightX - 0.04, y0 + 0.08, 0));
  rgbParts.push(bezelRgb);
  // PSU shroud accent lip
  const shroudRgb = M(0x1ecad3, { em: 0x1ecad3, ei: 0.95 });
  chassis.add(box(W * 0.65, 0.012, 0.012, shroudRgb, 0.02, shroudY + 0.23, zFront - 0.28));
  rgbParts.push(shroudRgb);

  // Soft interior fill lights
  const interiorA = new THREE.PointLight(0xb84dff, 0.55, 4.2, 2);
  interiorA.position.set(-0.55, 0.35, -0.1);
  chassis.add(interiorA);
  const interiorB = new THREE.PointLight(0x1ecad3, 0.35, 3.2, 2);
  interiorB.position.set(0.35, -0.2, 0.25);
  chassis.add(interiorB);

  chassis.userData.rgbParts = rgbParts;
  chassis.userData.layout = { W, H, D, y0, trayZ, yTop, yBot, zBack, zFront };
  parts.case = chassis;
  root.add(chassis);

  // ——— MOBO (detailed ATX) ———
  const mobo = new THREE.Group();
  const moboTex = makeMoboTexture();
  const pcbMat = new THREE.MeshStandardMaterial({
    map: moboTex,
    metalness: 0.28,
    roughness: 0.58,
  });
  // PCB board + thin edge bevel
  mobo.add(new THREE.Mesh(new THREE.BoxGeometry(1.48, 1.68, 0.038), pcbMat));
  mobo.add(box(1.5, 1.7, 0.012, M(0x1a1028, { metal: 0.4, rough: 0.5 }), 0, 0, -0.022));

  const alu = M(0x2a3344, { metal: 0.92, rough: 0.16 });
  const aluDark = M(0x1a222e, { metal: 0.9, rough: 0.2 });
  const plastic = M(0x1a1a1a, { metal: 0.15, rough: 0.55 });
  const gold = M(0xd4af37, { metal: 0.95, rough: 0.18 });
  const blueSlot = M(0x0a3dff, { metal: 0.45, rough: 0.35 });
  const blackSlot = M(0x111111, { metal: 0.3, rough: 0.45 });

  // Mounting standoff holes (visual rings)
  [[-0.68, 0.72], [0.68, 0.72], [-0.68, -0.72], [0.68, -0.72], [-0.68, 0], [0.68, 0]].forEach(([x, y]) => {
    mobo.add(cyl(0.028, 0.028, 0.01, 16, M(0x050508, { metal: 0.8 }), x, y, 0.022));
    mobo.add(cyl(0.036, 0.036, 0.006, 16, M(0x888888, { metal: 0.9 }), x, y, 0.02));
  });

  // ——— VRM heatsinks (MOSFET + choke zone, left of CPU) ———
  for (let i = 0; i < 5; i += 1) {
    const vrm = new THREE.Group();
    vrm.add(box(0.14, 0.28, 0.1, alu, 0, 0, 0));
    for (let f = 0; f < 8; f += 1) {
      vrm.add(box(0.12, 0.006, 0.085, M(0x3a4558, { metal: 0.94, rough: 0.14 }), 0, -0.12 + f * 0.034, 0.04));
    }
    // choke coils under / beside
    vrm.add(cyl(0.028, 0.028, 0.04, 12, M(0x1a1a1a, { metal: 0.4 }), 0.06, -0.08, -0.02));
    vrm.add(cyl(0.028, 0.028, 0.04, 12, M(0x1a1a1a, { metal: 0.4 }), 0.06, 0.08, -0.02));
    vrm.position.set(-0.58, 0.52 - i * 0.24, 0.07);
    mobo.add(vrm);
  }
  // Top VRM block above CPU
  const vrmTop = new THREE.Group();
  vrmTop.add(box(0.55, 0.14, 0.095, alu, 0, 0, 0));
  for (let f = 0; f < 12; f += 1) {
    vrmTop.add(box(0.008, 0.12, 0.08, M(0x3a4558, { metal: 0.94 }), -0.24 + f * 0.042, 0, 0.04));
  }
  vrmTop.position.set(-0.28, 0.78, 0.065);
  mobo.add(vrmTop);

  // ——— CPU socket (LGA) ———
  const socket = new THREE.Group();
  socket.add(box(0.42, 0.42, 0.028, plastic, 0, 0, 0));
  socket.add(box(0.36, 0.36, 0.012, M(0x0e0e0e), 0, 0, 0.016));
  // contact pad grid
  for (let r = 0; r < 12; r += 1) {
    for (let c = 0; c < 12; c += 1) {
      socket.add(box(0.018, 0.018, 0.006, gold, -0.15 + c * 0.027, -0.15 + r * 0.027, 0.024));
    }
  }
  // ILM frame + latch
  socket.add(box(0.46, 0.04, 0.02, M(0xb8c0c8, { metal: 0.9 }), 0, 0.22, 0.03));
  socket.add(box(0.46, 0.04, 0.02, M(0xb8c0c8, { metal: 0.9 }), 0, -0.22, 0.03));
  socket.add(box(0.04, 0.4, 0.02, M(0xb8c0c8, { metal: 0.9 }), -0.22, 0, 0.03));
  socket.add(box(0.05, 0.18, 0.035, M(0xd0d6dc, { metal: 0.88 }), 0.24, 0.12, 0.035));
  socket.position.set(-0.32, 0.48, 0.03);
  mobo.add(socket);

  // ——— DDR5 DIMM slots (upper right of CPU — clear of primary PCIe) ———
  // Channel along Y; stick inserts vertically (+Z). Pitch 0.14 on X.
  const dimmSlotXs = [0.12, 0.26, 0.4, 0.54];
  const dimmSlotY = 0.48;
  dimmSlotXs.forEach((sx, i) => {
    const dimm = new THREE.Group();
    const slotMat = i % 2 ? blueSlot : blackSlot;
    dimm.add(box(0.028, 0.58, 0.05, slotMat, 0, 0, 0.01));
    for (let p = 0; p < 12; p += 1) {
      dimm.add(box(0.012, 0.02, 0.02, gold, 0, -0.22 + p * 0.04, 0.028));
    }
    dimm.add(box(0.04, 0.035, 0.07, plastic, 0, 0.3, 0.03));
    dimm.add(box(0.04, 0.035, 0.07, plastic, 0, -0.3, 0.03));
    dimm.position.set(sx, dimmSlotY, 0.04);
    mobo.add(dimm);
  });
  mobo.userData.dimmSlotXs = dimmSlotXs;
  mobo.userData.dimmSlotY = dimmSlotY;

  // ——— PCIe slots (primary well below DIMM bank — ATX spacing) ———
  const pcie16Y = -0.38;
  const pcie16 = new THREE.Group();
  pcie16.add(box(1.18, 0.055, 0.04, blueSlot, 0, 0, 0));
  for (let i = 0; i < 24; i += 1) {
    pcie16.add(box(0.028, 0.035, 0.012, gold, -0.52 + i * 0.045, 0, 0.018));
  }
  pcie16.add(box(0.06, 0.07, 0.05, plastic, 0.58, 0, 0.01));
  pcie16.position.set(0.05, pcie16Y, 0.035);
  mobo.add(pcie16);
  mobo.userData.pcie16 = { x: 0.05, y: pcie16Y, z: 0.035 };
  // Secondary slots further down (empty)
  mobo.add(box(0.72, 0.045, 0.035, blackSlot, 0.05, -0.55, 0.032));
  mobo.add(box(0.55, 0.045, 0.035, blackSlot, 0.05, -0.68, 0.032));

  // ——— Chipset heatsink ———
  const chipset = new THREE.Group();
  chipset.add(box(0.28, 0.28, 0.09, aluDark, 0, 0, 0));
  for (let i = 0; i < 9; i += 1) {
    chipset.add(box(0.24, 0.008, 0.07, alu, 0, -0.1 + i * 0.025, 0.04));
  }
  const chipLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.16, 0.07),
    new THREE.MeshBasicMaterial({
      map: texLabel(['ROG'], { w: 192, h: 80, size: 48, color: '#c44bff', bg: '#121820', border: '#9945ff' }),
      transparent: true,
    })
  );
  chipLogo.position.set(0, 0, 0.05);
  chipset.add(chipLogo);
  // Chipset below secondary PCIe (not under GPU)
  chipset.position.set(0.42, -0.72, 0.055);
  mobo.add(chipset);

  // M.2 between DIMMs and PCIe (visible in the clearance gap)
  mobo.add(box(0.58, 0.1, 0.018, M(0x0a2a1e, { metal: 0.4 }), 0.2, 0.05, 0.025));
  mobo.add(cyl(0.012, 0.012, 0.02, 10, M(0xb8c0c8, { metal: 0.9 }), 0.45, 0.05, 0.035));

  // ——— I/O rear panel + ports ———
  const io = new THREE.Group();
  io.add(box(0.09, 0.85, 0.16, M(0xc8d0d8, { metal: 0.92, rough: 0.2 }), 0, 0, 0));
  // USB / HDMI / Ethernet blocks
  [-0.32, -0.18, -0.04, 0.1, 0.24, 0.38].forEach((y, i) => {
    const h = i === 5 ? 0.08 : 0.055;
    io.add(box(0.06, h, 0.05, plastic, 0.02, y, 0.02));
  });
  io.position.set(-0.78, 0.35, 0.06);
  mobo.add(io);

  // ——— Power connectors ———
  // 24-pin ATX
  const atx = new THREE.Group();
  atx.add(box(0.42, 0.12, 0.1, plastic, 0, 0, 0));
  for (let i = 0; i < 12; i += 1) {
    atx.add(box(0.025, 0.035, 0.04, gold, -0.17 + i * 0.03, 0.02, 0.04));
    atx.add(box(0.025, 0.035, 0.04, i % 3 === 0 ? M(0x222222) : gold, -0.17 + i * 0.03, -0.02, 0.04));
  }
  atx.position.set(0.45, 0.72, 0.06);
  mobo.add(atx);
  // 8-pin EPS CPU
  const eps = new THREE.Group();
  eps.add(box(0.16, 0.1, 0.09, plastic, 0, 0, 0));
  for (let i = 0; i < 4; i += 1) {
    eps.add(box(0.025, 0.03, 0.035, gold, -0.05 + i * 0.032, 0.015, 0.035));
    eps.add(box(0.025, 0.03, 0.035, gold, -0.05 + i * 0.032, -0.015, 0.035));
  }
  eps.position.set(-0.55, 0.78, 0.055);
  mobo.add(eps);

  // ——— SATA ports ———
  for (let i = 0; i < 4; i += 1) {
    mobo.add(box(0.14, 0.045, 0.05, M(0x1a1a1a, { metal: 0.3 }), 0.55, -0.15 - i * 0.07, 0.04));
  }

  // ——— Capacitors (mixed sizes) ———
  const capPositions = [
    [-0.15, 0.7, 0.018], [-0.05, 0.68, 0.018], [0.05, 0.7, 0.015],
    [-0.45, 0.15, 0.014], [-0.35, 0.12, 0.014], [-0.48, -0.05, 0.016],
    [0.5, 0.4, 0.014], [0.55, 0.5, 0.012], [0.48, 0.55, 0.014],
    [0.0, -0.55, 0.012], [0.15, -0.6, 0.014], [-0.1, -0.62, 0.012],
    [0.4, -0.65, 0.013], [-0.2, 0.2, 0.011], [0.35, 0.15, 0.012],
  ];
  capPositions.forEach(([x, y, r], i) => {
    const h = 0.028 + (i % 3) * 0.008;
    const cap = cyl(r, r, h, 10, M(i % 4 === 0 ? 0x1a3050 : 0x111111, { metal: 0.55, rough: 0.35 }), x, y, 0.035);
    cap.rotation.x = Math.PI / 2;
    mobo.add(cap);
    // silver top
    mobo.add(cyl(r * 0.85, r * 0.85, 0.004, 10, M(0xc0c8d0, { metal: 0.9 }), x, y, 0.035 + h / 2));
  });

  // ——— CMOS battery ———
  mobo.add(cyl(0.055, 0.055, 0.012, 24, M(0xd8dce0, { metal: 0.85, rough: 0.25 }), 0.55, -0.48, 0.03));

  // ——— Audio codec / small chips ———
  mobo.add(box(0.1, 0.1, 0.02, M(0x111111), 0.55, 0.15, 0.025));
  mobo.add(box(0.08, 0.06, 0.015, M(0x1a1a1a), -0.15, -0.35, 0.025));
  mobo.add(box(0.07, 0.07, 0.015, M(0x1a1a1a), 0.4, -0.35, 0.025));

  // ——— RGB addressable header strip ———
  const argb = box(0.35, 0.025, 0.02, M(0xb84dff, { em: 0xb84dff, ei: 1.2 }), -0.2, -0.78, 0.03);
  mobo.add(argb);
  mobo.userData.rgbParts = [argb.material];

  // ——— Front-panel header pins ———
  for (let i = 0; i < 9; i += 1) {
    mobo.add(box(0.012, 0.012, 0.02, gold, 0.55 + (i % 3) * 0.02, -0.72 + Math.floor(i / 3) * 0.02, 0.03));
  }

  // Seated on tray standoffs — I/O aligns with rear aperture
  const moboZ = trayZ + 0.07; // clear of tray face — avoids tray/PCB z-fighting
  mobo.position.set(-0.05, y0 + 0.18, moboZ);
  parts.mobo = mobo;
  root.add(mobo);

  // ——— CPU with IHS ———
  const cpu = new THREE.Group();
  cpu.add(box(0.3, 0.3, 0.045, M(0xd0d6dc, { metal: 0.96, rough: 0.12 })));
  cpu.add(box(0.34, 0.34, 0.02, M(0x1a1a1a), 0, 0, -0.03));
  cpu.add(cyl(0.04, 0.04, 0.006, 16, M(0xb8c0c8, { metal: 0.2, rough: 0.6, op: 0.85 }), 0, 0, 0.026));
  const cpuLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.08),
    new THREE.MeshBasicMaterial({
      map: texLabel(['CPU'], { w: 256, h: 96, size: 48, color: '#1ecad3' }),
      transparent: true,
    })
  );
  cpuLogo.position.z = 0.025;
  cpu.add(cpuLogo);
  // Socket local (-0.32, 0.48) + mobo world
  cpu.position.set(-0.05 - 0.32, y0 + 0.18 + 0.48, moboZ + 0.05);
  parts.cpu = cpu;
  root.add(cpu);

  const aio = makeAio();
  // Seat pump on CPU + radiator under roof; tubes connect barb-to-barb
  if (aio.userData.seatAio) {
    aio.userData.seatAio(cpu.position, yTop);
  }
  parts.aio = aio;
  root.add(aio);

  const ramGroup = new THREE.Group();
  const ramSticks = [];
  const ramRgb = [];
  const slotXs = mobo.userData.dimmSlotXs || [0.1, 0.24, 0.38, 0.52];
  const slotY = mobo.userData.dimmSlotY ?? 0.35;
  slotXs.forEach((sx, i) => {
    const stick = makeRam(i);
    // Seat exactly in each DIMM: same X/Y as slot, contacts into socket (+Z)
    stick.position.set(mobo.position.x + sx, mobo.position.y + slotY, mobo.position.z + 0.055);
    ramGroup.add(stick);
    ramSticks.push(stick);
    ramRgb.push(...(stick.userData.rgbParts || []));
  });
  ramGroup.userData.rgbParts = ramRgb;
  ramGroup.userData.sticks = ramSticks;
  parts.ram = ramGroup;
  root.add(ramGroup);

  const m2 = new THREE.Group();
  m2.add(box(0.58, 0.12, 0.012, M(0x0d3d2a, { metal: 0.4, rough: 0.5 })));
  m2.add(box(0.55, 0.1, 0.028, M(0x2a3340, { metal: 0.92, rough: 0.15 }), 0, 0, 0.018));
  for (let i = 0; i < 8; i += 1) {
    m2.add(box(0.52, 0.008, 0.02, M(0x3a4455, { metal: 0.9 }), 0, -0.035 + i * 0.01, 0.03));
  }
  const m2L = new THREE.Mesh(
    new THREE.PlaneGeometry(0.4, 0.055),
    new THREE.MeshBasicMaterial({
      map: texLabel(['M.2 NVMe 4TB'], { w: 420, h: 96, size: 34, color: '#1ecad3' }),
      transparent: true,
    })
  );
  m2L.position.z = 0.035;
  m2.add(m2L);
  m2.position.set(mobo.position.x + 0.2, mobo.position.y + 0.05, mobo.position.z + 0.05);
  parts.m2 = m2;
  root.add(m2);

  const gpu = makeGpu(gpuTexture);
  // Seat in primary PCIe x16 — below DIMM bank with clear air gap
  const pcie = mobo.userData.pcie16 || { x: 0.05, y: -0.38, z: 0.035 };
  gpu.position.set(
    mobo.position.x + pcie.x,
    mobo.position.y + pcie.y,
    mobo.position.z + 0.13 // backplate near board; body extends +Z, clear of RAM
  );
  gpu.rotation.x = 0;
  parts.gpu = gpu;
  root.add(gpu);

  const psu = new THREE.Group();
  psu.add(box(0.95, 0.42, 0.75, M(0x121820, { metal: 0.78, rough: 0.28 })));
  const pf = makeFan(0.17, 0.03, false);
  // PSU fan faces up out of the unit
  pf.rotation.x = -Math.PI / 2;
  pf.position.set(0, 0.23, 0);
  pf.userData.spinDir = 1;
  psu.add(pf);
  psu.userData.fans = [pf];
  const cableMat = M(0x111111, { metal: 0.2, rough: 0.7 });
  for (let i = 0; i < 5; i += 1) {
    const cable = new THREE.Mesh(
      new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3([
          new THREE.Vector3(-0.2 + i * 0.08, 0.2, 0.2),
          new THREE.Vector3(-0.3 + i * 0.1, 0.5, 0.0),
          new THREE.Vector3(-0.4 + i * 0.12, 0.7 + (i % 3) * 0.15, -0.25),
        ]),
        20,
        0.012,
        6,
        false
      ),
      cableMat
    );
    psu.add(cable);
  }
  // Inside PSU shroud chamber
  psu.position.set(0.1, shroudY - 0.12, 0.05);
  parts.psu = psu;
  root.add(psu);

  return { root, parts };
}

function setLabel(text) {
  const el = document.getElementById('pcAssemblyLabel');
  if (el) el.textContent = text;
}

function collectFans(parts) {
  const fans = [];
  const seen = new Set();
  Object.values(parts).forEach((root) => {
    if (!root?.traverse) return;
    root.traverse((obj) => {
      // Only real makeFan groups (tagged), not random children
      if (obj.userData?.isFan && (obj.userData.blades || obj.userData.rotor) && !seen.has(obj)) {
        seen.add(obj);
        fans.push(obj);
      }
    });
  });
  return fans;
}

function collectRgb(parts) {
  const mats = [];
  const seen = new Set();
  Object.values(parts).forEach((p) => {
    (p?.userData?.rgbParts || []).forEach((m) => {
      if (!m || seen.has(m) || m.transparent) return; // skip transparent mats (sorting flicker)
      seen.add(m);
      mats.push(m);
    });
  });
  return mats;
}

/** RGB show modes: white → red → blue → full rainbow, then loop */
const _rgbTmp = new THREE.Color();
const _rgbModes = [
  { name: 'white', color: new THREE.Color(0xffffff), dur: 2.2 },
  { name: 'red', color: new THREE.Color(0xff1a1a), dur: 2.2 },
  { name: 'blue', color: new THREE.Color(0x1a6aff), dur: 2.2 },
  { name: 'rgb', color: null, dur: 5.5 }, // null = rainbow sweep
];
const _rgbCycleTotal = _rgbModes.reduce((s, m) => s + m.dur, 0);

function sampleRgbShow(t, outColor) {
  let u = t % _rgbCycleTotal;
  for (let i = 0; i < _rgbModes.length; i += 1) {
    const mode = _rgbModes[i];
    if (u <= mode.dur) {
      const local = u / mode.dur;
      // Soft hold in the middle of each solid mode; rainbow always sweeps
      if (mode.color) {
        outColor.copy(mode.color);
        // Brief blend into next mode at the end of the segment
        if (local > 0.82) {
          const next = _rgbModes[(i + 1) % _rgbModes.length];
          const blend = (local - 0.82) / 0.18;
          if (next.color) {
            outColor.lerp(next.color, blend);
          } else {
            _rgbTmp.setHSL(0, 1, 0.5);
            outColor.lerp(_rgbTmp, blend);
          }
        }
      } else {
        outColor.setHSL(local, 1, 0.5);
      }
      return mode.name;
    }
    u -= mode.dur;
  }
  outColor.setHSL(0, 1, 0.5);
  return 'rgb';
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/** Anime.js — anima propiedades de objetos Three.js (scale, position, etc.) */
function animeTo(targets, params) {
  return new Promise((resolve) => {
    const anime = getAnime();
    if (!anime) {
      resolve();
      return;
    }
    anime({
      targets,
      ...params,
      complete: () => resolve(),
    });
  });
}

async function installPart(part, label, from, focusLight) {
  setLabel(label);
  part.visible = true;
  part.scale.set(0.001, 0.001, 0.001);
  const dest = part.position.clone();
  part.position.x += from.x || 0;
  part.position.y += from.y || 0;
  part.position.z += from.z || 0;

  if (focusLight) {
    focusLight.position.copy(dest).add(new THREE.Vector3(0.4, 0.6, 0.8));
    focusLight.intensity = 2.2;
  }

  const anime = getAnime();
  if (!anime) {
    part.scale.set(1, 1, 1);
    part.position.copy(dest);
    if (focusLight) focusLight.intensity = 0.35;
    await wait(200);
    return;
  }

  // Timeline sincronizada: escala + desplazamiento
  await new Promise((resolve) => {
    anime
      .timeline({ easing: 'easeOutQuad', complete: () => resolve() })
      .add(
        {
          targets: part.scale,
          x: 1,
          y: 1,
          z: 1,
          duration: 700,
          easing: 'easeOutBack',
        },
        0
      )
      .add(
        {
          targets: part.position,
          x: dest.x,
          y: dest.y,
          z: dest.z,
          duration: 1050,
          easing: 'easeInOutCubic',
        },
        50
      );
  });

  await animeTo(part.scale, {
    x: [1, 1.04, 1],
    y: [1, 1.04, 1],
    z: [1, 1.04, 1],
    duration: 280,
    easing: 'easeInOutSine',
  });

  if (focusLight) {
    await animeTo(focusLight, {
      intensity: 0.35,
      duration: 350,
      easing: 'easeOutQuad',
    });
  }
  await wait(320);
}

async function runAssembly(parts, focusLight, camera, controls) {
  const steps = [
    { key: 'case', label: '01 · Chasis ROG Strix Helios', from: { y: 1.4 } },
    { key: 'mobo', label: '02 · Motherboard ATX + VRM', from: { z: -1.2, y: 0.3 } },
    { key: 'cpu', label: '03 · Procesador en socket', from: { y: 1.0 } },
    { key: 'aio', label: '04 · AIO 360 · top mount + bomba', from: { y: 1.1, z: -0.5 } },
    { key: 'ram', label: '05 · 4× DDR5 RGB', from: { y: 0.9 } },
    { key: 'm2', label: '06 · SSD M.2 NVMe 4TB', from: { y: 0.7 } },
    { key: 'gpu', label: '07 · ROG Strix RTX · PCIe ×16', from: { z: 1.8, y: 0.2 } },
    { key: 'psu', label: '08 · PSU modular + cableado', from: { y: -1.2 } },
  ];

  Object.values(parts).forEach((p) => {
    p.visible = false;
    p.scale.setScalar(0.001);
  });

  if (reducedMotion) {
    Object.values(parts).forEach((p) => {
      p.visible = true;
      p.scale.setScalar(1);
    });
    setLabel('PC high-end listo · ROG RTX + AIO + RGB');
    return;
  }

  camera.position.set(4.2, 2.0, 3.2);
  controls.target.set(0, 0.1, -0.15);
  controls.update();

  for (const step of steps) {
    const part = parts[step.key];
    if (!part) continue;

    const look = part.position.clone();
    animeTo(controls.target, {
      x: look.x * 0.35,
      y: look.y * 0.4 + 0.05,
      z: look.z * 0.35,
      duration: 800,
      easing: 'easeOutQuad',
    });

    await installPart(part, step.label, step.from, focusLight);
  }

  setLabel('Listo · RGB · fans · loop líquido · ROG RTX');
  const anime = getAnime();
  if (anime) {
    anime
      .timeline({ easing: 'easeInOutCubic' })
      .add({ targets: camera.position, x: 3.4, y: 1.35, z: 3.5, duration: 1400 }, 0)
      .add({ targets: controls.target, x: 0, y: 0.05, z: -0.1, duration: 1400 }, 0);
  } else {
    camera.position.set(3.4, 1.35, 3.5);
    controls.target.set(0, 0.05, -0.1);
  }
}

function loadGpuTexture() {
  return new Promise((resolve) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      'images/gpu-rog.png',
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      () => resolve(null)
    );
  });
}

function bootScene(canvas, parent, gpuTexture) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x050b12);
  scene.fog = new THREE.Fog(0x050b12, 6, 16);

  const camera = new THREE.PerspectiveCamera(40, 1, 0.4, 40);
  camera.position.set(3.6, 1.5, 3.8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    logarithmicDepthBuffer: true, // kills most coplanar z-flicker in dense PC builds
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = false; // shadows caused acne flicker on dense PC geometry
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0x3a3550, 0.5));

  const key = new THREE.DirectionalLight(0xffffff, 1.45);
  key.position.set(5, 7, 4);
  key.castShadow = false;
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x1ecad3, 0.55);
  fill.position.set(-4, 2, 2);
  scene.add(fill);

  const rim = new THREE.PointLight(0xb84dff, 1.35, 12);
  rim.position.set(2.2, 0.6, 1.8);
  scene.add(rim);

  const focus = new THREE.SpotLight(0xffffff, 0.4, 8, Math.PI / 5, 0.35, 1);
  focus.position.set(1, 2.5, 2);
  focus.target.position.set(0, 0, -0.1);
  scene.add(focus);
  scene.add(focus.target);

  // Soft ground disc (opaque — no transparent DoubleSide ring)
  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({ color: 0x071018, metalness: 0.85, roughness: 0.3 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  floor.receiveShadow = false;
  scene.add(floor);

  const { root, parts } = buildPc(gpuTexture);
  root.rotation.y = -0.55;
  scene.add(root);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.minDistance = 2.6;
  controls.maxDistance = 8;
  controls.target.set(0, 0.1, -0.1);
  controls.enablePan = false;
  controls.autoRotate = false;

  const fans = collectFans(parts);
  const rgbMats = collectRgb(parts);
  const rgbShowColor = new THREE.Color(0xffffff);

  const resize = () => {
    const w = Math.max(1, parent.clientWidth);
    const h = Math.max(1, parent.clientHeight);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  resize();
  window.addEventListener('resize', resize);

  let visible = true;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
  }, { threshold: 0.05 }).observe(parent);

  let assembling = true;
  runAssembly(parts, focus, camera, controls).then(() => {
    assembling = false;
    if (!reducedMotion) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.55;
    }
  });

  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    const t = clock.getElapsedTime();
    const spinSpeed = reducedMotion ? 0 : assembling ? 12 : 18;

    fans.forEach((fan, i) => {
      const blades = fan.userData?.blades || fan.userData?.rotor;
      if (!blades) return;
      const dir = fan.userData.spinDir ?? (i % 2 ? -1 : 1);
      const axis = fan.userData.spinAxis || _fanSpinAxis;
      blades.rotateOnAxis(axis, spinSpeed * dir * dt);
    });

    if (!reducedMotion) {
      // RGB show: blanco → rojo → azul → arcoíris completo
      sampleRgbShow(t, rgbShowColor);
      rgbMats.forEach((m) => {
        if (!m?.emissive) return;
        m.emissive.copy(rgbShowColor);
        m.color.copy(rgbShowColor);
        m.emissiveIntensity = 1.35;
      });

      const aio = parts.aio;
      if (aio?.userData) {
        const flowSpeed = assembling ? 0.9 : 1.2;
        (aio.userData.flowTextures || []).forEach((tex, i) => {
          if (!tex) return;
          const sign = i === 1 ? -1 : 1;
          if (i < 2) {
            tex.offset.x = (tex.offset.x - dt * flowSpeed * sign * 0.35) % 1;
          } else {
            tex.offset.x = (tex.offset.x + dt * 0.35) % 1;
            tex.offset.y = (tex.offset.y + dt * 0.2) % 1;
          }
        });
        if (aio.userData.impeller) {
          aio.userData.impeller.rotation.z += dt * (assembling ? 5 : 8);
        }
        if (aio.userData.coldPlate) {
          const load = 0.4 + 0.4 * (0.5 + 0.5 * Math.sin(t * 0.45));
          aio.userData.coldPlate.emissiveIntensity = 0.12 + load * 0.35;
          aio.userData.coldPlate.emissive.setRGB(1, 0.35, 0.12);
        }
      }

      // Stable lights — no intensity pulsing (looked like flicker)
      rim.intensity = 0.85;
      fill.intensity = 0.5;
    }

    controls.update();
    renderer.render(scene, camera);
  };
  tick();
}

async function init() {
  const canvas = document.getElementById('pcAssembly');
  if (!canvas) return;
  const parent = canvas.parentElement;
  setLabel('Preparando ensamblaje 3D…');
  try {
    const gpuTexture = await loadGpuTexture();
    bootScene(canvas, parent, gpuTexture);
  } catch (err) {
    console.error('[PC Assembly]', err);
    setLabel('Error 3D — recarga (Ctrl+F5)');
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
