import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { donors, receivers } from '../data/mockData';

const AnimatedWord = ({ word, delay }) => (
  <span
    className="animate-word-reveal inline-block mr-[0.25em]"
    style={{ animationDelay: `${delay}s` }}
  >
    {word}
  </span>
);

const HeroLine = ({ text, colorClass, startDelay }) =>
  text.split(' ').map((word, i) => (
    <AnimatedWord key={i} word={word} colorClass={colorClass} delay={startDelay + i * 0.12} />
  ));

const StatPill = ({ icon, label, delay }) => (
  <div
    className="stat-pill animate-pill-pop flex items-center gap-2 bg-white border border-gray-100 rounded-full px-4 py-2 shadow-sm shrink-0"
    style={{ animationDelay: `${delay}s` }}
  >
    <span className="text-base">{icon}</span>
    <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">{label}</span>
  </div>
);

const RoleCard = ({ icon, label, value, selected, onClick }) => (
  <button
    type="button"
    onClick={() => onClick(value)}
    className={`role-card flex-1 flex flex-col items-center gap-1.5 py-3.5 px-2 rounded-2xl border-2 cursor-pointer bg-white transition-all duration-200 ${
      selected ? 'selected border-primary bg-green-50' : 'border-gray-100 hover:border-gray-200'
    }`}
  >
    <span className="text-2xl">{icon}</span>
    <span className={`text-xs font-bold ${selected ? 'text-primary' : 'text-gray-500'}`}>{label}</span>
  </button>
);

const Login = () => {
  const navigate = useNavigate();
  const { login } = useApp();
  const [activeTab, setActiveTab] = useState('login');
  const [role, setRole] = useState('donor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (activeTab === 'register' && !name) { setError('Please enter your name.'); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    let matchedUser =
      role === 'donor' ? donors[0] :
      role === 'receiver' ? receivers[0] :
      { id: 'admin', name: 'TrustServe Admin', type: 'Administrator', trustScore: 5.0 };

    if (activeTab === 'register') {
      const template = role === 'donor' ? donors[0] : role === 'receiver' ? receivers[0] : {};
      matchedUser = {
        ...template,
        id: `${role}-${Date.now()}`,
        name,
        type: role === 'admin' ? 'Administrator' : template.type || (role === 'donor' ? 'Restaurant' : 'NGO'),
        trustScore: template.trustScore ?? 4.8,
        totalDonations: template.totalDonations ?? 0,
        totalReceived: template.totalReceived ?? 0,
        location: template.location || (role === 'donor' ? 'Bangalore' : 'Bangalore'),
        coordinates: template.coordinates || { lat: 12.9698, lon: 77.7490 },
      };
    }

    localStorage.setItem('ts_role', role);
    localStorage.setItem('ts_user', JSON.stringify(matchedUser));
    login(matchedUser, role);
    navigate(`/${role}`);
    setLoading(false);
  };

  return (
    <div className="min-h-[100dvh] bg-white flex flex-col lg:flex-row items-stretch overflow-hidden">

      {/* ── Left Hero ── */}
      <div className="dot-pattern hidden lg:flex flex-col justify-center flex-1 px-12 xl:px-20 py-12 bg-gray-50 relative overflow-hidden">
        {/* Gradient overlay so dots fade at edges */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-transparent to-white/40 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-8 max-w-lg">
          {/* Logo */}
          <div className="animate-fade-slide-up delay-0 flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🍃</span>
            </div>
            <span className="text-xl font-bold">
              <span style={{ color: '#2d6a2d' }}>Trust</span>
              <span style={{ color: '#e07b2a' }}>Serve</span>
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1 className="hero-heading text-5xl xl:text-6xl font-black tracking-tight leading-[1.05]">
              <span className="block text-primary">
                <HeroLine text="Share Food." colorClass="text-primary" startDelay={0.15} />
              </span>
              <span className="block text-accent mt-1">
                <HeroLine text="Build Trust." colorClass="text-accent" startDelay={0.42} />
              </span>
              <span className="block text-gray-900 mt-1">
                <HeroLine text="Serve Better." colorClass="text-gray-900" startDelay={0.68} />
              </span>
            </h1>
            <p className="animate-fade-slide-up delay-10 mt-5 text-gray-500 text-base font-medium leading-relaxed">
              A verified food redistribution platform for a smarter, kinder city.
            </p>
          </div>

          {/* Stat pills — single row */}
          <div className="flex flex-row flex-nowrap gap-3">
            <StatPill icon="🍛" label="1,240+ Meals Saved" delay={1.05} />
            <StatPill icon="🏪" label="38 Active Donors"   delay={1.15} />
            <StatPill icon="🤝" label="22 NGOs Served"     delay={1.25} />
          </div>

          {/* Social proof */}
          <div className="animate-fade-slide-up delay-14 flex items-center gap-4">
            <div className="flex -space-x-2">
              {['🧑‍🍳', '👩‍💼', '👨‍🦱', '👩‍🦰'].map((em, i) => (
                <div key={i} className="w-9 h-9 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-base shadow-sm">
                  {em}
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 font-medium">
              Joined by <span className="font-bold text-gray-700">260+ members</span> this month
            </p>
          </div>
        </div>
      </div>

      {/* ── Right Auth Panel ── */}
      <div className="flex flex-col justify-center items-center flex-1 lg:max-w-[480px] px-4 sm:px-6 py-8 sm:py-10 bg-white overflow-y-auto w-full">
        <Link
          to="/"
          className="self-start flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-primary transition-colors mb-6 lg:mb-8"
        >
          <ArrowLeft size={16} />
          Back to home
        </Link>

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-6 -mt-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-white">🍃</span>
          </div>
          <span className="text-xl font-bold">
            <span style={{ color: '#2d6a2d' }}>Trust</span>
            <span style={{ color: '#e07b2a' }}>Serve</span>
          </span>
        </div>

        <div className="auth-card animate-scale-in delay-3 w-full max-w-md bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-xl">

          {/* Tabs */}
          <div className="relative flex bg-gray-100 rounded-2xl p-1 mb-7">
            {['login', 'register'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { setActiveTab(tab); setError(''); }}
                className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors duration-200 ${
                  activeTab === tab ? 'text-white' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {activeTab === tab && (
                  <span className="tab-indicator absolute inset-0 bg-primary rounded-xl shadow-md" />
                )}
                <span className="relative capitalize">{tab}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Role selector */}
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">I am a…</p>
              <div className="flex gap-2">
                <RoleCard icon="🍽️" label="Donor"    value="donor"    selected={role === 'donor'}    onClick={setRole} />
                <RoleCard icon="🤝" label="Receiver"  value="receiver" selected={role === 'receiver'} onClick={setRole} />
                <RoleCard icon="🛡️" label="Admin"    value="admin"    selected={role === 'admin'}    onClick={setRole} />
              </div>
            </div>

            {/* Name (register only) */}
            {activeTab === 'register' && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name / Organization</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">👤</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} type="text"
                    placeholder="e.g. The Grand Bistro"
                    className="input-green w-full border border-gray-200 rounded-xl bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium placeholder-gray-400 transition-all" />
                </div>
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">✉️</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                  placeholder={role === 'admin' ? 'admin@trustserve.com' : 'you@example.com'}
                  className="input-green w-full border border-gray-200 rounded-xl bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium placeholder-gray-400 transition-all" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base pointer-events-none">🔒</span>
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password"
                  placeholder="••••••••"
                  className="input-green w-full border border-gray-200 rounded-xl bg-gray-50 py-3 pl-10 pr-4 text-sm font-medium placeholder-gray-400 transition-all" />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                <span className="text-red-500">⚠️</span>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <p className="text-xs text-gray-400 text-center -mt-1">
              {role === 'admin' ? 'Demo: any email & password works' : 'Demo: any email & password to continue'}
            </p>

            <button type="submit" disabled={loading}
              className="btn-shimmer mt-1 w-full py-3.5 rounded-2xl text-white font-bold text-sm tracking-wide shadow-lg disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </span>
              ) : `${activeTab === 'login' ? 'Login' : 'Create Account'} as ${roleLabel}`}
            </button>

            <p className="text-center text-sm text-gray-500">
              {activeTab === 'login' ? (
                <>New to TrustServe?{' '}
                  <button type="button" onClick={() => { setActiveTab('register'); setError(''); }}
                    className="font-semibold text-primary hover:underline">Create account</button></>
              ) : (
                <>Already have an account?{' '}
                  <button type="button" onClick={() => { setActiveTab('login'); setError(''); }}
                    className="font-semibold text-primary hover:underline">Sign in</button></>
              )}
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
