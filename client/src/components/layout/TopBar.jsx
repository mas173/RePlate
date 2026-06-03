import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useClerk, SignedIn, SignedOut } from '@clerk/clerk-react';
import {
  Bell, Search, Sun, Moon, ChevronDown,
  LogOut, Settings, User, Menu
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import mainLogo from '@/assets/images/mainLogo.png';

function NotificationBell() {
  const { getAuthToken, isSignedIn } = useAppAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!isSignedIn) return;

    let cancelled = false;

    const fetchCount = async () => {
      try {
        const token = await getAuthToken();
        if (!token || cancelled) return;
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/notifications/unread-count`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setUnread(data.unreadCount || 0);
        }
      } catch {
        // Silently fail — bell is non-critical
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [isSignedIn]);

  return (
    <Link
      to="/notifications"
      className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
    >
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-orange-500 text-white text-[10px] font-bold ring-2 ring-white dark:ring-slate-900 px-1">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}

function ProfileDropdown({ onSidebarToggle }) {
  const { fullName, email, avatar, role } = useAppAuth();
  const { signOut } = useClerk();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const initials = fullName ? fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : 'U';

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        {avatar
          ? <img src={avatar} alt={fullName} className="w-7 h-7 rounded-lg object-cover" />
          : <div className="w-7 h-7 rounded-lg bg-primary-500 flex items-center justify-center text-white text-xs font-bold">{initials}</div>
        }
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-tight">{fullName || 'User'}</p>
          <p className="text-xs text-slate-400 capitalize">{role}</p>
        </div>
        <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 card shadow-elevated py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700 mb-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{email}</p>
            <span className="badge bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-400 text-2xs capitalize">{role}</span>
          </div>
          <Link to="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <User className="w-4 h-4" /> Profile
          </Link>
          <Link to="/settings" onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Settings className="w-4 h-4" /> Settings
          </Link>
          <div className="border-t border-slate-100 dark:border-slate-700 mt-1 pt-1">
            <button onClick={() => signOut()}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 w-full transition-colors">
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TopBar({ onSidebarToggle }) {
  const { isDark, toggle } = useDarkMode();

  return (
    <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700/60 flex items-center px-4 gap-3 sticky top-0 z-40">
      {/* Sidebar toggle (mobile) */}
      <button onClick={onSidebarToggle}
        className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
        <Menu className="w-5 h-5" />
      </button>

      {/* Logo (mobile only) */}
      <Link to="/" className="lg:hidden flex items-center gap-2 font-bold text-lg text-slate-900 dark:text-white">
        <img src={mainLogo} alt="RePlate" className="w-7 h-7 object-contain" />
        Re<span className="text-primary-500">Plate</span>
      </Link>

      {/* Search */}
      <div className="hidden sm:flex flex-1 max-w-sm">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search donations…"
            className="input pl-9 py-2 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-1">
        {/* Dark mode toggle */}
        <button onClick={toggle}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <NotificationBell />

        {/* Profile */}
        <SignedIn>
          <div className="ml-1">
            <ProfileDropdown />
          </div>
        </SignedIn>
        <SignedOut>
          <Link to="/sign-in" className="btn-primary py-2 px-4 text-sm ml-1">Sign in</Link>
        </SignedOut>
      </div>
    </header>
  );
}
