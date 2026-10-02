import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { LiveMonitoringView } from './components/LiveMonitoringView';
import { DetectionLogsView } from './components/DetectionLogsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { Esp32SimulatorModal } from './components/Esp32SimulatorModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import { LoginModal } from './components/LoginModal';
import {
  User,
  Sensor,
  DetectionLog,
  Notification,
  SystemSettings,
  DashboardStats,
  DescriptiveAnalytics,
} from './types';
import { INITIAL_USER, INITIAL_SETTINGS, INITIAL_SENSORS, INITIAL_DETECTION_LOGS, INITIAL_NOTIFICATIONS } from './data/initialData';
import { calculateDescriptiveAnalytics } from './utils/analytics';

export default function App() {
  const [user, setUser] = useState<User | null>(INITIAL_USER);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Backend Data State
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);
  const [sensors, setSensors] = useState<Sensor[]>(INITIAL_SENSORS);
  const [logs, setLogs] = useState<DetectionLog[]>(INITIAL_DETECTION_LOGS);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const [analytics, setAnalytics] = useState<DescriptiveAnalytics>(
    calculateDescriptiveAnalytics(INITIAL_DETECTION_LOGS)
  );

  const [stats, setStats] = useState<DashboardStats>({
    currentStatus: 'SAFE',
    currentPpm: 185,
    activeSensorsCount: 6,
    totalSensorsCount: 6,
    todayCount: 2,
    weeklyCount: 8,
    monthlyCount: 20,
    latestDetection: INITIAL_DETECTION_LOGS[0] || null,
    thresholdPpm: 400,
    unreadNotificationsCount: 2,
  });

  // UI Modals / Drawers
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Audio Beeper Helper for Vape Threshold Alert
  const playAlertSound = useCallback(() => {
    if (!settings.sound_alert_enabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 note
      osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play restricted by browser policy:', e);
    }
  }, [settings.sound_alert_enabled]);

  // Sync state with backend API
  const refreshBackendData = useCallback(async () => {
    try {
      const [statsRes, liveRes, logsRes, analyticsRes, notifRes, settingsRes] = await Promise.all([
        fetch('/api/dashboard/stats').then((r) => r.json()),
        fetch('/api/monitoring/live').then((r) => r.json()),
        fetch('/api/logs?limit=100').then((r) => r.json()),
        fetch('/api/analytics').then((r) => r.json()),
        fetch('/api/notifications').then((r) => r.json()),
        fetch('/api/settings').then((r) => r.json()),
      ]);

      if (statsRes.currentStatus === 'VAPE DETECTED' && stats.currentStatus !== 'VAPE DETECTED') {
        playAlertSound();
      }

      setStats(statsRes);
      if (liveRes.sensors) setSensors(liveRes.sensors);
      if (logsRes.logs) setLogs(logsRes.logs);
      if (analyticsRes.totalDetections !== undefined) setAnalytics(analyticsRes);
      if (notifRes.notifications) setNotifications(notifRes.notifications);
      if (settingsRes.settings) setSettings(settingsRes.settings);
    } catch (err) {
      console.warn('Polling fallback to local state:', err);
    }
  }, [stats.currentStatus, playAlertSound]);

  // Polling Effect (Every 3 seconds for real-time monitoring)
  useEffect(() => {
    refreshBackendData();
    const interval = setInterval(refreshBackendData, 3000);
    return () => clearInterval(interval);
  }, [refreshBackendData]);

  // Send ESP32 Payload (From Modal or Live Monitoring)
  const handleSendSensorPayload = async (sensorId: string, location: string, ppm: number) => {
    try {
      const res = await fetch('/api/v1/sensor-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sensor_id: sensorId, ppm, location }),
      });
      const data = await res.json();

      if (data.alert_triggered) {
        playAlertSound();
      }

      await refreshBackendData();
      return data;
    } catch (err) {
      console.error('Error sending sensor data:', err);
    }
  };

  // Notification Handlers
  const handleMarkAllRead = async () => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: 'all' }),
    });
    refreshBackendData();
  };

  const handleMarkRead = async (id: string) => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notification_id: id }),
    });
    refreshBackendData();
  };

  const handleClearNotifications = async () => {
    await fetch('/api/notifications/clear-all', { method: 'POST' });
    refreshBackendData();
  };

  // Settings Handlers
  const handleUpdateSettings = async (updated: Partial<SystemSettings>) => {
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    refreshBackendData();
  };

  const handleAddSensor = async (name: string, location: string, ip: string) => {
    await fetch('/api/sensors/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sensor_name: name, location, ip_address: ip }),
    });
    refreshBackendData();
  };

  const handleDeleteSensor = async (id: string) => {
    await fetch(`/api/sensors/${id}`, { method: 'DELETE' });
    refreshBackendData();
  };

  // Log action notes update
  const handleUpdateLogAction = async (logId: string, actionStatus: string, notes: string) => {
    await fetch('/api/logs/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ log_id: logId, action_status: actionStatus, notes }),
    });
    refreshBackendData();
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      
      {/* Top Navbar */}
      <Navbar
        user={user}
        notifications={notifications}
        unreadCount={stats.unreadNotificationsCount}
        systemStatus={stats.currentStatus}
        currentPpm={stats.currentPpm}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onLogout={() => {
          setUser(null);
          setIsLoginOpen(true);
        }}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          thresholdPpm={stats.thresholdPpm}
          activeSensorsCount={stats.activeSensorsCount}
        />

        {/* Content View Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              sensors={sensors}
              recentLogs={logs}
              recentNotifications={notifications}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'monitoring' && (
            <LiveMonitoringView
              sensors={sensors}
              thresholdPpm={settings.vape_threshold_ppm}
              warningPpm={settings.warning_threshold_ppm}
              onSimulateSensor={handleSendSensorPayload}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'logs' && (
            <DetectionLogsView
              logs={logs}
              locations={sensors.map((s) => s.location)}
              onUpdateLogAction={handleUpdateLogAction}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView analytics={analytics} />
          )}

          {activeTab === 'reports' && (
            <ReportsView
              analytics={analytics}
              logs={logs}
              settings={settings}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView
              settings={settings}
              sensors={sensors}
              user={user || INITIAL_USER}
              onUpdateSettings={handleUpdateSettings}
              onAddSensor={handleAddSensor}
              onDeleteSensor={handleDeleteSensor}
            />
          )}
        </main>
      </div>

      {/* Hardware Simulator Test Modal */}
      <Esp32SimulatorModal
        sensors={sensors}
        thresholdPpm={settings.vape_threshold_ppm}
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onSendPayload={handleSendSensorPayload}
      />

      {/* Real-time Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        notifications={notifications}
        onClose={() => setIsNotificationsOpen(false)}
        onMarkAllRead={handleMarkAllRead}
        onClearAll={handleClearNotifications}
        onMarkRead={handleMarkRead}
      />

      {/* Login Authentication Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onLoginSuccess={(u) => {
          setUser(u);
          setIsLoginOpen(false);
        }}
      />

    </div>
  );
}
