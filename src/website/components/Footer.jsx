import { Link } from 'react-router-dom';
import { Leaf, Mail, Phone, MapPin, Link2, Globe, Heart } from 'lucide-react';

const shopLinks = [
  { label: 'Kraft Bags', to: '/products#ecocraft' },
  { label: 'F&B Gourmet Bags', to: '/products#fnb' },
  { label: 'Luxury Bags', to: '/products#luxury' },
  { label: 'Eco-Pouches', to: '/products' },
  { label: 'Custom Mailers', to: '/products' },
];

const policyLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Returns & Exchanges', to: '/returns' },
  { label: 'Shipping Policy', to: '/shipping' },
  { label: 'Terms & Conditions', to: '/terms' },
];

const supportLinks = [
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
  { label: 'Bulk Order Enquiry', to: '/contact' },
];

export default function Footer() {
  return (
    <footer style={{
      position: 'relative',
      background: 'white',
      color: 'var(--kraft-900)',
      paddingTop: 60, // Reduced from 80
      paddingBottom: 30, // Reduced from 40
      borderTop: '1px solid var(--kraft-100)',
      overflow: 'hidden'
    }}>
      {/* Background Image of Bags */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=2000")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.05, // Very subtle
        zIndex: 0,
        pointerEvents: 'none'
      }} />
      <div className="container">
        {/* Pinterest-style Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 32,
          marginBottom: 40, // Reduced from 64
          position: 'relative',
          zIndex: 1
        }}>
          {/* Brand Card */}
          <div style={{
            background: 'var(--kraft-50)',
            padding: 40,
            borderRadius: 32,
            gridColumn: 'span 1',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                <div style={{
                  width: 48, height: 48,
                  background: 'var(--eco-600)',
                  borderRadius: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Leaf size={24} color="white" />
                </div>
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: 'var(--kraft-950)' }}>Nirmalyam</div>
                  <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--eco-600)', fontWeight: 800 }}>Krafts</div>
                </div>
              </div>
              <p style={{ fontSize: 18, lineHeight: 1.6, color: 'var(--kraft-700)', marginBottom: 32, fontWeight: 500 }}>
                Crafting the future of sustainable luxury. Zero plastic, 100% impact.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 16 }}>
              {[
                { icon: Globe, href: '#' },
                { icon: Mail, href: 'mailto:hello@nirmalyamkrafts.com' },
                { icon: Phone, href: 'tel:+919876543210' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  style={{
                    width: 44, height: 44,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--kraft-900)',
                    textDecoration: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.background = 'var(--eco-600)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--kraft-900)'; }}
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1: Explore */}
          <div style={{ padding: '20px 10px' }}>
            <h4 style={{ fontSize: 20, fontWeight: 900, color: 'var(--kraft-950)', marginBottom: 32 }}>Explore</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...shopLinks, ...supportLinks.slice(0, 1)].map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 18,
                    color: 'var(--kraft-600)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.color = 'var(--eco-600)'; e.target.style.paddingLeft = '8px'; }}
                    onMouseLeave={e => { e.target.style.color = 'var(--kraft-600)'; e.target.style.paddingLeft = '0px'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2: Relations */}
          <div style={{ padding: '20px 10px' }}>
            <h4 style={{ fontSize: 20, fontWeight: 900, color: 'var(--kraft-950)', marginBottom: 32 }}>Relations</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[...supportLinks.slice(1), ...policyLinks].map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 18,
                    color: 'var(--kraft-600)',
                    textDecoration: 'none',
                    fontWeight: 500,
                    transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.target.style.color = 'var(--eco-600)'; e.target.style.paddingLeft = '8px'; }}
                    onMouseLeave={e => { e.target.style.color = 'var(--kraft-600)'; e.target.style.paddingLeft = '0px'; }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Reach Us Card */}
          <div style={{
            background: 'var(--kraft-950)',
            padding: 40,
            borderRadius: 32,
            color: 'white'
          }}>
            <h4 style={{ fontSize: 20, fontWeight: 900, color: 'white', marginBottom: 24 }}>Reach Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {[
                { icon: MapPin, text: 'Plot 42, Industrial Area, Noida, UP', sub: 'Main Production Unit' },
                { icon: Phone, text: '+91 98765 43210', sub: '9 AM - 7 PM' },
                { icon: Mail, text: 'hello@nirmalyam.com', sub: 'Bulk Inquiries' },
              ].map(({ icon: Icon, text, sub }) => (
                <div key={text} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.1)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={18} color="var(--eco-400)" />
                  </div>
                  <div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{text}</div>
                    <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: 24, // Reduced from 40
          borderTop: '1px solid var(--kraft-100)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}>
          <p style={{ fontSize: 16, color: 'var(--kraft-400)', fontWeight: 500 }}>
            © 2026 Nirmalyam Krafts. Designed with <Heart size={14} color="#ff4d4d" fill="#ff4d4d" style={{ display: 'inline', margin: '0 4px' }} /> in India.
          </p>
        </div>
      </div>
    </footer>
  );
}
