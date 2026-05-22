import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import { Eye, EyeOff, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import mainLogo from '@/assets/images/mainLogo.png';
import nameLogo from '@/assets/images/name.png';
import mottoImg from '@/assets/images/motto.png';

function GoogleIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

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
            Create your free account and start redistributing surplus food to those who need it most. Role setup takes 30 seconds after sign-up.
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

/* ── Email verification step ─────────────── */
function VerifyStep({ signUp, setActive, onError }) {
  const [code, setCode]       = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleVerify(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/onboarding'); // → Phase 1.9: role selection
      }
    } catch (err) {
      onError(err.errors?.[0]?.longMessage || 'Invalid code. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Check your email</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          We sent a 6-digit verification code to your email address. Enter it below to verify your account.
        </p>
      </div>
      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
            Verification code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="input text-center text-2xl tracking-[0.5em] font-bold"
            autoFocus
          />
        </div>
        <button type="submit" disabled={loading || code.length < 6} className="btn-primary w-full py-3 text-sm">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying…</>
            : 'Verify & Continue'
          }
        </button>
      </form>
      <p className="text-center text-xs text-slate-400">
        Didn't receive it?{' '}
        <button type="button"
          onClick={() => signUp.prepareEmailAddressVerification({ strategy: 'email_code' })}
          className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          Resend code
        </button>
      </p>
    </div>
  );
}

/* ── Sign Up Page ────────────────────────── */
export default function SignUpPage() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const navigate = useNavigate();

  const [step, setStep]           = useState('form');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!isLoaded) return;
    setLoading(true);
    setError('');
    try {
      await signUp.create({ firstName, lastName, emailAddress: email, password });
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setStep('verify');
    } catch (err) {
      setError(err.errors?.[0]?.longMessage || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    if (!isLoaded) return;
    try {
      await signUp.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/onboarding',
      });
    } catch {
      setError('Google sign-up failed. Please try again.');
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F9FAFB] dark:bg-[#0F172A]">
      {/* Left brand panel */}
      <div className="lg:w-[460px] xl:w-[500px] shrink-0">
        <BrandPanel />
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-[400px] animate-fade-in-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center gap-1 mb-8">
            <div className="flex items-center gap-2.5">
              <img src={mainLogo} alt="" className="w-12 h-12 object-contain" />
              <img src={nameLogo} alt="RePlate" className="h-8 object-contain" />
            </div>
            <img src={mottoImg} alt="Reduce Waste. Feed More." className="h-4 object-contain opacity-60" />
          </div>

          {step === 'verify' ? (
            <VerifyStep signUp={signUp} setActive={setActive} onError={setError} />
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Create your account</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                Join RePlate and start making a difference today.
              </p>

              {/* Google */}
              <button onClick={handleGoogle} type="button"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-sm mb-5">
                <GoogleIcon />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
                <span className="text-xs text-slate-400">or sign up with email</span>
                <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
              </div>

              {error && (
                <div className="mb-4 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">First name</label>
                    <input id="signup-fname" type="text" required value={firstName}
                      onChange={e => setFirstName(e.target.value)} placeholder="John" className="input" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Last name</label>
                    <input id="signup-lname" type="text" required value={lastName}
                      onChange={e => setLastName(e.target.value)} placeholder="Doe" className="input" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Email address</label>
                  <input id="signup-email" type="email" autoComplete="email" required value={email}
                    onChange={e => setEmail(e.target.value)} placeholder="you@company.com" className="input" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Password</label>
                  <div className="relative">
                    <input id="signup-password" type={showPw ? 'text' : 'password'}
                      autoComplete="new-password" required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 8 characters" className="input pr-11" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-sm gap-2 mt-2">
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</>
                    : <>Create account <ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </form>

              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Already have an account?{' '}
                <Link to="/sign-in" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
