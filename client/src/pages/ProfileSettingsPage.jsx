import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Building2, Bell, Shield, Moon, Sun, Save, RefreshCw,
  Mail, Phone, MapPin, Loader2, Sparkles
} from 'lucide-react';
import { useAppAuth } from '@/hooks/useAppAuth';
import { useDarkMode } from '@/hooks/useDarkMode';
import { userAPI } from '@/services/api';
import toast from 'react-hot-toast';

const ORG_TYPES = [
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'grocery', label: 'Grocery Store' },
  { value: 'ngo', label: 'NGO / Non-Profit' },
  { value: 'shelter', label: 'Homeless Shelter' },
  { value: 'other', label: 'Other Organization' },
];

export default function ProfileSettingsPage() {
  const { getAuthToken, role, email } = useAppAuth();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    organization_name: '',
    organization_type: 'restaurant',
    organization_address: '',
    city: '',
    state: '',
    pincode: '',
    latitude: '',
    longitude: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    expiry_alerts: true,
  });

  const fetchProfileAndSettings = async () => {
    setLoading(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      const [profileRes, settingsRes] = await Promise.all([
        userAPI.getProfile(token),
        userAPI.getSettings(token),
      ]);

      if (profileRes && profileRes.profile) {
        const p = profileRes.profile;
        setProfileForm({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          phone: p.phone || '',
          organization_name: p.organization_name || '',
          organization_type: p.organization_type || 'restaurant',
          organization_address: p.organization_address || '',
          city: p.city || '',
          state: p.state || '',
          pincode: p.pincode || '',
          latitude: p.latitude != null ? String(p.latitude) : '',
          longitude: p.longitude != null ? String(p.longitude) : '',
        });
      }

      if (settingsRes && settingsRes.settings) {
        setNotificationSettings({
          email: settingsRes.settings.email !== false,
          push: settingsRes.settings.push !== false,
          expiry_alerts: settingsRes.settings.expiry_alerts !== false,
        });
      }
    } catch (err) {
      console.error('Failed to load profile data:', err);
      toast.error('Failed to sync profile settings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileAndSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name) => {
    setNotificationSettings(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      await userAPI.updateProfile(token, profileForm);
      toast.success('Profile settings updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile changes');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = await getAuthToken();
      if (!token) return;

      await userAPI.updateSettings(token, {
        notification_preferences: notificationSettings,
      });
      toast.success('App notification preferences saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save notification settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile Info', icon: User },
    { id: 'organization', label: 'Organization & Address', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'App Preferences', icon: Shield },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile & Settings</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal profile, organization setup, and notification preferences.
        </p>
      </div>

      {loading ? (
        <div className="card py-20 flex flex-col items-center justify-center bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 font-medium">Fetching settings...</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-6">
          {/* Tab Navigation Sidebar */}
          <div className="md:col-span-4 space-y-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                  activeTab === id
                    ? 'bg-primary-500 border-primary-500 text-white shadow-glow-green'
                    : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </button>
            ))}

            <div className="card p-4 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 mt-4 text-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-indigo-500 flex items-center justify-center text-white text-sm font-bold mx-auto mb-2 shadow-sm">
                {(profileForm.first_name?.[0] || email?.[0] || '?').toUpperCase()}
              </div>
              <p className="text-xs font-bold text-slate-800 dark:text-white">
                {[profileForm.first_name, profileForm.last_name].filter(Boolean).join(' ') || 'User Profile'}
              </p>
              <span className="badge text-[9px] font-extrabold capitalize mt-1 border bg-slate-50 border-slate-200/60 dark:bg-slate-900 dark:border-slate-800 text-slate-500">
                {role} account
              </span>
            </div>
          </div>

          {/* Form Area */}
          <div className="md:col-span-8">
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.form
                  key="profile"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSaveProfile}
                  className="card p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-primary-500" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label mb-1.5 block text-xs">First Name</label>
                      <input
                        type="text"
                        name="first_name"
                        required
                        className="input w-full text-xs"
                        value={profileForm.first_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="label mb-1.5 block text-xs">Last Name</label>
                      <input
                        type="text"
                        name="last_name"
                        required
                        className="input w-full text-xs"
                        value={profileForm.last_name}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="label mb-1.5 block text-xs">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        disabled
                        className="input pl-10 w-full text-xs bg-slate-50 dark:bg-slate-900/50 cursor-not-allowed border-slate-200/80"
                        value={email || ''}
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
                      Email is managed via Clerk account authentication settings.
                    </span>
                  </div>

                  <div>
                    <label className="label mb-1.5 block text-xs">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="e.g. +1 (555) 000-0000"
                        className="input pl-10 w-full text-xs"
                        value={profileForm.phone}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-glow-green">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Profile Info
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'organization' && (
                <motion.form
                  key="organization"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  onSubmit={handleSaveProfile}
                  className="card p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 space-y-4"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-primary-500" />
                    Organization & Address Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="label mb-1.5 block text-xs">Organization Name</label>
                      <input
                        type="text"
                        name="organization_name"
                        placeholder="e.g. Hope Food Shelter"
                        className="input w-full text-xs"
                        value={profileForm.organization_name}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="label mb-1.5 block text-xs">Organization Type</label>
                      <select
                        name="organization_type"
                        className="input w-full text-xs"
                        value={profileForm.organization_type}
                        onChange={handleInputChange}
                      >
                        {ORG_TYPES.map(o => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label mb-1.5 block text-xs">Full Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                      <textarea
                        name="organization_address"
                        rows={2}
                        placeholder="Street details, building, suite..."
                        className="input pl-10 w-full text-xs resize-none"
                        value={profileForm.organization_address}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="label mb-1.5 block text-xs">City</label>
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        className="input w-full text-xs"
                        value={profileForm.city}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="label mb-1.5 block text-xs">State</label>
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        className="input w-full text-xs"
                        value={profileForm.state}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="label mb-1.5 block text-xs">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        placeholder="ZIP/PIN"
                        className="input w-full text-xs"
                        value={profileForm.pincode}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="label mb-1.5 block text-xs">Latitude (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        name="latitude"
                        placeholder="e.g. 37.7749"
                        className="input w-full text-xs"
                        value={profileForm.latitude}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="label mb-1.5 block text-xs">Longitude (Optional)</label>
                      <input
                        type="number"
                        step="any"
                        name="longitude"
                        placeholder="e.g. -122.4194"
                        className="input w-full text-xs"
                        value={profileForm.longitude}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={saving} className="btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-glow-green">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Organization Info
                    </button>
                  </div>
                </motion.form>
              )}

              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="card p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 space-y-5"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-primary-500" />
                    Notification Preferences
                  </h3>

                  <div className="space-y-4">
                    {[
                      { key: 'email', title: 'Email Notifications', desc: 'Receive transactional updates, reports, and alerts in your email box.' },
                      { key: 'push', title: 'Push Alerts', desc: 'Receive real-time browser action alerts for claims and status updates.' },
                      { key: 'expiry_alerts', title: 'Expiry Warnings', desc: 'Receive alerts when food items are approaching their expiry limits.' },
                    ].map(({ key, title, desc }) => (
                      <div key={key} className="flex items-start justify-between gap-4 p-3 rounded-xl border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-white">{title}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">{desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          className="w-4.5 h-4.5 text-primary-500 rounded border-slate-300 focus:ring-primary-500 shrink-0 cursor-pointer"
                          checked={notificationSettings[key]}
                          onChange={() => handleCheckboxChange(key)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className="pt-2">
                    <button onClick={handleSaveSettings} disabled={saving} className="btn-primary w-full py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold shadow-glow-green">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save Notification Preferences
                    </button>
                  </div>
                </motion.div>
              )}

              {activeTab === 'preferences' && (
                <motion.div
                  key="preferences"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="card p-6 bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/50 space-y-5"
                >
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2 flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-primary-500" />
                    App Customization
                  </h3>

                  <div className="p-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/20 dark:bg-slate-800/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Aesthetic Styling
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-normal max-w-sm">
                        Toggle between Light and Dark mode options. RePlate is optimized for eye comfort in low light conditions.
                      </p>
                    </div>

                    <button
                      onClick={toggleDarkMode}
                      className="flex items-center gap-2 px-4 py-2 border rounded-xl font-bold text-xs bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-sm self-start sm:self-auto"
                    >
                      {isDark ? (
                        <><Sun className="w-4 h-4 text-amber-500" /><span>Light Theme</span></>
                      ) : (
                        <><Moon className="w-4 h-4 text-indigo-500" /><span>Dark Theme</span></>
                      )}
                    </button>
                  </div>

                  <div className="p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/25 border border-indigo-150 dark:border-indigo-900/40 text-xs text-indigo-800 dark:text-indigo-300">
                    <p className="font-bold flex items-center gap-1">🛡️ System Status Security</p>
                    <p className="mt-1 opacity-90 leading-normal text-[11px]">
                      Your RePlate profile coordinates and metadata are securely stored using Supabase table row-level policies.
                      Only confirmed stakeholders can browse available listings matching safe criteria.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
