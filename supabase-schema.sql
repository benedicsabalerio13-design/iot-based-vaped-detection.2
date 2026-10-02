-- ==============================================================================
-- UNIVERSIDAD DE MANILA (UDM) - CAMPUS SAFETY & IOT VAPE DETECTION SYSTEM
-- Supabase PostgreSQL Database Schema (Capstone 2 Prototype)
-- ==============================================================================

-- 1. SENSORS TABLE
-- Keeps track of deployed hardware prototype nodes (ESP32 DevKit V1 + MQ-135)
CREATE TABLE IF NOT EXISTS public.sensors (
    id TEXT PRIMARY KEY,
    sensor_name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Online', -- 'Online', 'Offline', 'Alert', 'Maintenance'
    last_ppm NUMERIC NOT NULL DEFAULT 150,
    ip_address TEXT DEFAULT '192.168.1.101',
    wifi_rssi INTEGER DEFAULT -55,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SENSOR READINGS TABLE (Continuous Telemetry Stream)
CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id TEXT NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    ppm NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL DEFAULT 400,
    status TEXT NOT NULL, -- 'SAFE', 'WARNING', 'VAPE DETECTED'
    location TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster time-series analytical queries
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON public.sensor_readings(recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON public.sensor_readings(sensor_id);

-- 3. DETECTION LOGS TABLE (Recorded Vape Aerosol Incidents)
CREATE TABLE IF NOT EXISTS public.detection_logs (
    id TEXT PRIMARY KEY,
    reading_id TEXT,
    sensor_id TEXT NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    ppm NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL DEFAULT 400,
    status TEXT NOT NULL DEFAULT 'VAPE DETECTED',
    notes TEXT,
    action_status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Investigated', 'Resolved', 'False Positive'
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detection_logs_detected_at ON public.detection_logs(detected_at DESC);

-- 4. NOTIFICATIONS TABLE (Real-time Website Alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'ALERT', -- 'ALERT', 'WARNING', 'SYSTEM', 'INFO'
    status TEXT NOT NULL DEFAULT 'unread', -- 'unread', 'read'
    location TEXT,
    ppm NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SYSTEM SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    vape_threshold_ppm NUMERIC NOT NULL DEFAULT 400,
    warning_threshold_ppm NUMERIC NOT NULL DEFAULT 300,
    sensor_poll_interval_sec INTEGER NOT NULL DEFAULT 2,
    alert_cooldown_sec INTEGER NOT NULL DEFAULT 30,
    sound_alert_enabled BOOLEAN NOT NULL DEFAULT true,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    admin_email TEXT NOT NULL DEFAULT 'safety@udm.edu.ph',
    udm_campus_code TEXT NOT NULL DEFAULT 'UDM-MAIN-MANILA',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detection_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Allow Public Access / Anon Key for Capstone Demo (Read & Write)
-- Drop existing policies if rerun
DROP POLICY IF EXISTS "Allow anon read sensors" ON public.sensors;
DROP POLICY IF EXISTS "Allow anon write sensors" ON public.sensors;
CREATE POLICY "Allow anon read sensors" ON public.sensors FOR SELECT USING (true);
CREATE POLICY "Allow anon write sensors" ON public.sensors FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read sensor_readings" ON public.sensor_readings;
DROP POLICY IF EXISTS "Allow anon insert sensor_readings" ON public.sensor_readings;
CREATE POLICY "Allow anon read sensor_readings" ON public.sensor_readings FOR SELECT USING (true);
CREATE POLICY "Allow anon insert sensor_readings" ON public.sensor_readings FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read detection_logs" ON public.detection_logs;
DROP POLICY IF EXISTS "Allow anon write detection_logs" ON public.detection_logs;
CREATE POLICY "Allow anon read detection_logs" ON public.detection_logs FOR SELECT USING (true);
CREATE POLICY "Allow anon write detection_logs" ON public.detection_logs FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow anon write notifications" ON public.notifications;
CREATE POLICY "Allow anon read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Allow anon write notifications" ON public.notifications FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow anon read system_settings" ON public.system_settings;
DROP POLICY IF EXISTS "Allow anon write system_settings" ON public.system_settings;
CREATE POLICY "Allow anon read system_settings" ON public.system_settings FOR SELECT USING (true);
CREATE POLICY "Allow anon write system_settings" ON public.system_settings FOR ALL USING (true);

-- ==============================================================================
-- INITIAL PROTOTYPE SEED DATA (Single Prototype Node: ESP32-CR01)
-- ==============================================================================
INSERT INTO public.sensors (id, sensor_name, location, status, last_ppm, ip_address, wifi_rssi)
VALUES (
    'ESP32-CR01',
    'ESP32 Prototype Sensor Node 01',
    'CR-01 – Selected Comfort Room',
    'Online',
    185,
    '192.168.1.101',
    -55
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.system_settings (id, vape_threshold_ppm, warning_threshold_ppm, sound_alert_enabled)
VALUES (1, 400, 300, true)
ON CONFLICT (id) DO NOTHING;
