import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QrCode, Download, Share } from 'lucide-react';

const QRCodeModal = ({ isOpen, onClose, orderId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && orderId) {
      generateQRCode();
    }
  }, [isOpen, orderId]);

  const generateQRCode = async () => {
    try {
      setLoading(true);
      const isProd = window.location.hostname.includes('livelink.store');
      const deliveryUrl = isProd ? `https://livelink.store/delivery/${orderId}` : `http://localhost:5174/delivery/${orderId}`;
      
      // Utiliser une API en ligne pour générer le QR code
      const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(deliveryUrl)}`;
      setQrCodeUrl(qrCodeApiUrl);
    } catch (error) {
      console.error('Erreur lors de la génération du QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrCodeUrl;
      link.download = `qr-code-commande-${orderId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShareQR = async () => {
    if (navigator.share && qrCodeUrl) {
      try {
        await navigator.share({
          title: `QR Code - Commande #${orderId}`,
          text: `Scannez ce QR code pour voir les détails de la commande #${orderId}`,
          url: qrCodeUrl
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      // Fallback: copier l'URL
      navigator.clipboard.writeText(qrCodeUrl);
      alert('URL du QR code copiée dans le presse-papiers');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md ">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 ">
            <QrCode className="h-5 w-5 " />
            QR Code - Commande #{orderId}
          </DialogTitle>
        </DialogHeader>

        <div className="text-center space-y-4 ">
          {loading ? (
            <div className="flex items-center justify-center py-8 ">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 "></div>
            </div>
          ) : (
            <>
              <div className="bg-gray-50 p-4 rounded-lg ">
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Code pour la commande ${orderId}`}
                  className="mx-auto "
                />
              </div>
              
              <p className="text-sm text-gray-600 ">
                Scannez ce QR code pour accéder aux détails de livraison
              </p>

              <div className="flex gap-2 ">
                <Button 
                  onClick={handleDownloadQR}
                  variant="outline"
                  className="flex-1 "
                >
                  <Download className="w-4 h-4 mr-2 " />
                  Télécharger
                </Button>
                <Button 
                  onClick={handleShareQR}
                  variant="outline"
                  className="flex-1 "
                >
                  <Share className="w-4 h-4 mr-2 " />
                  Partager
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodeModal; 