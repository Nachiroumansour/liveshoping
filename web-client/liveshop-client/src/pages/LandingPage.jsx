import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, useMotionValue, useSpring } from 'framer-motion';
import SEO from '../components/SEO';
import {
  Package,
  ShoppingBag,
  Users,
  TrendingUp,
  BarChart3,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Check,
  Menu,
  X,
  Radio,
  CreditCard,
  Globe,
} from 'lucide-react';

// ═══════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════
const BG = '#070A12';
const LIME = '#C8FF6B';

// ═══════════════════════════════════════════════════
// ANIMATED COUNTER
// ═══════════════════════════════════════════════════
function Counter({ target, suffix = '', duration = 2 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const motionVal = useMotionValue(0);
  const spring = useSpring(motionVal, { duration: duration * 1000, bounce: 0 });
  const [display, setDisplay] = useState('0');

  useEffect(() => {
    if (inView) motionVal.set(target);
  }, [inView, target, motionVal]);

  useEffect(() => {
    const unsub = spring.on('change', (v) => {
      setDisplay(Math.round(v).toLocaleString('fr-FR'));
    });
    return unsub;
  }, [spring]);

  return <span ref={ref}>{display}{suffix}</span>;
}

// ═══════════════════════════════════════════════════
// REVEAL WRAPPER
// ═══════════════════════════════════════════════════
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════
const FEATURES = [
  { icon: Package, title: 'Catalogue', desc: 'Ajoutez vos produits avec photos, prix et variantes en quelques taps.' },
  { icon: ShoppingBag, title: 'Commandes', desc: 'Notification instantanée, suivi en temps réel, rien ne vous échappe.' },
  { icon: Users, title: 'Clients', desc: 'Historique d\'achats, contacts, votre base client vous appartient.' },
  { icon: Radio, title: 'Ventes Live', desc: 'Vendez en direct pendant vos sessions Facebook, TikTok ou Instagram.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Chiffres de vente, produits populaires, tendances claires.' },
  { icon: Zap, title: 'WhatsApp', desc: 'Notifications automatiques à vos acheteurs via WhatsApp.' },
];

const STEPS = [
  { n: '01', title: 'Créez votre compte', desc: 'Votre numéro WhatsApp suffit. Inscription en 2 minutes.' },
  { n: '02', title: 'Ajoutez vos produits', desc: 'Photo, prix, description. Publiez en un seul tap.' },
  { n: '03', title: 'Partagez et vendez', desc: 'Un lien unique pour votre boutique. Envoyez-le partout.' },
];

const PLANS = [
  {
    name: 'Découverte',
    price: '0',
    unit: 'FCFA',
    credits: '5 crédits offerts',
    items: ['10 produits max', 'Commandes illimitées', 'Support communauté', 'Analytics de base'],
    highlighted: false,
  },
  {
    name: 'Vendeur',
    price: '20 000',
    unit: 'FCFA',
    credits: '100 crédits',
    items: ['Produits illimités', 'Sessions live', 'Support prioritaire', 'Analytics avancés'],
    highlighted: true,
  },
  {
    name: 'Business',
    price: '50 000',
    unit: 'FCFA',
    credits: '300 crédits',
    items: ['Tout Vendeur inclus', 'Multi-utilisateurs', 'Accès API', 'Support dédié 24/7'],
    highlighted: false,
  },
];

// ═══════════════════════════════════════════════════
// LANDING PAGE
// ═══════════════════════════════════════════════════
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();

  // Parallax layers
  const glow1Y = useTransform(scrollYProgress, [0, 0.5], [0, -200]);
  const glow2Y = useTransform(scrollYProgress, [0, 0.5], [0, 150]);
  const gridY = useTransform(scrollYProgress, [0, 1], [0, 60]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const goStart = () => { window.location.href = 'https://space.livelink.store'; };

  const navLinks = [
    { label: 'Fonctionnalités', href: '#features' },
    { label: 'Comment ça marche', href: '#process' },
    { label: 'Tarifs', href: '#pricing' },
  ];

  return (
    <>
      <SEO
        title="LiveLink — Vendez en direct"
        description="La plateforme e-commerce pour vendeurs en Afrique de l'Ouest. Créez votre boutique, vendez en direct, gérez vos commandes."
      />

      {/* ═══ FIXED BACKGROUND LAYERS ═══ */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -2, background: BG }}>
        {/* Subtle grid pattern */}
        <motion.div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            y: gridY,
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />

        {/* Glow 1 — lime, top-left */}
        <motion.div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{
            y: glow1Y,
            background: `radial-gradient(circle, rgba(200,255,107,0.05) 0%, transparent 65%)`,
          }}
        />

        {/* Glow 2 — cool blue, bottom-right */}
        <motion.div
          className="absolute -bottom-60 -right-40 w-[600px] h-[600px] rounded-full"
          style={{
            y: glow2Y,
            background: `radial-gradient(circle, rgba(80,120,255,0.035) 0%, transparent 65%)`,
          }}
        />

        {/* Grain noise */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat',
            backgroundSize: '200px 200px',
          }}
        />
      </div>

      {/* ═══ CONTENT ═══ */}
      <div ref={containerRef} className="relative" style={{ zIndex: 1 }}>

        {/* ──── NAVBAR ──── */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? 'bg-[#070A12]/70 backdrop-blur-2xl border-b border-white/[0.05] shadow-lg shadow-black/20'
              : ''
          }`}
        >
          <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-10 h-[68px]">
            {/* Logo */}
            <a href="/" className="flex items-center gap-1.5 group select-none">
              <span className="text-white font-black text-xl tracking-tight">Live</span>
              <span className="text-white/50 font-extralight text-xl tracking-tight">Link</span>
              <span className="w-2 h-2 rounded-full bg-[#C8FF6B] ml-0.5 group-hover:scale-[1.8] transition-transform duration-300" />
            </a>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="text-white/35 hover:text-white text-[13px] tracking-wide transition-colors duration-300 relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-[#C8FF6B]/50 hover:after:w-full after:transition-all after:duration-300"
                >
                  {l.label}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <button
              onClick={goStart}
              className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-white text-[#070A12] text-[13px] font-bold rounded-full hover:bg-[#C8FF6B] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300"
            >
              Commencer
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile burger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/60 p-1">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile drawer */}
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-[#070A12]/95 backdrop-blur-2xl border-t border-white/[0.05] px-6 pb-6 pt-4"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-white/50 hover:text-white text-sm transition-colors">
                    {l.label}
                  </a>
                ))}
                <button onClick={goStart} className="mt-2 px-5 py-3 bg-white text-[#070A12] text-sm font-bold rounded-full w-full">
                  Commencer
                </button>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* ──── HERO (SPLIT-SCREEN) ──── */}
        <section className="min-h-screen pt-28 md:pt-0 md:flex md:items-center px-6 lg:px-10 overflow-hidden">
          <div className="max-w-7xl mx-auto w-full md:grid md:grid-cols-5 md:gap-12 lg:gap-20 items-center md:min-h-screen md:py-32">

            {/* LEFT — Text (3/5) */}
            <div className="md:col-span-3">
              {/* Live badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full border border-white/[0.07] bg-white/[0.02] mb-8"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF6B] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8FF6B]" />
                </span>
                <span className="text-white/40 text-[11px] tracking-[0.15em] uppercase font-medium">Plateforme live commerce</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="text-white font-black tracking-[-0.04em] leading-[0.92] mb-7"
                style={{ fontSize: 'clamp(3rem, 7.5vw, 5.5rem)' }}
              >
                Votre boutique<span className="text-[#C8FF6B]">.</span>
                <br />
                Vos clients<span className="text-[#C8FF6B]">.</span>
                <br />
                En direct<span className="text-[#C8FF6B]">.</span>
              </motion.h1>

              {/* Subtext */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="text-white/30 text-base md:text-lg leading-relaxed max-w-md mb-10"
              >
                Créez votre boutique en ligne en 2 minutes. Partagez un lien, recevez des commandes, vendez en live.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <button
                  onClick={goStart}
                  className="group inline-flex items-center gap-3 px-8 py-4 bg-white text-[#070A12] font-bold text-sm rounded-full hover:bg-[#C8FF6B] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_0_60px_rgba(200,255,107,0.08)]"
                >
                  Créer ma boutique
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                </button>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-6 py-4 text-white/40 hover:text-white text-sm font-medium transition-colors duration-300"
                >
                  En savoir plus
                </a>
              </motion.div>

              {/* Micro stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex gap-10 md:gap-14"
              >
                {[
                  { val: 500, suffix: '+', label: 'vendeurs actifs' },
                  { val: 98, suffix: '%', label: 'satisfaction' },
                  { val: 48, suffix: 'h', label: 'pour démarrer' },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-white font-black text-2xl md:text-3xl tracking-tight">
                      <Counter target={s.val} suffix={s.suffix} />
                    </div>
                    <div className="text-white/20 text-[11px] mt-1 tracking-wide">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — Floating cards (2/5) */}
            <div className="md:col-span-2 relative mt-16 md:mt-0" style={{ minHeight: 420 }}>
              {/* Background glow for cards */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle, rgba(200,255,107,0.06) 0%, transparent 70%)` }}
              />

              {/* Card: Order notification */}
              <motion.div
                initial={{ opacity: 0, x: 40, y: 30 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 0.9 }}
                className="absolute top-0 left-0 md:-left-6 z-10"
              >
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 shadow-2xl shadow-black/30" style={{ width: 220 }}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-white text-xs font-semibold">Nouvelle commande</div>
                        <div className="text-white/25 text-[10px]">il y a 2 min</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/35 text-[11px]">Fatou D.</span>
                      <span className="text-[#C8FF6B] text-sm font-bold">15 000 F</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Card: Analytics */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: -20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.05 }}
                className="absolute top-4 right-0 md:-right-4 z-10"
              >
                <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}>
                  <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl p-5 shadow-2xl shadow-black/30" style={{ width: 200 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-4 h-4 text-white/30" />
                      <span className="text-white/40 text-[10px] font-medium">Ventes du jour</span>
                    </div>
                    <div className="text-white font-black text-2xl mb-3">
                      47 500 <span className="text-xs font-normal text-white/20">F</span>
                    </div>
                    <div className="flex items-end gap-[3px] h-8">
                      {[35, 50, 40, 70, 55, 85, 65, 90, 75].map((h, j) => (
                        <div
                          key={j}
                          className="flex-1 rounded-sm"
                          style={{
                            height: `${h}%`,
                            background: h > 70 ? 'rgba(200,255,107,0.35)' : 'rgba(200,255,107,0.15)',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Card: Live indicator */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.2 }}
                className="absolute bottom-16 left-4 md:left-0 z-10"
              >
                <motion.div animate={{ y: [0, 6, 0] }} transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}>
                  <div className="rounded-xl border border-red-500/20 bg-white/[0.03] backdrop-blur-xl px-5 py-3.5 shadow-2xl shadow-black/30 flex items-center gap-3">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                    </span>
                    <div>
                      <div className="text-white text-[11px] font-bold tracking-wide">EN DIRECT</div>
                      <div className="text-white/25 text-[9px]">24 spectateurs</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Card: WhatsApp connected */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 1.35 }}
                className="absolute bottom-4 right-4 md:right-0 z-10"
              >
                <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}>
                  <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-xl px-5 py-3.5 shadow-2xl shadow-black/30 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white text-[10px] font-semibold">WhatsApp</div>
                      <div className="text-emerald-400/50 text-[9px]">Connecté</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Ambient dots */}
              {[
                { top: '20%', left: '45%', size: 3 },
                { top: '55%', left: '30%', size: 2 },
                { top: '75%', right: '40%', size: 2.5 },
              ].map((d, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-[#C8FF6B]/25 pointer-events-none"
                  style={{ width: d.size, height: d.size, top: d.top, left: d.left, right: d.right }}
                  animate={{ opacity: [0.2, 0.7, 0.2], scale: [1, 1.6, 1] }}
                  transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.7, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ──── FEATURES ──── */}
        <section id="features" className="py-28 md:py-36 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-4 mb-16">
                <span className="text-[#C8FF6B] font-mono text-sm tracking-widest">01</span>
                <div className="w-12 h-px bg-white/15" />
                <span className="text-white/30 text-xs tracking-[0.2em] uppercase">Fonctionnalités</span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h2
                className="text-white font-black tracking-[-0.03em] leading-[1.02] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}
              >
                Tout ce qu'il faut<span className="text-[#C8FF6B]">.</span>
                <br />
                <span className="text-white/25">Rien de superflu.</span>
              </h2>
              <p className="text-white/25 text-sm md:text-base max-w-lg mb-20 leading-relaxed">
                Chaque outil est pensé pour les vendeurs qui vendent via les réseaux sociaux en Afrique de l'Ouest.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={i} delay={i * 0.06}>
                    <div className="group relative p-6 md:p-7 rounded-2xl border border-white/[0.05] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 cursor-default h-full">
                      <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[#C8FF6B]/[0.08] flex items-center justify-center flex-shrink-0 group-hover:bg-[#C8FF6B]/[0.15] transition-colors duration-500">
                          <Icon className="w-5 h-5 text-[#C8FF6B]/70 group-hover:text-[#C8FF6B] transition-colors duration-500" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-[15px] mb-2">{f.title}</h3>
                          <p className="text-white/25 text-[13px] leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ──── HOW IT WORKS ──── */}
        <section id="process" className="py-28 md:py-36 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-4 mb-16">
                <span className="text-[#C8FF6B] font-mono text-sm tracking-widest">02</span>
                <div className="w-12 h-px bg-white/15" />
                <span className="text-white/30 text-xs tracking-[0.2em] uppercase">Comment ça marche</span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h2
                className="text-white font-black tracking-[-0.03em] leading-[1.02] mb-24"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}
              >
                Trois étapes<span className="text-[#C8FF6B]">.</span>
                <br />
                <span className="text-white/25">C'est tout.</span>
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-10 md:gap-8 relative">
              {/* Connecting line — desktop */}
              <div className="hidden md:block absolute top-7 left-[16.67%] right-[16.67%]">
                <motion.div
                  className="h-px bg-gradient-to-r from-[#C8FF6B]/20 via-[#C8FF6B]/10 to-[#C8FF6B]/20"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  style={{ transformOrigin: 'left' }}
                />
              </div>

              {STEPS.map((step, i) => (
                <Reveal key={i} delay={i * 0.18}>
                  <div className="relative">
                    {/* Number */}
                    <div className="w-14 h-14 rounded-full border border-[#C8FF6B]/20 flex items-center justify-center mb-7 bg-[#070A12] relative z-10">
                      <span className="text-[#C8FF6B]/60 font-mono text-sm font-bold">{step.n}</span>
                    </div>
                    <h3 className="text-white font-bold text-lg mb-3">{step.title}</h3>
                    <p className="text-white/25 text-[13px] leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──── PRICING ──── */}
        <section id="pricing" className="py-28 md:py-36 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="flex items-center gap-4 mb-16">
                <span className="text-[#C8FF6B] font-mono text-sm tracking-widest">03</span>
                <div className="w-12 h-px bg-white/15" />
                <span className="text-white/30 text-xs tracking-[0.2em] uppercase">Tarifs</span>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <h2
                className="text-white font-black tracking-[-0.03em] leading-[1.02] mb-5"
                style={{ fontSize: 'clamp(2.2rem, 4.5vw, 3.5rem)' }}
              >
                Simple et transparent<span className="text-[#C8FF6B]">.</span>
              </h2>
              <p className="text-white/25 text-sm md:text-base max-w-md mb-20 leading-relaxed">
                Pas d'abonnement. Achetez des crédits quand vous en avez besoin.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-5 items-start">
              {PLANS.map((plan, i) => (
                <Reveal key={i} delay={i * 0.1}>
                  <motion.div
                    whileInView={{ scale: 1 }}
                    initial={{ scale: 0.96 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className={`relative p-8 rounded-2xl transition-all duration-500 flex flex-col ${
                      plan.highlighted
                        ? 'bg-white/[0.04] border border-[#C8FF6B]/25 hover:border-[#C8FF6B]/40 md:-translate-y-4'
                        : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#C8FF6B] text-[#070A12] text-[10px] font-bold tracking-wider uppercase rounded-full whitespace-nowrap">
                        Populaire
                      </div>
                    )}

                    <div className="mb-8">
                      <h3 className="text-white font-semibold text-base mb-1">{plan.name}</h3>
                      <p className="text-white/20 text-xs">{plan.credits}</p>
                    </div>

                    <div className="mb-8">
                      <span className="text-white font-black text-4xl tracking-tight">{plan.price}</span>
                      <span className="text-white/25 text-sm ml-2 font-medium">{plan.unit}</span>
                    </div>

                    <button
                      onClick={goStart}
                      className={`w-full py-3.5 text-[13px] font-bold rounded-xl transition-all duration-300 mb-8 ${
                        plan.highlighted
                          ? 'bg-white text-[#070A12] hover:bg-[#C8FF6B] hover:scale-[1.02] active:scale-[0.98]'
                          : 'border border-white/[0.08] text-white/60 hover:text-white hover:border-white/[0.15]'
                      }`}
                    >
                      {plan.price === '0' ? 'Commencer gratuitement' : 'Choisir ce plan'}
                    </button>

                    <div className="space-y-3.5 mt-auto">
                      {plan.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-3">
                          <Check className="w-4 h-4 text-[#C8FF6B]/50 flex-shrink-0" />
                          <span className="text-white/35 text-[13px]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ──── FINAL CTA ──── */}
        <section className="py-28 md:py-36 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <Reveal>
              <div className="text-center max-w-2xl mx-auto">
                <h2
                  className="text-white font-black tracking-[-0.03em] leading-[1.02] mb-6"
                  style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}
                >
                  Prêt à vendre<span className="text-[#C8FF6B]">?</span>
                </h2>
                <p className="text-white/25 text-sm md:text-base max-w-md mx-auto mb-10 leading-relaxed">
                  Rejoignez les centaines de vendeurs qui ont déjà choisi LiveLink pour développer leur activité.
                </p>
                <button
                  onClick={goStart}
                  className="group inline-flex items-center gap-3 px-10 py-4.5 bg-white text-[#070A12] font-bold text-sm rounded-full hover:bg-[#C8FF6B] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_0_80px_rgba(200,255,107,0.06)]"
                >
                  Créer ma boutique gratuitement
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ──── FOOTER ──── */}
        <footer className="border-t border-white/[0.04] py-14 px-6 lg:px-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-10">
              {/* Brand */}
              <div className="max-w-xs">
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="text-white font-black text-lg">Live</span>
                  <span className="text-white/40 font-extralight text-lg">Link</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF6B] ml-0.5" />
                </div>
                <p className="text-white/20 text-xs leading-relaxed">
                  La plateforme de vente en direct pour les entrepreneurs en Afrique de l'Ouest.
                </p>
              </div>

              {/* Links */}
              <div className="flex gap-16">
                <div>
                  <h4 className="text-white/40 text-[11px] tracking-[0.15em] uppercase font-medium mb-5">Produit</h4>
                  <ul className="space-y-3">
                    {[
                      { label: 'Fonctionnalités', href: '#features' },
                      { label: 'Tarifs', href: '#pricing' },
                      { label: 'Sécurité', href: '#' },
                    ].map((l) => (
                      <li key={l.label}>
                        <a href={l.href} className="text-white/20 hover:text-white/50 text-[13px] transition-colors duration-300">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-white/40 text-[11px] tracking-[0.15em] uppercase font-medium mb-5">Légal</h4>
                  <ul className="space-y-3">
                    {['Conditions', 'Confidentialité', 'Contact'].map((l) => (
                      <li key={l}>
                        <a href="#" className="text-white/20 hover:text-white/50 text-[13px] transition-colors duration-300">
                          {l}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom */}
            <div className="mt-14 pt-7 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/12 text-[11px]">
                &copy; {new Date().getFullYear()} LiveLink. Tous droits réservés.
              </p>
              <p className="text-white/12 text-[11px]">
                Dakar, Sénégal
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
