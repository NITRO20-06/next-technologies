<?php
declare(strict_types=1);

/**
 * Cabeceras HTTP de seguridad y controles anti-abuso del formulario.
 */
function send_security_headers(bool $isHttps): void
{
    if (headers_sent()) {
        return;
    }

    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: geolocation=(), microphone=(), camera=()');

    if ($isHttps) {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
    }

    $csp = [
        "default-src 'self'",
        "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'",
        "style-src 'self' https://cdn.jsdelivr.net https://fonts.googleapis.com 'unsafe-inline'",
        "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net data:",
        "img-src 'self' data: https:",
        "frame-src https://www.google.com https://maps.google.com",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'self'",
    ];

    header('Content-Security-Policy: ' . implode('; ', $csp));
}

function is_safe_whatsapp_redirect(string $url): bool
{
    return (bool) preg_match('#^https://wa\.me/\d+(?:\?text=.*)?$#', $url);
}

function contact_is_honeypot_triggered(array $post): bool
{
    return trim((string) ($post['website'] ?? '')) !== '';
}

function contact_rate_limit_exceeded(int $limit = 10, int $windowSeconds = 3600): bool
{
    $key = 'contact_rate';
    $now = time();

    if (!isset($_SESSION[$key]) || !is_array($_SESSION[$key])) {
        $_SESSION[$key] = ['count' => 1, 'start' => $now];
        return false;
    }

    $bucket = &$_SESSION[$key];
    if ($now - (int) $bucket['start'] > $windowSeconds) {
        $bucket = ['count' => 1, 'start' => $now];
        return false;
    }

    $bucket['count'] = (int) $bucket['count'] + 1;
    return $bucket['count'] > $limit;
}

function anonymize_ip(string $ip): string
{
    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
        $parts = explode('.', $ip);
        $parts[3] = '0';
        return implode('.', $parts);
    }

    if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
        return (string) preg_replace('/:[^:]+$/', ':0', $ip);
    }

    return 'unknown';
}
