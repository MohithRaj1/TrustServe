import { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

// ─── Mock Data ───────────────────────────────────────────────────────────────

const TIME_SERIES = [
  { week: 'Week 1', donations: 40, meals: 250 },
  { week: 'Week 2', donations: 45, meals: 300 },
  { week: 'Week 3', donations: 38, meals: 280 },
  { week: 'Week 4', donations: 52, meals: 380 },
  { week: 'Week 5', donations: 60, meals: 420 },
  { week: 'Week 6', donations: 58, meals: 400 },
  { week: 'Week 7', donations: 70, meals: 500 },
  { week: 'Week 8', donations: 85, meals: 650 },
];

const FOOD_TYPES = [
  { name: 'Cooked Food', value: 45 },
  { name: 'Bakery', value: 20 },
  { name: 'Fruits & Veg', value: 15 },
  { name: 'Beverages', value: 10 },
  { name: 'Packaged', value: 7 },
  { name: 'Other', value: 3 },
];
const COLORS = ['#2d6a2d', '#e07b2a', '#3d8b3d', '#f0954a', '#5aab5a', '#c0621a'];

const SCORE_DIST = [
  { range: '4.0-4.2', donors: 2, receivers: 1 },
  { range: '4.2-4.4', donors: 5, receivers: 3 },
  { range: '4.4-4.6', donors: 10, receivers: 6 },
  { range: '4.6-4.8', donors: 15, receivers: 8 },
  { range: '4.8-5.0', donors: 6, receivers: 4 },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const TIMES = ['Morning', 'Afternoon', 'Evening', 'Night'];

// Generate 4 rows x 7 cols of random intensities 0-3
const HEATMAP_MATRIX = TIMES.map((time, rowIdx) => 
  DAYS.map((day, colIdx) => ({
    time, day,
    count: Math.floor(Math.random() * 20),
    intensity: Math.floor(Math.random() * 4) // 0 to 3
  }))
);

const INTENSITY_COLORS = ['#f3f4f6', '#c8e6c8', '#6ab46a', '#2d6a2d'];

// ─── Custom Tooltips ─────────────────────────────────────────────────────────

const CustomAreaTooltip = ({ active, payload, label }) => {
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

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', padding: '8px 12px', border: '1px solid var(--border)', borderRadius: 8, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: payload[0].payload.fill }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{payload[0].name}: {payload[0].value}%</span>
        </div>
      </div>
    );
  }
  return null;
};

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Analytics() {
  const { donors } = useApp();

  const topDonors = useMemo(() => {
    return [...donors].sort((a, b) => b.totalDonations - a.totalDonations).slice(0, 5);
  }, [donors]);

  return (
    <div className="page-bg">
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ── Page Header ── */}
        <div className="animate-fade-slide-up" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, animationDelay: '0s', opacity: 0, animationFillMode: 'forwards', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 className="display-heading" style={{ margin: 0, fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              📊 Analytics
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Platform insights and impact metrics
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div className="badge-gray" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
              <span>📅</span> Last 30 Days
            </div>
            <button className="btn-ghost" style={{ background: 'white' }}>
              Export Report
            </button>
          </div>
        </div>

        {/* ── Row 1: Stat Cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>🍽️ Total Meals Saved</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">1,240</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d6a2d', display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 10 }}>▲</span> 12% this week
              </span>
            </div>
          </div>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>🤝 Active Donors</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">38</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d6a2d', display: 'flex', alignItems: 'center', gap: 2 }}>
                <span style={{ fontSize: 10 }}>▲</span> 3 this month
              </span>
            </div>
          </div>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>🏢 NGOs Served</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">22</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>across 4 cities</span>
            </div>
          </div>
          <div className="stat-card animate-fade-slide-up" style={{ animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            <span className="section-label" style={{ marginBottom: 4 }}>⭐ Avg Trust Score</span>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="stat-value">4.7</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Platform average</span>
            </div>
          </div>
        </div>

        {/* ── Row 2: AreaChart & PieChart ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
          
          {/* Left Chart */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Donations Over Time</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Weekly trend</p>
            </div>
            <div style={{ height: 220, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TIME_SERIES} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="week" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--text-muted)' }} dy={10} />
                  <YAxis hide />
                  <Tooltip content={<CustomAreaTooltip />} />
                  <Area type="monotone" dataKey="meals" name="Meals" stroke="#e07b2a" strokeWidth={2} fill="#e07b2a" fillOpacity={0.15} />
                  <Area type="monotone" dataKey="donations" name="Donations" stroke="#2d6a2d" strokeWidth={2} fill="#2d6a2d" fillOpacity={0.15} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2d6a2d' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Donations</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e07b2a' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Meals</span>
              </div>
            </div>
          </div>

          {/* Right Chart */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.6s', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Donation by Food Type</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Category breakdown</p>
            </div>
            <div style={{ height: 220, width: '100%', display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1, position: 'relative', height: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={FOOD_TYPES}
                      cx="50%" cy="50%"
                      innerRadius={60} outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {FOOD_TYPES.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center Label */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>6 Types</span>
                </div>
              </div>
              
              {/* Vertical Legend */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 130 }}>
                {FOOD_TYPES.map((type, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i] }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{type.name}</span>
                    </div>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{type.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* ── Row 3: BarChart & Heatmap ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 24, marginBottom: 24 }}>
          
          {/* Left Chart */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.7s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Trust Score Distribution
            </h2>
            <div style={{ height: 200, width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DIST} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} dy={8} />
                  <YAxis hide />
                  <Tooltip cursor={{ fill: 'var(--surface-2)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12, paddingTop: 10 }} />
                  <Bar dataKey="donors" name="Donors" fill="#2d6a2d" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="receivers" name="Receivers" fill="#e07b2a" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Chart (Heatmap) */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.8s', opacity: 0, animationFillMode: 'forwards' }}>
            <div style={{ marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Urgency Heatmap</h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donations by time of day</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
              {/* Col Headers */}
              <div style={{ display: 'flex', marginLeft: 72, justifyContent: 'space-between' }}>
                {DAYS.map(day => (
                  <div key={day} style={{ width: 32, textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Rows */}
              {HEATMAP_MATRIX.map((row, rIdx) => (
                <div key={rIdx} style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ width: 72, fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500, paddingRight: 8, textAlign: 'right' }}>
                    {TIMES[rIdx]}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', flex: 1 }}>
                    {row.map((cell, cIdx) => (
                      <div 
                        key={cIdx} 
                        style={{ width: 32, height: 32, borderRadius: 6, background: INTENSITY_COLORS[cell.intensity], cursor: 'pointer', transition: 'transform 0.1s ease', position: 'relative' }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.zIndex = 10;
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.zIndex = 1;
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                        title={`${cell.count} donations at ${cell.time} on ${cell.day}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Heatmap Legend */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 20 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Low</span>
              <div style={{ display: 'flex', gap: 4 }}>
                {INTENSITY_COLORS.map(c => (
                  <div key={c} style={{ width: 16, height: 16, borderRadius: 4, background: c }} />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High</span>
            </div>
          </div>
          
        </div>

        {/* ── Row 4: Top Donors Leaderboard ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.9s', opacity: 0, animationFillMode: 'forwards' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>🏆 Top Donors This Month</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Ranked by meals provided</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {/* Header Row */}
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px 12px', borderBottom: '1px solid var(--border)', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <div style={{ width: 50, textAlign: 'center' }}>Rank</div>
              <div style={{ flex: 2 }}>Donor</div>
              <div style={{ flex: 1 }}>Type</div>
              <div style={{ width: 80, textAlign: 'right' }}>Meals</div>
              <div style={{ width: 100, textAlign: 'center' }}>Trust Score</div>
              <div style={{ width: 120, textAlign: 'right' }}>Trend</div>
            </div>
            
            {/* Donor Rows */}
            {topDonors.map((donor, i) => {
              const rankIcon = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;
              const isTop3 = i < 3;
              
              return (
                <div 
                  key={donor.id}
                  style={{ 
                    display: 'flex', alignItems: 'center', padding: '14px 12px', 
                    borderBottom: i < topDonors.length - 1 ? '1px solid var(--border)' : 'none',
                    borderLeft: isTop3 ? '3px solid #2d6a2d' : '3px solid transparent',
                    transition: 'background 0.2s ease',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 50, textAlign: 'center', fontSize: isTop3 ? '1.2rem' : '0.9rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {rankIcon}
                  </div>
                  
                  <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2d6a2d, #3d8b3d)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, flexShrink: 0 }}>
                      {donor.name.charAt(0)}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>{donor.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{donor.location}</span>
                    </div>
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <span className={donor.type === 'Restaurant' ? 'badge-green' : 'badge-orange'}>{donor.type}</span>
                  </div>
                  
                  <div style={{ width: 80, textAlign: 'right', fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {donor.totalDonations * 25} {/* Mock meals multiplier */}
                  </div>
                  
                  <div style={{ width: 100, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: '0.8rem', color: '#e07b2a' }}>⭐</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#2d6a2d' }}>{donor.trustScore.toFixed(1)}</span>
                  </div>
                  
                  <div style={{ width: 120, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span style={{ fontSize: '0.75rem', color: '#2d6a2d', fontWeight: 700 }}>▲</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>+2 this week</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
