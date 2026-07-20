const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const webPushService = require('../services/webPushService');
const expoPushService = require('../services/expoPushService');

// Obtenir la clé publique VAPID
router.get('/vapid-public-key', (req, res) => {
  const publicKey = webPushService.getPublicKey();
  
  if (publicKey) {
    res.json({ success: true, publicKey });
  } else {
    res.status(503).json({ 
      success: false, 
      error: 'Web Push non configuré' 
    });
  }
});

// Enregistrer une souscription push
router.post('/subscribe', authenticateToken, async (req, res) => {
  try {
    const { subscription } = req.body;
    
    if (!subscription) {
      return res.status(400).json({
        success: false,
        error: 'Souscription requise'
      });
    }

    await webPushService.saveSubscription(req.seller.id, subscription);
    
    res.json({
      success: true,
      message: 'Souscription enregistrée'
    });
  } catch (error) {
    console.error('❌ Erreur enregistrement souscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement'
    });
  }
});

// Supprimer une souscription
router.post('/unsubscribe', authenticateToken, async (req, res) => {
  try {
    await webPushService.removeSubscription(req.seller.id);
    
    res.json({
      success: true,
      message: 'Souscription supprimée'
    });
  } catch (error) {
    console.error('❌ Erreur suppression souscription:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression'
    });
  }
});

// Tester l'envoi d'une notification push
router.post('/test', authenticateToken, async (req, res) => {
  try {
    const sent = await webPushService.sendTestPush(req.seller.id);
    
    res.json({
      success: true,
      sent,
      message: sent ? 'Notification test envoyée' : 'Pas de souscription active'
    });
  } catch (error) {
    console.error('❌ Erreur test push:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors du test'
    });
  }
});

// Notifier TOUS les vendeurs d'une mise à jour (admin ou script post-deploy)
router.post('/notify-update', async (req, res) => {
  try {
    const secret = req.headers['x-deploy-secret'];
    if (secret !== (process.env.DEPLOY_SECRET || 'liveshop-deploy-2024')) {
      return res.status(403).json({ success: false, error: 'Non autorisé' });
    }

    const { message } = req.body;
    const result = await webPushService.notifyAllUpdate(message);

    console.log('📢 Push update envoyée:', result);
    res.json({ success: true, result });
  } catch (error) {
    console.error('❌ Erreur notify-update:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Statistiques Web Push
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await webPushService.getStats();
    
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('❌ Erreur stats push:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la récupération des stats'
    });
  }
});

// Enregistrer un token push Expo (app mobile native)
router.post('/expo-token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token || !expoPushService.isExpoToken(token)) {
      return res.status(400).json({
        success: false,
        error: 'Token Expo invalide'
      });
    }

    await expoPushService.saveToken(req.seller.id, token);

    res.json({
      success: true,
      message: 'Token Expo enregistré'
    });
  } catch (error) {
    console.error('❌ Erreur enregistrement token Expo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de l\'enregistrement'
    });
  }
});

// Supprimer un token push Expo (déconnexion de l'app mobile)
router.delete('/expo-token', authenticateToken, async (req, res) => {
  try {
    const { token } = req.body || {};
    await expoPushService.removeToken(req.seller.id, token || null);

    res.json({
      success: true,
      message: 'Token Expo supprimé'
    });
  } catch (error) {
    console.error('❌ Erreur suppression token Expo:', error);
    res.status(500).json({
      success: false,
      error: 'Erreur lors de la suppression'
    });
  }
});

module.exports = router;
