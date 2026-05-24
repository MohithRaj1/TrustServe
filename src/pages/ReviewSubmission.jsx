import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Camera, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const OVERALL_LABELS = {
  1: { text: 'Poor', color: '#dc2626' },
  2: { text: 'Fair', color: '#d97706' },
  3: { text: 'Good', color: '#eab308' },
  4: { text: 'Very Good', color: '#2d6a2d' },
  5: { text: 'Excellent! 🌟', color: '#2d6a2d', bold: true },
};

const CRITERIA = [
  { id: 'foodQuality', label: 'Food Quality', icon: '🍱' },
  { id: 'hygiene', label: 'Hygiene', icon: '🧼' },
  { id: 'packaging', label: 'Packaging', icon: '📦' },
  { id: 'quantityAccuracy', label: 'Quantity Accuracy', icon: '⚖️' },
  { id: 'timeliness', label: 'Timeliness', icon: '⏱️' },
];

const TAGS = [
  'Fresh food 🌿', 'Well packaged 📦', 'Donor was helpful 👍', 
  'On time ⏰', 'Quantity was accurate ⚖️'
];

// ─── Components ──────────────────────────────────────────────────────────────

const StarRating = ({ rating, setRating, size = 40, showNumber = false }) => {
  const [hover, setHover] = useState(0);
  
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <div style={{ display: 'flex', gap: size === 40 ? 12 : 6 }}>
        {[1, 2, 3, 4, 5].map(star => {
          const isHovered = hover >= star;
          const isFilled = rating >= star;
          const isActive = hover ? isHovered : isFilled;
          
          let fill = 'none';
          let stroke = '#d1d5db'; // gray-300
          
          if (hover) {
            if (isHovered) { fill = '#e07b2a'; stroke = '#e07b2a'; }
          } else {
            if (isFilled) { fill = '#2d6a2d'; stroke = '#2d6a2d'; }
          }

          return (
            <svg 
              key={star} width={size} height={size} viewBox="0 0 24 24" 
              fill={fill} stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              style={{ 
                cursor: 'pointer', 
                transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: hover === star ? 'scale(1.2)' : 'scale(1)' 
              }}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          );
        })}
      </div>
      {showNumber && rating > 0 && (
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {rating}/5
        </span>
      )}
    </div>
  );
};

// ─── Main ────────────────────────────────────────────────────────────────────

export default function ReviewSubmission() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { transactions, donations, donors } = useApp();

  const [overall, setOverall] = useState(0);
  const [criteria, setCriteria] = useState({ foodQuality: 0, hygiene: 0, packaging: 0, quantityAccuracy: 0, timeliness: 0 });
  const [reviewText, setReviewText] = useState('');
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Data
  const transaction = transactions.find(t => t.id === id) || transactions.find(t => t.donationId === id);
  const donation = donations.find(d => d.id === (transaction ? transaction.donationId : id));
  const donor = donors.find(d => d.id === donation?.donorId) || { name: 'Donor', type: 'Restaurant' };

  if (!donation) {
    return (
      <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="text-gray-500">Transaction not found.</p>
      </div>
    );
  }

  const handleTagClick = (tag) => {
    setReviewText(prev => prev ? `${prev} ${tag}` : tag);
  };

  const handleSubmit = () => {
    if (overall === 0) {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      return;
    }
    
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
          <h1 className="display-heading" style={{ margin: 0, fontSize: '2rem', color: '#2d6a2d' }}>Thank You! 🙏</h1>
          <p style={{ margin: '12px 0 32px', fontSize: '1rem', color: 'var(--text-muted)' }}>
            Your review has been submitted and trust scores updated.
          </p>
          
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
            <div className="stat-pill flex items-center gap-2 bg-white border border-gray-100 rounded-full px-5 py-2.5 shadow-sm">
              <span className="text-base">⬆️</span>
              <span className="text-sm font-bold text-gray-700">Your Trust Score: +0.1</span>
            </div>
            <div className="stat-pill flex items-center gap-2 bg-white border border-gray-100 rounded-full px-5 py-2.5 shadow-sm">
              <span className="text-base">✅</span>
              <span className="text-sm font-bold text-gray-700">Donor Trust Score Updated</span>
            </div>
          </div>
          
          <button className="btn-primary" onClick={() => navigate('/receiver')} style={{ padding: '14px 32px', fontSize: '1rem' }}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const labelMeta = OVERALL_LABELS[overall];

  return (
    <div className="page-bg">
      <Navbar />
      
      <div style={{ maxWidth: 672, margin: '0 auto', padding: '40px 24px' }}>
        
        {/* ── Header Card ── */}
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
            ✍️ Rate This Donation
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Your review builds trust in the ecosystem
          </p>
          
          <div className="divider" style={{ margin: '20px 0' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                {donation.foodType}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{donor.name}</span>
                <span className="badge-green">{donor.type}</span>
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Received on {new Date().toLocaleDateString()}
              </p>
            </div>
            
            <div style={{ background: 'rgba(45,106,45,0.08)', border: '1px solid rgba(45,106,45,0.2)', borderRadius: 8, padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '0.9rem' }}>✅</span>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#2d6a2d' }}>Transaction Verified</span>
            </div>
          </div>
        </div>

        {/* ── Overall Rating ── */}
        <div className={`card animate-fade-slide-up ${shake ? 'animate-shake' : ''}`} style={{ padding: 32, marginBottom: 24, textAlign: 'center', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="section-label">Overall Experience</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 16px' }}>
            <StarRating rating={overall} setRating={setOverall} size={48} />
          </div>
          
          <div style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            {overall > 0 ? (
              <>
                <span style={{ fontSize: '1.5rem', fontWeight: labelMeta.bold ? 800 : 600, color: labelMeta.color }}>
                  {labelMeta.text}
                </span>
                <span style={{ fontSize: '2.5rem', fontWeight: 800, color: labelMeta.color, lineHeight: 1 }}>
                  {overall}
                </span>
              </>
            ) : (
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tap a star to rate</span>
            )}
          </div>
        </div>

        {/* ── Criteria ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 24, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            Rate Each Criteria
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {CRITERIA.map((crit, i) => (
              <div 
                key={crit.id}
                className="animate-fade-slide-up"
                style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', 
                  padding: '12px 12px', margin: '0 -12px', borderRadius: 8,
                  borderBottom: i < CRITERIA.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.2s ease',
                  animationDelay: `${0.3 + i * 0.08}s`, opacity: 0, animationFillMode: 'forwards'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.2rem' }}>{crit.icon}</span>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary)' }}>{crit.label}</span>
                </div>
                <StarRating 
                  rating={criteria[crit.id]} 
                  setRating={(val) => setCriteria(prev => ({ ...prev, [crit.id]: val }))}
                  size={24}
                  showNumber={true}
                />
              </div>
            ))}
          </div>
        </div>

        {/* ── Written Review ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 24, animationDelay: '0.3s', opacity: 0, animationFillMode: 'forwards' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
            Share Your Experience
          </h2>
          
          <div style={{ position: 'relative' }}>
            <textarea 
              className="input-field"
              style={{ minHeight: 120, resize: 'none', paddingBottom: 32 }}
              placeholder="Describe the food quality, donor behavior, packaging condition..."
              value={reviewText}
              onChange={e => setReviewText(e.target.value)}
              maxLength={300}
            />
            <div style={{ 
              position: 'absolute', bottom: 12, right: 16, 
              fontSize: '0.75rem', fontWeight: 600,
              color: reviewText.length > 50 ? '#2d6a2d' : 'var(--text-muted)' 
            }}>
              {reviewText.length}/300
            </div>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            {TAGS.map(tag => {
              const isSelected = reviewText.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagClick(tag)}
                  style={{
                    padding: '6px 14px', borderRadius: 999, fontSize: '0.8rem', fontWeight: 500,
                    border: `1px solid ${isSelected ? '#2d6a2d' : 'var(--border)'}`,
                    background: isSelected ? '#2d6a2d' : 'white',
                    color: isSelected ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer', transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = '#c8d8c8'; }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Photo Evidence ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, marginBottom: 24, animationDelay: '0.4s', opacity: 0, animationFillMode: 'forwards' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Add Photo Evidence
            </h2>
            <span className="badge-gray" style={{ fontSize: '0.65rem' }}>Optional</span>
          </div>
          
          <div className="upload-zone" style={{ height: 112, marginBottom: 16 }}>
            <Camera size={28} style={{ color: 'var(--text-muted)', marginBottom: 4 }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Drag photos or click to upload</span>
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--surface-2)', border: '1px dashed var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <Plus size={20} />
              </div>
            ))}
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="animate-fade-slide-up" style={{ animationDelay: '0.5s', opacity: 0, animationFillMode: 'forwards' }}>
          <button 
            className="btn-primary" 
            style={{ width: '100%', padding: '16px', fontSize: '1.05rem', boxShadow: '0 8px 24px rgba(45,106,45,0.25)' }}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Submitting...
              </span>
            ) : 'Submit Review 🚀'}
          </button>
        </div>
        
      </div>
    </div>
  );
}
