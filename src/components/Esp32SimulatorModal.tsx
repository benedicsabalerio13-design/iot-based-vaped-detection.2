import React, { useState } from 'react';
import { Radio, Zap, Send, X, CheckCircle2, AlertTriangle, Cpu, ArrowRight } from 'lucide-react';
import { Sensor } from '../types';

interface Esp32SimulatorModalProps {
  sensors: Sensor[];
  thresholdPpm: number;
  isOpen: boolean;
  onClose: () => void;
  onSendPayload: (sensorId: string, location: string, ppm: number) => Promise<any>;
}

export const Esp32SimulatorModal: React.FC<Esp32SimulatorModalProps> = ({
  sensors,
  thresholdPpm,
  isOpen,
  onClose,
  onSendPayload,
}) => {
  if (!isOpen) return null;

  const [selectedSensorId, setSelectedSensorId] = useState(sensors[0]?.id || 'ESP32-CR01');
  const [ppmValue, setPpmValue] = useState(520);
  const [isSending, setIsSending] = useState(false);
  const [lastResponse, setLastResponse] = useState<any>(null);

  const selectedSensor = sensors.find((s) => s.id === selectedSensorId) || sensors[0];

  const handleSimulateSend = async () => {
    setIsSending(true);
    setLastResponse(null);
    try {
      const res = await onSendPayload(
        selectedSensorId,
        selectedSensor?.location || 'CR-01 – Selected Comfort Room',
        ppmValue
      );
      setLastResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  const isTrigger = ppmValue >= thresholdPpm;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-slate-200 space-y-5 animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-yellow-400 text-slate-900 rounded-xl">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg leading-tight">
                ESP32 Hardware Payload Simulator
              </h3>
              <p className="text-xs text-slate-500">
                Simulate HTTP POST requests sent by ESP32 DevKit V1 + MQ-135 sensors
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="space-y-4 text-xs">
          
          {/* Select Sensor Node */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select ESP32 Sensor Node (UDM Comfort Room)
            </label>
            <select
              value={selectedSensorId}
              onChange={(e) => setSelectedSensorId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-blue-500 bg-slate-50"
            >
              {sensors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.location}
                </option>
              ))}
            </select>
          </div>

          {/* Gas Concentration PPM Slider & Presets */}
          <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm">
                MQ-135 Gas Reading (PPM)
              </span>
              <span className={`font-mono font-black text-xl px-3 py-0.5 rounded-lg ${
                isTrigger ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-200 text-slate-800'
              }`}>
                {ppmValue} PPM
              </span>
            </div>

            <input
              type="range"
              min="100"
              max="900"
              step="10"
              value={ppmValue}
              onChange={(e) => setPpmValue(Number(e.target.value))}
              className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />

            {/* Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => setPpmValue(180)}
                className="p-2 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 hover:border-emerald-300 font-semibold text-slate-700 transition-colors text-center"
              >
                <span className="block text-[10px] text-emerald-600 uppercase font-bold">Clean Air</span>
                <span>180 PPM</span>
              </button>

              <button
                onClick={() => setPpmValue(320)}
                className="p-2 bg-white hover:bg-amber-50 rounded-xl border border-slate-200 hover:border-amber-300 font-semibold text-slate-700 transition-colors text-center"
              >
                <span className="block text-[10px] text-amber-600 uppercase font-bold">Mild Smoke</span>
                <span>320 PPM</span>
              </button>

              <button
                onClick={() => setPpmValue(520)}
                className="p-2 bg-white hover:bg-red-50 rounded-xl border border-slate-200 hover:border-red-300 font-semibold text-slate-700 transition-colors text-center"
              >
                <span className="block text-[10px] text-red-600 uppercase font-bold">Vape Trigger</span>
                <span>520 PPM</span>
              </button>

              <button
                onClick={() => setPpmValue(820)}
                className="p-2 bg-white hover:bg-rose-50 rounded-xl border border-slate-200 hover:border-rose-300 font-semibold text-slate-700 transition-colors text-center"
              >
                <span className="block text-[10px] text-rose-700 uppercase font-bold">Heavy Aerosol</span>
                <span>820 PPM</span>
              </button>
            </div>
          </div>

          {/* JSON Payload Preview */}
          <div className="bg-slate-950 text-slate-200 p-3 rounded-xl font-mono text-[11px] space-y-1">
            <p className="text-slate-400 font-bold">POST /api/v1/sensor-data</p>
            <p className="text-emerald-400">
              {JSON.stringify(
                {
                  sensor_id: selectedSensorId,
                  ppm: ppmValue,
                  location: selectedSensor?.location,
                  ip_address: selectedSensor?.ip_address || '192.168.1.101',
                },
                null,
                2
              )}
            </p>
          </div>

          {/* Response Box */}
          {lastResponse && (
            <div className={`p-3 rounded-xl border font-mono text-[11px] ${
              lastResponse.alert_triggered
                ? 'bg-red-50 border-red-300 text-red-900'
                : 'bg-emerald-50 border-emerald-300 text-emerald-900'
            }`}>
              <p className="font-bold mb-1 flex items-center space-x-1">
                {lastResponse.alert_triggered ? (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                <span>
                  Server Response: {lastResponse.alert_triggered ? 'ALERT TRIGGERED & NOTIFICATION CREATED!' : 'READING RECORDED (NORMAL)'}
                </span>
              </p>
              <p>Threshold: {lastResponse.threshold} PPM | Reading Status: {lastResponse.reading?.status}</p>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handleSimulateSend}
            disabled={isSending}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow flex items-center space-x-2 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{isSending ? 'Transmitting Payload...' : 'Send Hardware Payload'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
