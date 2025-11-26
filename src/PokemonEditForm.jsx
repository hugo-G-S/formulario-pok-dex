import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const API_URL = 'http://localhost/formulario/api/pokemon.php'; 

// PokemonEditForm.jsx
// Carga datos del Pokémon por id y permite actualizar campos mediante PUT.
function PokemonEditForm() {
    const { id } = useParams(); // Obtiene el ID de la URL /pokemon/editar/:id
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        numero_pokemon: 0,
        nombre: '',
        tipo: '',
        nivel: 0,
        habilidad: '',
        imagen_url_existente: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false);

    // 1. Cargar datos del Pokémon
    useEffect(() => {
        const fetchPokemon = async () => {
            try {
                const response = await fetch(`${API_URL}?id=${id}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Error al cargar los datos del Pokémon.');
                }

                setFormData({
                    numero_pokemon: data.numero_pokemon || data.id,
                    nombre: data.nombre,
                    tipo: data.tipo,
                    nivel: data.nivel,
                    habilidad: data.habilidad || '',
                    imagen_url_existente: data.imagen_url || ''
                });
                setLoading(false);
            } catch (err) {
                setError(err.message);
                setLoading(false);
            }
        };

        fetchPokemon();
    }, [id]);

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
        setIsUpdating(true);
        
        // 2. Crear Payload para PUT (solo texto, imagen opcionalmente se maneja aparte)
        const payload = new URLSearchParams();
        payload.append('id', id);
        payload.append('numero_pokemon', formData.numero_pokemon);
        payload.append('nombre', formData.nombre);
        payload.append('tipo', formData.tipo);
        payload.append('nivel', formData.nivel);
        payload.append('habilidad', formData.habilidad);
        payload.append('imagen_url_existente', formData.imagen_url_existente); // Se envía la URL existente

        try {
            const response = await fetch(`${API_URL}`, {
                method: 'PUT',
                // Para PUT simple, usamos este Content-Type, que PHP lee con file_get_contents("php://input")
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: payload.toString()
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error al actualizar el Pokémon.');
            }

            alert('Pokémon actualizado con éxito!');
            navigate('/pokedex'); // Volver a la lista
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUpdating(false);
        }
    };
    
    if (loading) {
        return <div className="container"><p>Cargando datos del Pokémon...</p></div>;
    }

    if (error) {
        return <div className="container"><p className="alert alert-danger">Error: {error}</p></div>;
    }

    return (
        <div className="container container-narrow">
            <h1>Editar Pokémon: {formData.nombre}</h1>
            
            <div className="card">
                <form onSubmit={handleSubmit}>
                    <label className="label" htmlFor="numero_pokemon">Número del Pokémon</label>
                    <input className="input" type="number" id="numero_pokemon" name="numero_pokemon" value={formData.numero_pokemon} onChange={handleChange} min="1" required disabled={isUpdating} />

                    <label className="label" htmlFor="nombre">Nombre</label>
                    <input className="input" type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={isUpdating} />

                    <label className="label" htmlFor="tipo">Tipo (Ej: Fuego, Agua)</label>
                    <input className="input" type="text" id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required disabled={isUpdating} />
                    
                    <label className="label" htmlFor="nivel">Nivel</label>
                    <input className="input" type="number" id="nivel" name="nivel" value={formData.nivel} onChange={handleChange} min="1" required disabled={isUpdating} />

                    <label className="label" htmlFor="habilidad">Habilidad</label>
                    <input className="input" type="text" id="habilidad" name="habilidad" value={formData.habilidad} onChange={handleChange} disabled={isUpdating} />

                    <div style={{ marginTop: '15px' }}>
                        <p>Imagen actual:</p>
                        {formData.imagen_url_existente ? (
                            <img 
                                src={`http://localhost/formulario/${formData.imagen_url_existente}`} 
                                alt="Pokémon actual" 
                                style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }}
                            />
                        ) : (
                            <p>No hay imagen registrada.</p>
                        )}
                        <small style={{ display: 'block', marginTop: '5px', color: '#6b7280' }}>
                            (Para cambiar la imagen, necesitas implementar una solución de subida separada, o usar el método POST con ID.)
                        </small>
                    </div>

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
                            onClick={() => navigate('/pokedex')}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PokemonEditForm;