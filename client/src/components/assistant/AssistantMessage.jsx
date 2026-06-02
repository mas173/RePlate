import React from 'react';
import { Volume2, Sparkles, Navigation, CheckCircle, HelpCircle, User, Activity, AlertCircle, ShoppingBag, ShieldAlert } from 'lucide-react';
import { cn } from '@/utils/helpers';

export default function AssistantMessage({ message, onPlayAudio, onFillForm, onNavigate }) {
  const isUser = message.role === 'user';

  const renderDataCard = () => {
    if (!message.contextData && !message.extractedData) return null;

    // 1. Create Donation Extracted Data Preview
    if (message.intent === 'create_donation' || message.intent === 'follow_up') {
      const data = message.extractedData;
      if (!data || Object.keys(data).length === 0) return null;

      return (
        <div className="mt-3 p-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/50 shadow-sm space-y-2.5">
          <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-400 font-semibold text-xs uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Extracted Details
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
            {data.foodName && (
              <div>
                <span className="text-slate-400">Food:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{data.foodName}</p>
              </div>
            )}
            {data.quantity && (
              <div>
                <span className="text-slate-400">Quantity:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {data.quantity} {data.unit || 'meals'}
                </p>
              </div>
            )}
            {data.category && (
              <div>
                <span className="text-slate-400">Category:</span>
                <p className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                  {data.category.replace('_', ' ')}
                </p>
              </div>
            )}
            {data.expiryTime && (
              <div>
                <span className="text-slate-400">Expiry:</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {data.expiryDate || 'Today'} at {data.expiryTime}
                </p>
              </div>
            )}
            {data.city && (
              <div className="col-span-2">
                <span className="text-slate-400">Pickup Address:</span>
                <p className="font-medium text-slate-700 dark:text-slate-350">
                  {data.address ? `${data.address}, ` : ''}{data.city}{data.state ? `, ${data.state}` : ''}
                </p>
              </div>
            )}
          </div>
          <button
            onClick={onFillForm}
            className="w-full mt-2 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            Fill Donation Form
          </button>
        </div>
      );
    }

    // 2. Check Donations List
    if (message.intent === 'check_donations' && message.contextData?.donations) {
      const list = message.contextData.donations;
      if (list.length === 0) {
        return (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No active donations found.
          </div>
        );
      }

      return (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
          {list.map((don) => (
            <div
              key={don.id}
              onClick={() => onNavigate(`/donations/${don.id}`)}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-primary-400 dark:hover:border-primary-500/50 shadow-sm transition-all cursor-pointer flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{don.food_name}</p>
                <p className="text-[10px] text-slate-400">
                  {don.quantity} {don.unit} • {don.pickup_city || 'Local'}
                </p>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0',
                  don.status === 'available'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                    : don.status === 'claimed'
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-450'
                )}
              >
                {don.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // 3. User Impact Analytics Grid
    if (message.intent === 'view_analytics' && message.contextData?.analytics) {
      const stats = message.contextData.analytics;
      return (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/50 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Meals Saved</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.mealsSaved}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50/50 dark:bg-teal-950/10 border border-teal-100 dark:border-teal-900/50 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Waste Reduced</span>
            <span className="text-lg font-bold text-teal-600 dark:text-teal-400">{stats.wasteReduced} kg</span>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">Total Donations</span>
            <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{stats.donations}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/50 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block mb-0.5">CO2 Offset</span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.co2Reduced} kg</span>
          </div>
        </div>
      );
    }

    // 4. Claims log
    if (message.intent === 'check_claims' && message.contextData?.claims) {
      const claims = message.contextData.claims;
      if (claims.length === 0) {
        return (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No active claims found.
          </div>
        );
      }

      return (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
          {claims.map((claim) => (
            <div
              key={claim.id}
              onClick={() => onNavigate('/claims')}
              className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 hover:border-teal-450 cursor-pointer shadow-sm transition-all flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5 min-w-0 pr-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {claim.donations?.food_name || 'Food Donation'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  Qty: {claim.donations?.quantity} {claim.donations?.unit}
                </p>
              </div>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-[9px] font-bold uppercase shrink-0',
                  claim.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30'
                    : 'bg-teal-50 text-teal-600 dark:bg-teal-950/30'
                )}
              >
                {claim.status}
              </span>
            </div>
          ))}
        </div>
      );
    }

    // 5. Notifications summary list
    if (message.intent === 'check_notifications' && message.contextData?.notifications) {
      const notifications = message.contextData.notifications;
      if (notifications.length === 0) {
        return (
          <div className="mt-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No recent notifications.
          </div>
        );
      }

      return (
        <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
          <div className="text-[10px] font-bold text-slate-400 mb-1 flex items-center justify-between">
            <span>RECENT NOTIFICATIONS</span>
            {message.contextData.unreadCount > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0.2">{message.contextData.unreadCount} New</span>
            )}
          </div>
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => onNavigate('/notifications')}
              className={cn(
                'p-2.5 rounded-lg border text-xs cursor-pointer transition-all shadow-sm bg-white dark:bg-slate-900',
                notif.is_read
                  ? 'border-slate-100 dark:border-slate-800/80 text-slate-600 dark:text-slate-400'
                  : 'border-red-100 dark:border-red-950/30 bg-red-50/10 dark:bg-red-950/5 text-slate-800 dark:text-slate-200'
              )}
            >
              <p className="font-semibold truncate">{notif.title}</p>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">{notif.message}</p>
            </div>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className={cn('flex items-start gap-2.5', isUser ? 'justify-end' : 'justify-start')}>
      {/* AI Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-sm border border-primary-400/20">
          <Sparkles className="w-4 h-4 animate-pulse" />
        </div>
      )}

      {/* Message Bubble container */}
      <div className={cn('flex flex-col max-w-[82%]', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'p-3.5 rounded-2xl text-sm shadow-sm relative group transition-all duration-200',
            isUser
              ? 'bg-primary-550 dark:bg-primary-600 text-white rounded-tr-none'
              : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 text-slate-800 dark:text-slate-200 rounded-tl-none'
          )}
        >
          <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {/* Context data renderings */}
          {renderDataCard()}

          {/* Quick-action buttons in assistant card */}
          {!isUser && (
            <div className="flex items-center justify-between gap-4 mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[10px] text-slate-400 font-medium">
                {message.timestamp ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
              </span>
              
              <div className="flex items-center gap-1.5">
                {message.audioResponse && (
                  <button
                    onClick={() => onPlayAudio(message.audioResponse)}
                    className="p-1 rounded-md bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-900 text-slate-550 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors border border-slate-100 dark:border-slate-800/80"
                    title="Read Response Aloud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}
                {message.navigationPath && (
                  <button
                    onClick={() => onNavigate(message.navigationPath)}
                    className="py-1 px-2.5 rounded-md bg-primary-50 dark:bg-primary-950/40 text-primary-650 dark:text-primary-400 hover:bg-primary-100 transition-colors text-[10px] font-bold flex items-center gap-1 border border-primary-200/50 dark:border-primary-900/30"
                  >
                    <Navigation className="w-3 h-3" />
                    Navigate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-650 dark:text-slate-400 shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
}
