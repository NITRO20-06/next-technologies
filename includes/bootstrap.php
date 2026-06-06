<?php
declare(strict_types=1);

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/security.php';
require_once __DIR__ . '/functions.php';

if (session_status() === PHP_SESSION_NONE) {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $isHttps,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
    send_security_headers($isHttps);
} else {
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (int) $_SERVER['SERVER_PORT'] === 443);
    send_security_headers($isHttps);
}

if (empty($_SESSION['csrf_token'])) {
    session_regenerate_id(true);
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}

$waUrl = whatsapp_url();
$waFloatUrl = whatsapp_url('Hola NEXT TECHNOLOGIES, necesito información sobre soporte técnico.');
$contactError = isset($_GET['contacto']) && $_GET['contacto'] === 'error';
$contactErrorMsg = match ($_GET['motivo'] ?? '') {
    'sesion' => 'La sesión expiró. Recarga la página (F5) e intenta de nuevo.',
    'datos' => 'Revisa los datos: correo válido, teléfono con al menos 7 dígitos y mensaje de al menos 5 caracteres.',
    'limite' => 'Has enviado demasiados mensajes. Espera un momento e inténtalo de nuevo.',
    default => 'No se pudo enviar el mensaje. Intenta de nuevo.',
};
