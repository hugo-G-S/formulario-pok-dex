import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost/formulario/api/pokemon.php'; 

// srcAgregarPokemon.jsx -> AgregarPokemon
// Formulario simple para registrar Pokémon sin imagen. Envia JSON
// por POST a `api/pokemon.php`.
function AgregarPokemon() {
    const [formData, setFormData] = useState({
        nombre: '',
        tipo: '',
        nivel: 1,
        habilidad: ''
    });
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseInt(value) : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error desconocido al registrar Pokémon.');
            }

            alert('Pokémon registrado con éxito!');
            navigate('/'); // Redirigir a la página principal o de listado

        } catch (err) {
            setError(err.message.includes('Unexpected token') 
                     ? 'Error de conexión con la API de Pokémon. Revisar XAMPP.'
                     : err.message
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container container-narrow">
            <h1>Registrar Pokémon</h1>
            
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card">
                <form onSubmit={handleSubmit}>
                    <label className="label" htmlFor="nombre">Nombre</label>
                    <input className="input" type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={loading} />

                    <label className="label" htmlFor="tipo">Tipo</label>
                    <input className="input" type="text" id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required disabled={loading} />
                    
                    <label className="label" htmlFor="nivel">Nivel</label>
                    <input className="input" type="number" id="nivel" name="nivel" value={formData.nivel} onChange={handleChange} min="1" required disabled={loading} />

                    <label className="label" htmlFor="habilidad">Habilidad</label>
                    <input className="input" type="text" id="habilidad" name="habilidad" value={formData.habilidad} onChange={handleChange} disabled={loading} />

                    <div className="form-actions">
                        <button 
                            className="btn btn-primary" 
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Registrando...' : 'Registrar Pokémon'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AgregarPokemon;