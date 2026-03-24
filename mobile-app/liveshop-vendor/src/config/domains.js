// Configuration des domaines selon l'environnement pour le dashboard vendeur
const config = {
  development: {
    clientDomain: 'http://localhost:5173', // Dashboard vendeur
    backendDomain: 'http://localhost:3001'
  },
  production: {
    clientDomain: 'https://space.livelink.store',
    backendDomain: 'https://api.livelink.store'
  }
};

// Détecter l'environnement - FORCER LA PRODUCTION pour space.livelink.store
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const environment = isDevelopment ? 'development' : 'production';

console.log('🔍 Configuration des domaines détectée (Dashboard Vendeur):');
console.log('- Hostname:', window.location.hostname);
console.log('- Environnement:', environment);
console.log('- Backend Domain:', config[environment].backendDomain);

// FORCER LA PRODUCTION si on est sur livelink.store
if (window.location.hostname.includes('livelink.store')) {
  console.log('🌐 Forçage de la configuration production pour livelink.store');
  config.development.backendDomain = 'https://api.livelink.store';
}

// Exporter la configuration actuelle
export const currentConfig = config[environment];

// Fonction utilitaire pour obtenir le domaine client
export const getClientDomain = () => {
  return currentConfig.clientDomain;
};

// Fonction utilitaire pour obtenir le domaine backend
export const getBackendDomain = () => {
  // FORCER LA PRODUCTION si on est sur livelink.store OU si pas localhost
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  if (!isLocalhost || window.location.hostname.includes('livelink.store')) {
    console.log('🌐 [BACKEND] Utilisation API production');
    return 'https://api.livelink.store';
  }
  
  console.log('🔧 [BACKEND] Utilisation API développement');
  return currentConfig.backendDomain;
};

// Helper pour obtenir l'URL complète (sans /api)
export const getBackendUrl = () => {
  const isProd = window.location.hostname.includes('livelink.store');
  return isProd ? 'https://api.livelink.store' : 'http://localhost:3001';
};

// Fonction pour construire l'URL de l'API
export const getApiUrl = (endpoint) => {
  const apiUrl = `${getBackendDomain()}/api${endpoint}`;
  console.log('🔗 URL API construite (Dashboard):', apiUrl);
  return apiUrl;
};

// Fonction pour construire le lien public d'un vendeur
export const getPublicLink = (sellerId) => {
  // Les liens publics doivent TOUJOURS pointer vers le web client public, pas vers le dashboard vendeur
  if (window.location.hostname.includes('livelink.store')) {
    // En production : utiliser livelink.store (web client public)
    return `https://livelink.store/${sellerId}`;
  } else {
    // En développement : utiliser localhost:5174 (web client public)
    return `http://localhost:5174/${sellerId}`;
  }
};

// Helper pour construire l'URL d'une image backend (QR code, preuve paiement, etc.)
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getBackendUrl()}${path}`;
};

export default config; 