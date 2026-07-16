const express = require('express');
const router = express.Router();
const { 
  uploadProductImage, 
  uploadPaymentProof, 
  uploadAvatar, 
  uploadLiveBanner,
  deleteImage,
  optimizeImageUrl,
  generateThumbnailUrl
} = require('../config/cloudinary');

// Middleware d'authentification
const { authenticateToken } = require('../middleware/auth');

// Upload d'image de produit
router.post('/product', authenticateToken, uploadProductImage.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height,
      thumbnailUrl: generateThumbnailUrl(req.file.path, 200),
      optimizedUrl: optimizeImageUrl(req.file.path, { width: 800, height: 800 })
    };

    console.log('✅ Image de produit uploadée sur Cloudinary:', {
      originalName: req.file.originalname,
      publicId: req.file.filename,
      size: req.file.size,
      url: imageData.url
    });

    res.json({ 
      success: true, 
      image: imageData
    });
  } catch (error) {
    console.error('❌ Erreur upload image produit:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'image' });
  }
});

// Upload de preuve de paiement
router.post('/payment-proof', authenticateToken, uploadPaymentProof.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height
    };

    console.log('✅ Preuve de paiement uploadée sur Cloudinary:', {
      originalName: req.file.originalname,
      publicId: req.file.filename,
      size: req.file.size,
      url: imageData.url
    });

    res.json({ 
      success: true, 
      image: imageData
    });
  } catch (error) {
    console.error('❌ Erreur upload preuve de paiement:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la preuve' });
  }
});

// Upload d'avatar
router.post('/avatar', authenticateToken, uploadAvatar.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height,
      thumbnailUrl: generateThumbnailUrl(req.file.path, 100)
    };

    console.log('✅ Avatar uploadé sur Cloudinary:', {
      originalName: req.file.originalname,
      publicId: req.file.filename,
      size: req.file.size,
      url: imageData.url
    });

    res.json({ 
      success: true, 
      image: imageData
    });
  } catch (error) {
    console.error('❌ Erreur upload avatar:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de l\'avatar' });
  }
});

// Upload de bannière de live
router.post('/live-banner', authenticateToken, uploadLiveBanner.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const imageData = {
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      format: req.file.format,
      width: req.file.width,
      height: req.file.height,
      thumbnailUrl: generateThumbnailUrl(req.file.path, 300)
    };

    console.log('✅ Bannière de live uploadée sur Cloudinary:', {
      originalName: req.file.originalname,
      publicId: req.file.filename,
      size: req.file.size,
      url: imageData.url
    });

    res.json({ 
      success: true, 
      image: imageData
    });
  } catch (error) {
    console.error('❌ Erreur upload bannière de live:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload de la bannière' });
  }
});

// Upload multiple d'images de produits
router.post('/products-multiple', authenticateToken, uploadProductImage.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'Aucune image fournie' });
    }

    const imagesData = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
      originalName: file.originalname,
      size: file.size,
      format: file.format,
      width: file.width,
      height: file.height,
      thumbnailUrl: generateThumbnailUrl(file.path, 200),
      optimizedUrl: optimizeImageUrl(file.path, { width: 800, height: 800 })
    }));

    console.log(`✅ ${req.files.length} images de produits uploadées sur Cloudinary`);

    res.json({ 
      success: true, 
      images: imagesData
    });
  } catch (error) {
    console.error('❌ Erreur upload multiple images:', error);
    res.status(500).json({ error: 'Erreur lors de l\'upload des images' });
  }
});

// Supprimer une image
router.delete('/:publicId', authenticateToken, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({ error: 'ID de l\'image requis' });
    }

    const result = await deleteImage(publicId);
    
    res.json({ 
      success: true, 
      message: 'Image supprimée avec succès',
      result 
    });
  } catch (error) {
    console.error('❌ Erreur suppression image:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'image' });
  }
});

// Optimiser une URL d'image
router.post('/optimize', (req, res) => {
  try {
    const { url, options } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL de l\'image requise' });
    }

    const optimizedUrl = optimizeImageUrl(url, options);
    
    res.json({ 
      success: true, 
      originalUrl: url,
      optimizedUrl 
    });
  } catch (error) {
    console.error('❌ Erreur optimisation image:', error);
    res.status(500).json({ error: 'Erreur lors de l\'optimisation de l\'image' });
  }
});

// Générer une URL de thumbnail
router.post('/thumbnail', (req, res) => {
  try {
    const { url, size = 200 } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL de l\'image requise' });
    }

    const thumbnailUrl = generateThumbnailUrl(url, size);
    
    res.json({ 
      success: true, 
      originalUrl: url,
      thumbnailUrl,
      size 
    });
  } catch (error) {
    console.error('❌ Erreur génération thumbnail:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du thumbnail' });
  }
});

module.exports = router; 