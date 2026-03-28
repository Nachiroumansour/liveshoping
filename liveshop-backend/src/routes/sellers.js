const express = require('express');
const { Seller } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { uploadQRCode, handleUploadError } = require('../middleware/upload');
const { uploadLogoImage, deleteImage } = require('../config/cloudinary');

const router = express.Router();

// GET /api/sellers/payment-settings - Récupérer les paramètres de paiement
router.get('/payment-settings', authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    const paymentSettings = {
      wave_qr_code_url: seller.wave_qr_code_url,
      orange_money_qr_code_url: seller.orange_money_qr_code_url,
      payment_settings: seller.payment_settings || {},
      payment_methods_enabled: seller.payment_methods_enabled || ['manual']
    };

    res.json({
      success: true,
      data: paymentSettings
    });

  } catch (error) {
    console.error('Erreur récupération paramètres paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sellers/payment-settings - Mettre à jour les paramètres de paiement
router.post('/payment-settings', authenticateToken, async (req, res) => {
  try {
    const { payment_settings, payment_methods_enabled, wave_phone, orange_money_phone } = req.body;

    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Préparer les settings fusionnés
    const currentSettings = seller.payment_settings || {};
    const mergedSettings = {
      ...currentSettings,
      ...(payment_settings || {})
    };

    if (typeof wave_phone === 'string') {
      mergedSettings.wave = { ...(mergedSettings.wave || {}), phone: wave_phone };
    }
    if (typeof orange_money_phone === 'string') {
      mergedSettings.orange_money = { ...(mergedSettings.orange_money || {}), phone: orange_money_phone };
    }

    // Mettre à jour les paramètres
    await seller.update({
      payment_settings: mergedSettings,
      payment_methods_enabled: payment_methods_enabled || ['manual']
    });

    res.json({
      success: true,
      message: 'Paramètres de paiement mis à jour',
      data: {
        payment_settings: seller.payment_settings,
        payment_methods_enabled: seller.payment_methods_enabled
      }
    });

  } catch (error) {
    console.error('Erreur mise à jour paramètres paiement:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sellers/upload-qr-code - Upload d'un QR code
router.post('/upload-qr-code', authenticateToken, uploadQRCode, handleUploadError, async (req, res) => {
  try {
    const { payment_method } = req.body; // 'wave' ou 'orange_money'
    
    if (!req.file) {
      return res.status(400).json({ error: 'Aucun fichier fourni' });
    }

    if (!payment_method || !['wave', 'orange_money'].includes(payment_method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Construire l'URL du fichier
    const fileUrl = `/uploads/qr-codes/${req.file.filename}`;

    // Mettre à jour le champ approprié
    const updateData = {};
    if (payment_method === 'wave') {
      updateData.wave_qr_code_url = fileUrl;
    } else if (payment_method === 'orange_money') {
      updateData.orange_money_qr_code_url = fileUrl;
    }

    // Ajouter la méthode aux méthodes activées si pas déjà présente
    let currentMethods = seller.payment_methods_enabled || ['manual'];
    
    // Parser si c'est une chaîne JSON
    if (typeof currentMethods === 'string') {
      try {
        currentMethods = JSON.parse(currentMethods);
      } catch (e) {
        currentMethods = ['manual'];
      }
    }
    
    if (!currentMethods.includes(payment_method)) {
      currentMethods.push(payment_method);
      updateData.payment_methods_enabled = JSON.stringify(currentMethods);
    }

    await seller.update(updateData);

    res.json({
      success: true,
      message: `QR code ${payment_method} uploadé avec succès`,
      data: {
        qr_code_url: fileUrl,
        payment_method: payment_method,
        payment_methods_enabled: seller.payment_methods_enabled
      }
    });

  } catch (error) {
    console.error('Erreur upload QR code:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/sellers/qr-code/:method - Supprimer un QR code
router.delete('/qr-code/:method', authenticateToken, async (req, res) => {
  try {
    const { method } = req.params; // 'wave' ou 'orange_money'
    
    if (!['wave', 'orange_money'].includes(method)) {
      return res.status(400).json({ error: 'Méthode de paiement invalide' });
    }

    const seller = await Seller.findByPk(req.seller.id);
    
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Supprimer le fichier physique s'il existe
    let filePath = null;
    if (method === 'wave' && seller.wave_qr_code_url) {
      filePath = path.join(__dirname, '../../', seller.wave_qr_code_url);
    } else if (method === 'orange_money' && seller.orange_money_qr_code_url) {
      filePath = path.join(__dirname, '../../', seller.orange_money_qr_code_url);
    }

    if (filePath && require('fs').existsSync(filePath)) {
      require('fs').unlinkSync(filePath);
    }

    // Mettre à jour la base de données
    const updateData = {};
    if (method === 'wave') {
      updateData.wave_qr_code_url = null;
    } else if (method === 'orange_money') {
      updateData.orange_money_qr_code_url = null;
    }

    // Retirer la méthode des méthodes activées
    let currentMethods = seller.payment_methods_enabled || ['manual'];
    
    // Parser si c'est une chaîne JSON
    if (typeof currentMethods === 'string') {
      try {
        currentMethods = JSON.parse(currentMethods);
      } catch (e) {
        currentMethods = ['manual'];
      }
    }
    
    const updatedMethods = currentMethods.filter(m => m !== method);
    updateData.payment_methods_enabled = JSON.stringify(updatedMethods);

    await seller.update(updateData);

    res.json({
      success: true,
      message: `QR code ${method} supprimé avec succès`,
      data: {
        payment_methods_enabled: seller.payment_methods_enabled
      }
    });

  } catch (error) {
    console.error('Erreur suppression QR code:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/sellers/profile - Récupérer le profil boutique
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.seller.id);
    if (!seller) return res.status(404).json({ error: 'Vendeur non trouvé' });

    res.json({
      success: true,
      data: {
        name: seller.name,
        description: seller.description || '',
        logo_url: seller.logo_url || null,
        public_link_id: seller.public_link_id
      }
    });
  } catch (error) {
    console.error('Erreur récupération profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sellers/profile - Mettre à jour le profil boutique
router.post('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    const seller = await Seller.findByPk(req.seller.id);
    if (!seller) return res.status(404).json({ error: 'Vendeur non trouvé' });

    const updateData = {};
    if (typeof name === 'string' && name.trim()) updateData.name = name.trim();
    if (typeof description === 'string') updateData.description = description.trim();

    await seller.update(updateData);

    res.json({
      success: true,
      message: 'Profil mis à jour',
      data: {
        name: seller.name,
        description: seller.description || '',
        logo_url: seller.logo_url || null
      }
    });
  } catch (error) {
    console.error('Erreur mise à jour profil:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/sellers/slug - Modifier le slug de la boutique
router.put('/slug', authenticateToken, async (req, res) => {
  try {
    const { slug } = req.body;
    if (!slug || typeof slug !== 'string') {
      return res.status(400).json({ error: 'Slug requis' });
    }

    const { slugify } = require('../models/Seller');
    const cleanSlug = slugify(slug);

    if (!cleanSlug || cleanSlug.length < 3) {
      return res.status(400).json({ error: 'Le lien doit contenir au moins 3 caractères' });
    }
    if (cleanSlug.length > 60) {
      return res.status(400).json({ error: 'Le lien est trop long (60 caractères max)' });
    }

    const seller = await Seller.findByPk(req.seller.id);
    if (!seller) return res.status(404).json({ error: 'Vendeur non trouvé' });

    // Vérifier si le slug est déjà pris par un autre vendeur
    if (cleanSlug !== seller.public_link_id) {
      const existing = await Seller.findOne({ where: { public_link_id: cleanSlug } });
      if (existing) {
        return res.status(409).json({ error: 'Ce lien est déjà pris. Essayez un autre.' });
      }
    }

    await seller.update({ public_link_id: cleanSlug });

    res.json({
      success: true,
      message: 'Lien mis à jour',
      data: { public_link_id: cleanSlug }
    });
  } catch (error) {
    console.error('Erreur mise à jour slug:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/sellers/upload-logo - Upload du logo boutique (Cloudinary)
router.post('/upload-logo', authenticateToken, uploadLogoImage.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' });

    const seller = await Seller.findByPk(req.seller.id);
    if (!seller) return res.status(404).json({ error: 'Vendeur non trouvé' });

    // Supprimer l'ancien logo de Cloudinary s'il existe
    if (seller.logo_url && seller.logo_url.includes('cloudinary.com')) {
      try {
        const parts = seller.logo_url.split('/');
        const folderAndFile = parts.slice(parts.indexOf('liveshop')).join('/');
        const publicId = folderAndFile.replace(/\.[^/.]+$/, '');
        await deleteImage(publicId);
      } catch (err) {
        console.warn('Ancien logo non supprimé de Cloudinary:', err.message);
      }
    }

    // req.file.path contient l'URL Cloudinary
    const logoUrl = req.file.path;
    await seller.update({ logo_url: logoUrl });

    res.json({
      success: true,
      message: 'Logo mis à jour',
      data: { logo_url: logoUrl }
    });
  } catch (error) {
    console.error('Erreur upload logo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/sellers/logo - Supprimer le logo
router.delete('/logo', authenticateToken, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.seller.id);
    if (!seller) return res.status(404).json({ error: 'Vendeur non trouvé' });

    if (seller.logo_url) {
      // Supprimer de Cloudinary si c'est une URL Cloudinary
      if (seller.logo_url.includes('cloudinary.com')) {
        try {
          const parts = seller.logo_url.split('/');
          const folderAndFile = parts.slice(parts.indexOf('liveshop')).join('/');
          const publicId = folderAndFile.replace(/\.[^/.]+$/, '');
          await deleteImage(publicId);
        } catch (err) {
          console.warn('Logo non supprimé de Cloudinary:', err.message);
        }
      }
      await seller.update({ logo_url: null });
    }

    res.json({ success: true, message: 'Logo supprimé' });
  } catch (error) {
    console.error('Erreur suppression logo:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router; 