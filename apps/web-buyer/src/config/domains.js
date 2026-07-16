// Configuration simplifiée des domaines pour le web-client
const config = {
  development: {
    clientDomain: 'http://localhost:5174',
    backendDomain: 'http://localhost:3001'
  },
  production: {
    clientDomain: 'https://livelink.store',
    backendDomain: 'https://api.livelink.store'
  }
};

// Détecter l'environnement
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const environment = isDevelopment ? 'development' : 'production';

// Fonction pour obtenir le domaine client
export const getClientDomain = () => {
  return config[environment].clientDomain;
};

// Fonction pour obtenir le domaine backend
export const getBackendDomain = () => {
  return config[environment].backendDomain;
};

// Fonction pour construire le lien public d'un vendeur
export const getPublicLink = (sellerId) => {
  if (window.location.hostname.includes('livelink.store')) {
    return `https://livelink.store/${sellerId}`;
  } else {
    return `http://localhost:5174/${sellerId}`;
  }
};

// Fonction pour construire l'URL de l'API
export const getApiUrl = (endpoint) => {
  const backendDomain = config[environment].backendDomain;
  return `${backendDomain}/api${endpoint}`;
};

// Helper pour construire l'URL d'une image backend (QR code, preuve paiement, etc.)
export const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${getBackendDomain()}${path}`;
};

export default config; 