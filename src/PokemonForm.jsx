import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// API endpoint para registrar Pokémon
const API_URL = 'http://localhost/formulario/api/pokemon.php';

// PokemonForm.jsx
// Formulario para registrar un nuevo Pokémon con los siguientes campos:
// - número del Pokémon (requerido)
// - nombre (requerido)
// - tipo (requerido)
// - nivel (requerido, mínimo 1)
// - habilidades (opcional)
// - imagen del Pokémon (opcional, solo archivos de imagen)
// 
// Usa FormData para soportar la subida de archivos. Al registrar exitosamente,
// muestra un mensaje de éxito y permite agregar otro Pokémon o navegar a la Pokédex.
function PokemonForm() {
    // Estados del formulario
    const [formData, setFormData] = useState({
        numero_pokemon: '', // Número único del Pokémon
        nombre: '', // Nombre del Pokémon (ej: Pikachu)
        tipo: '', // Tipo del Pokémon (ej: Eléctrico)
        nivel: 1, // Nivel del Pokémon (mínimo 1)
        habilidad: '', // Habilidades especiales (opcional)
        imagen: null // Archivo de imagen (opcional)
    });

    // Estados de UI
    const [error, setError] = useState(null); // Mensaje de error a mostrar
    const [loading, setLoading] = useState(false); // Indicador si está enviando la petición
    const [success, setSuccess] = useState(false); // Si el registro fue exitoso
    const navigate = useNavigate();

    // Manejador de cambios en los inputs del formulario
    // - Para inputs de tipo "file", extrae el archivo del array `files[0]`
    // - Para inputs de tipo "number", convierte a entero con parseInt
    // - Para otros inputs, usa el valor tal cual
    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: type === 'file' ? files[0] : (type === 'number' ? parseInt(value) : value)
        }));
    };

    // Manejador del envío del formulario
    // - Previene el comportamiento por defecto del form (recarga de página)
    // - Limpia errores previos y activa el indicador de carga
    // - Construye un FormData (multipart/form-data) para incluir archivos
    // - Envía POST a la API y valida la respuesta
    // - Maneja errores de red y de respuesta con mensajes amigables
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Crear FormData para soportar archivos (imagen)
        // El navegador establece automáticamente Content-Type: multipart/form-data
        const formPayload = new FormData();
        formPayload.append('numero_pokemon', formData.numero_pokemon);
        formPayload.append('nombre', formData.nombre);
        formPayload.append('tipo', formData.tipo);
        formPayload.append('nivel', formData.nivel);
        formPayload.append('habilidad', formData.habilidad);

        // Adjuntar archivo de imagen solo si el usuario seleccionó uno
        if (formData.imagen) {
            formPayload.append('imagen', formData.imagen);
        }

        try {
            // Enviar petición POST a la API
            const response = await fetch(API_URL, {
                method: 'POST',
                body: formPayload
            });

            // Validar que la respuesta sea JSON válido
            // Algunos errores de PHP o servidor pueden devolver HTML en lugar de JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                throw new Error(`La API no devolvió JSON. Respuesta: ${text.substring(0, 200)}`);
            }

            // Parsear la respuesta JSON
            const data = await response.json();

            // Validar que el servidor reportó éxito (status 2xx y success: true)
            if (!response.ok || !data.success) {
                throw new Error(data.error || 'Error desconocido al registrar Pokémon.');
            }

            // Registro exitoso: mostrar mensaje de éxito y limpiar el formulario
            setSuccess(true);
            setFormData({
                numero_pokemon: '',
                nombre: '',
                tipo: '',
                nivel: 1,
                habilidad: '',
                imagen: null
            });

        } catch (err) {
            // Capturar errores de red, parsing JSON o respuesta de API
            let errorMessage = err.message;

            // Si el error es por JSON inválido, proporcionar un mensaje más útil
            if (err.message.includes('Unexpected token') || err.message.includes('JSON')) {
                errorMessage = 'Error de conexión con la API. Verifica que XAMPP esté corriendo y que la tabla pokemon exista con la estructura correcta.';
            }

            setError('Error de registro: ' + errorMessage);
            console.error('Error completo:', err);
        } finally {
            // Terminar el indicador de carga en ambos casos (éxito o error)
            setLoading(false);
        }
    };

    return (
        <div className="container container-narrow">
            <h1>Registrar Pokémon</h1>
            
            {/* Mostrar mensaje de error si existe */}
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="card">
                {/* Si el registro fue exitoso, mostrar mensaje de éxito y opciones */}
                {success ? (
                    <div>
                        <div className="alert" style={{ backgroundColor: '#d1fae5', color: '#065f46', border: '1px solid #10b981', marginBottom: '20px' }}>
                            <strong>¡Pokémon registrado con éxito!</strong>
                        </div>
                        <div className="form-actions" style={{ flexDirection: 'column', gap: '10px' }}>
                            <button 
                                className="btn btn-primary" 
                                onClick={() => {
                                    setSuccess(false);
                                    setError(null);
                                }}
                            >
                                Agregar Otro Pokémon
                            </button>
                            <button 
                                className="btn btn-outline" 
                                onClick={() => navigate('/pokedex')}
                            >
                                Ver Pokédex
                            </button>
                        </div>
                    </div>
                ) : (
                    // Mostrar el formulario si aún no se registró exitosamente
                    <form onSubmit={handleSubmit} encType="multipart/form-data"> 
                        {/* Campo número del Pokémon (requerido) */}
                        <label className="label" htmlFor="numero_pokemon">Número del Pokémon</label>
                        <input className="input" type="number" id="numero_pokemon" name="numero_pokemon" value={formData.numero_pokemon} onChange={handleChange} min="1" required disabled={loading} />

                        {/* Campo nombre del Pokémon (requerido) */}
                        <label className="label" htmlFor="nombre">Nombre</label>
                        <input className="input" type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required disabled={loading} />

                        {/* Campo tipo del Pokémon (requerido) */}
                        <label className="label" htmlFor="tipo">Tipo (Ej: Fuego, Agua)</label>
                        <input className="input" type="text" id="tipo" name="tipo" value={formData.tipo} onChange={handleChange} required disabled={loading} />
                        
                        {/* Campo nivel del Pokémon (requerido, mínimo 1) */}
                        <label className="label" htmlFor="nivel">Nivel</label>
                        <input className="input" type="number" id="nivel" name="nivel" value={formData.nivel} onChange={handleChange} min="1" required disabled={loading} />

                        {/* Campo habilidades del Pokémon (opcional) */}
                        <label className="label" htmlFor="habilidad">Habilidades</label>
                        <input className="input" type="text" id="habilidad" name="habilidad" value={formData.habilidad} onChange={handleChange} disabled={loading} />
                        
                        {/* Campo para subir imagen (opcional, solo archivos de imagen) */}
                        <label className="label" htmlFor="imagen">Imagen del Pokémon</label>
                        <input className="input" type="file" id="imagen" name="imagen" onChange={handleChange} accept="image/*" disabled={loading} />

                        <div className="form-actions">
                            {/* Botón para enviar el formulario (deshabilitado mientras carga) */}
                            <button 
                                className="btn btn-primary" 
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Registrando...' : 'Registrar Pokémon'}
                            </button>
                            {/* Botón para cancelar y volver a la Pokédex */}
                            <button 
                                className="btn btn-outline" 
                                type="button"
                                onClick={() => navigate('/pokedex')}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default PokemonForm;