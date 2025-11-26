import { useState, useEffect } from 'react';
import './CardCustomization.css';

const DEFAULT_CONFIG = {
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

const FONT_OPTIONS = [
    { value: 'Arial, sans-serif', label: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: '"Times New Roman", serif', label: 'Times New Roman' },
    { value: '"Courier New", monospace', label: 'Courier New' },
    { value: 'Verdana, sans-serif', label: 'Verdana' },
    { value: 'Tahoma, sans-serif', label: 'Tahoma' },
    { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
    { value: 'Impact, sans-serif', label: 'Impact' },
    { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS' },
    { value: '"Lucida Console", monospace', label: 'Lucida Console' }
];

function CardCustomization({ isOpen, onClose, onSave, pokemon }) {
    const [config, setConfig] = useState(DEFAULT_CONFIG);

    useEffect(() => {
        // Cargar configuración guardada para este Pokémon específico
        if (isOpen && pokemon) {
            const savedConfigs = localStorage.getItem('pokemonCardConfigs');
            if (savedConfigs) {
                try {
                    const allConfigs = JSON.parse(savedConfigs);
                    const pokemonConfig = allConfigs[pokemon.id];
                    if (pokemonConfig) {
                        setConfig({ ...DEFAULT_CONFIG, ...pokemonConfig });
                    } else {
                        setConfig(DEFAULT_CONFIG);
                    }
                } catch (e) {
                    console.error('Error al cargar configuración:', e);
                    setConfig(DEFAULT_CONFIG);
                }
            } else {
                setConfig(DEFAULT_CONFIG);
            }
        }
    }, [isOpen, pokemon]);

    const handleChange = (field, value) => {
        setConfig(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSave = () => {
        if (!pokemon) return;
        
        // Guardar configuración específica para este Pokémon
        const savedConfigs = localStorage.getItem('pokemonCardConfigs');
        let allConfigs = {};
        
        if (savedConfigs) {
            try {
                allConfigs = JSON.parse(savedConfigs);
            } catch (e) {
                console.error('Error al parsear configuraciones:', e);
            }
        }
        
        allConfigs[pokemon.id] = config;
        localStorage.setItem('pokemonCardConfigs', JSON.stringify(allConfigs));
        onSave(pokemon.id, config);
        alert(`Configuración guardada para ${pokemon.nombre}!`);
    };

    const handleReset = () => {
        if (!pokemon) return;
        
        setConfig(DEFAULT_CONFIG);
        
        // Eliminar configuración específica de este Pokémon
        const savedConfigs = localStorage.getItem('pokemonCardConfigs');
        if (savedConfigs) {
            try {
                const allConfigs = JSON.parse(savedConfigs);
                delete allConfigs[pokemon.id];
                localStorage.setItem('pokemonCardConfigs', JSON.stringify(allConfigs));
            } catch (e) {
                console.error('Error al restablecer configuración:', e);
            }
        }
        
        onSave(pokemon.id, DEFAULT_CONFIG);
        alert(`Configuración restablecida para ${pokemon.nombre}`);
    };

    if (!isOpen || !pokemon) return null;

    return (
        <div className="customization-overlay" onClick={onClose}>
            <div className="customization-modal" onClick={(e) => e.stopPropagation()}>
                <div className="customization-header">
                    <h2>Personalizar Tarjeta: {pokemon.nombre}</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="customization-content">
                    {/* Vista previa */}
                    <div className="preview-section">
                        <h3>Vista Previa</h3>
                        <div 
                            className="preview-card"
                            style={{
                                background: config.useGradient 
                                    ? `linear-gradient(135deg, ${config.backgroundColor1} 0%, ${config.backgroundColor2} 100%)`
                                    : config.backgroundColor1,
                                color: config.textColor,
                                fontFamily: config.fontFamily
                            }}
                        >
                            <div className="preview-header" style={{ borderBottomColor: config.borderColor }}>
                                <h3 style={{ 
                                    color: config.textColor,
                                    fontSize: `${config.fontSizeTitle}em`,
                                    fontFamily: config.fontFamily
                                }}>
                                    {pokemon.nombre}
                                </h3>
                                <span 
                                    className="preview-number"
                                    style={{ 
                                        background: config.numberBadgeColor,
                                        color: config.textColor,
                                        fontSize: `${config.fontSizeNumber}em`,
                                        fontFamily: config.fontFamily
                                    }}
                                >
                                    #{pokemon.numero_pokemon || pokemon.id}
                                </span>
                            </div>
                            <div 
                                className="preview-image"
                                style={{ background: config.imageBackgroundColor }}
                            >
                                {pokemon.imagen_url ? (
                                    <img 
                                        src={`http://localhost/formulario/${pokemon.imagen_url}`}
                                        alt={pokemon.nombre}
                                        style={{ maxWidth: '100%', maxHeight: '120px', objectFit: 'contain' }}
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                    />
                                ) : (
                                    <div className="preview-image-placeholder">Sin imagen</div>
                                )}
                            </div>
                            <div className="preview-stats">
                                <div className="preview-stat-row" style={{ borderBottomColor: config.borderColor }}>
                                    <span style={{ 
                                        color: config.labelColor,
                                        fontSize: `${config.fontSizeLabel}em`,
                                        fontFamily: config.fontFamily
                                    }}>
                                        Tipo:
                                    </span>
                                    <span style={{ 
                                        color: config.valueColor,
                                        fontSize: `${config.fontSizeValue}em`,
                                        fontFamily: config.fontFamily
                                    }}>
                                        {pokemon.tipo || 'N/A'}
                                    </span>
                                </div>
                                <div className="preview-stat-row" style={{ borderBottomColor: config.borderColor }}>
                                    <span style={{ 
                                        color: config.labelColor,
                                        fontSize: `${config.fontSizeLabel}em`,
                                        fontFamily: config.fontFamily
                                    }}>
                                        Nivel:
                                    </span>
                                    <span style={{ 
                                        color: config.valueColor,
                                        fontSize: `${config.fontSizeValue}em`,
                                        fontFamily: config.fontFamily
                                    }}>
                                        {pokemon.nivel || 'N/A'}
                                    </span>
                                </div>
                                <div className="preview-stat-row">
                                    <span style={{ 
                                        color: config.labelColor,
                                        fontSize: `${config.fontSizeLabel}em`,
                                        fontFamily: config.fontFamily
                                    }}>
                                        Habilidades:
                                    </span>
                                    <span style={{ 
                                        color: config.valueColor,
                                        fontSize: `${config.fontSizeValue}em`,
                                        fontFamily: config.fontFamily
                                    }}>
                                        {pokemon.habilidad || 'N/A'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controles de personalización */}
                    <div className="controls-section">
                        <h3>Configuración</h3>

                        {/* Fondo */}
                        <div className="control-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={config.useGradient}
                                    onChange={(e) => handleChange('useGradient', e.target.checked)}
                                />
                                Usar gradiente de fondo
                            </label>
                        </div>

                        {config.useGradient ? (
                            <>
                                <div className="control-group">
                                    <label>Color de fondo inicial:</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={config.backgroundColor1}
                                            onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            value={config.backgroundColor1}
                                            onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                            placeholder="#667eea"
                                        />
                                    </div>
                                </div>

                                <div className="control-group">
                                    <label>Color de fondo final:</label>
                                    <div className="color-input-group">
                                        <input
                                            type="color"
                                            value={config.backgroundColor2}
                                            onChange={(e) => handleChange('backgroundColor2', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            value={config.backgroundColor2}
                                            onChange={(e) => handleChange('backgroundColor2', e.target.value)}
                                            placeholder="#764ba2"
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="control-group">
                                <label>Color de fondo sólido:</label>
                                <div className="color-input-group">
                                    <input
                                        type="color"
                                        value={config.backgroundColor1}
                                        onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        value={config.backgroundColor1}
                                        onChange={(e) => handleChange('backgroundColor1', e.target.value)}
                                        placeholder="#667eea"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Colores de texto */}
                        <div className="control-group">
                            <label>Color de texto principal:</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={config.textColor}
                                    onChange={(e) => handleChange('textColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={config.textColor}
                                    onChange={(e) => handleChange('textColor', e.target.value)}
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Color de etiquetas:</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={config.labelColor}
                                    onChange={(e) => handleChange('labelColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={config.labelColor}
                                    onChange={(e) => handleChange('labelColor', e.target.value)}
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Color de valores:</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={config.valueColor}
                                    onChange={(e) => handleChange('valueColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={config.valueColor}
                                    onChange={(e) => handleChange('valueColor', e.target.value)}
                                    placeholder="#ffffff"
                                />
                            </div>
                        </div>

                        {/* Colores adicionales */}
                        <div className="control-group">
                            <label>Color de borde:</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={config.borderColor}
                                    onChange={(e) => handleChange('borderColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={config.borderColor}
                                    onChange={(e) => handleChange('borderColor', e.target.value)}
                                    placeholder="rgba(255, 255, 255, 0.3)"
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Color de fondo del número:</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={config.numberBadgeColor}
                                    onChange={(e) => handleChange('numberBadgeColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={config.numberBadgeColor}
                                    onChange={(e) => handleChange('numberBadgeColor', e.target.value)}
                                    placeholder="rgba(255, 255, 255, 0.2)"
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Color de fondo de imagen:</label>
                            <div className="color-input-group">
                                <input
                                    type="color"
                                    value={config.imageBackgroundColor}
                                    onChange={(e) => handleChange('imageBackgroundColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    value={config.imageBackgroundColor}
                                    onChange={(e) => handleChange('imageBackgroundColor', e.target.value)}
                                    placeholder="rgba(255, 255, 255, 0.1)"
                                />
                            </div>
                        </div>

                        {/* Configuración de Tipografía */}
                        <div className="control-group" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '2px solid #e0e0e0' }}>
                            <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>Tipografía</h4>
                        </div>

                        <div className="control-group">
                            <label>Tipo de fuente:</label>
                            <select
                                value={config.fontFamily}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    border: '2px solid #ddd',
                                    borderRadius: '8px',
                                    fontSize: '0.95em',
                                    fontFamily: config.fontFamily
                                }}
                            >
                                {FONT_OPTIONS.map((font) => (
                                    <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                                        {font.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="control-group">
                            <label>Tamaño de fuente - Título:</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="range"
                                    min="0.8"
                                    max="3"
                                    step="0.1"
                                    value={config.fontSizeTitle}
                                    onChange={(e) => handleChange('fontSizeTitle', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    min="0.8"
                                    max="3"
                                    step="0.1"
                                    value={config.fontSizeTitle}
                                    onChange={(e) => handleChange('fontSizeTitle', e.target.value)}
                                    style={{ width: '80px', padding: '8px', border: '2px solid #ddd', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Tamaño de fuente - Etiquetas:</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="range"
                                    min="0.6"
                                    max="2"
                                    step="0.1"
                                    value={config.fontSizeLabel}
                                    onChange={(e) => handleChange('fontSizeLabel', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    min="0.6"
                                    max="2"
                                    step="0.1"
                                    value={config.fontSizeLabel}
                                    onChange={(e) => handleChange('fontSizeLabel', e.target.value)}
                                    style={{ width: '80px', padding: '8px', border: '2px solid #ddd', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Tamaño de fuente - Valores:</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="range"
                                    min="0.8"
                                    max="2.5"
                                    step="0.1"
                                    value={config.fontSizeValue}
                                    onChange={(e) => handleChange('fontSizeValue', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    min="0.8"
                                    max="2.5"
                                    step="0.1"
                                    value={config.fontSizeValue}
                                    onChange={(e) => handleChange('fontSizeValue', e.target.value)}
                                    style={{ width: '80px', padding: '8px', border: '2px solid #ddd', borderRadius: '8px' }}
                                />
                            </div>
                        </div>

                        <div className="control-group">
                            <label>Tamaño de fuente - Número:</label>
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                <input
                                    type="range"
                                    min="0.6"
                                    max="2"
                                    step="0.1"
                                    value={config.fontSizeNumber}
                                    onChange={(e) => handleChange('fontSizeNumber', e.target.value)}
                                    style={{ flex: 1 }}
                                />
                                <input
                                    type="number"
                                    min="0.6"
                                    max="2"
                                    step="0.1"
                                    value={config.fontSizeNumber}
                                    onChange={(e) => handleChange('fontSizeNumber', e.target.value)}
                                    style={{ width: '80px', padding: '8px', border: '2px solid #ddd', borderRadius: '8px' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="customization-footer">
                    <button className="btn btn-secondary" onClick={handleReset}>
                        Restablecer
                    </button>
                    <button className="btn btn-primary" onClick={handleSave}>
                        Guardar Configuración
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CardCustomization;

