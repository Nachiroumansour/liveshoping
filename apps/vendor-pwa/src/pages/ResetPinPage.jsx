import { useState } from 'react';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Store, Smartphone, Lock, Key } from 'lucide-react';
import { motion } from 'framer-motion';

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
    let cleaned = value.replace(/[^\d+]/g, '');
    if (!cleaned.startsWith('+221')) {
      if (cleaned.startsWith('221')) {
        cleaned = '+' + cleaned;
      } else {
        cleaned = '+221' + cleaned.replace(/^\+/, '');
      }
    }
    if (cleaned.length > 13) {
      cleaned = cleaned.substring(0, 13);
    }
    return cleaned;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

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
      if (!res.ok) throw new Error(data.error || 'Erreur lors de l\'envoi du code');
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

  const steps = [
    { num: 1, label: 'Numéro' },
    { num: 2, label: 'Vérification' },
    { num: 3, label: 'Nouveau PIN' },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-5 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-sm"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-2xl mb-5">
            <Store className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">PIN oublié</h1>
          <p className="text-sm text-gray-400 mt-1">Réinitialisez votre code en 3 étapes</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  step >= s.num
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-400'
                }`}>
                  {step > s.num ? '✓' : s.num}
                </div>
                <span className={`text-xs font-medium ${
                  step >= s.num ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`w-8 h-px ${step > s.num ? 'bg-gray-900' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-red-50 rounded-xl text-red-600 text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSendOtp}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro de téléphone
              </Label>
              <div className="relative">
                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="phone"
                  type="tel"
                  placeholder="Ex: 771234567"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                  required
                />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm h-auto" disabled={loading}>
                {loading ? 'Envoi...' : 'Recevoir le code'}
              </Button>
            </motion.div>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleVerifyOtp}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="otp" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Code reçu par WhatsApp
              </Label>
              <div className="relative">
                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-center tracking-[0.3em] text-lg font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                  required
                />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm h-auto" disabled={loading}>
                {loading ? 'Vérification...' : 'Valider le code'}
              </Button>
            </motion.div>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSetPin}
            className="space-y-5"
          >
            <div className="space-y-2">
              <Label htmlFor="pin" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nouveau code PIN
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-center tracking-[0.3em] text-lg font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin-confirm" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Confirmer le PIN
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  id="pin-confirm"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  placeholder="••••"
                  value={pinConfirm}
                  onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 text-center tracking-[0.3em] text-lg font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                  required
                />
              </div>
            </div>
            <motion.div whileTap={{ scale: 0.98 }}>
              <Button type="submit" className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm h-auto" disabled={loading}>
                {loading ? 'Réinitialisation...' : 'Réinitialiser mon PIN'}
              </Button>
            </motion.div>
          </motion.form>
        )}

        <div className="mt-6 text-center">
          <a
            href="/login"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Retour à la connexion
          </a>
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-300 text-xs">
            © 2025 LiveLink
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPinPage;
