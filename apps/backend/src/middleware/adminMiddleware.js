const requireAdmin = (req, res, next) => {
  if (!req.seller) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  if (!['admin', 'superadmin'].includes(req.seller.role)) {
    return res.status(403).json({ error: 'Accès refusé. Rôle admin requis.' });
  }

  next();
};

const requireSuperAdmin = (req, res, next) => {
  console.log('🔍 RequireSuperAdmin - req.seller:', req.seller);
  console.log('🔍 RequireSuperAdmin - req.seller.role:', req.seller?.role);
  
  if (!req.seller) {
    console.log('🔍 RequireSuperAdmin - Erreur: Authentification requise');
    return res.status(401).json({ error: 'Authentification requise' });
  }

  if (req.seller.role !== 'superadmin') {
    console.log('🔍 RequireSuperAdmin - Erreur: Rôle superadmin requis, reçu:', req.seller.role);
    return res.status(403).json({ error: 'Accès refusé. Rôle superadmin requis.' });
  }

  console.log('🔍 RequireSuperAdmin - Accès autorisé pour:', req.seller.name);
  next();
};

const requireActiveUser = (req, res, next) => {
  if (!req.seller) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  if (!req.seller.is_active) {
    return res.status(403).json({ error: 'Compte suspendu. Contactez l\'administrateur.' });
  }

  next();
};

module.exports = {
  requireAdmin,
  requireSuperAdmin,
  requireActiveUser
}; 