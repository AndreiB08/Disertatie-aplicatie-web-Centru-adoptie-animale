import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

window.onerror = (message, source, lineno, colno, error) => {
  console.error("Global error captured:", { message, source, lineno, colno, error });
};

window.onunhandledrejection = (event) => {
  console.error("Unhandled promise rejection:", event.reason);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

console.log("React app successfully mounted.");