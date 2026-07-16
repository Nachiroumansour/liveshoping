import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/notifications.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import './utils/pwa-install.js'

createRoot(document.getElementById('root')).render(
  // <StrictMode> temporairement désactivé pour éviter les doubles notifications
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
  // </StrictMode>
)

// Capturer les liens et ouvrir dans l'app installée (si supporté)
if ('launchQueue' in window && 'setConsumer' in window.launchQueue) {
  window.launchQueue.setConsumer((launchParams) => {
    const target = launchParams?.targetURL;
    if (!target) return;
    try {
      const url = new URL(target, window.location.origin);
      const path = url.pathname + url.search + url.hash;
      window.history.pushState({}, '', path);
    } catch {
      window.location.href = target;
    }
  });
}
