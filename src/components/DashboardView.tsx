import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Calendar,
  Clock,
  MapPin,
  ArrowUpRight,
  Radio,
  Sliders,
  TrendingUp,
  ShieldAlert,
  BellRing,
} from 'lucide-react';
import { DashboardStats, DetectionLog, Notification, Sensor } from '../types';

interface DashboardViewProps {
  stats: DashboardStats;
  sensors: Sensor[];
  recentLogs: DetectionLog[];
  recentNotifications: Notification[];
  onOpenSimulator: () => void;
  onNavigateTab: (tab: any) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  sensors,
  recentLogs,
  recentNotifications,
  onOpenSimulator,
  onNavigateTab,
}) => {
  const isAlert = stats.currentStatus === 'VAPE DETECTED';
  const isWarning = stats.currentStatus === 'WARNING';

  // Calculate percentage relative to threshold (0 - 1000 PPM)
  const maxBar = 800;
  const ppmPercent = Math.min(100, Math.round((stats.currentPpm / maxBar) * 100));

  return (
    <div className="space-y-6">
      
      {/* Top Banner - Live Air Quality & Detection Status */}
      <div className={`rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all ${
        isAlert
          ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 border-2 border-red-400/60 animate-pulse'
          : isWarning
          ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700'
          : 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800'
      }`}>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center space-x-2">
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isAlert ? 'bg-white text-red-700' : isWarning ? 'bg-white text-amber-800' : 'bg-emerald-400 text-slate-900'
              }`}>
                {isAlert ? '🚨 VAPE EMISSION DETECTED' : isWarning ? '⚠️ WARNING: ELEVATED GAS' : '✓ AIR QUALITY SAFE'}
              </span>
              <span className="text-xs text-blue-100 font-mono">
                UDM CR-01 Prototype Node
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isAlert
                ? 'High Aerosol Concentration Alert at CR-01!'
                : isWarning
                ? 'Elevated Gas Reading at CR-01'
                : 'CR-01 Selected Comfort Room Safe'}
            </h1>

            <p className="text-sm text-blue-100 leading-relaxed">
              {isAlert
                ? `The ESP32-CR01 prototype node detected gas levels exceeding the ${stats.thresholdPpm} PPM threshold. Campus safety personnel alerted.`
                : `Real-time monitoring active via 1 physical prototype node (ESP32 DevKit V1 + MQ-135) deployed at CR-01. Scalable architecture ready for future campus expansion.`}
            </p>
          </div>

          {/* PPM Gauge Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 min-w-[220px] text-center space-y-2 flex-shrink-0">
            <p className="text-xs font-medium text-blue-200 uppercase tracking-wider">
              Current Highest PPM Reading
            </p>
            <div className="flex items-baseline justify-center space-x-1">
              <span className="text-4xl font-black font-mono tracking-tight">{stats.currentPpm}</span>
              <span className="text-sm font-bold text-blue-200">PPM</span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-black/20 rounded-full h-3 overflow-hidden p-0.5 border border-white/20">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isAlert ? 'bg-red-400' : isWarning ? 'bg-amber-300' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.max(8, ppmPercent)}%` }}
              ></div>
            </div>

            <div className="flex justify-between text-[10px] text-blue-200 font-mono">
              <span>0 PPM</span>
              <span>Threshold: {stats.thresholdPpm} PPM</span>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Statistics Cards Grid (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Today's Count */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Detections</p>
              <h3 className="text-2xl font-black text-slate-800 font-mono mt-1">{stats.todayCount}</h3>
            </div>
            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
              <Flame className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500 space-x-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>24-Hour Cycle Logs</span>
          </div>
        </div>

        {/* Weekly Count */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Weekly Detections</p>
              <h3 className="text-2xl font-black text-slate-800 font-mono mt-1">{stats.weeklyCount}</h3>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500 space-x-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Past 7 Days Aggregate</span>
          </div>
        </div>

        {/* Monthly Count */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Monthly Total</p>
              <h3 className="text-2xl font-black text-slate-800 font-mono mt-1">{stats.monthlyCount}</h3>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500 space-x-1">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>Past 30 Days Record</span>
          </div>
        </div>

        {/* Active Deployed Prototype Node */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200/80 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prototype Node</p>
              <h3 className="text-2xl font-black text-emerald-600 font-mono mt-1">
                {stats.activeSensorsCount} <span className="text-xs font-normal text-slate-400">Deployed (CR-01)</span>
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Radio className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-xs text-slate-500 space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>ESP32-CR01 Online</span>
          </div>
        </div>

      </div>

      {/* Middle Grid: Latest Incident & Quick Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Latest Detection Event Banner (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-5 h-5 text-red-500" />
              <h2 className="font-bold text-slate-800 text-base">Latest Vape Detection Log</h2>
            </div>
            <button
              onClick={() => onNavigateTab('logs')}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
            >
              <span>View All Logs</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats.latestDetection ? (
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className="bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full text-xs font-bold border border-red-200">
                    {stats.latestDetection.status}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    ID: {stats.latestDetection.id}
                  </span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {new Date(stats.latestDetection.detected_at).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-medium">Location</p>
                  <p className="font-bold text-slate-800 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span className="truncate">{stats.latestDetection.location}</span>
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-medium">Gas Concentration</p>
                  <p className="font-bold text-red-600 font-mono mt-0.5">
                    {stats.latestDetection.ppm} PPM
                  </p>
                </div>

                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <p className="text-[11px] text-slate-400 font-medium">System Threshold</p>
                  <p className="font-bold text-slate-700 font-mono mt-0.5">
                    {stats.latestDetection.threshold} PPM
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 italic bg-white p-2 rounded border border-slate-200/60">
                "{stats.latestDetection.notes}"
              </p>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500 text-sm">
              No detection incidents recorded yet.
            </div>
          )}

          {/* Quick Hardware Actions */}
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={onOpenSimulator}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm flex items-center space-x-2 transition-all"
            >
              <Radio className="w-4 h-4 text-yellow-300 animate-pulse" />
              <span>Simulate ESP32 Payload (Test Alert)</span>
            </button>

            <button
              onClick={() => onNavigateTab('monitoring')}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-4 py-2 rounded-lg border border-slate-300 flex items-center space-x-2 transition-all"
            >
              <Activity className="w-4 h-4 text-slate-500" />
              <span>Comfort Rooms Grid</span>
            </button>
          </div>

        </div>

        {/* Recent Website Notifications Ticker (1 col) */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <BellRing className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-800 text-base">Real-Time Alerts</h3>
              </div>
              <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {stats.unreadNotificationsCount} Unread
              </span>
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {recentNotifications.slice(0, 4).map((n) => (
                <div
                  key={n.id}
                  className={`p-2.5 rounded-lg border text-xs space-y-1 transition-colors ${
                    n.status === 'unread'
                      ? 'bg-blue-50/70 border-blue-200 text-slate-800 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{n.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('analytics')}
            className="w-full mt-4 text-center text-xs text-blue-600 hover:text-blue-800 font-semibold py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            View Descriptive Analytics Charts &rarr;
          </button>
        </div>

      </div>

      {/* Bottom Row: Active Comfort Room Sensors Status */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-slate-800 text-base flex items-center space-x-2">
              <Radio className="w-5 h-5 text-emerald-600" />
              <span>Deployed Comfort Room Prototype Status</span>
            </h3>
            <p className="text-xs text-slate-500">
              Capstone 2 Single Prototype Node (ESP32-CR01 / CR-01)
            </p>
          </div>
          <span className="text-xs text-blue-700 bg-blue-50 font-bold px-3 py-1 rounded-full border border-blue-200">
            PROTOTYPE DEPLOYED: CR-01
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sensors.map((s) => {
            const isSensorAlert = s.last_ppm >= stats.thresholdPpm;
            return (
              <div
                key={s.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isSensorAlert
                    ? 'bg-red-50 border-red-300 ring-2 ring-red-400/50'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold font-mono bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                      {s.id}
                    </span>
                    <span className="text-[10px] bg-blue-600 text-white font-extrabold px-2 py-0.5 rounded-full uppercase">
                      PROTOTYPE
                    </span>
                  </div>
                  <span className={`h-2.5 w-2.5 rounded-full ${isSensorAlert ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900" title={s.location}>
                    {s.location}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    IP: {s.ip_address} | MQ-135 Gas Sensor
                  </p>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-xs text-slate-500">Gas Concentration</span>
                  <span className={`text-base font-black font-mono ${isSensorAlert ? 'text-red-600' : 'text-slate-800'}`}>
                    {s.last_ppm} <span className="text-xs">PPM</span>
                  </span>
                </div>
              </div>
            );
          })}

          {/* Scalability Future Expansion Callout */}
          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/50 flex flex-col justify-between space-y-2 text-xs">
            <div>
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">Future Expansion Nodes</p>
              <p className="text-slate-500 mt-1 leading-relaxed">
                Software architecture supports additional ESP32 nodes (CR-02, CR-03, etc.). Additional nodes can be dynamically registered in Settings.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('settings')}
              className="text-blue-600 font-bold hover:underline self-start text-[11px]"
            >
              + Register Expansion Sensor Node &rarr;
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
