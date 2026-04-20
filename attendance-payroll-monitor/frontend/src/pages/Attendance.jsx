import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { CalendarCheck, Users, CheckCircle, Clock, LogIn, LogOut, FileText } from 'lucide-react';

const API_EMP = '/api/employees';
const API_ATT = '/api/attendance';

function Toast({ msg, type }) {
  return msg ? <div className={`toast ${type}`}>{msg}</div> : null;
}

export default function Attendance() {
  const [employees, setEmployees]   = useState([]);
  const [records, setRecords]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [processing, setProcessing] = useState({});
  const [toast, setToast]           = useState({ msg: '', type: '' });
  const [dateFilter, setDateFilter] = useState(new Date().toDateString());

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const fetchData = async () => {
    try {
      const [empRes, attRes] = await Promise.all([
        axios.get(API_EMP),
        axios.get(API_ATT),
      ]);
      setEmployees(empRes.data);
      setRecords(attRes.data);
    } catch {
      showToast('Failed to load data. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCheckIn = async (employeeId) => {
    setProcessing(p => ({ ...p, [employeeId + 'in']: true }));
    try {
      await axios.post(`${API_ATT}/checkin`, { employeeId });
      showToast('Check-in recorded!');
      fetchData();
    } catch {
      showToast('Check-in failed', 'error');
    } finally {
      setProcessing(p => ({ ...p, [employeeId + 'in']: false }));
    }
  };

  const handleCheckOut = async (employeeId) => {
    setProcessing(p => ({ ...p, [employeeId + 'out']: true }));
    try {
      await axios.post(`${API_ATT}/checkout`, { employeeId });
      showToast('Check-out recorded!');
      fetchData();
    } catch {
      showToast('Check-out failed', 'error');
    } finally {
      setProcessing(p => ({ ...p, [employeeId + 'out']: false }));
    }
  };

  const todayRecords = records.filter(r => r.date === new Date().toDateString());
  const checkedInIds = new Set(todayRecords.filter(r => r.type === 'checkin').map(r => r.employeeId));
  const checkedOutIds = new Set(todayRecords.filter(r => r.type === 'checkout').map(r => r.employeeId));

  const filteredRecords = records.filter(r => r.date === dateFilter)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} />

      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <CalendarCheck size={28} /> Attendance
        </h1>
        <p>Mark employee check-in / check-out for today</p>
      </div>

      {/* Today Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--primary)' }}>{employees.length}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Total Employees</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--success)' }}>{checkedInIds.size}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Checked In Today</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'var(--warning)' }}>{checkedOutIds.size}</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 4 }}>Checked Out Today</div>
        </div>
      </div>

      {/* Employee Attendance Actions */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>Today — {new Date().toDateString()}</h2>
        </div>
        {loading ? (
          <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
             <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
                  <Users size={48} color="var(--text-muted)" />
             </div>
            <h3>No employees found</h3>
            <p>Add employees first from the Employees page</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map(emp => {
                  const isIn  = checkedInIds.has(emp.employeeId);
                  const isOut = checkedOutIds.has(emp.employeeId);
                  return (
                    <tr key={emp.employeeId}>
                      <td style={{ fontWeight: 600 }}>{emp.name}</td>
                      <td><span className="badge badge-info">{emp.department}</span></td>
                      <td>
                        {isOut ? <span className="badge badge-warning"><LogOut size={12} style={{marginRight: 4}}/> Checked Out</span>
                          : isIn ? <span className="badge badge-success"><CheckCircle size={12} style={{marginRight: 4}}/> Present</span>
                          : <span className="badge badge-danger"> Absent</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn btn-success"
                            style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}
                            onClick={() => handleCheckIn(emp.employeeId)}
                            disabled={isIn || processing[emp.employeeId + 'in']}
                          >
                            <LogIn size={14} /> {processing[emp.employeeId + 'in'] ? 'Processing...' : 'Check In'}
                          </button>
                          <button
                            className="btn btn-warning"
                            style={{ padding: '6px 14px', fontSize: 13, gap: 6 }}
                            onClick={() => handleCheckOut(emp.employeeId)}
                            disabled={!isIn || isOut || processing[emp.employeeId + 'out']}
                          >
                            <LogOut size={14} /> {processing[emp.employeeId + 'out'] ? 'Processing...' : 'Check Out'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Log */}
      <div className="card">
        <div className="section-header">
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={20} /> Attendance Log</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CalendarCheck size={16} color="var(--text-secondary)" />
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '8px 12px', fontSize: 13, outline: 'none' }}
            >
              {[...new Set(records.map(r => r.date))].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
              {records.length === 0 && <option value={new Date().toDateString()}>{new Date().toDateString()}</option>}
            </select>
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="empty-state">
            <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
                 <Clock size={48} color="var(--text-muted)" />
            </div>
            <h3>No records for this date</h3>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Employee ID</th><th>Action</th><th>Time</th></tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => (
                  <tr key={r.recordId}>
                    <td style={{ fontFamily: 'monospace', color: 'var(--primary)', fontSize: 13 }}>{r.employeeId?.slice(0, 8)}...</td>
                    <td>
                      <span className={`badge badge-${r.type === 'checkin' ? 'success' : 'warning'}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                         {r.type === 'checkin' ? <><LogIn size={12}/> Check In</> : <><LogOut size={12}/> Check Out</>}
                      </span>
                    </td>
                    <td>{new Date(r.timestamp).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
