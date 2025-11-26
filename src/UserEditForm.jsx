import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost/formulario/api/usuarios.php';

// UserEditForm.jsx
// Este componente realiza las siguientes tareas principales:
// 1) Al montarse, solicita los datos del usuario por `id` usando GET.
// 2) Rellena el formulario con los datos recibidos para que el usuario los edite.
// 3) Al enviar, valida los campos mínimos y envía un PUT con los datos actualizados.
// 4) Si se proporciona una nueva contraseña, la incluye en el payload; si no,
//    mantiene la contraseña actual en la base de datos.
// Notas de seguridad: la API debe validar el usuario/roles en el servidor.
function UserEditForm() {
    // Obtener `id` desde la ruta y utilidad de navegación
    const { id } = useParams();
    const navigate = useNavigate();

    // Estado que contiene los valores del formulario
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        telefono: '',
        password: '' // Campo opcional: solo se envía si el usuario introduce una nueva contraseña
    });

    // Estados de UI
    const [loading, setLoading] = useState(true); // true mientras se carga el usuario
    const [error, setError] = useState(null); // Mensaje de error que se muestra en la UI
    const [isUpdating, setIsUpdating] = useState(false); // true mientras se envía el PUT

    // useEffect: cargar datos del usuario cuando cambie `id`
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Solicitar recurso: api/usuarios.php?id={id}
                const response = await fetch(`${API_URL}?id=${id}`);

                // Si el servidor devuelve un status no exitoso, lanzar error
                if (!response.ok) {
                    throw new Error('Error al cargar los datos del usuario.');
                }

                // Parsear JSON devuelto por la API
                const data = await response.json();

                // Si la API devuelve un objeto con `error`, propagarlo
                if (data.error) {
                    throw new Error(data.error);
                }

                // Rellenar el formulario con los valores recibidos (saneando nulls)
                setFormData({
                    nombre: data.nombre || '',
                    email: data.email || '',
                    telefono: data.telefono || '',
                    password: '' // Nunca rellenar la contraseña desde la API
                });
                setLoading(false);
            } catch (err) {
                // Guardar el error para mostrar en la UI
                setError(err.message);
                setLoading(false);
            }
        };

        fetchUser();
    }, [id]);

    // handleChange: actualiza `formData` a medida que el usuario escribe
    // Conserva la inmutabilidad del estado usando spread operator
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // handleSubmit: validar y enviar la actualización al servidor
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsUpdating(true);

        // Validación básica en cliente: nombre y email son obligatorios
        if (!formData.nombre || !formData.email) {
            setError('Nombre y email son obligatorios.');
            setIsUpdating(false);
            return;
        }

        // Construir payload con URLSearchParams para application/x-www-form-urlencoded
        // PHP puede leerlo con parse_str(file_get_contents('php://input'), $putData)
        const payload = new URLSearchParams();
        payload.append('id', id);
        payload.append('nombre', formData.nombre);
        payload.append('email', formData.email);
        payload.append('telefono', formData.telefono);

        // Solo incluir password si el usuario escribió una nueva contraseña
        if (formData.password && formData.password.trim() !== '') {
            payload.append('password', formData.password);
        }

        try {
            const response = await fetch(`${API_URL}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            // Intentar parsear JSON de respuesta
            const data = await response.json();

            // Validar que la API indique éxito
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error al actualizar el usuario.');
            }

            // Notificar al usuario y volver a la lista
            alert('Usuario actualizado con éxito!');
            navigate('/'); // Volver a la lista de usuarios
        } catch (err) {
            // Mostrar el mensaje de error devuelto por la API o de red
            setError(err.message);
        } finally {
            setIsUpdating(false);
        }
    };
    
    if (loading) {
        return <div className="container"><p>Cargando datos del usuario...</p></div>;
    }

    if (error && !formData.nombre) {
        return <div className="container"><p className="alert alert-danger">Error: {error}</p></div>;
    }

    return (
        <div className="container container-narrow">
            <h1>Editar Usuario: {formData.nombre}</h1>
            
            <div className="card">
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <label className="label" htmlFor="nombre">Nombre Completo</label>
                    <input 
                        className="input" 
                        type="text" 
                        id="nombre" 
                        name="nombre" 
                        value={formData.nombre} 
                        onChange={handleChange} 
                        required 
                        disabled={isUpdating} 
                    />

                    <label className="label" htmlFor="email">Email</label>
                    <input 
                        className="input" 
                        type="email" 
                        id="email" 
                        name="email" 
                        value={formData.email} 
                        onChange={handleChange} 
                        required 
                        disabled={isUpdating} 
                    />

                    <label className="label" htmlFor="telefono">Teléfono (Opcional)</label>
                    <input 
                        className="input" 
                        type="text" 
                        id="telefono" 
                        name="telefono" 
                        value={formData.telefono} 
                        onChange={handleChange} 
                        disabled={isUpdating} 
                    />

                    <label className="label" htmlFor="password">Nueva Contraseña (Opcional - Dejar vacío para no cambiar)</label>
                    <input 
                        className="input" 
                        type="password" 
                        id="password" 
                        name="password" 
                        value={formData.password} 
                        onChange={handleChange} 
                        placeholder="Dejar vacío para mantener la contraseña actual"
                        disabled={isUpdating} 
                    />

                    <div className="form-actions">
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                            disabled={isUpdating}
                        >
                            {isUpdating ? 'Actualizando...' : 'Guardar Cambios'}
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-outline" 
                            onClick={() => navigate('/')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UserEditForm;


