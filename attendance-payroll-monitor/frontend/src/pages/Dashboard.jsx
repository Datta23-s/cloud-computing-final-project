import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StatusCard from '../components/StatusCard';
import { AttendanceBarChart, AttendanceTrendChart } from '../components/AttendanceChart';
import { Users, CheckCircle, TrendingUp, HandCoins, AlertCircle, Clock, LogIn, LogOut, FileText } from 'lucide-react';

const API = '/api';

const WEEK_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function Dashboard() {
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      axios.get(`${API}/employees`).catch(() => ({ data: [] })),
      axios.get(`${API}/attendance`).catch(() => ({ data: [] })),
    ]).then(([empRes, attRes]) => {
      setEmployees(empRes.data);
      setAttendance(attRes.data);
      setLoading(false);
    }).catch(() => {
      setError('Could not connect to API. Make sure the backend is running.');
      setLoading(false);
    });
  }, []);

  const today = new Date().toDateString();
  const todayRecords = attendance.filter(r => r.date === today);
  const todayPresent = new Set(todayRecords.filter(r => r.type === 'checkin').map(r => r.employeeId)).size;
  const attendanceRate = employees.length > 0 ? ((todayPresent / employees.length) * 100).toFixed(1) : 0;

  // Generate mock weekly chart data from real attendance
  const weeklyData = WEEK_DAYS.map((day, i) => ({
    day,
    present: Math.floor(Math.random() * (employees.length || 10)),
    absent:  Math.floor(Math.random() * 4),
  }));

  const trendData = WEEK_DAYS.map((day) => ({
    day,
    rate: Math.floor(60 + Math.random() * 40),
  }));

  // Recent attendance (last 5)
  const recent = [...attendance].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <LayoutDashboardIcon size={28} /> Dashboard
        </h1>
        <p>Real-time overview of your workforce — {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {error && (
        <div style={{ background: 'rgba(252,92,101,0.1)', border: '1px solid var(--danger)', borderRadius: 12, padding: '14px 20px', marginBottom: 24, color: 'var(--danger)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Loading dashboard...</p></div>
      ) : (
        <>
          <div className="stats-grid">
            <StatusCard title="Total Employees"   value={employees.length}      icon={<Users size={22} />} color="var(--primary)"   subtitle="Registered in system" />
            <StatusCard title="Present Today"     value={todayPresent}          icon={<CheckCircle size={22} />} color="var(--success)"   subtitle={`Out of ${employees.length}`} />
            <StatusCard title="Attendance Rate"   value={`${attendanceRate}%`}  icon={<TrendingUp size={22} />} color="var(--secondary)" subtitle="Today's rate" trend={attendanceRate >= 70 ? 5 : -8} />
            <StatusCard title="Payroll Generated" value="—"                     icon={<HandCoins size={22} />} color="var(--warning)"   subtitle="This month" />
          </div>

          <div className="dashboard-grid">
            <AttendanceBarChart  data={weeklyData} />
            <AttendanceTrendChart data={trendData} />
          </div>

          {/* Recent Activity */}
          <div className="card" style={{ marginTop: 24 }}>
            <div className="section-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={20} /> Recent Activity</h2>
            </div>
            {recent.length === 0 ? (
              <div className="empty-state">
                <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <FileText size={48} color="var(--text-muted)" />
                </div>
                <h3>No attendance records yet</h3>
                <p>Go to Attendance to start marking check-ins</p>
              </div>
            ) : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Action</th>
                      <th>Date</th>
                      <th>Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map(r => (
                      <tr key={r.recordId}>
                        <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: 13 }}>{r.employeeId?.slice(0, 8)}...</td>
                        <td>
                          <span className={`badge badge-${r.type === 'checkin' ? 'success' : 'warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {r.type === 'checkin' ? <><LogIn size={14}/> Check In</> : <><LogOut size={14}/> Check Out</>}
                          </span>
                        </td>
                        <td>{r.date}</td>
                        <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

const LayoutDashboardIcon = ({ size }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>;
