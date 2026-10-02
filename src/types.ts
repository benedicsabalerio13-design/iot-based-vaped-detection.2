export type UserRole = 'Administrator' | 'Safety Supervisor' | 'Campus Security';

export interface User {
  id: string;
  fullname: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export interface Sensor {
  id: string;
  sensor_name: string;
  location: string;
  status: 'Online' | 'Offline' | 'Alert' | 'Maintenance';
  last_ppm: number;
  ip_address: string;
  wifi_rssi: number;
  last_ping: string;
  created_at: string;
}

export interface SensorReading {
  id: string;
  sensor_id: string;
  ppm: number;
  threshold: number;
  status: 'SAFE' | 'WARNING' | 'VAPE DETECTED';
  location: string;
  recorded_at: string;
}

export interface DetectionLog {
  id: string;
  reading_id: string;
  sensor_id: string;
  location: string;
  ppm: number;
  threshold: number;
  status: 'VAPE DETECTED' | 'WARNING';
  detected_at: string;
  notes?: string;
  action_status?: 'Pending' | 'Investigated' | 'Resolved' | 'False Positive';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'ALERT' | 'WARNING' | 'SYSTEM' | 'INFO';
  status: 'unread' | 'read';
  location?: string;
  ppm?: number;
  created_at: string;
}

export interface SystemSettings {
  vape_threshold_ppm: number;
  warning_threshold_ppm: number;
  sensor_poll_interval_sec: number;
  alert_cooldown_sec: number;
  sound_alert_enabled: boolean;
  email_notifications_enabled: boolean;
  admin_email: string;
  supabase_url: string;
  supabase_anon_key: string;
  udm_campus_code: string;
}

export interface PeakHourData {
  hour: string; // e.g., "08:00", "09:00"
  count: number;
}

export interface LocationStat {
  location: string;
  count: number;
  max_ppm: number;
  avg_ppm: number;
}

export interface FrequencyData {
  label: string; // e.g. Day name, Week name, or Month name
  count: number;
  avgPpm: number;
}

export interface DescriptiveAnalytics {
  totalDetections: number;
  todayDetections: number;
  weeklyDetections: number;
  monthlyDetections: number;
  meanPpm: number;
  maxPpmRecorded: number;
  medianPpm: number;
  standardDeviationPpm: number;
  peakHour: string;
  mostAffectedLocation: string;
  hourlyFrequency: PeakHourData[];
  dailyFrequency: FrequencyData[];
  weeklyFrequency: FrequencyData[];
  monthlyFrequency: FrequencyData[];
  locationStats: LocationStat[];
  trend7Days: { date: string; count: number }[];
}

export interface DashboardStats {
  currentStatus: 'SAFE' | 'WARNING' | 'VAPE DETECTED';
  currentPpm: number;
  activeSensorsCount: number;
  totalSensorsCount: number;
  todayCount: number;
  weeklyCount: number;
  monthlyCount: number;
  latestDetection: DetectionLog | null;
  thresholdPpm: number;
  unreadNotificationsCount: number;
}
