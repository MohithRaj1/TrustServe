import { useState, useMemo } from 'react';
import Navbar from '../components/Navbar';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const NOTIFICATIONS_DATA = [
  // Today
  { id: 1, type: 'Donation', title: 'New donation accepted', desc: 'Hope Foundation accepted your Biriyani donation', time: '10 mins ago', dateGroup: 'Today', unread: true },
  { id: 2, type: 'System', title: 'QR Verification complete', desc: 'Transaction txn1 verified successfully', time: '1 hour ago', dateGroup: 'Today', unread: true },
  { id: 3, type: 'Review', title: 'New review received', desc: '⭐ 4.8 from Hope Foundation', time: '3 hours ago', dateGroup: 'Today', unread: true },
  { id: 4, type: 'System', title: 'Trust score updated', desc: 'Your score increased to 4.8 🎉', time: '5 hours ago', dateGroup: 'Today', unread: false },
  // Yesterday
  { id: 5, type: 'Complaint', title: 'Donation expiring soon', desc: 'Bread & Pastries expires in 45 minutes 🔴', time: 'Yesterday, 2:30 PM', dateGroup: 'Yesterday', unread: false },
  { id: 6, type: 'Complaint', title: 'Complaint resolved', desc: 'Complaint #CMP-001 has been resolved', time: 'Yesterday, 11:15 AM', dateGroup: 'Yesterday', unread: false },
  { id: 7, type: 'Donation', title: 'New donation nearby', desc: 'Fresh Meals available 1.2km away', time: 'Yesterday, 9:00 AM', dateGroup: 'Yesterday', unread: false },
  { id: 8, type: 'Verification', title: 'Verification approved', desc: 'Your organization is now verified ✅', time: 'Yesterday, 8:45 AM', dateGroup: 'Yesterday', unread: false },
  // Earlier
  { id: 9, type: 'System', title: 'System maintenance', desc: 'Scheduled downtime May 15, 2-4 AM', time: 'May 08', dateGroup: 'Earlier', unread: false },
  { id: 10, type: 'System', title: 'Weekly report ready', desc: 'Your impact report for this week is ready', time: 'May 07', dateGroup: 'Earlier', unread: false },
  { id: 11, type: 'Donation', title: 'New receiver request', desc: 'Sunshine Orphanage requested your donation', time: 'May 05', dateGroup: 'Earlier', unread: false },
  { id: 12, type: 'System', title: 'Badge earned', desc: '🏆 You earned "Consistent Donor" badge', time: 'May 01', dateGroup: 'Earlier', unread: false },
];

const ICONS = {
  Donation: { icon: '🍽️', bg: 'var(--primary-glow)', color: 'var(--primary)' },
  Verification: { icon: '✅', bg: 'var(--primary-glow)', color: 'var(--primary)' },
  Review: { icon: '⭐', bg: 'var(--accent-glow)', color: 'var(--accent)' },
  Complaint: { icon: '⚠️', bg: '#fef2f2', color: '#dc2626' },
  System: { icon: '🛡️', bg: 'var(--surface-2)', color: 'var(--text-secondary)' },
};

const FILTERS = ['All', 'Donations', 'Verifications', 'Reviews', 'Complaints', 'System'];

// ─── Components ──────────────────────────────────────────────────────────────

export default function Notifications() {
  const [notifications, setNotifications] = useState(NOTIFICATIONS_DATA);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'All') return notifications;
    // Map plural filter names to singular type names
    const typeMap = { 'Donations': 'Donation', 'Verifications': 'Verification', 'Reviews': 'Review', 'Complaints': 'Complaint', 'System': 'System' };
    return notifications.filter(n => n.type === typeMap[activeFilter]);
  }, [notifications, activeFilter]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce((acc, curr) => {
      if (!acc[curr.dateGroup]) acc[curr.dateGroup] = [];
      acc[curr.dateGroup].push(curr);
      return acc;
    }, {});
  }, [filteredNotifications]);

  const unreadCount = notifications.filter(n => n.unread).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="page-bg">
      <Navbar />

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ── Header ── */}
        <div className="animate-fade-slide-up" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, animationDelay: '0s', opacity: 0, animationFillMode: 'forwards' }}>
          <h1 className="display-heading" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            🔔 Notifications
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button 
              onClick={handleMarkAllAsRead}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 600 }}
              onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
              onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
            >
              Mark all as read
            </button>
            {unreadCount > 0 && (
              <span className="badge-red" style={{ padding: '2px 8px' }}>{unreadCount} new</span>
            )}
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 8, marginBottom: 24, display: 'flex', gap: 8, overflowX: 'auto', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              style={{
                padding: '6px 16px', borderRadius: 999, fontSize: '0.85rem', fontWeight: 600, border: 'none', cursor: 'pointer', flexShrink: 0,
                background: activeFilter === f ? 'var(--primary)' : 'transparent',
                color: activeFilter === f ? 'white' : 'var(--text-muted)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={e => { if (activeFilter !== f) e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { if (activeFilter !== f) e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* ── Notifications List ── */}
        <div className="card animate-fade-slide-up" style={{ overflow: 'hidden', animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          
          {filteredNotifications.length === 0 ? (
            <div className="animate-fade-slide-up" style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>🎉</div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>No notifications here</h2>
              <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem' }}>You're all caught up!</p>
            </div>
          ) : (
            Object.entries(groupedNotifications).map(([dateGroup, items]) => (
              <div key={dateGroup}>
                <div className="section-label" style={{ padding: '16px 24px 8px', margin: 0 }}>{dateGroup}</div>
                {items.map((n, idx) => {
                  const meta = ICONS[n.type] || ICONS.System;
                  return (
                    <div 
                      key={n.id}
                      onClick={() => handleMarkAsRead(n.id)}
                      className="animate-fade-slide-up"
                      style={{ 
                        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 24px', cursor: 'pointer',
                        borderBottom: '1px solid var(--border)', transition: 'background 0.2s ease',
                        background: n.unread ? 'var(--surface)' : 'white',
                        borderLeft: n.unread ? '3px solid var(--primary)' : '3px solid transparent',
                        animationDelay: `${0.2 + idx * 0.04}s`, opacity: 0, animationFillMode: 'forwards'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      onMouseLeave={e => e.currentTarget.style.background = n.unread ? 'var(--surface)' : 'white'}
                    >
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>
                        {meta.icon}
                      </div>
                      
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: n.unread ? 700 : 500, color: n.unread ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
                          {n.title}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
                          {n.desc}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                          {n.time}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
                        {n.unread && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)' }} />}
                        <span style={{ fontSize: '1.2rem', color: 'var(--text-muted)' }}>›</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))
          )}
          
        </div>
        
      </div>
    </div>
  );
}
