<?php
declare(strict_types=1);

require_once __DIR__ . '/includes/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: index.php', true, 303);
    exit;
}

if (contact_is_honeypot_triggered($_POST)) {
    header('Location: index.php?contacto=ok#contacto', true, 303);
    exit;
}

if (contact_rate_limit_exceeded()) {
    header('Location: index.php?contacto=error&motivo=limite#contacto', true, 303);
    exit;
}

if (!verify_csrf($_POST['csrf_token'] ?? null)) {
    header('Location: index.php?contacto=error&motivo=sesion#contacto', true, 303);
    exit;
}

$result = validate_contact($_POST);

if (!empty($result['errors'])) {
    header('Location: index.php?contacto=error&motivo=datos#contacto', true, 303);
    exit;
}

$data = $result['data'];
save_contact_log($data);

$message = build_contact_message(
    $data['nombre'],
    $data['correo'],
    $data['telefono'],
    $data['mensaje']
);

$waRedirect = whatsapp_url($message);
if (strlen($waRedirect) > 2048 || !is_safe_whatsapp_redirect($waRedirect)) {
    header('Location: index.php?contacto=error&motivo=datos#contacto', true, 303);
    exit;
}

$_SESSION['csrf_token'] = bin2hex(random_bytes(32));

header('Location: ' . $waRedirect, true, 303);
exit;
