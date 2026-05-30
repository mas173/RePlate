import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Search, RefreshCw, ChevronDown, Shield, ShieldCheck, UserX, UserCheck,
  Mail, Phone, MapPin, Building2, Calendar, MoreHorizontal, X
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { adminAPI } from '@/services/api';
import toast from 'react-hot-toast';

const ROLE_STYLES = {
  donor: { bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20', label: 'Donor' },
  ngo: { bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20', label: 'NGO' },
  admin: { bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20', label: 'Admin' },
};

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const rowVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

export default function AdminUsersPage() {
  const { getAuthToken } = useAppAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [expandedUser, setExpandedUser] = useState(null);
  const [changingRole, setChangingRole] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;
      let params = '';
      const qp = [];
      if (search.trim()) qp.push(`search=${encodeURIComponent(search.trim())}`);
      if (roleFilter !== 'all') qp.push(`role=${roleFilter}`);
      if (qp.length) params = `?${qp.join('&')}`;
      const res = await adminAPI.getUsers(token, params);
      setUsers(res.users || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleRoleChange = async (userId, newRole) => {
    setChangingRole(userId);
    try {
      const token = await getAuthToken();
      if (!token) return;
      await adminAPI.updateUserRole(token, userId, newRole);
      toast.success(`Role updated to ${newRole}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update role');
    } finally {
      setChangingRole(null);
    }
  };

  const handleToggleStatus = async (userId, currentlyActive) => {
    try {
      const token = await getAuthToken();
      if (!token) return;
      await adminAPI.toggleUserStatus(token, userId, !currentlyActive);
      toast.success(currentlyActive ? 'User deactivated' : 'User reactivated');
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, is_active: !currentlyActive } : u));
    } catch (err) {
      console.error(err);
      toast.error('Failed to update user status');
    }
  };

  const counts = {
    all: users.length,
    donor: users.filter(u => u.role === 'donor').length,
    ngo: users.filter(u => u.role === 'ngo').length,
    admin: users.filter(u => u.role === 'admin').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-500" />
              User Management
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              View, search, and manage all platform users.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="btn-secondary p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 self-start"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 dark:text-slate-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Search + Filter Bar */}
      <div className="card p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
        <div className="flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or organization..."
              className="input pl-10 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </form>
          <div className="flex gap-2">
            {['all', 'donor', 'ngo', 'admin'].map(r => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all capitalize whitespace-nowrap ${
                  roleFilter === r
                    ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/50'
                }`}
              >
                {r === 'all' ? 'All' : r} ({counts[r]})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="card h-[72px] animate-pulse bg-slate-100 dark:bg-slate-800/40 rounded-2xl" />
          ))}
        </div>
      ) : users.length > 0 ? (
        <motion.div className="space-y-2" variants={containerVariants} initial="hidden" animate="show">
          {/* Table Header */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <div className="col-span-4">User</div>
            <div className="col-span-2">Role</div>
            <div className="col-span-2">City</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          <AnimatePresence>
            {users.map((user) => {
              const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.donor;
              const displayName = user.organization_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown';
              const isExpanded = expandedUser === user.id;

              return (
                <motion.div
                  key={user.id}
                  variants={rowVariants}
                  layout
                  className="card bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 overflow-hidden"
                >
                  {/* Main Row */}
                  <div
                    className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-4 items-center px-5 py-3.5 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors"
                    onClick={() => setExpandedUser(isExpanded ? null : user.id)}
                  >
                    {/* User Info */}
                    <div className="md:col-span-4 flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {(user.first_name?.[0] || user.email?.[0] || '?').toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white truncate">{displayName}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{user.email}</p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="md:col-span-2">
                      <span className={`badge text-[10px] font-bold capitalize border ${roleStyle.bg}`}>
                        {roleStyle.label}
                      </span>
                    </div>

                    {/* City */}
                    <div className="md:col-span-2 text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user.city || '—'}
                    </div>

                    {/* Status */}
                    <div className="md:col-span-2">
                      <span className={`badge text-[10px] font-bold border ${
                        user.is_active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="md:col-span-2 flex justify-end">
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>

                  {/* Expanded Detail Panel */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Mail className="w-3.5 h-3.5 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Phone className="w-3.5 h-3.5 shrink-0" />
                              <span>{user.phone || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <MapPin className="w-3.5 h-3.5 shrink-0" />
                              <span>{[user.city, user.state].filter(Boolean).join(', ') || 'Not provided'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                              <Calendar className="w-3.5 h-3.5 shrink-0" />
                              <span>Joined {new Date(user.created_at).toLocaleDateString()}</span>
                            </div>
                            {user.organization_type && (
                              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Building2 className="w-3.5 h-3.5 shrink-0" />
                                <span className="capitalize">{user.organization_type}</span>
                              </div>
                            )}
                          </div>

                          {/* Action Buttons */}
                          <div className="flex flex-wrap gap-2.5 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                            {/* Role changer */}
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mr-1">Change Role:</span>
                              {['donor', 'ngo', 'admin'].map(r => (
                                <button
                                  key={r}
                                  disabled={user.role === r || changingRole === user.id}
                                  onClick={(e) => { e.stopPropagation(); handleRoleChange(user.id, r); }}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-bold capitalize border transition-all ${
                                    user.role === r
                                      ? 'bg-purple-500 text-white border-purple-500 cursor-default'
                                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-300 dark:hover:border-purple-700'
                                  }`}
                                >
                                  {changingRole === user.id ? '...' : r}
                                </button>
                              ))}
                            </div>

                            {/* Status toggle */}
                            <button
                              onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id, user.is_active); }}
                              className={`px-3 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                                user.is_active
                                  ? 'text-red-500 border-red-200 dark:border-red-800/40 hover:bg-red-50 dark:hover:bg-red-900/20'
                                  : 'text-emerald-500 border-emerald-200 dark:border-emerald-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              }`}
                            >
                              {user.is_active ? <><UserX className="w-3 h-3" /> Deactivate</> : <><UserCheck className="w-3 h-3" /> Reactivate</>}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="card py-16 px-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/20 max-w-lg mx-auto rounded-3xl">
          <Users className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No Users Found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {search ? 'No users match your search criteria.' : 'No users registered on the platform yet.'}
          </p>
        </div>
      )}
    </div>
  );
}
