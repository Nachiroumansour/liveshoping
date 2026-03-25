import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import RegisterSteps from '@/components/RegisterSteps';
import { Label } from '@/components/ui/label';
import { Store, ArrowRight } from 'lucide-react';
import PinInput from '@/components/ui/PinInput';
import Checkbox from '@/components/ui/checkbox';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const { login, register, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTab, setActiveTab] = useState('login'); // 'login' ou 'register'
  const navigate = useNavigate();

  // Enlever la classe 'dark' du HTML pour forcer le thème clair
  useEffect(() => {
    // Forcer le thème clair sur la page de connexion
    document.documentElement.classList.remove('dark');
    localStorage.removeItem('liveshop-theme');
  }, []);

  // Fonction pour formater le numéro de téléphone
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

  // Fonction pour obtenir l'affichage du numéro (sans le préfixe pour l'input)
  const getDisplayPhone = () => {
    if (phone.startsWith('+221')) {
      return phone.substring(4); // Retourne seulement les chiffres après +221
    }
    return phone;
  };

  // Fonction pour obtenir le numéro complet
  const getFullPhone = () => {
    if (phone.startsWith('+221')) {
      return phone;
    }
    return '+221' + phone;
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }

    // Charger les données sauvegardées si "Se souvenir" était activé
    const savedPhone = localStorage.getItem('remembered_phone');
    const savedRememberMe = localStorage.getItem('remember_me') === 'true';

    if (savedRememberMe && savedPhone) {
      setPhone(savedPhone);
      setRememberMe(true);
    }
    const prefill = localStorage.getItem('prefill_phone');
    if (prefill) {
      setActiveTab('login');
      setPhone(prefill);
      try { localStorage.removeItem('prefill_phone'); } catch {}
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();

    const fullPhone = getFullPhone();

    if (!fullPhone.trim() || !/^\+\d{8,15}$/.test(fullPhone.trim())) {
      setError('Veuillez saisir votre numéro au format international (ex: +221771234567)');
      return;
    }
    if (!/^[0-9]{4}$/.test(pin)) {
      setError('Veuillez saisir votre code PIN à 4 chiffres');
      return;
    }
    setLoading(true);
    setError('');

    // Sauvegarder les données si "Se souvenir" est activé
    if (rememberMe) {
      localStorage.setItem('remembered_phone', fullPhone.trim());
      localStorage.setItem('remember_me', 'true');
    } else {
      localStorage.removeItem('remembered_phone');
      localStorage.removeItem('remember_me');
    }

    const result = await login(fullPhone.trim(), pin, rememberMe);
    if (!result.success) {
      setError(result.error || 'Numéro ou code PIN incorrect');
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Rediriger vers la page d'inscription dédiée
    navigate('/register');
  };

  const handleForgot = () => {
    window.location.href = '/reset-pin';
  };

  const handleBackToLogin = () => {
    setActiveTab('login');
    setError('');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(''); // Effacer l'erreur lors du changement d'onglet
  };

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">LiveLink</h1>
          <p className="text-sm text-gray-400 mt-1">Espace Vendeur</p>
        </div>

        {/* Onglets */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-8">
          <button
            onClick={() => handleTabChange('login')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'login'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => handleTabChange('register')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'register'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500'
            }`}
          >
            Inscription
          </button>
        </div>

        {activeTab === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Numéro de téléphone
                </Label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <span className="text-sm text-gray-400 font-medium">🇸🇳 +221</span>
                  </div>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="77 123 45 67"
                    value={getDisplayPhone()}
                    onChange={handlePhoneChange}
                    className="w-full pl-24 pr-4 py-3.5 bg-gray-50 border-0 rounded-xl text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-900/10 transition-all"
                    autoComplete="off"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin" className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code PIN
                </Label>
                <div className="flex justify-center py-2">
                  <PinInput value={pin} onChange={setPin} length={4} />
                </div>
              </div>

              {/* Option "Se souvenir" */}
              <Checkbox
                id="remember-me"
                checked={rememberMe}
                onChange={setRememberMe}
                label="Se souvenir de moi"
              />

              <motion.div whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3.5 rounded-xl font-medium text-sm h-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Connexion...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Se connecter
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 flex justify-between items-center">
              <button
                type="button"
                onClick={handleForgot}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                PIN oublié ?
              </button>
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="text-sm text-gray-900 font-medium hover:text-gray-600 transition-colors"
              >
                Créer un compte →
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="register"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {error && (
              <div className="mb-5 p-3.5 bg-red-50 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Composant des 3 étapes d'inscription */}
            <RegisterSteps onDone={(createdPhone) => { try { if (createdPhone) localStorage.setItem('prefill_phone', createdPhone); } catch {} setActiveTab('login'); const prefill = localStorage.getItem('prefill_phone'); if (prefill) setPhone(prefill); }} />

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={handleBackToLogin}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                ← Retour à la connexion
              </button>
            </div>
          </motion.div>
        )}

        <div className="text-center mt-10">
          <p className="text-gray-300 text-xs">
            © 2025 LiveLink
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
