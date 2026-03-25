const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/qr-codes');
    
    // Créer le dossier s'il n'existe pas
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Générer un nom unique pour le fichier
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `qr-${req.seller.id}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// Filtre pour les types de fichiers autorisés
const fileFilter = (req, file, cb) => {
  // Autoriser seulement les images
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées (PNG, JPG, JPEG)'), false);
  }
};

// Configuration de multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1 // 1 fichier à la fois
  }
});

// Middleware pour upload de QR code
const uploadQRCode = upload.single('qr_code');

// Configuration du stockage pour les logos
const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `logo-${req.seller.id}-${uniqueSuffix}${extension}`);
  }
});

const logoUpload = multer({
  storage: logoStorage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 }
});

// Middleware pour upload de logo
const uploadLogo = logoUpload.single('logo');

// Middleware pour gérer les erreurs d'upload
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Fichier trop volumineux. Taille maximum : 5MB' 
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Trop de fichiers. Maximum : 1 fichier' 
      });
    }
  }
  
  if (error.message.includes('Seules les images sont autorisées')) {
    return res.status(400).json({ 
      error: 'Format de fichier non autorisé. Utilisez PNG, JPG ou JPEG' 
    });
  }
  
  next(error);
};

module.exports = {
  uploadQRCode,
  uploadLogo,
  handleUploadError
}; 