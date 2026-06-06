import crypto from 'crypto';

/**
 * Emite token CSRF para el formulario (Vercel Serverless).
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 16) {
    res.status(500).json({ error: 'CSRF_SECRET no configurado' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const signature = crypto.createHmac('sha256', secret).update(token).digest('hex');
  const secure = process.env.VERCEL_ENV === 'production' ? '; Secure' : '';

  res.setHeader(
    'Set-Cookie',
    `next_csrf=${token}.${signature}; Path=/; HttpOnly; SameSite=Lax; Max-Age=3600${secure}`
  );
  res.status(200).json({ token });
}
