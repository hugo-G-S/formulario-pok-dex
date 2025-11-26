import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// AccesoCorrecto.jsx
// Página que se muestra tras un login exitoso. Lee la información del
// usuario desde localStorage y ofrece acciones (volver, ver Pokédex, logout).
function AccesoCorrecto() {
    const navigate = useNavigate();
    const [userName, setUserName] = useState('usuario');
    const [userEmail, setUserEmail] = useState('N/A');

    useEffect(() => {
        const name = localStorage.getItem('user_name');
        const email = localStorage.getItem('user_email');
        const id = localStorage.getItem('user_id');

        if (id) {
            setUserName(name || 'usuario');
            setUserEmail(email || 'N/A');
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('user_id');
        localStorage.removeItem('user_name');
        localStorage.removeItem('user_email');

        alert('Sesión cerrada con éxito.');
        navigate('/login');
    };

    return (
        <div className="container container-narrow">
            <div className="card">
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ color: '#10B981' }}> Acceso Correcto</h1>
                    <p>Bienvenido, **{userName}**</p> 
                    <p style={{ color: '#6B7280', fontSize: '0.9em' }}>
                        Email: **{userEmail}**
                    </p>
                </div>
                
                <div className="form-actions" style={{ marginTop: '20px', gap: '10px', flexDirection: 'column' }}>
                    
                    {/* BOTÓN: REGRESAR A LA LISTA */}
                    <Link to="/" className="btn btn-outline">
                        Regresar a la Lista
                    </Link>
                    
                    {/* BOTÓN: AGREGAR NUEVO POKÉMON */}
                    <Link to="/pokemon/agregar" className="btn btn-primary">
                        Agregar Nuevo Pokémón
                    </Link>
                    
                    {/* BOTÓN: VER POKÉDEX */}
                    <Link to="/pokedex" className="btn btn-outline" style={{ background: '#bfdbfe', color: '#1e40af', borderColor: '#93c5fd' }}>
                        Ver Pokédex
                    </Link>
                    
                    {/* BOTÓN: SALIR */}
                    <button 
                        onClick={handleLogout} 
                        className="btn btn-danger"
                    >
                        Salir
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AccesoCorrecto;