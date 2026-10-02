import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import {
  INITIAL_USER,
  INITIAL_SETTINGS,
  INITIAL_SENSORS,
  INITIAL_DETECTION_LOGS,
  INITIAL_NOTIFICATIONS,
} from './src/data/initialData';
import { calculateDescriptiveAnalytics } from './src/utils/analytics';
import { Sensor, SensorReading, DetectionLog, Notification, SystemSettings, User } from './src/types';
import { getSupabaseClient, testSupabaseConnection } from './server/supabase';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // In-Memory Database Stores initialized with UDM seed data
  let userStore: User = { ...INITIAL_USER };
  let settingsStore: SystemSettings = { ...INITIAL_SETTINGS };
  let sensorsStore: Sensor[] = [...INITIAL_SENSORS];
  let detectionLogsStore: DetectionLog[] = [...INITIAL_DETECTION_LOGS];
  let notificationsStore: Notification[] = [...INITIAL_NOTIFICATIONS];
  let sensorReadingsStore: SensorReading[] = [];

  // ==========================================
  // REST API ROUTES
  // ==========================================

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      system: 'UDM Campus Safety Monitoring - IoT Vape Detection System',
      university: 'Universidad de Manila',
      timestamp: new Date().toISOString(),
    });
  });

  // 1. ESP32 Microcontroller Ingestion Endpoint (POST /api/v1/sensor-data or /api/sensor/reading)
  app.post(['/api/v1/sensor-data', '/api/sensor/reading'], (req, res) => {
    const { sensor_id, ppm, location: reqLocation, ip_address } = req.body;

    if (!sensor_id || typeof ppm !== 'number') {
      return res.status(400).json({
        error: 'Invalid payload format. Required fields: sensor_id (string), ppm (number).',
      });
    }

    // Find or create sensor record
    let sensor = sensorsStore.find((s) => s.id === sensor_id || s.sensor_name === sensor_id);
    const locationName = reqLocation || (sensor ? sensor.location : 'Unspecified Comfort Room');

    if (!sensor) {
      sensor = {
        id: sensor_id,
        sensor_name: `${sensor_id} Sensor`,
        location: locationName,
        status: 'Online',
        last_ppm: ppm,
        ip_address: ip_address || '192.168.1.200',
        wifi_rssi: -60,
        last_ping: new Date().toISOString(),
        created_at: new Date().toISOString(),
      };
      sensorsStore.push(sensor);
    } else {
      sensor.last_ppm = ppm;
      sensor.last_ping = new Date().toISOString();
      if (ip_address) sensor.ip_address = ip_address;
    }

    const threshold = settingsStore.vape_threshold_ppm;
    const warningThreshold = settingsStore.warning_threshold_ppm;

    let readingStatus: 'SAFE' | 'WARNING' | 'VAPE DETECTED' = 'SAFE';
    let alertTriggered = false;

    if (ppm >= threshold) {
      readingStatus = 'VAPE DETECTED';
      sensor.status = 'Alert';
      alertTriggered = true;
    } else if (ppm >= warningThreshold) {
      readingStatus = 'WARNING';
      sensor.status = 'Online';
    } else {
      readingStatus = 'SAFE';
      sensor.status = 'Online';
    }

    // Store raw reading
    const readingRecord: SensorReading = {
      id: `RDG-${Date.now()}`,
      sensor_id: sensor.id,
      ppm,
      threshold,
      status: readingStatus,
      location: locationName,
      recorded_at: new Date().toISOString(),
    };
    sensorReadingsStore.unshift(readingRecord);
    if (sensorReadingsStore.length > 500) sensorReadingsStore.pop();

    // If threshold is exceeded, log detection event and generate notification
    let createdLog: DetectionLog | null = null;
    if (alertTriggered) {
      createdLog = {
        id: `LOG-${Date.now()}`,
        reading_id: readingRecord.id,
        sensor_id: sensor.id,
        location: locationName,
        ppm,
        threshold,
        status: 'VAPE DETECTED',
        detected_at: new Date().toISOString(),
        notes: `MQ-135 Gas concentration recorded at ${ppm} PPM, exceeding system threshold (${threshold} PPM).`,
        action_status: 'Pending',
      };
      detectionLogsStore.unshift(createdLog);

      // Create notification
      const notifLocationBadge = locationName.includes('CR-01') ? 'CR-01' : locationName;
      const notif: Notification = {
        id: `NOTIF-${Date.now()}`,
        title: `⚠️ Vape Detection Alert – ${notifLocationBadge}`,
        message: `High gas concentration (${ppm} PPM) detected at ${locationName}. Threshold: ${threshold} PPM.`,
        type: 'ALERT',
        status: 'unread',
        location: locationName,
        ppm,
        created_at: new Date().toISOString(),
      };
      notificationsStore.unshift(notif);
    }

    // Optional Asynchronous Supabase Persistence (does not block sensor response)
    const supa = getSupabaseClient(settingsStore.supabase_url, settingsStore.supabase_anon_key);
    if (supa) {
      (async () => {
        try {
          await supa.from('sensor_readings').insert({
            sensor_id: sensor.id,
            ppm,
            threshold,
            status: readingStatus,
            location: locationName,
            recorded_at: readingRecord.recorded_at,
          });

          await supa.from('sensors').upsert({
            id: sensor.id,
            sensor_name: sensor.sensor_name,
            location: sensor.location,
            status: sensor.status,
            last_ppm: sensor.last_ppm,
            ip_address: sensor.ip_address,
            wifi_rssi: sensor.wifi_rssi,
            last_ping: sensor.last_ping,
          });

          if (alertTriggered && createdLog) {
            await supa.from('detection_logs').insert({
              id: createdLog.id,
              reading_id: createdLog.reading_id,
              sensor_id: createdLog.sensor_id,
              location: createdLog.location,
              ppm: createdLog.ppm,
              threshold: createdLog.threshold,
              status: createdLog.status,
              notes: createdLog.notes,
              action_status: createdLog.action_status,
              detected_at: createdLog.detected_at,
            });

            const notifBadge = locationName.includes('CR-01') ? 'CR-01' : locationName;
            await supa.from('notifications').insert({
              id: `NOTIF-${Date.now()}`,
              title: `⚠️ Vape Detection Alert – ${notifBadge}`,
              message: `High gas concentration (${ppm} PPM) detected at ${locationName}. Threshold: ${threshold} PPM.`,
              type: 'ALERT',
              status: 'unread',
              location: locationName,
              ppm,
              created_at: new Date().toISOString(),
            });
          }
        } catch (err: any) {
          console.warn('[Supabase Sync error]:', err?.message);
        }
      })();
    }

    return res.json({
      success: true,
      alert_triggered: alertTriggered,
      reading: readingRecord,
      detection_log: createdLog,
      threshold,
      timestamp: new Date().toISOString(),
    });
  });

  // 2. Dashboard Quick Stats (GET /api/dashboard/stats)
  app.get('/api/dashboard/stats', (req, res) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const sevenDaysAgo = now.getTime() - 7 * 86400000;
    const thirtyDaysAgo = now.getTime() - 30 * 86400000;

    const todayLogs = detectionLogsStore.filter(
      (l) => new Date(l.detected_at).getTime() >= todayStart
    );
    const weeklyLogs = detectionLogsStore.filter(
      (l) => new Date(l.detected_at).getTime() >= sevenDaysAgo
    );
    const monthlyLogs = detectionLogsStore.filter(
      (l) => new Date(l.detected_at).getTime() >= thirtyDaysAgo
    );

    const activeSensorsCount = sensorsStore.filter((s) => s.status !== 'Offline').length;
    const alertSensors = sensorsStore.filter((s) => s.status === 'Alert');
    const latestLog = detectionLogsStore.length > 0 ? detectionLogsStore[0] : null;

    // Highest current PPM across sensors
    const highestCurrentPpm = sensorsStore.reduce((max, s) => (s.last_ppm > max ? s.last_ppm : max), 0);

    let currentStatus: 'SAFE' | 'WARNING' | 'VAPE DETECTED' = 'SAFE';
    if (highestCurrentPpm >= settingsStore.vape_threshold_ppm || alertSensors.length > 0) {
      currentStatus = 'VAPE DETECTED';
    } else if (highestCurrentPpm >= settingsStore.warning_threshold_ppm) {
      currentStatus = 'WARNING';
    }

    const unreadCount = notificationsStore.filter((n) => n.status === 'unread').length;

    res.json({
      currentStatus,
      currentPpm: highestCurrentPpm,
      activeSensorsCount,
      totalSensorsCount: sensorsStore.length,
      todayCount: todayLogs.length,
      weeklyCount: weeklyLogs.length,
      monthlyCount: monthlyLogs.length,
      latestDetection: latestLog,
      thresholdPpm: settingsStore.vape_threshold_ppm,
      unreadNotificationsCount: unreadCount,
    });
  });

  // 3. Live Monitoring Data (GET /api/monitoring/live)
  app.get('/api/monitoring/live', (req, res) => {
    res.json({
      sensors: sensorsStore,
      threshold: settingsStore.vape_threshold_ppm,
      warning_threshold: settingsStore.warning_threshold_ppm,
      last_updated: new Date().toISOString(),
    });
  });

  // 4. Detection Logs with search, filter, pagination (GET /api/logs)
  app.get('/api/logs', (req, res) => {
    let logs = [...detectionLogsStore];
    const { search, location, status, page = 1, limit = 10 } = req.query;

    if (search) {
      const q = String(search).toLowerCase();
      logs = logs.filter(
        (l) =>
          l.id.toLowerCase().includes(q) ||
          l.location.toLowerCase().includes(q) ||
          (l.notes && l.notes.toLowerCase().includes(q))
      );
    }

    if (location && location !== 'All') {
      logs = logs.filter((l) => l.location === String(location));
    }

    if (status && status !== 'All') {
      logs = logs.filter((l) => l.status === String(status));
    }

    const total = logs.length;
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedLogs = logs.slice(startIndex, startIndex + limitNum);

    res.json({
      logs: paginatedLogs,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
    });
  });

  // Update Action Status on Detection Log
  app.post('/api/logs/action', (req, res) => {
    const { log_id, action_status, notes } = req.body;
    const log = detectionLogsStore.find((l) => l.id === log_id);
    if (!log) {
      return res.status(404).json({ error: 'Detection log not found' });
    }

    if (action_status) log.action_status = action_status;
    if (notes) log.notes = notes;

    res.json({ success: true, log });
  });

  // 5. Descriptive Analytics Data (GET /api/analytics)
  app.get('/api/analytics', (req, res) => {
    const analytics = calculateDescriptiveAnalytics(detectionLogsStore);
    res.json(analytics);
  });

  // 6. Notifications API
  app.get('/api/notifications', (req, res) => {
    res.json({
      notifications: notificationsStore,
      unread_count: notificationsStore.filter((n) => n.status === 'unread').length,
    });
  });

  app.post('/api/notifications/mark-read', (req, res) => {
    const { notification_id } = req.body;
    if (notification_id === 'all') {
      notificationsStore.forEach((n) => (n.status = 'read'));
    } else {
      const notif = notificationsStore.find((n) => n.id === notification_id);
      if (notif) notif.status = 'read';
    }
    res.json({ success: true, unread_count: notificationsStore.filter((n) => n.status === 'unread').length });
  });

  app.post('/api/notifications/clear-all', (req, res) => {
    notificationsStore = [];
    res.json({ success: true });
  });

  // 7. Settings API
  app.get('/api/settings', (req, res) => {
    res.json({
      settings: settingsStore,
      sensors: sensorsStore,
      user: userStore,
    });
  });

  app.post('/api/settings', (req, res) => {
    const { vape_threshold_ppm, warning_threshold_ppm, sound_alert_enabled, email_notifications_enabled, admin_email, supabase_url, supabase_anon_key } = req.body;

    if (typeof vape_threshold_ppm === 'number') settingsStore.vape_threshold_ppm = vape_threshold_ppm;
    if (typeof warning_threshold_ppm === 'number') settingsStore.warning_threshold_ppm = warning_threshold_ppm;
    if (typeof sound_alert_enabled === 'boolean') settingsStore.sound_alert_enabled = sound_alert_enabled;
    if (typeof email_notifications_enabled === 'boolean') settingsStore.email_notifications_enabled = email_notifications_enabled;
    if (admin_email) settingsStore.admin_email = admin_email;
    if (supabase_url) settingsStore.supabase_url = supabase_url;
    if (supabase_anon_key) settingsStore.supabase_anon_key = supabase_anon_key;

    // Reset sensor Alert statuses if threshold changed higher than last readings
    sensorsStore.forEach((s) => {
      if (s.last_ppm < settingsStore.vape_threshold_ppm && s.status === 'Alert') {
        s.status = 'Online';
      }
    });

    res.json({ success: true, settings: settingsStore });
  });

  // Supabase Connection Test
  app.post('/api/supabase/test', async (req, res) => {
    const { url, key } = req.body || {};
    const testUrl = url || settingsStore.supabase_url;
    const testKey = key || settingsStore.supabase_anon_key;
    const result = await testSupabaseConnection(testUrl, testKey);
    res.json(result);
  });

  // Add Sensor
  app.post('/api/sensors/add', (req, res) => {
    const { sensor_name, location, ip_address } = req.body;
    if (!sensor_name || !location) {
      return res.status(400).json({ error: 'Sensor name and location are required.' });
    }

    const newSensor: Sensor = {
      id: `ESP32-CR0${sensorsStore.length + 1}`,
      sensor_name,
      location,
      status: 'Online',
      last_ppm: 150,
      ip_address: ip_address || `192.168.1.10${sensorsStore.length + 1}`,
      wifi_rssi: -58,
      last_ping: new Date().toISOString(),
      created_at: new Date().toISOString(),
    };

    sensorsStore.push(newSensor);
    res.json({ success: true, sensor: newSensor });
  });

  // Delete Sensor
  app.delete('/api/sensors/:id', (req, res) => {
    const { id } = req.params;
    sensorsStore = sensorsStore.filter((s) => s.id !== id);
    res.json({ success: true });
  });

  // Auth Endpoints
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Standard admin login simulation
    if (email.toLowerCase() === 'admin@udm.edu.ph' || password === 'admin123' || password.length >= 4) {
      userStore.email = email;
      return res.json({
        success: true,
        user: userStore,
        token: 'UDM-AUTH-TOKEN-SECURE-2026',
      });
    }

    return res.status(401).json({ error: 'Invalid credentials. Please check email or password.' });
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const { email } = req.body;
    res.json({
      success: true,
      message: `Password reset instructions sent to ${email}. Please check your UDM academic inbox.`,
    });
  });

  // 8. Reports API
  app.get('/api/reports/summary', (req, res) => {
    const analytics = calculateDescriptiveAnalytics(detectionLogsStore);
    res.json({
      university: 'Universidad de Manila',
      college: 'College of Information Technology',
      project_title: 'IoT-Based Vape Detection and Descriptive Data Analytics System',
      generated_at: new Date().toISOString(),
      analytics,
      logs: detectionLogsStore.slice(0, 50),
      settings: settingsStore,
      sensors: sensorsStore,
    });
  });

  // Serve Vite in development, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[UDM IoT Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
