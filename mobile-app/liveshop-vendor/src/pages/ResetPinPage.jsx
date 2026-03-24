import { useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, Smartphone, Lock, Key, ArrowRight } from 'lucide-react';

const ResetPinPage = () => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const apiService = api;

  // Fonction pour formater le numéro de téléphone (comme LoginPage)
  const formatPhoneNumber = (value) => {
    // Supprimer tous les caractères non numériques sauf le +
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // Si ça ne commence pas par +221, l'ajouter automatiquement
    if (!cleaned.startsWith('+221')) {
      // Si ça commence par 221, ajouter le +
      if (cleaned.startsWith('221')) {
        cleaned = '+' + cleaned;
      } else {
        // Sinon, ajouter +221
        cleaned = '+221' + cleaned.replace(/^\+/, '');
      }
    }
    
    // Limiter à 13 caractères (+221 + 9 chiffres)
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    
    return cleaned;
  };

  // Fonction pour gérer le changement du numéro de téléphone
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  // Fonction pour obtenir le numéro complet avec le préfixe +221
  const getFullPhone = () => {
    if (phone.startsWith('+221')) {
      return phone;
    }
    return '+221' + phone.replace(/^\+?221/, '');
  };

  // Étape 1 : Envoi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!phone.trim()) {
      setError('Numéro requis');
      return;
    }
    setLoading(true);
    try {
      const fullPhone = getFullPhone();
      const res = await fetch(`${apiService.baseURL}/auth/forgot-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: fullPhone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l’envoi du code');
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Étape 2 : Vérification OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!otp.trim() || otp.length < 4) {
      setError('Code OTP requis');
      return;
    }
    setLoading(true);
    try {
      // On ne fait que passer à l'étape suivante, la vérif se fait à l'étape 3
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Étape 3 : Réinitialisation PIN
  const handleSetPin = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[0-9]{4}$/.test(pin) || pin !== pinConfirm) {
      setError('Le code PIN doit contenir 4 chiffres et être confirmé');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiService.baseURL}/auth/reset-pin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone_number: phone.trim(), otp: otp.trim(), new_pin: pin })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la réinitialisation');
      window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4 ">
      <div className="w-full max-w-md ">
        <div className="text-center mb-8 ">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 ">
            <Store className="w-8 h-8 text-purple-600 " />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 ">LiveShop Link</h1>
          <p className="text-purple-100 ">Réinitialiser mon code PIN</p>
        </div>
        <Card className="shadow-2xl ">
          <CardHeader className="text-center ">
            <CardTitle className="text-2xl ">Mot de passe oublié</CardTitle>
            <CardDescription>
              {step === 1 && 'Entrez votre numéro'}
              {step === 2 && 'Vérifiez le code reçu sur WhatsApp'}
              {step === 3 && 'Choisissez un nouveau code PIN'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm ">{error}</div>
            )}
            {step === 1 && (
              <form onSubmit={handleSendOtp} className="space-y-6 ">
                <div className="space-y-2 ">
                  <Label htmlFor="phone">Numéro de téléphone</Label>
                  <div className="relative ">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="phone" type="tel" placeholder="Ex: 771234567 (prefixe +221 ajouté)" value={phone} onChange={handlePhoneChange} className="pl-10 " required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 " disabled={loading}>
                  {loading ? 'Envoi...' : 'Recevoir le code'}
                </Button>
              </form>
            )}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6 ">
                <div className="space-y-2 ">
                  <Label htmlFor="otp">Code reçu par WhatsApp</Label>
                  <div className="relative ">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="otp" type="text" inputMode="numeric" maxLength={6} placeholder="Code OTP" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} className="pl-10 text-center tracking-widest text-lg " required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 " disabled={loading}>
                  {loading ? 'Vérification...' : 'Valider'}
                </Button>
              </form>
            )}
            {step === 3 && (
              <form onSubmit={handleSetPin} className="space-y-6 ">
                <div className="space-y-2 ">
                  <Label htmlFor="pin">Nouveau code PIN</Label>
                  <div className="relative ">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="pin" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))} className="pl-10 text-center tracking-widest text-lg " required />
                  </div>
                </div>
                <div className="space-y-2 ">
                  <Label htmlFor="pin-confirm">Confirmer le code PIN</Label>
                  <div className="relative ">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400 " />
                    <Input id="pin-confirm" type="password" inputMode="numeric" maxLength={4} placeholder="••••" value={pinConfirm} onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))} className="pl-10 text-center tracking-widest text-lg " required />
                  </div>
                </div>
                <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 " disabled={loading}>
                  {loading ? 'Réinitialisation...' : 'Réinitialiser'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
        <div className="text-center mt-6 ">
          <p className="text-purple-100 text-sm ">
            © 2025 LiveShop Link - Votre solution de live commerce
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPinPage; 