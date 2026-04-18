import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Globe, Heart } from 'lucide-react';

/* ── Custom Social Icons ── */
const Instagram = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const Facebook = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

const Linkedin = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

const shopLinks = [
  { label: 'Kraft Bags', to: '/products' },
  { label: 'F&B Gourmet', to: '/products' },
  { label: 'Luxury Kraft', to: '/products' },
  { label: 'Eco-Pouches', to: '/products' },
  { label: 'Custom Mailers', to: '/products' },
];

const policyLinks = [
  { label: 'Privacy Policy', value: '/privacy' },
  { label: 'Returns Policy', value: '/returns' },
  { label: 'Shipping Terms', value: '/shipping' },
];

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <footer style={{
      position: 'relative',
      background: '#fafaf8',
      color: 'var(--kraft-950)',
      paddingTop: 100,
      paddingBottom: 40,
      borderTop: '2px solid var(--kraft-100)',
      overflow: 'hidden'
    }}>
      {/* Background Texture */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(var(--kraft-200) 0.5px, transparent 0.5px)',
        backgroundSize: '24px 24px',
        opacity: 0.3,
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        {/* Pinterest Masonry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 32,
          marginBottom: 80,
        }}>
          {/* Card 1: Brand Identity */}
          <div style={{
            background: 'white',
            padding: isMobile ? 32 : 48,
            borderRadius: 40,
            boxShadow: '0 20px 40px rgba(58, 36, 16, 0.04)',
            border: '1px solid var(--kraft-100)',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
              <div style={{
                width: 60, height: 60,
                background: 'var(--eco-600)',
                borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 10px 20px rgba(22, 163, 74, 0.2)'
              }}>
                <Leaf size={32} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--kraft-950)', lineHeight: 1 }}>Nirmalyam</div>
                <div style={{ fontSize: 13, letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--eco-600)', fontWeight: 800, marginTop: 4 }}>Krafts</div>
              </div>
            </div>
            
            <p style={{ fontSize: 22, lineHeight: 1.6, color: 'var(--kraft-700)', marginBottom: 40, fontWeight: 500 }}>
              Pioneering the next generation of plastic-free luxury packaging for a conscious world.
            </p>

            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { icon: Instagram, href: '#' },
                { icon: Facebook, href: '#' },
                { icon: Linkedin, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href} 
                  style={{
                    width: 56, height: 56,
                    borderRadius: '50%',
                    background: 'var(--kraft-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--kraft-900)',
                    textDecoration: 'none',
                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) translateY(-4px)'; e.currentTarget.style.background = 'var(--eco-600)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) translateY(0)'; e.currentTarget.style.background = 'var(--kraft-50)'; e.currentTarget.style.color = 'var(--kraft-900)'; }}
                >
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>

          {/* Card 2: Quick Links */}
          <div style={{
            background: 'white',
            padding: isMobile ? 32 : 48,
            borderRadius: 40,
            boxShadow: '0 20px 40px rgba(58, 36, 16, 0.04)',
            border: '1px solid var(--kraft-100)',
          }}>
            <h4 style={{ fontSize: 26, fontWeight: 800, color: 'var(--kraft-950)', marginBottom: 32, letterSpacing: '-0.5px' }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 20 }}>
              {shopLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 22,
                    color: 'var(--kraft-600)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.3s',
                    display: 'block'
                  }}
                  onMouseEnter={e => { e.target.style.color = 'var(--eco-600)'; e.target.style.transform = 'translateX(10px)'; }}
                  onMouseLeave={e => { e.target.style.color = 'var(--kraft-600)'; e.target.style.transform = 'translateX(0)'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 3: Contact Details */}
          <div style={{
            background: 'var(--kraft-950)',
            padding: isMobile ? 32 : 48,
            borderRadius: 40,
            color: 'white',
            boxShadow: '0 30px 60px rgba(0,0,0,0.15)',
          }}>
            <h4 style={{ fontSize: 26, fontWeight: 800, color: 'white', marginBottom: 32, letterSpacing: '-0.5px' }}>Let's Connect</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {[
                { icon: MapPin, text: 'Pune & Mumbai', sub: 'Regional Distribution Hubs' },
                { icon: Phone, text: '+91 98765 43210', sub: 'Direct Inquiries' },
                { icon: Mail, text: 'hello@nirmalyam.com', sub: 'Bulk Quotations' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ 
                    width: 52, height: 52, 
                    background: 'rgba(255,255,255,0.08)', 
                    borderRadius: 16, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0 
                  }}>
                    <Icon size={24} color="var(--eco-400)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>{text}</div>
                    <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <Link to="/contact" className="btn-primary" style={{ 
              marginTop: 40, 
              width: '100%', 
              justifyContent: 'center',
              padding: '20px',
              fontSize: '18px',
              background: 'var(--eco-600)',
              color: 'white'
            }}>
              Get a Free Quote
            </Link>
          </div>
        </div>

        {/* Bottom Credits */}
        <div style={{
          paddingTop: 40,
          borderTop: '1px solid var(--kraft-200)',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 24,
        }}>
          <p style={{ fontSize: 18, color: 'var(--kraft-500)', fontWeight: 500, textAlign: isMobile ? 'center' : 'left' }}>
            © {new Date().getFullYear()} Nirmalyam Krafts. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: isMobile ? 16 : 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {policyLinks.map(link => (
              <a key={link.label} href={link.value} style={{ fontSize: 16, color: 'var(--kraft-400)', textDecoration: 'none', fontWeight: 600 }}>
                {link.label}
              </a>
            ))}
          </div>
          <p style={{ fontSize: 16, color: 'var(--kraft-500)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
            Made with <Heart size={18} color="#ff4d4d" fill="#ff4d4d" /> in India
          </p>
        </div>
      </div>
    </footer>
  );
}
