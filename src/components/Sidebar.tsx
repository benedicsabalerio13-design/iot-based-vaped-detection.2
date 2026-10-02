import React from 'react';
import {
  LayoutDashboard,
  Activity,
  FileText,
  BarChart3,
  FileSpreadsheet,
  Settings,
  ShieldCheck,
  Cpu,
  Sliders,
} from 'lucide-react';

export type ActiveTab = 'dashboard' | 'monitoring' | 'logs' | 'analytics' | 'reports' | 'settings';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  thresholdPpm: number;
  activeSensorsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  thresholdPpm,
  activeSensorsCount,
}) => {
  const menuItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & Status',
    },
    {
      id: 'monitoring' as ActiveTab,
      label: 'Live Monitoring',
      icon: Activity,
      description: 'Comfort Rooms Grid',
    },
    {
      id: 'logs' as ActiveTab,
      label: 'Detection Logs',
      icon: FileText,
      description: 'History & Search',
    },
    {
      id: 'analytics' as ActiveTab,
      label: 'Descriptive Analytics',
      icon: BarChart3,
      description: 'Frequency & Trends',
    },
    {
      id: 'reports' as ActiveTab,
      label: 'Reports',
      icon: FileSpreadsheet,
      description: 'Academic Summaries',
    },
    {
      id: 'settings' as ActiveTab,
      label: 'Settings & ESP32 Code',
      icon: Settings,
      description: 'Threshold & C++ Code',
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex-shrink-0 md:min-h-[calc(100vh-4rem)] border-r border-slate-800 flex flex-col justify-between">
      
      <div className="p-4 space-y-6">
        
        {/* Navigation Menu */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Main Navigation
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-900/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <div className="text-left">
                    <p className="leading-none font-semibold">{item.label}</p>
                    <p className={`text-[10px] mt-1 ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* System Configuration Quick Info Card */}
        <div className="bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-300 font-semibold border-b border-slate-700 pb-2">
            <span className="flex items-center space-x-1.5">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              <span>Configured System</span>
            </span>
            <span className="bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded text-[10px]">
              Active
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Vape Threshold:</span>
              <span className="font-bold text-amber-400 font-mono">{thresholdPpm} PPM</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Active Sensors:</span>
              <span className="font-bold text-emerald-400 font-mono">{activeSensorsCount} Units</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Hardware:</span>
              <span className="text-slate-200">ESP32 + MQ-135</span>
            </div>
            <div className="flex justify-between items-center text-slate-300">
              <span className="text-slate-400">Analytics:</span>
              <span className="text-blue-300 font-medium">Descriptive Only</span>
            </div>
          </div>
        </div>

      </div>

      {/* Campus Footer Info */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50 text-[11px] text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300 flex items-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
          <span>Universidad de Manila</span>
        </p>
        <p>BSIT Capstone Project 2026</p>
        <p className="text-[10px] text-slate-500">Campus Safety Monitoring Division</p>
      </div>

    </aside>
  );
};
