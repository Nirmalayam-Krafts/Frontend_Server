import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Mail, Mail as SubscribeIcon, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';

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

const Github = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
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
  { label: 'Privacy Policy', to: '/privacy' },
  { label: 'Terms of Service', to: '/terms' },
  { label: 'Returns Policy', to: '/returns' },
  { label: 'Shipping Terms', to: '/shipping' },
  { label: 'Accessibility', to: '/accessibility' },
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
      background: 'linear-gradient(145deg, #1f140d 0%, #120b07 100%)',
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
        backgroundImage: 'url("/images/testimonial_bg_texture.png")',
        backgroundSize: 'cover',
        opacity: 0.05,
        pointerEvents: 'none',
        zIndex: 0
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(12, 1fr)',
          gap: isMobile ? 60 : 40,
          marginBottom: 80
        }}>
          {/* Logo & Info */}
          <div style={{ gridColumn: isMobile ? 'span 1' : 'span 5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--eco-600)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Leaf size={24} color="white" />
              </div>
              <div>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>Nirmalyam Krafts</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em' }}>Premium Eco Packaging</div>
              </div>
            </div>

            <p style={{ 
              fontSize: 16, 
              lineHeight: 1.6, 
              color: 'rgba(255,255,255,0.7)', 
              marginBottom: 40, 
              maxWidth: 400 
            }}>
              Pioneering the future of plastic-free luxury packaging through advanced kraft paper technology. Join thousands of brands shaping a greener tomorrow.
            </p>

            {/* Newsletter */}
            <div>
              <h4 style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'white' }}>Stay Updated</h4>
              <form onSubmit={handleSubscribe} style={{ position: 'relative', maxWidth: 440 }}>
                <div style={{
                  display: 'flex',
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
                      outline: 'none'
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
                    transition: 'all 0.3s'
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
          <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3', paddingLeft: isMobile ? 0 : 40 }}>
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
          <div style={{ gridColumn: isMobile ? 'span 1' : 'span 3' }}>
            <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 30, color: 'white' }}>Company</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 16 }}>
              {['About Us', 'Sustainability', 'Testimonials', 'Contact Us'].map(label => (
                <li key={label}>
                  <Link to={`/${label.toLowerCase().replace(' ', '-')}`} style={{
                    fontSize: 16,
                    color: 'rgba(255,255,255,0.6)',
                    textDecoration: 'none',
                    transition: 'color 0.3s'
                  }}
                  onMouseEnter={e => e.target.style.color = 'white'}
                  onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.6)'}
                  >
                    {label}
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
                { icon: Instagram, color: '#E4405F' },
                { icon: Facebook, color: '#1877F2' },
                { icon: Linkedin, color: '#0A66C2' },
                { icon: Twitter, color: '#1DA1F2' },
                { icon: Github, color: '#333' }
              ].map(({ icon: Icon, color }, i) => (
                <a key={i} href="#" style={{
                  width: 44, height: 44,
                  borderRadius: 12,
                  background: 'rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <Icon size={20} />
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
              Response time: &lt; 2 business hours
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          paddingTop: 30,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 20
        }}>
          <div style={{ display: 'flex', gap: isMobile ? 12 : 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>
              © {new Date().getFullYear()} Nirmalyam Krafts Pro. All rights reserved.
            </p>
            {policyLinks.map(link => (
              <Link key={link.label} to={link.to} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>
                {link.label}
              </Link>
            ))}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80' }}></span>
                All systems operational
             </div>
             <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.1)' }}></div>
             <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
                Last updated: 1 hour ago
             </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
