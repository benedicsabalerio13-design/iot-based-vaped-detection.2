import React, { useState } from 'react';
import {
  FileText,
  Search,
  Download,
  Filter,
  MapPin,
  Flame,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import { DetectionLog } from '../types';

interface DetectionLogsViewProps {
  logs: DetectionLog[];
  locations: string[];
  onUpdateLogAction: (logId: string, actionStatus: string, notes: string) => void;
}

export const DetectionLogsView: React.FC<DetectionLogsViewProps> = ({
  logs,
  locations,
  onUpdateLogAction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedAction, setSelectedAction] = useState('All');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_ppm'>('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Selected Log Modal state for updating investigation notes
  const [editingLog, setEditingLog] = useState<DetectionLog | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editAction, setEditAction] = useState('Investigated');

  // Filter & Search Logic
  let filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesLocation = selectedLocation === 'All' || log.location === selectedLocation;
    const matchesAction = selectedAction === 'All' || (log.action_status || 'Pending') === selectedAction;

    return matchesSearch && matchesLocation && matchesAction;
  });

  // Sorting
  filteredLogs.sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.detected_at).getTime() - new Date(a.detected_at).getTime();
    } else if (sortOrder === 'oldest') {
      return new Date(a.detected_at).getTime() - new Date(b.detected_at).getTime();
    } else if (sortOrder === 'highest_ppm') {
      return b.ppm - a.ppm;
    }
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // CSV Export Generator
  const handleExportCSV = () => {
    const headers = ['Detection ID', 'Date', 'Time', 'Location', 'PPM Reading', 'Threshold', 'Status', 'Action Status', 'Notes'];
    const rows = filteredLogs.map((l) => [
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
    link.setAttribute('download', `UDM_Vape_Detection_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEdit = (log: DetectionLog) => {
    setEditingLog(log);
    setEditNotes(log.notes || '');
    setEditAction(log.action_status || 'Investigated');
  };

  const handleSaveAction = () => {
    if (editingLog) {
      onUpdateLogAction(editingLog.id, editAction, editNotes);
      setEditingLog(null);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <FileText className="w-6 h-6 text-blue-600" />
            <h1 className="text-2xl font-black text-slate-800 tracking-tight">
              Campus Vape Detection Logs
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Historical database logs of vape aerosol incidents detected inside Universidad de Manila comfort rooms.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-all flex items-center space-x-2 self-start md:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Logs to CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search log ID or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          />
        </div>

        {/* Location Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          >
            <option value="All">All Locations ({locations.length})</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Action Status Filter */}
        <div>
          <select
            value={selectedAction}
            onChange={(e) => setSelectedAction(e.target.value)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Action</option>
            <option value="Investigated">Investigated</option>
            <option value="Resolved">Resolved</option>
            <option value="False Positive">False Positive</option>
          </select>
        </div>

        {/* Sorting */}
        <div className="flex items-center space-x-2">
          <ArrowUpDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full py-2 px-3 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="highest_ppm">Sort: Highest Gas PPM</option>
          </select>
        </div>

      </div>

      {/* Detection Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Log ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Comfort Room Location</th>
                <th className="py-3 px-4 text-center">Gas Reading</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4">Investigation Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedLogs.length > 0 ? (
                paginatedLogs.map((log) => {
                  const dateObj = new Date(log.detected_at);
                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {log.id}
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <p className="font-semibold text-slate-800">
                          {dateObj.toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {dateObj.toLocaleTimeString()}
                        </p>
                      </td>

                      <td className="py-3 px-4 font-semibold text-slate-800">
                        <div className="flex items-center space-x-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                          <span>{log.location}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center font-mono">
                        <span className="bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded border border-red-200">
                          {log.ppm} PPM
                        </span>
                      </td>

                      <td className="py-3 px-4 text-center font-mono text-slate-500">
                        {log.threshold} PPM
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                          log.action_status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : log.action_status === 'Investigated'
                            ? 'bg-blue-100 text-blue-800 border-blue-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}>
                          {log.action_status || 'Pending'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenEdit(log)}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline"
                        >
                          Update Notes
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No detection logs match your search or filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>
            Showing <span className="font-bold text-slate-800">{paginatedLogs.length}</span> of{' '}
            <span className="font-bold text-slate-800">{filteredLogs.length}</span> recorded logs
          </p>

          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 font-semibold hover:bg-slate-50"
            >
              Previous
            </button>
            <span className="font-mono text-slate-700 font-semibold px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 font-semibold hover:bg-slate-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Action Notes Edit Modal */}
      {editingLog && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-800 text-base">
                Update Incident Action Note
              </h3>
              <button
                onClick={() => setEditingLog(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="font-semibold text-slate-800">{editingLog.location}</p>
                <p className="text-slate-500 font-mono">
                  Recorded: {editingLog.ppm} PPM | {new Date(editingLog.detected_at).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Investigation Status
                </label>
                <select
                  value={editAction}
                  onChange={(e) => setEditAction(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending Action</option>
                  <option value="Investigated">Investigated by Campus Security</option>
                  <option value="Resolved">Incident Resolved</option>
                  <option value="False Positive">False Positive Sensor Trigger</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Campus Safety Officer Notes
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Enter details regarding campus security response..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setEditingLog(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow"
              >
                Save Incident Log
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
