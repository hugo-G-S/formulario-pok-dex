import { createContext, useContext, useState, useEffect } from 'react';

// ThemeContext.jsx
// Provee un contexto simple para manejar el tema (light/dark) de la aplicación.
// - Guarda la preferencia en localStorage para persistencia entre sesiones.
// - Añade el atributo `data-theme` al elemento body para permitir CSS theming.

const ThemeContext = createContext();

// Hook personalizado para consumir el contexto de tema
export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        // Protege contra uso fuera del Provider — ayuda en el desarrollo
        throw new Error('useTheme debe usarse dentro de ThemeProvider');
    }
    return context;
};

// Provider que envuelve la aplicación y expone `{ theme, toggleTheme }`
export const ThemeProvider = ({ children }) => {
    // Inicializar tema desde localStorage (si existe) o 'light' por defecto
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('appTheme');
        return savedTheme || 'light';
    });

    // Efecto que aplica el tema al body y lo persiste en localStorage
    useEffect(() => {
        // `data-theme` puede ser usado por CSS para aplicar variables
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('appTheme', theme);
    }, [theme]);

    // Alternar entre 'light' y 'dark'
    const toggleTheme = () => {
        setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

