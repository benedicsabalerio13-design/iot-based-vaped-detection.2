import React from 'react';
import { Radio, Wifi, MapPin, Clock, Zap, ShieldAlert, CheckCircle2, Sliders } from 'lucide-react';
import { Sensor } from '../types';

interface LiveMonitoringViewProps {
  sensors: Sensor[];
  thresholdPpm: number;
  warningPpm: number;
  onSimulateSensor: (sensorId: string, location: string, ppm: number) => void;
  onOpenSimulator: () => void;
}

export const LiveMonitoringView: React.FC<LiveMonitoringViewProps> = ({
  sensors,
  thresholdPpm,
  warningPpm,
  onSimulateSensor,
  onOpenSimulator,
}) => {
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Radio className="w-6 h-6 text-blue-600 animate-pulse" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Live Comfort Rooms Monitoring Grid
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time gas concentration readings (PPM) streamed from ESP32 DevKit V1 + MQ-135 microcontrollers across Universidad de Manila.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
          <div className="text-right">
            <p className="text-[10px] text-slate-400 uppercase font-bold">Vape Threshold</p>
            <p className="font-mono font-bold text-amber-600 text-sm">{thresholdPpm} PPM</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <button
            onClick={onOpenSimulator}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center space-x-1"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span>Hardware Tester</span>
          </button>
        </div>
      </div>

      {/* Comfort Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sensors.map((sensor) => {
          const isAlert = sensor.last_ppm >= thresholdPpm;
          const isWarning = sensor.last_ppm >= warningPpm && sensor.last_ppm < thresholdPpm;

          // Gas gauge calculation
          const maxPpmGauge = 800;
          const gaugePercent = Math.min(100, Math.round((sensor.last_ppm / maxPpmGauge) * 100));

          return (
            <div
              key={sensor.id}
              className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 relative overflow-hidden flex flex-col justify-between ${
                isAlert
                  ? 'border-red-400 bg-red-50/30 ring-2 ring-red-400/50 shadow-red-100'
                  : isWarning
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
              }`}
            >
              {/* Top Sensor Header */}
              <div>
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {sensor.id}
                    </span>
                    <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase">
                      PROTOTYPE
                    </span>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isAlert
                        ? 'bg-red-500 text-white animate-pulse'
                        : isWarning
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {isAlert ? 'VAPE DETECTED' : isWarning ? 'WARNING' : 'SAFE'}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                    <Wifi className={`w-3.5 h-3.5 ${sensor.wifi_rssi > -65 ? 'text-emerald-500' : 'text-amber-500'}`} />
                    <span>{sensor.wifi_rssi} dBm</span>
                  </div>
                </div>

                {/* Location Title */}
                <div className="space-y-1 mb-4">
                  <h3 className="text-base font-extrabold text-slate-800 flex items-center space-x-1.5">
                    <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{sensor.location}</span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    IP: {sensor.ip_address} | MQ-135 Gas Sensor Node
                  </p>
                </div>

                {/* Live PPM Display Gauge */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center space-y-2 mb-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Air Gas Concentration
                  </span>

                  <div className="flex items-baseline justify-center space-x-1">
                    <span className={`text-4xl font-black font-mono tracking-tight ${
                      isAlert ? 'text-red-600' : isWarning ? 'text-amber-600' : 'text-slate-800'
                    }`}>
                      {sensor.last_ppm}
                    </span>
                    <span className="text-xs font-bold text-slate-500">PPM</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isAlert ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${gaugePercent}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Clean (150 PPM)</span>
                    <span>Threshold ({thresholdPpm} PPM)</span>
                  </div>
                </div>
              </div>

              {/* Bottom Actions & Last Ping */}
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>Last Ping:</span>
                  </span>
                  <span>{new Date(sensor.last_ping).toLocaleTimeString()}</span>
                </div>

                {/* Quick Simulation Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onSimulateSensor(sensor.id, sensor.location, 180)}
                    className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold py-1.5 rounded-lg border border-emerald-200 transition-colors"
                  >
                    Clean (180 PPM)
                  </button>
                  <button
                    onClick={() => onSimulateSensor(sensor.id, sensor.location, 520)}
                    className="bg-red-50 hover:bg-red-100 text-red-800 text-[11px] font-semibold py-1.5 rounded-lg border border-red-200 transition-colors"
                  >
                    Vape Trigger (520 PPM)
                  </button>
                </div>
              </div>

            </div>
          );
        })}

        {/* Scalable Placeholder Card for Future Nodes */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col justify-between space-y-4 text-xs">
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-slate-400">
              <Sliders className="w-4 h-4 text-blue-500" />
              <span className="font-bold uppercase tracking-wider text-[11px]">Scalable Hardware Architecture</span>
            </div>
            <h3 className="font-bold text-slate-700 text-sm">Future Expansion Node Slot</h3>
            <p className="text-slate-500 leading-relaxed">
              In accordance with Capstone 2 guidelines, only 1 physical prototype sensor node (ESP32-CR01) is deployed. Additional ESP32 + MQ-135 nodes (e.g. CR-02, CR-03) can be dynamically integrated without software modification.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-200/60">
            <span className="text-[11px] text-blue-600 font-bold bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl inline-block">
              ✓ Multi-Node API Ready
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};
