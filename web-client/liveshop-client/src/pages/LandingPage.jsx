import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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
} from 'lucide-react';

// ─── Noise texture SVG (inlined for zero latency) ───
const GRAIN_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

// ─── Reusable scroll-reveal wrapper ───
function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Section label ───
function SectionLabel({ number, text }) {
  return (
    <div className="flex items-center gap-3 mb-12 md:mb-16">
      <span className="text-[#C8FF6B] font-mono text-sm tracking-widest">{number}</span>
      <div className="w-12 h-px bg-white/20" />
      <span className="text-white/40 text-xs tracking-[0.2em] uppercase">{text}</span>
    </div>
  );
}

// ─── Data ───
const FEATURES = [
  { icon: Package, title: 'Produits', desc: 'Ajoutez et organisez votre catalogue en quelques secondes.' },
  { icon: ShoppingBag, title: 'Commandes', desc: 'Notifications instantanées, suivi en temps réel.' },
  { icon: Users, title: 'Clients', desc: 'Votre communauté, vos données, votre relation directe.' },
  { icon: TrendingUp, title: 'Live', desc: 'Vendez en direct pendant vos sessions Facebook ou TikTok.' },
  { icon: BarChart3, title: 'Analytics', desc: 'Comprenez ce qui fonctionne avec des chiffres clairs.' },
  { icon: Zap, title: 'WhatsApp', desc: 'Intégration native pour communiquer avec vos acheteurs.' },
];

const STEPS = [
  { title: 'Créez votre compte', desc: 'Votre numéro WhatsApp suffit. 2 minutes, pas plus.' },
  { title: 'Ajoutez vos produits', desc: 'Photo, prix, description. Publiez en un tap.' },
  { title: 'Partagez et vendez', desc: 'Un lien unique. Envoyez-le partout, les commandes arrivent.' },
];

const PLANS = [
  {
    name: 'Découverte',
    price: 'Gratuit',
    credits: '5 crédits',
    items: ['Jusqu\'à 10 produits', 'Commandes illimitées', 'Support communauté', 'Analytics de base'],
    highlighted: false,
  },
  {
    name: 'Vendeur',
    price: '20 000 FCFA',
    credits: '100 crédits',
    items: ['Produits illimités', 'Sessions live', 'Support prioritaire', 'Analytics avancés'],
    highlighted: true,
  },
  {
    name: 'Business',
    price: '50 000 FCFA',
    credits: '300 crédits',
    items: ['Tout Vendeur +', 'Multi-utilisateurs', 'API access', 'Support dédié 24/7'],
    highlighted: false,
  },
];

// ─────────────────────────────────────────────
export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();

  // Parallax transforms
  const heroGlowY = useTransform(scrollYProgress, [0, 0.3], [0, -120]);
  const heroGlowScale = useTransform(scrollYProgress, [0, 0.3], [1, 1.4]);
  const grain2Y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
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

      {/* ─── Fixed background ─── */}
      <div className="fixed inset-0 bg-[#060910] pointer-events-none" style={{ zIndex: -2 }}>
        {/* Grain overlay */}
        <div className="absolute inset-0" style={{ backgroundImage: GRAIN_SVG, backgroundRepeat: 'repeat', backgroundSize: '256px 256px' }} />

        {/* Slow parallax glow — top-left warm */}
        <motion.div
          className="absolute -top-32 -left-48 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(200,255,107,0.06) 0%, transparent 70%)',
            y: heroGlowY,
            scale: heroGlowScale,
          }}
        />

        {/* Secondary glow — bottom-right cold */}
        <motion.div
          className="absolute -bottom-48 -right-32 w-[500px] h-[500px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(100,140,255,0.04) 0%, transparent 70%)',
            y: grain2Y,
          }}
        />
      </div>

      {/* ─── Content ─── */}
      <div className="relative" style={{ zIndex: 1 }}>

        {/* ━━━ Navbar ━━━ */}
        <motion.header
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            scrolled
              ? 'bg-[#060910]/80 backdrop-blur-2xl border-b border-white/[0.04]'
              : ''
          }`}
        >
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 md:px-8 h-16">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2 group">
              <span className="text-white font-black text-lg tracking-tight">Live</span>
              <span className="text-white/60 font-light text-lg tracking-tight">Link</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF6B] mt-0.5 group-hover:scale-150 transition-transform" />
            </a>

            {/* Desktop links */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(l => (
                <a key={l.href} href={l.href} className="text-white/40 hover:text-white text-[13px] tracking-wide transition-colors duration-300">{l.label}</a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <button
              onClick={goStart}
              className="hidden md:flex items-center gap-2 px-5 py-2 bg-white text-[#060910] text-[13px] font-semibold rounded-full hover:bg-[#C8FF6B] transition-colors duration-300"
            >
              Commencer
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile burger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-white/70">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Mobile drawer */}
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="md:hidden bg-[#060910]/95 backdrop-blur-2xl border-t border-white/[0.04] px-6 pb-6 pt-4"
            >
              <div className="flex flex-col gap-4">
                {navLinks.map(l => (
                  <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white text-sm transition-colors">{l.label}</a>
                ))}
                <button onClick={goStart} className="mt-2 px-5 py-2.5 bg-white text-[#060910] text-sm font-semibold rounded-full w-full">
                  Commencer
                </button>
              </div>
            </motion.div>
          )}
        </motion.header>

        {/* ━━━ Hero ━━━ */}
        <section className="min-h-screen pt-28 md:pt-36 pb-16 px-6 md:px-8 overflow-hidden">
          <div className="max-w-5xl mx-auto w-full">

            {/* ── Centered text block ── */}
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge pill */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF6B] animate-pulse" />
                <span className="text-white/50 text-[11px] tracking-[0.15em] uppercase font-medium">Plateforme e-commerce live</span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-white font-black leading-[0.95] tracking-[-0.035em] mb-6"
                style={{ fontSize: 'clamp(2.8rem, 7vw, 5rem)' }}
              >
                Vendez en direct<span className="text-[#C8FF6B]">,</span><br />
                gérez mieux<span className="text-[#C8FF6B]">,</span><br />
                gagnez plus<span className="text-[#C8FF6B]">.</span>
              </motion.h1>

              {/* Description */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="text-white/35 text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-10"
              >
                Votre boutique en ligne en 2 minutes. Partagez votre lien, recevez des commandes en temps réel et vendez en live.
              </motion.p>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.55 }}
                className="flex justify-center gap-4 mb-8"
              >
                <button
                  onClick={goStart}
                  className="group inline-flex items-center gap-2.5 px-8 py-3.5 bg-white text-[#060910] font-bold text-sm rounded-full hover:bg-[#C8FF6B] transition-all duration-300 shadow-[0_0_40px_rgba(200,255,107,0.08)]"
                >
                  Créer ma boutique
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </motion.div>

              {/* Micro stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex justify-center gap-8 md:gap-12"
              >
                {[
                  { val: '500+', label: 'vendeurs' },
                  { val: '48h', label: 'pour démarrer' },
                  { val: '0 FCFA', label: 'pour commencer' },
                ].map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="text-white font-black text-lg md:text-xl">{s.val}</div>
                    <div className="text-white/20 text-[11px] mt-0.5">{s.label}</div>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Floating composition below ── */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative mt-16 md:mt-24 mx-auto"
              style={{ maxWidth: 800, height: 'clamp(340px, 50vw, 480px)' }}
            >
              {/* Central glow */}
              <div
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl pointer-events-none"
                style={{
                  width: 400,
                  height: 400,
                  background: 'radial-gradient(circle, rgba(200,255,107,0.07) 0%, transparent 70%)',
                }}
              />

              {/* Phone mockup — center */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.85 }}
                className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10"
                style={{ width: 'clamp(180px, 24vw, 240px)' }}
              >
                <div className="rounded-[28px] border border-white/[0.1] bg-[#0d1117] overflow-hidden shadow-2xl shadow-black/60">
                  {/* Phone status bar */}
                  <div className="flex items-center justify-between px-5 pt-3 pb-2">
                    <span className="text-white/40 text-[9px] font-medium">9:41</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-1.5 rounded-sm bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                    </div>
                  </div>
                  {/* Phone screen content */}
                  <div className="px-4 pb-5">
                    {/* Mini app header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-lg bg-[#C8FF6B]/20 flex items-center justify-center">
                        <Package className="w-3.5 h-3.5 text-[#C8FF6B]" />
                      </div>
                      <div>
                        <div className="text-white text-[10px] font-bold">Ma Boutique</div>
                        <div className="text-white/30 text-[8px]">3 produits actifs</div>
                      </div>
                    </div>
                    {/* Mini product cards */}
                    {[
                      { name: 'Robe Wax', price: '15 000 F' },
                      { name: 'Sac Cuir', price: '25 000 F' },
                      { name: 'Bijoux Set', price: '8 000 F' },
                    ].map((p, i) => (
                      <div key={i} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-white text-[9px] font-medium truncate">{p.name}</div>
                          <div className="text-[#C8FF6B]/60 text-[8px]">{p.price}</div>
                        </div>
                      </div>
                    ))}
                    {/* Mini CTA */}
                    <div className="mt-3 py-2 bg-white/[0.06] rounded-lg text-center">
                      <span className="text-white/50 text-[8px] font-medium">Partager ma boutique</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — Order notification (top-left) */}
              <motion.div
                initial={{ opacity: 0, x: -30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.0 }}
                className="absolute z-20 hidden md:block"
                style={{ left: '2%', top: '8%' }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 shadow-xl shadow-black/20" style={{ width: 200 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-green-500/20 flex items-center justify-center">
                        <ShoppingBag className="w-3.5 h-3.5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white text-[10px] font-semibold">Nouvelle commande</div>
                        <div className="text-white/30 text-[8px]">il y a 2 min</div>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-white/40 text-[9px]">Fatou D.</span>
                        <span className="text-[#C8FF6B] text-[9px] font-bold">15 000 F</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                        <div className="h-full w-3/4 bg-green-500/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating card — Analytics (top-right) */}
              <motion.div
                initial={{ opacity: 0, x: 30, y: 20 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.15 }}
                className="absolute z-20 hidden md:block"
                style={{ right: '2%', top: '4%' }}
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl p-4 shadow-xl shadow-black/20" style={{ width: 190 }}>
                    <div className="flex items-center gap-2 mb-3">
                      <BarChart3 className="w-3.5 h-3.5 text-white/40" />
                      <span className="text-white/50 text-[9px] font-medium">Ventes du jour</span>
                    </div>
                    <div className="text-white font-black text-xl mb-2">47 500 <span className="text-[10px] font-normal text-white/30">F</span></div>
                    <div className="flex items-end gap-1 h-10">
                      {[30, 55, 40, 75, 60, 85, 70].map((h, j) => (
                        <div key={j} className="flex-1 rounded-sm bg-[#C8FF6B]/20" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating card — WhatsApp integration (bottom-left) */}
              <motion.div
                initial={{ opacity: 0, x: -20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.3 }}
                className="absolute z-20 hidden md:block"
                style={{ left: '6%', bottom: '12%' }}
              >
                <motion.div
                  animate={{ y: [0, 5, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/20 flex items-center gap-3" style={{ width: 180 }}>
                    <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center flex-shrink-0">
                      <Zap className="w-3.5 h-3.5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white text-[9px] font-semibold">WhatsApp</div>
                      <div className="text-green-400/60 text-[8px]">Connecté</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Floating card — Live badge (bottom-right) */}
              <motion.div
                initial={{ opacity: 0, x: 20, y: -10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ duration: 0.7, delay: 1.4 }}
                className="absolute z-20 hidden md:block"
                style={{ right: '8%', bottom: '18%' }}
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                >
                  <div className="rounded-xl border border-red-500/20 bg-white/[0.03] backdrop-blur-xl px-4 py-3 shadow-xl shadow-black/20 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <div>
                      <div className="text-white text-[10px] font-bold">EN DIRECT</div>
                      <div className="text-white/30 text-[8px]">12 spectateurs</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Sparkle dots decoration */}
              {[
                { top: '15%', left: '18%', size: 3, delay: 0 },
                { top: '70%', right: '15%', size: 2, delay: 1.5 },
                { top: '25%', right: '25%', size: 2.5, delay: 0.8 },
                { bottom: '20%', left: '25%', size: 2, delay: 2 },
                { top: '50%', left: '8%', size: 1.5, delay: 1.2 },
                { top: '40%', right: '5%', size: 2, delay: 0.5 },
              ].map((dot, i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full bg-[#C8FF6B]/30 pointer-events-none hidden md:block"
                  style={{
                    width: dot.size,
                    height: dot.size,
                    top: dot.top,
                    left: dot.left,
                    right: dot.right,
                    bottom: dot.bottom,
                  }}
                  animate={{ opacity: [0.2, 0.8, 0.2], scale: [1, 1.5, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: dot.delay, ease: 'easeInOut' }}
                />
              ))}
            </motion.div>
          </div>
        </section>

        {/* ━━━ Features ━━━ */}
        <section id="features" className="py-24 md:py-32 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionLabel number="01" text="Fonctionnalités" />
            </Reveal>

            <Reveal delay={0.1}>
              <h2
                className="text-white font-black tracking-[-0.02em] leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
              >
                Tout ce qu'il faut.<br />
                <span className="text-white/30">Rien de superflu.</span>
              </h2>
              <p className="text-white/30 text-sm md:text-base max-w-lg mb-16">
                Chaque outil est conçu pour les vendeurs qui vendent via les réseaux sociaux en Afrique de l'Ouest.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <Reveal key={i} delay={i * 0.06}>
                    <div className="group relative p-6 rounded-2xl border border-white/[0.05] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-500 cursor-default">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[#C8FF6B]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#C8FF6B]/20 transition-colors duration-500">
                          <Icon className="w-5 h-5 text-[#C8FF6B]/80" />
                        </div>
                        <div>
                          <h3 className="text-white font-semibold text-[15px] mb-1.5">{f.title}</h3>
                          <p className="text-white/30 text-[13px] leading-relaxed">{f.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ━━━ How it works ━━━ */}
        <section id="process" className="py-24 md:py-32 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionLabel number="02" text="Comment ça marche" />
            </Reveal>

            <Reveal delay={0.1}>
              <h2
                className="text-white font-black tracking-[-0.02em] leading-[1.05] mb-20"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
              >
                Trois étapes<span className="text-[#C8FF6B]">.</span><br />
                <span className="text-white/30">C'est tout.</span>
              </h2>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-8 md:gap-6 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden md:block absolute top-6 left-[16.67%] right-[16.67%] h-px bg-gradient-to-r from-white/[0.08] via-white/[0.12] to-white/[0.08]" />

              {STEPS.map((step, i) => (
                <Reveal key={i} delay={i * 0.15}>
                  <div className="relative">
                    {/* Number circle */}
                    <div className="w-12 h-12 rounded-full border border-white/[0.12] flex items-center justify-center mb-6 bg-[#060910] relative z-10">
                      <span className="text-white/60 font-mono text-sm">{String(i + 1).padStart(2, '0')}</span>
                    </div>
                    <h3 className="text-white font-bold text-base mb-2">{step.title}</h3>
                    <p className="text-white/30 text-[13px] leading-relaxed max-w-xs">{step.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ Pricing ━━━ */}
        <section id="pricing" className="py-24 md:py-32 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <SectionLabel number="03" text="Tarifs" />
            </Reveal>

            <Reveal delay={0.1}>
              <h2
                className="text-white font-black tracking-[-0.02em] leading-[1.05] mb-6"
                style={{ fontSize: 'clamp(2rem, 4vw, 3.2rem)' }}
              >
                Transparent<span className="text-[#C8FF6B]">.</span>
              </h2>
              <p className="text-white/30 text-sm md:text-base max-w-md mb-16">
                Pas d'abonnement. Achetez des crédits quand vous en avez besoin.
              </p>
            </Reveal>

            <div className="grid md:grid-cols-3 gap-4">
              {PLANS.map((plan, i) => (
                <Reveal key={i} delay={i * 0.08}>
                  <div
                    className={`relative p-7 rounded-2xl transition-all duration-500 h-full flex flex-col ${
                      plan.highlighted
                        ? 'bg-white/[0.04] border border-[#C8FF6B]/30 hover:border-[#C8FF6B]/50'
                        : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]'
                    }`}
                  >
                    {plan.highlighted && (
                      <div className="absolute -top-3 right-6 px-3 py-1 bg-[#C8FF6B] text-[#060910] text-[10px] font-bold tracking-wider uppercase rounded-full">
                        Populaire
                      </div>
                    )}

                    {/* Plan name */}
                    <div className="mb-6">
                      <h3 className="text-white font-semibold text-base mb-1">{plan.name}</h3>
                      <p className="text-white/25 text-xs">{plan.credits}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-8">
                      <span className="text-white font-black text-3xl tracking-tight">{plan.price}</span>
                    </div>

                    {/* CTA */}
                    <button
                      onClick={goStart}
                      className={`w-full py-3 text-[13px] font-semibold rounded-xl transition-all duration-300 mb-8 ${
                        plan.highlighted
                          ? 'bg-white text-[#060910] hover:bg-[#C8FF6B]'
                          : 'border border-white/[0.1] text-white/70 hover:text-white hover:border-white/[0.2]'
                      }`}
                    >
                      Choisir ce plan
                    </button>

                    {/* Features */}
                    <div className="space-y-3 mt-auto">
                      {plan.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2.5">
                          <Check className="w-3.5 h-3.5 text-[#C8FF6B]/60 flex-shrink-0" />
                          <span className="text-white/40 text-[13px]">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━ Final CTA ━━━ */}
        <section className="py-24 md:py-32 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <Reveal>
              <div className="text-center">
                <h2
                  className="text-white font-black tracking-[-0.02em] leading-[1.05] mb-6"
                  style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}
                >
                  Prêt à vendre<span className="text-[#C8FF6B]">?</span>
                </h2>
                <p className="text-white/30 text-sm md:text-base max-w-md mx-auto mb-10">
                  Rejoignez les centaines de vendeurs qui ont déjà choisi LiveLink.
                </p>
                <button
                  onClick={goStart}
                  className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-[#060910] font-bold text-sm rounded-full hover:bg-[#C8FF6B] transition-all duration-300"
                >
                  Créer ma boutique gratuitement
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ━━━ Footer ━━━ */}
        <footer className="border-t border-white/[0.04] py-12 px-6 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between gap-8">
              {/* Brand */}
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-white font-black text-base">Live</span>
                  <span className="text-white/50 font-light text-base">Link</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8FF6B]" />
                </div>
                <p className="text-white/25 text-xs leading-relaxed">
                  La plateforme de vente en direct pour les entrepreneurs en Afrique de l'Ouest.
                </p>
              </div>

              {/* Links */}
              <div className="flex gap-16">
                <div>
                  <h4 className="text-white/50 text-[11px] tracking-[0.15em] uppercase font-medium mb-4">Produit</h4>
                  <ul className="space-y-2.5">
                    {['Fonctionnalités', 'Tarifs', 'Sécurité'].map(l => (
                      <li key={l}><a href="#" className="text-white/25 hover:text-white/60 text-[13px] transition-colors">{l}</a></li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-white/50 text-[11px] tracking-[0.15em] uppercase font-medium mb-4">Légal</h4>
                  <ul className="space-y-2.5">
                    {['Conditions', 'Confidentialité', 'Contact'].map(l => (
                      <li key={l}><a href="#" className="text-white/25 hover:text-white/60 text-[13px] transition-colors">{l}</a></li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom line */}
            <div className="mt-12 pt-6 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
              <p className="text-white/15 text-[11px]">
                &copy; {new Date().getFullYear()} LiveLink. Tous droits réservés.
              </p>
              <p className="text-white/15 text-[11px]">
                Dakar, Sénégal
              </p>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
