<?php
// conexion.php
// Archivo encargado de establecer la conexión con la base de datos MySQL.
// Define las credenciales de conexión, crea una instancia de mysqli y
// deja la variable $conn preparada para su uso en otros scripts.

// Configuración de conexión (ajusta según tu entorno local)
$servername = "localhost";
$username = "root";  
$password = "";      
$dbname = "formulario"; 

// Crear la conexión utilizando la extensión mysqli
$conn = new mysqli($servername, $username, $password, $dbname);

// Si ocurre un error al conectarse, normalizamos $conn a null
// para que el resto de la aplicación pueda comprobar su existencia.
if ($conn->connect_error) {
    // No debemos imprimir credenciales ni detalles sensibles aquí.
    $conn = null;
}

// Uso esperado:
// include 'conexion.php';
// if ($conn) { /* usar $conn->query(...) */ }
