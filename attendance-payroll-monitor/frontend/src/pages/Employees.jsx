import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Users, Search, UserPlus, Pencil, Trash2, Save, X, UserX } from 'lucide-react';

const API_EMP = '/api/employees';
const DEPTS = ['Engineering', 'Marketing', 'HR', 'Finance', 'Operations', 'Design', 'Sales'];

function Toast({ msg, type }) {
  return msg ? <div className={`toast ${type}`}>{msg}</div> : null;
}

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [modal, setModal]         = useState(false);
  const [editEmp, setEditEmp]     = useState(null);
  const [form, setForm]           = useState({ name: '', department: '', salary: '' });
  const [saving, setSaving]       = useState(false);
  const [toast, setToast]         = useState({ msg: '', type: '' });
  const [search, setSearch]       = useState('');

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3000);
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(API_EMP);
      setEmployees(res.data);
    } catch {
      showToast('Failed to load employees. Is the backend running?', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const openAdd = () => {
    setEditEmp(null);
    setForm({ name: '', department: '', salary: '' });
    setModal(true);
  };

  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({ name: emp.name, department: emp.department, salary: emp.salary });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.department || !form.salary) return;
    setSaving(true);
    try {
      if (editEmp) {
        await axios.put(`${API_EMP}/${editEmp.employeeId}`, { ...form, salary: Number(form.salary) });
        showToast('Employee updated successfully');
      } else {
        await axios.post(API_EMP, { ...form, salary: Number(form.salary) });
        showToast('Employee added successfully');
      }
      setModal(false);
      fetchEmployees();
    } catch {
      showToast('Operation failed. Check backend connection.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this employee?')) return;
    try {
      await axios.delete(`${API_EMP}/${id}`);
      showToast('Employee deleted');
      fetchEmployees();
    } catch {
      showToast('Failed to delete employee', 'error');
    }
  };

  const filtered = employees.filter(e =>
    e.name?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Toast msg={toast.msg} type={toast.type} />

      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Users size={28} /> Employees
        </h1>
        <p>Manage your workforce — add, edit, or remove employees</p>
      </div>

      <div className="section-header">
        <div style={{ position: 'relative', width: 280 }}>
          <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: 12, top: 12 }} />
          <input
            className="form-group"
            style={{ margin: 0, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)', padding: '10px 16px 10px 36px', fontSize: 14, outline: 'none', width: '100%' }}
            placeholder="Search by name or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            id="employee-search"
          />
        </div>
        <button className="btn btn-primary" onClick={openAdd} id="add-employee-btn">
          <UserPlus size={16} /> Add Employee
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /><p>Loading employees...</p></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="icon" style={{ display: 'flex', justifyContent: 'center' }}>
                 <UserX size={48} color="var(--text-muted)" />
            </div>
            <h3>{search ? 'No results found' : 'No employees yet'}</h3>
            <p>{search ? 'Try a different search term' : 'Click "Add Employee" to get started'}</p>
          </div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Name</th>
                <th>Department</th>
                <th>Salary</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((emp, i) => (
                <tr key={emp.employeeId}>
                  <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600 }}>{emp.name}</td>
                  <td><span className="badge badge-info">{emp.department}</span></td>
                  <td style={{ color: 'var(--success)', fontWeight: 600 }}>₹{Number(emp.salary).toLocaleString()}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{emp.joinDate ? new Date(emp.joinDate).toLocaleDateString() : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" style={{ padding: '6px 12px' }} onClick={() => openEdit(emp)} title="Edit">
                        <Pencil size={14} /> Edit
                      </button>
                      <button className="btn btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(emp.employeeId)} title="Delete">
                         <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {editEmp ? <Pencil size={20} /> : <UserPlus size={20} />} 
              {editEmp ? 'Edit Employee' : 'Add Employee'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input id="emp-name" required placeholder="e.g. John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Department</label>
                <select id="emp-dept" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))} required>
                  <option value="">Select department...</option>
                  {DEPTS.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Monthly Salary (₹)</label>
                <input id="emp-salary" type="number" min="0" required placeholder="e.g. 50000" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)}>
                   <X size={16} /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Save size={16} /> {saving ? 'Saving...' : editEmp ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
