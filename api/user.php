<?php
// api/user.php
// Endpoint para registrar y autenticar usuarios. Espera JSON en el body
// con la propiedad `action` = 'register' | 'login'. Responde JSON.

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

function sendJsonError($message, $code = 500) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

set_error_handler(function($errno, $errstr, $errfile, $errline) {
    sendJsonError("Error de PHP: $errstr en $errfile línea $errline");
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        sendJsonError("Error fatal: " . $error['message']);
    }
});

// Cargar conexión
try {
    require_once __DIR__ . '/../conexion.php';
} catch (Exception $e) {
    sendJsonError('Error al cargar conexión: ' . $e->getMessage());
}

if (!isset($conn) || $conn === null || $conn->connect_error) {
    $errorMsg = isset($conn) && $conn->connect_error ? $conn->connect_error : 'Conexión no inicializada';
    sendJsonError('Error interno: No se pudo conectar a la base de datos. ' . $errorMsg);
}

// Decodificar JSON recibido en el body
$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['action'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Acción no especificada.']);
    exit;
}

$action = $data['action'];

// Registro de usuario
if ($action === 'register') {
    
    $nombre = trim($data['nombre'] ?? '');
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';
    $telefono = trim($data['telefono'] ?? '');

    if (empty($nombre) || empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nombre, email y contraseña son obligatorios.']);
        exit;
    }

    // Verificar que el email no exista ya
    $stmt_check = $conn->prepare("SELECT id FROM usuarios WHERE email = ?");
    if (!$stmt_check) {
        sendJsonError('Error al preparar consulta de verificación: ' . $conn->error);
    }
    
    $stmt_check->bind_param('s', $email);
    if (!$stmt_check->execute()) {
        $error = $stmt_check->error;
        $stmt_check->close();
        sendJsonError('Error al verificar email: ' . $error);
    }
    
    $stmt_check->store_result();
    
    if ($stmt_check->num_rows > 0) {
        http_response_code(409);
        $stmt_check->close();
        echo json_encode(['success' => false, 'error' => 'El email ya está registrado.']);
        exit;
    }
    $stmt_check->close();

    // Hashear la contraseña antes de almacenar
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);

    $stmt_insert = $conn->prepare("INSERT INTO usuarios (nombre, email, password, telefono) VALUES (?, ?, ?, ?)");
    
    if (!$stmt_insert) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al preparar la consulta de registro: ' . $conn->error]);
        exit;
    }
    
    $stmt_insert->bind_param('ssss', $nombre, $email, $hashed_password, $telefono);
    
    if ($stmt_insert->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Usuario registrado con éxito.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al ejecutar el registro: ' . $stmt_insert->error]);
    }
    
    $stmt_insert->close();

// Login de usuario
} elseif ($action === 'login') {
    $email = trim($data['email'] ?? '');
    $password = $data['password'] ?? '';

    if (empty($email) || empty($password)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Email y contraseña son obligatorios.']);
        exit;
    }

    // Buscar usuario por email
    $stmt = $conn->prepare("SELECT id, nombre, email, password FROM usuarios WHERE email = ?");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $user = $result->fetch_assoc();
    $stmt->close();

    // Verificar contraseña
    if ($user && password_verify($password, $user['password'])) {
        http_response_code(200);
        echo json_encode([
            'success' => true, 
            'message' => 'Login exitoso.', 
            'user' => [
                'id' => $user['id'], 
                'nombre' => $user['nombre'], 
                'email' => $user['email']
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Email o contraseña incorrectos.']);
    }

} else {
    // Acción desconocida
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Acción no reconocida.']);
}

$conn->close();