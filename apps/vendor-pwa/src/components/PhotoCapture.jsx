import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Camera, Upload, X, RotateCcw, Check } from 'lucide-react';

const PhotoCapture = ({ isOpen, onClose, onPhotoCaptured, multiple = false }) => {
  const [capturedPhotos, setCapturedPhotos] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Caméra arrière par défaut
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Erreur lors de l\'accès à la caméra:', error);
      alert('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      // Ajuster la taille du canvas à la vidéo
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Capturer l'image
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const photoDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setCurrentPhoto(photoDataUrl);
      setIsCapturing(false);
    }
  };

  const retakePhoto = () => {
    setCurrentPhoto(null);
    setIsCapturing(true);
  };

  const acceptPhoto = () => {
    if (currentPhoto) {
      if (multiple) {
        setCapturedPhotos([...capturedPhotos, currentPhoto]);
        setCurrentPhoto(null);
        setIsCapturing(true);
      } else {
        onPhotoCaptured([currentPhoto]);
        handleClose();
      }
    }
  };

  const removePhoto = (index) => {
    setCapturedPhotos(capturedPhotos.filter((_, i) => i !== index));
  };

  const finishCapture = () => {
    if (capturedPhotos.length > 0) {
      onPhotoCaptured(capturedPhotos);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedPhotos([]);
    setCurrentPhoto(null);
    setIsCapturing(false);
    onClose();
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    const photoPromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(photoPromises).then(photos => {
      if (multiple) {
        setCapturedPhotos([...capturedPhotos, ...photos]);
      } else {
        onPhotoCaptured(photos);
        handleClose();
      }
    });
  };

  React.useEffect(() => {
    if (isOpen && !currentPhoto) {
      setIsCapturing(true);
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 ">
            <Camera className="h-5 w-5 " />
            {multiple ? 'Capturer des photos' : 'Capturer une photo'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 ">
          {/* Zone de capture */}
          <div className="relative bg-black rounded-lg overflow-hidden ">
            {isCapturing && (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-64 object-cover "
                />
                <canvas
                  ref={canvasRef}
                  className="hidden "
                />
                <div className="absolute inset-0 flex items-center justify-center ">
                  <div className="border-2 border-white border-dashed rounded-lg p-4 ">
                    <p className="text-white text-sm ">Positionnez votre produit</p>
                  </div>
                </div>
              </>
            )}

            {currentPhoto && (
              <img
                src={currentPhoto}
                alt="Photo capturée"
                className="w-full h-64 object-cover "
              />
            )}

            {capturedPhotos.length > 0 && multiple && (
              <div className="grid grid-cols-3 gap-2 p-2 ">
                {capturedPhotos.map((photo, index) => (
                  <div key={index} className="relative ">
                    <img
                      src={photo}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-20 object-cover rounded "
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center "
                    >
                      <X className="w-3 h-3 " />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Contrôles */}
          <div className="flex gap-2 ">
            {isCapturing && (
              <Button
                onClick={capturePhoto}
                className="flex-1 "
              >
                <Camera className="w-4 h-4 mr-2 " />
                Capturer
              </Button>
            )}

            {currentPhoto && (
              <>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1 "
                >
                  <RotateCcw className="w-4 h-4 mr-2 " />
                  Reprendre
                </Button>
                <Button
                  onClick={acceptPhoto}
                  className="flex-1 "
                >
                  <Check className="w-4 h-4 mr-2 " />
                  Accepter
                </Button>
              </>
            )}

            {multiple && capturedPhotos.length > 0 && (
              <Button
                onClick={finishCapture}
                className="flex-1 "
              >
                Terminer ({capturedPhotos.length})
              </Button>
            )}
          </div>

          {/* Upload depuis la galerie */}
          <div className="border-t pt-4 ">
            <label className="flex items-center justify-center gap-2 text-sm text-gray-600 cursor-pointer ">
              <Upload className="w-4 h-4 " />
              Ou sélectionner depuis la galerie
              <input
                type="file"
                accept="image/*"
                multiple={multiple}
                onChange={handleFileUpload}
                className="hidden "
              />
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PhotoCapture; 