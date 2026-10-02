import React, { useState } from 'react';
import { FileSpreadsheet, Printer, Download, Shield, Calendar, MapPin, CheckCircle } from 'lucide-react';
import { DescriptiveAnalytics, DetectionLog, SystemSettings } from '../types';

interface ReportsViewProps {
  analytics: DescriptiveAnalytics;
  logs: DetectionLog[];
  settings: SystemSettings;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  analytics,
  logs,
  settings,
}) => {
  const [reportType, setReportType] = useState<'Daily' | 'Weekly' | 'Monthly' | 'Summary'>('Daily');

  // Filter logs according to report type
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const sevenDaysAgo = now.getTime() - 7 * 86400000;
  const thirtyDaysAgo = now.getTime() - 30 * 86400000;

  let reportLogs = logs;
  if (reportType === 'Daily') {
    reportLogs = logs.filter((l) => new Date(l.detected_at).getTime() >= todayStart);
  } else if (reportType === 'Weekly') {
    reportLogs = logs.filter((l) => new Date(l.detected_at).getTime() >= sevenDaysAgo);
  } else if (reportType === 'Monthly') {
    reportLogs = logs.filter((l) => new Date(l.detected_at).getTime() >= thirtyDaysAgo);
  }

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Time', 'Location', 'PPM', 'Threshold', 'Status', 'Action Status', 'Notes'];
    const rows = reportLogs.map((l) => [
      l.id,
      new Date(l.detected_at).toLocaleDateString(),
      new Date(l.detected_at).toLocaleTimeString(),
      `"${l.location}"`,
      l.ppm,
      l.threshold,
      l.status,
      l.action_status || 'Pending',
      `"${(l.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `UDM_${reportType}_Vape_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Controls Bar */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Academic Safety Reports Generator
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate printable, audit-ready campus safety summaries for Universidad de Manila administration and thesis defense.
          </p>
        </div>

        {/* Report Type Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-100 p-1 rounded-xl flex space-x-1 text-xs">
            {(['Daily', 'Weekly', 'Monthly', 'Summary'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setReportType(type)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  reportType === type
                    ? 'bg-blue-600 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={handlePrint}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow transition-colors flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Formal Printable Report Paper */}
      <div className="bg-white rounded-2xl p-8 sm:p-12 shadow-lg border border-slate-200 space-y-8 print:shadow-none print:border-none print:p-0">
        
        {/* Letterhead Header */}
        <div className="border-b-2 border-slate-900 pb-6 text-center space-y-2">
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-10 h-10 text-[#002B49]" />
            <div className="text-left">
              <h2 className="text-xl font-extrabold text-[#002B49] uppercase tracking-wide">
                UNIVERSIDAD DE MANILA
              </h2>
              <p className="text-xs text-slate-600 font-medium">
                Mehan Garden, Ermita, Manila, Philippines
              </p>
              <p className="text-[11px] text-blue-900 font-bold">
                Campus Safety Monitoring & IoT Engineering Division
              </p>
            </div>
          </div>

          <div className="pt-3">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider underline">
              {reportType.toUpperCase()} VAPE DETECTION & DESCRIPTIVE ANALYTICS REPORT
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Generated: {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Report Metadata Table */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <p className="text-slate-400 font-medium">Report Scope:</p>
            <p className="font-bold text-slate-800">{reportType} Incident Summary</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Configured Threshold:</p>
            <p className="font-bold text-amber-600 font-mono">{settings.vape_threshold_ppm} PPM</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Total Incidents Logged:</p>
            <p className="font-bold text-red-600 font-mono">{reportLogs.length} Events</p>
          </div>
          <div>
            <p className="text-slate-400 font-medium">Campus Code:</p>
            <p className="font-bold text-slate-800 font-mono">{settings.udm_campus_code}</p>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-1">
            I. Executive Descriptive Summary
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">Average Concentration during Alerts:</p>
              <p className="text-xl font-bold font-mono text-slate-800 mt-1">{analytics.meanPpm} PPM</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">Highest Recorded Gas Concentration:</p>
              <p className="text-xl font-bold font-mono text-red-600 mt-1">{analytics.maxPpmRecorded} PPM</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-slate-500">Most Affected Comfort Room:</p>
              <p className="text-sm font-bold text-slate-800 mt-1">{analytics.mostAffectedLocation}</p>
            </div>
          </div>
        </div>

        {/* Incident Log Breakdown Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider border-b border-slate-200 pb-1">
            II. Recorded Incident Logs Breakdown
          </h4>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200">
              <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-2 border.r">Log ID</th>
                  <th className="p-2 border-r">Timestamp</th>
                  <th className="p-2 border-r">Location</th>
                  <th className="p-2 border-r text-center">Reading (PPM)</th>
                  <th className="p-2 border-r">Action Status</th>
                  <th className="p-2">Officer Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-mono">
                {reportLogs.length > 0 ? (
                  reportLogs.map((log) => (
                    <tr key={log.id} className="text-[11px]">
                      <td className="p-2 border-r font-bold">{log.id}</td>
                      <td className="p-2 border-r">{new Date(log.detected_at).toLocaleString()}</td>
                      <td className="p-2 border-r font-sans">{log.location}</td>
                      <td className="p-2 border-r text-center font-bold text-red-600">{log.ppm}</td>
                      <td className="p-2 border-r font-sans">{log.action_status || 'Pending'}</td>
                      <td className="p-2 font-sans italic text-slate-600">{log.notes || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-4 text-center text-slate-500 font-sans">
                      No detection events recorded for this report timeframe.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Signatures Section for Capstone Evaluation */}
        <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-8">
            <p className="font-semibold text-slate-700">Prepared By:</p>
            <div className="border-t border-slate-800 pt-1">
              <p className="font-bold text-slate-900">Prof. Christina P. Atal</p>
              <p className="text-slate-500">CCS Program Chair. / Capstone Adviser</p>
              <p className="text-slate-400 text-[10px]">Universidad de Manila</p>
            </div>
          </div>

          <div className="space-y-8">
            <p className="font-semibold text-slate-700">Approved By:</p>
            <div className="border-t border-slate-800 pt-1">
              <p className="font-bold text-slate-900">Dean Francis Atienza</p>
              <p className="text-slate-500">Dean, College of Computing Studies</p>
              <p className="text-slate-400 text-[10px]">Universidad de Manila</p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
