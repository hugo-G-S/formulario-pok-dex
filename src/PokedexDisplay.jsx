import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CardCustomization from './CardCustomization';
import { useTheme } from './ThemeContext';

// PokedexDisplay.jsx
// Componente principal para mostrar y administrar la Pokédex.
// - Carga la lista de Pokémon desde `api/pokemon.php`.
// - Muestra una tabla para administrar (editar/eliminar) entradas.
// - Muestra una vista detallada (carta) del Pokémon seleccionado.
// - Permite personalizar el estilo de la carta por Pokémon y guardar
//   estas configuraciones en `localStorage`.
// - Usa `CardCustomization` para editar los estilos de cada carta.
// URL del endpoint que devuelve/gestiona los Pokémon (backend PHP)
const API_URL = 'http://localhost/formulario/api/pokemon.php';
// URL base usada para construir rutas a imágenes u otros recursos públicos
const BASE_URL = 'http://localhost/formulario/'; 

// Configuración por defecto para la apariencia de la tarjeta
// (se usa cuando no hay configuración personalizada para un Pokémon)
const DEFAULT_CARD_CONFIG = {
    backgroundColor1: '#667eea',
    backgroundColor2: '#764ba2',
    useGradient: true,
    textColor: '#ffffff',
    labelColor: '#ffffff',
    valueColor: '#ffffff',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    numberBadgeColor: 'rgba(255, 255, 255, 0.2)',
    imageBackgroundColor: 'rgba(255, 255, 255, 0.1)',
    fontFamily: 'Arial, sans-serif',
    fontSizeTitle: '1.5',
    fontSizeLabel: '0.9',
    fontSizeValue: '1.1',
    fontSizeNumber: '0.9'
};

function PokedexDisplay() {
    // Estados principales
    // `pokemones`: array con los objetos devueltos por la API
    const [pokemones, setPokemones] = useState([]);
    // `error`: mensaje mostrado si ocurre un error en carga/operaciones
    const [error, setError] = useState(null);
    // `loading`: indicador de carga para la petición inicial
    const [loading, setLoading] = useState(true);
    // `selectedPokemon`: objeto del Pokémon actualmente seleccionado
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    // Controla la visibilidad del modal de personalización
    const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
    // Mapa de configuraciones de tarjeta por id de Pokémon (guardado en localStorage)
    const [pokemonConfigs, setPokemonConfigs] = useState({});
    // Tema global (claro/oscuro) desde el contexto
    const { theme, toggleTheme } = useTheme();
    // Hook de navegación de react-router
    const navigate = useNavigate();

    // Efecto de montaje: carga la lista de Pokémon y las configuraciones guardadas
    useEffect(() => {
        cargarPokemones();
        // Cargar configuraciones personalizadas desde localStorage (si existen)
        const savedConfigs = localStorage.getItem('pokemonCardConfigs');
        if (savedConfigs) {
            try {
                const parsed = JSON.parse(savedConfigs);
                setPokemonConfigs(parsed);
            } catch (e) {
                // Si el JSON está mal formado, solo lo registramos en consola
                console.error('Error al cargar configuraciones:', e);
            }
        }
    }, []);

    // Función que carga los Pokémon desde el backend
    // Maneja estado de `loading` y errores de red/JSON
    const cargarPokemones = async () => {
        try {
            setLoading(true);
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error('Error al obtener datos del servidor');
            }

            const data = await response.json();
            // Guardamos el array de Pokémon recibido desde la API
            setPokemones(data);
            setError(null);
        } catch (err) {
            // Detectamos errores típicos (respuesta no-JSON) y los mostramos legibles
            setError('Error al cargar la Pokédex: ' + (err.message.includes('Unexpected token') ? 'API no devuelve JSON.' : err.message));
        } finally {
            setLoading(false);
        }
    };

    // Elimina un Pokémon por id. Pregunta confirmación al usuario.
    // Después de eliminar, recarga la lista y limpia la selección si corresponde.
    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de que quieres eliminar este Pokémon?')) {
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
                throw new Error(data.error || 'Error al eliminar el Pokémon.');
            }

            alert('Pokémon eliminado con éxito!');
            // Volver a cargar para reflejar cambios
            cargarPokemones();
            if (selectedPokemon && selectedPokemon.id === id) {
                setSelectedPokemon(null);
            }
        } catch (err) {
            setError('Error al eliminar Pokémon: ' + err.message);
        }
    };

    // Redirige a la página de edición de Pokémon
    const handleEdit = (id) => {
        navigate(`/pokemon/editar/${id}`);
    };

    // Selecciona un Pokémon para mostrar su carta en el panel izquierdo
    const handlePokemonClick = (pokemon) => {
        setSelectedPokemon(pokemon);
    };

    // Cierra la sesión del usuario (limpia localStorage y vuelve al inicio)
    const handleLogout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');
        alert('Sesión cerrada con éxito.');
        navigate('/');
    };

    // Guarda la nueva configuración para la tarjeta de un Pokémon en el estado local
    // (se persiste en localStorage cuando el componente monta/guarda manualmente)
    const handleConfigSave = (pokemonId, newConfig) => {
        setPokemonConfigs(prev => ({
            ...prev,
            [pokemonId]: newConfig
        }));
        // Persistencia en localStorage: guardar inmediatamente para evitar pérdidas
        try {
            const next = { ...pokemonConfigs, [pokemonId]: newConfig };
            localStorage.setItem('pokemonCardConfigs', JSON.stringify(next));
        } catch (e) {
            console.error('No se pudo guardar la configuración en localStorage', e);
        }
    };

    // Recupera la configuración personalizada de un Pokémon o la configuración por defecto
    const getPokemonConfig = (pokemonId) => {
        return pokemonConfigs[pokemonId] || DEFAULT_CARD_CONFIG;
    };

    // Generadores de estilos inline basados en la configuración de tarjeta
    const getCardStyles = (pokemonId) => {
        const config = getPokemonConfig(pokemonId);
        return {
            background: config.useGradient 
                ? `linear-gradient(135deg, ${config.backgroundColor1} 0%, ${config.backgroundColor2} 100%)`
                : config.backgroundColor1,
            color: config.textColor,
            fontFamily: config.fontFamily
        };
    };

    const getHeaderStyles = (pokemonId) => {
        const config = getPokemonConfig(pokemonId);
        return {
            borderBottomColor: config.borderColor
        };
    };

    const getNumberBadgeStyles = (pokemonId) => {
        const config = getPokemonConfig(pokemonId);
        return {
            background: config.numberBadgeColor,
            color: config.textColor
        };
    };

    const getImageContainerStyles = (pokemonId) => {
        const config = getPokemonConfig(pokemonId);
        return {
            background: config.imageBackgroundColor
        };
    };

    const getStatRowStyles = (pokemonId) => {
        const config = getPokemonConfig(pokemonId);
        return {
            borderBottomColor: config.borderColor
        };
    };

    if (loading) {
        return <div className="container"><p>Cargando Pokédex...</p></div>;
    }

    return (
        <div className="container">
            {error && <div className="alert alert-danger">{error}</div>}

            {pokemones.length === 0 ? (
                <div className="card empty">
                    <p>No hay Pokémon registrados. ¡Captura el primero!</p>
                    <Link to="/pokemon/agregar" className="btn btn-primary" style={{ marginTop: '15px' }}>
                        Agregar Primer Pokémon
                    </Link>
                </div>
            ) : (
                <div className="pokedex-layout">
                    {/* Parte Superior - Título y Botones */}
                    <div className="pokedex-header">
                        <div className="pokedex-title-section">
                            <h1>Pokédex</h1>
                        </div>
                        <div className="pokedex-buttons-section">
                            <Link to="/pokemon/agregar" className="btn btn-primary">
                                Agregar Pokémon
                            </Link>
                            {selectedPokemon && (
                                <button 
                                    onClick={() => setIsCustomizationOpen(true)} 
                                    className="btn btn-outline"
                                    style={{ marginRight: '10px' }}
                                >
                                    Personalizar Tarjeta
                                </button>
                            )}
                            <button 
                                onClick={toggleTheme} 
                                className="btn btn-outline"
                                style={{ marginRight: '10px' }}
                                title={theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}
                            >
                                {theme === 'light' ? 'Tema Oscuro' : 'Tema Claro'}
                            </button>
                            <Link to="/" className="btn btn-outline">
                                Regresar a Usuarios
                            </Link>
                            <button onClick={handleLogout} className="btn btn-danger">
                                Cerrar Sesión
                            </button>
                        </div>
                    </div>

                    {/* Parte Media - Tabla y Carta de Pokémon */}
                    <div className="pokedex-main-content">
                        {/* Columna Izquierda - Carta de Pokémon */}
                        <div className="pokedex-card-section">
                            {selectedPokemon ? (
                                <div className="pokemon-card-modal">
                                    {(() => {
                                        const config = getPokemonConfig(selectedPokemon.id);
                                        return (
                                            <div className="pokemon-card-content" style={getCardStyles(selectedPokemon.id)}>
                                                <div className="pokemon-card-header" style={getHeaderStyles(selectedPokemon.id)}>
                                                    <h3 style={{ 
                                                        color: config.textColor,
                                                        fontSize: `${config.fontSizeTitle}em`,
                                                        fontFamily: config.fontFamily
                                                    }}>
                                                        {selectedPokemon.nombre}
                                                    </h3>
                                                    <span className="pokemon-card-number" style={{
                                                        ...getNumberBadgeStyles(selectedPokemon.id),
                                                        fontSize: `${config.fontSizeNumber}em`,
                                                        fontFamily: config.fontFamily
                                                    }}>
                                                        #{selectedPokemon.numero_pokemon || selectedPokemon.id}
                                                    </span>
                                                </div>
                                                <div className="pokemon-card-image" style={getImageContainerStyles(selectedPokemon.id)}>
                                                    <img 
                                                        src={selectedPokemon.imagen_url ? BASE_URL + selectedPokemon.imagen_url : 'https://via.placeholder.com/200?text=No+Image'} 
                                                        alt={selectedPokemon.nombre}
                                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/200?text=Error'; }}
                                                    />
                                                </div>
                                                <div className="pokemon-card-stats">
                                                    <div className="stat-row" style={getStatRowStyles(selectedPokemon.id)}>
                                                        <span className="stat-label" style={{ 
                                                            color: config.labelColor,
                                                            fontSize: `${config.fontSizeLabel}em`,
                                                            fontFamily: config.fontFamily
                                                        }}>
                                                            Tipo:
                                                        </span>
                                                        <span className="stat-value" style={{ 
                                                            color: config.valueColor,
                                                            fontSize: `${config.fontSizeValue}em`,
                                                            fontFamily: config.fontFamily
                                                        }}>
                                                            {selectedPokemon.tipo}
                                                        </span>
                                                    </div>
                                                    <div className="stat-row" style={getStatRowStyles(selectedPokemon.id)}>
                                                        <span className="stat-label" style={{ 
                                                            color: config.labelColor,
                                                            fontSize: `${config.fontSizeLabel}em`,
                                                            fontFamily: config.fontFamily
                                                        }}>
                                                            Nivel:
                                                        </span>
                                                        <span className="stat-value" style={{ 
                                                            color: config.valueColor,
                                                            fontSize: `${config.fontSizeValue}em`,
                                                            fontFamily: config.fontFamily
                                                        }}>
                                                            {selectedPokemon.nivel}
                                                        </span>
                                                    </div>
                                                    <div className="stat-row">
                                                        <span className="stat-label" style={{ 
                                                            color: config.labelColor,
                                                            fontSize: `${config.fontSizeLabel}em`,
                                                            fontFamily: config.fontFamily
                                                        }}>
                                                            Habilidades:
                                                        </span>
                                                        <span className="stat-value" style={{ 
                                                            color: config.valueColor,
                                                            fontSize: `${config.fontSizeValue}em`,
                                                            fontFamily: config.fontFamily
                                                        }}>
                                                            {selectedPokemon.habilidad || 'N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>
                            ) : (
                                <div className="pokemon-card-placeholder">
                                    <p>Haz click en un Pokémon para ver sus detalles</p>
                                </div>
                            )}
                        </div>

                        {/* Columna Derecha - Tabla */}
                        <div className="pokedex-table-section">
                            <h2>Administrar Pokémon</h2>
                            <div className="card table-container">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Imagen</th>
                                            <th>Nombre</th>
                                            <th>Tipo</th>
                                            <th>Nivel</th>
                                            <th>Habilidades</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pokemones.map((p) => (
                                            <tr key={p.id} className={selectedPokemon?.id === p.id ? 'selected-row' : ''}>
                                                <td>#{p.numero_pokemon || p.id}</td>
                                                <td>
                                                    <div className="table-image-square">
                                                        <img 
                                                            src={p.imagen_url ? BASE_URL + p.imagen_url : 'https://via.placeholder.com/50?text=N/A'} 
                                                            alt={p.nombre} 
                                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/50?text=Error'; }}
                                                        />
                                                    </div>
                                                </td>
                                                <td>{p.nombre}</td>
                                                <td>{p.tipo}</td>
                                                <td>{p.nivel}</td>
                                                <td>{p.habilidad || 'N/A'}</td>
                                                <td>
                                                    <button 
                                                        onClick={() => handleEdit(p.id)} 
                                                        className="btn btn-outline" 
                                                        style={{ marginRight: '5px' }}
                                                    >
                                                        Editar
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(p.id)} 
                                                        className="btn btn-danger"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Parte Inferior - Carrusel de Imágenes */}
                    <div className="pokedex-slider-section">
                        <h2>Pokémon Registrados</h2>
                        <div 
                            className="slider" 
                            style={{
                                '--pokemon-count': String(pokemones.length * 2),
                                '--single-set-width': String(pokemones.length * 160) + 'px'
                            }}
                        >
                            <div className="slide-track">
                                {/* Duplicar los pokemones para efecto circular infinito */}
                                {[...pokemones, ...pokemones].map((p, index) => (
                                    <div 
                                        key={`${p.id}-${index}`} 
                                        className={`slide pokemon-circle ${selectedPokemon?.id === p.id ? 'active' : ''}`}
                                        onClick={() => handlePokemonClick(p)}
                                    >
                                        <img 
                                            src={p.imagen_url ? BASE_URL + p.imagen_url : 'https://via.placeholder.com/150?text=No+Image'} 
                                            alt={p.nombre} 
                                            className="pokemon-circle-image"
                                            onError={(e) => { e.target.onerror = null; e.target.src = 'https://via.placeholder.com/150?text=Error'; }}
                                        />
                                        <div className="pokemon-circle-number">#{p.numero_pokemon || p.id}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Personalización */}
            <CardCustomization
                isOpen={isCustomizationOpen}
                onClose={() => setIsCustomizationOpen(false)}
                onSave={handleConfigSave}
                pokemon={selectedPokemon}
            />
        </div>
    );
}

export default PokedexDisplay;
