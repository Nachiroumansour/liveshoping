const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authenticateToken } = require('../middleware/auth');
const Event = require('../models/Event');

// GET /api/activity — fil d'événements + résumé "pendant ton absence"
router.get('/', authenticateToken, async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 30, 100);
    const since = req.query.since ? new Date(req.query.since) : null;

    const events = await Event.findAll({
      where: { seller_id: req.seller.id },
      order: [['created_at', 'DESC']],
      limit
    });

    const summary = { orders: 0, paid: 0, delivered: 0, comments: 0, stock_alerts: 0, products: 0 };
    if (since && !isNaN(since.getTime())) {
      const rows = await Event.findAll({
        where: { seller_id: req.seller.id, created_at: { [Op.gt]: since } },
        attributes: ['type']
      });
      for (const row of rows) {
        if (row.type === 'order_created') summary.orders++;
        else if (row.type === 'order_paid') summary.paid++;
        else if (row.type === 'order_delivered') summary.delivered++;
        else if (row.type === 'comment_added') summary.comments++;
        else if (row.type === 'stock_low' || row.type === 'stock_out') summary.stock_alerts++;
        else if (row.type === 'product_created') summary.products++;
      }
    }

    res.json({ success: true, events, summary });
  } catch (error) {
    console.error('❌ Erreur /api/activity:', error);
    res.status(500).json({ success: false, error: 'Erreur lors de la récupération de l\'activité' });
  }
});

module.exports = router;
