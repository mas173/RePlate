import { Link } from 'react-router-dom';
import { Leaf, Upload, Brain, Handshake, BarChart3, ArrowRight } from 'lucide-react';

const stats = [
  { label: 'Food Wasted Globally', value: '1.3B tons/yr' },
  { label: 'People Going Hungry', value: '828M+' },
  { label: 'CO₂ from Food Waste', value: '8-10%' },
];

const features = [
  {
    icon: Upload,
    title: 'Donate Surplus Food',
    desc: 'Restaurants, hotels & stores upload surplus food with photos and details.',
  },
  {
    icon: Brain,
    title: 'AI Freshness Analysis',
    desc: 'Gemini AI analyzes food images to assess freshness and urgency.',
  },
  {
    icon: Handshake,
    title: 'NGO Matching',
    desc: 'NGOs and shelters claim available food and arrange pickup.',
  },
  {
    icon: BarChart3,
    title: 'Track Impact',
    desc: 'See meals saved, CO₂ reduced, and your environmental contribution.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Leaf className="w-7 h-7 text-primary-600" />
          <span className="text-xl font-bold font-display text-surface-900 dark:text-white">
            RePlate
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/sign-in" className="btn-ghost text-sm">Sign In</Link>
          <Link to="/sign-up" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-sm font-medium mb-6">
          <Leaf className="w-4 h-4" />
          AI-Powered Food Waste Reduction
        </div>
        <h1 className="text-4xl md:text-5xl font-bold font-display text-surface-900 dark:text-white leading-tight mb-4">
          Redistribute Surplus Food.{' '}
          <span className="text-gradient">Save the Planet.</span>
        </h1>
        <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto mb-8">
          RePlate connects restaurants, hotels, and grocery stores with NGOs and shelters
          to redistribute surplus food before it expires — powered by AI.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/sign-up" className="btn-primary px-6 py-3">
            Start Donating <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/sign-up" className="btn-secondary px-6 py-3">
            Join as NGO
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="glass-card p-5 text-center">
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <h2 className="text-2xl font-bold font-display text-center text-surface-900 dark:text-white mb-10">
          How It Works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((f) => (
            <div key={f.title} className="glass-card p-6 flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center shrink-0">
                <f.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{f.title}</h3>
                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-800 py-6 text-center text-sm text-surface-400">
        © 2026 RePlate — Built for a sustainable future 🌿
      </footer>
    </div>
  );
}
