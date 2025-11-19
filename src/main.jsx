import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global Error Handler for Mobile Debugging
window.onerror = function (message, source, lineno, colno, error) {
  const errorContainer = document.createElement('div');
  errorContainer.style.position = 'fixed';
  errorContainer.style.top = '0';
  errorContainer.style.left = '0';
  errorContainer.style.width = '100%';
  errorContainer.style.backgroundColor = 'red';
  errorContainer.style.color = 'white';
  errorContainer.style.padding = '20px';
  errorContainer.style.zIndex = '9999';
  errorContainer.style.wordBreak = 'break-word';
  errorContainer.innerText = `Error: ${message}\nSource: ${source}:${lineno}`;
  document.body.appendChild(errorContainer);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
