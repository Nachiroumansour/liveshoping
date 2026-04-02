import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Camera, Upload, X, Check } from 'lucide-react';
import { getBackendDomain } from '../config/domains';

const ImageCapture = ({ 
  onImageUpload, 
  onImageRemove, 
  multiple = false, 
  maxImages = 5,
  uploadType = 'product', // 'product', 'payment-proof', 'avatar', 'live-banner'
  className = '',
  disabled = false 
}) => {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(mobile);
  }, []);

  // Fonction pour compresser l'image
  const compressImage = useCallback(async (file) => {
    // Si l'image fait moins de 1MB, on ne la touche pas
    if (file.size < 1024 * 1024) return file;

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner si plus grand que 1920px
        const maxSize = 1920;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const newFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            console.log(`Image compressée: ${file.size} -> ${newFile.size} bytes`);
            resolve(newFile);
          } else {
            reject(new Error('Erreur lors de la compression'));
          }
        }, 'image/jpeg', 0.8); // Qualité 0.8
      };
      img.onerror = (err) => reject(err);
    });
  }, []);

  // Fonction pour uploader une image vers Cloudinary
  const uploadImage = useCallback(async (file) => {
    setUploading(true);
    setError(null);
    setUploadSuccess(false);

    try {
      // Compresser l'image avant upload
      const compressedFile = await compressImage(file);
      
      const formData = new FormData();
      formData.append('image', compressedFile);

      const response = await fetch(`${getBackendDomain()}/api/upload/${uploadType}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('liveshop_token')}`
        },
        body: formData
      });

      if (!response.ok) {
        // Lire la réponse brute pour un meilleur debug (peut ne pas être du JSON)
        const text = await response.text();
        console.error('Upload response not ok:', response.status, text);
        let errorMsg = 'Erreur lors de l\'upload';
        try {
          const errorData = JSON.parse(text);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (e) {
          // response wasn't JSON
          errorMsg = text || errorMsg;
        }
        throw new Error(errorMsg);
      }

      const result = await response.json();
      setUploadSuccess(true);
      
      // Masquer le succès après 3 secondes
      setTimeout(() => {
        setUploadSuccess(false);
      }, 3000);
      
      return result.image;
    } catch (err) {
      console.error('Erreur upload image:', err);
      setError(err.message);
      setUploadSuccess(false);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [uploadType]);

  // Fonction pour arrêter la caméra
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  }, [stream]);

  // Fonction pour gérer l'upload d'image
  const handleImageUpload = useCallback(async (file) => {
    if (disabled || uploading) return;

    // Debug: log file meta pour diagnostiquer les échecs depuis la galerie
    console.debug('Selected file for upload:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Vérifier la taille du fichier (20MB max avant compression)
    if (file.size > 20 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 20MB)');
      return;
    }

    // Vérifier le type de fichier. Sur certains appareils (ex: iOS Photos depuis la galerie)
    // le `file.type` peut être vide ou non-standard (HEIC). On autorise alors par extension.
    const isImageType = file.type && file.type.startsWith('image/');
    const imageExtensionMatch = /\.(jpe?g|png|gif|webp|heic|heif|tiff)$/i.test(file.name || '');
    if (!isImageType && !imageExtensionMatch) {
      setError('Veuillez sélectionner une image valide');
      return;
    }

    // Si le type n'est pas reconnu (souvent galerie iOS HEIC) ou si l'extension est HEIC/HEIF,
    // essayer de convertir côté client en JPEG via canvas (createImageBitmap).
    const ext = (file.name || '').split('.').pop()?.toLowerCase() || '';
    const needsConversion = !isImageType || ['heic', 'heif', 'tiff'].includes(ext);
    let fileToUpload = file;

    if (needsConversion) {
      try {
        console.debug('Tentative de conversion client-side en JPEG pour:', file.name);
        // createImageBitmap gère plusieurs formats si le navigateur les supporte
        const imageBitmap = await createImageBitmap(file);
        const canvas = document.createElement('canvas');
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(imageBitmap, 0, 0);

        const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        if (blob) {
          fileToUpload = new File([blob], (file.name || 'image').replace(/\.[^/.]+$/, '') + '.jpg', { type: 'image/jpeg' });
          console.debug('Conversion OK — nouveau fichier:', fileToUpload);
        } else {
          console.debug('Conversion canvas a retourné null blob pour', file.name);
        }
      } catch (convErr) {
        console.debug('Conversion client-side impossible pour', file.name, convErr);
        // On continue avec le fichier d'origine si la conversion échoue
      }
    }

    // Vérifier la taille après conversion (10MB max côté client) — si trop grand, refuser avant upload
    if (fileToUpload.size > 10 * 1024 * 1024) {
      setError('L\'image est trop volumineuse (max 10MB)');
      return;
    }

    try {
      const uploadedImage = await uploadImage(fileToUpload);
      
      if (multiple) {
        if (images.length >= maxImages) {
          setError(`Maximum ${maxImages} images autorisées`);
          return;
        }
        const newImages = [...images, uploadedImage];
        setImages(newImages);
        onImageUpload?.(newImages);
      } else {
        setImages([uploadedImage]);
        onImageUpload?.(uploadedImage);
      }

      setError(null);
    } catch (err) {
      // L'erreur est déjà gérée dans uploadImage
    }
  }, [disabled, uploading, multiple, maxImages, images, onImageUpload, uploadImage]);

  // Fonction pour capturer une image depuis la caméra
  const captureImage = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Dessiner l'image de la vidéo sur le canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir le canvas en blob
    canvas.toBlob(async (blob) => {
      if (blob) {
        const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        await handleImageUpload(file);
        // Fermer la caméra après capture
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  }, [handleImageUpload, stopCamera]);

  // Fonction pour démarrer la caméra (desktop uniquement — getUserMedia)
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Caméra non supportée sur ce navigateur. Utilisez le bouton Galerie.');
        return;
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setShowCamera(true);
    } catch (err) {
      console.error('Erreur accès caméra:', err);
      if (err.name === 'NotFoundError') {
        setError('Aucune caméra trouvée. Utilisez le bouton Galerie.');
      } else if (err.name === 'NotReadableError') {
        setError('Caméra déjà utilisée par une autre application.');
      } else {
        setError('Impossible d\'accéder à la caméra. Utilisez le bouton Galerie.');
      }
    }
  }, []);

  // Fonction pour supprimer une image
  const removeImage = useCallback((index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImageRemove?.(newImages);
  }, [images, onImageRemove]);

  // Fonction pour gérer la sélection de fichier (supporte multi-sélection)
  const handleGallerySelect = useCallback(async (event) => {
    const files = Array.from(event.target.files || []);
    console.debug('Gallery select files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    if (files.length === 0) return;

    // Limiter au nombre d'images restantes autorisées
    const remainingSlots = multiple ? maxImages - images.length : 1;
    const filesToUpload = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError(`${remainingSlots} image(s) ajoutée(s) sur ${files.length} — maximum ${maxImages} atteint`);
    }

    // Upload séquentiel pour éviter de surcharger le serveur
    for (const file of filesToUpload) {
      try {
        await handleImageUpload(file);
      } catch (err) {
        console.error('handleImageUpload error (gallery):', err);
        setError(err.message || 'Erreur lors de l\'upload depuis la galerie');
      }
    }

    // Reset value so selecting same file again triggers change
    event.target.value = '';
  }, [handleImageUpload, multiple, maxImages, images.length]);

  const handleCameraSelect = useCallback((event) => {
    const files = Array.from(event.target.files || []);
    console.debug('Camera select files:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));

    if (files.length === 0) {
      event.target.value = '';
      return;
    }

    const file = files[0];

    try {
      handleImageUpload(file).catch(err => {
        console.error('handleImageUpload error (camera):', err);
        setError(err.message || 'Erreur lors de l\'upload depuis la caméra');
      });
    } catch (err) {
      console.error('Unexpected error handling camera file:', err);
      setError('Erreur inattendue lors de la capture');
    }

    // Reset input to allow selecting the same resource again later
    event.target.value = '';
  }, [handleImageUpload]);

  // Fonction pour gérer le drag & drop (supporte multi-fichiers)
  const handleDrop = useCallback(async (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    if (files.length === 0) return;

    const remainingSlots = multiple ? maxImages - images.length : 1;
    const filesToUpload = files.slice(0, remainingSlots);

    for (const file of filesToUpload) {
      try {
        await handleImageUpload(file);
      } catch (err) {
        console.error('handleImageUpload error (drop):', err);
      }
    }
  }, [handleImageUpload, multiple, maxImages, images.length]);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Interface caméra */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-4 max-w-md w-full">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold">Capture de l'image du produit</h3>
              <p className="text-sm text-gray-600">Positionnez votre téléphone pour capturer l'image</p>
            </div>
            
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover rounded-lg"
              />
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              
              {/* Contrôles caméra */}
              <div className="flex gap-3 mt-4">
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={captureImage}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={uploading}
                >
                  <Camera className="h-4 w-4 mr-2" />
                  {uploading ? 'Capture...' : 'Capturer'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zone d'upload */}
      {!showCamera && (
        <Card 
          className={`border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => !disabled && fileInputRef.current?.click()}
        >
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-gray-100 rounded-full">
                  <Upload className="h-6 w-6 text-gray-600" />
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {multiple ? 'Glissez-déposez vos images ici' : 'Glissez-déposez votre image ici'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ou cliquez pour sélectionner
                </p>
              </div>

              <div className="flex justify-center gap-2">
                {/* Caméra — label natif sur mobile pour compatibilité maximale (Samsung, Xiaomi…)
                    Sur desktop, button qui appelle getUserMedia */}
                {isMobile ? (
                  <label
                    htmlFor="camera-input-native"
                    onClick={(e) => e.stopPropagation()}
                    className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Camera className="h-4 w-4" />
                    Caméra
                  </label>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); startCamera(); }}
                    disabled={disabled}
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Caméra
                  </Button>
                )}

                {/* Galerie — label natif */}
                <label
                  htmlFor="gallery-input-native"
                  onClick={(e) => e.stopPropagation()}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <Upload className="h-4 w-4" />
                  Galerie
                </label>
              </div>

              {multiple && (
                <p className="text-xs text-gray-500">
                  Maximum {maxImages} images
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Input file caché - avec capture mobile */}
      {/* Input galerie (sans capture) */}
      <input
        ref={fileInputRef}
        id="gallery-input-native"
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={handleGallerySelect}
        className="hidden"
      />

      {/* Input caméra (avec capture) — mobile only: opens camera natively */}
      <input
        ref={cameraInputRef}
        id="camera-input-native"
        type="file"
        accept="image/*"
        capture="environment"
        multiple={false}
        onChange={handleCameraSelect}
        className="hidden"
      />

      {/* Messages d'erreur */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Indicateur de chargement */}
      {uploading && (
        <div className="text-blue-600 text-sm bg-blue-50 p-4 rounded-lg flex items-center gap-3 border border-blue-200">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
          <div>
            <div className="font-medium">Upload en cours...</div>
            <div className="text-xs text-blue-500">Sauvegarde de votre image</div>
          </div>
        </div>
      )}

      {/* Message de succès temporaire */}
      {uploadSuccess && (
        <div className="text-green-600 text-sm bg-green-50 p-3 rounded-lg flex items-center gap-2 animate-pulse border border-green-200">
          <Check className="w-4 h-4" />
          <span className="font-medium">Image sauvegardée avec succès !</span>
        </div>
      )}

      {/* Images uploadées */}
      {images.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900">
            Images sélectionnées ({images.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={`Image ${index + 1}`}
                  className={`w-full h-24 object-cover rounded-lg border-2 transition-all duration-300 ${
                    uploadSuccess ? 'border-green-400 shadow-lg shadow-green-200' : 'border-gray-200'
                  }`}
                />
                
                <Button
                  onClick={() => removeImage(index)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {/* Indicateur de succès */}
                <div className={`absolute bottom-1 left-1 px-2 py-1 rounded-full text-xs flex items-center transition-all duration-300 ${
                  uploadSuccess 
                    ? 'bg-green-500 text-white shadow-lg animate-pulse' 
                    : 'bg-green-500 text-white'
                }`}>
                  <Check className="h-3 w-3 mr-1" />
                  {uploadSuccess ? '✅' : '✓'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageCapture; 