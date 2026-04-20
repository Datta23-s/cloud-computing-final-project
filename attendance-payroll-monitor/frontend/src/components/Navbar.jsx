import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, CalendarCheck, FileText, BellRing, Activity } from 'lucide-react';

const navItems = [
  { path: '/dashboard',  label: 'Dashboard',   icon: LayoutDashboard },
  { path: '/employees',  label: 'Employees',   icon: Users },
  { path: '/attendance', label: 'Attendance',  icon: CalendarCheck },
  { path: '/payroll',    label: 'Payroll',     icon: FileText },
  { path: '/alerts',     label: 'System Alerts', icon: BellRing },
];

export default function Navbar() {
  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Activity size={24} color="#ffffff" />
        </div>
        <div>
          <div style={styles.logoName}>AttendPay</div>
          <div style={styles.logoSub}>HR Management</div>
        </div>
      </div>

      {/* Nav Links */}
      <nav style={styles.nav}>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              ...styles.navLink,
              ...(isActive ? styles.navLinkActive : {}),
            })}
          >
            <span style={styles.navIcon}><Icon size={18} /></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div style={styles.sidebarFooter}>
        <div style={styles.systemBadge}>
          <div style={styles.statusIndicator}></div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f0ff' }}>System Online</div>
            <div style={{ fontSize: 11, color: '#a0a3c0' }}>All services operational</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 240,
    minHeight: '100vh',
    background: 'var(--bg-surface)',
    borderRight: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    position: 'fixed',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 100,
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '28px 20px 24px',
    borderBottom: '1px solid var(--border)',
  },
  logoIcon: {
    width: 40,
    height: 40,
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(108,99,255,0.4)',
  },
  logoName: {
    fontSize: 16,
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.3px',
  },
  logoSub: {
    fontSize: 11,
    color: 'var(--text-muted)',
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    padding: '16px 12px',
    flex: 1,
  },
  navLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    transition: 'all 0.2s ease',
  },
  navLinkActive: {
    background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(108,99,255,0.05))',
    color: 'var(--primary)',
    borderLeft: '3px solid var(--primary)',
    paddingLeft: 9,
  },
  navIcon: { display: 'flex', alignItems: 'center' },
  sidebarFooter: {
    padding: '16px 12px 24px',
    borderTop: '1px solid var(--border)',
  },
  systemBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    padding: '10px 12px',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: 'var(--success)',
    boxShadow: '0 0 8px var(--success)',
  }
};
