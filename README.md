# Formulario React

Aplicación CRUD de usuarios construida con React (Vite) y PHP (API REST).

## Requisitos

- Node.js (v16 o superior)
- XAMPP con MySQL y Apache corriendo
- PHP 7.4 o superior

## Instalación

1. Instalar dependencias de React:
```bash
npm install
```

2. Configurar la base de datos:
   
   **Opción A - Instalación desde cero (RECOMENDADO):**
   - Abre phpMyAdmin (http://localhost/phpmyadmin)
   - Ve a la pestaña "SQL"
   - Copia y pega el contenido completo del archivo `database_setup.sql`
   - Ejecuta el script
   - Esto creará la base de datos `formulario` con todas las tablas y datos de ejemplo
   
   **Opción B - Si ya tienes la base de datos:**
   - Si ya tienes la base de datos pero falta el campo `numero_pokemon`:
   - Ejecuta el script `update_database.sql` para agregar el campo faltante
   
   **Estructura de tablas:**
   - Tabla `usuarios`: id, nombre, email, password, telefono, created_at
   - Tabla `pokemon`: id, numero_pokemon, nombre, tipo, nivel, habilidad, imagen_url, created_at, updated_at

3. Verificar configuración de conexión en `conexion.php`:
   - Host: `localhost`
   - Usuario: `root`
   - Contraseña: (vacía por defecto en XAMPP)
   - Base de datos: `formulario`

## Uso

1. Asegúrate de que XAMPP (Apache y MySQL) esté corriendo

2. Verificar la base de datos:
   - Si es la primera vez, ejecuta `database_setup.sql` (crea todo desde cero)
   - Si ya tienes la base de datos, ejecuta `update_database.sql` (solo actualiza campos)

3. Iniciar el servidor de desarrollo de React:
```bash
npm run dev
```

4. Abrir en el navegador:
```
http://localhost:3000
```

**Nota:** La aplicación funciona completamente desde el navegador. No necesitas PowerShell ni terminal adicional una vez que XAMPP y el servidor de desarrollo estén corriendo.

## Estructura del Proyecto

```
formulario/
├── src/              # Código fuente de React
│   ├── App.jsx           # Componente principal con router
│   ├── UsuariosList.jsx  # Lista de usuarios
│   ├── UsuarioForm.jsx   # Formulario agregar/editar
│   ├── Login.jsx         # Vista de login
│   ├── AccesoCorrecto.jsx # Vista después de login exitoso
│   └── styles.css        # Estilos
├── api/             # API REST en PHP
│   ├── usuarios.php # Endpoints CRUD
│   └── login.php    # Endpoint de autenticación
├── conexion.php     # Configuración de base de datos
├── package.json     # Dependencias de Node.js
└── vite.config.js   # Configuración de Vite
```

## Funcionalidades

- ✅ CRUD completo de usuarios (Crear, Leer, Actualizar, Eliminar)
- ✅ Campo de contraseña en usuarios (hash seguro con password_hash)
- ✅ Sistema de login con validación de credenciales
- ✅ Vista de acceso correcto después del login
- ✅ CRUD completo de Pokémon con imágenes
- ✅ Pokédex visual con carousel automático de imágenes
- ✅ Carta de Pokémon al hacer click en las imágenes del carousel
- ✅ Tabla de administración de Pokémon con editar/eliminar
- ✅ La contraseña nunca se muestra en la lista de usuarios

## API Endpoints

### Usuarios
- `GET /api/usuarios.php` - Obtener todos los usuarios
- `GET /api/usuarios.php/:id` - Obtener un usuario por ID
- `POST /api/usuarios.php` - Crear un usuario (incluye contraseña)
- `PUT /api/usuarios.php/:id` - Actualizar un usuario
- `DELETE /api/usuarios.php/:id` - Eliminar un usuario

### Autenticación
- `POST /api/login.php` - Iniciar sesión con email y contraseña

## Scripts

- `npm run dev` - Inicia servidor de desarrollo (puerto 3000)
- `npm run build` - Construye para producción
- `npm run preview` - Previsualiza build de producción

## Notas

- El proxy en `vite.config.js` redirige las llamadas `/api/*` a `http://localhost/formulario/api/*`
- Si cambias el puerto de Apache o la ruta del proyecto, actualiza `vite.config.js`
- **Credenciales de ejemplo** (incluidas en `database_setup.sql`):
  - Email: `admin@example.com` o `juan@example.com`
  - Contraseña: `admin123`
- Las imágenes de Pokémon se guardan en `public/images/pokemon/` - asegúrate de que esta carpeta tenga permisos de escritura

