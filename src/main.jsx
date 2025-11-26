import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

// main.jsx
// Punto de entrada del bundle de React. Renderiza el componente <App />
// dentro del elemento con id 'root'. Mantener en StrictMode para ayudar
// a detectar problemas en desarrollo.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

