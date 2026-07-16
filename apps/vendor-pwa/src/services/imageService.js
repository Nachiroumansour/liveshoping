import { getBackendDomain } from '../config/domains';

class ImageService {
  constructor() {
    this.baseUrl = `${getBackendDomain()}/api`;
  }

  // Optimiser une URL d'image Cloudinary
  optimizeImageUrl(url, options = {}) {
    if (!url) return null;

    const {
      width = 800,
      height = 800,
      crop = 'limit',
      quality = 'auto',
      format = 'auto'
    } = options;

    // Si c'est déjà une URL Cloudinary, on peut l'optimiser
    if (url.includes('cloudinary.com')) {
      const baseUrl = url.split('/upload/')[0];
      const imagePath = url.split('/upload/')[1];
      return `${baseUrl}/upload/w_${width},h_${height},c_${crop},q_${quality},f_${format}/${imagePath}`;
    }

    return url;
  }

  // Générer une URL de thumbnail
  generateThumbnailUrl(url, size = 200) {
    return this.optimizeImageUrl(url, { width: size, height: size, crop: 'fill' });
  }

  // Générer une URL optimisée pour mobile
  generateMobileUrl(url) {
    return this.optimizeImageUrl(url, { width: 400, height: 400, crop: 'limit' });
  }

  // Générer une URL optimisée pour desktop
  generateDesktopUrl(url) {
    return this.optimizeImageUrl(url, { width: 800, height: 800, crop: 'limit' });
  }

  // Générer une URL pour l'aperçu
  generatePreviewUrl(url) {
    return this.optimizeImageUrl(url, { width: 300, height: 300, crop: 'fill' });
  }

  // Uploader une image
  async uploadImage(file, type = 'product') {
    const token = localStorage.getItem('liveshop_token');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${this.baseUrl}/upload/${type}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur upload image:', error);
      throw error;
    }
  }

  // Uploader plusieurs images
  async uploadMultipleImages(files, type = 'product') {
    const token = localStorage.getItem('liveshop_token');
    
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${this.baseUrl}/upload/products-multiple`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'upload');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur upload multiple images:', error);
      throw error;
    }
  }

  // Supprimer une image
  async deleteImage(publicId) {
    const token = localStorage.getItem('liveshop_token');

    try {
      const response = await fetch(`${this.baseUrl}/upload/${publicId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur suppression image:', error);
      throw error;
    }
  }

  // Optimiser une URL via l'API
  async optimizeImageUrlApi(url, options = {}) {
    const token = localStorage.getItem('liveshop_token');

    try {
      const response = await fetch(`${this.baseUrl}/upload/optimize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url, options })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de l\'optimisation');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur optimisation image:', error);
      throw error;
    }
  }

  // Générer un thumbnail via l'API
  async generateThumbnailApi(url, size = 200) {
    const token = localStorage.getItem('liveshop_token');

    try {
      const response = await fetch(`${this.baseUrl}/upload/thumbnail`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ url, size })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la génération du thumbnail');
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur génération thumbnail:', error);
      throw error;
    }
  }

  // Vérifier si une URL est une image Cloudinary
  isCloudinaryUrl(url) {
    return url && url.includes('cloudinary.com');
  }

  // Extraire le public ID d'une URL Cloudinary
  extractPublicId(url) {
    if (!this.isCloudinaryUrl(url)) return null;
    
    const parts = url.split('/upload/');
    if (parts.length < 2) return null;
    
    const imagePath = parts[1];
    const publicId = imagePath.split('.')[0]; // Enlever l'extension
    return publicId;
  }

  // Formater la taille d'un fichier
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Valider un fichier image
  validateImageFile(file) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Type de fichier non supporté. Utilisez JPEG, PNG, WebP ou GIF.');
    }

    if (file.size > maxSize) {
      throw new Error(`Fichier trop volumineux. Maximum ${this.formatFileSize(maxSize)}.`);
    }

    return true;
  }
}

// Instance singleton
const imageService = new ImageService();

export { imageService };
export default imageService; 