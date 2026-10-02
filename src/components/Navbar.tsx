import React from 'react';
import { Shield, Bell, Cpu, LogOut, User as UserIcon, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';
import { User, Notification } from '../types';

interface NavbarProps {
  user: User | null;
  notifications: Notification[];
  unreadCount: number;
  systemStatus: 'SAFE' | 'WARNING' | 'VAPE DETECTED';
  currentPpm: number;
  onOpenNotifications: () => void;
  onOpenSimulator: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  unreadCount,
  systemStatus,
  currentPpm,
  onOpenNotifications,
  onOpenSimulator,
  onLogout,
}) => {
  return (
    <header className="bg-gradient-to-r from-[#002B49] via-[#003B66] to-[#0056B3] text-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand & Campus Logo */}
        <div className="flex items-center space-x-3">
          <div className="bg-white/10 p-2 rounded-lg border border-white/20 backdrop-blur-sm flex items-center justify-center">
            <Shield className="w-6 h-6 text-yellow-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg tracking-wide">UNIVERSIDAD DE MANILA</span>
              <span className="bg-yellow-400/20 text-yellow-300 text-xs px-2 py-0.5 rounded font-mono font-medium border border-yellow-400/30">
                UDM-CSMS
              </span>
            </div>
            <p className="text-xs text-blue-200 hidden sm:block">
              IoT Vape Detection & Descriptive Analytics System
            </p>
          </div>
        </div>

        {/* Real-time Status Indicator & Action Bar */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          
          {/* Status Badge */}
          <div className={`hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
            systemStatus === 'VAPE DETECTED'
              ? 'bg-red-500/20 border-red-400/50 text-red-200 animate-pulse'
              : systemStatus === 'WARNING'
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-200'
              : 'bg-emerald-500/20 border-emerald-400/50 text-emerald-200'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                systemStatus === 'VAPE DETECTED' ? 'bg-red-400' : 'bg-emerald-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${
                systemStatus === 'VAPE DETECTED' ? 'bg-red-500' : 'bg-emerald-500'
              }`}></span>
            </span>
            <span>
              {systemStatus === 'VAPE DETECTED' ? `ALERT: Vape Detected (${currentPpm} PPM)` : `Air Safe (${currentPpm} PPM)`}
            </span>
          </div>

          {/* ESP32 Hardware Simulator Trigger */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center space-x-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-semibold px-3 py-1.5 rounded-lg text-xs shadow transition-all transform hover:scale-105"
            title="Open ESP32 Hardware Payload Simulator"
          >
            <Radio className="w-3.5 h-3.5 animate-pulse text-red-600" />
            <span className="hidden sm:inline">ESP32 Simulator</span>
            <span className="sm:hidden">Test</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-blue-100 hover:text-white"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#002B49] animate-bounce">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          {user && (
            <div className="flex items-center space-x-2 pl-2 border-l border-white/20">
              <div className="hidden lg:block text-right">
                <p className="text-xs font-semibold text-white leading-tight">{user.fullname}</p>
                <p className="text-[10px] text-blue-200">{user.role}</p>
              </div>
              <button
                onClick={onLogout}
                className="p-1.5 text-blue-200 hover:text-red-300 hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
};
