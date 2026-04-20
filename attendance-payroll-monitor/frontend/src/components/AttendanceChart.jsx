import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { CalendarDays, TrendingUp } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-strong)',
        borderRadius: 10,
        padding: '10px 14px',
        fontSize: 13,
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-md)',
      }}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 4 }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function AttendanceBarChart({ data }) {
  return (
    <div className="chart-container">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CalendarDays size={18} color="var(--primary)" /> Weekly Attendance
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day"  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Bar dataKey="present" name="Present" fill="var(--primary)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="absent"  name="Absent"  fill="var(--danger)"  radius={[4, 4, 0, 0]} opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function AttendanceTrendChart({ data }) {
  return (
    <div className="chart-container">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <TrendingUp size={18} color="var(--success)" /> Attendance Rate Trend
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="day"  tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, 100]} />
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="rate" name="Rate %" stroke="var(--secondary)" strokeWidth={2.5} dot={{ fill: 'var(--secondary)', r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
