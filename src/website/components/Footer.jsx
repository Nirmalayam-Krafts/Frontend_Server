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
      background: 'linear-gradient(160deg, var(--kraft-950) 0%, var(--kraft-900) 100%)',
      color: 'var(--kraft-200)',
      paddingTop: 72,
    }}>
      <div className="container" style={{ padding: '0 24px' }}>
        {/* Top Row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 48,
          paddingBottom: 56,
          borderBottom: '1px solid rgba(192,148,87,0.2)',
        }}>
          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <div style={{
                width: 40, height: 40,
                background: 'linear-gradient(135deg, var(--kraft-600), var(--kraft-400))',
                borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Leaf size={18} color="white" />
              </div>
              <div>
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 700, color: 'var(--kraft-100)' }}>Nirmalyam</div>
                <div style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--eco-400)' }}>Krafts</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--kraft-400)', marginBottom: 20 }}>
              Leading the transition to zero-waste packaging in India with premium kraft paper solutions for modern brands.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: Link2, href: '#' },
                { icon: Globe, href: '#' },
                { icon: Heart, href: '#' },
              ].map(({ icon: Icon, href }, i) => (
                <a key={i} href={href}
                  style={{
                    width: 36, height: 36,
                    borderRadius: 8,
                    border: '1px solid rgba(192,148,87,0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--kraft-400)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--eco-500)'; e.currentTarget.style.color = 'var(--eco-400)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(192,148,87,0.3)'; e.currentTarget.style.color = 'var(--kraft-400)'; }}
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kraft-300)', marginBottom: 18 }}>Shop</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shopLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 14,
                    color: 'var(--kraft-400)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--kraft-100)'}
                    onMouseLeave={e => e.target.style.color = 'var(--kraft-400)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kraft-300)', marginBottom: 18 }}>Policies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {policyLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 14,
                    color: 'var(--kraft-400)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--kraft-100)'}
                    onMouseLeave={e => e.target.style.color = 'var(--kraft-400)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kraft-300)', marginBottom: 18 }}>Support</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {supportLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 14,
                    color: 'var(--kraft-400)',
                    textDecoration: 'none',
                    transition: 'color 0.2s',
                  }}
                    onMouseEnter={e => e.target.style.color = 'var(--kraft-100)'}
                    onMouseLeave={e => e.target.style.color = 'var(--kraft-400)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--kraft-300)', marginBottom: 18 }}>Contact</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: Mail, text: 'hello@nirmalyamkrafts.com', href: 'mailto:hello@nirmalyamkrafts.com' },
                { icon: Phone, text: '+91 98765 43210', href: 'tel:+919876543210' },
                { icon: MapPin, text: 'Plot 42, Industrial Area Phase II, Bengaluru, KA 560066', href: null },
              ].map(({ icon: Icon, text, href }) => (
                <div key={text} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <Icon size={15} color="var(--eco-500)" style={{ marginTop: 2, flexShrink: 0 }} />
                  {href ? (
                    <a href={href} style={{ fontSize: 13, color: 'var(--kraft-400)', textDecoration: 'none', lineHeight: 1.5 }}
                      onMouseEnter={e => e.target.style.color = 'var(--kraft-100)'}
                      onMouseLeave={e => e.target.style.color = 'var(--kraft-400)'}
                    >{text}</a>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--kraft-400)', lineHeight: 1.5 }}>{text}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16,
          padding: '20px 0',
        }}>
          <p style={{ fontSize: 13, color: 'var(--kraft-600)' }}>
            © 2026 Nirmalyam Krafts. All rights reserved.
          </p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Security', 'Accessibility', 'Status'].map(label => (
              <Link key={label} to="#" style={{
                fontSize: 13,
                color: 'var(--kraft-600)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
                onMouseEnter={e => e.target.style.color = 'var(--kraft-300)'}
                onMouseLeave={e => e.target.style.color = 'var(--kraft-600)'}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
