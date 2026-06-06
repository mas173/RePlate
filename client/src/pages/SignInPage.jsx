import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SignIn } from '@clerk/clerk-react';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import mainLogo from '@/assets/images/mainLogo.png';
import nameLogo from '@/assets/images/name.png';
import mottoImg from '@/assets/images/motto.png';

/* ── Brand panel (left side) ─────────────── */
function BrandPanel() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  };

  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full p-10 bg-gradient-to-br from-slate-900 via-primary-950 to-teal-950 overflow-hidden border-r border-slate-800">
      {/* Background patterns and glowing ambient lights */}
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")" }} />
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.25, 0.15]
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-24 -right-24 w-96 h-96 bg-teal-500 rounded-full blur-3xl"
      />
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
        className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500 rounded-full blur-3xl"
      />

      {/* Top Header Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col gap-1"
      >
        <div className="flex items-center gap-3">
          <img src={mainLogo} alt="RePlate" className="w-12 h-12 object-contain drop-shadow-lg" />
          <img src={nameLogo} alt="RePlate" className="h-9 object-contain brightness-0 invert" />
        </div>
        <img src={mottoImg} alt="Reduce Waste. Feed More." className="h-5 object-contain brightness-0 invert opacity-75 ml-1" />
      </motion.div>

      {/* Body Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 space-y-8"
      >
        <motion.div variants={itemVariants}>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-3">
            Every meal matters.<br />Every action counts.
          </h2>
          <p className="text-slate-50 text-sm leading-relaxed">
            Join thousands of restaurants, hotels, and NGOs working together to eliminate food waste and fight hunger.
          </p>
        </motion.div>

        {/* Benefits list */}
        <motion.ul variants={itemVariants} className="space-y-3.5">
          {[
            'Connect with verified NGOs & shelters',
            'AI-powered food freshness analysis',
            'Real-time impact tracking',
            'Secure role-based access'
          ].map(p => (
            <li key={p} className="flex items-center gap-3 group">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{p}</span>
            </li>
          ))}
        </motion.ul>

        {/* Impact stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
          {[
            { v: '2,400+', l: 'Meals saved' },
            { v: '180+', l: 'Donors' },
            { v: '34', l: 'NGO partners' }
          ].map(s => (
            <div key={s.l} className="bg-white/5 rounded-2xl p-3.5 text-center border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all duration-300">
              <p className="font-extrabold text-white text-lg tracking-tight">{s.v}</p>
              <p className="text-slate-400 text-2xs font-semibold uppercase tracking-wider mt-0.5">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Footer Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 text-slate-200 text-xs"
      >
        © 2026 RePlate · Built for a sustainable future 🌿
      </motion.p>
    </div>
  );
}

/* ── Clerk appearance — hides default chrome ─ */
/**
 * Returns Clerk appearance config that adapts to light/dark mode.
 */
function getClerkAppearance(isDark) {
  return {
    elements: {
      rootBox: 'w-full',
      cardBox: 'shadow-none w-full p-4',
      card: 'shadow-none !p-0 !bg-transparent !border-0 w-full !gap-4',
      // Hide Clerk's own header — we show our own
      header: 'hidden',
      headerTitle: 'hidden',
      headerSubtitle: 'hidden',
      // Social buttons
      socialButtonsBlockButton:
        'w-full border border-slate-200 dark:border-slate-800 !rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors text-slate-700 dark:text-slate-300 font-medium !py-2.5',
      socialButtonsBlockButtonText: 'text-sm font-medium',
      socialButtonsProviderIcon: 'w-5 h-5',
      // Divider
      dividerLine: 'bg-slate-200 dark:bg-slate-800',
      dividerText: 'text-slate-400 text-xs',
      // Form fields
      formFieldInput:
        '!rounded-xl !border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-800 text-slate-900 dark:text-white focus:!ring-2 focus:!ring-primary-500 focus:!border-primary-500 !py-2.5 transition-shadow',
      formFieldLabel: 'text-slate-700 dark:text-slate-300 text-sm font-semibold',
      formFieldHintText: 'text-slate-400 text-xs',
      // Primary button
      formButtonPrimary:
        '!bg-primary-500 hover:!bg-primary-600 !rounded-xl font-bold text-sm transition-all !shadow-md hover:!shadow-lg !py-2.5 border-none cursor-pointer',
      // Footer / links
      footerAction: 'hidden',
      footerActionLink: 'hidden',
      footer: 'hidden',
      // OTP / verification
      formResendCodeLink: 'text-primary-600 dark:text-primary-400 font-semibold',
      otpCodeFieldInput: '!rounded-lg !border-slate-200 dark:!border-slate-700',
      identityPreview: '!rounded-xl',
      identityPreviewEditButton: 'text-primary-600 font-semibold',
      // Alerts
      alert: '!rounded-xl border border-red-200/50 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400',
      alertText: 'text-sm font-medium',
    },
    variables: {
      colorPrimary: '#10b981',
      colorBackground: 'transparent',
      colorText: isDark ? '#f1f5f9' : '#111827',
      colorTextSecondary: isDark ? '#94a3b8' : '#6b7280',
      colorInputBackground: isDark ? '#1e293b' : '#ffffff',
      colorInputText: isDark ? '#f1f5f9' : '#111827',
      borderRadius: '0.75rem',
      fontFamily: 'Outfit, Inter, system-ui, sans-serif',
    },
  };
}

/* ── Sign In Page ────────────────────────── */
export default function SignInPage() {
  // Detect dark mode reactively by watching the <html> class
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Left brand panel */}
      <div className="lg:w-[460px] xl:w-[500px] shrink-0">
        <BrandPanel />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-12 overflow-y-auto relative">
        {/* Subtle background ambient glows on right panel */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 dark:bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/3 w-96 h-96 bg-teal-500/5 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] p-6 sm:p-8 rounded-3xl bg-white/70 dark:bg-slate-900/55 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/60 shadow-xl relative overflow-hidden"
        >
          {/* Inner glows */}
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-primary-500/10 dark:bg-primary-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-teal-500/10 dark:bg-teal-500/20 rounded-full blur-2xl pointer-events-none" />

          {/* Redirection button to home page */}
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-primary-500 dark:text-slate-400 dark:hover:text-primary-400 transition-colors mb-6 group relative z-10"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-1 mb-8">
            <div className="flex items-center gap-2.5">
              <img src={mainLogo} alt="" className="w-12 h-12 object-contain" />
              <img src={nameLogo} alt="RePlate" className="h-8 object-contain dark:brightness-0 dark:invert" />
            </div>
            <img src={mottoImg} alt="Reduce Waste. Feed More." className="h-4 object-contain opacity-60 dark:brightness-0 dark:invert" />
          </div>

          {/* Our custom header */}
          <div className="mb-6 relative z-10">
            <div className="hidden lg:flex items-center gap-2.5 mb-4">
              <img src={mainLogo} alt="" className="w-8 h-8 object-contain" />
              <img src={nameLogo} alt="RePlate" className="h-6 object-contain dark:brightness-0 dark:invert" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-normal">Sign in to your RePlate account to continue.</p>
          </div>

          {/* Clerk form */}
          <div className="relative  z-10">
            <SignIn
              routing="path"
              path="/sign-in"
              signUpUrl="/sign-up"
              forceRedirectUrl="/dashboard"
              appearance={getClerkAppearance(isDark)}
            />
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6 relative z-10">
            Don't have an account?{' '}
            <Link to="/sign-up" className="text-primary-600 dark:text-primary-400 font-bold hover:underline">
              Sign up free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

