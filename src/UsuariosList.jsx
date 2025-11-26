import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// USANDO URL ABSOLUTA para evitar el proxy de VITE
const API_URL = 'http://localhost/formulario/api/usuarios.php'

// UsuariosList.jsx
// Muestra una tabla con los usuarios registrados y permite
// navegar a los formularios de agregar/editar y eliminar registros.
// - Consume `api/usuarios.php`.
// - Usa fetch para GET y DELETE. Maneja errores básicos y estados de carga.
function UsuariosList() {
  // Estado local
  const [usuarios, setUsuarios] = useState([]) // Lista de usuarios recibida desde la API
  const [error, setError] = useState(null) // Mensaje de error para mostrar en UI
  const [loading, setLoading] = useState(true) // Indicador de carga mientras se obtiene la lista
  const navigate = useNavigate()

  // Al montar el componente, cargar la lista de usuarios
  useEffect(() => {
    cargarUsuarios()
  }, [])

  // Función que obtiene usuarios desde la API
  // - Maneja el estado `loading` y captura errores de red / respuesta.
  const cargarUsuarios = async () => {
    try {
      setLoading(true)

      // Petición GET a la API. Esperamos un array JSON en la respuesta.
      const response = await fetch(API_URL)

      if (!response.ok) {
        // Si el status no es 2xx, lanzamos para entrar al catch
        throw new Error('Error al cargar usuarios desde el servidor')
      }

      const data = await response.json()

      // Actualizar la UI con los usuarios recibidos
      setUsuarios(data)
      setError(null)
    } catch (err) {
      // Manejo de errores que incluye el caso de "Unexpected token" cuando
      // la API no devuelve JSON válido (por ejemplo por un warning de PHP).
      setError(
        err.message.includes('Unexpected token')
          ? 'Error: La API no devolvió JSON válido. Revisar XAMPP/PHP.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  // Elimina un usuario por ID
  // - Pide confirmación al usuario
  // - Llama a DELETE en la API y recarga la lista si todo fue ok
  const eliminarUsuario = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) {
      return
    }

    try {
      // Nota: la API en este proyecto espera `?id=` para DELETE, pero aquí
      // se usa `${API_URL}/${id}` — si la API no soporta este formato,
      // reemplazar por `${API_URL}?id=${id}`.
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Error al eliminar usuario')
      }

      // Refrescar la lista tras eliminar
      cargarUsuarios()
    } catch (err) {
      // Mostrar alerta simple en fracaso (podemos mejorar mostrando en la UI)
      alert('Error al eliminar: ' + err.message)
    }
  }

  // Mostrar indicador de carga mientras se obtienen datos
  if (loading) {
    return (
      <div className="container">
        <p>Cargando...</p>
      </div>
    )
  }

  // Render principal: botones de acción, mensaje de error y tabla
  return (
    <div className="container">
      <h1>Usuarios</h1>
      <div style={{ marginBottom: '16px', display: 'flex', gap: '8px' }}>
        {/* Navegación a agregar usuario y login */}
        <Link to="/agregar" className="btn btn-primary">
          Agregar usuario
        </Link>
        <Link to="/login" className="btn btn-outline">
          Login
        </Link>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="alert alert-danger">
          Error al cargar usuarios: {error}
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th style={{ width: '200px' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {/* Si no hay usuarios, mostrar mensaje */}
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" className="empty">
                  No hay usuarios. Usa "Agregar usuario" para crear uno.
                </td>
              </tr>
            ) : (
              // Mapear cada usuario a una fila de la tabla
              usuarios.map((usuario) => (
                <tr key={usuario.id}>
                  <td>{usuario.id}</td>
                  <td>{usuario.nombre}</td>
                  <td>{usuario.email}</td>
                  <td>{usuario.telefono || ''}</td>
                  <td>
                    {/* Enlace a la página de edición (ruta debe manejarse en App.jsx) */}
                    <Link to={`/editar/${usuario.id}`} className="btn btn-outline">
                      Editar
                    </Link>
                    {/* Botón para eliminar; llama a eliminarUsuario */}
                    <button
                      className="btn btn-danger"
                      onClick={() => eliminarUsuario(usuario.id)}
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default UsuariosList