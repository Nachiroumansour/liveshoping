import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Smartphone, Lock, Key, User, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../services/api';

const RegisterSteps = ({ onDone }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+221');
  const [otp, setOtp] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirm, setPinConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugOtp, setDebugOtp] = useState('');
  const [showOtpMsg, setShowOtpMsg] = useState(false);

  // Fonction pour formater le numéro de téléphone
  const formatPhoneNumber = (value) => {
    let cleaned = value.replace(/[^\d+]/g, '');

    // Si ça ne commence pas par +221, l'ajouter automatiquement
    if (!cleaned.startsWith('+221')) {
      if (cleaned.startsWith('221')) {
        cleaned = '+' + cleaned;
      } else {
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

  const getDisplayPhone = () => {
    if (phone.startsWith('+221')) {
      return phone.substring(4);
    }
    return phone;
  };

  const handleSendOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!name.trim() || !phone.trim()) {
      setError('Nom de boutique et numéro requis');
      return;
    }
    setLoading(true);
    try {
      const res = await api.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name: name.trim(), phone_number: phone.trim() })
      });
      setDebugOtp(res.otp || '');
      setShowOtpMsg(true);
      setTimeout(() => setShowOtpMsg(false), 7000);
      setStep(2);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!otp.trim() || otp.length < 4) {
      setError('Code OTP requis');
      return;
    }
    setLoading(true);
    try {
      await api.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone.trim(), otp: otp.trim() })
      });
      setStep(3);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const handleSetPin = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (!/^[0-9]{4}$/.test(pin) || pin !== pinConfirm) {
      setError('Le code PIN doit contenir 4 chiffres et être confirmé');
      return;
    }
    setLoading(true);
    try {
      await api.request('/auth/set-pin', {
        method: 'POST',
        body: JSON.stringify({ phone_number: phone.trim(), name: name.trim(), pin })
      });
      const normalized = phone.trim();
      try { localStorage.setItem('prefill_phone', normalized); } catch {}
      if (onDone) onDone(normalized); else window.location.href = '/login';
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const stepLabels = ['Infos', 'OTP', 'PIN'];

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
              s === step ? 'bg-gray-900 text-white' : s < step ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            }`}>
              {s}
            </div>
            <span className={`text-xs font-medium ${s === step ? 'text-gray-900' : 'text-gray-400'}`}>
              {stepLabels[s - 1]}
            </span>
            {s < 3 && <div className={`w-6 h-px ${s < step ? 'bg-gray-900' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-5 p-3.5 bg-red-50 rounded-xl text-red-600 text-sm">{error}</div>
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
            <Label htmlFor="reg-name" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nom de la boutique
            </Label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="reg-name"
                type="text"
                placeholder="Ex: Boutique Awa"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-phone" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Numéro de téléphone
            </Label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <span className="text-sm text-gray-400 font-medium">🇸🇳 +221</span>
              </div>
              <input
                id="reg-phone"
                type="tel"
                placeholder="77 123 45 67"
                value={getDisplayPhone()}
                onChange={handlePhoneChange}
                className="w-full pl-24 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                required
              />
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  Recevoir le code
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
            <Label htmlFor="reg-otp" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code reçu par WhatsApp
            </Label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="reg-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-center tracking-widest text-lg transition-all"
                required
              />
            </div>
            {debugOtp && (
              <div className="mt-2 text-center">
                <span className="inline-block bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-xs font-mono">Code debug : {debugOtp}</span>
              </div>
            )}
          </div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Vérification...
                </>
              ) : (
                <>
                  Valider
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
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
            <Label htmlFor="reg-pin" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Code PIN
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="reg-pin"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-center tracking-widest text-lg transition-all"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-pin-confirm" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Confirmer le code PIN
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="reg-pin-confirm"
                type="password"
                inputMode="numeric"
                maxLength={4}
                placeholder="••••"
                value={pinConfirm}
                onChange={e => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 text-center tracking-widest text-lg transition-all"
                required
              />
            </div>
          </div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  Créer mon compte
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        </motion.form>
      )}

      {/* Toast OTP debug */}
      {showOtpMsg && debugOtp && (
        <div
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-xl rounded-2xl px-6 py-4 flex flex-col items-center w-[90vw] max-w-xs border border-gray-100"
          style={{ minWidth: 220 }}
        >
          <div className="flex items-center mb-1">
            <span className="text-gray-500 text-xl mr-2">📩</span>
            <span className="font-medium text-gray-800 text-sm">Votre code LiveLink :</span>
          </div>
          <span className="font-mono text-2xl text-gray-900 tracking-widest">{debugOtp}</span>
        </div>
      )}
    </div>
  );
};

export default RegisterSteps;
