import { useState, useEffect, useCallback } from 'react';

/* ─── CSS injected once ────────────────────────────────────────────────────── */
const STYLE = `
@keyframes toastSlideDown {
  from { opacity: 0; transform: translateY(-24px) scale(0.96); }
  to   { opacity: 1; transform: translateY(0)     scale(1); }
}
@keyframes toastSlideUp {
  from { opacity: 1; transform: translateY(0)     scale(1); }
  to   { opacity: 0; transform: translateY(-24px) scale(0.96); }
}
.toast-enter { animation: toastSlideDown 0.3s cubic-bezier(0.22,1,0.36,1) forwards; }
.toast-exit  { animation: toastSlideUp  0.25s ease forwards; }
`;

let styleInjected = false;
const injectStyle = () => {
  if (styleInjected) return;
  const el = document.createElement('style');
  el.textContent = STYLE;
  document.head.appendChild(el);
  styleInjected = true;
};

/* ─── Toast types ──────────────────────────────────────────────────────────── */
const TYPES = {
  success: { bg: 'linear-gradient(135deg, #2d6a2d, #3d8b3d)', icon: '✅', shadow: '0 8px 32px rgba(45,106,45,0.35)' },
  error:   { bg: 'linear-gradient(135deg, #dc2626, #ef4444)',  icon: '❌', shadow: '0 8px 32px rgba(220,38,38,0.35)' },
  info:    { bg: 'linear-gradient(135deg, #2563eb, #3b82f6)',  icon: 'ℹ️', shadow: '0 8px 32px rgba(37,99,235,0.35)' },
  warning: { bg: 'linear-gradient(135deg, #d97706, #f59e0b)',  icon: '⚠️', shadow: '0 8px 32px rgba(217,119,6,0.35)' },
};

/* ─── Toast Component ─────────────────────────────────────────────────────── */
const Toast = ({ message, type = 'success', visible, onClose }) => {
  const [phase, setPhase] = useState('enter');
  const t = TYPES[type] || TYPES.success;

  useEffect(() => { injectStyle(); }, []);

  useEffect(() => {
    if (!visible) return;
    setPhase('enter');
    const auto = setTimeout(() => { setPhase('exit'); setTimeout(onClose, 250); }, 3000);
    return () => clearTimeout(auto);
  }, [visible, onClose]);

  if (!visible && phase !== 'exit') return null;

  return (
    <div
      style={{
        position: 'fixed', top: 24, left: '50%', transform: 'translateX(-50%)',
        zIndex: 9999, pointerEvents: 'auto',
      }}
    >
      <div
        className={phase === 'enter' ? 'toast-enter' : 'toast-exit'}
        style={{
          background: t.bg,
          color: 'white',
          borderRadius: 14,
          padding: '13px 22px',
          display: 'flex', alignItems: 'center', gap: 10,
          boxShadow: t.shadow,
          minWidth: 280, maxWidth: 440,
          cursor: 'pointer',
          userSelect: 'none',
        }}
        onClick={() => { setPhase('exit'); setTimeout(onClose, 250); }}
      >
        <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
        <span style={{ fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Inter, sans-serif', lineHeight: 1.4 }}>
          {message}
        </span>
        <button
          onClick={(e) => { e.stopPropagation(); setPhase('exit'); setTimeout(onClose, 250); }}
          style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.25)', border: 'none', cursor: 'pointer',
            borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: 'white', fontSize: 12, flexShrink: 0 }}
        >✕</button>
      </div>
    </div>
  );
};

/* ─── useToast hook ───────────────────────────────────────────────────────── */
export const useToast = () => {
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const show = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  const hide = useCallback(() => {
    setToast((t) => ({ ...t, visible: false }));
  }, []);

  const ToastNode = (
    <Toast message={toast.message} type={toast.type} visible={toast.visible} onClose={hide} />
  );

  return { show, ToastNode };
};

export default Toast;
