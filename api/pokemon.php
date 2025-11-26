<?php
// api/pokemon.php
// API REST mínima para gestionar registros de Pokémon.
// Soporta GET (lista o detalle), POST (crear), PUT (actualizar) y DELETE (eliminar).
// Responde siempre JSON y maneja errores centralizados.

error_reporting(E_ALL);
ini_set('display_errors', 0); // No mostrar errores directamente en producción
ini_set('log_errors', 1);

// Función auxiliar para enviar errores en formato JSON y terminar la ejecución
function sendJsonError($message, $code = 500) {
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'error' => $message]);
    exit;
}

// Cabeceras comunes para la API
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS'); 
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Responder a preflight CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Capturar errores fatales y convertirlos en respuestas JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    sendJsonError("Error de PHP: $errstr en $errfile línea $errline");
});

register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        sendJsonError("Error fatal: " . $error['message']);
    }
});

// Cargar conexión a la base de datos
try {
    require_once __DIR__ . '/../conexion.php';
} catch (Exception $e) {
    sendJsonError('Error al cargar conexión: ' . $e->getMessage());
}

// Validar que la conexión exista y esté operativa
if (!isset($conn) || $conn === null || $conn->connect_error) {
    $errorMsg = isset($conn) && $conn->connect_error ? $conn->connect_error : 'Conexión no inicializada';
    sendJsonError('Error interno: No se pudo conectar a la base de datos. ' . $errorMsg);
}

// Maneja la subida de imágenes (si se envía un archivo 'imagen')
function handleImageUpload($nombre, &$imagen_url, $conn) {
    if (isset($_FILES['imagen']) && $_FILES['imagen']['error'] === UPLOAD_ERR_OK) {
        $fileTmpPath = $_FILES['imagen']['tmp_name'];
        $fileName = $_FILES['imagen']['name'];
        $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
        
        // Directorio de uploads relativo al proyecto
        $uploadDir = __DIR__ . '/../public/images/pokemon/';
        
        // Crear directorio si no existe
        if (!is_dir($uploadDir)) {
            if (!mkdir($uploadDir, 0777, true)) {
                sendJsonError('Error al crear el directorio de imágenes: ' . $uploadDir);
            }
        }

        // Generar nombre único y mover el archivo
        $newFileName = md5(time() . $nombre) . '.' . $fileExtension;
        $destPath = $uploadDir . $newFileName;

        if (move_uploaded_file($fileTmpPath, $destPath)) {
            // Guardar la ruta pública relativa para ser devuelta por la API
            $imagen_url = 'public/images/pokemon/' . $newFileName;
        } else {
            sendJsonError('Error al mover el archivo. Revise los permisos de la carpeta: ' . $uploadDir);
        }
    } elseif (isset($_FILES['imagen']) && $_FILES['imagen']['error'] !== UPLOAD_ERR_NO_FILE) {
        // Si se intentó subir un archivo pero ocurrió un error
        sendJsonError('Error de subida de archivo: Código ' . $_FILES['imagen']['error']);
    }
}

// Rutas de la API por método HTTP
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // GET: lista o detalle según exista parámetro id
    $id = $_GET['id'] ?? null;

    if ($id) {
        $stmt = $conn->prepare("SELECT id, numero_pokemon, nombre, tipo, nivel, habilidad, imagen_url FROM pokemon WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $pokemon = $result->fetch_assoc();
        $stmt->close();
        
        if ($pokemon) {
            http_response_code(200);
            echo json_encode($pokemon);
        } else {
            http_response_code(404);
            echo json_encode(['error' => 'Pokémon no encontrado.']);
        }
    } else {
        // Obtener lista ordenada por id descendente
        $sql = "SELECT id, numero_pokemon, nombre, tipo, nivel, habilidad, imagen_url FROM pokemon ORDER BY id DESC";
        $result = $conn->query($sql);
        
        if ($result) {
            $pokemones = $result->fetch_all(MYSQLI_ASSOC);
            http_response_code(200);
            echo json_encode($pokemones);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Error al obtener Pokémon: ' . $conn->error]);
        }
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // POST: crear nuevo Pokémon (acepta multipart/form-data para imagen)
    $numero_pokemon = (int)($_POST['numero_pokemon'] ?? 0);
    $nombre = trim($_POST['nombre'] ?? '');
    $tipo = trim($_POST['tipo'] ?? '');
    $nivel = (int)($_POST['nivel'] ?? 1);
    $habilidad = trim($_POST['habilidad'] ?? '');
    $imagen_url = null;

    // Validaciones básicas
    if (empty($nombre) || empty($tipo) || $numero_pokemon <= 0) {
        sendJsonError('El número, nombre y tipo del Pokémon son obligatorios.', 400);
    }

    // Procesar posible subida de imagen
    try {
        handleImageUpload($nombre, $imagen_url, $conn);
    } catch (Exception $e) {
        sendJsonError('Error al subir imagen: ' . $e->getMessage());
    }
    
    // Preparar y ejecutar inserción
    $stmt = $conn->prepare("INSERT INTO pokemon (numero_pokemon, nombre, tipo, nivel, habilidad, imagen_url) VALUES (?, ?, ?, ?, ?, ?)");
    
    if (!$stmt) {
        $error = $conn->error;
        if (strpos($error, 'Unknown column') !== false) {
            sendJsonError('Error: La tabla pokemon no tiene la estructura correcta. Ejecuta database_setup.sql. Detalle: ' . $error);
        }
        sendJsonError('Error en la preparación de la consulta: ' . $error);
    }
    
    $stmt->bind_param('ississ', $numero_pokemon, $nombre, $tipo, $nivel, $habilidad, $imagen_url); 
    
    if ($stmt->execute()) {
        http_response_code(201);
        echo json_encode(['success' => true, 'message' => 'Pokémon registrado con éxito.', 'id' => $conn->insert_id, 'imagen_url' => $imagen_url]);
    } else {
        $error = $stmt->error;
        if (strpos($error, 'Unknown column') !== false) {
            sendJsonError('Error: La tabla pokemon no tiene la estructura correcta. Ejecuta database_setup.sql. Detalle: ' . $error);
        }
        sendJsonError('Error al registrar el Pokémon: ' . $error);
    }
    
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // PUT: actualizar campos (no maneja subida de archivos por PUT en este endpoint)
    parse_str(file_get_contents("php://input"), $put_vars);
    
    $id = $put_vars['id'] ?? null;
    $numero_pokemon = (int)($put_vars['numero_pokemon'] ?? 0);
    $nombre = trim($put_vars['nombre'] ?? '');
    $tipo = trim($put_vars['tipo'] ?? '');
    $nivel = (int)($put_vars['nivel'] ?? 1);
    $habilidad = trim($put_vars['habilidad'] ?? '');
    $imagen_url_existente = $put_vars['imagen_url_existente'] ?? null;
    $imagen_url = $imagen_url_existente; // Mantener la imagen existente por defecto

    if (empty($id) || empty($nombre) || empty($tipo) || $numero_pokemon <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'ID, número, nombre y tipo del Pokémon son obligatorios para actualizar.']);
        exit;
    }

    $stmt = $conn->prepare("UPDATE pokemon SET numero_pokemon = ?, nombre = ?, tipo = ?, nivel = ?, habilidad = ? WHERE id = ?");

    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Error en la preparación de la consulta UPDATE: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param('issisi', $numero_pokemon, $nombre, $tipo, $nivel, $habilidad, $id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Pokémon actualizado con éxito.']);
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al actualizar el Pokémon: ' . $stmt->error]);
    }
    
    $stmt->close();

} elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    // DELETE: eliminar por id
    $id = $_GET['id'] ?? null;

    if (empty($id)) {
        http_response_code(400);
        echo json_encode(['error' => 'ID de Pokémon es obligatorio para eliminar.']);
        exit;
    }

    $stmt = $conn->prepare("DELETE FROM pokemon WHERE id = ?");
    
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['error' => 'Error en la preparación de la consulta DELETE: ' . $conn->error]);
        exit;
    }
    
    $stmt->bind_param('i', $id);
    
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Pokémon eliminado con éxito.']);
        } else {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Pokémon no encontrado.']);
        }
    } else {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Error al eliminar el Pokémon: ' . $stmt->error]);
    }
    
    $stmt->close();
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Método no permitido.']);
}

$conn->close();
?>