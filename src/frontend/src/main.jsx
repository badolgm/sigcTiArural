import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Importamos el archivo de estilos principal (para Tailwind CSS)
import './index.css'; 

/**
 * Punto de entrada principal de la aplicación React.
 * Se encarga de montar el componente principal 'App' en el DOM.
 * Utiliza ReactDOM.createRoot para la inicialización.
 */

// Usamos el id 'root' definido en src/frontend/index.html
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
