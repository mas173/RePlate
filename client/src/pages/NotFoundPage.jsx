import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';
import mainLogo from '@/assets/images/mainLogo.png';
import nameLogo from '@/assets/images/name.png';

export default function NotFoundPage() {
  // Stagger children transition
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 80, damping: 15 }
    }
  };

  const floatingVariants = {
    animate: {
      y: [0, -12, 0],
      rotate: [0, 2, -2, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative overflow-hidden font-sans">
      
      {/* Background ambient glows */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='currentColor'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")" }} />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[400px] bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto px-6 h-20 w-full flex items-center justify-between relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={mainLogo} alt="RePlate Logo" className="w-9 h-9 object-contain" />
          <img src={nameLogo} alt="RePlate" className="h-7 object-contain dark:brightness-0 dark:invert" />
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center max-w-xl flex flex-col items-center"
        >
          {/* Animated 3D-like Plate Illustration */}
          <motion.div
            variants={floatingVariants}
            animate="animate"
            className="relative mb-8 flex items-center justify-center"
          >
            {/* Ambient shadow glow under plate */}
            <div className="absolute bottom-0 w-36 h-4 bg-slate-900/15 dark:bg-black/40 rounded-full blur-md" />

            {/* The Plate SVG (Thematic 404 representation) */}
            <svg 
              width="200" 
              height="200" 
              viewBox="0 0 200 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="drop-shadow-2xl filter"
            >
              {/* Outer Rim of the Plate */}
              <circle cx="100" cy="100" r="85" fill="url(#plateRimGrad)" stroke="url(#plateRimStroke)" strokeWidth="3" />
              {/* Inner Base of the Plate */}
              <circle cx="100" cy="100" r="60" fill="url(#plateInnerGrad)" stroke="url(#plateInnerStroke)" strokeWidth="1" />
              
              {/* Leaf in the center (RePlate Logo branding element) */}
              <path 
                d="M100 68C83.5 68 76 83.5 76 100C76 116.5 83.5 132 100 132C116.5 132 124 116.5 124 100C124 83.5 116.5 68 100 68Z" 
                fill="#10b981" 
                fillOpacity="0.08"
              />
              <path 
                d="M100 75C88 85 88 115 100 125C112 115 112 85 100 75Z" 
                fill="url(#leafGrad)" 
              />
              <path 
                d="M100 75V125" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                strokeDasharray="2 3"
                opacity="0.8"
              />

              {/* Decorative sparkles indicating clean empty plate */}
              <circle cx="62" cy="65" r="3" fill="#34d399" opacity="0.6" />
              <circle cx="140" cy="135" r="4" fill="#60a5fa" opacity="0.5" />
              <circle cx="145" cy="60" r="2.5" fill="#f43f5e" opacity="0.6" />

              {/* Gradients definitions */}
              <defs>
                <linearGradient id="plateRimGrad" x1="15" y1="15" x2="185" y2="185" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" className="dark:stop-color-slate-800" />
                  <stop offset="1" stopColor="#e2e8f0" className="dark:stop-color-slate-900" />
                </linearGradient>
                <linearGradient id="plateRimStroke" x1="15" y1="15" x2="185" y2="185" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#cbd5e1" className="dark:stop-color-slate-700" />
                  <stop offset="1" stopColor="#94a3b8" className="dark:stop-color-slate-800" />
                </linearGradient>
                <linearGradient id="plateInnerGrad" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f8fafc" className="dark:stop-color-slate-850" />
                  <stop offset="1" stopColor="#cbd5e1" className="dark:stop-color-slate-900" />
                </linearGradient>
                <linearGradient id="plateInnerStroke" x1="40" y1="40" x2="160" y2="160" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#e2e8f0" className="dark:stop-color-slate-800" strokeOpacity="0.4" />
                  <stop offset="1" stopColor="#cbd5e1" className="dark:stop-color-slate-750" strokeOpacity="0.4" />
                </linearGradient>
                <linearGradient id="leafGrad" x1="88" y1="75" x2="112" y2="125" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#34d399" />
                  <stop offset="1" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>
          </motion.div>

          {/* Large 404 heading with vibrant gradient styling */}
          <motion.h1 
            variants={itemVariants}
            className="text-7xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-emerald-500 to-teal-500 tracking-tight"
          >
            404
          </motion.h1>

          {/* Subtitle */}
          <motion.h2 
            variants={itemVariants}
            className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-white mt-4"
          >
            This plate is empty.
          </motion.h2>

          {/* Descriptive text */}
          <motion.p 
            variants={itemVariants}
            className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2.5 max-w-sm sm:max-w-md leading-relaxed"
          >
            The page you are looking for has either been moved, deleted, or never existed in our donation network.
          </motion.p>

          {/* Navigation Action Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-3 mt-8 w-full sm:w-auto"
          >
            <Link 
              to="/" 
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-teal-500 hover:from-primary-600 hover:to-teal-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200"
            >
              <Home className="w-4 h-4" />
              Go Back Home
            </Link>
            
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-semibold text-sm transition-all duration-200 border border-slate-200/40 dark:border-slate-700/60"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Previous
            </button>
          </motion.div>

        </motion.div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 h-16 w-full flex items-center justify-center relative z-10">
        <p className="text-xs text-slate-400 dark:text-slate-600">
          © 2026 RePlate · Intelligently fighting food waste 🌿
        </p>
      </footer>

    </div>
  );
}
