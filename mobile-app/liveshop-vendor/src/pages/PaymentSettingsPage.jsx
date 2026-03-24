import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/api';
import { getImageUrl } from '../config/domains';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  Settings,
  Save,
  Smartphone,
  Camera
} from 'lucide-react';
import { toast } from 'sonner';
import PhotoCapture from '../components/PhotoCapture';
import { extractQRCodeFromImage, hasQRCode } from '../utils/qrCodeExtractor';

const PaymentSettingsPage = () => {
  const { seller } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [paymentSettings, setPaymentSettings] = useState({
    wave_qr_code_url: null,
    orange_money_qr_code_url: null,
    payment_settings: {},
    payment_methods_enabled: ['manual']
  });

  const [showPhotoCapture, setShowPhotoCapture] = useState(false);
  const [currentPaymentMethod, setCurrentPaymentMethod] = useState(null);

  useEffect(() => {
    loadPaymentSettings();
  }, []);

  const loadPaymentSettings = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getPaymentSettings();
      
      // Parser payment_methods_enabled si c'est une chaîne JSON
      const data = response.data;
      if (typeof data.payment_methods_enabled === 'string') {
        data.payment_methods_enabled = JSON.parse(data.payment_methods_enabled);
      }
      
      setPaymentSettings(data);
    } catch (error) {
      console.error('Erreur chargement paramètres paiement:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event, paymentMethod) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validation du fichier
    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (PNG, JPG, JPEG)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast.error('Fichier trop volumineux. Taille maximum : 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // Vérifier si l'image contient un QR code
      const containsQR = await hasQRCode(file);
      
      if (!containsQR) {
        toast.warning('Aucun QR code détecté dans l\'image. L\'image complète sera utilisée.');
      }
      
      // Extraire le QR code de l'image
      const extractedFile = await extractQRCodeFromImage(file);
      
      const formData = new FormData();
      formData.append('qr_code', extractedFile);
      formData.append('payment_method', paymentMethod);

      const response = await ApiService.uploadQRCode(formData);
      
      // Mettre à jour l'état local
      setPaymentSettings(prev => ({
        ...prev,
        [`${paymentMethod}_qr_code_url`]: response.data.qr_code_url,
        payment_methods_enabled: response.data.payment_methods_enabled
      }));

      if (containsQR) {
        toast.success(`QR code ${paymentMethod} extrait et uploadé avec succès`);
      } else {
        toast.success(`Image ${paymentMethod} uploadée avec succès`);
      }
      
    } catch (error) {
      console.error('Erreur upload QR code:', error);
      toast.error('Erreur lors de l\'upload du QR code');
    } finally {
      setUploading(false);
    }
  };

  const handlePhotoCapture = (paymentMethod) => {
    setCurrentPaymentMethod(paymentMethod);
    setShowPhotoCapture(true);
  };

  const handlePhotoCaptured = async (photos) => {
    if (photos.length === 0) return;

    try {
      setUploading(true);
      
      // Convertir la photo en fichier
      const photoDataUrl = photos[0];
      const response = await fetch(photoDataUrl);
      const blob = await response.blob();
      const file = new File([blob], `qr-code-${currentPaymentMethod}.jpg`, { type: 'image/jpeg' });
      
      // Vérifier si la photo contient un QR code
      const containsQR = await hasQRCode(file);
      
      if (!containsQR) {
        toast.warning('Aucun QR code détecté dans la photo. L\'image complète sera utilisée.');
      }
      
      // Extraire le QR code de la photo
      const extractedFile = await extractQRCodeFromImage(file);
      
      const formData = new FormData();
      formData.append('qr_code', extractedFile);
      formData.append('payment_method', currentPaymentMethod);

      const uploadResponse = await ApiService.uploadQRCode(formData);
      
      // Mettre à jour l'état local
      setPaymentSettings(prev => ({
        ...prev,
        [`${currentPaymentMethod}_qr_code_url`]: uploadResponse.data.qr_code_url,
        payment_methods_enabled: uploadResponse.data.payment_methods_enabled
      }));

      if (containsQR) {
        toast.success(`QR code ${currentPaymentMethod} extrait et uploadé avec succès`);
      } else {
        toast.success(`Photo ${currentPaymentMethod} uploadée avec succès`);
      }
      
    } catch (error) {
      console.error('Erreur upload QR code capturé:', error);
      toast.error('Erreur lors de l\'upload du QR code capturé');
    } finally {
      setUploading(false);
      setShowPhotoCapture(false);
      setCurrentPaymentMethod(null);
    }
  };

  const handleDeleteQRCode = async (paymentMethod) => {
    try {
      await ApiService.deleteQRCode(paymentMethod);
      
      // Mettre à jour l'état local
      setPaymentSettings(prev => {
        const currentMethods = typeof prev.payment_methods_enabled === 'string' 
          ? JSON.parse(prev.payment_methods_enabled) 
          : prev.payment_methods_enabled;
          
        return {
          ...prev,
          [`${paymentMethod}_qr_code_url`]: null,
          payment_methods_enabled: currentMethods.filter(m => m !== paymentMethod)
        };
      });

      toast.success(`QR code ${paymentMethod} supprimé`);
      
    } catch (error) {
      console.error('Erreur suppression QR code:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await ApiService.updatePaymentSettings(paymentSettings);
      toast.success('Paramètres sauvegardés');
    } catch (error) {
      console.error('Erreur sauvegarde paramètres:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const getPaymentMethodName = (method) => {
    switch (method) {
      case 'wave': return 'Wave';
      case 'orange_money': return 'Orange Money';
      case 'manual': return 'Preuve manuelle';
      default: return method;
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'wave': return <Smartphone className="w-5 h-5" />;
      case 'orange_money': return <CreditCard className="w-5 h-5" />;
      case 'manual': return <Settings className="w-5 h-5" />;
      default: return <Settings className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des paramètres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Configuration des Paiements
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Configurez vos méthodes de paiement pour permettre à vos clients de payer directement
        </p>
      </div>

      {/* Méthodes de paiement disponibles */}
      <div className="grid gap-6 mb-8">
        {/* Wave */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-6 h-6 text-blue-600" />
              Wave
            </CardTitle>
            <CardDescription>
              Configurez votre QR code Wave pour recevoir des paiements directs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentSettings.wave_qr_code_url ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">QR code configuré</span>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <img 
                    src={getImageUrl(paymentSettings.wave_qr_code_url)}
                    alt="QR Code Wave"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('wave-upload').click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Remplacer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteQRCode('wave')}
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Aucun QR code configuré</span>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Uploadez une image contenant votre QR code Wave. Le QR code sera automatiquement extrait.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => document.getElementById('wave-upload').click()}
                      disabled={uploading}
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Upload en cours...' : 'Choisir fichier'}
                    </Button>
                    <Button
                      onClick={() => handlePhotoCapture('wave')}
                      disabled={uploading}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {uploading ? 'Capture en cours...' : 'Prendre photo'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <input
              id="wave-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'wave')}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Orange Money */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-orange-600" />
              Orange Money
            </CardTitle>
            <CardDescription>
              Configurez votre QR code Orange Money pour recevoir des paiements directs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentSettings.orange_money_qr_code_url ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-600 font-medium">QR code configuré</span>
                </div>
                
                <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                  <img 
                    src={getImageUrl(paymentSettings.orange_money_qr_code_url)}
                    alt="QR Code Orange Money"
                    className="w-32 h-32 mx-auto"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('om-upload').click()}
                    disabled={uploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Remplacer
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleDeleteQRCode('orange_money')}
                    disabled={uploading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-600 font-medium">Aucun QR code configuré</span>
                </div>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600 mb-4">
                    Uploadez une image contenant votre QR code Orange Money. Le QR code sera automatiquement extrait.
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={() => document.getElementById('om-upload').click()}
                      disabled={uploading}
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {uploading ? 'Upload en cours...' : 'Choisir fichier'}
                    </Button>
                    <Button
                      onClick={() => handlePhotoCapture('orange_money')}
                      disabled={uploading}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      {uploading ? 'Capture en cours...' : 'Prendre photo'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <input
              id="om-upload"
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e, 'orange_money')}
              className="hidden"
            />
          </CardContent>
        </Card>
      </div>

      {/* Méthodes activées */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Méthodes de Paiement Activées</CardTitle>
          <CardDescription>
            Ces méthodes seront disponibles pour vos clients lors des commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {(typeof paymentSettings.payment_methods_enabled === 'string' 
              ? (() => {
                  try {
                    return JSON.parse(paymentSettings.payment_methods_enabled);
                  } catch (e) {
                    return ['manual'];
                  }
                })()
              : paymentSettings.payment_methods_enabled
            ).map((method) => (
              <Badge key={method} variant="secondary" className="flex items-center gap-1">
                {getPaymentMethodIcon(method)}
                {getPaymentMethodName(method)}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Sauvegarde...' : 'Sauvegarder'}
        </Button>
      </div>

      {/* Modal de capture photo */}
      <PhotoCapture
        isOpen={showPhotoCapture}
        onClose={() => setShowPhotoCapture(false)}
        onPhotoCaptured={handlePhotoCaptured}
        multiple={false}
      />
    </div>
  );
};

export default PaymentSettingsPage; 