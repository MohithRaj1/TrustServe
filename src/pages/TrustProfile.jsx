import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceDot } from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const SCORE_HISTORY = [
  { month: 'Aug', score: 4.2 },
  { month: 'Sep', score: 4.4 },
  { month: 'Oct', score: 4.3 },
  { month: 'Nov', score: 4.6 },
  { month: 'Dec', score: 4.7 },
  { month: 'Jan', score: 4.8 },
];

const MOCK_REVIEWS = [
  { id: 1, name: 'The Grand Bistro', type: 'Donor', date: 'Jan 10, 2024', rating: 5, comment: 'NGO arrived exactly on time. Very professional food handling.', criteria: { 'Food Quality': 5, 'Hygiene': 5, 'Packaging': 5 } },
  { id: 2, name: 'Cafe Mango Leaf', type: 'Donor', date: 'Jan 05, 2024', rating: 4, comment: 'Good communication, though pickup was slightly delayed due to traffic.', criteria: { 'Food Quality': 5, 'Hygiene': 4, 'Packaging': 4 } },
  { id: 3, name: 'Hotel Sunrise', type: 'Donor', date: 'Dec 28, 2023', rating: 5, comment: 'Excellent coordination. Brought appropriate containers for the buffet leftovers.', criteria: { 'Food Quality': 5, 'Hygiene': 5, 'Packaging': 5 } },
];

const MOCK_ACTIVITY = [
  { id: 1, title: 'Badge Earned: Top Receiver', desc: 'Maintained >4.5 score for 3 months', time: '2 hours ago' },
  { id: 2, title: 'Trust Score Updated', desc: 'Score increased from 4.7 to 4.8', time: '1 day ago' },
  { id: 3, title: 'Review Received', desc: '5-star review from The Grand Bistro', time: 'Jan 10, 2024' },
  { id: 4, title: 'QR Verified', desc: 'Handoff confirmed for 50 meals', time: 'Jan 10, 2024' },
  { id: 5, title: 'Donation Accepted', desc: 'Accepted Cooked Meals (Rice & Curry)', time: 'Jan 09, 2024' },
  { id: 6, title: 'Donation Posted', desc: 'You requested packaging materials', time: 'Jan 05, 2024' },
];

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

const CustomLineTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{label}: </span>
        <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{payload[0].value}</strong>
      </div>
    );
  }
  return null;
};

// ─── Components ──────────────────────────────────────────────────────────────

const LargeTrustRing = ({ score = 4.8 }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  
  const r = 54, c = 60, circ = 2 * Math.PI * r;
  const offset = mounted ? circ - (score / 5) * circ : circ;
  
  return (
    <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto' }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx={c} cy={c} r={r} fill="none" stroke="#e5e7eb" strokeWidth="8"/>
        <circle cx={c} cy={c} r={r} fill="none" stroke="url(#ringGrad)" strokeWidth="8"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`} style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)' }}/>
        <defs><linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d6a2d"/><stop offset="100%" stopColor="#5aab5a"/>
        </linearGradient></defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 2 }}>
          <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#2d6a2d', lineHeight: 1, fontFamily: 'Inter, sans-serif' }}>{score}</span>
          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>/5</span>
        </div>
      </div>
    </div>
  );
};

export default function TrustProfile() {
  const { user, role } = useApp();
  // Safe fallback if user isn't fully loaded
  const currentUser = user || { name: 'User', type: 'Member', location: 'City, Region', trustScore: 4.8 };
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Receiver';

  return (
    <div className="page-bg">
      <Navbar />

      <div style={{ maxWidth: 1024, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ── Page Header ── */}
        <div className="animate-fade-slide-up" style={{ marginBottom: 24, animationDelay: '0s', opacity: 0, animationFillMode: 'forwards' }}>
          <h1 className="display-heading" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            🛡️ Trust Profile
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            Your verified identity and reputation on TrustServe
          </p>
        </div>

        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          
          {/* ── LEFT COLUMN ── */}
          <div style={{ width: '100%', maxWidth: 320, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            
            {/* Profile Card */}
            <div className="card animate-fade-slide-up" style={{ padding: 24, textAlign: 'center', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #2d6a2d, #5aab5a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', fontWeight: 800, margin: '0 auto 12px', boxShadow: '0 4px 16px rgba(45,106,45,0.25)' }}>
                {currentUser.name.charAt(0)}
              </div>
              <h2 style={{ margin: '0 0 4px', fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                {currentUser.name}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 4 }}>
                <span className={userRole === 'Donor' ? 'badge-green' : 'badge-orange'}>{userRole}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Member since Jan 2024</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16, color: 'var(--text-muted)' }}>
                <span style={{ fontSize: '0.85rem' }}>📍</span>
                <span style={{ fontSize: '0.8rem' }}>{currentUser.location || 'Mysuru, Karnataka'}</span>
              </div>
              
              <div className="divider" style={{ margin: '16px 0 20px' }} />
              
              <LargeTrustRing score={currentUser.trustScore || 4.8} />
              <p className="section-label" style={{ marginTop: 8, marginBottom: 20 }}>Trust Score</p>
              
              <div style={{ background: 'rgba(45,106,45,0.08)', border: '1px solid rgba(45,106,45,0.2)', borderRadius: 8, padding: '8px', marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span>✅</span><span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2d6a2d' }}>Identity Verified</span>
              </div>
              <button className="btn-ghost" style={{ width: '100%', fontSize: '0.8rem', padding: '6px' }}>
                📋 View Verification Docs
              </button>
            </div>

            {/* Verification Status */}
            <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                Verification Status
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: '1rem' }}>📧</span><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Email Verified</span></div>
                  <span className="badge-green" style={{ display: 'flex', alignItems: 'center' }}>✅</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: '1rem' }}>📱</span><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Phone Verified</span></div>
                  <span className="badge-green" style={{ display: 'flex', alignItems: 'center' }}>✅</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: '1rem' }}>🏢</span><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Organization Verified</span></div>
                  <span className="badge-green" style={{ display: 'flex', alignItems: 'center' }}>✅</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ fontSize: '1rem' }}>📄</span><span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>FSSAI License</span></div>
                  <span className="badge-orange" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>⚠️ Pending</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d6a2d', lineHeight: 1.1 }}>{currentUser.totalDonations || 42}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total Donations</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d6a2d', lineHeight: 1.1 }}>{(currentUser.totalDonations || 42) * 20}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Meals Provided</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d6a2d', lineHeight: 1.1 }}>28</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Reviews Given</div>
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#2d6a2d', lineHeight: 1.1 }}>0</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Complaints</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* ── RIGHT COLUMN ── */}
          <div style={{ flex: 1, minWidth: 320, display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            {/* Trust Score Journey */}
            <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Trust Score Journey</h2>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>How your score evolved</p>
              </div>
              <div style={{ height: 180, width: '100%', marginLeft: -10 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={SCORE_HISTORY} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={10} />
                    <YAxis domain={[4.0, 5.0]} hide />
                    <Tooltip content={<CustomLineTooltip />} />
                    <Line type="monotone" dataKey="score" stroke="#2d6a2d" strokeWidth={3} dot={{ r: 4, fill: '#2d6a2d', strokeWidth: 0 }} activeDot={{ r: 6, fill: '#e07b2a', strokeWidth: 0 }} />
                    <ReferenceDot x="Jan" y={4.8} r={0} label={{ position: 'top', value: 'Current', fill: '#2d6a2d', fontSize: 11, fontWeight: 600 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Reviews Received */}
            <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Reviews Received</h2>
                <span className="badge-gray">3 Recent</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {MOCK_REVIEWS.map((review, i) => (
                  <div key={review.id} style={{ padding: '16px 0', borderBottom: i < MOCK_REVIEWS.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.2s ease', margin: '0 -16px', paddingLeft: 16, paddingRight: 16, borderRadius: 8 }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #e07b2a, #f0954a)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                          {review.name.charAt(0)}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{review.name}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{review.date}</span>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {[...Array(5)].map((_, idx) => (
                          <svg key={idx} width="14" height="14" viewBox="0 0 24 24" fill={idx < review.rating ? '#2d6a2d' : '#e5e7eb'} stroke="none">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p style={{ margin: '0 0 12px', fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      "{review.comment}"
                    </p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {Object.entries(review.criteria).map(([key, val]) => (
                        <span key={key} style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 999, background: 'var(--surface-2)', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {key}: {val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
              <h2 style={{ margin: '0 0 20px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Recent Activity</h2>
              <div style={{ position: 'relative', paddingLeft: 12 }}>
                <div style={{ position: 'absolute', top: 8, bottom: 8, left: 16, width: 2, background: '#2d6a2d', opacity: 0.2 }} />
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {MOCK_ACTIVITY.map((activity, i) => (
                    <div key={activity.id} className="animate-fade-slide-up" style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', animationDelay: `${0.7 + i * 0.08}s`, opacity: 0, animationFillMode: 'forwards' }}>
                      <div style={{ position: 'absolute', left: 1, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#2d6a2d', border: '2px solid white', zIndex: 2 }} />
                      <div style={{ marginLeft: 28, display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{activity.title}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{activity.desc}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{activity.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
