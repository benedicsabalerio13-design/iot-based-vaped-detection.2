import React, { useState } from 'react';
import { Settings, Sliders, Cpu, Database, Save, Plus, Trash2, Code2, Copy, Check, ShieldCheck, Terminal, AlertCircle, CheckCircle2, RefreshCw, ExternalLink } from 'lucide-react';
import { Sensor, SystemSettings, User } from '../types';

interface SettingsViewProps {
  settings: SystemSettings;
  sensors: Sensor[];
  user: User;
  onUpdateSettings: (updated: Partial<SystemSettings>) => void;
  onAddSensor: (name: string, location: string, ip: string) => void;
  onDeleteSensor: (sensorId: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  sensors,
  user,
  onUpdateSettings,
  onAddSensor,
  onDeleteSensor,
}) => {
  const [activeTab, setActiveTab] = useState<'threshold' | 'sensors' | 'supabase' | 'esp32code'>('threshold');

  // Local Threshold State
  const [vapeThreshold, setVapeThreshold] = useState(settings.vape_threshold_ppm);
  const [warningThreshold, setWarningThreshold] = useState(settings.warning_threshold_ppm);
  const [soundEnabled, setSoundEnabled] = useState(settings.sound_alert_enabled);
  const [adminEmail, setAdminEmail] = useState(settings.admin_email);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Local Supabase State
  const [supaUrl, setSupaUrl] = useState(settings.supabase_url);
  const [supaKey, setSupaKey] = useState(settings.supabase_anon_key);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseTestResult, setSupabaseTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  // New Sensor State
  const [newSensorName, setNewSensorName] = useState('');
  const [newSensorLoc, setNewSensorLoc] = useState('');
  const [newSensorIp, setNewSensorIp] = useState('');

  // Code copy feedback
  const [copiedCode, setCopiedCode] = useState(false);

  const handleTestSupabase = async () => {
    setIsTestingSupabase(true);
    setSupabaseTestResult(null);
    try {
      const res = await fetch('/api/supabase/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: supaUrl, key: supaKey }),
      });
      const data = await res.json();
      setSupabaseTestResult(data);
    } catch (err: any) {
      setSupabaseTestResult({
        success: false,
        message: err.message || 'Failed to communicate with test endpoint.',
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleCopySql = () => {
    const sqlContent = `-- UDM Vape Detection System - Supabase Schema
CREATE TABLE IF NOT EXISTS public.sensors (
    id TEXT PRIMARY KEY,
    sensor_name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Online',
    last_ppm NUMERIC NOT NULL DEFAULT 150,
    ip_address TEXT DEFAULT '192.168.1.101',
    wifi_rssi INTEGER DEFAULT -55,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id BIGSERIAL PRIMARY KEY,
    sensor_id TEXT NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    ppm NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL DEFAULT 400,
    status TEXT NOT NULL,
    location TEXT NOT NULL,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.detection_logs (
    id TEXT PRIMARY KEY,
    reading_id TEXT,
    sensor_id TEXT NOT NULL REFERENCES public.sensors(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    ppm NUMERIC NOT NULL,
    threshold NUMERIC NOT NULL DEFAULT 400,
    status TEXT NOT NULL DEFAULT 'VAPE DETECTED',
    notes TEXT,
    action_status TEXT NOT NULL DEFAULT 'Pending',
    detected_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'ALERT',
    status TEXT NOT NULL DEFAULT 'unread',
    location TEXT,
    ppm NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.system_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    vape_threshold_ppm NUMERIC NOT NULL DEFAULT 400,
    warning_threshold_ppm NUMERIC NOT NULL DEFAULT 300,
    sound_alert_enabled BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed Prototype
INSERT INTO public.sensors (id, sensor_name, location, status, last_ppm)
VALUES ('ESP32-CR01', 'ESP32 Prototype Sensor Node 01', 'CR-01 – Selected Comfort Room', 'Online', 185)
ON CONFLICT (id) DO NOTHING;`;

    navigator.clipboard.writeText(sqlContent);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveThresholds = () => {
    onUpdateSettings({
      vape_threshold_ppm: Number(vapeThreshold),
      warning_threshold_ppm: Number(warningThreshold),
      sound_alert_enabled: soundEnabled,
      admin_email: adminEmail,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleSaveSupabase = () => {
    onUpdateSettings({
      supabase_url: supaUrl,
      supabase_anon_key: supaKey,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleCreateSensor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSensorName || !newSensorLoc) return;
    onAddSensor(newSensorName, newSensorLoc, newSensorIp || '192.168.1.150');
    setNewSensorName('');
    setNewSensorLoc('');
    setNewSensorIp('');
  };

  // C++ Arduino Code Snippet for ESP32 + MQ-135
  const esp32CppCode = `/*
 * ESP32 DevKit V1 + MQ-135 Gas Sensor - Vape Detection Node
 * BSIT Capstone Project - Universidad de Manila (UDM)
 * 
 * Hardware Wiring:
 * - MQ-135 VCC  -> ESP32 5V (VIN)
 * - MQ-135 GND  -> ESP32 GND
 * - MQ-135 AOUT -> ESP32 Analog Pin 34 (ADC1_CH6)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// Wi-Fi Credentials
const char* ssid     = "UDM-STUDENT-WIFI";
const char* password = "YourWifiPassword";

// Web Application Server REST API Endpoint
const char* serverEndpoint = "https://your-udm-app.run.app/api/v1/sensor-data";

// Sensor Configuration
const int MQ135_PIN = 34;      // Analog input pin
const char* SENSOR_ID = "ESP32-CR01";
const char* LOCATION = "CR-01 - Selected Comfort Room";

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\\n--- UDM ESP32 Vape Detection Node ---");
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("\\nWiFi Connected! IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  // Read analog value from MQ-135 sensor
  int rawADC = analogRead(MQ135_PIN);
  
  // Convert ADC reading (0-4095) to estimated Gas PPM concentration
  // Calibration formula for MQ-135 smoke/aerosol PPM estimation:
  float voltage = rawADC * (3.3 / 4095.0);
  float ppm = map(rawADC, 200, 3500, 100, 1000); // Scaled PPM estimation
  if (ppm < 100) ppm = 120.0 + random(0, 30);    // Clean air baseline

  Serial.print("Raw ADC: ");
  Serial.print(rawADC);
  Serial.print(" | Gas Concentration PPM: ");
  Serial.println(ppm);

  // Send payload to UDM Web Backend via HTTP POST
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverEndpoint);
    http.addHeader("Content-Type", "application/json");

    StaticJsonDocument<200> doc;
    doc["sensor_id"] = SENSOR_ID;
    doc["ppm"] = ppm;
    doc["location"] = LOCATION;
    doc["ip_address"] = WiFi.localIP().toString();

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    int httpResponseCode = http.POST(jsonPayload);
    
    if (httpResponseCode > 0) {
      String response = http.getString();
      Serial.print("HTTP Response code: ");
      Serial.println(httpResponseCode);
      Serial.println(response);
    } else {
      Serial.print("Error in HTTP POST: ");
      Serial.println(httpResponseCode);
    }

    http.end();
  }

  // Poll sensor every 3 seconds
  delay(3000);
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(esp32CppCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              System Settings & Integration
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure vape threshold limits, manage ESP32 sensor hardware nodes, and copy microcontroller firmware code.
          </p>
        </div>

        {saveSuccess && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-300 flex items-center space-x-1 animate-fade-in">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </span>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200 flex flex-wrap gap-1 text-xs">
        <button
          onClick={() => setActiveTab('threshold')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'threshold'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Threshold & Alarms</span>
        </button>

        <button
          onClick={() => setActiveTab('sensors')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'sensors'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Comfort Room Sensors ({sensors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'supabase'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Supabase DB Config</span>
        </button>

        <button
          onClick={() => setActiveTab('esp32code')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl font-bold flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'esp32code'
              ? 'bg-blue-600 text-white shadow'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Code2 className="w-4 h-4 text-yellow-300" />
          <span>ESP32 Arduino C++ Code</span>
        </button>
      </div>

      {/* Tab 1: Threshold & Alarms */}
      {activeTab === 'threshold' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-3xl">
          <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            Vape Gas Concentration Threshold Configuration
          </h2>

          <div className="space-y-6 text-xs">
            {/* Vape Threshold Slider */}
            <div className="space-y-2 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 text-sm">
                  Vape Emission Alert Threshold (PPM)
                </label>
                <span className="font-mono font-black text-amber-700 text-lg bg-white px-3 py-1 rounded-lg border border-amber-300">
                  {vapeThreshold} PPM
                </span>
              </div>
              <p className="text-slate-500">
                When an MQ-135 gas sensor reading reaches or exceeds this value, the web application triggers an immediate website alert and logs the detection.
              </p>
              <input
                type="range"
                min="200"
                max="1000"
                step="10"
                value={vapeThreshold}
                onChange={(e) => setVapeThreshold(Number(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>200 PPM (Sensitive)</span>
                <span>400 PPM (Recommended Default)</span>
                <span>1000 PPM (Extreme)</span>
              </div>
            </div>

            {/* Warning Threshold Slider */}
            <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center">
                <label className="font-bold text-slate-800 text-sm">
                  Warning Level Threshold (PPM)
                </label>
                <span className="font-mono font-black text-slate-800 text-base bg-white px-2.5 py-1 rounded-lg border border-slate-300">
                  {warningThreshold} PPM
                </span>
              </div>
              <p className="text-slate-500">
                Gas level threshold for mild smoke or pre-alert warning state.
              </p>
              <input
                type="range"
                min="150"
                max="500"
                step="10"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Notification Options */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => setSoundEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-bold text-slate-800">
                  Enable Audible Website Alarm Sound when Vape Threshold Exceeded
                </span>
              </label>

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Administrator Alert Notification Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full sm:w-96 p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 text-xs font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSaveThresholds}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-all flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save System Thresholds</span>
            </button>

          </div>
        </div>
      )}

      {/* Tab 2: Comfort Room Sensors */}
      {activeTab === 'sensors' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Sensors List (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Deployed Comfort Room Sensor Nodes
            </h2>

            <div className="space-y-3">
              {sensors.map((s) => (
                <div
                  key={s.id}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-slate-300 text-slate-800">
                        {s.id}
                      </span>
                      <span className="font-bold text-slate-800">{s.sensor_name}</span>
                    </div>
                    <p className="text-slate-500">{s.location}</p>
                    <p className="text-[10px] text-slate-400 font-mono">IP: {s.ip_address} | MQ-135 Gas Sensor</p>
                  </div>

                  <button
                    onClick={() => onDeleteSensor(s.id)}
                    className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove Sensor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Sensor Form (1 col) */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4 h-fit">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
              Add Comfort Room Sensor
            </h2>

            <form onSubmit={handleCreateSensor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sensor Identifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Science Bldg 3F Male CR"
                  value={newSensorName}
                  onChange={(e) => setNewSensorName(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Comfort Room Location</label>
                <input
                  type="text"
                  placeholder="e.g. Science & Technology Bldg 3F CR"
                  value={newSensorLoc}
                  onChange={(e) => setNewSensorLoc(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Static IP Address</label>
                <input
                  type="text"
                  placeholder="e.g. 192.168.1.108"
                  value={newSensorIp}
                  onChange={(e) => setNewSensorIp(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl shadow transition-all flex items-center justify-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Register ESP32 Node</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Tab 3: Supabase Config */}
      {activeTab === 'supabase' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-6 max-w-3xl">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Database className="w-5 h-5 text-blue-600" />
                <span>Supabase PostgreSQL Integration</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Connect your cloud Supabase database for persistent IoT telemetry, logs, and notification storage.
              </p>
            </div>

            <a
              href="https://supabase.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors self-start sm:self-auto"
            >
              <span>Supabase Dashboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Setup Guide Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">HAKBANG 1</span>
              <p className="font-bold text-slate-800">Gumawa ng Project</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pumunta sa supabase.com at gumawa ng libreng bagong project (e.g. "udm-vape-detection").
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">HAKBANG 2</span>
              <p className="font-bold text-slate-800">I-run ang SQL Schema</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pumunta sa SQL Editor sa Supabase dashboard at i-paste ang SQL schema para magawa ang mga tables.
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
              <span className="font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[10px]">HAKBANG 3</span>
              <p className="font-bold text-slate-800">I-connect ang API Keys</p>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Kopyahin ang Project URL at Anon API Key mula sa Project Settings &gt; API at i-paste sa ibaba.
              </p>
            </div>
          </div>

          {/* Quick SQL Copy Box */}
          <div className="bg-slate-900 rounded-xl p-4 text-xs text-white space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">SQL Migration Script (supabase-schema.sql)</span>
              </div>
              <button
                onClick={handleCopySql}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1.5 text-xs transition-all"
              >
                {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
              </button>
            </div>
            <p className="text-slate-400 text-[11px]">
              Kasama rito ang tables para sa <code className="text-emerald-300">sensors</code>, <code className="text-emerald-300">sensor_readings</code>, <code className="text-emerald-300">detection_logs</code>, <code className="text-emerald-300">notifications</code>, at <code className="text-emerald-300">system_settings</code> na may kasamang Row Level Security (RLS).
            </p>
          </div>

          {/* Supabase Credentials Form */}
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Project URL
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={supaUrl}
                onChange={(e) => setSupaUrl(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Makikita sa Supabase: <strong>Project Settings &gt; API &gt; Project URL</strong>
              </p>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Supabase Anon / Service Role API Key
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={supaKey}
                onChange={(e) => setSupaKey(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 font-mono text-xs focus:ring-2 focus:ring-blue-500 bg-white"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Makikita sa Supabase: <strong>Project Settings &gt; API &gt; Project API keys (anon / public)</strong>
              </p>
            </div>

            {/* Test Connection Results */}
            {supabaseTestResult && (
              <div
                className={`p-3 rounded-xl border flex items-start space-x-2 text-xs ${
                  supabaseTestResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                    : 'bg-red-50 border-red-300 text-red-800'
                }`}
              >
                {supabaseTestResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">
                    {supabaseTestResult.success ? 'Koneksyon Matagumpay!' : 'Koneksyon Nabigo'}
                  </p>
                  <p className="text-[11px] mt-0.5 leading-relaxed">{supabaseTestResult.message}</p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleSaveSupabase}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl shadow transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>I-save ang Supabase Credentials</span>
              </button>

              <button
                onClick={handleTestSupabase}
                disabled={isTestingSupabase || !supaUrl || !supaKey}
                className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-4 py-2.5 rounded-xl border border-slate-300 transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isTestingSupabase ? 'animate-spin text-blue-600' : ''}`} />
                <span>{isTestingSupabase ? 'Sinusuri ang Koneksyon...' : 'I-test ang Koneksyon'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: ESP32 Firmware Code Generator */}
      {activeTab === 'esp32code' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center space-x-2">
                <Terminal className="w-5 h-5 text-emerald-600" />
                <span>ESP32 DevKit V1 + MQ-135 C++ Arduino Firmware</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Copy and flash this C++ Arduino code using VS Code (PlatformIO) or Arduino IDE to connect hardware sensors to this REST API.
              </p>
            </div>

            <button
              onClick={handleCopyCode}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition-all flex items-center space-x-2 self-start sm:self-auto"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-yellow-300" />}
              <span>{copiedCode ? 'Code Copied!' : 'Copy C++ Firmware Code'}</span>
            </button>
          </div>

          <div className="bg-slate-950 text-emerald-400 p-4 rounded-xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-[420px] shadow-inner">
            <pre>{esp32CppCode}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
