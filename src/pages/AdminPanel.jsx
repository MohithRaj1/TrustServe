import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const MOCK_COMPLAINTS = [
  { id: 'CMP-001', txnId: 'txn1', type: 'Food Quality', severity: 'Serious', severityColor: 'red', food: 'Biriyani & Raita', donor: 'The Grand Bistro', receiver: 'Hope Foundation', desc: 'The food was stale and emitted a foul odor. Unsafe for consumption.', raisedBy: 'Hope Foundation' },
  { id: 'CMP-002', txnId: 'txn4', type: 'Late/No Show', severity: 'Moderate', severityColor: 'orange', food: 'Bakery Items', donor: 'Cafe Mango Leaf', receiver: 'Sunshine Orphanage', desc: 'Donor never arrived at the pickup location. Waited for 2 hours.', raisedBy: 'Sunshine Orphanage' },
];

const MOCK_VERIFICATIONS = [
  { id: 'req1', org: 'City Food Bank', type: 'Receiver', submitted: '2 days ago' },
  { id: 'req2', org: 'Bakers Delight', type: 'Donor', submitted: '3 days ago' },
  { id: 'req3', org: 'Helping Hands NGO', type: 'Receiver', submitted: '5 days ago' },
];

const CHART_DATA = [
  { day: 'Mon', donations: 42, verifications: 12, complaints: 1 },
  { day: 'Tue', donations: 38, verifications: 8, complaints: 0 },
  { day: 'Wed', donations: 55, verifications: 15, complaints: 2 },
  { day: 'Thu', donations: 48, verifications: 10, complaints: 1 },
  { day: 'Fri', donations: 60, verifications: 18, complaints: 3 },
  { day: 'Sat', donations: 65, verifications: 5, complaints: 0 },
  { day: 'Sun', donations: 70, verifications: 2, complaints: 0 },
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomChartTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }}>
        <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {payload.map((entry, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: entry.color }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                {entry.name}: <strong style={{ color: 'var(--text-primary)' }}>{entry.value}</strong>
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// ─── Components ──────────────────────────────────────────────────────────────

export default function AdminPanel() {
  const { donors, receivers, transactions } = useApp();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('Donors');
  const [search, setSearch] = useState('');
  
  const [complaints, setComplaints] = useState(MOCK_COMPLAINTS);
  const [verifications, setVerifications] = useState(MOCK_VERIFICATIONS);

  // Computed data
  const displayedUsers = useMemo(() => {
    const list = activeTab === 'Donors' ? donors : receivers;
    return list.filter(u => u.name.toLowerCase().includes(search.toLowerCase())).slice(0, 5);
  }, [activeTab, search, donors, receivers]);

  // Handlers
  const handleResolveComplaint = (id) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    showToast('Complaint resolved successfully', 'success');
  };

  const handleApproveVerification = (id) => {
    setVerifications(prev => prev.map(v => v.id === id ? { ...v, approved: true } : v));
    showToast('Organization verified', 'success');
  };

  return (
    <div className="page-bg">
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ── Page Header ── */}
        <div className="animate-fade-slide-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, animationDelay: '0s', opacity: 0, animationFillMode: 'forwards', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="display-heading" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              🛡️ Admin Panel
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Platform oversight and management
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
            <div className="badge-green" style={{ padding: '4px 12px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 10 }}>🟢</span> System Operational
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Last updated: just now</span>
          </div>
        </div>

        {/* ── Row 1: Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>👥 Total Users</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">{donors.length + receivers.length}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donors.length} donors + {receivers.length} receivers</span>
            </div>
          </div>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>🍽️ Total Donations</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">248</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d6a2d', display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 10 }}>▲</span> +8 today
              </span>
            </div>
          </div>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>⚠️ Open Complaints</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value" style={{ color: '#dc2626' }}>{complaints.length}</span>
              <span className="badge-red" style={{ fontSize: '0.65rem' }}>Needs attention</span>
            </div>
          </div>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>✅ Verification Rate</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">94%</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform average</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: Complaints & Transactions ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
          
          {/* Left: Pending Complaints */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                ⚠️ Pending Complaints
              </h2>
              <span className="badge-red">{complaints.length} Open</span>
            </div>
            
            {complaints.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                All complaints resolved! 🎉
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {complaints.map(c => (
                  <div key={c.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, transition: 'all 0.3s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className="badge-red" style={{ fontSize: '0.65rem' }}>{c.type}</span>
                        <span className={`badge-${c.severityColor}`} style={{ fontSize: '0.65rem' }}>{c.severity}</span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.id}</span>
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{c.food}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span>{c.donor}</span> <span style={{ color: 'var(--text-muted)' }}>→</span> <span>{c.receiver}</span>
                    </div>
                    
                    <p style={{ margin: '0 0 12px', fontSize: '0.85rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      "{c.desc}"
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Raised by: {c.raisedBy}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn-ghost" style={{ padding: '4px 10px', fontSize: '0.75rem' }}>👁 Review</button>
                        <button className="btn-primary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => handleResolveComplaint(c.id)}>✅ Resolve</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Recent Transactions */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              🔄 Recent Transactions
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {transactions.slice(0, 4).map((t, i) => {
                const isVerified = t.status === 'verified';
                return (
                  <div key={t.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 12px', margin: '0 -12px', borderBottom: i < 3 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s ease', borderRadius: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-primary)' }}>{t.donationId}</span>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>TXN: {t.id}</span>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #2d6a2d, #5aab5a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>D</div>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>→</span>
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg, #e07b2a, #f0954a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>R</div>
                    </div>
                    
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <span className={isVerified ? 'badge-green' : 'badge-gray'} style={{ fontSize: '0.65rem', textTransform: 'capitalize' }}>{t.status}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.timestamp.slice(11, 16)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>

        {/* ── Row 3: Users & Verifications ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
          
          {/* Left: User Management */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                👥 User Management
              </h2>
              <input 
                type="text" 
                placeholder="Search users..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-field" 
                style={{ width: 160, padding: '6px 12px', fontSize: '0.8rem' }} 
              />
            </div>
            
            <div style={{ display: 'flex', background: 'var(--surface-2)', borderRadius: 12, padding: 4, marginBottom: 16 }}>
              {['Donors', 'Receivers'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{ flex: 1, padding: '6px 0', borderRadius: 8, fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s ease', background: activeTab === tab ? '#2d6a2d' : 'transparent', color: activeTab === tab ? 'white' : 'var(--text-secondary)', border: 'none', cursor: 'pointer' }}
                >
                  {tab}
                </button>
              ))}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: 280 }}>
              {displayedUsers.map((user, i) => (
                <div key={user.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i < displayedUsers.length - 1 ? '1px solid var(--border)' : 'none', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: activeTab === 'Donors' ? 'linear-gradient(135deg, #2d6a2d, #5aab5a)' : 'linear-gradient(135deg, #e07b2a, #f0954a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700, marginRight: 12 }}>
                    {user.name.charAt(0)}
                  </div>
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                      <span className={activeTab === 'Donors' ? 'badge-green' : 'badge-orange'} style={{ fontSize: '0.65rem' }}>{user.type}</span>
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.location}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, width: 60 }}>
                    <span style={{ fontSize: '0.8rem', color: '#eab308' }}>⭐</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.trustScore.toFixed(1)}</span>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.filter = 'drop-shadow(0 0 2px #2d6a2d)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.filter = 'none'; }} title="Verify">✅</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.filter = 'drop-shadow(0 0 2px #d97706)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.filter = 'none'; }} title="Warn">⚠️</button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', opacity: 0.5, transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.style.filter = 'drop-shadow(0 0 2px #dc2626)'; }} onMouseLeave={e => { e.currentTarget.style.opacity = 0.5; e.currentTarget.style.filter = 'none'; }} title="Suspend">🚫</button>
                  </div>
                </div>
              ))}
              {displayedUsers.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 40 }}>
                  No users found matching "{search}"
                </div>
              )}
            </div>
          </div>

          {/* Right: Verification Queue */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                📋 Verification Queue
              </h2>
              <span className="badge-orange">{verifications.filter(v => !v.approved).length} Pending</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {verifications.map(v => (
                <div key={v.id} style={{ border: '1px solid var(--border)', borderRadius: 12, padding: 16, transition: 'all 0.3s ease' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{v.org}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span className={v.type === 'Donor' ? 'badge-green' : 'badge-orange'} style={{ fontSize: '0.65rem' }}>{v.type}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Submitted: {v.submitted}</span>
                      </div>
                    </div>
                    {v.approved && <span className="badge-green">Approved ✅</span>}
                  </div>
                  
                  <div style={{ display: 'flex', gap: 8, margin: '12px 0', flexWrap: 'wrap' }}>
                    {['FSSAI License', 'Org Certificate', 'ID Proof'].map(doc => (
                      <div 
                        key={doc} 
                        onClick={() => alert('Document preview unavailable')}
                        style={{ padding: '4px 10px', borderRadius: 999, background: 'var(--surface-2)', fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#e2ebe2'}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--surface-2)'}
                      >
                        📄 {doc}
                      </div>
                    ))}
                  </div>
                  
                  {!v.approved && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ flex: 1, padding: '6px', fontSize: '0.85rem' }} onClick={() => handleApproveVerification(v.id)}>✅ Approve</button>
                      <button style={{ flex: 1, padding: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, cursor: 'pointer' }}>❌ Reject</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
        </div>

        {/* ── Row 4: Platform Activity Chart ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.9s', opacity: 0, animationFillMode: 'forwards' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            📊 Platform Activity (Last 7 Days)
          </h2>
          <div style={{ height: 200, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'var(--surface-2)' }} />
                <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                
                <Bar dataKey="donations" name="Donations" fill="#2d6a2d" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="verifications" name="Verifications" fill="#e07b2a" radius={[4, 4, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="complaints" name="Complaints" stroke="#dc2626" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 4, fill: '#dc2626', strokeWidth: 0 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
        
      </div>
    </div>
  );
}
