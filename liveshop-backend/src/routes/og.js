const express = require('express');
const router = express.Router();
const { Seller, Product, Live } = require('../models');

// Helper: escape HTML entities
const esc = (str) => {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
};

// Helper: generate OG HTML page
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
<meta http-equiv="refresh" content="0;url=${esc(redirectUrl || url)}">
</head>
<body>
<p>Redirection vers <a href="${esc(redirectUrl || url)}">${esc(title)}</a>...</p>
</body>
</html>`;
};

// OG for shop page: /og/:linkId
router.get('/:linkId', async (req, res) => {
  try {
    const { linkId } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.redirect(`https://livelink.store/${linkId}`);
    }

    // Get product count and first product images for richer preview
    const products = await Product.findAll({
      where: { seller_id: seller.id },
      attributes: ['name', 'price', 'image_url', 'images'],
      order: [['is_pinned', 'DESC'], ['created_at', 'DESC']],
      limit: 4
    });

    const productCount = await Product.count({
      where: { seller_id: seller.id }
    });

    const baseUrl = 'https://livelink.store';
    const shopUrl = `${baseUrl}/${linkId}`;

    // Build description
    const priceRange = products.length > 0
      ? products.map(p => p.price).filter(Boolean)
      : [];
    const minPrice = priceRange.length > 0 ? Math.min(...priceRange) : null;
    const maxPrice = priceRange.length > 0 ? Math.max(...priceRange) : null;

    let description = seller.description || '';
    if (!description && productCount > 0) {
      description = `${productCount} produit${productCount > 1 ? 's' : ''} disponible${productCount > 1 ? 's' : ''}`;
      if (minPrice && maxPrice && minPrice !== maxPrice) {
        description += ` — ${minPrice.toLocaleString()} à ${maxPrice.toLocaleString()} FCFA`;
      } else if (minPrice) {
        description += ` — à partir de ${minPrice.toLocaleString()} FCFA`;
      }
    }
    if (!description) {
      description = 'Boutique en ligne — Commandez par lien, payez en FCFA';
    }

    // Use seller logo, or first product image, or default
    let ogImage = seller.logo_url || '';
    if (!ogImage && products.length > 0) {
      for (const p of products) {
        if (p.image_url) { ogImage = p.image_url; break; }
        if (p.images) {
          try {
            const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
            if (Array.isArray(imgs) && imgs.length > 0) {
              ogImage = typeof imgs[0] === 'string' ? imgs[0] : imgs[0].url || imgs[0].optimizedUrl || '';
              if (ogImage) break;
            }
          } catch {}
        }
      }
    }
    if (!ogImage) ogImage = `${baseUrl}/liveshop.png`;

    // Ensure absolute URL
    if (ogImage && !ogImage.startsWith('http')) {
      ogImage = `https://api.livelink.store${ogImage}`;
    }

    const title = `${seller.name} — Boutique en ligne`;

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
    res.redirect(`https://livelink.store/${req.params.linkId}`);
  }
});

// OG for live session: /og/:linkId/live/:liveSlug
router.get('/:linkId/live/:liveSlug', async (req, res) => {
  try {
    const { linkId, liveSlug } = req.params;

    const seller = await Seller.findOne({
      where: { public_link_id: linkId }
    });

    if (!seller) {
      return res.redirect(`https://livelink.store/${linkId}/live/${liveSlug}`);
    }

    const live = await Live.findOne({
      where: { sellerId: seller.id, slug: liveSlug }
    });

    const baseUrl = 'https://livelink.store';
    const liveUrl = `${baseUrl}/${linkId}/live/${liveSlug}`;

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
          if (p.image_url) ogImage = p.image_url;
          else if (p.images) {
            try {
              const imgs = typeof p.images === 'string' ? JSON.parse(p.images) : p.images;
              if (Array.isArray(imgs) && imgs.length > 0) {
                ogImage = typeof imgs[0] === 'string' ? imgs[0] : imgs[0].url || imgs[0].optimizedUrl || '';
              }
            } catch {}
          }
        }
      }
    }

    if (!ogImage && seller.logo_url) ogImage = seller.logo_url;
    if (!ogImage) ogImage = `${baseUrl}/liveshop.png`;
    if (ogImage && !ogImage.startsWith('http')) {
      ogImage = `https://api.livelink.store${ogImage}`;
    }

    const title = live?.title
      ? `${live.title} — ${seller.name}`
      : `Vente en direct — ${seller.name}`;

    let description = '';
    if (productNames.length > 0) {
      description = productNames.slice(0, 3).join(', ');
      if (productNames.length > 3) description += ` +${productNames.length - 3} autres`;
      description += ' — Achetez maintenant';
    } else {
      description = `Vente en direct par ${seller.name} — Commandez en ligne`;
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
    res.redirect(`https://livelink.store/${req.params.linkId}/live/${req.params.liveSlug}`);
  }
});

module.exports = router;
