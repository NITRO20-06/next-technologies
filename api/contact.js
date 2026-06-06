import crypto from 'crypto';
import {
  anonymizeIp,
  buildContactMessage,
  contactIsHoneypotTriggered,
  isSafeWhatsappRedirect,
  loadSiteConfig,
  validateContact,
  whatsappUrl,
} from '../lib/contact.js';

const RATE_COOKIE = 'next_contact_rate';
const RATE_LIMIT = 10;
const RATE_WINDOW_SEC = 3600;

function verifyCsrf(body, cookieHeader) {
  const secret = process.env.CSRF_SECRET;
  const token = String(body.csrf_token ?? '');
  if (!secret || !token) return false;

  const cookies = Object.fromEntries(
    String(cookieHeader ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, v.join('=')])
  );

  const stored = cookies.next_csrf;
  if (!stored) return false;

  const [cookieToken, signature] = stored.split('.');
  if (!cookieToken || !signature || cookieToken !== token) return false;

  const expected = crypto.createHmac('sha256', secret).update(cookieToken).digest('hex');
  if (signature.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signature, 'utf8'), Buffer.from(expected, 'utf8'));
}

function rateLimitExceeded(cookieHeader) {
  const cookies = Object.fromEntries(
    String(cookieHeader ?? '')
      .split(';')
      .map((c) => c.trim().split('='))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, decodeURIComponent(v.join('='))])
  );

  const now = Math.floor(Date.now() / 1000);
  const raw = cookies[RATE_COOKIE];
  let count = 1;
  let start = now;

  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (now - parsed.start <= RATE_WINDOW_SEC) {
        count = parsed.count + 1;
        start = parsed.start;
      }
    } catch {
      /* nuevo bucket */
    }
  }

  return {
    exceeded: count > RATE_LIMIT,
    cookieValue: encodeURIComponent(JSON.stringify({ count, start })),
  };
}

function redirect(res, path) {
  res.writeHead(303, { Location: path });
  res.end();
}

function logContact(data, req) {
  if (process.env.SAVE_CONTACT_LOG !== 'true') return;
  const entry = {
    fecha: new Date().toISOString(),
    ...data,
    ip: anonymizeIp(
      String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim()
      || req.socket?.remoteAddress
      || ''
    ),
  };
  console.log('[contact]', JSON.stringify(entry));
}

export default function handler(req, res) {
  if (req.method !== 'POST') {
    redirect(res, '/');
    return;
  }

  const body = req.body ?? {};
  const config = loadSiteConfig();

  if (contactIsHoneypotTriggered(body)) {
    redirect(res, '/?contacto=ok#contacto');
    return;
  }

  const rate = rateLimitExceeded(req.headers.cookie);
  const secure = process.env.VERCEL_ENV === 'production' ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${RATE_COOKIE}=${rate.cookieValue}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${RATE_WINDOW_SEC}${secure}`
  );

  if (rate.exceeded) {
    redirect(res, '/?contacto=error&motivo=limite#contacto');
    return;
  }

  if (!verifyCsrf(body, req.headers.cookie)) {
    redirect(res, '/?contacto=error&motivo=sesion#contacto');
    return;
  }

  const result = validateContact(body);
  if (result.errors.length) {
    redirect(res, '/?contacto=error&motivo=datos#contacto');
    return;
  }

  logContact(result.data, req);

  const message = buildContactMessage(
    result.data.nombre,
    result.data.correo,
    result.data.telefono,
    result.data.mensaje,
    config.siteName
  );

  const waRedirect = whatsappUrl(config.whatsappNumber, message);
  if (waRedirect.length > 2048 || !isSafeWhatsappRedirect(waRedirect)) {
    redirect(res, '/?contacto=error&motivo=datos#contacto');
    return;
  }

  redirect(res, waRedirect);
}
