const jwt = require('jsonwebtoken');
const { Seller } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'liveshop_secret_key';

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Token d\'accès requis' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    if (process.env.NODE_ENV !== 'production') console.log('🔍 Auth Middleware - Token décodé:', decoded);

    const seller = await Seller.findByPk(decoded.id);

    if (!seller) {
      return res.status(401).json({
        error: 'Vendeur non trouvé'
      });
    }

    if (process.env.NODE_ENV !== 'production') console.log('🔍 Auth Middleware - Vendeur trouvé:', {
      id: seller.id,
      name: seller.name,
      role: seller.role
    });

    req.seller = seller;
    next();
  } catch (error) {
    console.error('🔍 Auth Middleware - Erreur:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expiré' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token invalide' 
      });
    }

    return res.status(500).json({ 
      error: 'Erreur d\'authentification' 
    });
  }
};

const generateToken = (sellerId) => {
  return jwt.sign(
    { sellerId }, 
    JWT_SECRET, 
    { expiresIn: '30d' }
  );
};

/**
 * Middleware pour vérifier que l'utilisateur est un admin
 * Doit être utilisé après authenticateToken
 */
const adminOnly = async (req, res, next) => {
  try {
    if (!req.seller) {
      return res.status(401).json({
        error: 'Non authentifié'
      });
    }

    // Vérifier si le vendeur est admin (accepter plusieurs formats pour compatibilité)
    const validAdminRoles = ['admin', 'super_admin', 'superadmin'];
    if (!validAdminRoles.includes(req.seller.role)) {
      return res.status(403).json({
        error: 'Accès refusé',
        message: 'Cette action nécessite les droits administrateur',
        debug: `Role actuel: ${req.seller.role}`
      });
    }

    next();
  } catch (error) {
    console.error('🔍 AdminOnly Middleware - Erreur:', error);
    return res.status(500).json({
      error: 'Erreur de vérification des droits'
    });
  }
};

module.exports = {
  authenticateToken,
  generateToken,
  adminOnly
};

