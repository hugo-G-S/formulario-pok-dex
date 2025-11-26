import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost/formulario/api/user.php';

// Register.jsx
// Componente para registrar nuevos usuarios. Envía un POST con
// `action: 'register'` al endpoint `api/user.php` y muestra errores
// amigables si la API no responde JSON.
function Register() {
    const [formData, setFormData] = useState({
        nombre: '',
        email: '',
        password: '',
        telefono: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (!formData.nombre || !formData.email || !formData.password) {
            setError('Todos los campos son obligatorios (excepto teléfono).');
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'register', ...formData })
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`La API no devolvió JSON. Respuesta: ${text.substring(0, 200)}`);
            }

            const data = await response.json();

            if (!response.ok || !data.success) {
                // Mostrar mensaje devuelto por la API cuando exista
                throw new Error(data.error || 'Error desconocido en el registro.');
            }

            alert('Usuario registrado con éxito! Ahora puedes iniciar sesión.');
            navigate('/login');
        } catch (err) {
            let errorMessage = err.message;

            if (err.message.includes('Unexpected token') || err.message.includes('JSON')) {
                errorMessage = 'Error de conexión con la API. Verifica que XAMPP esté corriendo y que la base de datos exista.';
            }

            setError('Error de registro: ' + errorMessage);
            console.error('Error completo:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container container-narrow">
            <div className="card">
                <h1>Registrar Usuario</h1>
                
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label className="label" htmlFor="nombre">Nombre Completo</label>
                    <input className="input" type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={loading} />

                    <label className="label" htmlFor="email">Email</label>
                    <input className="input" type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} />

                    <label className="label" htmlFor="password">Contraseña</label>
                    <input className="input" type="password" id="password" name="password" value={formData.password} onChange={handleChange} required disabled={loading} />

                    <label className="label" htmlFor="telefono">Teléfono (Opcional)</label>
                    <input className="input" type="text" id="telefono" name="telefono" value={formData.telefono} onChange={handleChange} disabled={loading} />

                    <div className="form-actions">
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar'}
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: '15px' }}>
                    ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;