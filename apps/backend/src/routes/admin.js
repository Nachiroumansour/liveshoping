const express = require('express');
const router = express.Router();
const { Seller, Order, Product, CreditTransaction } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

// Middleware pour vérifier le rôle admin/superadmin
const requireAdmin = (req, res, next) => {
  if (!req.seller || !['admin', 'superadmin'].includes(req.seller.role)) {
    return res.status(403).json({ error: 'Accès refusé. Rôle admin requis.' });
  }
  next();
};

// Route de test simple
router.get('/test', (req, res) => {
  res.json({ message: 'Admin route works!' });
});

// GET /api/admin/dashboard - Tableau de bord admin
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalSellers,
      activeSellers,
      totalOrders,
      pendingOrders,
      totalProducts,
      totalRevenue
    ] = await Promise.all([
      Seller.count(),
      Seller.count({ where: { is_active: true } }),
      Order.count(),
      Order.count({ where: { status: 'pending' } }),
      Product.count(),
      Order.sum('total_price', { where: { status: ['paid', 'delivered'] } })
    ]);

    // Statistiques crédits
    const creditStats = await CreditTransaction.findAll({
      attributes: [
        [CreditTransaction.sequelize.fn('SUM', CreditTransaction.sequelize.col('amount')), 'total_credits'],
        [CreditTransaction.sequelize.fn('COUNT', CreditTransaction.sequelize.col('id')), 'transaction_count']
      ],
      where: { type: 'purchase' }
    });

    res.json({
      success: true,
      data: {
        sellers: {
          total: totalSellers,
          active: activeSellers,
          inactive: totalSellers - activeSellers
        },
        orders: {
          total: totalOrders,
          pending: pendingOrders
        },
        products: {
          total: totalProducts
        },
        revenue: {
          total: totalRevenue || 0
        },
        credits: {
          total_purchased: creditStats[0]?.dataValues?.total_credits || 0,
          transaction_count: creditStats[0]?.dataValues?.transaction_count || 0
        }
      }
    });
  } catch (error) {
    console.error('Erreur dashboard admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers - Liste des vendeurs
router.get('/sellers', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { phone_number: { [Op.like]: `%${search}%` } }
      ]
    } : {};

    const { count, rows: sellers } = await Seller.findAndCountAll({
      where: whereClause,
      attributes: ['id', 'name', 'phone_number', 'public_link_id', 'role', 'is_active', 'credit_balance', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        sellers: sellers,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste vendeurs:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers/:id - Détails d'un vendeur
router.get('/sellers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id, {
      attributes: ['id', 'name', 'phone_number', 'public_link_id', 'role', 'is_active', 'credit_balance', 'created_at', 'updated_at']
    });

    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    // Statistiques du vendeur
    const [orderCount, productCount, totalRevenue] = await Promise.all([
      Order.count({ where: { seller_id: seller.id } }),
      Product.count({ where: { seller_id: seller.id } }),
      Order.sum('total_price', { where: { seller_id: seller.id, status: ['paid', 'delivered'] } })
    ]);

    res.json({
      success: true,
      data: {
        seller: seller,
        stats: {
          orders: orderCount,
          products: productCount,
          revenue: totalRevenue || 0
        }
      }
    });
  } catch (error) {
    console.error('Erreur détails vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// PUT /api/admin/sellers/:id - Modifier un vendeur
router.put('/sellers/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, role, is_active } = req.body;
    const seller = await Seller.findByPk(req.params.id);

    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (role && ['seller', 'admin', 'superadmin'].includes(role)) updates.role = role;
    if (typeof is_active === 'boolean') updates.is_active = is_active;

    await seller.update(updates);

    res.json({
      success: true,
      message: 'Vendeur mis à jour',
      data: { seller }
    });
  } catch (error) {
    console.error('Erreur mise à jour vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/sellers/:id/suspend - Suspendre un vendeur
router.post('/sellers/:id/suspend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    await seller.update({ is_active: false });
    res.json({ success: true, message: 'Vendeur suspendu', data: { seller } });
  } catch (error) {
    console.error('Erreur suspension vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/sellers/:id/activate - Activer un vendeur
router.post('/sellers/:id/activate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const seller = await Seller.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    await seller.update({ is_active: true });
    res.json({ success: true, message: 'Vendeur activé', data: { seller } });
  } catch (error) {
    console.error('Erreur activation vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// POST /api/admin/sellers/:id/credits - Gérer crédits d'un vendeur
router.post('/sellers/:id/credits', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { amount, reason, type = 'bonus' } = req.body;
    
    if (!amount || !reason) {
      return res.status(400).json({ error: 'amount et reason requis' });
    }

    const seller = await Seller.findByPk(req.params.id);
    if (!seller) {
      return res.status(404).json({ error: 'Vendeur non trouvé' });
    }

    const creditAmount = parseInt(amount);
    const oldBalance = seller.credit_balance;
    const newBalance = oldBalance + creditAmount;

    if (newBalance < 0) {
      return res.status(400).json({ error: 'Solde insuffisant' });
    }

    await seller.update({ credit_balance: newBalance });

    // Enregistrer transaction
    await CreditTransaction.create({
      seller_id: seller.id,
      type: type,
      amount: creditAmount,
      balance_before: oldBalance,
      balance_after: newBalance,
      description: reason,
      status: 'completed'
    });

    res.json({
      success: true,
      message: 'Crédits mis à jour',
      data: {
        old_balance: oldBalance,
        new_balance: newBalance,
        amount: creditAmount
      }
    });
  } catch (error) {
    console.error('Erreur gestion crédits:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/orders - Supervision des commandes
router.get('/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, seller_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = {};
    if (status) whereClause.status = status;
    if (seller_id) whereClause.seller_id = seller_id;

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url']
        },
        {
          model: Seller,
          as: 'seller',
          attributes: ['id', 'name', 'phone_number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        orders: orders,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste commandes admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/products - Modération des produits
router.get('/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, seller_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = seller_id ? { seller_id } : {};

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Seller,
          as: 'seller',
          attributes: ['id', 'name', 'phone_number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        products: products,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste produits admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// DELETE /api/admin/products/:id - Supprimer un produit (modération)
router.delete('/products/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produit non trouvé' });
    }

    await product.destroy();
    res.json({ success: true, message: 'Produit supprimé' });
  } catch (error) {
    console.error('Erreur suppression produit admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/transactions - Historique des transactions crédits
router.get('/transactions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, seller_id } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const whereClause = seller_id ? { seller_id } : {};

    const { count, rows: transactions } = await CreditTransaction.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Seller,
          as: 'seller',
          attributes: ['id', 'name', 'phone_number']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: offset
    });

    res.json({
      success: true,
      data: {
        transactions: transactions,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Erreur liste transactions admin:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers/:id/orders - Commandes d'un vendeur spécifique
router.get('/sellers/:id/orders', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { seller_id: req.params.id },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'price', 'image_url']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: { orders } });
  } catch (error) {
    console.error('Erreur commandes vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// GET /api/admin/sellers/:id/products - Produits d'un vendeur spécifique
router.get('/sellers/:id/products', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.params.id },
      order: [['created_at', 'DESC']],
      limit: 50
    });

    res.json({ success: true, data: { products } });
  } catch (error) {
    console.error('Erreur produits vendeur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

module.exports = router;


