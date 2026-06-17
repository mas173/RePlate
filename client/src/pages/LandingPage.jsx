import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  ArrowRight, Sparkles, Users, CheckCircle,
  Clock, BarChart3, ChevronRight, Menu, X, Sun, Moon,
  Utensils, Globe, Leaf, MapPin, Trash2, Soup, Cloud,
  DollarSign, Camera, ShieldCheck, GitMerge, Truck,
  TrendingUp, Quote, Globe2, Heart, Award, Shield,
  ExternalLink, Mail,
  IndianRupee,
  Cloudy,
  Salad,
  ImageUp,
  BadgeCheck,
  PackageCheck,
  ChartNoAxesCombined,
  BrainCircuit,
  HeartHandshake,
  AlarmClock,
  Road,
  Send,
  AlarmCheck,
  HandHeart
} from 'lucide-react';
import mainLogo from '@/assets/images/mainLogo.png';
import nameLogo from '@/assets/images/name.png';
import heroImg from '@/assets/images/hero_image.png';
import movementDonors from '@/assets/images/movement_donors.png';
import movementNgos from '@/assets/images/movement_ngos.png';
import movementCommunity from '@/assets/images/movement_community.png';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAppAuth } from '@/hooks/useAppAuth';
import { UserButton } from '@clerk/clerk-react';
import { analyticsAPI } from '@/services/api';

// ─── Animated counter ───────────────────────────────────────
function Counter({ end, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!end || end <= 0) return;
    let start = 0;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ─── Nav ─────────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggle } = useDarkMode();
  const { isSignedIn, role } = useAppAuth();
  const [activeDropdown, setActiveDropdown] = useState(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const dashboardPath = role === 'admin' ? '/admin' : '/dashboard';

  const toggleDropdown = (menuName) => {
    if (activeDropdown === menuName) {
      setActiveDropdown(null);
    } else {
      setActiveDropdown(menuName);
    }
  };

  return (
    <nav
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled
          ? `
        bg-white/10
        dark:bg-slate-900/20
        backdrop-blur-2xl
        border-b
        border-white/20
        dark:border-white/10
        shadow-[0_8px_32px_rgba(0,0,0,0.12)]
      `
          : 'bg-transparent'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <img src={mainLogo} alt="RePlate Logo" className="w-10 h-10 object-contain" />
          <span className="font-display font-bold text-2xl text-brand-forest dark:text-brand-sage flex items-center">
            RePlate
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-8">
          <a href="#how-it-works" className="text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-brand-sage transition-colors">
            How it works
          </a>
          <a href="#impact" className="text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-brand-sage transition-colors">
            Our impact
          </a>

          {/* For Donors Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('donors')}
              className="flex items-center gap-1 text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-brand-sage transition-colors focus:outline-none"
            >
              For Donors
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'donors' ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            {activeDropdown === 'donors' && (
              <div className="absolute left-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-2 shadow-xl animate-scale-in">
                <Link to="/sign-up" className="block px-4 py-2.5 rounded-xl text-sm text-neutralText-sub dark:text-slate-300 hover:bg-brand-mint dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white transition-colors">
                  List Surplus Food
                </Link>
                <Link to="/sign-in" className="block px-4 py-2.5 rounded-xl text-sm text-neutralText-sub dark:text-slate-300 hover:bg-brand-mint dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white transition-colors">
                  Donor Dashboard
                </Link>
              </div>
            )}
          </div>

          {/* For NGOs Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('ngos')}
              className="flex items-center gap-1 text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-brand-sage transition-colors focus:outline-none"
            >
              For NGOs
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'ngos' ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            {activeDropdown === 'ngos' && (
              <div className="absolute left-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-2 shadow-xl animate-scale-in">
                <Link to="/sign-up" className="block px-4 py-2.5 rounded-xl text-sm text-neutralText-sub dark:text-slate-300 hover:bg-brand-mint dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white transition-colors">
                  Claim Available Food
                </Link>
                <Link to="/sign-in" className="block px-4 py-2.5 rounded-xl text-sm text-neutralText-sub dark:text-slate-300 hover:bg-brand-mint dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white transition-colors">
                  NGO Verification
                </Link>
              </div>
            )}
          </div>

          {/* Resources Dropdown */}
          <div className="relative">
            <button 
              onClick={() => toggleDropdown('resources')}
              className="flex items-center gap-1 text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-brand-sage transition-colors focus:outline-none"
            >
              Resources
              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-90' : 'rotate-0'}`} />
            </button>
            {activeDropdown === 'resources' && (
              <div className="absolute left-0 mt-3 w-56 rounded-2xl bg-white dark:bg-slate-900 border border-brand-border dark:border-slate-800 p-2 shadow-xl animate-scale-in">
                <a href="#problem" className="block px-4 py-2.5 rounded-xl text-sm text-neutralText-sub dark:text-slate-300 hover:bg-brand-mint dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white transition-colors">
                  Food Waste Studies
                </a>
                <a href="#news" className="block px-4 py-2.5 rounded-xl text-sm text-neutralText-sub dark:text-slate-300 hover:bg-brand-mint dark:hover:bg-slate-800 hover:text-brand-forest dark:hover:text-white transition-colors">
                  News & Blog
                </a>
              </div>
            )}
          </div>

          <a href="#about" className="text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-brand-sage transition-colors">
            About us
          </a>
        </div>

        {/* CTA & Theme Controls */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-1 cursor-pointer text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green">
            <Globe className="w-4 h-4" />
            <span>EN</span>
            <ChevronRight className="w-3 rotate-90" />
          </div>

          {/* Theme Toggle */}
          <button onClick={toggle}
            className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {isSignedIn ? (
            <div className="flex items-center gap-3">
              <Link to={dashboardPath} className="bg-brand-green text-white hover:bg-brand-green/90 transition-all font-semibold rounded-full px-5 py-2 text-sm shadow-md">
                Go to Dashboard
              </Link>
              <div className="flex items-center">
                <UserButton afterSignOutUrl="/" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/sign-in" className="text-sm font-semibold text-neutralText-sub dark:text-slate-300 hover:text-brand-green dark:hover:text-white transition-colors px-4 py-2">
                Log in
              </Link>
              <Link to="/sign-up" className="bg-brand-forest text-white hover:bg-brand-forest/90 transition-all font-semibold rounded-full px-5 py-2 text-sm shadow-md">
                Get started
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex items-center gap-3 lg:hidden">
          <button onClick={toggle}
            className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none">
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-lg text-neutralText-sub dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white dark:bg-slate-900 border-t border-brand-border dark:border-slate-800 px-6 py-5 space-y-4 shadow-xl">
          <a href="#how-it-works" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-neutralText-sub dark:text-slate-300 py-1.5 hover:text-brand-green">How it works</a>
          <a href="#impact" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-neutralText-sub dark:text-slate-300 py-1.5 hover:text-brand-green">Our impact</a>
          <Link to="/sign-up" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-neutralText-sub dark:text-slate-300 py-1.5 hover:text-brand-green">For Donors</Link>
          <Link to="/sign-up" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-neutralText-sub dark:text-slate-300 py-1.5 hover:text-brand-green">For NGOs</Link>
          <a href="#news" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-neutralText-sub dark:text-slate-300 py-1.5 hover:text-brand-green">Resources & Blog</a>
          <a href="#about" onClick={() => setMobileOpen(false)} className="block text-sm font-semibold text-neutralText-sub dark:text-slate-300 py-1.5 hover:text-brand-green">About us</a>
          <div className="pt-3 border-t border-brand-border dark:border-slate-800 flex flex-col gap-2">
            {isSignedIn ? (
              <Link to={dashboardPath} onClick={() => setMobileOpen(false)} className="bg-brand-green text-white font-semibold rounded-full py-2.5 text-center shadow-md text-sm">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/sign-in" onClick={() => setMobileOpen(false)} className="text-neutralText-sub dark:text-slate-300 font-semibold py-2.5 text-center text-sm">
                  Log in
                </Link>
                <Link to="/sign-up" onClick={() => setMobileOpen(false)} className="bg-brand-forest text-white font-semibold rounded-full py-2.5 text-center shadow-md text-sm">
                  Get started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ────────────────────────────────────────────────────
function Hero() {
  const { isSignedIn, role } = useAppAuth();

  return (
    <section className="relative min-h-[600px] lg:min-h-[720px] flex items-center bg-white dark:bg-slate-950 overflow-hidden">
      {/* Full Background Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroImg} 
          alt="Hero background" 
          className="w-full h-full object-cover object-center lg:object-right select-none pointer-events-none"
        />
        {/* Gradients to ensure text readability on all viewports / dark mode */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent lg:hidden" />
        <div className="absolute inset-0 bg-transparent dark:bg-gradient-to-r dark:from-slate-950 dark:via-slate-950/90 dark:to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-28 pb-24 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Copy */}
          <div className="lg:col-span-6 animate-fade-in-up">
            <h1 className="text-[52px] sm:text-[68px] font-bold leading-[1.05] tracking-tight text-neutralText-main dark:text-white font-display mb-6">
              Real food.<br />
              <span className="text-brand-green">Real impact.</span>
            </h1>

            <p className="text-lg sm:text-xl text-neutralText-sub dark:text-slate-300 leading-relaxed mb-8 max-w-xl">
              RePlate connects surplus food from businesses with communities that need it. Because no good food should go to waste when someone is hungry.
            </p>

            <div className="flex flex-wrap gap-4 mb-10">
              <Link to={isSignedIn ? (role === 'ngo' ? '/available' : '/donate') : '/sign-up'} 
                className="inline-flex items-center gap-2 bg-brand-forest hover:bg-brand-forest/90 text-white font-bold rounded-xl px-7 py-4 text-base shadow-lg transition-all transform hover:-translate-y-0.5">
                <HandHeart />
                Donate Food
              </Link>
              <Link to={isSignedIn ? '/dashboard' : '/sign-up'} 
                className="inline-flex items-center gap-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-neutralText-main dark:text-white border border-brand-border dark:border-slate-700 font-bold rounded-xl px-7 py-4 text-base shadow-sm transition-all transform hover:-translate-y-0.5">
                <Users className="w-5 h-5 text-brand-green" />
                Partner as NGO
              </Link>
              <a href="https://github.com/mas173/RePlate/releases/download/v1.0.0/replate-android.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#3DDC84] hover:bg-[#32B86C] text-slate-900 font-bold rounded-xl px-7 py-4 text-base shadow-lg transition-all transform hover:-translate-y-0.5">
                <svg className="w-5 h-5 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414C17.027 15.3414 16.621 14.9374 16.621 14.4414C16.621 13.9454 17.027 13.5414 17.523 13.5414C18.019 13.5414 18.423 13.9454 18.423 14.4414C18.423 14.9374 18.019 15.3414 17.523 15.3414ZM6.477 15.3414C5.981 15.3414 5.577 14.9374 5.577 14.4414C5.577 13.9454 5.981 13.5414 6.477 13.5414C6.973 13.5414 7.377 13.9454 7.377 14.4414C7.377 14.9374 6.973 15.3414 6.477 15.3414ZM17.935 9.87336L19.789 6.64736C19.924 6.41336 19.843 6.11136 19.609 5.97636C19.375 5.84136 19.073 5.92236 18.938 6.15636L17.061 9.42136C15.61 8.76336 13.89 8.38836 12 8.38836C10.11 8.38836 8.39 8.76336 6.939 9.42136L5.062 6.15636C4.927 5.92236 4.625 5.84136 4.391 5.97636C4.157 6.11136 4.076 6.41336 4.211 6.64736L6.065 9.87336C3.011 11.5304 0.941 14.6544 0.771 18.3414H23.229C23.059 14.6544 20.989 11.5304 17.935 9.87336Z"/>
                </svg>
                Download App
              </a>
            </div>

            {/* Social proof / Trusted by */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80',
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&h=100&q=80',
                  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&h=100&q=80',
                  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&h=100&q=80'
                ].map((src, i) => (
                  <img key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-slate-900 object-cover" src={src} alt="User" />
                ))}
              </div>
              <div className="text-xs sm:text-sm text-neutralText-muted dark:text-slate-400">
                Trusted by <strong className="text-neutralText-main dark:text-white">15,000+ donors</strong> and <strong className="text-neutralText-main dark:text-white">1,200+ NGOs</strong> in 12 countries
              </div>
            </div>
          </div>

          {/* Right Column: Empty but holds the badge positioned absolutely in place of the image */}
          <div className="lg:col-span-6 relative h-[250px] lg:h-[400px] flex items-end justify-end">
            {/* Overlapping badge */}
            <div className="bg-brand-forest/90 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-5 shadow-2xl flex items-center gap-4 max-w-[280px] border border-white/10 text-white animate-float mb-6">
              <div className="w-12 h-12 rounded-xl bg-brand-green/80 flex items-center justify-center text-2xl shrink-0">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs text-brand-sage dark:text-slate-400 font-medium">Together, we've delivered</p>
                <p className="text-2xl font-bold font-display leading-none mt-1">24M+ meals</p>
                <p className="text-3xs text-brand-sage/80 dark:text-slate-500 mt-1">and counting</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Stats Bar ─────────────────────────────────────────────────
function StatsBar({ liveStats }) {
  // Format large stats nicely
  const getMealsDisplay = () => {
    const total = liveStats.totalMealsSaved || 0;
    if (total === 0) return { val: 24, suf: 'M+' };
    if (total >= 1000000) return { val: parseFloat((total / 1000000).toFixed(1)), suf: 'M+' };
    if (total >= 1000) return { val: parseFloat((total / 1000).toFixed(1)), suf: 'K+' };
    return { val: total, suf: '+' };
  };

  const getTonsDisplay = () => {
    // raw total waste reduced is in kg, convert to tons (divide by 1000)
    const rawKg = liveStats.totalWasteReduced || 0;
    if (rawKg === 0) return { val: 18, suf: 'K+ Tons' };
    const tons = rawKg / 1000;
    if (tons >= 1000) return { val: parseFloat((tons / 1000).toFixed(1)), suf: 'K+ Tons' };
    return { val: parseFloat(tons.toFixed(1)), suf: ' Tons' };
  };

  const meals = getMealsDisplay();
  const tons = getTonsDisplay();
  const ngosCount = liveStats.activeNGOs || 1200;
  const donorsCount = liveStats.activeDonors || 180;

  const stats = [
    { value: meals.val, suffix: meals.suf, label: 'Meals Delivered', sub: 'To people in need', icon: <Utensils className="w-6 h-6 text-brand-green" /> },
    { value: tons.value || tons.val, suffix: tons.suffix, label: 'Food Saved', sub: 'From landfills', icon: <Leaf className="w-6 h-6 text-brand-green" /> },
    { value: ngosCount, suffix: '+', label: 'NGO Partners', sub: 'Across the globe', icon: <Users className="w-6 h-6 text-brand-green" /> },
    { value: 12, suffix: '', label: 'Countries', sub: 'And growing', icon: <Globe className="w-6 h-6 text-brand-green" /> }
  ];

  return (
    <section className="relative z-20 -mt-8 px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-white dark:bg-slate-900 rounded-[32px] p-6 lg:p-8 shadow-xl border border-brand-border dark:border-slate-800">
          {stats.map((s, idx) => (
            <div key={idx} className="flex items-center gap-5 p-4 rounded-2xl hover:bg-brand-mint/40 dark:hover:bg-slate-800/40 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-brand-mint dark:bg-brand-forest/20 flex items-center justify-center shrink-0">
                {s.icon}
              </div>
              <div>
                <p className="text-3xl font-extrabold text-neutralText-main dark:text-white font-display tracking-tight leading-none mb-1">
                  <Counter end={s.value} suffix={s.suffix} />
                </p>
                <p className="text-sm font-semibold text-neutralText-main dark:text-slate-200 leading-tight">{s.label}</p>
                <p className="text-xs text-neutralText-muted dark:text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── The Problem Section ────────────────────────────────────────
function Problem() {
  const problems = [
    { value: '1.3 Billion Tons', label: 'of food is wasted every year globally', icon: <Trash2 className="w-6 h-6 text-brand-forest" /> },
    { value: '783 Million', label: 'people are facing hunger worldwide', icon: <Salad className="w-6 h-6 text-brand-forest" /> },
    { value: '8-10%', label: 'of greenhouse gas emissions come from food waste', icon: <Cloudy className="w-6 h-6 text-brand-forest" /> },
    { value: '> 1 Trillion', label: 'worth of edible food is wasted every year', icon: <IndianRupee className="w-6 h-6 text-brand-forest" /> }
  ];

  return (
    <section id="problem" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block">
            THE PROBLEM
          </span>
          <h2 className="text-4xl font-bold font-display text-neutralText-main dark:text-white tracking-tight mb-6">
            The world wastes food while millions go hungry.
          </h2>
          <p className="text-lg text-neutralText-sub dark:text-slate-300 leading-relaxed">
            Food waste is a global issue with extreme consequences for people, the planet, and our future.
          </p>
        </div>

        {/* Stats Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {problems.map((p, idx) => (
            <div key={idx} className="relative group border-l-2 border-brand-sage pl-6 py-2 hover:border-brand-green transition-colors duration-300">
              <div className="w-10 h-10 rounded-full bg-brand-mint dark:bg-slate-850 flex items-center justify-center mb-4">
                {p.icon}
              </div>
              <p className="text-2xl font-extrabold text-neutralText-main dark:text-white font-display tracking-tight mb-2">
                {p.value}
              </p>
              <p className="text-sm text-neutralText-muted dark:text-slate-400 leading-relaxed">
                {p.label}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Our Solution Section ───────────────────────────────────────
function Solution() {
  const [activeIdx, setActiveIdx] = useState(0);

  const solutions = [
    { title: 'Easy to share', desc: 'Businesses can list surplus food in minutes.', icon: <ImageUp className="w-5 h-5" /> },
    { title: 'AI freshness check', desc: 'We use AI to ensure food quality and safety.', icon: <BrainCircuit className="w-5 h-5" /> },
    { title: 'Smart matching', desc: 'Donations are matched with the right NGO nearby.', icon: <CheckCircle className="w-5 h-5" /> },
    { title: 'Safe delivery', desc: 'Coordinated pickup ensures timely and safe handover.', icon: <PackageCheck className="w-5 h-5" /> },
    { title: 'Real impact', desc: 'Track your impact through transparent reports.', icon: <ChartNoAxesCombined className="w-5 h-5" /> }
  ];

  return (
    <section id="how-it-works" className="py-24 bg-brand-bg dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Solution Container Box */}
        <div className="bg-brand-mint dark:bg-slate-900 rounded-[40px] p-8 md:p-14 border border-brand-sage/60 dark:border-slate-800 shadow-xl">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Col */}
            <div className="lg:col-span-5 flex flex-col justify-between min-h-[380px]">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block">
                  OUR SOLUTION
                </span>
                <h2 className="text-4xl font-bold font-display text-neutralText-main dark:text-white tracking-tight leading-tight mb-4">
                  RePlate makes food redistribution simple, transparent, and effective.
                </h2>
                <a href="#how-it-works" className="inline-flex items-center gap-2 text-brand-forest dark:text-brand-sage font-bold group hover:underline mb-8">
                  See how it works
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </a>
              </div>

              {/* Dynamic Interactive Preview Mockup */}
              <div className="bg-white dark:bg-slate-950 border border-brand-border dark:border-slate-800 rounded-3xl p-6 shadow-inner h-[220px] flex flex-col justify-center overflow-hidden transition-all duration-300 relative">
                {activeIdx === 0 && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="text-xs font-bold text-brand-green">NEW LISTING</span>
                      <span className="text-2xs text-neutralText-muted">Under 2 minutes</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-8 bg-brand-mint gap-2 dark:bg-slate-900 rounded-lg flex items-center px-3 text-xs font-medium text-neutralText-main dark:text-white border border-brand-sage/40">
                        <Salad size="16" /> Veggie Salads & Bowls (15 meals)
                      </div>
                      <div className="h-8 bg-brand-mint gap-2 dark:bg-slate-900 rounded-lg flex items-center px-3 text-xs font-medium text-neutralText-main dark:text-white border border-brand-sage/40">
                        <AlarmClock size="16" /> Pick up today before 9:00 PM
                      </div>
                    </div>
                    <button className="w-full bg-brand-green text-white font-bold text-xs py-2 rounded-xl shadow-md cursor-default">
                      Submit for Analysis
                    </button>
                  </div>
                )}
                {activeIdx === 1 && (
                  <div className="flex flex-col items-center justify-center space-y-3 animate-fade-in">
                    <div className="relative w-28 h-16 bg-slate-50 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-dashed border-brand-green/50">
                      <Camera className="w-6 h-6 text-brand-green animate-pulse" />
                      <div className="absolute inset-x-0 bottom-0 bg-brand-green text-white text-[9px] text-center py-0.5">Scanning...</div>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-bold text-neutralText-main dark:text-white">AI Freshness Audit</p>
                      <p className="text-sm font-extrabold text-brand-green mt-0.5">94% Score · Safe</p>
                    </div>
                  </div>
                )}
                {activeIdx === 2 && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between text-xs border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-bold text-brand-forest dark:text-brand-sage flex items-center gap-1">
                        <Road size="16" /> Smart Route Match
                      </span>
                      <span className="text-brand-green font-bold">NGO Notified</span>
                    </div>
                    <div className="flex items-center justify-between bg-brand-mint dark:bg-slate-900 p-3 rounded-xl border border-brand-sage/30">
                      <div>
                        <p className="text-3xs text-neutralText-muted uppercase">Closest Recipient</p>
                        <p className="text-xs font-bold text-neutralText-main dark:text-white">Safe Haven Shelter</p>
                      </div>
                      <span className="text-3xs bg-brand-forest text-white px-2 py-1 rounded-full font-bold">0.6 miles</span>
                    </div>
                  </div>
                )}
                {activeIdx === 3 && (
                  <div className="space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-neutralText-main dark:text-white flex items-center gap-1">
                        <Send size="16" /> Real-time Delivery
                      </span>
                      <span className="text-brand-green font-bold flex items-center gap-1">
                        <AlarmCheck size="16" />Arriving in 14 mins
                      </span>
                    </div>
                    <div className="relative w-full h-2 bg-slate-100 dark:bg-slate-850 rounded-full overflow-hidden">
                      <div className="absolute top-0 left-0 h-full bg-brand-green rounded-full animate-pulse" style={{ width: '75%' }} />
                    </div>
                    <div className="flex justify-between text-[10px] text-neutralText-muted">
                      <span>Harvest Cafe (Pickup)</span>
                      <span>Safe Haven (Dropoff)</span>
                    </div>
                  </div>
                )}
                {activeIdx === 4 && (
                  <div className="grid grid-cols-2 gap-3 animate-fade-in">
                    <div className="bg-brand-mint dark:bg-slate-900 p-3 rounded-2xl text-center border border-brand-sage/30">
                      <p className="text-lg font-extrabold text-brand-forest dark:text-brand-sage">2,412</p>
                      <p className="text-[10px] text-neutralText-muted">Meals Saved</p>
                    </div>
                    <div className="bg-brand-mint dark:bg-slate-900 p-3 rounded-2xl text-center border border-brand-sage/30">
                      <p className="text-lg font-extrabold text-brand-forest dark:text-brand-sage">1.2 Tons</p>
                      <p className="text-[10px] text-neutralText-muted">CO₂ Reduced</p>
                    </div>
                    <div className="col-span-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-xl text-center text-[10px] text-brand-green font-bold border border-brand-sage/40">
                      ⭐ Certified Green Donor Badge Unlocked
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Grid of Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-5">
              {solutions.map((s, idx) => {
                const isActive = activeIdx === idx;
                return (
                  <div 
                    key={idx} 
                    onMouseEnter={() => setActiveIdx(idx)}
                    onClick={() => setActiveIdx(idx)}
                    className={`p-6 rounded-3xl cursor-pointer border transition-all duration-300 transform hover:-translate-y-0.5 ${
                      isActive 
                        ? 'bg-white dark:bg-slate-950 border-brand-green shadow-lg scale-[1.02]' 
                        : 'bg-white/60 dark:bg-slate-950/60 border-brand-border/60 dark:border-slate-800 hover:bg-white hover:border-brand-sage dark:hover:bg-slate-950'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center mb-4 transition-colors ${
                      isActive 
                        ? 'bg-brand-green text-white' 
                        : 'bg-brand-mint dark:bg-brand-forest/20 text-brand-green'
                    }`}>
                      {s.icon}
                    </div>
                    <h3 className="text-base font-bold text-neutralText-main dark:text-white mb-2">{s.title}</h3>
                    <p className="text-xs text-neutralText-muted dark:text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

// ─── A Global Movement Section ──────────────────────────────────
function GlobalMovement() {
  return (
    <section id="about" className="py-24 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block">
            A GLOBAL MOVEMENT
          </span>
          <h2 className="text-4xl font-bold font-display text-neutralText-main dark:text-white tracking-tight mb-6">
            Uniting businesses, NGOs, and communities to build a zero-waste future.
          </h2>
        </div>

        {/* 5-element grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          
          {/* Card 1: Restaurant packing */}
          <div className="rounded-[32px] overflow-hidden bg-brand-bg dark:bg-slate-900 border border-brand-border dark:border-slate-800 flex flex-col group hover:shadow-xl transition-all">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
              <img src={movementDonors} alt="Bakery packaging food" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutralText-main dark:text-white mb-2">From restaurants to retailers</h3>
                <p className="text-sm text-neutralText-muted dark:text-slate-400 leading-relaxed">All types of businesses can make a difference.</p>
              </div>
            </div>
          </div>

          {/* Card 2: NGO community center */}
          <div className="rounded-[32px] overflow-hidden bg-brand-bg dark:bg-slate-900 border border-brand-border dark:border-slate-800 flex flex-col group hover:shadow-xl transition-all">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
              <img src={movementNgos} alt="NGO volunteers" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutralText-main dark:text-white mb-2">NGOs & community partners</h3>
                <p className="text-sm text-neutralText-muted dark:text-slate-400 leading-relaxed">Bringing food to the people who need it most.</p>
              </div>
            </div>
          </div>

          {/* Card 3: Community outdoor table */}
          <div className="rounded-[32px] overflow-hidden bg-brand-bg dark:bg-slate-900 border border-brand-border dark:border-slate-800 flex flex-col group hover:shadow-xl transition-all">
            <div className="aspect-[4/3] overflow-hidden bg-slate-100 relative">
              <img src={movementCommunity} alt="Outdoor garden lunch" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutralText-main dark:text-white mb-2">Stronger communities together</h3>
                <p className="text-sm text-neutralText-muted dark:text-slate-400 leading-relaxed">Creating a world where no food goes to waste.</p>
              </div>
            </div>
          </div>

          {/* Card 4: Priya Shah Testimonial */}
          <div className="rounded-[32px] bg-brand-mint dark:bg-slate-900 p-8 border border-brand-sage/60 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition-all md:col-span-1 lg:col-span-1">
            <div>
              <div className="w-10 h-10 rounded-full bg-brand-forest/10 flex items-center justify-center mb-6">
                <Quote className="w-5 h-5 text-brand-forest dark:text-brand-sage fill-brand-forest" />
              </div>
              <p className="text-base font-medium text-neutralText-main dark:text-slate-200 italic leading-relaxed">
                "RePlate has transformed how we fight hunger. The platform is reliable, easy to use, and the team truly cares."
              </p>
            </div>
            <div className="flex items-center gap-3.5 mt-8 border-t border-brand-sage dark:border-slate-800 pt-6">
              <img className="w-11 h-11 rounded-full object-cover" 
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&h=100&q=80" 
                alt="Priya Shah avatar" />
              <div>
                <p className="text-sm font-bold text-neutralText-main dark:text-white">Priya Shah</p>
                <p className="text-xs text-neutralText-muted dark:text-slate-400">Founder, Hope Foundation</p>
              </div>
            </div>
          </div>

          {/* Card 5: Yellow/cream call to action card */}
          <div className="rounded-[32px] bg-accent-cream dark:bg-slate-900 p-8 border border-accent-yellow/45 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition-all md:col-span-2 lg:col-span-2 relative overflow-hidden">
            <div className="relative z-10 max-w-[440px]">
              <h3 className="text-2xl font-bold font-display text-neutralText-main dark:text-white tracking-tight mb-2">Small actions. Global impact.</h3>
              <p className="text-sm text-neutralText-sub dark:text-slate-300 leading-relaxed mt-6 mb-6">
                Your contribution can change lives and protect our planet. <br /> Join the movement to end food waste and hunger today.
              </p>
              <Link to="/sign-up" className="inline-flex items-center gap-2 bg-neutralText-main hover:bg-neutralText-main/90 dark:bg-slate-800 dark:hover:bg-slate-800/90 text-white font-bold rounded-xl px-5 py-3 text-sm shadow-md transition-all">
                Be a part of it<BadgeCheck />
              </Link>
            </div>
            {/* Minimal line/circle decoration or illustration */}
            <div className="absolute right-2 bottom-4 opacity-20 pointer-events-none transform translate-y-4">
              <HeartHandshake className="w-40 h-40 text-brand-forest" />
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

// ─── Real News Section ──────────────────────────────────────────
function NewsSection() {
  const articles = [
    {
      title: 'UN Report: 1.05 Billion Tonnes of Food Wasted in 2022',
      source: 'United Nations Environment Programme',
      desc: 'The UNEP Food Waste Index Report 2024 reveals that households and food businesses wasted over 1 billion tonnes of food, even as hundreds of millions went hungry.',
      link: 'https://www.unep.org/resources/publication/food-waste-index-report-2024',
      date: 'Mar 27, 2024'
    },
    {
      title: 'How Surplus Redistribution Curbs Greenhouse Gas Emissions',
      source: 'World Resources Institute',
      desc: 'Reducing food loss and waste is critical to tackling climate change. Feeding people instead of landfills significantly cuts methane emissions.',
      link: 'https://www.wri.org/insights/how-reduce-food-loss-and-waste',
      date: 'Jan 15, 2024'
    },
    {
      title: 'AI Technologies Help Restaurants Slash Food Loss',
      source: 'Tech Climate Journal',
      desc: 'Smart algorithms, computer vision, and real-time distribution maps are giving commercial kitchen owners the tools to reduce overproduction.',
      link: 'https://www.wri.org/research/climate-benefits-reducing-food-loss-and-waste',
      date: 'Feb 10, 2024'
    }
  ];

  return (
    <section id="news" className="py-24 bg-brand-bg dark:bg-slate-900/20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block">
            RESOURCES & NEWS
          </span>
          <h2 className="text-4xl font-bold font-display text-neutralText-main dark:text-white tracking-tight mb-6">
            Latest insights on the fight against global food waste.
          </h2>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {articles.map((art, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-brand-border dark:border-slate-800 flex flex-col justify-between hover:shadow-xl transition-all">
              <div>
                <div className="flex items-center justify-between text-xs text-neutralText-muted dark:text-slate-400 mb-4">
                  <span>{art.source}</span>
                  <span>{art.date}</span>
                </div>
                <h3 className="text-lg font-bold text-neutralText-main dark:text-white leading-snug mb-3 hover:text-brand-green transition-colors">
                  <a href={art.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1">
                    {art.title}
                    <ExternalLink className="w-3.5 h-3.5 shrink-0 inline" />
                  </a>
                </h3>
                <p className="text-sm text-neutralText-sub dark:text-slate-300 leading-relaxed mb-6">
                  {art.desc}
                </p>
              </div>
              <a href={art.link} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-brand-forest dark:text-brand-sage hover:underline flex items-center gap-1">
                Read full article
                <ChevronRight className="w-3 h-3" />
              </a>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Supported By Row ───────────────────────────────────────────
function SupportedBy() {
  return (
    <section className="py-16 bg-white dark:bg-slate-950 border-t border-brand-border dark:border-slate-800/80">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-neutralText-muted dark:text-slate-400 mb-8">
          Proudly supported by
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-65 dark:opacity-85">
          <span className="text-base font-bold text-neutralText-sub dark:text-slate-300 tracking-wider">UN Environment Programme</span>
          <span className="text-base font-bold text-neutralText-sub dark:text-slate-300 tracking-wider">The Global Foodbanking Network</span>
          <span className="text-base font-bold text-neutralText-sub dark:text-slate-300 tracking-wider">WWF</span>
          <span className="text-base font-bold text-neutralText-sub dark:text-slate-300 tracking-wider">World Resources Institute</span>
          <span className="text-base font-bold text-neutralText-sub dark:text-slate-300 tracking-wider">Feeding America</span>
          <span className="text-base font-bold text-neutralText-sub dark:text-slate-300 tracking-wider">The Rockefeller Foundation</span>
        </div>
      </div>
    </section>
  );
}

// ─── Mobile App Promotion Section ────────────────────────────────
function MobileAppSection() {
  return (
    <section className="py-24 bg-brand-mint dark:bg-slate-900/60 border-t border-b border-brand-sage/40 dark:border-slate-800 relative overflow-hidden">
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-brand-green/10 rounded-full blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Promotion and Download */}
          <div className="lg:col-span-7 space-y-6">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-green mb-3 block">
              REPLATE ON THE GO
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold font-display text-neutralText-main dark:text-white tracking-tight leading-tight">
              Get the RePlate Mobile App
            </h2>
            <p className="text-lg text-neutralText-sub dark:text-slate-300 leading-relaxed max-w-xl">
              Donors and NGOs can now coordinate food rescue faster than ever. Get push notifications for local listings, pick up food with real-time mapping, and manage your impact directly from your pocket.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <a
                href="https://github.com/mas173/RePlate/releases/download/v1.0.0/replate-android.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-[#3DDC84] hover:bg-[#32B86C] text-slate-900 font-bold rounded-2xl px-8 py-4 text-base shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                <svg className="w-6 h-6 fill-current text-slate-900" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414C17.027 15.3414 16.621 14.9374 16.621 14.4414C16.621 13.9454 17.027 13.5414 17.523 13.5414C18.019 13.5414 18.423 13.9454 18.423 14.4414C18.423 14.9374 18.019 15.3414 17.523 15.3414ZM6.477 15.3414C5.981 15.3414 5.577 14.9374 5.577 14.4414C5.577 13.9454 5.981 13.5414 6.477 13.5414C6.973 13.5414 7.377 13.9454 7.377 14.4414C7.377 14.9374 6.973 15.3414 6.477 15.3414ZM17.935 9.87336L19.789 6.64736C19.924 6.41336 19.843 6.11136 19.609 5.97636C19.375 5.84136 19.073 5.92236 18.938 6.15636L17.061 9.42136C15.61 8.76336 13.89 8.38836 12 8.38836C10.11 8.38836 8.39 8.76336 6.939 9.42136L5.062 6.15636C4.927 5.92236 4.625 5.84136 4.391 5.97636C4.157 6.11136 4.076 6.41336 4.211 6.64736L6.065 9.87336C3.011 11.5304 0.941 14.6544 0.771 18.3414H23.229C23.059 14.6544 20.989 11.5304 17.935 9.87336Z"/>
                </svg>
                Download for Android
              </a>
            </div>
          </div>

          {/* Right Column: Visual Mockup */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-64 h-[420px] bg-slate-900 rounded-[40px] border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col justify-between p-4">
              {/* Speaker / Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-slate-700 rounded-full z-20" />
              
              {/* Inside Phone Screen */}
              <div className="flex-1 bg-[#FAFBF7] rounded-[32px] overflow-hidden p-4 pt-6 flex flex-col justify-between select-none">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-brand-forest flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold">R</span>
                    </div>
                    <span className="text-xs font-bold text-neutralText-main">RePlate</span>
                  </div>
                  <span className="text-[9px] bg-brand-mint text-brand-forest font-bold px-2 py-0.5 rounded-full">Android</span>
                </div>

                {/* Dashboard Card Preview */}
                <div className="bg-white rounded-xl p-3 border border-brand-sage/40 shadow-sm space-y-2 mt-4">
                  <p className="text-[10px] text-neutralText-muted uppercase tracking-wider">Your Impact</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-brand-mint/50 p-2 rounded-lg text-center">
                      <p className="text-sm font-black text-brand-forest">420</p>
                      <p className="text-[8px] text-neutralText-sub">Meals Saved</p>
                    </div>
                    <div className="bg-brand-mint/50 p-2 rounded-lg text-center">
                      <p className="text-sm font-black text-brand-forest">180kg</p>
                      <p className="text-[8px] text-neutralText-sub">CO₂ Reduced</p>
                    </div>
                  </div>
                </div>

                {/* Notification Banner */}
                <div className="bg-brand-forest text-white rounded-xl p-3 shadow-md space-y-1 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold text-brand-sage">NEW ALERT</span>
                    <span className="text-[7px] text-brand-sage/80">Just now</span>
                  </div>
                  <p className="text-[9px] font-bold">15 Meals Available Nearby</p>
                  <p className="text-[8px] text-brand-sage/90">Harvest Cafe listed Veggie Salads.</p>
                </div>

                <div className="flex-1" />

                {/* Footer bar */}
                <div className="border-t border-slate-100 pt-2 flex justify-between items-center px-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-green" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────
function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <footer className="bg-brand-forest dark:bg-slate-950 text-white pt-20 pb-10 border-t border-white/5 dark:border-slate-900">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-16 border-b border-white/10 dark:border-slate-800">
          
          {/* Brand Info */}
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <div className="flex items-center gap-3">
              <img src={mainLogo} alt="RePlate" className="w-10 h-10 object-contain brightness-0 invert" />
              <span className="text-2xl font-bold font-display tracking-tight">RePlate</span>
            </div>
            <p className="text-sm text-brand-sage/80 dark:text-slate-400 leading-relaxed max-w-sm">
              RePlate connects surplus food from businesses with communities that need it. Because every plate matters.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-2">
              {['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'YouTube'].map((social) => (
                <a key={social} href="#" className="w-8 h-8 rounded-full bg-white/10 dark:bg-slate-900 flex items-center justify-center text-xs hover:bg-white/20 hover:text-brand-sage transition-all">
                  {social[0]}
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6">
            
            {/* Platform Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sage dark:text-slate-400 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {['How it works', 'Our impact', 'For Donors', 'For NGOs', 'Download App'].map((item) => (
                  <li key={item}>
                    {item === 'Download App' ? (
                      <a href="https://github.com/mas173/RePlate/releases/download/v1.0.0/replate-android.apk" 
                         target="_blank" 
                         rel="noopener noreferrer" 
                         className="text-sm text-brand-sage font-semibold hover:text-white transition-colors flex items-center gap-1">
                        Download App <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{item}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sage dark:text-slate-400 mb-4">Company</h4>
              <ul className="space-y-2.5">
                {['About us', 'Careers', 'Blog', 'Contact us'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support Column */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sage dark:text-slate-400 mb-4">Support</h4>
              <ul className="space-y-2.5">
                {['Help center', 'Guidelines', 'Privacy policy', 'Terms of service'].map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm text-white/70 hover:text-white transition-colors">{item}</a>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Stay Updated Newsletter Box */}
          <div className="lg:col-span-3 flex flex-col items-start gap-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-sage dark:text-slate-400">Stay updated</h4>
            <p className="text-sm text-brand-sage/80 dark:text-slate-400">Subscribe to our newsletter</p>
            
            <form onSubmit={handleSubscribe} className="flex w-full items-center gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border border-white/20 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm w-full placeholder-white/50 text-white focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
              <button 
                type="submit" 
                className="bg-brand-green hover:bg-brand-green/90 text-white font-bold rounded-xl px-4 py-2.5 text-sm transition-all shadow-md"
              >
                {subscribed ? 'Subbed!' : 'Subscribe'}
              </button>
            </form>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-sage/60 dark:text-slate-500">
            © 2026 RePlate. All rights reserved.
          </p>
          <p className="text-xs text-brand-sage/60 dark:text-slate-500 flex items-center gap-1">
            Made with <span className="text-red-550">❤️</span> for a better tomorrow.
          </p>
        </div>

      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────
export default function LandingPage() {
  const [liveStats, setLiveStats] = useState({
    totalMealsSaved: 24000000,
    totalWasteReduced: 18000000,
    activeNGOs: 1200,
    activeDonors: 15000,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await analyticsAPI.getPublicStats();
        if (data) {
          setLiveStats({
            totalMealsSaved: data.totalMealsSaved || 24000000,
            totalWasteReduced: data.totalWasteReduced || 18000000,
            activeNGOs: data.activeNGOs || 1200,
            activeDonors: data.activeDonors || 15000,
          });
        }
      } catch (err) {
        console.error('Error fetching live platform statistics:', err);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-brand-bg dark:bg-slate-950 font-sans text-neutralText-main dark:text-slate-100 antialiased selection:bg-brand-mint selection:text-brand-forest">
      <Navbar />
      <Hero />
      <StatsBar liveStats={liveStats} />
      <Problem />
      <Solution />
      <GlobalMovement />
      <NewsSection />
      <SupportedBy />
      <MobileAppSection />
      <Footer />
    </div>
  );
}
