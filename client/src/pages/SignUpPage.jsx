import { Link } from 'react-router-dom';
import { SignUp } from '@clerk/clerk-react';
import { CheckCircle } from 'lucide-react';
import mainLogo from '@/assets/images/mainLogo.png';
import nameLogo from '@/assets/images/name.png';
import mottoImg from '@/assets/images/motto.png';

/* ── Brand panel (left side) ─────────────── */
function BrandPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full p-10 bg-gradient-to-br from-primary-800 via-primary-700 to-teal-700 overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='white'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")" }} />
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-400 rounded-full blur-3xl opacity-20" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-primary-400 rounded-full blur-3xl opacity-20" />

      {/* Logo */}
      <div className="relative z-10 flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <img src={mainLogo} alt="RePlate" className="w-12 h-12 object-contain drop-shadow-lg" />
          <img src={nameLogo} alt="RePlate" className="h-9 object-contain brightness-0 invert" />
        </div>
        <img src={mottoImg} alt="Reduce Waste. Feed More." className="h-5 object-contain brightness-0 invert opacity-75 ml-1" />
      </div>

      {/* Body */}
      <div className="relative z-10 space-y-8">
        <div>
          <h2 className="text-3xl font-bold text-white leading-tight mb-3">
            Join the movement.<br />Make a difference.
          </h2>
          <p className="text-primary-100 text-sm leading-relaxed">
            Create your free account and start redistributing surplus food to those who need it most.
          </p>
        </div>

        <ul className="space-y-3">
          {[
            'Free forever — no credit card needed',
            'Takes less than 2 minutes to set up',
            'Connect with verified NGOs & shelters',
            'AI-powered food freshness analysis',
          ].map(p => (
            <li key={p} className="flex items-center gap-3">
              <CheckCircle className="w-4 h-4 text-teal-300 shrink-0" />
              <span className="text-sm text-primary-100">{p}</span>
            </li>
          ))}
        </ul>

        <div className="grid grid-cols-3 gap-3">
          {[{ v: 'Free', l: 'Always free' }, { v: '< 2min', l: 'Quick setup' }, { v: '100%', l: 'Secure' }].map(s => (
            <div key={s.l} className="bg-white/10 rounded-xl p-3 text-center border border-white/10 backdrop-blur-sm">
              <p className="font-bold text-white text-base">{s.v}</p>
              <p className="text-primary-200 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </div>

      <p className="relative z-10 text-primary-300 text-xs">© 2026 RePlate · Built for a sustainable future 🌿</p>
    </div>
  );
}

/* ── Shared Clerk appearance config ──────── */
const clerkAppearance = {
  elements: {
    rootBox: 'w-full',
    cardBox: 'shadow-none w-full',
    card: 'shadow-none !p-0 !bg-transparent !border-0 w-full !gap-4',
    // Hide Clerk's own header — we show our own
    header: 'hidden',
    headerTitle: 'hidden',
    headerSubtitle: 'hidden',
    // Social buttons
    socialButtonsBlockButton:
      'w-full border border-slate-200 dark:border-slate-700 !rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-300 font-medium !py-2.5',
    socialButtonsBlockButtonText: 'text-sm font-medium',
    socialButtonsProviderIcon: 'w-5 h-5',
    // Divider
    dividerLine: 'bg-slate-200 dark:bg-slate-700',
    dividerText: 'text-slate-400 text-xs',
    // Form fields
    formFieldInput:
      '!rounded-xl !border-slate-300 dark:!border-slate-600 !bg-white dark:!bg-slate-800 text-slate-900 dark:text-white focus:!ring-2 focus:!ring-primary-500 focus:!border-primary-500 !py-2.5',
    formFieldLabel: 'text-slate-700 dark:text-slate-300 text-sm font-medium',
    formFieldHintText: 'text-slate-400 text-xs',
    formFieldRow: 'flex gap-3 [&>div]:flex-1',
    // Primary button
    formButtonPrimary:
      '!bg-primary-500 hover:!bg-primary-600 !rounded-xl font-semibold text-sm transition-colors !shadow-none !py-2.5',
    // Footer / links
    footerAction: 'hidden',
    footerActionLink: 'hidden',
    footer: 'hidden',
    // OTP / verification
    formResendCodeLink: 'text-primary-600 dark:text-primary-400 font-medium',
    otpCodeFieldInput: '!rounded-lg !border-slate-300 dark:!border-slate-600',
    identityPreview: '!rounded-xl',
    identityPreviewEditButton: 'text-primary-600',
    // Alerts
    alert: '!rounded-xl',
    alertText: 'text-sm',
  },
  variables: {
    colorPrimary: '#10b981',
    colorBackground: 'transparent',
    colorText: '#111827',
    colorTextSecondary: '#6b7280',
    colorInputBackground: '#ffffff',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};

/* ── Sign Up Page ────────────────────────── */
export default function SignUpPage() {
  return (
    <div className="min-h-screen flex bg-[#F9FAFB] dark:bg-[#0F172A]">
      {/* Left brand panel */}
      <div className="lg:w-[460px] xl:w-[500px] shrink-0">
        <BrandPanel />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px]">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-1 mb-8">
            <div className="flex items-center gap-2.5">
              <img src={mainLogo} alt="" className="w-12 h-12 object-contain" />
              <img src={nameLogo} alt="RePlate" className="h-8 object-contain" />
            </div>
            <img src={mottoImg} alt="Reduce Waste. Feed More." className="h-4 object-contain opacity-60" />
          </div>

          {/* Our custom header */}
          <div className="mb-6">
            <div className="hidden lg:flex items-center gap-2 mb-5">
              <img src={mainLogo} alt="" className="w-8 h-8 object-contain" />
              <img src={nameLogo} alt="RePlate" className="h-6 object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create your account</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Join RePlate and start making a difference today.</p>
          </div>

          {/* Clerk handles everything: form, CAPTCHA, Google OAuth, email verification */}
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
            forceRedirectUrl="/dashboard"
            appearance={clerkAppearance}
          />

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/sign-in" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
