import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BellRing, RefreshCw, AlertTriangle, CheckCircle, Info, Settings, Activity } from 'lucide-react';

const API_ATT = '/api/attendance';

function Toast({ msg, type }) {
  return msg ? <div className={`toast ${type}`}>{msg}</div> : null;
}

export default function Alerts() {
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast]   = useState({ msg: '', type: '' });
  const [refreshing, setRefreshing] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const fetchStats = async () => {
    setRefreshing(true);
    try {
      const res = await axios.get(`${API_ATT}/stats/today`);
      setStats(res.data);
    } catch {
      showToast('Could not fetch metrics. Is the backend running?', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const rate = stats ? parseFloat(stats.attendanceRate) : 0;
  const alertLevel = rate < 50 ? 'critical' : rate < 70 ? 'warning' : 'healthy';

  const alertConfig = {
    critical: { color: 'var(--danger)',  bg: 'rgba(252,92,101,0.08)',  Icon: AlertTriangle, label: 'CRITICAL — Attendance very low!',   badge: 'badge-danger' },
    warning:  { color: 'var(--warning)', bg: 'rgba(247,183,49,0.08)',  Icon: AlertTriangle, label: 'WARNING — Below 70% threshold',     badge: 'badge-warning' },
    healthy:  { color: 'var(--success)', bg: 'rgba(38,222,129,0.08)',  Icon: CheckCircle, label: 'HEALTHY — Attendance on track',    badge: 'badge-success' },
  };

  const cfg = alertConfig[alertLevel];
  const CurrentIcon = cfg.Icon;

  const mockAlerts = [
    { id: 1, time: '09:02 AM', type: 'System Metric', message: 'Attendance rate data synced successfully', severity: 'info' },
    { id: 2, time: '09:00 AM', type: 'Health Check',     message: `Attendance threshold verified — ${stats?.presentCount ?? '—'}/${stats?.totalEmployees ?? '—'} present`, severity: alertLevel === 'healthy' ? 'success' : 'warning' },
    { id: 3, time: '08:55 AM', type: 'Notification',        message: alertLevel !== 'healthy' ? 'Threshold alert triggered — email sent to HR administrators' : 'No alert conditions met — system operating normally', severity: alertLevel !== 'healthy' ? 'danger' : 'success' },
  ];

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} />

      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <BellRing size={28} /> System Alerts
        </h1>
        <p>Real-time system metrics and automated attendance threshold notifications</p>
      </div>

      {/* Refresh Button */}
      <div style={{ marginBottom: 24 }}>
        <button className="btn btn-secondary" onClick={fetchStats} disabled={refreshing} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RefreshCw size={16} className={refreshing ? "spinner-icon" : ""} /> {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Fetching system metrics...</p></div>
      ) : (
        <>
          {/* Alert Banner */}
          <div style={{ background: cfg.bg, border: `1px solid ${cfg.color}`, borderRadius: 16, padding: '20px 24px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'flex' }}><CurrentIcon size={32} color={cfg.color} /></span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: cfg.color }}>{cfg.label}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>
                Threshold: 70% &nbsp;|&nbsp; Current: <strong style={{ color: cfg.color }}>{stats?.attendanceRate ?? '—'}</strong>
                &nbsp;|&nbsp; As of: {stats?.date ?? new Date().toDateString()}
              </div>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="stats-grid">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Attendance Rate</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: cfg.color }}>{stats?.attendanceRate ?? '—'}</div>
              <div style={{ marginTop: 8 }}><span className={`badge ${cfg.badge}`}>{alertLevel.toUpperCase()}</span></div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Present Today</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--success)' }}>{stats?.presentCount ?? '—'}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>of {stats?.totalEmployees ?? '—'} employees</div>
            </div>
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>Alert Threshold</div>
              <div style={{ fontSize: 40, fontWeight: 800, color: 'var(--warning)' }}>70%</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 13, marginTop: 4 }}>Notifications trigger below</div>
            </div>
          </div>

          {/* Setup Info */}
          <div className="card" style={{ marginTop: 24, marginBottom: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
               <Settings size={20} color="var(--primary)"/> Monitor Configuration
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {[
                { label: 'System Service', value: 'AttendancePayrollApp' },
                { label: 'Metric Monitored',    value: 'AttendanceRate' },
                { label: 'Log Stream',      value: '/system/hr-metrics' },
                { label: 'Notification Target',   value: 'HR Administrators Email Group' },
                { label: 'Trigger Condition',      value: 'Rate < 70% during active window' },
                { label: 'Infrastructure',     value: 'Distributed Cloud Instance' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg-input)', borderRadius: 10, padding: '12px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--primary)', fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Alert Log */}
          <div className="card">
            <div className="section-header">
               <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Activity size={20} color="var(--text-primary)" /> Alert Event Log
               </h2>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr><th>Time</th><th>Event Source</th><th>Description</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {mockAlerts.map(a => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--text-muted)' }}>{a.time}</td>
                      <td><span className="badge badge-info">{a.type}</span></td>
                      <td style={{ fontSize: 13 }}>{a.message}</td>
                      <td>
                        <span className={`badge badge-${a.severity === 'success' ? 'success' : a.severity === 'danger' ? 'danger' : a.severity === 'warning' ? 'warning' : 'info'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {a.severity === 'success' ? <><CheckCircle size={12}/> OK</> : a.severity === 'danger' ? <><AlertTriangle size={12}/> Alert</> : a.severity === 'warning' ? <><AlertTriangle size={12}/> Warn</> : <><Info size={12}/> Info</>}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <style dangerouslySetInnerHTML={{__html: `
        .spinner-icon { animation: spin 1s linear infinite; }
      `}}/>
    </div>
  );
}
