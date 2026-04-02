import { Link } from 'react-router-dom';
import { Lock, ArrowLeft } from 'lucide-react';

export default function AdminPlaceholder() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--kraft-950) 0%, var(--kraft-900) 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 'var(--radius-xl)',
        padding: '64px 56px',
        textAlign: 'center',
        maxWidth: 440,
        backdropFilter: 'blur(16px)',
      }}>
        <div style={{
          width: 80, height: 80,
          borderRadius: '50%',
          background: 'rgba(192,148,87,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '1px solid rgba(192,148,87,0.3)',
        }}>
          <Lock size={32} color="var(--kraft-400)" />
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--eco-400)', marginBottom: 12 }}>
          Restricted Area
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 32,
          color: 'white',
          marginBottom: 14,
        }}>
          Admin Portal
        </h1>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 36 }}>
          This area is restricted to Nirmalyam Krafts administrators only.
          Please contact your system administrator for access.
        </p>
        <Link to="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 28px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 'var(--radius-full)',
          color: 'rgba(255,255,255,0.8)',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 600,
          transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
        >
          <ArrowLeft size={15} /> Back to Website
        </Link>
      </div>
    </div>
  );
}
