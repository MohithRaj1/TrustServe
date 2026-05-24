import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Download, Share2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const URGENCY = {
  critical: { cls:'urgency-critical', dot:'🔴', label:'Critical' },
  moderate: { cls:'urgency-moderate', dot:'🟡', label:'Moderate' },
  safe:     { cls:'urgency-safe',     dot:'🟢', label:'Safe' },
};

// Trust Ring Component
const TrustRing = ({ score = 4.7 }) => {
  const r=20, c=24, circ=2*Math.PI*r, offset=circ-(score/5)*circ;
  return (
    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
      <svg width="48" height="48" viewBox="0 0 48 48">
        <circle cx={c} cy={c} r={r} fill="none" stroke="var(--border)" strokeWidth="3"/>
        <circle cx={c} cy={c} r={r} fill="none" stroke="url(#qrGrad)" strokeWidth="3"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          transform={`rotate(-90 ${c} ${c})`} style={{transition:'stroke-dashoffset 1.2s ease'}}/>
        <defs><linearGradient id="qrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d6a2d"/><stop offset="100%" stopColor="#3d8b3d"/>
        </linearGradient></defs>
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#2d6a2d', fontFamily: 'Inter, sans-serif' }}>{score}</span>
      </div>
    </div>
  );
};

export default function QRVerification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { donations, transactions, donors, updateDonationStatus } = useApp();

  const [timeLeft, setTimeLeft] = useState(165); // 02:45
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  // Find data
  const donation = donations.find(d => d.id === id);
  const transaction = transactions.find(t => t.donationId === id) || {
    id: `txn-${Date.now()}`, donationId: id, qrCode: `QR-${id}-${Date.now()}`, status: 'pending'
  };
  const donor = donation ? donors.find(d => d.id === donation.donorId) || donation : { name: 'Donor', type: 'Restaurant', trustScore: 4.8, location: 'Unknown' };

  // Timer
  useEffect(() => {
    if (success) return;
    const timer = setInterval(() => setTimeLeft(t => Math.max(0, t - 1)), 1000);
    return () => clearInterval(timer);
  }, [success]);

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
  const secs = (timeLeft % 60).toString().padStart(2, '0');
  const timerColor = timeLeft < 60 ? '#dc2626' : 'var(--text-secondary)';

  // Handlers
  const handleDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);

    if (value && index < 5) inputRefs.current[index + 1].focus();

    if (newDigits.every(d => d !== '')) {
      handleVerify();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      if (donation) updateDonationStatus(donation.id, 'verified');
    }, 1500);
  };

  if (!donation) {
    return (
      <div className="page-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <p className="text-center text-gray-500">Donation not found.</p>
      </div>
    );
  }

  const u = URGENCY[donation.urgency] || URGENCY.safe;

  return (
    <div className="page-bg">
      <Navbar />

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        
        {/* ── Top Summary ── */}
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
            🔍 Verify Donation Handoff
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Scan or enter the QR code to confirm food received
          </p>
          
          <div className="divider" style={{ margin: '20px 0' }} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Left */}
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>{donation.foodType}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '6px 0 10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{donor.name}</span>
                <span className="badge-green" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>{donor.type}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                <span className="badge-gray">{donation.quantity}</span>
                <span className={u.cls}>{u.dot} {u.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{donation.pickupLocation}</span>
              </div>
            </div>
            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center' }}>
              <TrustRing score={donor.trustScore} />
              <p style={{ margin: '8px 0 4px', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{donor.name}</p>
              <div style={{ background: 'rgba(45,106,45,0.08)', border: '1px solid rgba(45,106,45,0.2)', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✅</span><span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2d6a2d' }}>Trusted Donor</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle QR ── */}
        <div className="card animate-scale-in" style={{ padding: 32, marginBottom: 24, textAlign: 'center', animationDelay: '0.1s', opacity: 0, animationFillMode: 'forwards' }}>
          <p className="section-label">Verification QR Code</p>
          
          <div style={{ display: 'flex', justifyContent: 'center', margin: '20px 0' }}>
            <QRCodeSVG 
              value={transaction.qrCode} 
              size={200} 
              fgColor="#2d6a2d"
              bgColor="#ffffff"
              level="H"
              style={{ borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}
            />
          </div>
          
          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
            TXN: {transaction.id}
          </p>
          
          <div style={{ margin: '16px 0 24px', fontSize: '0.95rem', fontWeight: 600, color: timerColor, transition: 'color 0.3s ease' }}>
            QR Code expires in: {mins}:{secs}
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Download size={16}/> Download QR
            </button>
            <button className="btn-ghost" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Share2 size={16}/> Share
            </button>
          </div>
        </div>

        {/* ── Bottom Verification ── */}
        <div className="card animate-fade-slide-up" style={{ padding: 24, animationDelay: '0.2s', opacity: 0, animationFillMode: 'forwards' }}>
          {success ? (
            <div className="animate-scale-in" style={{ textAlign: 'center', padding: '16px 0' }}>
              <div style={{ width: 80, height: 80, margin: '0 auto 20px', borderRadius: '50%', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#2d6a2d" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" className="animate-draw-check" />
                </svg>
              </div>
              <h2 className="display-heading" style={{ margin: 0, fontSize: '1.6rem', color: '#2d6a2d' }}>Verification Successful! 🎉</h2>
              <p style={{ margin: '8px 0 24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Food handoff confirmed. Trust scores updated.</p>
              
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 24, textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Verification Details</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace', color: '#2d6a2d' }}>✓ Verified</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Transaction ID</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>{transaction.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donation ID</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, fontFamily: 'monospace' }}>{donation.id}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donor Name</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{donor.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Donor Type</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{donor.type}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Pickup Location</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{donor.location || donation.pickupLocation}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Food Item</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{donation.foodType}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Quantity</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{donation.quantity}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Trust Score</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#2d6a2d' }}>⭐ {donor.trustScore}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Verified At</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}</span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => navigate(`/review/${transaction.id}`)}>
                  Submit Review →
                </button>
                <button className="btn-ghost" style={{ flex: 1 }} onClick={() => navigate('/receiver')}>
                  Back to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>Manual Verification</h3>
                <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Enter the 6-digit code shown on donor's screen</p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
                {digits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => inputRefs.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={d}
                    onChange={e => handleDigitChange(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(i, e)}
                    className="input-field"
                    style={{ width: 48, height: 56, fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', padding: 0 }}
                  />
                ))}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '24px 0' }}>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>or</span>
                <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              </div>
              
              <button 
                className="btn-primary" 
                style={{ width: '100%', opacity: digits.some(d => d === '') ? 0.6 : 1 }}
                onClick={handleVerify}
                disabled={loading || digits.some(d => d === '')}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Verifying...
                  </span>
                ) : '✅ Confirm Verification'}
              </button>
            </>
          )}
        </div>
        
      </div>
    </div>
  );
}
