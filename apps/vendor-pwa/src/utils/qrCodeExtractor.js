import jsQR from 'jsqr';

/**
 * Extrait le QR code d'une image et retourne une nouvelle image contenant seulement le QR code
 * @param {File} imageFile - Le fichier image à traiter
 * @returns {Promise<File>} - Le fichier image contenant seulement le QR code
 */
export const extractQRCodeFromImage = async (imageFile) => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        // Créer un canvas temporaire pour analyser l'image
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        
        // Définir la taille du canvas temporaire
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        
        // Dessiner l'image sur le canvas temporaire
        tempCtx.drawImage(img, 0, 0);
        
        // Obtenir les données de l'image
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Détecter le QR code
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        if (code) {
          console.log('QR code détecté:', code.data);
          
          // Extraire les coordonnées du QR code
          const { topLeftCorner, topRightCorner, bottomLeftCorner, bottomRightCorner } = code.location;
          
          // Calculer les dimensions du QR code
          const qrWidth = Math.max(
            Math.sqrt(Math.pow(topRightCorner.x - topLeftCorner.x, 2) + Math.pow(topRightCorner.y - topLeftCorner.y, 2)),
            Math.sqrt(Math.pow(bottomRightCorner.x - bottomLeftCorner.x, 2) + Math.pow(bottomRightCorner.y - bottomLeftCorner.y, 2))
          );
          
          const qrHeight = Math.max(
            Math.sqrt(Math.pow(bottomLeftCorner.x - topLeftCorner.x, 2) + Math.pow(bottomLeftCorner.y - topLeftCorner.y, 2)),
            Math.sqrt(Math.pow(bottomRightCorner.x - topRightCorner.x, 2) + Math.pow(bottomRightCorner.y - topRightCorner.y, 2))
          );
          
          // Ajouter une marge autour du QR code
          const margin = Math.min(qrWidth, qrHeight) * 0.1;
          const finalWidth = qrWidth + (margin * 2);
          const finalHeight = qrHeight + (margin * 2);
          
          // Calculer le centre du QR code
          const centerX = (topLeftCorner.x + topRightCorner.x + bottomLeftCorner.x + bottomRightCorner.x) / 4;
          const centerY = (topLeftCorner.y + topRightCorner.y + bottomLeftCorner.y + bottomRightCorner.y) / 4;
          
          // Définir la taille du canvas final
          canvas.width = finalWidth;
          canvas.height = finalHeight;
          
          // Dessiner seulement la région du QR code avec une marge
          ctx.drawImage(
            img,
            centerX - finalWidth / 2,
            centerY - finalHeight / 2,
            finalWidth,
            finalHeight,
            0,
            0,
            finalWidth,
            finalHeight
          );
          
          // Convertir le canvas en blob
          canvas.toBlob((blob) => {
            const extractedFile = new File([blob], `extracted-qr-${Date.now()}.png`, {
              type: 'image/png'
            });
            resolve(extractedFile);
          }, 'image/png');
          
        } else {
          // Si aucun QR code n'est détecté, retourner l'image originale
          console.log('Aucun QR code détecté, utilisation de l\'image originale');
          resolve(imageFile);
        }
        
      } catch (error) {
        console.error('Erreur lors de l\'extraction du QR code:', error);
        // En cas d'erreur, retourner l'image originale
        resolve(imageFile);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Impossible de charger l\'image'));
    };
    
    // Charger l'image
    img.src = URL.createObjectURL(imageFile);
  });
};

/**
 * Vérifie si une image contient un QR code
 * @param {File} imageFile - Le fichier image à vérifier
 * @returns {Promise<boolean>} - True si un QR code est détecté
 */
export const hasQRCode = async (imageFile) => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      try {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        resolve(!!code);
      } catch (error) {
        console.error('Erreur lors de la vérification du QR code:', error);
        resolve(false);
      }
    };
    
    img.onerror = () => {
      resolve(false);
    };
    
    img.src = URL.createObjectURL(imageFile);
  });
}; 