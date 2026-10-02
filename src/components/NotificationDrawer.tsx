import React from 'react';
import { Bell, CheckCheck, Trash2, X, AlertTriangle, ShieldAlert, Info, Clock } from 'lucide-react';
import { Notification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  notifications: Notification[];
  onClose: () => void;
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onMarkRead: (id: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  notifications,
  onClose,
  onMarkAllRead,
  onClearAll,
  onMarkRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col justify-between animate-slide-left border-l border-slate-200">
        
        {/* Top Header */}
        <div className="p-5 bg-gradient-to-r from-[#002B49] to-[#004080] text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bell className="w-5 h-5 text-yellow-400" />
            <h3 className="font-bold text-base">Real-Time Website Notifications</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-blue-200 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Actions Bar */}
        <div className="px-5 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <button
            onClick={onMarkAllRead}
            className="hover:text-blue-600 font-semibold flex items-center space-x-1"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Mark All Read</span>
          </button>

          <button
            onClick={onClearAll}
            className="hover:text-red-600 font-semibold flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-500" />
            <span>Clear Notifications</span>
          </button>
        </div>

        {/* Notifications List */}
        <div className="p-5 flex-1 overflow-y-auto space-y-3">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkRead(n.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  n.status === 'unread'
                    ? 'bg-blue-50/80 border-blue-200 shadow-sm'
                    : 'bg-slate-50 border-slate-200 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    {n.type === 'ALERT' ? (
                      <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    )}
                    <span className="font-bold text-slate-800 text-xs">{n.title}</span>
                  </div>

                  {n.status === 'unread' && (
                    <span className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />
                  )}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                  <span>{n.location || 'Campus Safety System'}</span>
                  <span>{new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center text-slate-400 text-xs">
              No notifications present.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 text-center">
          Universidad de Manila — Campus Real-Time Notification Stream
        </div>

      </div>
    </div>
  );
};
