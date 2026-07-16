const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Seller, Product, Order } = require('../models');

// Configuration PayDunya
function setupPayDunya() {
  const mode = process.env.PAYDUNYA_MODE || 'sandbox';
  const config = {
    masterKey: process.env.PAYDUNYA_MASTER_KEY,
    publicKey: mode === 'live' ? process.env.PAYDUNYA_PUBLIC_KEY_LIVE : process.env.PAYDUNYA_PUBLIC_KEY_TEST,
    privateKey: mode === 'live' ? process.env.PAYDUNYA_PRIVATE_KEY_LIVE : process.env.PAYDUNYA_PRIVATE_KEY_TEST,
    token: mode === 'live' ? process.env.PAYDUNYA_TOKEN_LIVE : process.env.PAYDUNYA_TOKEN_TEST,
    mode: mode === 'live' ? 'live' : 'test'
  };

  return {
    ...config,
    callbackUrl: process.env.PAYMENTS_CALLBACK_URL,
    returnUrl: process.env.PAYMENTS_RETURN_URL,
    cancelUrl: process.env.PAYMENTS_CANCEL_URL,
    baseUrl: mode === 'live' ? 'https://app.paydunya.com/api/v1' : 'https://app.paydunya.com/sandbox-api/v1'
  };
}

// POST /api/public/:linkId/payments/checkout
// body: { items:[{product_id, quantity}], buyer:{name, phone, address}, payment_method }
router.post('/public/:linkId/payments/checkout', async (req, res) => {
  try {
    const { linkId } = req.params;
    const { items = [], buyer = {}, payment_method } = req.body || {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Panier vide.' });
    }

    // Récupérer le vendeur par linkId
    const seller = await Seller.findOne({ where: { public_link_id: linkId } });
    if (!seller) return res.status(404).json({ error: 'Vendeur non trouvé.' });

    // Construire les lignes de commande et total
    let total = 0;
    const lineItems = [];
    for (const it of items) {
      const product = await Product.findOne({ where: { id: it.product_id, seller_id: seller.id } });
      if (!product) return res.status(400).json({ error: `Produit invalide: ${it.product_id}` });
      const qty = Math.max(1, parseInt(it.quantity || 1, 10));
      const amount = product.price * qty;
      total += amount;
      lineItems.push({ name: product.name, quantity: qty, unit_price: product.price });
    }

    // Créer une commande groupée locale (facultatif ici: on persiste après webhook)
    // Pour l'instant, on enregistre une pré-commande minimale pour garder la trace
    const order = await Order.create({
      product_id: lineItems.length === 1 ? items[0].product_id : null,
      seller_id: seller.id,
      customer_name: buyer.name || 'Client',
      customer_phone: buyer.phone || '',
      customer_address: buyer.address || 'Non spécifiée',
      quantity: lineItems.length === 1 ? (items[0].quantity || 1) : 1,
      total_price: total,
      payment_method: payment_method || 'mobile_money',
      status: 'pending'
    });

    const cfg = setupPayDunya();

    console.log('🔄 Création invoice PayDunya via API REST...');
    
    try {
      // Appel direct à l'API REST PayDunya
      const invoiceData = {
        invoice: {
          items: lineItems.map(li => ({
            name: li.name,
            quantity: li.quantity,
            unit_price: li.unit_price,
            total_price: li.unit_price * li.quantity
          })),
          total_amount: total,
          description: `Commande LiveShop #${order.id}`,
          taxes: [],
          custom_data: JSON.stringify({
            order_id: order.id,
            seller_id: seller.id,
            link_id: linkId
          })
        },
        store: {
          name: seller.name || 'LiveShop Store',
          tagline: 'Commerce en ligne',
          phone_number: seller.phone_number || '',
          postal_address: seller.address || '',
          website_url: 'https://livelink.store'
        },
        // Numéros de paiement du vendeur
        payment_methods: {
          wave: seller.payment_settings?.wave?.phone ? {
            phone: seller.payment_settings.wave.phone,
            enabled: true
          } : null,
          orange_money: seller.payment_settings?.orange_money?.phone ? {
            phone: seller.payment_settings.orange_money.phone,
            enabled: true
          } : null
        },
        actions: {
          cancel_url: cfg.cancelUrl,
          return_url: cfg.returnUrl,
          callback_url: cfg.callbackUrl
        },
        custom_data: {
          order_id: order.id,
          seller_id: seller.id,
          link_id: linkId
        }
      };

      console.log('📤 Données envoyées à PayDunya:', JSON.stringify(invoiceData, null, 2));

      const response = await axios.post(`${cfg.baseUrl}/checkout-invoice/create`, invoiceData, {
        headers: {
          'PAYDUNYA-MASTER-KEY': cfg.masterKey,
          'PAYDUNYA-PRIVATE-KEY': cfg.privateKey,
          'PAYDUNYA-TOKEN': cfg.token,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Réponse PayDunya:', response.data);

      if (response.data.response_code === '00') {
        return res.json({ 
          invoice_url: response.data.response_text, 
          invoice_token: response.data.token, 
          order_id: order.id 
        });
      } else {
        throw new Error(response.data.response_text || 'Erreur création invoice');
      }

    } catch (paydunyaError) {
      console.error('❌ Erreur PayDunya API:', paydunyaError.response?.data || paydunyaError.message);
      return res.status(502).json({ 
        error: paydunyaError.response?.data?.response_text || paydunyaError.message 
      });
    }

  } catch (error) {
    console.error('❌ Checkout erreur:', error);
    res.status(500).json({ error: 'Erreur serveur checkout.' });
  }
});

// Webhook PayDunya
router.post('/payments/webhooks/paydunya', async (req, res) => {
  try {
    const body = req.body || {};

    // Vérifier ici la signature HMAC si fournie par PayDunya (X-Paydunya-Signature ...)
    // Par sécurité, valider aussi le montant/monnaie.

    const status = body.status || body.response_code;
    const isSuccess = status === 'success' || status === '00';
    const orderId = body?.data?.custom_data?.order_id || body?.order_id || null;

    if (isSuccess && orderId) {
      const order = await Order.findOne({ where: { id: orderId } });
      if (order) {
        await order.update({ status: 'paid' });
      }
      // Notifier vendeur via WebSocket si dispo
      if (global.notifySeller && order) {
        global.notifySeller(order.seller_id, 'new_order', { order: order.toJSON() });
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('❌ Webhook PayDunya erreur:', error);
    res.status(500).json({ error: 'Erreur webhook.' });
  }
});

module.exports = router;


