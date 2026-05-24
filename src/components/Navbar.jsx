import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Bell, Menu, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Navbar = () => {
  const { currentUser, role, logout, notifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const unread = notifications?.filter((n) => !n.read).length || 0;
  const trustScore = currentUser?.trustScore ?? 4.8;
  const initial = currentUser?.name?.charAt(0)?.toUpperCase() || 'U';

  const dashPath =
    role === 'receiver' ? '/receiver' :
    role === 'admin'    ? '/admin'    : '/donor';

  const links = [
    { label: 'Dashboard', path: dashPath },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Profile', path: '/profile' },
    { label: 'Notifications', path: '/notifications' },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const go = (path) => {
    setMobileOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('ts_role');
    localStorage.removeItem('ts_user');
    setMobileOpen(false);
    navigate('/');
  };

  return (
    <>
      <nav
        className={`sticky top-0 z-50 h-16 bg-white/92 backdrop-blur-md border-b border-[var(--border)] transition-shadow duration-300 ${
          scrolled ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-full flex items-center gap-4 sm:gap-6">

          <button
            type="button"
            onClick={() => go(dashPath)}
            className="flex items-center gap-2 shrink-0 bg-transparent border-none cursor-pointer p-0"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-green-600 flex items-center justify-center shadow-md">
              <span className="text-white text-xs">🍃</span>
            </div>
            <span className="text-lg sm:text-xl font-extrabold">
              <span className="text-primary">Trust</span>
              <span className="text-accent">Serve</span>
            </span>
          </button>

          <div className="hidden lg:flex items-center gap-6 flex-1 justify-center">
            {links.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => go(link.path)}
                  className={`nav-link relative ${isActive ? 'active' : ''}`}
                >
                  {link.label}
                  {link.label === 'Notifications' && unread > 0 && (
                    <span className="absolute -top-1.5 -right-3 bg-accent text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 sm:gap-3 ml-auto">
            <button
              type="button"
              onClick={() => go('/notifications')}
              className="relative p-2 rounded-lg text-secondary hover:text-primary hover:bg-[var(--surface)] transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unread > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border-2 border-white" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-1.5 bg-primary/10 border border-primary/20 rounded-full px-3 py-1.5">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-bold text-primary">{trustScore}</span>
            </div>

            <button
              type="button"
              onClick={() => go('/profile')}
              className="hidden md:flex items-center gap-2 bg-transparent border-none cursor-pointer p-0"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white text-sm font-bold shadow">
                {initial}
              </div>
              <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate hidden lg:inline">
                {currentUser?.name?.split(' ')[0] || 'User'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="hidden sm:flex p-2 rounded-lg text-muted hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut size={17} />
            </button>

            <button
              type="button"
              className="lg:hidden w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-drawer-backdrop" onClick={() => setMobileOpen(false)} />
        <div className="mobile-drawer-panel">
          <div className="flex justify-between items-center mb-4">
            <span className="font-extrabold text-lg">
              <span className="text-primary">Trust</span>
              <span className="text-accent">Serve</span>
            </span>
            <button type="button" onClick={() => setMobileOpen(false)} className="w-10 h-10 rounded-lg border flex items-center justify-center" aria-label="Close">
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3 p-3 bg-[var(--surface)] rounded-xl mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-green-600 flex items-center justify-center text-white font-bold">
              {initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm truncate">{currentUser?.name || 'User'}</p>
              <p className="text-xs text-muted">⭐ {trustScore} Trust Score</p>
            </div>
          </div>

          {links.map((link) => (
            <button
              key={link.label}
              type="button"
              onClick={() => go(link.path)}
              className={`mobile-nav-link w-full text-left ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.label}
              {link.label === 'Notifications' && unread > 0 && ` (${unread})`}
            </button>
          ))}

          <hr className="divider my-3" />
          <button
            type="button"
            onClick={handleLogout}
            className="mobile-nav-link w-full text-left text-red-600 hover:bg-red-50"
          >
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Navbar;
