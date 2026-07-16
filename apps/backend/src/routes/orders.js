const express = require('express');
const { Order, Product, Seller, Comment } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { requireAndConsumeCredits } = require('../middleware/creditMiddleware');
const { Op } = require('sequelize');
const notificationService = require('../services/notificationService');
const whatsappService = require('../services/whatsappNotificationService');

const router = express.Router();

// Récupérer toutes les commandes du vendeur connecté
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    const whereClause = { seller_id: req.seller.id };
    if (status) {
      whereClause.status = status;
    }

    // Compter le total des commandes
    const totalOrders = await Order.count({ where: whereClause });

    const orders = await Order.findAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url']
        },
        {
          model: Comment,
          as: 'client_comment',
          attributes: ['id', 'content', 'customer_name', 'rating', 'created_at']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    const totalPages = Math.ceil(totalOrders / parseInt(limit));

    res.json({
      orders: orders.map(order => ({
        id: order.id,
        product_id: order.product_id,
        seller_id: order.seller_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        quantity: order.quantity,
        total_price: order.total_price,
        payment_method: order.payment_method,
        payment_proof_url: order.payment_proof_url,
        status: order.status,
        comment: order.comment,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product: order.product ? {
          id: order.product.id,
          name: order.product.name,
          price: order.product.price,
          image_url: order.product.image_url
        } : null,
        comment_data: order.client_comment ? {
          id: order.client_comment.id,
          content: order.client_comment.content,
          customer_name: order.client_comment.customer_name,
          rating: order.client_comment.rating,
          created_at: order.client_comment.created_at
        } : null
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: totalPages,
        totalOrders: totalOrders,
        ordersPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPreviousPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Mettre à jour le statut d'une commande
router.put('/:id/status', authenticateToken, ...requireAndConsumeCredits('PROCESS_ORDER', (req) => ({
  orderId: req.params.id,
  newStatus: req.body.status
})), async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Statut requis'
      });
    }

    if (!['pending', 'paid', 'delivered'].includes(status)) {
      return res.status(400).json({
        error: 'Statut invalide'
      });
    }

    const order = await Order.findOne({
      where: { 
        id: orderId, 
        seller_id: req.seller.id 
      },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'image_url']
      }]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    await order.update({ status });

    // Envoyer une notification pour la mise à jour de statut
    try {
      console.log('📡 Envoi notification de mise à jour de statut au vendeur:', req.seller.id);
      
      const notificationData = {
        order: {
          id: order.id,
          product_id: order.product_id,
          seller_id: order.seller_id,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          quantity: order.quantity,
          total_price: order.total_price,
          payment_method: order.payment_method,
          payment_proof_url: order.payment_proof_url,
          status: order.status,
          comment: order.comment,
          created_at: order.created_at,
          updated_at: order.updated_at,
          product: order.product ? {
            id: order.product.id,
            name: order.product.name,
            price: order.product.price,
            image_url: order.product.image_url
          } : null
        }
      };

      const { sent } = await notificationService.sendRealtimeNotification(
        req.seller.id,
        'order_status_update',
        notificationData
      );

      console.log('✅ Notification de mise à jour de statut envoyée:', sent);
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de la notification de mise à jour:', error);
    }

    // 📲 NOTIFICATIONS WHATSAPP - Changement de statut
    try {
      if (status === 'paid') {
        // Commande validée
        console.log(`📲 Envoi WhatsApp: Commande #${order.id} validée`);
        await whatsappService.notifyOrderValidated(order, order.product, req.seller);
      } else if (status === 'delivered') {
        // Commande livrée
        console.log(`📲 Envoi WhatsApp: Commande #${order.id} livrée`);
        await whatsappService.notifyOrderDelivered(order, order.product, req.seller);
      }
    } catch (whatsappError) {
      console.error('⚠️ Erreur WhatsApp (non bloquante):', whatsappError.message);
    }

    res.json({
      message: 'Statut mis à jour avec succès',
      order: {
        id: order.id,
        product_id: order.product_id,
        seller_id: order.seller_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        quantity: order.quantity,
        total_price: order.total_price,
        payment_method: order.payment_method,
        payment_proof_url: order.payment_proof_url,
        status: order.status,
        comment: order.comment,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product: order.product ? {
          id: order.product.id,
          name: order.product.name,
          price: order.product.price,
          image_url: order.product.image_url
        } : null
      },
      creditConsumption: res.locals.creditConsumption
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer les détails d'une commande
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findOne({
      where: { 
        id: orderId, 
        seller_id: req.seller.id 
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url', 'description']
        },
        {
          model: Comment,
          as: 'client_comment',
          attributes: ['id', 'content', 'customer_name', 'rating', 'created_at']
        }
      ]
    });

    if (!order) {
      return res.status(404).json({
        error: 'Commande non trouvée'
      });
    }

    res.json({
      order: {
        id: order.id,
        product_id: order.product_id,
        seller_id: order.seller_id,
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        quantity: order.quantity,
        total_price: order.total_price,
        payment_method: order.payment_method,
        payment_proof_url: order.payment_proof_url,
        status: order.status,
        comment: order.comment,
        created_at: order.created_at,
        updated_at: order.updated_at,
        product: order.product ? {
          id: order.product.id,
          name: order.product.name,
          price: order.product.price,
          image_url: order.product.image_url,
          description: order.product.description
        } : null,
        comment_data: order.client_comment ? {
          id: order.client_comment.id,
          content: order.client_comment.content,
          customer_name: order.client_comment.customer_name,
          rating: order.client_comment.rating,
          created_at: order.client_comment.created_at
        } : null
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Récupérer les statistiques des commandes
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const sellerId = req.seller.id;

    // Compter les commandes par statut
    const [totalOrders, pendingOrders, paidOrders, deliveredOrders] = await Promise.all([
      Order.count({ where: { seller_id: sellerId } }),
      Order.count({ where: { seller_id: sellerId, status: 'pending' } }),
      Order.count({ where: { seller_id: sellerId, status: 'paid' } }),
      Order.count({ where: { seller_id: sellerId, status: 'delivered' } })
    ]);

    // Calculer le chiffre d'affaires total (commandes payées + livrées uniquement)
    const totalRevenueSum = await Order.sum('total_price', {
      where: { 
        seller_id: sellerId,
        status: ['paid', 'delivered'] // Seulement les commandes payées et livrées
      }
    });

    const totalRevenue = totalRevenueSum || 0;

    res.json({
      stats: {
        total_orders: totalOrders,
        pending_orders: pendingOrders,
        paid_orders: paidOrders,
        delivered_orders: deliveredOrders,
        total_revenue: parseFloat(totalRevenue.toFixed(2))
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      error: 'Erreur interne du serveur'
    });
  }
});

// Route pour générer le ticket de livraison (privée - pour les vendeurs)
router.get('/:orderId/delivery-ticket', authenticateToken, ...requireAndConsumeCredits('GENERATE_CUSTOMER_CARD', (req) => ({
  orderId: req.params.orderId
})), async (req, res) => {
  try {
    console.log('🖨️ Génération de ticket pour la commande:', req.params.orderId);
    const { orderId } = req.params;

    console.log('🔍 Recherche de la commande...');
    // Récupérer la commande avec les détails du produit et du vendeur
    const order = await Order.findOne({
      where: { 
        id: orderId,
        seller_id: req.seller.id // Vérifier que la commande appartient au vendeur
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['name', 'price', 'image_url']
        },
        {
          model: Seller,
          as: 'seller',
          attributes: ['name', 'phone_number']
        }
      ]
    });

    if (!order) {
      console.log('❌ Commande non trouvée ou non autorisée');
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    console.log('✅ Commande trouvée:', order.id);

    // Importer les modules nécessaires
    const PDFDocument = require('pdfkit');
    const QRCode = require('qrcode');

    // Créer le PDF
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    // Configuration de la réponse pour le PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="livraison-${order.id}.pdf"`);

    // Pipe le PDF vers la réponse
    doc.pipe(res);

    // Contenu du ticket
    doc.fontSize(24)
       .text('TICKET DE LIVRAISON', { align: 'center' });
    
    doc.moveDown(1);
    doc.fontSize(16)
       .text(`Commande #${order.id}`, { align: 'center' });
    
    doc.moveDown(1);

    // Générer le QR code
    const deliveryUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/delivery/${order.id}`;
    const qrCodeDataUrl = await QRCode.toDataURL(deliveryUrl, {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    // Convertir Data URL en Buffer
    const qrCodeBuffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');
    
    // Ajouter le QR code au PDF
    doc.image(qrCodeBuffer, 250, 150, { width: 150, height: 150 });
    doc.fontSize(10)
       .text('Scannez pour plus de détails', 250, 320, { width: 150, align: 'center' });
    
    doc.moveDown(1);

    // Informations client
    doc.fontSize(14)
       .text('CLIENT');
    
    doc.fontSize(12)
       .text(`Nom: ${order.customer_name}`)
       .text(`Téléphone: ${order.customer_phone}`)
       .text(`Adresse: ${order.customer_address}`);
    
    doc.moveDown(1);

    // Informations produit
    doc.fontSize(14)
       .text('PRODUIT');
    
    doc.fontSize(12)
       .text(`Nom: ${order.product?.name || 'Produit inconnu'}`)
       .text(`Quantité: ${order.quantity}`)
       .text(`Prix unitaire: ${order.product?.price || 0} FCFA`)
       .text(`Prix total: ${order.total_price} FCFA`);
    
    doc.moveDown(1);

    // Informations livraison
    doc.fontSize(14)
       .text('LIVRAISON');
    
    doc.fontSize(12)
       .text(`Méthode de paiement: ${order.payment_method}`)
       .text(`Statut: ${order.status}`);
    
    doc.moveDown(1);

    // Contact vendeur
    doc.fontSize(14)
       .text('CONTACT VENDEUR');
    
    doc.fontSize(12)
       .text(`Nom: ${order.seller?.name || 'Vendeur'}`)
       .text(`Téléphone: ${order.seller?.phone_number || 'N/A'}`);
    
    doc.moveDown(1);

    // Date
    doc.fontSize(10)
       .text(`Généré le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, { align: 'center' });

    console.log('📄 Finalisation du PDF...');
    // Finaliser le PDF
    doc.end();

    console.log('✅ PDF généré avec succès');

  } catch (error) {
    console.error('❌ Erreur lors de la génération du ticket:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du ticket' });
  }
});

// Route pour supprimer une commande
router.delete('/:orderId', authenticateToken, async (req, res) => {
  try {
    console.log('🗑️ Suppression de la commande:', req.params.orderId);
    const { orderId } = req.params;

    // Vérifier que la commande existe et appartient au vendeur
    const order = await Order.findOne({
      where: { 
        id: orderId,
        seller_id: req.seller.id // Vérifier que la commande appartient au vendeur
      }
    });

    if (!order) {
      console.log('❌ Commande non trouvée ou non autorisée');
      return res.status(404).json({ error: 'Commande non trouvée' });
    }

    console.log('✅ Commande trouvée, suppression...');

    // Supprimer la commande
    await order.destroy();

    console.log('✅ Commande supprimée avec succès');

    res.json({
      success: true,
      message: 'Commande supprimée avec succès'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la suppression de la commande:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la commande' });
  }
});

module.exports = router;

