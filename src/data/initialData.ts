import { User, Sensor, SensorReading, DetectionLog, Notification, SystemSettings } from '../types';

export const INITIAL_USER: User = {
  id: 'USR-001',
  fullname: 'Prof. Mario Santos (Campus Safety Officer)',
  email: 'admin@udm.edu.ph',
  role: 'Administrator',
  created_at: new Date('2026-01-15').toISOString(),
};

export const INITIAL_SETTINGS: SystemSettings = {
  vape_threshold_ppm: 400,
  warning_threshold_ppm: 300,
  sensor_poll_interval_sec: 2,
  alert_cooldown_sec: 30,
  sound_alert_enabled: true,
  email_notifications_enabled: false,
  admin_email: 'safety@udm.edu.ph',
  supabase_url: 'https://udm-campus-safety.supabase.co',
  supabase_anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbS1jYW1wdXMiLCJyb2xlIjoiYW5vbiJ9...',
  udm_campus_code: 'UDM-MAIN-MANILA',
};

export const INITIAL_SENSORS: Sensor[] = [
  {
    id: 'ESP32-CR01',
    sensor_name: 'ESP32 Prototype Sensor Node 01',
    location: 'CR-01 – Selected Comfort Room',
    status: 'Online',
    last_ppm: 185,
    ip_address: '192.168.1.101',
    wifi_rssi: -62,
    last_ping: new Date().toISOString(),
    created_at: new Date('2026-02-01').toISOString(),
  },
];

// Helper to generate realistic historical detection logs over the past month for the single CR-01 prototype sensor
function generateSeedDetectionLogs(): DetectionLog[] {
  const location = 'CR-01 – Selected Comfort Room';
  const sensorId = 'ESP32-CR01';

  const logs: DetectionLog[] = [];
  const now = new Date();
  
  // Seed historical detection logs for CR-01 prototype
  const baseTimestamps = [
    { daysAgo: 0, hoursAgo: 2, ppm: 540, action: 'Investigated' },
    { daysAgo: 0, hoursAgo: 5, ppm: 495, action: 'Resolved' },
    { daysAgo: 1, hoursAgo: 3, ppm: 610, action: 'Investigated' },
    { daysAgo: 1, hoursAgo: 7, ppm: 460, action: 'Resolved' },
    { daysAgo: 2, hoursAgo: 4, ppm: 520, action: 'Resolved' },
    { daysAgo: 2, hoursAgo: 9, ppm: 430, action: 'Resolved' },
    { daysAgo: 3, hoursAgo: 2, ppm: 580, action: 'Investigated' },
    { daysAgo: 4, hoursAgo: 5, ppm: 670, action: 'Resolved' },
    { daysAgo: 5, hoursAgo: 1, ppm: 445, action: 'Resolved' },
    { daysAgo: 6, hoursAgo: 4, ppm: 510, action: 'Resolved' },
    { daysAgo: 7, hoursAgo: 6, ppm: 490, action: 'Resolved' },
    { daysAgo: 8, hoursAgo: 3, ppm: 530, action: 'Resolved' },
    { daysAgo: 10, hoursAgo: 2, ppm: 720, action: 'Resolved' },
    { daysAgo: 12, hoursAgo: 5, ppm: 480, action: 'Resolved' },
    { daysAgo: 14, hoursAgo: 4, ppm: 505, action: 'Resolved' },
    { daysAgo: 16, hoursAgo: 8, ppm: 590, action: 'Resolved' },
    { daysAgo: 18, hoursAgo: 3, ppm: 470, action: 'Resolved' },
    { daysAgo: 21, hoursAgo: 6, ppm: 640, action: 'Resolved' },
    { daysAgo: 24, hoursAgo: 2, ppm: 425, action: 'Resolved' },
    { daysAgo: 27, hoursAgo: 5, ppm: 515, action: 'Resolved' },
  ];

  baseTimestamps.forEach((item, idx) => {
    const d = new Date(now.getTime() - item.daysAgo * 86400000 - item.hoursAgo * 3600000);
    const id = `LOG-${2026000 + idx}`;
    logs.push({
      id,
      reading_id: `RDG-${1000 + idx}`,
      sensor_id: sensorId,
      location,
      ppm: item.ppm,
      threshold: 400,
      status: 'VAPE DETECTED',
      detected_at: d.toISOString(),
      notes: `Vape aerosol concentration detected at CR-01 prototype node exceeding 400 PPM threshold (${item.ppm} PPM).`,
      action_status: item.action as any,
    });
  });

  return logs;
}

export const INITIAL_DETECTION_LOGS: DetectionLog[] = generateSeedDetectionLogs();

export const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'NOTIF-001',
    title: '⚠️ Vape Aerosol Detected – CR-01',
    message: 'High gas concentration (540 PPM) detected at CR-01 – Selected Comfort Room.',
    type: 'ALERT',
    status: 'unread',
    location: 'CR-01 – Selected Comfort Room',
    ppm: 540,
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
  },
  {
    id: 'NOTIF-002',
    title: '⚠️ Vape Aerosol Detected – CR-01',
    message: 'Gas concentration reached 495 PPM at CR-01 – Selected Comfort Room.',
    type: 'ALERT',
    status: 'unread',
    location: 'CR-01 – Selected Comfort Room',
    ppm: 495,
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'NOTIF-003',
    title: '⚙️ Threshold Updated',
    message: 'System vape detection threshold set to 400 PPM by Safety Administrator.',
    type: 'SYSTEM',
    status: 'read',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'NOTIF-004',
    title: '📡 ESP32 Prototype Online',
    message: 'ESP32-CR01 prototype node connected to UDM Wi-Fi network.',
    type: 'INFO',
    status: 'read',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
];
