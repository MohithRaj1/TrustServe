import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useReveal } from '../hooks/useReveal';
import ScrollToTop from '../components/ScrollToTop';

const NAV_LINKS = [
  { href: '#how', label: 'How it Works' },
  { href: '#features', label: 'Features' },
  { href: '#impact', label: 'Impact' },
  { href: '#faq', label: 'FAQ' },
  { href: '#trust', label: 'Trust' },
];

const FAQ_ITEMS = [
  {
    q: 'Who can register as a donor or receiver?',
    a: 'Restaurants, hotels, caterers, and certified kitchens can register as donors. NGOs, shelters, community kitchens, and verified receivers can join to collect surplus food.',
  },
  {
    q: 'How does QR verification work?',
    a: 'When an NGO accepts a donation, both parties get a unique QR code. Scanning at pickup creates a tamper-proof handoff record linked to the transaction.',
  },
  {
    q: 'Is the food safe to redistribute?',
    a: 'Donors must follow FSSAI guidelines. Urgency tags (Critical, Moderate, Safe) are auto-calculated from expiry time so time-sensitive food moves first.',
  },
  {
    q: 'What happens if there is a complaint?',
    a: 'Either party can file a complaint from their dashboard. Admins review evidence and resolve disputes within 24 hours, with trust scores updated accordingly.',
  },
];

const FaqItem = ({ question, answer, isOpen, onToggle }) => (
  <div className={`faq-item reveal ${isOpen ? 'open' : ''}`}>
    <button type="button" className="faq-trigger" onClick={onToggle} aria-expanded={isOpen}>
      <span>{question}</span>
      <span className="faq-chevron" aria-hidden>▼</span>
    </button>
    <div className="faq-content">
      <p className="faq-answer">{answer}</p>
    </div>
  </div>
);

const LandingPage = () => {
  useReveal();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const [mealsCount, setMealsCount] = useState(0);
  const [donorsCount, setDonorsCount] = useState(0);
  const [ngosCount, setNgosCount] = useState(0);
  const [verifCount, setVerifCount] = useState(0);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  useEffect(() => {
    const sectionIds = ['how', 'features', 'impact', 'faq', 'trust'];
    const observers = sectionIds.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -50% 0px', threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 2000;
          const incrementTime = 30;
          const steps = duration / incrementTime;
          const animateValue = (target, setter) => {
            let currentStep = 0;
            const stepValue = target / steps;
            const timer = setInterval(() => {
              currentStep++;
              setter(Math.floor(currentStep * stepValue));
              if (currentStep >= steps) {
                setter(target);
                clearInterval(timer);
              }
            }, incrementTime);
          };
          animateValue(1240, setMealsCount);
          animateValue(38, setDonorsCount);
          animateValue(22, setNgosCount);
          animateValue(94, setVerifCount);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    const element = document.getElementById('impact');
    if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href) => {
    closeMobile();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-surface min-h-screen font-sans">
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-lg transition-all duration-300 ${
          scrolled ? 'border-b border-gray-200/80 shadow-sm py-3' : 'py-4 md:py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-2 shrink-0 bg-transparent border-none cursor-pointer p-0"
          >
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-white text-sm">🍃</span>
            </div>
            <span className="text-lg sm:text-xl font-bold">
              <span className="text-primary">Trust</span>
              <span className="text-accent">Serve</span>
            </span>
          </button>

          <nav className="hidden md:flex gap-6 lg:gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`nav-link font-medium ${activeSection === link.href.slice(1) ? 'active' : ''}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex gap-2 sm:gap-3 items-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="hidden sm:block border-2 border-primary text-primary rounded-full px-4 py-2 font-semibold hover:bg-primary hover:text-white transition-all text-sm"
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary rounded-full px-4 sm:px-5 py-2 text-sm shadow-md hidden sm:inline-flex"
            >
              Get Started →
            </button>
            <button
              type="button"
              className="md:hidden w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`} aria-hidden={!mobileOpen}>
        <div className="mobile-drawer-backdrop" onClick={closeMobile} />
        <div className="mobile-drawer-panel">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold">
              <span className="text-primary">Trust</span>
              <span className="text-accent">Serve</span>
            </span>
            <button
              type="button"
              onClick={closeMobile}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`mobile-nav-link ${activeSection === link.href.slice(1) ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                handleNavClick(link.href);
              }}
            >
              {link.label}
            </a>
          ))}
          <hr className="divider my-4" />
          <button
            type="button"
            onClick={() => { closeMobile(); navigate('/login'); }}
            className="btn-primary w-full rounded-xl py-3.5 mt-2"
          >
            Get Started →
          </button>
          <button
            type="button"
            onClick={() => { closeMobile(); navigate('/login'); }}
            className="w-full py-3 rounded-xl border-2 border-primary text-primary font-semibold mt-2"
          >
            Login
          </button>
        </div>
      </div>

      {/* HERO */}
      <section className="relative min-h-[100dvh] flex flex-col justify-center items-center text-center px-4 sm:px-6 pt-28 pb-16 bg-white overflow-hidden hero-gradient-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, #d1e8d1 1px, transparent 1px)',
            backgroundSize: '28px 28px',
          }}
        />

        <div className="relative z-10 animate-fade-slide-up max-w-4xl">
          <div className="inline-flex items-center gap-2 border border-green-200 rounded-full text-sm text-green-700 bg-[var(--primary-glow)] px-4 py-2 mb-6 sm:mb-8 animate-pill-pop font-semibold shadow-sm">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Civic Tech for a Hunger-Free City
          </div>

          <h1 className="hero-heading text-[2.25rem] sm:text-[3rem] md:text-[4.5rem] lg:text-[5rem] font-extrabold leading-[1.08] mb-6 tracking-tight">
            <span className="animate-word-reveal text-primary" style={{ animationDelay: '0s' }}>Share Food.</span>{' '}
            <span className="animate-word-reveal text-accent" style={{ animationDelay: '0.15s' }}>Build Trust.</span>
            <br className="hidden sm:block" />
            <span className="animate-word-reveal text-[#0f1a0f]" style={{ animationDelay: '0.3s' }}>Serve Better.</span>
          </h1>

          <p className="text-base sm:text-lg text-secondary max-w-xl mx-auto mt-4 reveal reveal-delay-2 font-medium px-2">
            A verified food redistribution platform connecting restaurants, hotels, and NGOs — with trust at every step.
          </p>

          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center reveal reveal-delay-3 px-2">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="btn-primary rounded-full px-8 py-3.5 text-base sm:text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
              🍽️ I&apos;m a Donor
            </button>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="border-2 border-primary text-primary bg-white font-semibold rounded-full px-8 py-3.5 text-base sm:text-lg hover:bg-green-50 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all w-full sm:w-auto"
            >
              🤝 I&apos;m a Receiver
            </button>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-3 justify-center reveal reveal-delay-4">
            {[
              { icon: '🍽️', text: '1,240+ Meals Saved' },
              { icon: '🤝', text: '38 Active Donors' },
              { icon: '🏢', text: '22 NGOs Served' },
            ].map((stat, i) => (
              <div
                key={i}
                className="bg-white/90 backdrop-blur border border-gray-100 rounded-full px-5 py-2.5 shadow-sm font-semibold text-sm text-gray-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {stat.icon} {stat.text}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard preview */}
        <div className="relative z-10 mt-14 sm:mt-20 max-w-2xl mx-auto w-full reveal reveal-delay-4 px-2">
          <div className="bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] border border-[var(--border)] animate-float p-4 md:p-6 text-left">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <span className="ml-2 text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-wider">Live Dashboard</span>
              <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">● Live</span>
            </div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6">
              <div className="w-full md:w-1/3 bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold shadow-md">SG</div>
                  <div>
                    <div className="font-bold text-xs text-gray-500 uppercase">Trust Score</div>
                    <div className="text-primary font-black text-lg">4.8 ⭐</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {['📈', '🍲', '⭐'].map((icon, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs">{icon}</span>
                      <div className="h-2 bg-gray-200 rounded-full flex-1 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full transition-all duration-1000"
                          style={{ width: `${[92, 78, 88][i]}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-2/3 space-y-3">
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex justify-between items-center gap-2 hover:border-primary transition-colors">
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 text-sm sm:text-base truncate">50 Meals — Rice & Curry</div>
                    <div className="text-xs text-gray-500 mt-1">🏢 Spice Garden • 2.5 km</div>
                  </div>
                  <div className="urgency-critical text-[10px] sm:text-[11px] px-2 py-1 shrink-0">Critical</div>
                </div>
                <div className="bg-white border border-gray-100 p-4 rounded-xl shadow-sm flex justify-between items-center opacity-70">
                  <div className="min-w-0">
                    <div className="font-bold text-gray-800 text-sm sm:text-base truncate">120 Breads</div>
                    <div className="text-xs text-gray-500 mt-1">🏢 City Bakery • 4.1 km</div>
                  </div>
                  <div className="urgency-safe text-[10px] sm:text-[11px] px-2 py-1 shrink-0">Safe</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="w-full bg-primary py-4 overflow-hidden marquee-wrap" aria-label="Platform statistics">
        <div className="marquee-track text-white/90 font-semibold text-sm flex items-center gap-10 px-4">
          {[...Array(2)].map((_, i) => (
            <React.Fragment key={i}>
              <span>1,240 Meals Redistributed</span><span className="text-white/30">✦</span>
              <span>38 Donor Organizations</span><span className="text-white/30">✦</span>
              <span>22 NGOs & Shelters</span><span className="text-white/30">✦</span>
              <span>94% Verification Rate</span><span className="text-white/30">✦</span>
              <span>4.7 Average Trust Score</span><span className="text-white/30">✦</span>
              <span>Zero Food Wasted Today</span><span className="text-white/30">✦</span>
              <span>4 Cities Covered</span><span className="text-white/30">✦</span>
              <span>100% Verified Transactions</span><span className="text-white/30">✦</span>
            </React.Fragment>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-12 px-4 sm:px-6 bg-surface border-b border-gray-100">
        <p className="text-center text-xs font-bold uppercase tracking-widest text-muted mb-6 reveal">Trusted by organizations across Karnataka</p>
        <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-3 sm:gap-4 reveal reveal-delay-1">
          {['Spice Garden', 'Hope Foundation', 'Hotel Meridian', 'Sunrise Shelter', 'Green Valley', 'City Care NGO'].map((name) => (
            <div key={name} className="partner-pill">
              <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm">🏢</span>
              {name}
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="text-center reveal">
          <p className="section-label">How it Works</p>
          <h2 className="hero-heading text-3xl sm:text-4xl md:text-[3.5rem] font-bold leading-tight">
            From Surplus to Served
            <br />
            <span className="text-primary italic">in Three Simple Steps</span>
          </h2>
          <p className="text-muted max-w-xl mx-auto mt-5 text-base sm:text-lg">
            We&apos;ve streamlined the donation process so food reaches those who need it fastest, with full transparency.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 mt-16 md:mt-24 relative">
          <div className="hidden md:block absolute top-10 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
          {[
            { num: '1', icon: '🍽️', title: 'Post Surplus Food', desc: 'Restaurants and hotels list available food with quantity, expiry time, and pickup details in seconds.' },
            { num: '2', icon: '🤝', title: 'NGOs Accept & Collect', desc: 'Verified receivers browse nearby donations, accept in one tap, and coordinate pickup seamlessly.' },
            { num: '3', icon: '✅', title: 'Verify & Build Trust', desc: 'QR-based handoff verification ensures accountability. Reviews build a trusted ecosystem.' },
          ].map((step, idx) => (
            <div key={idx} className={`relative text-center reveal reveal-delay-${idx + 1}`}>
              <div className="absolute top-6 left-1/2 -translate-x-1/2 text-[6rem] sm:text-[8rem] font-black text-gray-50 -z-10 select-none leading-none">
                {step.num}
              </div>
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#3d8b3d] to-primary shadow-xl mx-auto flex items-center justify-center text-3xl sm:text-4xl text-white animate-float" style={{ animationDelay: `${idx * 0.5}s` }}>
                {step.icon}
              </div>
              <h3 className="font-bold text-lg sm:text-xl mt-6 text-gray-900">{step.title}</h3>
              <p className="text-muted text-sm sm:text-base mt-2 max-w-[260px] mx-auto leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-20 sm:py-28 bg-[var(--surface-2)] px-4 sm:px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center md:text-left">
            <p className="section-label">Features</p>
            <h2 className="hero-heading text-3xl sm:text-4xl md:text-[3.5rem] leading-tight">
              Built for Trust,
              <br />
              <span className="text-primary font-bold italic">Designed for Impact.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16">
            {[
              { icon: '🔍', title: 'Smart Urgency Detection', desc: 'Auto-tags donations as Critical/Moderate/Safe based on expiry — so the right food moves first.' },
              { icon: '📱', title: 'QR-Based Verification', desc: 'Every handoff verified with a unique QR code. Full accountability. Zero fraud.' },
              { icon: '⭐', title: 'Multi-Criteria Trust Scores', desc: 'Rated on food quality, hygiene, packaging, and timeliness — not just stars.' },
              { icon: '🗺️', title: 'Location-Aware Matching', desc: 'NGOs see only nearby donations. Proximity sorting means faster pickups.' },
              { icon: '🛡️', title: 'Admin Oversight Panel', desc: 'Full visibility — complaints, verifications, user management, and analytics.' },
              { icon: '📊', title: 'Impact Analytics', desc: 'Track meals saved, trust trends, and donation patterns with visual reports.' },
            ].map((feat, idx) => (
              <div key={idx} className={`card card-glow p-6 sm:p-8 hover:-translate-y-2 transition-transform duration-300 reveal reveal-delay-${(idx % 3) + 1}`}>
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[var(--primary-glow)] flex items-center justify-center text-2xl sm:text-3xl mb-5 border border-green-100">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-base sm:text-lg text-gray-900">{feat.title}</h3>
                <p className="text-muted text-sm mt-2 leading-relaxed">{feat.desc}</p>
                <a href="#trust" className="text-primary text-sm font-semibold hover:underline mt-5 inline-block group">
                  Learn more <span className="inline-block transition-transform group-hover:translate-x-1">→</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST */}
      <section id="trust" className="py-20 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-center">
          <div className="flex-1 reveal w-full">
            <p className="section-label">Trust System</p>
            <h2 className="hero-heading text-3xl sm:text-[3rem] font-bold leading-tight mb-5">
              Every Meal Verified.
              <br />
              <span className="text-gray-600 italic font-normal">Every Actor Accountable.</span>
            </h2>
            <p className="text-muted max-w-lg mb-8 text-base sm:text-lg leading-relaxed">
              TrustServe&apos;s multi-layered verification ensures food safety and accountability at every step.
            </p>
            <div className="flex flex-col gap-4">
              {[
                { title: 'Identity Verification', desc: 'All donors verified with FSSAI + org docs' },
                { title: 'QR Handoff Proof', desc: 'Every transaction has cryptographic QR proof' },
                { title: 'Multi-Criteria Reviews', desc: '5-dimension rating after every exchange' },
                { title: 'Complaint Resolution', desc: 'Admin-reviewed within 24 hours' },
              ].map((pt, i) => (
                <div key={i} className="flex gap-4 items-start bg-white p-4 rounded-xl border border-gray-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0 font-bold">✓</div>
                  <div>
                    <div className="font-bold text-gray-900">{pt.title}</div>
                    <div className="text-muted text-sm mt-0.5">{pt.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center w-full reveal reveal-delay-2">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-sm border border-gray-100 animate-float" style={{ animationDuration: '4s' }}>
              <div className="section-label mb-2">Trust Score Profile</div>
              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-5xl sm:text-6xl font-black text-primary">4.8</div>
                <div className="text-gray-400 font-bold text-lg">/ 5.0</div>
              </div>
              <div className="text-primary text-lg mb-5">⭐⭐⭐⭐⭐</div>
              <hr className="divider my-5" />
              <div className="space-y-3">
                {[
                  { label: 'Food Quality', pct: '96%' },
                  { label: 'Hygiene', pct: '92%' },
                  { label: 'Packaging', pct: '98%' },
                  { label: 'Timeliness', pct: '96%' },
                ].map((crit) => (
                  <div key={crit.label} className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="font-semibold text-gray-600 text-[10px] uppercase tracking-wider">{crit.label}</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-primary to-[#4da04d] h-full rounded-full" style={{ width: crit.pct }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-green-50 border border-green-200 text-green-700 font-bold text-center py-3 rounded-xl flex items-center justify-center gap-2">
                ✅ Verified Donor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-20 sm:py-28 bg-[var(--surface-2)] px-4 sm:px-6 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="reveal text-center md:text-left mb-12">
            <p className="section-label">Testimonials</p>
            <h2 className="hero-heading text-3xl sm:text-[3rem] font-bold leading-tight">
              Voices from the <span className="text-primary italic">TrustServe Community</span>
            </h2>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {[
              { quote: 'TrustServe has transformed how we redistribute our daily surplus. The QR verification gives us confidence every single time.', author: 'Ravi Kumar', role: 'Manager, Spice Garden', type: 'Donor' },
              { quote: 'We used to struggle finding reliable food sources. Now Hope Foundation receives verified, fresh donations daily.', author: 'Priya Sharma', role: 'Director, Hope Foundation', type: 'Receiver' },
              { quote: 'The trust score system is brilliant. It holds everyone accountable and food quality has been consistently excellent.', author: 'Mohammed Arif', role: 'Sunrise Shelter', type: 'Receiver' },
              { quote: 'Simple, fast, and trustworthy. We post a donation in under 2 minutes. Critical food moves first.', author: 'Ananya Iyer', role: 'Hotel Meridian', type: 'Donor' },
              { quote: 'The analytics dashboard helps us report social impact to stakeholders — all in one place.', author: 'Suresh Nair', role: 'Green Valley Hotel', type: 'Donor' },
              { quote: 'From complaint to resolution in 18 hours. The admin team is responsive and the platform keeps improving.', author: 'Fatima Begum', role: 'City Care NGO', type: 'Receiver' },
            ].map((test, idx) => (
              <div key={idx} className={`bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm break-inside-avoid hover:shadow-md transition-shadow reveal reveal-delay-${(idx % 3) + 1}`}>
                <div className="text-orange-400 text-sm mb-3 tracking-widest">★★★★★</div>
                <p className="text-secondary text-sm sm:text-base italic leading-relaxed">&ldquo;{test.quote}&rdquo;</p>
                <hr className="divider my-5" />
                <div className="flex justify-between items-center gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border flex items-center justify-center font-black text-gray-700 text-sm shrink-0">
                      {test.author.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-gray-900 truncate">{test.author}</div>
                      <div className="text-gray-500 text-xs truncate">{test.role}</div>
                    </div>
                  </div>
                  <div className={test.type === 'Donor' ? 'badge-green shrink-0' : 'badge-orange shrink-0'}>{test.type}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IMPACT */}
      <section id="impact" className="py-16 sm:py-24 bg-gradient-to-br from-primary to-[#1e4a1e] px-4 sm:px-6 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-6xl mx-auto reveal relative z-10">
          <h2 className="hero-heading text-3xl sm:text-[3rem] font-bold">Our Impact, In Numbers</h2>
          <p className="text-white/70 mt-3 text-base sm:text-lg font-medium">Measurable change across the community.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mt-12 sm:mt-16">
            {[
              { val: mealsCount, suffix: '+', label: 'Meals Redistributed', icon: '🍽️' },
              { val: donorsCount, suffix: '', label: 'Active Donor Orgs', icon: '🏢' },
              { val: ngosCount, suffix: '', label: 'NGOs & Shelters', icon: '🤝' },
              { val: verifCount, suffix: '%', label: 'Verification Rate', icon: '✅' },
            ].map((stat, idx) => (
              <div key={idx} className={`reveal reveal-delay-${idx + 1}`}>
                <div className="text-4xl sm:text-5xl md:text-[4rem] font-black leading-none">{stat.val}{stat.suffix}</div>
                <div className="text-white/80 font-semibold mt-3 text-xs sm:text-sm uppercase tracking-wide">{stat.label}</div>
                <div className="text-2xl opacity-50 mt-2">{stat.icon}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 sm:py-28 px-4 sm:px-6 max-w-3xl mx-auto">
        <div className="text-center reveal mb-10">
          <p className="section-label">FAQ</p>
          <h2 className="hero-heading text-3xl sm:text-4xl font-bold">Common Questions</h2>
          <p className="text-muted mt-4 text-base">Everything you need to know before joining TrustServe.</p>
        </div>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={item.q}
              question={item.q}
              answer={item.a}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
            />
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 px-4 sm:px-6 text-center max-w-3xl mx-auto reveal">
        <h2 className="hero-heading text-3xl sm:text-4xl md:text-[4rem] font-bold leading-tight">
          Ready to Make a <span className="text-primary italic">Difference?</span>
        </h2>
        <p className="text-muted max-w-xl mx-auto mt-5 text-base sm:text-lg leading-relaxed">
          Join our growing network of verified food redistributors. Together, we can build a more sustainable and hunger-free city.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <button type="button" onClick={() => navigate('/login')} className="btn-primary rounded-full px-10 sm:px-12 py-4 text-base sm:text-lg shadow-lg hover:-translate-y-1 transition-all w-full sm:w-auto">
            🍽️ Join as Donor
          </button>
          <button type="button" onClick={() => navigate('/login')} className="border-2 border-primary text-primary bg-white font-bold rounded-full px-10 sm:px-12 py-4 text-base sm:text-lg hover:bg-green-50 w-full sm:w-auto transition-all">
            🤝 Join as Receiver
          </button>
        </div>
        <p className="text-muted text-sm mt-6">
          Already have an account?{' '}
          <button type="button" onClick={() => navigate('/login')} className="text-primary font-bold hover:underline bg-transparent border-none cursor-pointer">
            Login →
          </button>
        </p>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0f1a0f] text-white py-16 sm:py-20 px-4 sm:px-6 border-t border-[#1a2f1a]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">🍃</div>
                <span className="text-2xl font-bold">
                  <span className="text-white">Trust</span><span className="text-orange-400">Serve</span>
                </span>
              </div>
              <p className="text-white/60 text-sm max-w-xs leading-relaxed">Share Food. Build Trust. Serve Better.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase tracking-wider text-white/90 text-sm">Platform</h4>
              <div className="space-y-3">
                {NAV_LINKS.slice(0, 4).map((l) => (
                  <a key={l.href} href={l.href} className="block text-sm text-white/60 hover:text-white transition-colors">{l.label}</a>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase tracking-wider text-white/90 text-sm">Organizations</h4>
              <div className="space-y-3">
                {['Register as Donor', 'Register as Receiver', 'Verification Process'].map((l) => (
                  <button key={l} type="button" onClick={() => navigate('/login')} className="block text-sm text-white/60 hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0 text-left">
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4 uppercase tracking-wider text-white/90 text-sm">Support</h4>
              <div className="space-y-3">
                <a href="#faq" className="block text-sm text-white/60 hover:text-white transition-colors">Help & FAQ</a>
                <span className="block text-sm text-white/40">Privacy Policy</span>
                <span className="block text-sm text-white/40">Terms of Service</span>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-white/40">
            <p>&copy; 2026 TrustServe. Built for a hunger-free city.</p>
            <p>Made with 💚 in Mysuru, Karnataka</p>
          </div>
        </div>
      </footer>

      <ScrollToTop />
    </div>
  );
};

export default LandingPage;
