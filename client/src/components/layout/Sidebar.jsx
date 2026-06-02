import { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard, Package, ClipboardCheck, BarChart3,
  Bell, Settings, Search, Users, PlusCircle, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { cn } from '@/utils/helpers';
import mainLogo from '@/assets/images/mainLogo.png';

const DONOR_NAV = [
  { label: 'Dashboard',    path: '/dashboard',     icon: LayoutDashboard },
  { label: 'My Donations', path: '/donations',     icon: Package },
  { label: 'Donate Food',  path: '/donate',        icon: PlusCircle },
  { label: 'Analytics',    path: '/analytics',     icon: BarChart3 },
  { label: 'Notifications',path: '/notifications', icon: Bell },
  { label: 'Settings',     path: '/settings',      icon: Settings },
];

const NGO_NAV = [
  { label: 'Dashboard',     path: '/dashboard',     icon: LayoutDashboard },
  { label: 'Find Food',     path: '/available',     icon: Search },
  { label: 'My Claims',     path: '/claims',        icon: ClipboardCheck },
  { label: 'Analytics',     path: '/analytics',     icon: BarChart3 },
  { label: 'Notifications', path: '/notifications', icon: Bell },
  { label: 'Settings',      path: '/settings',      icon: Settings },
];

const ADMIN_NAV = [
  { label: 'Dashboard',     path: '/admin',              icon: LayoutDashboard },
  { label: 'Users',         path: '/admin/users',        icon: Users },
  { label: 'Donations',     path: '/admin/donations',    icon: Package },
  { label: 'Analytics',     path: '/admin/analytics',    icon: BarChart3 },
  { label: 'Notifications', path: '/notifications',      icon: Bell },
  { label: 'Settings',      path: '/settings',           icon: Settings },
];

function NavItems({ items, collapsed }) {
  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {items.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => cn(
            'sidebar-link',
            isActive && 'active',
            collapsed && 'justify-center px-2'
          )}
          title={collapsed ? label : undefined}
        >
          <Icon className="w-4.5 h-4.5 shrink-0" />
          {!collapsed && <span className="truncate">{label}</span>}
        </NavLink>
      ))}
    </nav>
  );
}

export default function Sidebar({ mobileOpen, onMobileClose }) {
  const [collapsed, setCollapsed] = useState(false);
  const { role } = useAppAuth();

  const navItems = role === 'admin' ? ADMIN_NAV : role === 'ngo' ? NGO_NAV : DONOR_NAV;

  const sidebarBody = (
    <div className={cn(
      'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700/60 transition-all duration-300',
      collapsed ? 'w-[64px]' : 'w-[240px]'
    )}>
      {/* Logo */}
      <div className={cn('flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700/60 shrink-0', collapsed && 'justify-center px-2')}>
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg text-slate-900 dark:text-white">
          <img src={mainLogo} alt="RePlate" className="w-8 h-8 object-contain shrink-0" />
          {!collapsed && <span>Re<span className="text-primary-500">Plate</span></span>}
        </Link>

        {/* Mobile close */}
        {onMobileClose && !collapsed && (
          <button onClick={onMobileClose} className="lg:hidden ml-auto p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700/60">
          <span className={cn(
            'badge text-xs capitalize',
            role === 'admin' ? 'bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-400' :
            role === 'ngo'   ? 'bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-400' :
                               'bg-primary-50 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400'
          )}>
            {role} panel
          </span>
        </div>
      )}

      {/* Navigation */}
      <NavItems items={navItems} collapsed={collapsed} />

      {/* Collapse toggle (desktop only) */}
      <div className="hidden lg:flex px-3 pb-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2 text-xs text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors',
            collapsed ? 'justify-center w-full' : ''
          )}
        >
          {collapsed
            ? <ChevronRight className="w-4 h-4" />
            : <><ChevronLeft className="w-4 h-4" /><span>Collapse</span></>
          }
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex shrink-0 h-screen sticky top-0">
        {sidebarBody}
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="lg:hidden fixed left-0 top-0 h-full z-50 animate-slide-in-right">
            {sidebarBody}
          </aside>
        </>
      )}
    </>
  );
}
