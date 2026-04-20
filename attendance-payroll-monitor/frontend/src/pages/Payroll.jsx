import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Calculator, History, Eye, Download, UserX, FileCog } from 'lucide-react';

const API_EMP = '/api/employees';
const API_PAY = '/api/payroll';

const MONTHS = [
  'January 2026','February 2026','March 2026','April 2026',
  'May 2026','June 2026','July 2026','August 2026',
  'September 2026','October 2026','November 2026','December 2026'
];

function Toast({ msg, type }) {
  return msg ? <div className={`toast ${type}`}>{msg}</div> : null;
}

export default function Payroll() {
  const [employees, setEmployees]     = useState([]);
  const [selected, setSelected]       = useState('');
  const [month, setMonth]             = useState('April 2026');
  const [hours, setHours]             = useState(160);
  const [loading, setLoading]         = useState(true);
  const [generating, setGenerating]   = useState(false);
  const [toast, setToast]             = useState({ msg: '', type: '' });
  const [generatedList, setGeneratedList] = useState([]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 4000);
  };

  useEffect(() => {
    axios.get(API_EMP)
      .then(r => { setEmployees(r.data); if (r.data.length) setSelected(r.data[0].employeeId); })
      .catch(() => showToast('Failed to load employees', 'error'))
      .finally(() => setLoading(false));
  }, []);

  const selectedEmp = employees.find(e => e.employeeId === selected);

  // Preview calculation
  const hourlyRate   = selectedEmp ? (selectedEmp.salary / 160).toFixed(2) : 0;
  const earned       = selectedEmp ? (hourlyRate * hours).toFixed(2) : 0;
  const tax          = (earned * 0.1).toFixed(2);
  const pf           = (earned * 0.12).toFixed(2);
  const netSalary    = (earned - tax - pf).toFixed(2);

  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    try {
      const res = await axios.post(`${API_PAY}/generate/${selected}`, {
        month,
        workingHours: Number(hours)
      });
      showToast(`Payslip generated successfully!`);
      setGeneratedList(prev => [{ ...res.data, emp: selectedEmp?.name, month, time: new Date().toLocaleTimeString() }, ...prev]);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to generate payslip.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} />

      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FileText size={28} /> Payroll
        </h1>
        <p>Generate payslips, calculate salaries, and manage employee compensation</p>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Loading...</p></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>

          {/* Generator Form */}
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FileCog size={20} color="var(--primary)" /> Generate Payslip
            </h2>

            <div className="form-group">
              <label>Select Employee</label>
              <select id="payroll-emp" value={selected} onChange={e => setSelected(e.target.value)}>
                {employees.length === 0 && <option>No employees found</option>}
                {employees.map(e => <option key={e.employeeId} value={e.employeeId}>{e.name} — {e.department}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Month</label>
              <select id="payroll-month" value={month} onChange={e => setMonth(e.target.value)}>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label>Working Hours</label>
              <input id="payroll-hours" type="number" min="1" max="300" value={hours} onChange={e => setHours(e.target.value)} />
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15, gap: 8 }}
              onClick={handleGenerate}
              disabled={generating || !selected || employees.length === 0}
            >
              <Calculator size={18} />
              {generating ? 'Processing...' : 'Generate Payslip'}
            </button>
          </div>

          {/* Live Salary Preview */}
          <div className="card">
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Eye size={20} color="var(--secondary)" /> Salary Preview
            </h2>
            {selectedEmp ? (
              <>
                <div style={{ marginBottom: 20, padding: '12px 16px', background: 'var(--bg-input)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{selectedEmp.name}</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{selectedEmp.department}</div>
                </div>

                {[
                  { label: 'Base Salary',        value: `₹${Number(selectedEmp.salary).toLocaleString()}`, color: 'var(--text-primary)' },
                  { label: 'Hourly Rate',         value: `₹${hourlyRate}`,  color: 'var(--text-secondary)' },
                  { label: 'Working Hours',       value: `${hours} hrs`,    color: 'var(--text-secondary)' },
                  { label: 'Gross Earned',        value: `₹${Number(earned).toLocaleString()}`,   color: 'var(--primary)' },
                  { label: 'Tax (10%)',           value: `- ₹${Number(tax).toLocaleString()}`,    color: 'var(--danger)' },
                  { label: 'Provident Fund (12%)', value: `- ₹${Number(pf).toLocaleString()}`,   color: 'var(--danger)' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{label}</span>
                    <span style={{ color, fontWeight: 600, fontSize: 13 }}>{value}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, padding: '14px 16px', background: 'rgba(108,99,255,0.1)', borderRadius: 10, border: '1px solid var(--border-strong)' }}>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>NET SALARY</span>
                  <span style={{ fontWeight: 800, fontSize: 20, color: 'var(--success)' }}>₹{Number(netSalary).toLocaleString()}</span>
                </div>
              </>
            ) : (
              <div className="empty-state">
                 <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
                      <UserX size={48} color="var(--text-muted)" />
                 </div>
                <h3>Select an employee</h3>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Generated Payslips */}
      {generatedList.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="section-header">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
               <History size={20} /> Recently Generated
            </h2>
          </div>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Employee</th><th>Month</th><th>File</th><th>Document</th><th>Time</th></tr>
              </thead>
              <tbody>
                {generatedList.map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{p.emp}</td>
                    <td>{p.month}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--text-secondary)' }}>{p.fileName}</td>
                    <td>
                      {p.url
                        ? <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}><Download size={14}/> Open PDF</a>
                        : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{p.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
