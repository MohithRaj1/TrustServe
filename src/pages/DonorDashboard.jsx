import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ArrowRight, ChevronRight, Brain, Sparkles, RefreshCw, AlertTriangle, CheckCircle, Trash2, ShieldCheck, Image } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { donors } from '../data/mockData';
import Navbar from '../components/Navbar';
import { useAI } from '../hooks/useAI';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const FOOD_EMOJIS = {
  rice: '🍛', meal: '🍛', curry: '🍛', biriyani: '🍚', biryani: '🍚',
  bread: '🍞', pastry: '🥐', continental: '🍽️', buffet: '🍽️',
  fruit: '🍎', salad: '🥗', sandwich: '🥪', wrap: '🌯',
  dal: '🫓', roti: '🫓', dessert: '🍮', sweet: '🍬',
};
const getFoodEmoji = (type = '') => {
  const lc = type.toLowerCase();
  for (const [key, emoji] of Object.entries(FOOD_EMOJIS)) if (lc.includes(key)) return emoji;
  return '🥘';
};

const getUrgency = (expiryTime) => {
  if (!expiryTime) return null;
  const hrs = (new Date(expiryTime) - Date.now()) / 3_600_000;
  if (hrs < 2) return 'critical';
  if (hrs < 6) return 'moderate';
  return 'safe';
};

const getCountdown = (expiryTime) => {
  const diff = new Date(expiryTime) - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const URGENCY_META = {
  critical: { cls: 'urgency-critical', dot: '🔴', label: 'Critical', color: '#dc2626', strip: 'rgba(220,38,38,0.85)' },
  moderate: { cls: 'urgency-moderate', dot: '🟡', label: 'Moderate', color: '#d97706', strip: 'rgba(217,119,6,0.85)' },
  safe:     { cls: 'urgency-safe',     dot: '🟢', label: 'Safe',     color: '#2d6a2d', strip: 'rgba(45,106,45,0.85)' },
};

const STATUS_META = {
  pending:  { cls: 'badge-gray',   label: 'Pending' },
  accepted: { cls: 'badge-blue',   label: 'Accepted' },
  verified: { cls: 'badge-green',  label: 'Verified' },
};

// ─── SVG Trust Ring ───────────────────────────────────────────────────────────
const TrustRing = ({ score = 4.8 }) => {
  const r = 40, cx = 52, cy = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 5) * circ;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
      <circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="url(#scoreGrad)" strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dashoffset 1.2s ease' }}
      />
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2d6a2d" />
          <stop offset="100%" stopColor="#3d8b3d" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy - 4} textAnchor="middle" dominantBaseline="central"
        fill="#2d6a2d" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif">
        {score}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" dominantBaseline="central"
        fill="var(--text-muted)" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif"
        letterSpacing="0.05em" textTransform="uppercase">
        / 5.0
      </text>
    </svg>
  );
};

// ─── Sidebar Stat Row ─────────────────────────────────────────────────────────
const SideStatRow = ({ icon, label, value }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 16 }}>{icon}</span>
      <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    </div>
    <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</span>
  </div>
);

// ─── Donation Card ────────────────────────────────────────────────────────────
const DonationCard = ({ donation, index, activeFilter }) => {
  const u = URGENCY_META[donation.urgency] || URGENCY_META.safe;
  const s = STATUS_META[donation.status] || STATUS_META.pending;
  const countdown = getCountdown(donation.expiryTime);
  const expired = countdown === 'Expired';

  return (
    <div
      className="donation-card animate-fade-slide-up"
      style={{ animationDelay: `${index * 0.05}s`, opacity: 0, animationFillMode: 'forwards' }}
    >
      {/* Urgency color strip */}
      <div style={{ height: 4, background: u.strip }} />

      {donation.photo && (
        <div style={{ marginTop: 10, marginBottom: 10, borderRadius: 16, overflow: 'hidden', height: 140, background: '#f5f7f6' }}>
          <img src={donation.photo} alt={donation.foodType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {/* Body */}
      <div style={{ padding: '14px 16px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 26 }}>{getFoodEmoji(donation.foodType)}</span>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {donation.foodType}
              </p>
              <p style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 700, marginTop: 4 }}><span style={{ fontWeight: 500, marginRight: 4 }}>Quantity:</span>{donation.quantity}</p>
            </div>
          </div>
          <span className={u.cls} style={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
            {u.dot} {u.label}
          </span>
        </div>

        {/* Location */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 10 }}>
          <MapPin size={11} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {donation.pickupLocation}
          </span>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span className={s.cls}>{s.label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Clock size={11} style={{ color: expired ? '#dc2626' : 'var(--text-muted)' }} />
            <span style={{
              fontSize: '0.76rem', fontWeight: 600,
              color: expired ? '#dc2626' : 'var(--text-muted)',
            }}>
              {expired ? 'Expired' : `${countdown} left`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Upload Form ──────────────────────────────────────────────────────────────
const UNITS = ['servings', 'kg', 'pieces', 'boxes', 'packets', 'litres'];

const UploadForm = ({ donor, onSubmit }) => {
  const [form, setForm] = useState({
    foodName: '', quantity: '', unit: 'servings', expiryTime: '', location: '',
  });
  const [dragging, setDragging] = useState(false);
  const handleQuantityChange = (e) => {
    const val = e.target.value;
    setForm((f) => ({ ...f, quantity: val }));
  };
  const [success, setSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const urgency = useMemo(() => getUrgency(form.expiryTime), [form.expiryTime]);
  const u = urgency ? URGENCY_META[urgency] : null;
  const minDT = new Date().toISOString().slice(0, 16);

  const handleSelectFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size must be 5 MB or less.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage({ name: file.name, url: reader.result });
      setUploadError('');
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) handleSelectFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleSelectFile(file);
  };

  const openFileDialog = () => fileInputRef.current?.click();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.foodName || !form.quantity || !form.expiryTime) return;
    onSubmit({
      donorId: donor.id,
      donorName: donor.name,
      foodType: form.foodName,
      quantity: `${form.quantity} ${form.unit}`,
      expiryTime: form.expiryTime,
      urgency: urgency || 'safe',
      pickupLocation: form.location || donor.location,
      status: 'pending',
      photo: selectedImage?.url || null,
    });
    setForm({ foodName: '', quantity: '', unit: 'servings', expiryTime: '', location: '' });
    setSelectedImage(null);
    setUploadError('');
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="card" style={{ padding: 24, marginBottom: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'rgba(45,106,45,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
          }}>🍱</div>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
              Post a Donation
            </h2>
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>
              List surplus food for nearby NGOs to pick up
            </p>
          </div>
        </div>
        {u && (
          <span className={u.cls} style={{ fontSize: '0.78rem' }}>
            {u.dot} {u.label} Priority
          </span>
        )}
      </div>

      {success && (
        <div style={{
          marginBottom: 16, padding: '10px 16px',
          background: 'rgba(45,106,45,0.08)', border: '1px solid rgba(45,106,45,0.2)',
          borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>✅</span>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>
            Donation posted successfully!
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: 14 }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="section-label">Food Name / Description *</label>
            <input
              className="input-field"
              value={form.foodName}
              onChange={set('foodName')}
              placeholder="e.g. Veg Biryani, Mixed Curry, Bread Rolls…"
              required
            />
          </div>

          <div>
            <label className="section-label">Quantity *</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                className="input-field"
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={handleQuantityChange}
                placeholder="50"
                required
                style={{ flex: 1 }}
              />
              <select
                className="input-field"
                value={form.unit}
                onChange={set('unit')}
                style={{ width: 80 }}
              >
                {UNITS.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="section-label">Best Before (Expiry) *</label>
            <input
              className="input-field"
              type="datetime-local"
              value={form.expiryTime}
              onChange={set('expiryTime')}
              min={minDT}
              required
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="section-label">Pickup Location</label>
            <input
              className="input-field"
              value={form.location}
              onChange={set('location')}
              placeholder={donor.location}
            />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label className="section-label">Food Photo (optional)</label>
            <div
              className={`upload-zone${dragging ? ' dragging' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={openFileDialog}
              role="button"
              tabIndex={0}
              style={{ cursor: 'pointer' }}
            >
              {!selectedImage ? (
                <>
                  <span style={{ fontSize: 28 }}>📷</span>
                  <p style={{ margin: 0, fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    Drag & drop food photo here
                  </p>
                  <p style={{ margin: 0, fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                    or click to browse · JPEG, PNG up to 5 MB
                  </p>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <img src={selectedImage.url} alt={selectedImage.name} style={{ width: '100%', maxHeight: 180, objectFit: 'cover', borderRadius: 14 }} />
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{selectedImage.name}</span>
                </div>
              )}
            </div>
            {uploadError && <p style={{ marginTop: 8, color: '#dc2626', fontSize: '0.82rem' }}>{uploadError}</p>}
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileSelect} />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="btn-primary" style={{ width: '100%', fontSize: '0.95rem' }}>
              Post Donation 🚀
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const DonorDashboard = () => {
  const { currentUser, donations, addDonation } = useApp();
  const [filter, setFilter] = useState('All');

  // AI Estimator state
  const { predictAll, predictImageFreshness, loading: aiLoading } = useAI();

  // AI parameters (with nice defaults synchronized with Bangalore coordinates & standard conditions)
  const [aiParams, setAiParams] = useState({
    foodType: 'vegetables',
    cookedHoursAgo: 2,
    temperatureC: 25,
    humidity: 50,
    eventType: 'wedding',
    guestCount: 100,
    foodPreparedKg: 35,
    donorLatitude: 12.9716,
    donorLongitude: 77.5946,
    urgencyLevel: 'medium',
  });

  const [aiResults, setAiResults] = useState(null);
  const [cvResult, setCvResult] = useState(null);
  const [selectedSampleImage, setSelectedSampleImage] = useState('');

  const baseDonor = donors.find((d) => d.id === currentUser?.id);
  const donor = currentUser || baseDonor || donors[0];
  const myDonations = donations.filter((d) => d.donorId === donor.id || d.donorName === donor.name);
  const active = myDonations.filter((d) => d.status === 'pending').length;
  const mealsProvided = (donor.totalDonations || 0) * 45;

  const filtered = filter === 'All'
    ? myDonations
    : myDonations.filter((d) => d.status === filter.toLowerCase());

  // Run AI Integration on parameter change
  const runAIPrediction = async () => {
    try {
      const data = await predictAll({
        food_type: aiParams.foodType,
        cooked_hours_ago: Number(aiParams.cookedHoursAgo),
        temperature_c: Number(aiParams.temperatureC),
        humidity: Number(aiParams.humidity),
        event_type: aiParams.eventType,
        guest_count: Number(aiParams.guestCount),
        food_prepared_kg: Number(aiParams.foodPreparedKg),
        donor_latitude: Number(aiParams.donorLatitude),
        donor_longitude: Number(aiParams.donorLongitude),
        urgency_level: aiParams.urgencyLevel,
      });
      setAiResults(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => { runAIPrediction(); }, 500);
    return () => clearTimeout(timer);
  }, [aiParams]);

  // Handle image freshness classification call
  const handleCVFreshnessTest = async (imagePath, sampleName) => {
    setSelectedSampleImage(sampleName);
    try {
      const result = await predictImageFreshness(imagePath);
      setCvResult(result.image_freshness_prediction);
    } catch (e) {
      console.error(e);
      setCvResult('error');
    }
  };

  return (
    <div className="page-bg">
      <Navbar />

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>

        {/* ── Sidebar ── */}
        <aside style={{ width: 280, flexShrink: 0 }}>

          {/* Profile Card */}
          <div className="card-flat" style={{ padding: 24, marginBottom: 16 }}>
            {/* Avatar */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2d6a2d, #3d8b3d)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
                boxShadow: '0 4px 16px rgba(45,106,45,0.3)',
              }}>
                <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 800 }}>
                  {donor.name.charAt(0)}
                </span>
              </div>
            <h2 style={{ margin: '0 0 6px', fontSize: '1.0rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                {donor.name}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
                <span className="badge-green">{donor.type || 'Restaurant'}</span>
                <span className="badge-orange">Donor</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                <MapPin size={12} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {donor.location || 'Bangalore'}
                </span>
              </div>
            </div>

            <div className="divider" />

            {/* Trust Ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <TrustRing score={donor.trustScore} />
              <p style={{ margin: '6px 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Trust Score
              </p>
            </div>

            {/* Trusted Badge */}
            <div style={{
              background: 'rgba(45,106,45,0.08)',
              border: '1px solid rgba(45,106,45,0.2)',
              borderRadius: 10, padding: '10px 16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              marginBottom: 0,
            }}>
              <span>✅</span>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                Trusted Donor
              </span>
            </div>
          </div>

          {/* Stats Card */}
          <div className="card-flat" style={{ padding: '8px 20px', marginBottom: 16 }}>
            <div className="divider" style={{ margin: '8px 0 0' }} />
            <SideStatRow icon="🍱" label="Total Donations" value={donor.totalDonations} />
            <div className="divider" style={{ margin: '0' }} />
            <SideStatRow icon="🍛" label="Meals Provided" value={`${mealsProvided}+`} />
            <div className="divider" style={{ margin: '0' }} />
            <SideStatRow icon="⭐" label="Trust Score" value={donor.trustScore} />
            <div className="divider" style={{ margin: '0' }} />
            <SideStatRow icon="📋" label="Active Listings" value={active} />
            <div className="divider" style={{ margin: '0 0 8px' }} />
          </div>

          {/* View Profile button */}
          <button
            style={{
              width: '100%', padding: '11px 16px',
              background: 'white', border: '1px solid var(--border)',
              borderRadius: 12, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.background = 'rgba(45,106,45,0.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'white'; }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>👤</span> View Full Profile
            </span>
            <ChevronRight size={16} />
          </button>
        </aside>

        {/* ── Main Content ── */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Form + AI Sandbox Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 24, alignItems: 'start' }}>
            {/* Upload Form */}
            <UploadForm donor={donor} onSubmit={addDonation} />

            {/* AI Distribution Assistant Panel */}
            <div className="card" style={{
              padding: 24, 
              backgroundColor: '#ffffff', 
              borderRadius: 16, 
              border: '1px solid rgba(45,106,45,0.2)', 
              boxShadow: '0 8px 30px rgba(45,106,45,0.06)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Premium Glow effect */}
              <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'radial-gradient(circle, rgba(45,106,45,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Brain className="animate-pulse" style={{ color: '#2d6a2d' }} size={24} />
                  <div>
                    <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: 6 }}>
                      AI Distribution Assistant <Sparkles size={14} style={{ color: '#e07b2a' }} />
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                      Interactive predictions synced with Flask API
                    </p>
                  </div>
                </div>
                {aiLoading && <RefreshCw size={14} className="animate-spin" style={{ color: '#2d6a2d' }} />}
              </div>

              {/* Sandbox parameter sliders */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, backgroundColor: '#f9fbf9', padding: 14, borderRadius: 12, border: '1px solid rgba(45,106,45,0.08)', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#2d6a2d', textTransform: 'uppercase', letterSpacing: '0.04em' }}>AI Model Parameters Sandbox</span>
                  <button className="btn-ghost" style={{ fontSize: '0.7rem', padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 4 }} onClick={runAIPrediction}>
                    <RefreshCw size={10} /> Recalculate
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Cooked hours slider */}
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Cooked: <b>{aiParams.cookedHoursAgo} hrs ago</b></span>
                    <input type="range" min="0" max="24" step="0.5" value={aiParams.cookedHoursAgo}
                      onChange={(e) => setAiParams(prev => ({ ...prev, cookedHoursAgo: e.target.value }))}
                      style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Temperature slider */}
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Temp: <b>{aiParams.temperatureC}°C</b></span>
                    <input type="range" min="10" max="45" value={aiParams.temperatureC}
                      onChange={(e) => setAiParams(prev => ({ ...prev, temperatureC: e.target.value }))}
                      style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Humidity slider */}
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Humidity: <b>{aiParams.humidity}%</b></span>
                    <input type="range" min="10" max="100" value={aiParams.humidity}
                      onChange={(e) => setAiParams(prev => ({ ...prev, humidity: e.target.value }))}
                      style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Guest count slider */}
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Guest Count: <b>{aiParams.guestCount}</b></span>
                    <input type="range" min="10" max="300" step="5" value={aiParams.guestCount}
                      onChange={(e) => setAiParams(prev => ({ ...prev, guestCount: e.target.value }))}
                      style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Prepared food slider */}
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Prepared: <b>{aiParams.foodPreparedKg} kg</b></span>
                    <input type="range" min="5" max="150" value={aiParams.foodPreparedKg}
                      onChange={(e) => setAiParams(prev => ({ ...prev, foodPreparedKg: e.target.value }))}
                      style={{ width: '100%', height: 4, background: '#e2e8f0', borderRadius: 2, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Event Type */}
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 2 }}>Event Type</span>
                    <select value={aiParams.eventType}
                      onChange={(e) => setAiParams(prev => ({ ...prev, eventType: e.target.value }))}
                      style={{ width: '100%', fontSize: '0.75rem', padding: '2px 4px', border: '1px solid var(--border)', borderRadius: 4 }}
                    >
                      <option value="wedding">Wedding</option>
                      <option value="party">Party</option>
                      <option value="corporate">Corporate</option>
                      <option value="private">Private Event</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Predictions Display */}
              {aiResults && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  
                  {/* Freshness & Waste Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    
                    {/* Freshness card */}
                    <div style={{ 
                      padding: 12, 
                      borderRadius: 10, 
                      border: '1px solid', 
                      borderColor: aiResults.freshness_prediction === 'fresh' ? 'rgba(45,106,45,0.2)' : 'rgba(220,38,38,0.2)',
                      background: aiResults.freshness_prediction === 'fresh' ? 'rgba(45,106,45,0.03)' : 'rgba(220,38,38,0.03)'
                    }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Decision Tree Freshness</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        {aiResults.freshness_prediction === 'fresh' ? (
                          <>
                            <CheckCircle size={16} style={{ color: '#2d6a2d' }} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#2d6a2d' }}>Fresh</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={16} style={{ color: '#dc2626' }} />
                            <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#dc2626' }}>Spoiled Warning</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Waste prediction card */}
                    <div style={{ 
                      padding: 12, 
                      borderRadius: 10, 
                      border: '1px solid rgba(224,123,42,0.2)', 
                      background: 'rgba(224,123,42,0.03)'
                    }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Regression Waste Quantity</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Trash2 size={16} style={{ color: '#e07b2a' }} />
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e07b2a' }}>{aiResults.expected_waste_kg} kg</span>
                      </div>
                    </div>
                  </div>

                  {/* NGO Recommendations */}
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Recommended NGOs (Live Matching Score)</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {aiResults.ngo_recommendations && aiResults.ngo_recommendations.map((ngo, index) => (
                        <div key={index} style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: index === 0 ? 'rgba(45,106,45,0.05)' : 'white',
                          border: index === 0 ? '1px solid rgba(45,106,45,0.2)' : '1px solid var(--border)',
                          borderRadius: 8,
                          fontSize: '0.78rem',
                          transition: 'transform 0.2s'
                        }}
                        className="hover:scale-[1.02]"
                        >
                          <div>
                            <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{ngo.ngo_name}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginLeft: 6 }}>({ngo.ngo_type})</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2, fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                              <span>📍 {ngo.distance_km} km</span>
                              <span>Available cap: {ngo.available_capacity} kg</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ 
                              background: index === 0 ? '#2d6a2d' : '#475569', 
                              color: 'white', 
                              padding: '2px 6px', 
                              borderRadius: 4, 
                              fontWeight: 700, 
                              fontSize: '0.7rem' 
                            }}>
                              Score: {ngo.score}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Computer Vision Feature */}
                  <div style={{ borderTop: '1px dashed var(--border)', paddingTop: 12 }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Computer Vision Freshness Analyzer</span>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <button 
                        type="button"
                        onClick={() => handleCVFreshnessTest('datasets/fresh_food_sample.jpg', 'Fresh Salad Sample')}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 6,
                          fontSize: '0.73rem',
                          border: selectedSampleImage === 'Fresh Salad Sample' ? '1px solid #2d6a2d' : '1px solid var(--border)',
                          background: selectedSampleImage === 'Fresh Salad Sample' ? 'rgba(45,106,45,0.06)' : 'white',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        🥗 Fresh Salad
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleCVFreshnessTest('datasets/spoiled_food_sample.jpg', 'Spoiled Bread Sample')}
                        style={{
                          flex: 1,
                          padding: '8px 10px',
                          borderRadius: 6,
                          fontSize: '0.73rem',
                          border: selectedSampleImage === 'Spoiled Bread Sample' ? '1px solid #dc2626' : '1px solid var(--border)',
                          background: selectedSampleImage === 'Spoiled Bread Sample' ? 'rgba(220,38,38,0.06)' : 'white',
                          cursor: 'pointer',
                          fontWeight: 600
                        }}
                      >
                        🍞 Spoiled Bread
                      </button>
                    </div>

                    {cvResult && (
                      <div style={{ 
                        marginTop: 10,
                        padding: '8px 12px',
                        borderRadius: 6,
                        border: '1px dashed rgba(0,0,0,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#f8fafc'
                      }}>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Image size={12} /> {selectedSampleImage}:
                        </span>
                        <span style={{ 
                          fontSize: '0.75rem', 
                          fontWeight: 700, 
                          color: cvResult === 'fresh' ? '#2d6a2d' : '#dc2626'
                        }}>
                          {cvResult === 'fresh' ? '✅ Fresh detected' : '⚠️ Spoiled / Expired detected'}
                        </span>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </div>

          </div>

          {/* My Donations */}
          <div className="card" style={{ padding: 24 }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
                  My Donations
                </h2>
                <span style={{
                  background: 'rgba(45,106,45,0.1)', color: 'var(--primary)',
                  border: '1px solid rgba(45,106,45,0.2)',
                  fontSize: '0.75rem', fontWeight: 700,
                  padding: '2px 9px', borderRadius: 999,
                }}>
                  {myDonations.length}
                </span>
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {['All', 'Pending', 'Accepted', 'Verified'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`filter-pill${filter === f ? ' active' : ''}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
              <div style={{
                border: '2px dashed var(--border)', borderRadius: 12,
                padding: '48px 24px', textAlign: 'center',
              }}>
                <span style={{ fontSize: 40, display: 'block', marginBottom: 12 }}>🍱</span>
                <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  No {filter !== 'All' ? filter.toLowerCase() : ''} donations yet
                </p>
                <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Post your first donation using the form above!
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
                {filtered.map((donation, i) => (
                  <DonationCard key={donation.id} donation={donation} index={i} activeFilter={filter} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DonorDashboard;
