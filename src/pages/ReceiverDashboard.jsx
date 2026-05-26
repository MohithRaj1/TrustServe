import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, ChevronRight, X, Phone, Mail, RefreshCw } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import { receivers, donors } from '../data/mockData';
import Navbar from '../components/Navbar';
import { useToast } from '../components/Toast';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FOOD_EMOJI = { rice:'🍛',meal:'🍛',curry:'🍛',biriyani:'🍚',biryani:'🍚',bread:'🍞',pastry:'🥐',continental:'🍽️',buffet:'🍽️',fruit:'🍎',salad:'🥗',sandwich:'🥪',wrap:'🌯',dal:'🫓',roti:'🫓',dessert:'🍮',sweet:'🍬' };
const getEmoji = (t='') => { const l=t.toLowerCase(); for(const [k,v] of Object.entries(FOOD_EMOJI)) if(l.includes(k)) return v; return '🥘'; };

const getCountdown = (exp) => {
  const d = new Date(exp) - Date.now();
  if (d <= 0) return { label: 'Expired', color: '#dc2626' };
  const h = Math.floor(d/3600000), m = Math.floor((d%3600000)/60000);
  const label = h > 0 ? `${h}h ${m}m left` : `${m}m left`;
  const color = h < 2 ? '#dc2626' : h < 6 ? '#d97706' : '#2d6a2d';
  return { label, color };
};

const URGENCY = {
  critical: { cls:'urgency-critical', dot:'🔴', strip:'rgba(220,38,38,0.85)', bg:'#fef2f2' },
  moderate: { cls:'urgency-moderate', dot:'🟡', strip:'rgba(217,119,6,0.85)',  bg:'#fffbeb' },
  safe:     { cls:'urgency-safe',     dot:'🟢', strip:'rgba(45,106,45,0.85)',  bg:'#f0fdf4' },
};

const MOCK_DISTANCES = { don1:'0.8 km', don2:'1.4 km', don3:'2.1 km', don4:'3.3 km', don5:'1.9 km', don6:'4.2 km', don7:'2.8 km', don8:'0.6 km' };
const MOCK_PHONES = { d1:'+91 98765 43210', d2:'+91 87654 32109', d3:'+91 76543 21098', d4:'+91 65432 10987', d5:'+91 54321 09876' };
const MOCK_EMAILS = { d1:'contact@grandbistro.com', d2:'info@hotelsunrise.com', d3:'spicegarden@mail.com', d4:'tajresidency@mail.com', d5:'cafemangoleaf@mail.com' };

const LOCATION_COORDS = {
  'Koramangala, Bangalore': { lat: 12.9352, lon: 77.6245 },
  'Indiranagar, Bangalore': { lat: 12.9716, lon: 77.6413 },
  'Jayanagar, Bangalore': { lat: 12.9250, lon: 77.5938 },
  'MG Road, Bangalore': { lat: 12.9759, lon: 77.6056 },
  'HSR Layout, Bangalore': { lat: 12.9141, lon: 77.6414 },
  'Whitefield, Bangalore': { lat: 12.9698, lon: 77.7490 },
  'Hebbal, Bangalore': { lat: 13.0358, lon: 77.5923 },
  'Rajajinagar, Bangalore': { lat: 13.0004, lon: 77.5588 },
  'Yelahanka, Bangalore': { lat: 13.0845, lon: 77.5938 },
  'Shivajinagar, Bangalore': { lat: 12.9799, lon: 77.5970 },
};

const getLocationCoords = (location) => {
  if (!location) return { lat: 12.9716, lon: 77.5946 };
  const normalized = location.toLowerCase().trim();
  for (const [key, value] of Object.entries(LOCATION_COORDS)) {
    const keyLower = key.toLowerCase();
    if (normalized.includes(keyLower) || keyLower.includes(normalized)) {
      return value;
    }
  }
  const firstWord = normalized.split(/[\s,]+/)[0];
  if (firstWord) {
    for (const [key, value] of Object.entries(LOCATION_COORDS)) {
      if (key.toLowerCase().includes(firstWord)) {
        return value;
      }
    }
  }
  return { lat: 12.9716, lon: 77.5946 };
};

const getDistanceKm = (from, to) => {
  if (!from || !to) return null;
  const degreesToRadians = (deg) => deg * (Math.PI / 180);
  const dLat = degreesToRadians(to.lat - from.lat);
  const dLon = degreesToRadians(to.lon - from.lon);
  const lat1 = degreesToRadians(from.lat);
  const lat2 = degreesToRadians(to.lat);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = 6371 * c;
  return distance > 0.1 ? Math.round(distance * 10) / 10 : 0.1;
};

const getCompassDirection = (from, to) => {
  if (!from || !to) return 'N';
  const latDiff = to.lat - from.lat;
  const lonDiff = to.lon - from.lon;
  const angle = Math.atan2(lonDiff, latDiff) * (180 / Math.PI);
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((angle + 360) % 360) / 22.5) % 16;
  return directions[index];
};

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const LeafletRouteMap = ({ receiverCoords, receiverName, donorCoords, activeDonation }) => {
  const center = donorCoords || receiverCoords;
  const bounds = donorCoords
    ? [[receiverCoords.lat, receiverCoords.lon], [donorCoords.lat, donorCoords.lon]]
    : null;

  // Generate route using OSRM public routing service for realistic road geometry
  const [routePath, setRoutePath] = useState([]);
  const [routeError, setRouteError] = useState(null);

  useEffect(() => {
    if (!donorCoords || !receiverCoords) {
      setRoutePath([]);
      return;
    }
    const fetchRoute = async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${donorCoords.lon},${donorCoords.lat};${receiverCoords.lon},${receiverCoords.lat}?overview=full&geometries=geojson`;
        const resp = await fetch(url);
        if (!resp.ok) throw new Error('OSRM request failed');
        const data = await resp.json();
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon]);
          setRoutePath(coords);
          setRouteError(null);
        } else {
          setRoutePath([[donorCoords.lat, donorCoords.lon], [receiverCoords.lat, receiverCoords.lon]]);
          setRouteError('No route found');
        }
      } catch (e) {
        console.error('Routing error, falling back to direct line:', e);
        setRouteError(e.message);
        setRoutePath([[donorCoords.lat, donorCoords.lon], [receiverCoords.lat, receiverCoords.lon]]);
      }
    };
    fetchRoute();
  }, [donorCoords, receiverCoords]);

  // Animate delivery truck marker along the fetched route
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    if (routePath.length === 0) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 1) return 0; // Loop animation
        return prev + 0.015; // smooth progress steps
      });
    }, 150);
    return () => clearInterval(interval);
  }, [routePath]);

  const truckPos = useMemo(() => {
    if (routePath.length === 0) return null;
    const totalSegments = routePath.length - 1;
    const segmentIndex = Math.min(
      Math.floor(progress * totalSegments),
      totalSegments - 1
    );
    const segmentProgress = (progress * totalSegments) - segmentIndex;
    const start = routePath[segmentIndex];
    const end = routePath[segmentIndex + 1];
    
    const lat = start[0] + (end[0] - start[0]) * segmentProgress;
    const lon = start[1] + (end[1] - start[1]) * segmentProgress;
    return [lat, lon];
  }, [routePath, progress]);

  // Premium Custom Icons for a stunning UI
  const receiverIcon = L.divIcon({
    html: `<div style="background-color: #2d6a2d; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); font-size: 16px;">🏢</div>`,
    className: 'custom-pin-receiver',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const donorIcon = L.divIcon({
    html: `<div style="background-color: #e07b2a; color: white; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.25); font-size: 16px;">🏪</div>`,
    className: 'custom-pin-donor',
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });

  const truckIcon = L.divIcon({
    html: `<div style="background-color: #3b82f6; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2.5px solid white; box-shadow: 0 5px 15px rgba(59,130,246,0.45); font-size: 18px; animation: map-bounce 0.8s infinite alternate;">🚚</div>`,
    className: 'custom-pin-truck',
    iconSize: [36, 36],
    iconAnchor: [18, 18]
  });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <style>{`
        @keyframes map-bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-4px); }
        }
      `}</style>
      <MapContainer
        center={[center.lat, center.lon]}
        zoom={13}
        style={{ width: '100%', minHeight: 320, height: '100%' }}
        scrollWheelZoom={false}
        {...(donorCoords ? { bounds, boundsOptions: { padding: [40, 40] } } : {})}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />
        <Marker position={[receiverCoords.lat, receiverCoords.lon]} icon={receiverIcon}>
          <Popup>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              🏢 {receiverName} <br />
              <span style={{ fontSize: '11px', color: '#666' }}>Dropoff Point (NGO)</span>
            </div>
          </Popup>
        </Marker>
        {donorCoords && (
          <>
            <Marker position={[donorCoords.lat, donorCoords.lon]} icon={donorIcon}>
              <Popup>
                <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
                  🏪 {activeDonation?.donorName || 'Pickup Location'} <br />
                  <span style={{ fontSize: '11px', color: '#666' }}>Pickup Point (Surplus Donor)</span>
                </div>
              </Popup>
            </Marker>
            
            {/* Draw beautiful realistic street paths */}
            <Polyline
              positions={routePath}
              pathOptions={{ color: '#2d6a2d', weight: 5, opacity: 0.85, lineCap: 'round', lineJoin: 'round', dashArray: '1, 10' }}
            />
            <Polyline
              positions={routePath}
              pathOptions={{ color: '#4ade80', weight: 3, opacity: 0.9, lineCap: 'round', lineJoin: 'round' }}
            />

            {/* Live Moving Marker along the path */}
            {truckPos && (
              <Marker position={truckPos} icon={truckIcon}>
                <Popup>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: '11px' }}>
                    🚚 Live Tracking in Progress... <br />
                    Speed: 24 km/h · E.T.A: 4 mins
                  </div>
                </Popup>
              </Marker>
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
};

// Map ping dots
const PINGS = [
  { top:'28%', left:'22%', urgency:'critical', label:'Continental Buffet · 3.3km' },
  { top:'55%', left:'38%', urgency:'safe',     label:'Fruits & Salads · 1.9km' },
  { top:'35%', left:'60%', urgency:'moderate', label:'Bread & Pastries · 1.4km' },
  { top:'68%', left:'72%', urgency:'safe',     label:'Desserts & Sweets · 0.6km' },
  { top:'20%', left:'78%', urgency:'critical', label:'Cooked Meals · 0.8km' },
];

const PING_COLORS = { critical:'#dc2626', moderate:'#d97706', safe:'#2d6a2d' };

// SVG Trust Ring
const TrustRing = ({ score=4.7 }) => {
  const r=40, c=52, circ=2*Math.PI*r, offset=circ-(score/5)*circ;
  return (
    <svg width="104" height="104" viewBox="0 0 104 104">
      <circle cx={c} cy={c} r={r} fill="none" stroke="var(--border)" strokeWidth="6"/>
      <circle cx={c} cy={c} r={r} fill="none" stroke="url(#rg2)" strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${c} ${c})`} style={{transition:'stroke-dashoffset 1.2s ease'}}/>
      <defs><linearGradient id="rg2" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#e07b2a"/><stop offset="100%" stopColor="#f0954a"/>
      </linearGradient></defs>
      <text x={c} y={c-4} textAnchor="middle" dominantBaseline="central" fill="#e07b2a" fontSize="18" fontWeight="800" fontFamily="Inter, sans-serif">{score}</text>
      <text x={c} y={c+14} textAnchor="middle" dominantBaseline="central" fill="var(--text-muted)" fontSize="9" fontWeight="600" fontFamily="Inter, sans-serif">/ 5.0</text>
    </svg>
  );
};

const StatRow = ({ icon, label, value }) => (
  <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 0'}}>
    <div style={{display:'flex',alignItems:'center',gap:8}}>
      <span style={{fontSize:16}}>{icon}</span>
      <span style={{fontSize:'0.82rem',color:'var(--text-secondary)',fontWeight:500}}>{label}</span>
    </div>
    <span style={{fontSize:'0.9rem',fontWeight:700,color:'var(--text-primary)'}}>{value}</span>
  </div>
);

// Accept Modal
const AcceptModal = ({ donation, onClose }) => {
  const navigate = useNavigate();
  if (!donation) return null;
  const donor = donors.find(d => d.id === donation.donorId) || {};
  return (
    <div style={{position:'fixed',inset:0,zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'rgba(0,0,0,0.35)',backdropFilter:'blur(6px)'}}
      onClick={onClose}>
      <div className="animate-scale-in" style={{background:'white',borderRadius:20,boxShadow:'var(--shadow-lg)',width:'100%',maxWidth:420,overflow:'hidden'}}
        onClick={e=>e.stopPropagation()}>
        {/* Header */}
        <div style={{background:'linear-gradient(135deg,#2d6a2d,#3d8b3d)',padding:'24px 24px 20px',position:'relative'}}>
          <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'rgba(255,255,255,0.2)',border:'none',borderRadius:'50%',width:32,height:32,cursor:'pointer',color:'white',fontSize:16,display:'flex',alignItems:'center',justifyContent:'center'}}>
            <X size={16}/>
          </button>
          <div style={{fontSize:36,marginBottom:8}}>🎉</div>
          <h2 style={{margin:0,color:'white',fontSize:'1.15rem',fontWeight:700, fontFamily: 'Inter, sans-serif'}}>Donation Accepted!</h2>
          <p style={{margin:'4px 0 0',color:'rgba(255,255,255,0.8)',fontSize:'0.82rem'}}>Here are the donor's contact details</p>
        </div>
        {/* Body */}
        <div style={{padding:24}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:16,marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'linear-gradient(135deg,#2d6a2d,#3d8b3d)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:800,fontSize:'1.1rem',flexShrink:0}}>
                {donor.name?.charAt(0)}
              </div>
              <div>
                <p style={{margin:0,fontWeight:700,fontSize:'0.92rem',color:'var(--text-primary)'}}>{donor.name}</p>
                <p style={{margin:0,fontSize:'0.78rem',color:'var(--text-muted)'}}>{donor.type}</p>
              </div>
              <span style={{marginLeft:'auto',fontSize:'0.78rem',fontWeight:700,color:'#2d6a2d'}}>⭐ {donor.trustScore}</span>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {[
                { icon:<Phone size={13}/>, text: MOCK_PHONES[donor.id] || '+91 99999 00000' },
                { icon:<Mail size={13}/>,  text: MOCK_EMAILS[donor.id] || 'contact@donor.com' },
                { icon:<MapPin size={13}/>,text: donation.pickupLocation },
              ].map(({icon,text},i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:8,fontSize:'0.83rem',color:'var(--text-secondary)'}}>
                  <span style={{color:'var(--text-muted)'}}>{icon}</span>{text}
                </div>
              ))}
            </div>
          </div>
          {/* QR info pill */}
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(224,123,42,0.08)',border:'1px solid rgba(224,123,42,0.2)',borderRadius:10,padding:'10px 14px',marginBottom:16}}>
            <span style={{fontSize:18}}>📱</span>
            <span style={{fontSize:'0.82rem',color:'#e07b2a',fontWeight:600}}>QR Code will be generated at pickup</span>
          </div>
          <div style={{display:'flex',gap:10}}>
            <button className="btn-primary" style={{flex:1}} onClick={()=>navigate(`/qr/${donation.id}`)}>
              View QR Code
            </button>
            <button className="btn-ghost" style={{flex:1}} onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Donation Card
const DonationCard = ({ donation, index, onAccept, onSelect, selected }) => {
  const u = URGENCY[donation.urgency] || URGENCY.safe;
  const { label: countdown, color: cdColor } = getCountdown(donation.expiryTime);
  const donor = donors.find(d => d.id === donation.donorId) || {};
  const isAccepted = donation.status === 'accepted';
  
  const donorCoords = donor.coordinates;
  const pickupCoords = donor.coordinates;
  const distance = donorCoords ? Math.round(getDistanceKm({ lat: 12.9698, lon: 77.7490 }, donorCoords) * 10) / 10 : 2.0;

  return (
    <div className="card animate-fade-slide-up" style={{overflow:'hidden',cursor:'pointer',animationDelay:`${index*0.05}s`,opacity:0,animationFillMode:'forwards'}}>
      {/* Urgency strip */}
      <div style={{height:4,background:u.strip}}/>
      {/* Food image area */}
      <div style={{height:112,display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',background:`linear-gradient(135deg, ${u.bg}, white)`}}>
        {donation.photo ? (
          <img src={donation.photo} alt={donation.foodType} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{fontSize:'3rem'}}>{getEmoji(donation.foodType)}</span>
        )}
        <div style={{position:'absolute',top:10,right:10}}>
          <span className={u.cls}>{u.dot} {donation.urgency.charAt(0).toUpperCase()+donation.urgency.slice(1)}</span>
        </div>
      </div>
      {/* Body */}
      <div style={{padding:'14px 16px 10px'}}>
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:6,gap:8}}>
          <h3 style={{margin:0,fontSize:'0.9rem',fontWeight:700,color:'var(--text-primary)',lineHeight:1.3, fontFamily: 'Inter, sans-serif'}}>{donation.foodType}</h3>
          <span className="badge-gray" style={{whiteSpace:'nowrap',flexShrink:0}}>{donation.quantity}</span>
        </div>
        {/* Donor */}
        <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:8}}>
          <div style={{width:22,height:22,borderRadius:'50%',background:'linear-gradient(135deg,#2d6a2d,#3d8b3d)',display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontSize:'0.65rem',fontWeight:700,flexShrink:0}}>
            {donor.name?.charAt(0)}
          </div>
          <span style={{fontSize:'0.78rem',color:'var(--text-muted)',fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{donor.name} · {donor.type}</span>
          <span style={{marginLeft:'auto',fontSize:'0.72rem',fontWeight:600,color:'var(--text-muted)',whiteSpace:'nowrap',flexShrink:0}}>📍 {distance} km</span>
        </div>
        {/* Countdown + Location */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
          <Clock size={11} style={{color:cdColor,flexShrink:0}}/>
          <span style={{fontSize:'0.77rem',fontWeight:700,color:cdColor}}>{countdown}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <MapPin size={11} style={{color:'var(--text-muted)',flexShrink:0}}/>
          <span style={{fontSize:'0.76rem',color:'var(--text-muted)',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{donation.pickupLocation}</span>
        </div>
      </div>
      {/* Footer */}
      <div style={{borderTop:'1px solid var(--border)',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:8,flexWrap:'wrap'}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <span style={{fontSize:13}}>⭐</span>
          <span style={{fontSize:'0.8rem',fontWeight:700,color:'var(--text-secondary)'}}>{donor.trustScore}</span>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap'}}>
          <button
            type="button"
            className={selected ? 'btn-primary' : 'btn-ghost'}
            style={{padding:'6px 14px',fontSize:'0.8rem'}}
            onClick={() => onSelect?.(donation)}
          >
            {selected ? 'Selected' : 'View route'}
          </button>
          {!isAccepted && (
            <button className="btn-primary" style={{padding:'6px 14px',fontSize:'0.8rem'}} onClick={()=>onAccept(donation)}>
              Accept Donation
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
const FILTERS = ['All','🔴 Critical','🟡 Moderate','🟢 Safe','< 2km','< 5km'];

export default function ReceiverDashboard() {
  const { currentUser, donations, updateDonationStatus } = useApp();
  const [mapFilter, setMapFilter] = useState('All');
  const [modal, setModal] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const { show, ToastNode } = useToast();

  const baseReceiver = receivers.find(r => r.id === currentUser?.id);
  const receiver = currentUser || baseReceiver || receivers[0];
  const available = donations.filter(d => d.status === 'pending' || d.status === 'accepted');
  const activeDonation = selectedDonation || null;
  const receiverCoords = receiver.coordinates || getLocationCoords(receiver.location) || { lat: 12.9698, lon: 77.7490 };
  const donorCoords = activeDonation 
    ? (donors.find(d => d.id === activeDonation.donorId)?.coordinates || getLocationCoords(activeDonation.pickupLocation))
    : null;
  const routeDistance = getDistanceKm(receiverCoords, donorCoords);
  const routeDirection = getCompassDirection(receiverCoords, donorCoords);

  const filtered = useMemo(() => {
    if (mapFilter === 'All') return available;
    if (mapFilter === '🔴 Critical') return available.filter(d => d.urgency === 'critical');
    if (mapFilter === '🟡 Moderate') return available.filter(d => d.urgency === 'moderate');
    if (mapFilter === '🟢 Safe') return available.filter(d => d.urgency === 'safe');
    if (mapFilter === '< 2km') return available.filter(d => parseFloat(MOCK_DISTANCES[d.id]||'9') < 2);
    if (mapFilter === '< 5km') return available.filter(d => parseFloat(MOCK_DISTANCES[d.id]||'9') < 5);
    return available;
  }, [available, mapFilter]);

  useEffect(() => {
    setSelectedDonation((current) => {
      if (current && filtered.some((d) => d.id === current.id)) return current;
      return filtered[0] || null;
    });
  }, [filtered]);

  const handleAccept = (donation) => {
    updateDonationStatus(donation.id, 'accepted');
    show('✅ Donation accepted! Contact details shared.', 'success');
    setTimeout(() => setModal(donation), 400);
  };

  return (
    <div className="page-bg">
      {ToastNode}
      <Navbar />

      <div style={{maxWidth:1280,margin:'0 auto',padding:'32px 24px',display:'flex',gap:24,alignItems:'flex-start'}}>

        {/* ── Sidebar ── */}
        <aside style={{width:280,flexShrink:0}}>
          <div className="card-flat" style={{padding:24,marginBottom:16}}>
            <div style={{textAlign:'center',marginBottom:16}}>
              <div style={{width:64,height:64,borderRadius:'50%',background:'linear-gradient(135deg,#e07b2a,#f0954a)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',boxShadow:'0 4px 16px rgba(224,123,42,0.3)'}}>
                <span style={{color:'white',fontSize:'1.5rem',fontWeight:800}}>{receiver.name.charAt(0)}</span>
              </div>
              <h2 style={{margin:'0 0 6px',fontSize:'1.0rem',fontWeight:700,color:'var(--text-primary)', fontFamily: 'Inter, sans-serif'}}>{receiver.name}</h2>
              <div style={{display:'flex',justifyContent:'center',gap:6,marginBottom:8}}>
                <span className="badge-gray">{receiver.type || 'NGO'}</span>
                <span className="badge-orange">Receiver</span>
              </div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:4}}>
                <MapPin size={12} style={{color:'var(--text-muted)'}}/>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)',fontWeight:500}}>{receiver.location || 'Bangalore'}</span>
              </div>
            </div>
            <div className="divider"/>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',marginBottom:16}}>
              <TrustRing score={receiver.trustScore}/>
              <p style={{margin:'6px 0 0',fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600,letterSpacing:'0.06em',textTransform:'uppercase'}}>Trust Score</p>
            </div>
            <div style={{background:'rgba(224,123,42,0.08)',border:'1px solid rgba(224,123,42,0.2)',borderRadius:10,padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <span>✅</span>
              <span style={{fontSize:'0.82rem',fontWeight:700,color:'#e07b2a'}}>Verified Receiver</span>
            </div>
          </div>

          <div className="card-flat" style={{padding:'8px 20px',marginBottom:16}}>
            <div className="divider" style={{margin:'8px 0 0'}}/>
            <StatRow icon="📦" label="Total Received"    value={receiver.totalReceived}/>
            <div className="divider" style={{margin:0}}/>
            <StatRow icon="🍽️" label="Meals Distributed" value={`${receiver.totalReceived*40}+`}/>
            <div className="divider" style={{margin:0}}/>
            <StatRow icon="⭐" label="Trust Score"       value={receiver.trustScore}/>
            <div className="divider" style={{margin:0}}/>
            <StatRow icon="📋" label="Active Requests"   value={available.filter(d=>d.status==='accepted').length}/>
            <div className="divider" style={{margin:'0 0 8px'}}/>
          </div>

          <button style={{width:'100%',padding:'11px 16px',background:'white',border:'1px solid var(--border)',borderRadius:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'space-between',fontSize:'0.85rem',fontWeight:600,color:'var(--text-secondary)',transition:'all 0.2s ease'}}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--accent)';e.currentTarget.style.color='var(--accent)';e.currentTarget.style.background='rgba(224,123,42,0.04)';}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border)';e.currentTarget.style.color='var(--text-secondary)';e.currentTarget.style.background='white';}}>
            <span style={{display:'flex',alignItems:'center',gap:8}}><span>👤</span> View Full Profile</span>
            <ChevronRight size={16}/>
          </button>
        </aside>

        {/* ── Main ── */}
        <main style={{flex:1,minWidth:0}}>

          {/* Map Card */}
          <div className="card" style={{padding:0,overflow:'hidden',marginBottom:24}}>
            {/* Header */}
            <div style={{padding:'14px 20px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
              <div style={{display:'flex',alignItems:'center',gap:10}}>
                <div style={{width:36,height:36,borderRadius:9,background:'rgba(45,106,45,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>📍</div>
                <div>
                  <h2 style={{margin:0,fontSize:'1.0rem',fontWeight:700,color:'var(--text-primary)', fontFamily: 'Inter, sans-serif'}}>Nearby Donations</h2>
                  <p style={{margin:0,fontSize:'0.75rem',color:'var(--text-muted)'}}>Live availability within 5km</p>
                </div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span className="badge-gray">📍 {receiver.location}</span>
                <button className="btn-ghost" style={{display:'flex',alignItems:'center',gap:6,padding:'6px 12px'}}>
                  <RefreshCw size={13}/> Refresh
                </button>
              </div>
            </div>

            {/* Map preview */}
            <div style={{height:380,position:'relative',overflow:'hidden',background:'#f4f7f4',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <LeafletRouteMap
                receiverCoords={receiverCoords}
                receiverName={receiver.name}
                donorCoords={donorCoords}
                activeDonation={activeDonation}
              />

              <div style={{position:'absolute',bottom:12,left:12,right:12,background:'rgba(255,255,255,0.95)',backdropFilter:'blur(8px)',border:'1px solid var(--border)',borderRadius:14,padding:'16px 18px',boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
                {activeDonation ? (
                  <div style={{display:'flex',alignItems:'center',gap:16,flexWrap:'wrap'}}>
                    {/* Route flow: Pickup → Dropoff */}
                    <div style={{flex:1,minWidth:180,display:'flex',flexDirection:'column',gap:6}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:'#e07b2a',flexShrink:0,boxShadow:'0 0 0 3px rgba(224,123,42,0.2)'}} />
                        <div>
                          <span style={{fontSize:'0.68rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Pickup</span>
                          <p style={{margin:0,fontSize:'0.82rem',fontWeight:700,color:'var(--text-primary)'}}>{activeDonation.pickupLocation}</p>
                        </div>
                      </div>
                      <div style={{width:1,height:14,background:'var(--border)',marginLeft:4}} />
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:10,height:10,borderRadius:'50%',background:'#2d6a2d',flexShrink:0,boxShadow:'0 0 0 3px rgba(45,106,45,0.2)'}} />
                        <div>
                          <span style={{fontSize:'0.68rem',fontWeight:600,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.05em'}}>Dropoff</span>
                          <p style={{margin:0,fontSize:'0.82rem',fontWeight:700,color:'var(--text-primary)'}}>{receiver.location}</p>
                        </div>
                      </div>
                    </div>

                    {/* Stats badges */}
                    <div style={{display:'flex',flexDirection:'column',gap:6,alignItems:'flex-end'}}>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'flex-end'}}>
                        <span style={{background:'rgba(45,106,45,0.1)',color:'#2d6a2d',border:'1px solid rgba(45,106,45,0.2)',fontSize:'0.73rem',fontWeight:700,padding:'3px 10px',borderRadius:20}}>
                          📍 {routeDistance ? `${routeDistance} km` : '—'}
                        </span>
                        <span style={{background:'rgba(59,130,246,0.1)',color:'#3b82f6',border:'1px solid rgba(59,130,246,0.2)',fontSize:'0.73rem',fontWeight:700,padding:'3px 10px',borderRadius:20}}>
                          ⏱ ~{routeDistance ? Math.max(Math.ceil(routeDistance * 3), 2) : '—'} min
                        </span>
                        <span style={{background:'rgba(224,123,42,0.1)',color:'#e07b2a',border:'1px solid rgba(224,123,42,0.2)',fontSize:'0.73rem',fontWeight:700,padding:'3px 10px',borderRadius:20}}>
                          🧭 {routeDirection}
                        </span>
                      </div>
                      <div style={{display:'flex',alignItems:'center',gap:5}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:'#22c55e',display:'inline-block',animation:'ping 1.5s cubic-bezier(0,0,0.2,1) infinite'}} />
                        <span style={{fontSize:'0.72rem',fontWeight:600,color:'#22c55e'}}>Live Tracking Active</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{textAlign:'center',padding:'6px 0'}}>
                    <p style={{margin:0,fontSize:'0.88rem',fontWeight:700,color:'var(--text-primary)'}}>📍 Select a donation to preview the route</p>
                    <p style={{margin:'4px 0 0',fontSize:'0.78rem',color:'var(--text-muted)'}}>Click "View route" on any card below to see the live pickup → dropoff path</p>
                  </div>
                )}
              </div>
            </div>

            {/* Filter bar */}
            <div style={{padding:'12px 20px',display:'flex',gap:6,flexWrap:'wrap',borderTop:'1px solid var(--border)',background:'var(--surface)'}}>
              {FILTERS.map(f=>(
                <button key={f} className={`filter-pill${mapFilter===f?' active':''}`} onClick={()=>setMapFilter(f)}>{f}</button>
              ))}
            </div>
          </div>

          {/* Donations Grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:16}}>
            {filtered.length===0 ? (
              <div style={{gridColumn:'1/-1',border:'2px dashed var(--border)',borderRadius:12,padding:'48px 24px',textAlign:'center'}}>
                <span style={{fontSize:40,display:'block',marginBottom:12}}>🔍</span>
                <p style={{margin:0,fontWeight:600,color:'var(--text-secondary)',fontSize:'0.9rem'}}>No donations match this filter</p>
              </div>
            ) : filtered.map((d,i)=>(
              <DonationCard
                key={d.id}
                donation={d}
                index={i}
                onAccept={handleAccept}
                onSelect={setSelectedDonation}
                selected={selectedDonation?.id === d.id}
              />
            ))}
          </div>
        </main>
      </div>

      {/* Accept Modal */}
      {modal && <AcceptModal donation={modal} onClose={()=>setModal(null)}/>}

      {/* Ping animation */}
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
    </div>
  );
}
