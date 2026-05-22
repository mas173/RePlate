import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Sparkles, Users, CheckCircle,
  Zap, Shield, Clock, BarChart3, ChevronRight, Menu, X
} from 'lucide-react';
import mainLogo from '@/assets/images/mainLogo.png';
import nameLogo from '@/assets/images/name.png';
import mottoImg from '@/assets/images/motto.png';

// ─── Animated counter ───────────────────────────────────────
function Counter({ end, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ─── Nav ─────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-sm border-b border-slate-200/60 dark:border-slate-700/60' : 'bg-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <img src={mainLogo} alt="RePlate" className="w-9 h-9 object-contain" />
          <img src={nameLogo} alt="RePlate" className="h-7 object-contain hidden sm:block" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">How it works</a>
          <a href="#impact" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Impact</a>
          <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
        </div>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link to="/sign-in" className="btn-ghost text-sm">Sign in</Link>
          <Link to="/sign-up" className="btn-primary text-sm py-2 px-4">Get started free</Link>
        </div>

        {/* Mobile menu toggle */}
        <button className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 px-6 py-4 space-y-3">
          <a href="#how-it-works" className="block text-sm font-medium text-slate-700 dark:text-slate-300 py-1">How it works</a>
          <a href="#impact" className="block text-sm font-medium text-slate-700 dark:text-slate-300 py-1">Impact</a>
          <a href="#features" className="block text-sm font-medium text-slate-700 dark:text-slate-300 py-1">Features</a>
          <div className="pt-2 flex flex-col gap-2">
            <Link to="/sign-in" className="btn-secondary w-full justify-center">Sign in</Link>
            <Link to="/sign-up" className="btn-primary w-full justify-center">Get started free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 hero-grid" />
      <div className="blur-orb w-[500px] h-[500px] bg-primary-400 top-[-100px] right-[-100px]" />
      <div className="blur-orb w-[400px] h-[400px] bg-teal-400 bottom-[-80px] left-[-80px]" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-primary-50/40 dark:from-slate-900/80 dark:via-transparent dark:to-primary-950/30" />

      <div className="section relative z-10 w-full py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Copy */}
          <div className="animate-fade-in-up">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/50 border border-primary-200/60 dark:border-primary-800/60 text-primary-700 dark:text-primary-400 text-sm font-medium mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Food Redistribution
              <ChevronRight className="w-3.5 h-3.5 opacity-60" />
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-[1.08] tracking-tight text-slate-900 dark:text-white mb-6">
              Reduce Food Waste.{' '}
              <span className="text-gradient">Feed More People.</span>{' '}
              Powered by AI.
            </h1>

            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10 max-w-lg">
              RePlate connects restaurants, hotels, and grocery stores with NGOs and shelters to redistribute surplus food before it expires — intelligently.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/sign-up" className="btn-primary py-3 px-7 text-base shadow-glow-green">
                Donate Food <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/sign-up" className="btn-outline py-3 px-7 text-base">
                Join as NGO
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 mt-10 pt-8 border-t border-slate-200/60 dark:border-slate-700/60">
              {[
                { value: '2,400+', label: 'Meals redistributed' },
                { value: '180+', label: 'Partner restaurants' },
                { value: '96%', label: 'Pickup success rate' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-bold text-slate-900 dark:text-white text-lg">{s.value}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Dashboard preview card */}
          <div className="hidden lg:block animate-slide-in-right">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Dashboard Preview (hero right side) ──────────────────────
function DashboardPreview() {
  return (
    <div className="relative animate-float">
      {/* Glow behind */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-400/20 to-teal-400/20 blur-3xl rounded-3xl" />

      <div className="relative card p-5 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Available Donations</p>
          <span className="badge bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/60">Live</span>
        </div>

        {/* Donation items */}
        {[
          { name: 'Cooked Rice & Curry', qty: '15 meals', urgency: 'High', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40', score: 82, time: '2h left' },
          { name: 'Assorted Pastries', qty: '30 items', urgency: 'Medium', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/40', score: 91, time: '5h left' },
          { name: 'Fresh Vegetables', qty: '8 kg', urgency: 'Low', color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/40', score: 96, time: '12h left' },
        ].map((item) => (
          <div key={item.name} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-teal-100 dark:from-primary-900/40 dark:to-teal-900/40 flex items-center justify-center text-lg shrink-0">
              🍽️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{item.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500">{item.qty} · {item.time}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`badge text-xs ${item.color}`}>{item.urgency}</span>
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400">{item.score}%</span>
            </div>
          </div>
        ))}

        {/* AI badge */}
        <div className="flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary-50 to-teal-50 dark:from-primary-950/40 dark:to-teal-950/40 border border-primary-100 dark:border-primary-900/40">
          <Sparkles className="w-4 h-4 text-teal-500 shrink-0" />
          <p className="text-xs text-slate-600 dark:text-slate-400">
            AI analyzed <strong className="text-slate-800 dark:text-slate-200">3 items</strong> — all safe for redistribution
          </p>
        </div>

        {/* Impact row */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          {[
            { label: 'Meals Saved', value: '2,412' },
            { label: 'CO₂ Reduced', value: '1.2t' },
            { label: 'Active NGOs', value: '34' },
          ].map((m) => (
            <div key={m.label} className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <p className="font-bold text-sm text-slate-900 dark:text-white">{m.value}</p>
              <p className="text-2xs text-slate-500 leading-tight">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────
function StatsBar() {
  const stats = [
    { value: 1.3, suffix: 'B tons', label: 'food wasted globally each year', icon: '🌍' },
    { value: 828, suffix: 'M+', label: 'people go hungry worldwide', icon: '😔' },
    { value: 10, suffix: '%', label: 'of global CO₂ from food waste', icon: '🌡️' },
    { value: 3, suffix: 'x', label: 'more food produced than needed', icon: '📦' },
  ];

  return (
    <section className="py-16 bg-slate-900 dark:bg-slate-950">
      <div className="section">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-slate-500 mb-10">The Global Problem We're Solving</p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl mb-1">{s.icon}</p>
              <p className="text-3xl font-bold text-white mb-1">
                <Counter end={s.value} suffix={s.suffix} />
              </p>
              <p className="text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ──────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    {
      step: '01',
      icon: '📸',
      title: 'Donor uploads surplus food',
      desc: 'Restaurants, hotels, and grocery stores post surplus food with photos, quantity, and expiry details in under 2 minutes.',
      color: 'from-primary-500 to-primary-600',
    },
    {
      step: '02',
      icon: '🤖',
      title: 'AI analyses freshness',
      desc: 'Gemini AI instantly analyses the food image, assigns a freshness score, urgency level, and estimated safe distribution window.',
      color: 'from-teal-500 to-teal-600',
    },
    {
      step: '03',
      icon: '🤝',
      title: 'NGO claims the donation',
      desc: 'Registered NGOs and shelters browse available food, filter by location and urgency, and claim donations with one click.',
      color: 'from-primary-500 to-teal-500',
    },
    {
      step: '04',
      icon: '📊',
      title: 'Impact is tracked',
      desc: 'Every delivery logs meals saved, CO₂ reduced, and water conserved — building a transparent impact record for all stakeholders.',
      color: 'from-teal-500 to-primary-600',
    },
  ];

  return (
    <section id="how-it-works" className="py-24">
      <div className="section">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">Simple by design</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">How RePlate works</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            From surplus food to community impact in four steps — the entire process takes less than 5 minutes.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((s, i) => (
            <div key={s.step} className="card-hover p-6 relative group">
              {/* Step number */}
              <span className="absolute top-5 right-5 text-5xl font-black text-slate-100 dark:text-slate-800 leading-none select-none">{s.step}</span>

              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center text-2xl mb-5 shadow-md`}>
                {s.icon}
              </div>

              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{s.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>

              {/* Connector arrow (hide on last) */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10">
                  <ChevronRight className="w-6 h-6 text-slate-300 dark:text-slate-600" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────
function Features() {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Freshness Analysis',
      desc: 'Gemini AI analyses food images in seconds — returning a freshness score, urgency level, and safe distribution window.',
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40',
    },
    {
      icon: Clock,
      title: 'Expiry Alerts',
      desc: 'Automated notifications alert donors when donations are nearing expiry, and NGOs when new food matches their area.',
      color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      desc: 'Three secure roles — Donor, NGO, Admin — each with tailored dashboards and access controls via Clerk authentication.',
      color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/40',
    },
    {
      icon: BarChart3,
      title: 'Impact Analytics',
      desc: 'Track meals saved, CO₂ reduced, and water conserved in real-time with beautiful, shareable analytics dashboards.',
      color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40',
    },
    {
      icon: Zap,
      title: 'Instant Notifications',
      desc: 'Email alerts for every key event — new donation nearby, claim confirmed, pickup scheduled — powered by Resend.',
      color: 'text-yellow-500 bg-yellow-50 dark:bg-yellow-950/40',
    },
    {
      icon: Users,
      title: 'Multi-Organisation',
      desc: 'Built for restaurants, hotels, grocery chains, event organisers, NGOs, shelters, and community kitchens.',
      color: 'text-primary-600 bg-primary-50 dark:bg-primary-950/40',
    },
  ];

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="section">
        <div className="text-center mb-16">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-3">Everything you need</p>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">Built for scale, designed for simplicity</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
            Every feature is designed to make food redistribution faster, smarter, and more impactful.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white mb-2">{f.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Impact section ────────────────────────────────────────────
function Impact() {
  return (
    <section id="impact" className="py-24">
      <div className="section">
        <div className="card p-10 md:p-16 text-center bg-gradient-to-br from-primary-600 to-teal-600 border-0 overflow-hidden relative">
          {/* Decorative circles */}
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full bg-white/10 blur-xl" />
          <div className="absolute bottom-[-60px] left-[-60px] w-64 h-64 rounded-full bg-white/10 blur-xl" />

          <div className="relative z-10">
            <p className="text-primary-100 text-sm font-semibold uppercase tracking-widest mb-4">Our collective impact</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-12">Every meal counts</h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
              {[
                { value: 2412, suffix: '', label: 'Meals Saved', icon: '🍽️' },
                { value: 1200, suffix: ' kg', label: 'CO₂ Reduced', icon: '🌱' },
                { value: 180, suffix: '+', label: 'Donor Partners', icon: '🏪' },
                { value: 34, suffix: '', label: 'NGO Partners', icon: '🤝' },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-3xl mb-1">{s.icon}</p>
                  <p className="text-3xl font-bold text-white">
                    <Counter end={s.value} suffix={s.suffix} />
                  </p>
                  <p className="text-primary-100 text-sm mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/sign-up" className="btn bg-white text-primary-700 hover:bg-primary-50 px-8 py-3 text-base font-bold shadow-elevated">
                Start donating today <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/sign-up" className="btn border-2 border-white/50 text-white hover:bg-white/10 px-8 py-3 text-base font-semibold">
                Register your NGO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 py-12">
      <div className="section">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <img src={mainLogo} alt="RePlate" className="w-8 h-8 object-contain" />
              <img src={nameLogo} alt="RePlate" className="h-6 object-contain" />
            </div>
            <img src={mottoImg} alt="Reduce Waste. Feed More." className="h-3.5 object-contain opacity-60" />
          </div>

          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Contact', 'GitHub'].map((link) => (
              <a key={link} href="#" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>

          <p className="text-sm text-slate-400">
            © 2026 RePlate · Built for a sustainable future 🌿
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:bg-[#0F172A]">
      <Navbar />
      <Hero />
      <StatsBar />
      <HowItWorks />
      <Features />
      <Impact />
      <Footer />
    </div>
  );
}
