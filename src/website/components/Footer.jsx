import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Mail as SubscribeIcon, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';
import { CONFIG } from '../config';

/* ── Custom Social Icons to ensure reliability ── */
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

const Twitter = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
  </svg>
);

const Youtube = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const shopLinks = [
  { label: 'Kraft Bags', to: '/products/ecocraft' },
  { label: 'F&B Gourmet', to: '/products/fnb' },
  { label: 'Luxury Kraft', to: '/products/luxury' },
  { label: 'Eco-Pouches', to: '/products' },
  { label: 'Kraft Rolls', to: '/products/industrial' },
];

const policyLinks = [
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Returns Policy', to: '/returns' },
  { label: 'Shipping Terms', to: '/shipping' },
];

export default function Footer() {
  const [isMobile, setIsMobile] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    alert(`Thank you for subscribing, ${email}!`);
    setEmail('');
  };

  return (
    <footer style={{
      background: 'linear-gradient(135deg, #8b5e3c 0%, #2b1b12 100%)',
      color: 'white',
      padding: isMobile ? '60px 24px 30px' : '100px 0 40px',
      fontFamily: 'Inter, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Subtle paper texture overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'url("/images/testimonial_bg_texture.webp")',
        backgroundSize: 'cover',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '100%', padding: isMobile ? '0' : '0 80px', boxSizing: 'border-box' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
          gap: isMobile ? 60 : 40,
          marginBottom: 80
        }}>
          {/* Logo & Info */}
          <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <img 
                src="/Nirmalyam Logo-modified.webp" 
                alt="Nirmalyam Krafts Logo" 
                style={{ 
                  height: '130px', 
                  width: 'auto', 
                  objectFit: 'contain'
                }} 
              />
            </div>

            <p style={{ 
              fontSize: isMobile ? 14 : 16, 
              lineHeight: 1.6, 
              color: 'rgba(255,255,255,0.7)', 
              marginBottom: 40, 
              maxWidth: '100%',
              wordWrap: 'break-word'
            }}>
              Pioneering the future of plastic-free packaging through advanced kraft paper technology. Shaping a greener tomorrow.
            </p>

            {/* Newsletter */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'white' }}>Stay Updated</h4>
              <form onSubmit={handleSubscribe} style={{ position: 'relative', maxWidth: '100%' }}>
                <div style={{
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: 12,
                  background: 'rgba(255,255,255,0.05)',
                  padding: 8,
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'white',
                      padding: '8px 16px',
                      fontSize: 15,
                      outline: 'none',
                      minWidth: 0
                    }}
                    required
                  />
                  <button type="submit" style={{
                    background: 'var(--eco-600)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 14,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--eco-500)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--eco-600)'}
                  >
                    Subscribe
                  </button>
                </div>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 12 }}>
                  Get the latest updates on sustainable innovations and new collections.
                </p>
              </form>
            </div>
          </div>

          {/* Links Column 1 */}
          <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 30, color: 'white' }}>Catalog</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {shopLinks.map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div style={{ gridColumn: isMobile ? 'span 1' : 'span 4' }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 30, color: 'white' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { label: 'About Us', to: '/about' },
                { label: 'Sustainability', to: '/sustainability' },
                ...(CONFIG.SHOW_TESTIMONIALS ? [{ label: 'Testimonials', to: '/#testimonials' }] : []),
                { label: 'Contact Us', to: '/contact#contact-form' }
              ].map(link => (
                <li key={link.label}>
                  <Link to={link.to} style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Middle Level: Socials & Contact Info */}
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 40,
          paddingBottom: 60,
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Follow Us:</span>
            <div style={{ display: 'flex', gap: 12 }}>
              {[
                { icon: Instagram, color: '#E4405F', url: 'https://www.instagram.com/nirmalyamkrafts' },
                { icon: Facebook, color: '#1877F2', url: 'https://www.facebook.com/nirmalyamkrafts' },
                { icon: Linkedin, color: '#0A66C2', url: 'https://www.linkedin.com/company/nirmalyamkrafts' },
                { icon: Twitter, color: '#1DA1F2', url: 'https://x.com/nirmalyamkrafts' },
                { icon: Youtube, color: '#FF0000', url: 'https://www.youtube.com/@nirmalyamkrafts' }
              ].map(({ icon: Icon, color, url }, i) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer" style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Icon size={28} />
                </a>
              ))}
            </div>
          </div>

          <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 8 }}>Questions? Contact us:</div>
            <a href="mailto:hello@nirmalyamkrafts.com" style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--eco-400)',
              textDecoration: 'none'
            }}>
              hello@nirmalyamkrafts.com
            </a>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
              Quick & Reliable Support
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: 30,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 20
        }}>
          <div style={{ display: 'flex', gap: isMobile ? 12 : 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} Nirmalyam Krafts. All rights reserved.
            </p>
            {policyLinks.map(link => (
              <Link key={link.label} to={link.to} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
