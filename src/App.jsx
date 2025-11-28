import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './ThemeContext';

import Login from './Login';
import Register from './Register';
import UserList from './UserList';
import UserEditForm from './UserEditForm';
import AccesoCorrecto from './AccesoCorrecto';

// Componentes de Pokémon
import PokemonForm from './PokemonForm';
import PokedexDisplay from './PokedexDisplay';
import PokemonEditForm from './PokemonEditForm';

function App() {
    return (
        <ThemeProvider>
            {/* AGREGA basename AQUÍ */}
            <Router basename="/formulario-pok-dex">
                <Routes>
                <Route path="/" element={<UserList />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/acceso-correcto" element={<AccesoCorrecto />} />

                <Route path="/usuarios" element={<UserList />} />
                <Route path="/usuarios/editar/:id" element={<UserEditForm />} />

                <Route path="/pokemon/agregar" element={<PokemonForm />} />
                <Route path="/pokedex" element={<PokedexDisplay />} />
                <Route path="/pokemon/editar/:id" element={<PokemonEditForm />} />
                </Routes>
            </Router>
        </ThemeProvider>
    );
}

export default App;