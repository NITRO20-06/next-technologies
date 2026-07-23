/**
 * NEXT TECHNOLOGIES — Hero PC Assembly (Three.js)
 * Ensamblaje cinematico pieza a pieza, vista lateral abierta.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function M(color, o = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: o.metal ?? 0.6,
    roughness: o.rough ?? 0.32,
    emissive: o.em ?? 0x000000,
    emissiveIntensity: o.ei ?? 0,
    transparent: !!o.op,
    opacity: o.op ?? 1,
    side: o.side ?? THREE.FrontSide,
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
  g.fillStyle = '#120a1e';
  g.fillRect(0, 0, c.width, c.height);
  g.strokeStyle = '#2a1a40';
  g.lineWidth = 2;
  for (let i = 0; i < 24; i += 1) {
    g.beginPath();
    g.moveTo(40 + (i % 6) * 160, 40);
    g.bezierCurveTo(200 + i * 8, 180 + i * 12, 400 - i * 6, 320 + i * 10, 520 + (i % 4) * 90, 480 + i * 18);
    g.strokeStyle = i % 3 === 0 ? '#c9a227' : '#1a5cff';
    g.globalAlpha = 0.35 + (i % 5) * 0.08;
    g.stroke();
  }
  g.globalAlpha = 1;
  g.fillStyle = '#0d0814';
  g.fillRect(80, 80, 280, 280);
  g.strokeStyle = '#444';
  g.strokeRect(80, 80, 280, 280);
  for (let i = 0; i < 4; i += 1) {
    g.fillStyle = '#222';
    g.fillRect(420 + i * 110, 200, 90, 420);
    g.strokeStyle = i % 2 ? '#1a5cff' : '#333';
    g.strokeRect(420 + i * 110, 200, 90, 420);
  }
  g.fillStyle = '#111';
  g.fillRect(120, 720, 680, 80);
  g.fillRect(180, 860, 520, 60);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
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

  // chrome outer ring
  const chromeRing = new THREE.Mesh(
    new THREE.TorusGeometry(r * 1.02, 0.012, 10, 48),
    M(0xe8eef5, { metal: 0.98, rough: 0.08 })
  );
  chromeRing.rotation.x = Math.PI / 2;
  chromeRing.position.z = depth * 0.35;
  g.add(chromeRing);

  // corner mounts
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => {
    g.add(cyl(0.018, 0.018, depth * 1.1, 10, M(0x2a3340, { metal: 0.9 }), sx * r * 0.92, sy * r * 0.92, 0));
  });

  // Spinner: hub + blades share one group so the whole rotor turns
  const rotor = new THREE.Group();
  rotor.position.z = depth * 0.08;

  const hub = cyl(r * 0.2, r * 0.2, depth * 0.9, 24, M(0x1a2430, { metal: 0.85, rough: 0.2 }));
  hub.rotation.x = Math.PI / 2;
  rotor.add(hub);

  const bMat = M(0xb8c5d0, {
    metal: 0.35,
    rough: 0.4,
    em: rgb ? 0x1ecad3 : 0x000000,
    ei: rgb ? 0.25 : 0,
    op: 0.95,
  });
  for (let i = 0; i < 9; i += 1) {
    const blade = box(r * 0.14, r * 0.78, depth * 0.22, bMat, 0, r * 0.36, 0);
    // pitch so blades read as spinning airfoils
    blade.rotation.z = 0.28;
    blade.rotation.y = 0.35;
    const pivot = new THREE.Group();
    pivot.rotation.z = (i / 9) * Math.PI * 2;
    pivot.add(blade);
    rotor.add(pivot);
  }
  g.add(rotor);
  // blades alias kept for animation loop compatibility
  g.userData.blades = rotor;
  g.userData.rotor = rotor;
  g.userData.spinDir = 1;

  const rgbParts = [bMat];
  if (rgb) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r * 0.95, 0.014, 10, 48),
      M(0x1ecad3, { metal: 0.2, rough: 0.25, em: 0x1ecad3, ei: 1.4 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.z = depth * 0.4;
    g.add(ring);
    rgbParts.push(ring.material);
  }
  g.userData.rgbParts = rgbParts;
  return g;
}

function makeRam(x) {
  const g = new THREE.Group();
  g.add(box(0.1, 0.58, 0.016, M(0x0a4a32, { metal: 0.4, rough: 0.5 }), 0, 0, 0));

  // grooved heatspreader
  const spreader = new THREE.Group();
  spreader.add(box(0.105, 0.46, 0.028, M(0x1c2430, { metal: 0.9, rough: 0.18 }), 0, 0.05, 0.008));
  for (let i = 0; i < 7; i += 1) {
    spreader.add(box(0.102, 0.012, 0.032, M(0x252f3c, { metal: 0.88, rough: 0.22 }), 0, -0.15 + i * 0.05, 0.01));
  }
  g.add(spreader);

  // individual gold contacts
  for (let i = 0; i < 12; i += 1) {
    g.add(box(0.007, 0.065, 0.01, M(0xd4af37, { metal: 0.96, rough: 0.15 }), -0.042 + i * 0.0076, -0.28, 0));
  }

  // memory chips
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      g.add(box(0.018, 0.028, 0.006, M(0x111111, { metal: 0.3 }), -0.03 + col * 0.022, -0.02 + row * 0.12, 0.022));
    }
  }

  const rgb = box(0.108, 0.035, 0.03, M(0xff2bd6, { metal: 0.15, rough: 0.25, em: 0xff2bd6, ei: 1.5 }), 0, 0.28, 0.01);
  g.add(rgb);

  const label = new THREE.Mesh(
    new THREE.PlaneGeometry(0.07, 0.025),
    new THREE.MeshBasicMaterial({
      map: texLabel(['DDR5'], { w: 180, h: 64, size: 28, color: '#1ecad3', border: '#ff2bd6', bg: '#0a0812' }),
      transparent: true,
    })
  );
  label.position.set(0, 0.12, 0.024);
  g.add(label);

  g.position.set(x, 0.32, 0.05);
  g.userData.rgbParts = [rgb.material];
  return g;
}

function makeGpu(gpuTexture) {
  const g = new THREE.Group();
  const rgbParts = [];

  // PCB
  g.add(box(1.55, 0.58, 0.035, M(0x0b3d2a, { metal: 0.45, rough: 0.45 }), 0, 0, -0.06));

  // thick shroud body
  g.add(box(1.6, 0.62, 0.26, M(0x0e141c, { metal: 0.8, rough: 0.25 }), 0, 0, 0.08));

  // backplate
  g.add(box(1.62, 0.64, 0.02, M(0x151c28, { metal: 0.92, rough: 0.15 }), 0, 0, -0.09));

  const fans = [];
  const fanPositions = [-0.48, 0, 0.48];

  // Always real spinning fans (photo alone looked static)
  fanPositions.forEach((x, i) => {
    const f = makeFan(0.2, 0.038, true);
    f.position.set(x, 0.02, 0.235);
    f.userData.spinDir = i % 2 ? -1 : 1;
    g.add(f);
    fans.push(f);
  });

  if (gpuTexture) {
    // ROG face with circular cutouts so fans show through and spin
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
    // punch 3 fan holes (normalized positions matching fanPositions)
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
      new THREE.PlaneGeometry(1.52, 0.58),
      new THREE.MeshStandardMaterial({
        map: punched,
        metalness: 0.15,
        roughness: 0.45,
        transparent: true,
        alphaTest: 0.15,
      })
    );
    face.position.set(0, 0.02, 0.245);
    g.add(face);

    fanPositions.forEach((x) => {
      const bezel = new THREE.Mesh(
        new THREE.TorusGeometry(0.2, 0.014, 12, 48),
        M(0xe8eef5, { metal: 0.98, rough: 0.06 })
      );
      bezel.rotation.x = Math.PI / 2;
      bezel.position.set(x, 0.02, 0.248);
      g.add(bezel);
    });
  }

  // purple RGB top bar
  const topBar = box(1.5, 0.04, 0.025, M(0x9945ff, { metal: 0.2, rough: 0.3, em: 0x9945ff, ei: 1.8 }), 0, 0.3, 0.2);
  g.add(topBar);
  rgbParts.push(topBar.material);

  // purple RGB side strip
  const sideStrip = box(0.025, 0.5, 0.2, M(0x9945ff, { em: 0x9945ff, ei: 1.4 }), 0.79, 0, 0.08);
  g.add(sideStrip);
  rgbParts.push(sideStrip.material);

  // PCIe gold fingers
  for (let i = 0; i < 28; i += 1) {
    g.add(box(0.038, 0.012, 0.008, M(0xd4af37, { metal: 0.96, rough: 0.12 }), -0.72 + i * 0.052, -0.34, -0.02));
  }

  // I/O ports
  [-0.22, -0.07, 0.08, 0.23].forEach((y, i) => {
    g.add(box(0.06, 0.05, 0.04, M(i === 3 ? 0x1a1a1a : 0x222222, { metal: 0.4 }), -0.78, y, 0.02));
  });

  // 12VHPWR connector
  g.add(box(0.22, 0.1, 0.14, M(0x1a1a1a, { metal: 0.5, rough: 0.4 }), 0.64, -0.08, -0.14));
  g.add(box(0.18, 0.06, 0.08, M(0x333333, { metal: 0.6 }), 0.64, -0.08, -0.2));
  for (let i = 0; i < 6; i += 1) {
    g.add(box(0.022, 0.018, 0.02, M(0xd4af37, { metal: 0.9 }), 0.56 + i * 0.028, -0.08, -0.22));
  }

  // heatsink fins ONLY on the side edge (not covering ROG face)
  for (let i = 0; i < 12; i += 1) {
    g.add(box(0.06, 0.5, 0.008, M(0xa8b0b8, { metal: 0.94, rough: 0.15 }), 0.78, 0, -0.02 + i * 0.012));
  }

  g.userData.fans = fans;
  g.userData.rgbParts = rgbParts;
  fans.forEach((f) => g.userData.rgbParts.push(...(f.userData.rgbParts || [])));
  return g;
}

function makeAio() {
  const g = new THREE.Group();

  // Pump on CPU IHS
  const pump = new THREE.Group();
  pump.add(cyl(0.15, 0.15, 0.11, 32, M(0x101820, { metal: 0.78, rough: 0.26 })));
  pump.add(cyl(0.125, 0.125, 0.014, 32, M(0xc0c8d0, { metal: 0.96, rough: 0.1 }), 0, -0.06, 0));
  pump.add(box(0.32, 0.32, 0.018, M(0x1a222e, { metal: 0.85 }), 0, -0.072, 0));
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.138, 0.014, 12, 48),
    M(0x9b5cff, { metal: 0.2, rough: 0.25, em: 0x9b5cff, ei: 1.65 })
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.04;
  pump.add(ring);
  const logo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 0.06),
    new THREE.MeshBasicMaterial({
      map: texLabel(['AIO'], { w: 192, h: 80, size: 40, color: '#c9b6ff' }),
      transparent: true,
    })
  );
  logo.rotation.x = -Math.PI / 2;
  logo.position.y = 0.058;
  pump.add(logo);
  pump.rotation.x = -Math.PI / 2;
  pump.position.set(-0.37, 0.56, -0.34);
  g.add(pump);
  g.userData.pump = pump;

  // Top-mounted 360 radiator + fans
  const rad = new THREE.Group();
  rad.add(box(1.15, 0.1, 0.42, M(0x1a222e, { metal: 0.9, rough: 0.2 })));
  for (let i = 0; i < 20; i += 1) {
    rad.add(box(1.08, 0.008, 0.38, M(0xa8b0b8, { metal: 0.94, rough: 0.14 }), 0, -0.02, -0.18 + i * 0.018));
  }
  rad.add(box(0.08, 0.12, 0.42, M(0x2a3340, { metal: 0.88 }), -0.58, 0, 0));
  rad.add(box(0.08, 0.12, 0.42, M(0x2a3340, { metal: 0.88 }), 0.58, 0, 0));

  const radFans = [];
  [-0.38, 0, 0.38].forEach((x) => {
    const f = makeFan(0.185, 0.04, true);
    f.rotation.x = Math.PI / 2;
    f.position.set(x, -0.09, 0);
    f.userData.spinDir = -1;
    rad.add(f);
    radFans.push(f);
  });

  rad.add(cyl(0.028, 0.028, 0.05, 12, M(0xb8c0c8, { metal: 0.95 }), -0.5, -0.02, 0.12));
  rad.add(cyl(0.028, 0.028, 0.05, 12, M(0xb8c0c8, { metal: 0.95 }), 0.5, -0.02, 0.12));
  rad.position.set(0.05, 1.22, -0.05);
  g.add(rad);
  g.userData.radiator = rad;
  g.userData.fans = radFans;

  const coolant = M(0x7b5cff, { metal: 0.1, rough: 0.3, em: 0x5a3dff, ei: 0.65, op: 0.9 });
  const tubeA = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.3, 0.62, -0.3),
        new THREE.Vector3(-0.35, 0.9, -0.2),
        new THREE.Vector3(-0.4, 1.1, 0.05),
        new THREE.Vector3(-0.45, 1.18, 0.05),
      ]),
      48,
      0.02,
      12,
      false
    ),
    coolant
  );
  const tubeB = new THREE.Mesh(
    new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(-0.42, 0.5, -0.3),
        new THREE.Vector3(-0.1, 0.75, -0.15),
        new THREE.Vector3(0.35, 1.0, 0.0),
        new THREE.Vector3(0.55, 1.18, 0.05),
      ]),
      48,
      0.02,
      12,
      false
    ),
    coolant
  );
  g.add(tubeA, tubeB);
  g.userData.tubes = [tubeA, tubeB];

  g.userData.rgbParts = [ring.material, coolant];
  radFans.forEach((f) => g.userData.rgbParts.push(...(f.userData.rgbParts || [])));
  return g;
}

function buildPc(gpuTexture) {
  const root = new THREE.Group();
  const parts = {};

  // ——— CASE · ROG Strix Helios style ———
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
  const rgbParts = [];

  // Outer frame proportions closer to Helios full-tower
  const W = 2.15;
  const H = 2.55;
  const D = 1.55;
  const y0 = 0.08;

  // Rear panel
  chassis.add(box(W, H, 0.08, black, 0, y0, -D / 2));
  // Left panel (solid)
  chassis.add(box(0.08, H, D, black, -W / 2, y0, 0));
  // Floor + roof
  chassis.add(box(W, 0.1, D, black, 0, y0 - H / 2, 0));
  chassis.add(box(W, 0.1, D, black, 0, y0 + H / 2, 0));

  // Right frame (open side) — pillars + bezels
  const pillarMat = M(0x10151c, { metal: 0.92, rough: 0.25 });
  chassis.add(box(0.1, H, 0.1, pillarMat, W / 2 - 0.02, y0, -D / 2 + 0.05));
  chassis.add(box(0.1, H, 0.1, pillarMat, W / 2 - 0.02, y0, D / 2 - 0.05));
  chassis.add(box(0.1, 0.1, D, pillarMat, W / 2 - 0.02, y0 + H / 2 - 0.05, 0));
  chassis.add(box(0.1, 0.1, D, pillarMat, W / 2 - 0.02, y0 - H / 2 + 0.05, 0));

  // Front open frame only (no solid fascia — keeps internals visible)
  chassis.add(box(0.1, H, 0.1, pillarMat, -W / 2 + 0.05, y0, D / 2 - 0.05));
  chassis.add(box(0.1, H, 0.1, pillarMat, W / 2 - 0.05, y0, D / 2 - 0.05));
  chassis.add(box(W - 0.12, 0.1, 0.1, pillarMat, 0, y0 + H / 2 - 0.05, D / 2 - 0.05));
  chassis.add(box(W - 0.12, 0.1, 0.1, pillarMat, 0, y0 - H / 2 + 0.05, D / 2 - 0.05));

  // Top carry handles (nylon straps)
  const handleTex = makeHandleTexture();
  [-0.38, 0.38].forEach((z) => {
    const strap = new THREE.Group();
    const bar = box(0.9, 0.05, 0.12, M(0x1a1e24, { metal: 0.15, rough: 0.75 }), 0, 0, 0);
    strap.add(bar);
    const label = new THREE.Mesh(
      new THREE.PlaneGeometry(0.7, 0.08),
      new THREE.MeshBasicMaterial({ map: handleTex, transparent: true })
    );
    label.rotation.x = -Math.PI / 2;
    label.position.y = 0.028;
    strap.add(label);
    // mounts
    strap.add(box(0.08, 0.1, 0.08, M(0x2a3038, { metal: 0.85 }), -0.4, -0.06, 0));
    strap.add(box(0.08, 0.1, 0.08, M(0x2a3038, { metal: 0.85 }), 0.4, -0.06, 0));
    strap.position.set(0, y0 + H / 2 + 0.08, z);
    chassis.add(strap);
  });

  // Feet / skids
  [[-0.9, -0.55], [0.9, -0.55], [-0.9, 0.55], [0.9, 0.55]].forEach(([x, z]) => {
    chassis.add(box(0.16, 0.05, 0.22, M(0x1a222e, { metal: 0.85 }), x, y0 - H / 2 - 0.04, z));
  });

  // PSU shroud (bottom chamber) with geometric cutout + ROG glow window
  chassis.add(box(W * 0.88, 0.52, D * 0.72, dark, 0.02, y0 - 0.78, 0.05));
  // triangular-ish window: stacked plates forming a notch
  chassis.add(box(0.55, 0.28, 0.04, deep, 0.55, y0 - 0.72, D * 0.35));
  const psuLogo = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.18),
    new THREE.MeshStandardMaterial({
      map: texLabel(['ROG'], { w: 256, h: 128, size: 64, color: '#c44bff', bg: '#0a0c10', border: '#1ecad3' }),
      emissive: 0xb84dff,
      emissiveIntensity: 1.2,
      metalness: 0.3,
      roughness: 0.4,
    })
  );
  psuLogo.position.set(0.55, y0 - 0.72, D * 0.35 + 0.03);
  chassis.add(psuLogo);
  rgbParts.push(psuLogo.material);

  // Motherboard tray
  chassis.add(box(1.55, 1.85, 0.04, M(0x1a222e, { metal: 0.8 }), -0.05, y0 + 0.12, -0.52));

  // ARGB only where a real case puts it: recessed channel on the open-side glass bezel
  // (inner face of the right pillars — where the side panel seals)
  const bezelRgb = M(0xb84dff, { em: 0xb84dff, ei: 1.15 });
  chassis.add(box(0.018, H * 0.78, 0.018, bezelRgb, W / 2 - 0.06, y0 + 0.05, 0));
  rgbParts.push(bezelRgb);
  // Thin lip on PSU shroud front (standard shroud accent, not a floating stick)
  const shroudRgb = M(0x1ecad3, { em: 0x1ecad3, ei: 0.95 });
  chassis.add(box(W * 0.72, 0.012, 0.012, shroudRgb, 0.02, y0 - 0.51, D * 0.28));
  rgbParts.push(shroudRgb);

  // Soft fill only (invisible lights — no random glowing bars)
  const interiorA = new THREE.PointLight(0xb84dff, 0.55, 4.2, 2);
  interiorA.position.set(-0.55, 0.35, -0.1);
  chassis.add(interiorA);
  const interiorB = new THREE.PointLight(0x1ecad3, 0.35, 3.2, 2);
  interiorB.position.set(0.35, -0.2, 0.25);
  chassis.add(interiorB);

  chassis.userData.rgbParts = rgbParts;
  parts.case = chassis;
  root.add(chassis);

  // ——— MOBO ———
  const mobo = new THREE.Group();
  const moboTex = makeMoboTexture();
  mobo.add(new THREE.Mesh(
    new THREE.BoxGeometry(1.45, 1.65, 0.045),
    new THREE.MeshStandardMaterial({ map: moboTex, metalness: 0.35, roughness: 0.55 })
  ));

  // VRM with fins
  for (let i = 0; i < 4; i += 1) {
    const vrm = new THREE.Group();
    vrm.add(box(0.16, 0.32, 0.09, M(0x2a3344, { metal: 0.9, rough: 0.18 }), 0, 0, 0));
    for (let f = 0; f < 5; f += 1) {
      vrm.add(box(0.14, 0.008, 0.07, M(0x3a4455, { metal: 0.92 }), 0, -0.12 + f * 0.06, 0.05));
    }
    vrm.position.set(-0.55, 0.45 - i * 0.28, 0.06);
    mobo.add(vrm);
  }

  // CPU socket pads
  for (let r = 0; r < 8; r += 1) {
    for (let c = 0; c < 8; c += 1) {
      mobo.add(box(0.028, 0.028, 0.008, M(0xc0a020, { metal: 0.85 }), -0.44 + c * 0.036, 0.36 + r * 0.036, 0.028));
    }
  }
  mobo.add(box(0.34, 0.34, 0.03, M(0x222222), -0.32, 0.48, 0.03));

  for (let i = 0; i < 4; i += 1) {
    mobo.add(box(0.12, 0.55, 0.04, M(i % 2 ? 0x1a5cff : 0x222222, { metal: 0.5 }), 0.12 + i * 0.14, 0.35, 0.04));
  }

  mobo.add(box(1.15, 0.05, 0.035, M(0x1a5cff, { metal: 0.55 }), 0.05, -0.12, 0.04));
  mobo.add(box(1.0, 0.04, 0.03, M(0x333333), 0.05, -0.28, 0.04));
  mobo.add(box(0.9, 0.04, 0.03, M(0x333333), 0.05, -0.42, 0.04));
  mobo.add(box(0.55, 0.12, 0.02, M(0x111111), 0.15, -0.58, 0.03));
  mobo.add(box(0.08, 0.75, 0.14, M(0xb8c0c8, { metal: 0.92, rough: 0.18 }), -0.75, 0.4, 0.05));
  mobo.add(box(0.24, 0.24, 0.07, M(0x2a3340, { metal: 0.88 }), 0.2, -0.35, 0.05));

  // caps
  for (let i = 0; i < 12; i += 1) {
    mobo.add(cyl(0.012, 0.012, 0.035, 8, M(0x1a1a1a, { metal: 0.5 }), -0.2 + (i % 4) * 0.35, -0.05 - Math.floor(i / 4) * 0.35, 0.04));
  }

  mobo.position.set(-0.05, 0.08, -0.48);
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
  cpu.position.set(-0.37, 0.56, -0.43);
  parts.cpu = cpu;
  root.add(cpu);

  const aio = makeAio();
  parts.aio = aio;
  root.add(aio);

  const ramGroup = new THREE.Group();
  const ramSticks = [];
  const ramRgb = [];
  [-0.02, 0.12, 0.26, 0.4].forEach((x) => {
    const stick = makeRam(x);
    ramGroup.add(stick);
    ramSticks.push(stick);
    ramRgb.push(...(stick.userData.rgbParts || []));
  });
  ramGroup.position.set(0.09, 0.48, -0.44);
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
  m2.position.set(0.15, -0.5, -0.43);
  parts.m2 = m2;
  root.add(m2);

  const gpu = makeGpu(gpuTexture);
  // Seated in top PCIe x16 (mobo slot ~ y=-0.12 local → world ~ -0.04)
  gpu.position.set(0.0, -0.05, -0.18);
  gpu.rotation.x = 0;
  parts.gpu = gpu;
  root.add(gpu);

  // Front intake stack removed (the 3 glowing fans the user marked) — AIO top covers exhaust
  // No separate caseFans group

  const psu = new THREE.Group();
  psu.add(box(0.95, 0.42, 0.75, M(0x121820, { metal: 0.78, rough: 0.28 })));
  const pf = makeFan(0.17, 0.03, false);
  pf.rotation.x = Math.PI / 2;
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
  psu.position.set(0.15, -0.92, 0.08);
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
    // Find every makeFan group by its rotor/blades userData
    root.traverse((obj) => {
      if ((obj.userData?.blades || obj.userData?.rotor) && !seen.has(obj)) {
        seen.add(obj);
        fans.push(obj);
      }
    });
  });
  return fans;
}

function collectRgb(parts) {
  const mats = [];
  Object.values(parts).forEach((p) => {
    if (p?.userData?.rgbParts) mats.push(...p.userData.rgbParts);
  });
  return mats;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function installPart(gsapLib, part, label, from, focusLight) {
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

  await new Promise((resolve) => {
    gsapLib
      .timeline({ onComplete: resolve })
      .to(part.scale, { x: 1, y: 1, z: 1, duration: 0.7, ease: 'back.out(1.4)' }, 0)
      .to(
        part.position,
        { x: dest.x, y: dest.y, z: dest.z, duration: 1.05, ease: 'power3.inOut' },
        0.05
      );
  });

  await new Promise((resolve) => {
    gsapLib.to(part.scale, {
      x: 1.03,
      y: 1.03,
      z: 1.03,
      duration: 0.12,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut',
      onComplete: resolve,
    });
  });

  if (focusLight) focusLight.intensity = 0.35;
  await wait(400);
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

  const gsapLib = window.gsap;
  if (!gsapLib || reducedMotion) {
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
    gsapLib.to(controls.target, {
      x: look.x * 0.35,
      y: look.y * 0.4 + 0.05,
      z: look.z * 0.35,
      duration: 0.8,
      ease: 'power2.out',
    });

    await installPart(gsapLib, part, step.label, step.from, focusLight);
  }

  setLabel('Listo · RGB · fans · loop líquido · ROG RTX');
  gsapLib.to(camera.position, { x: 3.4, y: 1.35, z: 3.5, duration: 1.4, ease: 'power2.inOut' });
  gsapLib.to(controls.target, { x: 0, y: 0.05, z: -0.1, duration: 1.4, ease: 'power2.inOut' });
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

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 50);
  camera.position.set(3.6, 1.5, 3.8);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  scene.add(new THREE.AmbientLight(0x3a3550, 0.42));

  const key = new THREE.DirectionalLight(0xffffff, 1.6);
  key.position.set(5, 7, 4);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
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

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(5, 64),
    new THREE.MeshStandardMaterial({ color: 0x071018, metalness: 0.85, roughness: 0.3 })
  );
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -1.2;
  floor.receiveShadow = true;
  scene.add(floor);

  const glow = new THREE.Mesh(
    new THREE.RingGeometry(0.8, 2.2, 48),
    new THREE.MeshBasicMaterial({ color: 0xb84dff, transparent: true, opacity: 0.1, side: THREE.DoubleSide })
  );
  glow.rotation.x = -Math.PI / 2;
  glow.position.y = -1.18;
  scene.add(glow);

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
      controls.autoRotateSpeed = 0.9;
    }
  });

  const clock = new THREE.Clock();
  const tick = () => {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!visible) return;
    const t = clock.getElapsedTime();
    // ~28 rad/s — clearly visible spin on GPU + case fans
    const spinSpeed = reducedMotion ? 0 : assembling ? 14 : 28;

    fans.forEach((fan, i) => {
      const blades = fan.userData?.blades || fan.userData?.rotor;
      if (!blades) return;
      const dir = fan.userData.spinDir ?? (i % 2 ? -1 : 1);
      blades.rotation.z += spinSpeed * dir * dt;
    });

    if (!reducedMotion) {
      rgbMats.forEach((m, i) => {
        if (!m?.emissive) return;
        const hue = (t * 0.12 + i * 0.07) % 1;
        m.emissive.setHSL(hue, 0.95, 0.48);
        if (m.color && m.emissiveIntensity > 0.2) m.color.setHSL(hue, 0.85, 0.42);
        m.emissiveIntensity = 1.0 + Math.sin(t * 2.2 + i) * 0.4;
      });

      rim.intensity = 0.5 + Math.sin(t * 1.4) * 0.3;
      fill.intensity = 0.45 + Math.cos(t * 1.1) * 0.15;
      if (!assembling) root.position.y = Math.sin(t * 0.65) * 0.025;
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
