import { Routes, Route } from 'react-router-dom'
import UserList from './UserList'
import Login from './Login'
import Register from './Register'
import AccesoCorrecto from './AccesoCorrecto'
import PokedexDisplay from './PokedexDisplay'
import PokemonForm from './PokemonForm'
import PokemonEditForm from './PokemonEditForm'
import UserEditForm from './UserEditForm'

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Ruta principal - Lista de usuarios */}
        <Route path="/" element={<UserList />} />
        
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/acceso-correcto" element={<AccesoCorrecto />} />
        
        {/* Rutas de Pokémon */}
        <Route path="/pokedex" element={<PokedexDisplay />} />
        <Route path="/pokemon/agregar" element={<PokemonForm />} />
        <Route path="/pokemon/editar/:id" element={<PokemonEditForm />} />
        
        {/* Rutas de usuarios */}
        <Route path="/usuarios/editar/:id" element={<UserEditForm />} />
      </Routes>
    </div>
  )
}

export default App