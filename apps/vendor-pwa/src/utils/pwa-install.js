// PWA Installation Helper
let deferredPrompt;
let installButton = null;
let userDismissed = false; // Track si l'utilisateur a déjà refusé

// Détection plateforme
function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
}

function isAndroidChrome() {
  return /Android/.test(navigator.userAgent) && /Chrome\//.test(navigator.userAgent);
}

// Vérifier la connectivité réelle
function checkRealConnectivity() {
  return new Promise((resolve) => {
    // Test avec une requête simple
    fetch('/favicon.jpg', { 
      method: 'HEAD',
      cache: 'no-cache',
      mode: 'no-cors'
    }).then(() => {
      resolve(true);
    }).catch(() => {
      // Si ça échoue, tester avec une URL externe
      fetch('https://www.google.com/favicon.ico', { 
        method: 'HEAD',
        mode: 'no-cors'
      }).then(() => {
        resolve(true);
      }).catch(() => {
        resolve(false);
      });
    });
  });
}

// Masquer le message "hors ligne" si on est connecté
function hideOfflineMessage() {
  const offlineElements = document.querySelectorAll('[data-offline], .offline-message, [class*="offline"]');
  offlineElements.forEach(element => {
    element.style.display = 'none';
  });
}

// Vérifier la connectivité au chargement
document.addEventListener('DOMContentLoaded', async () => {
  const isOnline = await checkRealConnectivity();
  if (isOnline) {
    hideOfflineMessage();
  }
});

// Écouter les changements de connectivité
window.addEventListener('online', () => {
  console.log('🌐 Connexion rétablie');
  hideOfflineMessage();
});

window.addEventListener('offline', () => {
  console.log('📴 Connexion perdue');
});

// Écouter l'événement beforeinstallprompt
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('🚀 PWA install prompt triggered');
  
  // Empêcher l'affichage automatique du prompt
  e.preventDefault();
  
  // Stocker l'événement pour l'utiliser plus tard
  deferredPrompt = e;
  
  // Afficher un bouton d'installation personnalisé
  showInstallButton();
  
  // Debug: vérifier les critères PWA
  console.log('📱 PWA Criteria Check:');
  console.log('- HTTPS:', location.protocol === 'https:');
  console.log('- Manifest:', document.querySelector('link[rel="manifest"]') !== null);
  console.log('- Service Worker:', 'serviceWorker' in navigator);
  console.log('- Icons:', document.querySelectorAll('link[rel="icon"]').length > 0);
});

// Fonction pour afficher le bouton d'installation
function showInstallButton() {
  // Vérifier si un bouton existe déjà
  let installButton = document.getElementById('pwa-install-button');
  
  if (installButton) {
    console.log('⚠️ Bouton PWA déjà existant, ignoré');
    return;
  }
  
  // Vérifier si l'app est déjà installée
  if (checkIfAppIsInstalled()) {
    console.log('✅ App déjà installée, pas de bouton');
    return;
  }
  
  // Vérifier si l'utilisateur a déjà refusé
  if (userDismissed) {
    console.log('⚠️ Utilisateur a déjà refusé, pas de bouton');
    return;
  }
  
  if (!installButton) {
    installButton = document.createElement('div');
    installButton.id = 'pwa-install-button';
    installButton.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>📱 Installer l'app</span>
        <button id="pwa-close-btn" style="
          background: none;
          border: none;
          color: white;
          font-size: 16px;
          cursor: pointer;
          padding: 0;
          margin-left: 8px;
        ">×</button>
      </div>
    `;
    installButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #8B5CF6;
      color: white;
      border: none;
      padding: 12px 20px;
      border-radius: 25px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
      z-index: 1000;
      transition: all 0.3s ease;
    `;
    
    // Ajouter des effets hover
    installButton.addEventListener('mouseenter', () => {
      installButton.style.transform = 'translateY(-2px)';
      installButton.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
    });
    
    installButton.addEventListener('mouseleave', () => {
      installButton.style.transform = 'translateY(0)';
      installButton.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
    });
    
    // Gérer le clic principal
    installButton.addEventListener('click', (e) => {
      if (e.target.id !== 'pwa-close-btn') {
        installPWA();
      }
    });
    
    // Gérer le bouton de fermeture
    const closeBtn = installButton.querySelector('#pwa-close-btn');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      userDismissed = true;
      installButton.style.opacity = '0';
      installButton.style.transform = 'translateY(20px)';
      setTimeout(() => {
        installButton.remove();
      }, 300);
    });
    
    document.body.appendChild(installButton);
    
    // Auto-masquer le bouton après 30 secondes
    setTimeout(() => {
      const button = document.getElementById('pwa-install-button');
      if (button) {
        button.style.opacity = '0';
        button.style.transform = 'translateY(20px)';
        setTimeout(() => {
          button.remove();
        }, 300);
      }
    }, 30000); // 30 secondes
  }
}

// Fonction pour installer la PWA
async function installPWA() {
  if (deferredPrompt) {
    // Afficher le prompt d'installation
    deferredPrompt.prompt();
    
    // Attendre la réponse de l'utilisateur
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`PWA install outcome: ${outcome}`);
    
    // Nettoyer
    deferredPrompt = null;
    
    // Masquer le bouton
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.remove();
    }
  } else {
    // Pas de deferredPrompt disponible
    if (isIOS()) {
      // Afficher instructions iOS
      showIOSInstallGuide();
    } else {
      showNotification('Installation PWA non disponible. Utilisez Chrome/Android ou installez via le menu du navigateur.');
    }
  }
}

// Écouter l'événement appinstalled
window.addEventListener('appinstalled', () => {
  console.log('PWA installed successfully');
  
  // Masquer le bouton d'installation
  const installButton = document.getElementById('pwa-install-button');
  if (installButton) {
    installButton.remove();
  }
  
  // Afficher une notification de succès
  showNotification('App installée avec succès ! 🎉');
});

// Fonction pour afficher une notification
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #10B981;
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    z-index: 1001;
    animation: slideIn 0.3s ease;
  `;
  
  // Ajouter l'animation CSS
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(notification);
  
  // Supprimer après 3 secondes
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 3000);
}

// Vérifier si l'app est déjà installée
function checkIfAppIsInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true;
}

// Vérifier l'installabilité PWA de manière simple
function checkPWAInstallability() {
  // Vérifier si l'app est déjà installée
  if (checkIfAppIsInstalled()) {
    return;
  }
  
  // Vérifier les critères PWA de base
  const hasManifest = document.querySelector('link[rel="manifest"]') !== null;
  const hasServiceWorker = 'serviceWorker' in navigator;
  
  // Si les critères sont remplis mais pas de beforeinstallprompt, afficher le bouton
  if (hasManifest && hasServiceWorker && !deferredPrompt) {
    showInstallButton();
  }
}

// Vérifier l'installabilité après un délai
setTimeout(checkPWAInstallability, 3000);

export { showInstallButton, installPWA };

// Afficher un guide d'installation pour iOS (Safari)
function showIOSInstallGuide() {
  if (document.getElementById('ios-install-guide')) return;
  const guide = document.createElement('div');
  guide.id = 'ios-install-guide';
  guide.style.cssText = `
    position: fixed;
    left: 0; right: 0; bottom: 0;
    background: #111827;
    color: #fff;
    padding: 14px 16px;
    z-index: 1002;
    box-shadow: 0 -8px 24px rgba(0,0,0,0.25);
    border-top-left-radius: 14px;
    border-top-right-radius: 14px;
  `;
  guide.innerHTML = `
    <div style="display:flex; align-items:center; gap:12px;">
      <span style="font-weight:600;">Installer sur iPhone</span>
      <button id="ios-guide-close" style="margin-left:auto;background:#374151;color:#fff;border:none;padding:6px 10px;border-radius:8px;">Fermer</button>
    </div>
    <div style="margin-top:8px;font-size:13px;opacity:0.9;">
      1. Touchez l'icône <strong>Partager</strong> en bas de Safari.<br/>
      2. Choisissez <strong>Ajouter à l'écran d'accueil</strong>.
    </div>
  `;
  document.body.appendChild(guide);
  document.getElementById('ios-guide-close').addEventListener('click', () => guide.remove());
}
