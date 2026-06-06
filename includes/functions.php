<?php
declare(strict_types=1);

function str_len(string $value): int
{
    return function_exists('mb_strlen') ? mb_strlen($value) : strlen($value);
}

function str_truncate(string $value, int $max): string
{
    if (str_len($value) <= $max) {
        return $value;
    }
    return function_exists('mb_substr') ? mb_substr($value, 0, $max) : substr($value, 0, $max);
}

function sanitize_field(string $value, int $max = 500): string
{
    $value = trim(strip_tags($value));
    return str_truncate($value, $max);
}

function whatsapp_url(string $message = ''): string
{
    $url = 'https://wa.me/' . WHATSAPP_NUMBER;
    if ($message !== '') {
        $url .= '?text=' . rawurlencode($message);
    }
    return $url;
}

function build_contact_message(string $nombre, string $correo, string $telefono, string $mensaje): string
{
    return implode("\n", [
        '*Nuevo contacto — ' . SITE_NAME . '*',
        '',
        '*Nombre:* ' . $nombre,
        '*Correo:* ' . $correo,
        '*Teléfono:* ' . $telefono,
        '',
        '*Mensaje:*',
        $mensaje,
    ]);
}

function validate_contact(array $data): array
{
    $errors = [];
    $nombre = sanitize_field($data['nombre'] ?? '', 120);
    $correo = sanitize_field($data['correo'] ?? '', 120);
    $telefono = sanitize_field($data['telefono'] ?? '', 30);
    $mensaje = sanitize_field($data['mensaje'] ?? '', 2000);

    if ($nombre === '' || str_len($nombre) < 2) {
        $errors[] = 'nombre';
    }
    if ($correo === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'correo';
    }
    if ($telefono === '' || str_len(preg_replace('/\D/', '', $telefono)) < 7) {
        $errors[] = 'telefono';
    }
    if ($mensaje === '' || str_len($mensaje) < 5) {
        $errors[] = 'mensaje';
    }

    return [
        'errors' => $errors,
        'data' => compact('nombre', 'correo', 'telefono', 'mensaje'),
    ];
}

function save_contact_log(array $data): void
{
    if (!SAVE_CONTACT_LOG) {
        return;
    }
    try {
        if (!is_dir(CONTACT_LOG_DIR)) {
            mkdir(CONTACT_LOG_DIR, 0750, true);
        }
        $line = json_encode([
            'fecha' => date('c'),
            'nombre' => $data['nombre'],
            'correo' => $data['correo'],
            'telefono' => $data['telefono'],
            'mensaje' => $data['mensaje'],
            'ip' => anonymize_ip((string) ($_SERVER['REMOTE_ADDR'] ?? '')),
        ], JSON_UNESCAPED_UNICODE) . PHP_EOL;
        $logFile = CONTACT_LOG_DIR . '/contactos.log';
        @file_put_contents($logFile, $line, FILE_APPEND | LOCK_EX);
        if (is_file($logFile)) {
            @chmod($logFile, 0640);
        }
    } catch (Throwable) {
        // No bloquear el envío a WhatsApp si falla el log
    }
}

function verify_csrf(?string $token): bool
{
    return isset($_SESSION['csrf_token'])
        && is_string($token)
        && hash_equals($_SESSION['csrf_token'], $token);
}

function asset_version(string $relativePath): string
{
    $relativePath = str_replace('\\', '/', $relativePath);
    if (
        str_contains($relativePath, '..')
        || !preg_match('#^[a-zA-Z0-9_./-]+$#', $relativePath)
    ) {
        return (string) time();
    }

    $path = dirname(__DIR__) . '/' . ltrim($relativePath, '/');
    $real = realpath($path);
    $root = realpath(dirname(__DIR__));

    if ($real === false || $root === false || !str_starts_with($real, $root)) {
        return (string) time();
    }

    return file_exists($real) ? (string) filemtime($real) : (string) time();
}
