import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Package, ShoppingBag, Share2 } from 'lucide-react';

// --- Illustrated visuals as inline SVG scenes ---

const ProductsVisual = () => (
  <div className="relative w-[280px] h-[280px] lg:w-[360px] lg:h-[360px]">
    <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
      {/* Phone frame */}
      <rect x="90" y="30" width="180" height="300" rx="24" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5" />
      <rect x="90" y="30" width="180" height="40" rx="24" fill="#F9FAFB" />
      <circle cx="180" cy="50" r="4" fill="#D1D5DB" />

      {/* Product card 1 */}
      <rect x="110" y="85" width="140" height="55" rx="12" fill="#F9FAFB" />
      <rect x="120" y="93" width="38" height="38" rx="8" fill="#E5E7EB" />
      {/* Image icon inside */}
      <path d="M131 108 L137 102 L143 108 L149 100 L150 120 H128 Z" fill="#D1D5DB" />
      <circle cx="134" cy="103" r="3" fill="#D1D5DB" />
      <text x="168" y="108" fontSize="10" fontWeight="600" fill="#111827">Robe Wax</text>
      <text x="168" y="122" fontSize="9" fontWeight="700" fill="#111827">12 000 F</text>

      {/* Product card 2 */}
      <rect x="110" y="150" width="140" height="55" rx="12" fill="#F9FAFB" />
      <rect x="120" y="158" width="38" height="38" rx="8" fill="#E5E7EB" />
      <path d="M131 173 L137 167 L143 173 L149 165 L150 185 H128 Z" fill="#D1D5DB" />
      <circle cx="134" cy="168" r="3" fill="#D1D5DB" />
      <text x="168" y="173" fontSize="10" fontWeight="600" fill="#111827">Sac cuir</text>
      <text x="168" y="187" fontSize="9" fontWeight="700" fill="#111827">8 500 F</text>

      {/* Product card 3 */}
      <rect x="110" y="215" width="140" height="55" rx="12" fill="#F9FAFB" />
      <rect x="120" y="223" width="38" height="38" rx="8" fill="#E5E7EB" />
      <path d="M131 238 L137 232 L143 238 L149 230 L150 250 H128 Z" fill="#D1D5DB" />
      <circle cx="134" cy="233" r="3" fill="#D1D5DB" />
      <text x="168" y="238" fontSize="10" fontWeight="600" fill="#111827">Collier perles</text>
      <text x="168" y="252" fontSize="9" fontWeight="700" fill="#111827">5 000 F</text>

      {/* Floating + button */}
      <circle cx="240" cy="290" r="22" fill="#111827" />
      <line x1="232" y1="290" x2="248" y2="290" stroke="white" strokeWidth="2" strokeLinecap="round" />
      <line x1="240" y1="282" x2="240" y2="298" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  </div>
);

const OrdersVisual = () => (
  <div className="relative w-[280px] h-[280px] lg:w-[360px] lg:h-[360px]">
    <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
      {/* Phone frame */}
      <rect x="90" y="30" width="180" height="300" rx="24" fill="#fff" stroke="#E5E7EB" strokeWidth="1.5" />

      {/* Notification banner at top */}
      <rect x="110" y="50" width="140" height="44" rx="10" fill="#111827" />
      <circle cx="128" cy="72" r="10" fill="#374151" />
      <text x="128" y="75" fontSize="8" fontWeight="700" fill="white" textAnchor="middle">N</text>
      <text x="144" y="66" fontSize="8" fontWeight="600" fill="white">Nouvelle commande !</text>
      <text x="144" y="78" fontSize="7" fill="#9CA3AF">Awa Ba · 15 000 F</text>

      {/* Order card 1 - active */}
      <rect x="110" y="110" width="140" height="68" rx="12" fill="#F9FAFB" stroke="#111827" strokeWidth="1.5" />
      <circle cx="130" cy="132" r="12" fill="#F3F4F6" />
      <text x="130" y="136" fontSize="9" fontWeight="700" fill="#6B7280" textAnchor="middle">AB</text>
      <text x="150" y="130" fontSize="9" fontWeight="600" fill="#111827">Awa Ba</text>
      <text x="150" y="142" fontSize="8" fill="#9CA3AF">Robe Wax × 2</text>
      <rect x="120" y="155" width="50" height="16" rx="8" fill="#111827" />
      <text x="145" y="166" fontSize="7" fontWeight="600" fill="white" textAnchor="middle">En attente</text>
      <text x="230" y="166" fontSize="9" fontWeight="700" fill="#111827">24 000 F</text>

      {/* Order card 2 */}
      <rect x="110" y="190" width="140" height="58" rx="12" fill="#F9FAFB" />
      <circle cx="130" cy="212" r="12" fill="#F3F4F6" />
      <text x="130" y="216" fontSize="9" fontWeight="700" fill="#6B7280" textAnchor="middle">MD</text>
      <text x="150" y="210" fontSize="9" fontWeight="600" fill="#111827">Moussa D.</text>
      <text x="150" y="222" fontSize="8" fill="#9CA3AF">Sac cuir × 1</text>

      {/* Order card 3 */}
      <rect x="110" y="258" width="140" height="50" rx="12" fill="#F9FAFB" />
      <circle cx="130" cy="278" r="12" fill="#F3F4F6" />
      <text x="130" y="282" fontSize="9" fontWeight="700" fill="#6B7280" textAnchor="middle">FS</text>
      <text x="150" y="276" fontSize="9" fontWeight="600" fill="#111827">Fatou S.</text>
      <text x="150" y="288" fontSize="8" fill="#9CA3AF">Collier × 3</text>

      {/* Notification badge */}
      <circle cx="250" cy="50" r="12" fill="#EF4444" />
      <text x="250" y="54" fontSize="10" fontWeight="700" fill="white" textAnchor="middle">3</text>
    </svg>
  </div>
);

const ShareVisual = () => (
  <div className="relative w-[280px] h-[280px] lg:w-[360px] lg:h-[360px]">
    <svg viewBox="0 0 360 360" fill="none" className="w-full h-full">
      {/* Center link card */}
      <rect x="70" y="120" width="220" height="70" rx="16" fill="white" stroke="#E5E7EB" strokeWidth="1.5" />
      <rect x="86" y="136" width="38" height="38" rx="10" fill="#111827" />
      {/* Store icon */}
      <path d="M97 150 L105 150 L113 150" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M99 150 L99 160 L111 160 L111 150" stroke="white" strokeWidth="1.5" />
      <path d="M97 147 L105 142 L113 147" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="136" y="151" fontSize="8" fill="#9CA3AF">Votre boutique</text>
      <text x="136" y="165" fontSize="10" fontWeight="600" fill="#111827">livelink.store/votre-id</text>

      {/* WhatsApp bubble - top left */}
      <rect x="40" y="40" width="130" height="56" rx="14" fill="#25D366" opacity="0.1" />
      <rect x="40" y="40" width="130" height="56" rx="14" stroke="#25D366" strokeWidth="1" opacity="0.3" />
      <circle cx="64" cy="68" r="14" fill="#25D366" opacity="0.15" />
      {/* WhatsApp icon simplified */}
      <circle cx="64" cy="68" r="8" stroke="#25D366" strokeWidth="1.5" fill="none" />
      <path d="M60 72 L60 74 L62 72" stroke="#25D366" strokeWidth="1" strokeLinecap="round" />
      <text x="84" y="64" fontSize="9" fontWeight="600" fill="#25D366">WhatsApp</text>
      <text x="84" y="76" fontSize="7" fill="#6B7280">Envoyez à vos contacts</text>

      {/* Facebook bubble - top right */}
      <rect x="190" y="50" width="130" height="50" rx="14" fill="#1877F2" opacity="0.1" />
      <rect x="190" y="50" width="130" height="50" rx="14" stroke="#1877F2" strokeWidth="1" opacity="0.3" />
      <circle cx="214" cy="75" r="14" fill="#1877F2" opacity="0.15" />
      <text x="214" y="79" fontSize="11" fontWeight="700" fill="#1877F2" textAnchor="middle">f</text>
      <text x="234" y="72" fontSize="9" fontWeight="600" fill="#1877F2">Facebook</text>
      <text x="234" y="84" fontSize="7" fill="#6B7280">Partagez sur votre page</text>

      {/* Copy link button */}
      <rect x="100" y="210" width="160" height="44" rx="12" fill="#F9FAFB" />
      {/* Copy icon */}
      <rect x="120" y="224" width="12" height="14" rx="2" stroke="#6B7280" strokeWidth="1.5" fill="none" />
      <rect x="124" y="220" width="12" height="14" rx="2" stroke="#6B7280" strokeWidth="1.5" fill="white" />
      <text x="144" y="236" fontSize="9" fontWeight="600" fill="#374151">Copier le lien</text>

      {/* Connection lines */}
      <line x1="105" y1="110" x2="105" y2="120" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="255" y1="100" x2="255" y2="120" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="180" y1="190" x2="180" y2="210" stroke="#E5E7EB" strokeWidth="1" strokeDasharray="3 3" />

      {/* Decorative dots */}
      <circle cx="50" cy="200" r="3" fill="#E5E7EB" />
      <circle cx="310" cy="140" r="3" fill="#E5E7EB" />
      <circle cx="300" cy="230" r="4" fill="#F3F4F6" />
      <circle cx="60" cy="130" r="4" fill="#F3F4F6" />

      {/* Client phone - bottom */}
      <rect x="130" y="270" width="100" height="70" rx="12" fill="white" stroke="#E5E7EB" strokeWidth="1" />
      <text x="180" y="295" fontSize="8" fontWeight="600" fill="#111827" textAnchor="middle">Votre client</text>
      <text x="180" y="308" fontSize="7" fill="#9CA3AF" textAnchor="middle">commande en 1 clic</text>
      {/* Arrow from link to client */}
      <path d="M180 254 L180 270" stroke="#111827" strokeWidth="1.5" markerEnd="url(#arrowhead)" />
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
          <path d="M0 0 L6 3 L0 6 Z" fill="#111827" />
        </marker>
      </defs>
    </svg>
  </div>
);

const slides = [
  {
    icon: Package,
    title: 'Ajoutez vos produits',
    description: 'Publiez vos articles avec photos, prix et variantes. Votre catalogue est prêt en quelques minutes.',
    visual: <ProductsVisual />,
    bg: 'bg-amber-50/50',
  },
  {
    icon: ShoppingBag,
    title: 'Recevez des commandes',
    description: 'Vos clients commandent depuis leur téléphone. Vous êtes notifié en temps réel à chaque vente.',
    visual: <OrdersVisual />,
    bg: 'bg-blue-50/50',
  },
  {
    icon: Share2,
    title: 'Partagez votre boutique',
    description: 'Un lien unique à envoyer sur WhatsApp, Facebook ou partout. Vos clients commandent directement.',
    visual: <ShareVisual />,
    bg: 'bg-green-50/50',
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
      {/* Desktop left panel — illustration */}
      <div className={`hidden lg:flex lg:w-1/2 items-center justify-center p-12 transition-colors duration-500 ${slide.bg}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            {slide.visual}
          </motion.div>
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
          {/* Visual (mobile only) */}
          <div className={`lg:hidden mb-8 w-full flex justify-center rounded-3xl py-6 transition-colors duration-500 ${slide.bg}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.35 }}
                className="flex justify-center"
              >
                {slide.visual}
              </motion.div>
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
