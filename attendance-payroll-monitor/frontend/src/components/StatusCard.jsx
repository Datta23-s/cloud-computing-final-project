import React from 'react';

export default function StatusCard({ title, value, subtitle, icon, color = 'var(--primary)', trend }) {
  return (
    <div className="card" style={styles.card}>
      <div style={styles.top}>
        <div style={{ ...styles.iconBox, background: `${color}22`, color }}>
          {icon}
        </div>
        {trend !== undefined && (
          <span style={{
            fontSize: 12,
            fontWeight: 600,
            color: trend >= 0 ? 'var(--success)' : 'var(--danger)',
            background: trend >= 0 ? 'rgba(38,222,129,0.1)' : 'rgba(252,92,101,0.1)',
            padding: '3px 8px',
            borderRadius: 100,
          }}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div style={styles.value}>{value}</div>
      <div style={styles.title}>{title}</div>
      {subtitle && <div style={styles.subtitle}>{subtitle}</div>}
    </div>
  );
}

const styles = {
  card: { cursor: 'default', position: 'relative', overflow: 'hidden' },
  top: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 22,
  },
  value: {
    fontSize: 32,
    fontWeight: 800,
    color: 'var(--text-primary)',
    letterSpacing: '-1px',
    lineHeight: 1,
    marginBottom: 6,
  },
  title: { fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' },
  subtitle: { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 },
};
