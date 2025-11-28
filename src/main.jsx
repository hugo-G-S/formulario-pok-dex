import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import './index.css' // Estilos base/reset
import './styles.css' // Estilos principales de la aplicación
import { ThemeProvider } from './ThemeContext'

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App />,
    errorElement: <div>¡Algo salió mal!</div>
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>,
)