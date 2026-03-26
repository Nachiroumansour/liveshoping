import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Package, ShoppingBag, Share2, Video } from 'lucide-react';

const slides = [
  {
    icon: Package,
    title: 'Ajoutez vos produits',
    description: 'Publiez vos articles avec photos, prix et variantes. Votre catalogue est prêt en quelques minutes.',
    image: '/images/onboarding/step1.jpg',
  },
  {
    icon: ShoppingBag,
    title: 'Recevez des commandes',
    description: 'Vos clients commandent depuis leur téléphone. Vous êtes notifié en temps réel à chaque vente.',
    image: '/images/onboarding/step2.png',
  },
  {
    icon: Share2,
    title: 'Partagez votre boutique',
    description: 'Un lien unique à envoyer sur WhatsApp, Facebook ou partout. Vos clients commandent directement.',
    image: '/images/onboarding/step3.png',
  },
  {
    icon: Video,
    title: 'Vendez en live',
    description: 'Créez une session live, sélectionnez vos produits et partagez le lien. Vos clients voient les produits et commandent en temps réel pendant votre diffusion.',
    image: '/images/onboarding/step4.png',
  },
];

const OnboardingPage = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      localStorage.removeItem('just_registered');
      navigate('/dashboard');
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('just_registered');
    navigate('/dashboard');
  };

  const slide = slides[current];
  const isLast = current === slides.length - 1;

  return (
    <div className="min-h-screen bg-white flex flex-col lg:flex-row">
      {/* Desktop left panel — photo */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gray-50 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={slide.image}
            alt={slide.title}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="w-full h-full object-cover absolute inset-0"
          />
        </AnimatePresence>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 lg:justify-center">
        {/* Skip */}
        <div className="flex justify-end px-6 pt-6 lg:pt-0 lg:absolute lg:top-8 lg:right-8">
          <button
            onClick={handleSkip}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Passer
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 lg:pb-0">
          {/* Photo (mobile only) */}
          <div className="lg:hidden mb-8 w-full rounded-3xl overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={current}
                src={slide.image}
                alt={slide.title}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35 }}
                className="w-full h-100 object-cover"
              />
            </AnimatePresence>
          </div>

          {/* Text */}
          <div className="w-full max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gray-900 rounded-xl flex items-center justify-center">
                    <slide.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Étape {current + 1} sur {slides.length}
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                  {slide.title}
                </h1>
                <p className="text-gray-500 text-[15px] leading-relaxed">
                  {slide.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Dots + Button */}
            <div className="mt-10 space-y-6">
              {/* Dots */}
              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === current ? 'w-8 bg-gray-900' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>

              {/* CTA */}
              <motion.div whileTap={{ scale: 0.98 }}>
                <button
                  onClick={handleNext}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white h-[52px] rounded-2xl font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  {isLast ? 'Commencer' : 'Suivant'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
