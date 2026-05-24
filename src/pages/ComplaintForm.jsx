import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';

// ─── Constants ───────────────────────────────────────────────────────────────

const COMPLAINT_TYPES = [
  { id: 'food', icon: '🍱', label: 'Food Quality Issue', desc: 'Spoiled, contaminated, or unsafe food' },
  { id: 'quantity', icon: '📦', label: 'Wrong Quantity', desc: 'Significantly less or more than listed' },
  { id: 'time', icon: '⏰', label: 'Late/No Show', desc: 'Other party was severely late or absent' },
  { id: 'behavior', icon: '🤝', label: 'Donor Behavior', desc: 'Unprofessional or inappropriate conduct' },
];

const SEVERITIES = [
  { id: 'minor', label: 'Minor', icon: '🟢', bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
  { id: 'moderate', label: 'Moderate', icon: '🟡', bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  { id: 'serious', label: 'Serious', icon: '🔴', bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
];

// ─── Components ──────────────────────────────────────────────────────────────

export default function ComplaintForm() {
  const navigate = useNavigate();
  const { transactions } = useApp();

  const [selectedTxn, setSelectedTxn] = useState('');
  const [complaintType, setComplaintType] = useState('');
  const [severity, setSeverity] = useState('');
  const [description, setDescription] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Derived state
  const txnData = transactions.find(t => t.id === selectedTxn);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!confirmed) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
  };

  if (success) {
    return (
      <div className="page-bg">
        <Navbar />
        <div style={{ maxWidth: 640, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }} className="animate-scale-in">
          <div style={{ width: 96, height: 96, margin: '0 auto 24px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2d6a2d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" className="animate-draw-check" />
            </svg>
          </div>
          <h1 className="display-heading" style={{ margin: 0, fontSize: '2rem', color: '#2d6a2d' }}>Complaint Submitted</h1>
          <p style={{ margin: '8px 0 24px', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Our team will review within 24 hours.
          </p>
          <p style={{ margin: '0 0 40px', fontSize: '0.9rem', color: 'var(--text-muted)', fontFamily: 'monospace', background: 'var(--surface-2)', display: 'inline-block', padding: '4px 12px', borderRadius: 6 }}>
            Complaint ID: #CMP-{Math.floor(1000 + Math.random() * 9000)}
          </p>
          
          <div style={{ position: 'relative', maxWidth: 400, margin: '0 auto 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ position: 'absolute', top: 12, left: 30, right: 30, height: 4, background: '#e5e7eb', zIndex: 0 }} />
            <div style={{ position: 'absolute', top: 12, left: 30, right: 30, height: 4, background: '#2d6a2d', zIndex: 0, width: '0%' }} />
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2d6a2d', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>1</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2d6a2d' }}>Received</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>2</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Under Review</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 1 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#e5e7eb', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>3</div>
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>Resolved</span>
            </div>
          </div>
          
          <button className="btn-primary" onClick={() => navigate('/dashboard')} style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-bg">
      <Navbar />
      
      <div style={{ maxWidth: 672, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* ── Header ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 24, animationDelay: '0s', opacity: 0, animationFillMode: 'forwards' }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600, padding: 0, marginBottom: 16 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft size={16}/> Back
          </button>
          
          <h1 className="display-heading" style={{ margin: 0, fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            🚨 Raise a Complaint
          </h1>
          <p style={{ margin: '4px 0 20px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Help us maintain trust and accountability
          </p>
          
          <div style={{ background: 'var(--accent-glow)', border: '1px solid var(--accent)', borderLeft: '4px solid var(--accent)', borderRadius: 8, padding: 12, display: 'flex', gap: 10 }}>
            <AlertTriangle size={18} color="var(--accent)" style={{ flexShrink: 0, marginTop: 2 }} />
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#92400e', lineHeight: 1.4 }}>
              <strong>Complaints are reviewed within 24 hours.</strong> False complaints may affect your trust score.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Transaction Select ── */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 16, animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Select Transaction
            </h2>
            <select 
              className="input-field" 
              value={selectedTxn} 
              onChange={e => setSelectedTxn(e.target.value)}
              required
            >
              <option value="" disabled>Choose a recent transaction...</option>
              {transactions.map(t => (
                <option key={t.id} value={t.id}>
                  {t.id} — {t.status}
                </option>
              ))}
            </select>
            
            {txnData && (
              <div className="animate-scale-in" style={{ marginTop: 12, background: 'var(--surface)', borderRadius: 8, padding: 12, border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>Transaction {txnData.id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString()}</div>
                </div>
                <span className="badge-gray" style={{ textTransform: 'capitalize' }}>{txnData.status}</span>
              </div>
            )}
          </div>

          {/* ── Complaint Type ── */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 16, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Complaint Type
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {COMPLAINT_TYPES.map(type => {
                const isSelected = complaintType === type.id;
                return (
                  <div 
                    key={type.id}
                    onClick={() => setComplaintType(type.id)}
                    style={{ 
                      padding: 16, borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s ease',
                      border: isSelected ? '2px solid var(--accent)' : '2px solid var(--border)',
                      background: isSelected ? 'var(--accent-glow)' : 'transparent',
                    }}
                    onMouseEnter={e => { if(!isSelected) { e.currentTarget.style.borderColor = '#d1d5db'; e.currentTarget.style.background = 'var(--surface)'; } }}
                    onMouseLeave={e => { if(!isSelected) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'transparent'; } }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: 8 }}>{type.icon}</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{type.label}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{type.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Severity ── */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 16, animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Severity Level
            </h2>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {SEVERITIES.map(s => {
                const isSelected = severity === s.id;
                return (
                  <div
                    key={s.id}
                    onClick={() => setSeverity(s.id)}
                    style={{
                      flex: 1, minWidth: 100, textAlign: 'center', padding: '12px 16px', borderRadius: 999, cursor: 'pointer',
                      border: isSelected ? `2px solid ${s.border}` : '2px solid var(--border)',
                      background: isSelected ? s.bg : 'white',
                      color: isSelected ? s.color : 'var(--text-secondary)',
                      fontSize: '0.9rem', fontWeight: 600, transition: 'all 0.2s ease',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                  >
                    <span>{s.icon}</span> {s.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Description ── */}
          <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 24, animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
            <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Describe the Issue
            </h2>
            
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <textarea 
                className="input-field"
                style={{ minHeight: 140, resize: 'none', paddingBottom: 32 }}
                placeholder="Provide specific details about what went wrong..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={500}
                required
              />
              <div style={{ 
                position: 'absolute', bottom: 12, right: 16, 
                fontSize: '0.75rem', fontWeight: 600,
                color: description.length > 400 ? '#dc2626' : 'var(--text-muted)' 
              }}>
                {description.length}/500
              </div>
            </div>
            
            <div className="upload-zone" style={{ height: 96 }}>
              <span style={{ fontSize: '1.2rem', marginBottom: 4 }}>📎</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Attach evidence photos (optional)</span>
            </div>
          </div>

          {/* ── Submit ── */}
          <div className="animate-fade-slide-up" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={confirmed} 
                onChange={e => setConfirmed(e.target.checked)}
                style={{ width: 18, height: 18, accentColor: '#2d6a2d', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                I confirm this complaint is accurate and truthful.
              </span>
            </label>
            
            <button 
              type="submit"
              className="btn-primary" 
              style={{ width: '100%', padding: '16px', fontSize: '1.05rem', opacity: (!confirmed || !complaintType || !severity || !selectedTxn) ? 0.5 : 1, transition: 'opacity 0.2s ease' }}
              disabled={loading || !confirmed || !complaintType || !severity || !selectedTxn}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Submitting...
                </span>
              ) : 'Submit Complaint 🚨'}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}
