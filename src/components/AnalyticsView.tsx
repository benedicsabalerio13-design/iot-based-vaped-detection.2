import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { BarChart3, Clock, MapPin, TrendingUp, Info, Activity, Sliders, Shield } from 'lucide-react';
import { DescriptiveAnalytics } from '../types';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface AnalyticsViewProps {
  analytics: DescriptiveAnalytics;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics }) => {
  // Chart 1: Peak Detection Hours (00:00 - 23:00)
  const peakHoursChartData = {
    labels: analytics.hourlyFrequency.map((h) => h.hour),
    datasets: [
      {
        label: 'Detection Frequency (Incidents)',
        data: analytics.hourlyFrequency.map((h) => h.count),
        backgroundColor: 'rgba(239, 68, 68, 0.75)', // Red
        borderColor: '#DC2626',
        borderWidth: 1.5,
        borderRadius: 4,
      },
    ],
  };

  // Chart 2: Daily Detection Frequency (Mon - Sun)
  const dailyFreqChartData = {
    labels: analytics.dailyFrequency.map((d) => d.label),
    datasets: [
      {
        label: 'Incident Count',
        data: analytics.dailyFrequency.map((d) => d.count),
        backgroundColor: 'rgba(37, 99, 235, 0.8)', // UDM Blue
        borderColor: '#1D4ED8',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Chart 3: Top Affected Comfort Rooms (Horizontal Bar)
  const locationChartData = {
    labels: analytics.locationStats.map((l) => l.location),
    datasets: [
      {
        label: 'Total Detection Events',
        data: analytics.locationStats.map((l) => l.count),
        backgroundColor: 'rgba(245, 158, 11, 0.8)', // Amber
        borderColor: '#D97706',
        borderWidth: 1.5,
        borderRadius: 6,
      },
    ],
  };

  // Chart 4: 7-Day Trend Line Chart
  const trendLineData = {
    labels: analytics.trend7Days.map((t) => t.date),
    datasets: [
      {
        label: 'Daily Incident Frequency',
        data: analytics.trend7Days.map((t) => t.count),
        fill: true,
        borderColor: '#2563EB',
        backgroundColor: 'rgba(37, 99, 235, 0.12)',
        tension: 0.35,
        pointBackgroundColor: '#1E40AF',
        pointRadius: 4,
      },
    ],
  };

  // Common chart options
  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: { family: 'sans-serif', size: 11, weight: 600 },
          color: '#334155',
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#64748B' },
        grid: { color: '#E2E8F0' },
      },
      x: {
        ticks: { color: '#64748B', font: { size: 10 } },
        grid: { display: false },
      },
    },
  };

  const horizontalChartOptions = {
    ...baseChartOptions,
    indexAxis: 'y' as const,
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Descriptive Data Analytics
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Statistical summaries and frequency distributions for vape detection events recorded by prototype node ESP32-CR01 at Universidad de Manila.
          </p>
        </div>

        {/* Academic Scope Tag */}
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-3 rounded-xl text-xs max-w-sm flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-tight">
            <strong>BSIT Capstone Scope:</strong> Purely descriptive analytics (frequencies, means, standard deviations, and time trends) for prototype location CR-01. <span className="underline">No machine learning or predictive models used.</span>
          </p>
        </div>
      </div>

      {/* Statistical Cards Grid (6 Stats Cards) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Logged</p>
          <p className="text-2xl font-black text-slate-800 font-mono">{analytics.totalDetections}</p>
          <p className="text-[10px] text-slate-500">Incident Events</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Mean Gas Reading</p>
          <p className="text-2xl font-black text-red-600 font-mono">{analytics.meanPpm} <span className="text-xs text-slate-400">PPM</span></p>
          <p className="text-[10px] text-slate-500">Average during alerts</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Max PPM Recorded</p>
          <p className="text-2xl font-black text-amber-600 font-mono">{analytics.maxPpmRecorded} <span className="text-xs text-slate-400">PPM</span></p>
          <p className="text-[10px] text-slate-500">Peak concentration</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Median Gas Reading</p>
          <p className="text-2xl font-black text-blue-600 font-mono">{analytics.medianPpm} <span className="text-xs text-slate-400">PPM</span></p>
          <p className="text-[10px] text-slate-500">50th percentile</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Std Deviation (σ)</p>
          <p className="text-2xl font-black text-indigo-600 font-mono">±{analytics.standardDeviationPpm}</p>
          <p className="text-[10px] text-slate-500">PPM variance</p>
        </div>

        <div className="bg-white rounded-xl p-3.5 shadow-sm border border-slate-200 space-y-1">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Peak Risk Hour</p>
          <p className="text-sm font-black text-slate-800 font-mono mt-1 leading-tight">{analytics.peakHour}</p>
          <p className="text-[10px] text-slate-500">Highest frequency</p>
        </div>

      </div>

      {/* Charts Grid - 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Peak Detection Hours */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <Clock className="w-4 h-4 text-red-500" />
              <span>Peak Detection Hours (00:00 - 23:00)</span>
            </h3>
            <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded">
              Hourly Frequency
            </span>
          </div>
          <div className="h-64">
            <Bar data={peakHoursChartData} options={baseChartOptions} />
          </div>
        </div>

        {/* Chart 2: Top Affected Comfort Rooms */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Most Frequent Detection Locations</span>
            </h3>
            <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded">
              Location Ranking
            </span>
          </div>
          <div className="h-64">
            <Bar data={locationChartData} options={horizontalChartOptions} />
          </div>
        </div>

        {/* Chart 3: Daily Detection Frequency */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Daily Detection Frequency (Day of Week)</span>
            </h3>
            <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded">
              Weekly Distribution
            </span>
          </div>
          <div className="h-64">
            <Bar data={dailyFreqChartData} options={baseChartOptions} />
          </div>
        </div>

        {/* Chart 4: 7-Day Trend Line */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              <span>7-Day Detection Trend Line</span>
            </h3>
            <span className="text-[10px] bg-slate-100 font-mono text-slate-600 px-2 py-0.5 rounded">
              Sequential Moving Count
            </span>
          </div>
          <div className="h-64">
            <Line data={trendLineData} options={baseChartOptions} />
          </div>
        </div>

      </div>

      {/* Statistical Summary Matrix Table */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        <h3 className="font-bold text-slate-800 text-base">
          Descriptive Statistical Matrix by Location
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3">Comfort Room Location</th>
                <th className="p-3 text-center">Incidents Count</th>
                <th className="p-3 text-center">Percentage of Total</th>
                <th className="p-3 text-center">Mean PPM</th>
                <th className="p-3 text-center">Peak PPM Recorded</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {analytics.locationStats.map((loc) => {
                const pct = analytics.totalDetections > 0
                  ? Math.round((loc.count / analytics.totalDetections) * 100)
                  : 0;
                return (
                  <tr key={loc.location} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-800 flex items-center space-x-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>{loc.location}</span>
                    </td>
                    <td className="p-3 text-center font-bold text-slate-900 font-mono">{loc.count}</td>
                    <td className="p-3 text-center font-mono">
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-blue-600 h-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span>{pct}%</span>
                      </div>
                    </td>
                    <td className="p-3 text-center font-mono font-bold text-red-600">{loc.avg_ppm} PPM</td>
                    <td className="p-3 text-center font-mono text-slate-700">{loc.max_ppm} PPM</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
