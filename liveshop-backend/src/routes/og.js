const express = require('express');
const router = express.Router();
const { Seller, Product, Live } = require('../models');

const FAVICON_URL = 'https://livelink.store/favicon.jpg';
const BASE_URL = 'https://livelink.store';

// Helper: escape HTML entities
const esc = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// Helper: get first product image
const getProductImage = (product) => {
  if (product.image_url) return product.image_url;
  if (product.images) {
    try {
      const imgs = typeof product.images === 'string' ? JSON.parse(product.images) : product.images;
      if (Array.isArray(imgs) && imgs.length > 0) {
        const url = typeof imgs[0] === 'string' ? imgs[0] : imgs[0].url || imgs[0].optimizedUrl || '';
        if (url) return url;
      }
    } catch {}
  }
  return null;
};

// Helper: ensure absolute URL
const absUrl = (url) => {
  if (!url) return FAVICON_URL;
  if (url.startsWith('http')) return url;
  return `https://api.livelink.store${url}`;
};

// Helper: generate OG HTML
const renderOgPage = ({ title, description, image, url, siteName, redirectUrl }) => {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:url" content="${esc(url)}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${esc(image)}">
<meta property="og:image:secure_url" content="${esc(image)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="${esc(siteName || 'LiveLink')}">
<meta property="og:locale" content="fr_FR">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${esc(image)}">
<link rel="icon" href="${FAVICON_URL}">
<meta http-equiv="refresh" content="0;url=${esc(redirectUrl || url)}">
</head>
<body>
<p>Redirection vers <a href="${esc(redirectUrl || url)}">${esc(title)}</a>...</p>
</body>
</html>`;
};

// ═══════════════════════════════════════
// OG for shop page: /og/:linkId
// ═══════════════════════════════════════
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.redirect(`${BASE_URL}/${linkId}`);
    }

    const products = await Product.findAll({
      where: { seller_id: seller.id },
      attributes: ['name', 'price', 'image_url', 'images'],
      order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
      limit: 4
    });

    const productCount = await Product.count({
      where: { seller_id: seller.id }
    });

    const shopUrl = `${BASE_URL}/${linkId}`;

    // Image: logo vendeur → sinon favicon LiveShop
    const ogImage = absUrl(seller.logo_url || null);

    // Title comme SamaPanier: "NomBoutique — description courte"
    const title = seller.description
      ? `${seller.name} — ${seller.description}`
      : `${seller.name} — Boutique en ligne + commande par lien`;

    // Description: infos produits
    let description = `Boutique en ligne + commande par lien.`;
    if (productCount > 0) {
      const prices = products.map(p => p.price).filter(Boolean);
      const minPrice = prices.length > 0 ? Math.min(...prices) : null;
      description += ` ${productCount} produit${productCount > 1 ? 's' : ''} disponible${productCount > 1 ? 's' : ''}.`;
      if (minPrice) {
        description += ` Payez en FCFA.`;
      }
    } else {
      description += ' Payez en FCFA.';
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(renderOgPage({
      title,
      description,
      image: ogImage,
      url: shopUrl,
      siteName: seller.name,
      redirectUrl: shopUrl
    }));

  } catch (error) {
    console.error('OG route error:', error);
    res.redirect(`${BASE_URL}/${req.params.linkId}`);
  }
});

// ═══════════════════════════════════════
// OG for live session: /og/:linkId/live/:liveSlug
// ═══════════════════════════════════════
router.get('/:linkId/live/:liveSlug', async (req, res) => {
  try {
    const { linkId, liveSlug } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.redirect(`${BASE_URL}/${linkId}/live/${liveSlug}`);
    }

    const live = await Live.findOne({
      where: { sellerId: seller.id, slug: liveSlug }
    });

    const liveUrl = `${BASE_URL}/${linkId}/live/${liveSlug}`;

    // Get products from the live session
    let ogImage = '';
    let productNames = [];

    if (live) {
      const liveProducts = await live.getProducts({
        attributes: ['name', 'price', 'image_url', 'images'],
        limit: 4
      });

      for (const p of liveProducts) {
        productNames.push(p.name);
        if (!ogImage) {
          const img = getProductImage(p);
          if (img) ogImage = img;
        }
      }
    }

    // Live: photo produit → sinon logo vendeur → sinon favicon
    ogImage = absUrl(ogImage || seller.logo_url || null);

    const title = live?.title
      ? `${live.title} — ${seller.name}`
      : `Vente en direct — ${seller.name}`;

    let description = '';
    if (productNames.length > 0) {
      description = productNames.slice(0, 3).join(', ');
      if (productNames.length > 3) description += ` +${productNames.length - 3} autres`;
      description += '. Commandez en ligne, payez en FCFA.';
    } else {
      description = `Vente en direct par ${seller.name}. Commandez en ligne, payez en FCFA.`;
    }

    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(renderOgPage({
      title,
      description,
      image: ogImage,
      url: liveUrl,
      siteName: seller.name,
      redirectUrl: liveUrl
    }));

  } catch (error) {
    console.error('OG live route error:', error);
    res.redirect(`${BASE_URL}/${req.params.linkId}/live/${req.params.liveSlug}`);
  }
});

module.exports = router;
