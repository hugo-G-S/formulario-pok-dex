import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost/formulario/api/usuarios.php'; 

// UserList.jsx
// Componente que muestra la lista de usuarios y permite eliminar o
// navegar a la edición. Consume `api/usuarios.php`.
function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);

            if (!response.ok) {
                const text = await response.text();
                throw new Error('Error al cargar la API de usuarios. Respuesta no OK. Detalle: ' + text.substring(0, 100));
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Esperamos un array de usuarios: [{id,nombre,email,telefono},...]
            setUsers(data);
            setError(null);
        } catch (err) {
            setError('Error al cargar usuarios: ' + (err.message.includes('Unexpected token') ? 'API no devuelve JSON válido. Revise la API.' : err.message));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm(`¿Estás seguro de que quieres eliminar al usuario con ID ${id}?`)) {
            return;
        }

        try {
            const response = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error desconocido al eliminar el usuario.');
            }

            alert('Usuario eliminado con éxito!');
            loadUsers();
        } catch (err) {
            setError('Error al eliminar usuario: ' + err.message);
        }
    };

    if (loading) {
        return <div className="container"><p>Cargando usuarios...</p></div>;
    }

    return (
        <div className="container">
            <h1>Administración de Usuarios</h1>
            
            <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Link to="/register" className="btn btn-primary">
                    Registrar Nuevo Usuario
                </Link>
                <Link to="/login" className="btn btn-outline">
                    Iniciar Sesión
                </Link>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="card">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="5">No hay usuarios registrados.</td>
                            </tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.nombre}</td>
                                    <td>{user.email}</td>
                                    <td>{user.telefono || 'N/A'}</td>
                                    <td>
                                        <button 
                                            onClick={() => navigate(`/usuarios/editar/${user.id}`)} 
                                            className="btn btn-outline" 
                                            style={{ marginRight: '5px' }}
                                        >
                                            Editar
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(user.id)} 
                                            className="btn btn-danger"
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
    );
}

export default UserList;