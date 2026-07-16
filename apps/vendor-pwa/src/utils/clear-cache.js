// Script pour nettoyer le cache et éviter les faux "hors ligne"
if ('serviceWorker' in navigator) {
  // Nettoyer tous les caches
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      console.log('🧹 Nettoyage du cache:', cacheName);
      caches.delete(cacheName);
    });
  });

  // Désinscrire le service worker actuel
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      console.log('🔄 Désinscription du service worker');
      registration.unregister();
    });
  });

  // Recharger la page après nettoyage
  setTimeout(() => {
    console.log('🔄 Rechargement de la page...');
    window.location.reload();
  }, 1000);
}

// Fonction pour forcer le nettoyage
export function clearAllCaches() {
  if ('serviceWorker' in navigator) {
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    }).then(() => {
      console.log('✅ Tous les caches ont été nettoyés');
    });
  }
}

// Fonction pour vérifier la connectivité
export function checkConnectivity() {
  return fetch('/api/health', { 
    method: 'HEAD',
    cache: 'no-cache',
    mode: 'no-cors'
  }).then(() => {
    console.log('✅ Connexion active');
    return true;
  }).catch(() => {
    console.log('❌ Pas de connexion');
    return false;
  });
}
