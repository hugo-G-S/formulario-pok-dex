<?php
// api/usuarios.php
// Endpoint REST para operaciones CRUD sencillas sobre la tabla `usuarios`:
// - GET: obtener lista o detalle
// - PUT: actualizar usuario
// - DELETE: eliminar usuario

error_reporting(0);
ini_set('display_errors', 0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, PUT, DELETE, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../conexion.php';

if (!isset($conn) || $conn->connect_error) {
    http_response_code(500);
    die(json_encode(['error' => 'Error interno: No se pudo conectar a la base de datos.']));
}

// GET: detalle por id o lista completa
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $id = $_GET['id'] ?? null;

    if (!empty($id)) {
        $stmt = $conn->prepare("SELECT id, nombre, email, telefono FROM usuarios WHERE id = ?");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['error' => 'Error al preparar consulta: ' . $conn->error]);
            exit;
        }
        
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
        
        if ($user) {
            http_response_code(200);
            echo json_encode($user);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Usuario no encontrado.']);
        }
    } else {
        // Obtener todos los usuarios
        $sql = "SELECT id, nombre, email, telefono FROM usuarios ORDER BY id DESC";
        $result = $conn->query($sql);
        
        if ($result) {
            $users = $result->fetch_all(MYSQLI_ASSOC);
            http_response_code(200);
            echo json_encode($users);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener usuarios: ' . $conn->error]);
        }
    }

// DELETE: eliminar usuario por id
} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $id = $_GET['id'] ?? null;
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de usuario es obligatorio para eliminar.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM usuarios WHERE id = ?");
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Error en la preparación de la consulta DELETE: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Usuario eliminado con éxito.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al eliminar el usuario: ' . $stmt->error]);
    }
    
    $stmt->close();

// PUT: actualizar usuario (acepta password opcional)
} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    parse_str(file_get_contents("php://input"), $putData);
    
    $id = $putData['id'] ?? null;
    $nombre = trim($putData['nombre'] ?? '');
    $email = trim($putData['email'] ?? '');
    $telefono = trim($putData['telefono'] ?? '');
    $password = $putData['password'] ?? '';
    
    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID de usuario es obligatorio.']);
        exit;
    }
    
    if (empty($nombre) || empty($email)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Nombre y email son obligatorios.']);
        exit;
    }

    // Verificar que el email no pertenezca a otro usuario
    $stmt_check = $conn->prepare("SELECT id FROM usuarios WHERE email = ? AND id != ?");
    if (!$stmt_check) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al preparar consulta de verificación: ' . $conn->error]);
        exit;
    }
    
    $stmt_check->bind_param('si', $email, $id);
    if (!$stmt_check->execute()) {
        $error = $stmt_check->error;
        $stmt_check->close();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al verificar email: ' . $error]);
        exit;
    }
    
    $stmt_check->store_result();

    if ($stmt_check->num_rows > 0) {
        http_response_code(409); // Conflict
        $stmt_check->close();
        echo json_encode(['success' => false, 'error' => 'El email ya está registrado en otro usuario.']);
        exit;
    }
    $stmt_check->close();

    // Si se envía una contraseña, hashearla y actualizarla también
    if (!empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, email = ?, telefono = ?, password = ? WHERE id = ?");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param('ssssi', $nombre, $email, $telefono, $hashed_password, $id);
    } else {
        $stmt = $conn->prepare("UPDATE usuarios SET nombre = ?, email = ?, telefono = ? WHERE id = ?");
        if (!$stmt) {
            http_response_code(500);
            echo json_encode(['success' => false, 'error' => 'Error al preparar consulta: ' . $conn->error]);
            exit;
        }
        $stmt->bind_param('sssi', $nombre, $email, $telefono, $id);
    }

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Usuario actualizado con éxito.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Usuario no encontrado o no hubo cambios.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al actualizar el usuario: ' . $stmt->error]);
    }
    
    $stmt->close();
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}

$conn->close();
?>