import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const API_URL = 'http://localhost/formulario/api/user.php';

// Login.jsx
// Componente de formulario de inicio de sesión. Envía credenciales al
// endpoint `api/user.php` con la acción `login`. Guarda user info en
// localStorage al autenticarse correctamente.
function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (localStorage.getItem('user_id')) {
            navigate('/acceso-correcto');
        }
    }, [navigate]);

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

        if (!formData.email || !formData.password) {
            setError('El email y la contraseña son obligatorios.');
            setLoading(false);
            return;
        }

        try {
            // Enviar petición POST con JSON { action: 'login', email, password }
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ action: 'login', ...formData })
            });

            const data = await response.json();

            // Validar respuesta
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Credenciales incorrectas o error desconocido.');
            }

            // Guardar información mínima del usuario en localStorage
            if (data.user) {
                localStorage.setItem('user_id', data.user.id);
                localStorage.setItem('user_name', data.user.nombre);
                localStorage.setItem('user_email', data.user.email);
            }

            alert('Inicio de sesión exitoso.');
            navigate('/acceso-correcto');

        } catch (err) {
            // Mensaje más amigable si la respuesta no fue JSON
            setError('Error de conexión con el servidor: ' +
                    (err.message.includes('Unexpected token') || err.message.includes('Failed to fetch')
                     ? 'API no devuelve JSON válido. Revise su XAMPP y el archivo api/user.php.'
                     : err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container container-narrow">
            <div className="card">
                <h1>Iniciar Sesión</h1>
                
                {error && (
                    <div className="alert alert-danger">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <label className="label" htmlFor="email">Email</label>
                    <input className="input" type="email" id="email" name="email" value={formData.email} onChange={handleChange} required disabled={loading} />

                    <label className="label" htmlFor="password">Contraseña</label>
                    <input className="input" type="password" id="password" name="password" value={formData.password} onChange={handleChange} required disabled={loading} />

                    <div className="form-actions">
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Verificando...' : 'Iniciar Sesión'}
                        </button>
                    </div>
                </form>

                <p style={{ marginTop: '15px' }}>
                    ¿No tienes cuenta? <Link to="/register">Registrarse aquí</Link>
                </p>
            </div>
        </div>
    );
}

export default Login;