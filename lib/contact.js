/**
 * Lógica de contacto compartida (API Vercel).
 */

export function loadSiteConfig() {
  return {
    siteName: process.env.SITE_NAME || 'NEXT TECHNOLOGIES',
    whatsappNumber: process.env.WHATSAPP_NUMBER || '51935318443',
    whatsappDisplay: process.env.WHATSAPP_DISPLAY || '+51 935 318 443',
    contactEmail: process.env.CONTACT_EMAIL || 'ventas@next.net.pe',
    facebookUrl: process.env.FACEBOOK_URL || 'https://web.facebook.com/next.net.pe',
    instagramUrl: process.env.INSTAGRAM_URL || 'https://www.instagram.com/next.technologies/',
    location: process.env.LOCATION || 'Jaén, Perú',
    address: process.env.ADDRESS || 'Calle Zarumilla #1375, Jaén, Perú',
    mapsEmbed: process.env.MAPS_EMBED || '',
    mapsLink: process.env.MAPS_LINK || '',
    whatsappFloatMessage:
      process.env.WHATSAPP_FLOAT_MESSAGE
      || 'Hola NEXT TECHNOLOGIES, necesito información sobre soporte técnico.',
  };
}

export function strLen(value) {
  return [...value].length;
}

export function sanitizeField(value, max = 500) {
  const cleaned = String(value ?? '')
    .trim()
    .replace(/<[^>]*>/g, '');
  return cleaned.length > max ? cleaned.slice(0, max) : cleaned;
}

export function validateContact(data) {
  const errors = [];
  const nombre = sanitizeField(data.nombre, 120);
  const correo = sanitizeField(data.correo, 120);
  const telefono = sanitizeField(data.telefono, 30);
  const mensaje = sanitizeField(data.mensaje, 2000);

  if (!nombre || strLen(nombre) < 2) errors.push('nombre');
  if (!correo || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) errors.push('correo');
  if (!telefono || strLen(telefono.replace(/\D/g, '')) < 7) errors.push('telefono');
  if (!mensaje || strLen(mensaje) < 5) errors.push('mensaje');

  return {
    errors,
    data: { nombre, correo, telefono, mensaje },
  };
}

export function buildContactMessage(nombre, correo, telefono, mensaje, siteName = 'NEXT TECHNOLOGIES') {
  return [
    `*Nuevo contacto — ${siteName}*`,
    '',
    `*Nombre:* ${nombre}`,
    `*Correo:* ${correo}`,
    `*Teléfono:* ${telefono}`,
    '',
    '*Mensaje:*',
    mensaje,
  ].join('\n');
}

export function whatsappUrl(number, message = '') {
  const base = `https://wa.me/${String(number).replace(/\D/g, '')}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export function isSafeWhatsappRedirect(url) {
  return /^https:\/\/wa\.me\/\d+(?:\?text=.*)?$/.test(url);
}

export function contactIsHoneypotTriggered(body) {
  return String(body.website ?? '').trim() !== '';
}

export function anonymizeIp(ip) {
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split('.');
    parts[3] = '0';
    return parts.join('.');
  }
  if (ip.includes(':')) {
    return ip.replace(/:[^:]+$/, ':0');
  }
  return 'unknown';
}
