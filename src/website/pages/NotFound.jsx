import { Link } from 'react-router-dom';
import { Leaf, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--kraft-50)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '80px 0px',
      textAlign: 'center',
      fontFamily: "'Inter', sans-serif",
    }}>
      <div>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(100px, 20vw, 200px)',
          fontWeight: 700,
          color: 'var(--kraft-200)',
          lineHeight: 1,
          marginBottom: -16,
          userSelect: 'none',
        }}>
          404
        </div>
        <div style={{ width: 48, height: 48, margin: '0 auto 20px' }}>
          <Leaf size={48} color="var(--eco-500)" />
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(26px, 4vw, 40px)',
          color: 'var(--kraft-900)',
          marginBottom: 14,
        }}>
          Lost in the Woods?
        </h1>
        <p style={{ fontSize: 16, color: 'var(--kraft-500)', maxWidth: 400, margin: '0 auto 36px', lineHeight: 1.65 }}>
          The page you're looking for seems to have biodegraded or moved.
          Let's get you back on the trail.
        </p>
        <Link to="/" className="btn-primary" style={{ padding: '14px 36px', fontSize: 15 }}>
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
