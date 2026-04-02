import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Leaf, Recycle, Package, Zap,
  Star, ChevronLeft, ChevronRight, Award, Shield,
  TrendingUp, Users, X, MessageCircle, Send
} from 'lucide-react';

/* ── WhatsApp SVG icon ── */
function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ── Animated counter ── */
function Counter({ to, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        const duration = 1800;
        const steps = 60;
        const increment = to / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= to) { setCount(to); clearInterval(timer); }
          else setCount(Math.floor(current));
        }, duration / steps);
      }
    }, { threshold: 0.4 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to]);

  return <span ref={ref}>{prefix}{count.toLocaleString('en-IN')}{suffix}</span>;
}

/* ── Testimonials ── */
const testimonials = [
  {
    name: 'Sarah Merchant',
    role: 'Boutique Owner',
    text: '"The print quality on our custom bags exceeded expectations. Our customers frequently compliment the premium feel, which perfectly aligns with our brand\'s eco-conscious values."',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Bakery Founder',
    text: '"Finally found a supplier that understands the needs of a small bakery. The low MOQ and fast turnaround helped us manage our inventory easily without large upfront costs."',
    rating: 5,
  },
  {
    name: 'Aditi Sharma',
    role: 'Corporate Manager',
    text: '"Efficient delivery even to our Tier 2 city locations across India. Nirmalyam has become our primary packaging partner for all our wholesale and retail operations."',
    rating: 5,
  },
];

/* ── Category cards ── */
const categories = [
  {
    title: 'Ecocraft Bags',
    desc: 'Durable, eco-friendly everyday packaging perfect for retail and grocery needs.',
    icon: Package,
    color: '#4ade80',
    bg: '#f0fdf4',
    to: '/products#ecocraft',
  },
  {
    title: 'F&B Gourmet Bags',
    desc: 'Premium carry bags specifically designed for cafes, restaurants, and gourmet food brands.',
    icon: Zap,
    color: '#f59e0b',
    bg: '#fffbeb',
    to: '/products#fnb',
  },
  {
    title: 'Luxury Bags',
    desc: 'High-finish, elegant packaging for premium retail, jewelry, and exclusive gifting.',
    icon: Award,
    color: '#c09457',
    bg: '#fdf9f3',
    to: '/products#luxury',
  },
];

/* ── Why Nirmalyam features ── */
const features = [
  { icon: Recycle, title: '100% Recyclable', desc: 'Sustainable materials that don\'t compromise on durability or professional feel.' },
  { icon: Package, title: 'Custom Printing', desc: 'High-precision offset and screen printing that brings your brand logo to life.' },
  { icon: Shield, title: 'Low MOQ', desc: 'Empowering startups with flexible small batch orders starting from just 500 units.' },
  { icon: Award, title: 'Quality Assured', desc: 'Rigorous multi-stage QC protocols ensuring every product meets our artisanal standards.' },
];

/* ── Stats ── */
const stats = [
  { value: 12000, suffix: '+', label: 'Brands Served', icon: Users },
  { value: 500, prefix: '₹', suffix: ' Cr+', label: 'Revenue Generated', icon: TrendingUp },
  { value: 99, suffix: '%', label: 'On-Time Delivery', icon: Shield },
  { value: 100, suffix: '%', label: 'Plastic Free Process', icon: Leaf },
];

export default function Home() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupName, setPopupName] = useState('');
  const [popupEmail, setPopupEmail] = useState('');
  const [popupSent, setPopupSent] = useState(false);

  /* ── 6-second popup timer ── */
  useEffect(() => {
    const timer = setTimeout(() => setPopupOpen(true), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    if (!popupName || !popupEmail) return;
    setPopupSent(true);
    setTimeout(() => { setPopupOpen(false); setPopupSent(false); setPopupName(''); setPopupEmail(''); }, 2200);
  };

  const prev = () => setActiveTestimonial(p => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setActiveTestimonial(p => (p + 1) % testimonials.length);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
      }}>
        {/* Nature background image */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/hero-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center top',
          backgroundRepeat: 'no-repeat',
        }} />

        {/* Overlay gradient left→transparent + bottom fade to cream */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(to right, rgba(255,253,245,0.96) 0%, rgba(255,253,245,0.82) 42%, rgba(255,253,245,0.15) 70%, transparent 100%),
            linear-gradient(to top, rgba(246,242,235,1) 0%, transparent 25%)
          `,
        }} />

        {/* Content */}
        <div className="container" style={{
          position: 'relative',
          zIndex: 1,
          padding: '120px 40px 80px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 40,
          alignItems: 'center',
        }}>
          {/* Left — text */}
          <div>
            {/* Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              background: 'rgba(22,101,52,0.1)',
              border: '1px solid rgba(22,101,52,0.25)',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#166534',
              marginBottom: 24,
            }}>
              <Leaf size={11} /> Sustainable Solutions
            </div>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 5.5vw, 72px)',
              fontWeight: 800,
              color: '#1a1208',
              lineHeight: 1.1,
              marginBottom: 18,
            }}>
              The Future of<br />
              <span style={{ color: '#7a4a1e' }}>Eco Packaging</span>
            </h1>

            <p style={{
              fontSize: 16,
              color: '#4a3c2a',
              lineHeight: 1.75,
              maxWidth: 440,
              marginBottom: 36,
            }}>
              Transforming Indian retail with premium, custom-printed kraft paper solutions.
              Elevate your brand sustainably with Nirmalyam Krafts.
            </p>

            {/* CTA buttons */}
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {/* WhatsApp button */}
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '14px 28px',
                  background: '#25D366',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  boxShadow: '0 4px 20px rgba(37,211,102,0.35)',
                  transition: 'all 0.25s',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(37,211,102,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,211,102,0.35)'; }}
              >
                <WhatsAppIcon size={19} />
                Chat on WhatsApp
              </a>

              {/* Get a Quote button */}
              <Link
                to="/contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '13px 28px',
                  background: 'white',
                  color: '#5c3d1a',
                  border: '2px solid #c09457',
                  borderRadius: 'var(--radius-full)',
                  fontWeight: 700,
                  fontSize: 15,
                  textDecoration: 'none',
                  transition: 'all 0.25s',
                  boxShadow: '0 2px 12px rgba(192,148,87,0.15)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#fdf6ec'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.transform = 'none'; }}
              >
                Get a Quote
              </Link>
            </div>

            {/* Mini stats row */}
            <div style={{ display: 'flex', gap: 36, marginTop: 44, flexWrap: 'wrap' }}>
              {[
                { value: '12,000+', label: 'Brands Served' },
                { value: '500 units', label: 'Min. Order' },
                { value: 'Pan India', label: 'Delivery' },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: '#2d1a06', fontFamily: "'Playfair Display', serif" }}>{s.value}</div>
                  <div style={{ fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#7a6a55', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — floating bag image */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}>
            <div style={{
              width: 'clamp(280px, 38vw, 480px)',
              height: 'clamp(280px, 38vw, 480px)',
              borderRadius: '32px',
              overflow: 'hidden',
              boxShadow: '0 32px 80px rgba(60,35,10,0.28), 0 8px 24px rgba(60,35,10,0.16)',
              animation: 'float 5s ease-in-out infinite',
              background: '#2a1a08',
            }}>
              <img
                src="/hero-bag.png"
                alt="Premium Nirmalyam kraft paper bag"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            {/* Eco tag floating badge */}
            <div style={{
              position: 'absolute',
              bottom: 24,
              left: -10,
              background: 'white',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
              boxShadow: '0 8px 28px rgba(0,0,0,0.12)',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              animation: 'float 5s ease-in-out infinite 1s',
            }}>
              <div style={{
                width: 36, height: 36,
                borderRadius: 10,
                background: 'rgba(74,222,128,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Leaf size={16} color="#16a34a" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#1a1208' }}>100% Plastic Free</div>
                <div style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>Certified Eco ✓</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 80L1440 80L1440 40C1200 0 960 80 720 40C480 0 240 80 0 40L0 80Z" fill="var(--kraft-50)" />
          </svg>
        </div>
      </section>

      {/* ══════════════════ 6-SECOND POPUP ══════════════════ */}
      {popupOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(10,6,2,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            animation: 'fadeIn 0.3s ease',
          }}
          onClick={e => { if (e.target === e.currentTarget) setPopupOpen(false); }}
        >
          <div style={{
            background: 'white',
            borderRadius: 20,
            width: '100%',
            maxWidth: 500,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
            animation: 'fadeInUp 0.35s ease',
            position: 'relative',
          }}>
            {/* Close btn */}
            <button
              onClick={() => setPopupOpen(false)}
              style={{
                position: 'absolute',
                top: 14, right: 14,
                width: 30, height: 30,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.12)',
                border: 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                zIndex: 1,
                transition: 'background 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,0,0,0.22)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,0,0,0.12)'}
            >
              <X size={14} color="white" />
            </button>

            {/* Popup image */}
            <div style={{ height: 200, overflow: 'hidden', position: 'relative' }}>
              <img
                src="/popup-bags.png"
                alt="Nirmalyam kraft bags"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.35) 100%)',
              }} />
            </div>

            {/* Content */}
            <div style={{ padding: '28px 32px 32px' }}>
              {!popupSent ? (
                <>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 24,
                    fontWeight: 700,
                    color: '#1a1208',
                    marginBottom: 8,
                  }}>
                    Looking for a Quote?
                  </h2>
                  <p style={{ fontSize: 14, color: '#7a6a55', marginBottom: 22, lineHeight: 1.6 }}>
                    Get custom pricing for your sustainable packaging needs.
                    We usually reply within 2 hours!
                  </p>

                  <form onSubmit={handlePopupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <input
                      type="text"
                      placeholder="Your Name"
                      value={popupName}
                      onChange={e => setPopupName(e.target.value)}
                      className="input-field"
                      style={{ fontSize: 14 }}
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={popupEmail}
                      onChange={e => setPopupEmail(e.target.value)}
                      className="input-field"
                      style={{ fontSize: 14 }}
                      required
                    />
                    <button
                      type="submit"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        padding: '14px',
                        background: '#1a4a2e',
                        color: 'white',
                        border: 'none',
                        borderRadius: 10,
                        fontWeight: 700,
                        fontSize: 15,
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                        marginTop: 4,
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#145c38'}
                      onMouseLeave={e => e.currentTarget.style.background = '#1a4a2e'}
                    >
                      <Send size={16} /> Get Custom Quote
                    </button>
                  </form>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <div style={{
                    width: 64, height: 64,
                    borderRadius: '50%',
                    background: 'rgba(22,163,74,0.12)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}>
                    <Leaf size={28} color="#16a34a" />
                  </div>
                  <h3 style={{ fontWeight: 700, fontSize: 20, color: '#1a1208', marginBottom: 8 }}>
                    Thank you, {popupName}! 🌿
                  </h3>
                  <p style={{ fontSize: 14, color: '#7a6a55' }}>
                    We'll be in touch at <strong>{popupEmail}</strong> very soon.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CATEGORIES ══════════════════ */}
      <section className="section-padding" style={{ background: 'var(--kraft-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Our Collections</div>
            <h2 className="section-title">Packaging That Speaks</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Discover our range of sustainable packaging solutions, meticulously crafted
              to elevate your brand while protecting the planet.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
            {categories.map(({ title, desc, icon: Icon, color, bg, to }) => (
              <Link
                key={title}
                to={to}
                style={{ textDecoration: 'none' }}
              >
                <div className="product-card" style={{ padding: 36, cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--kraft-100)'}
                >
                  <div style={{
                    width: 64, height: 64,
                    borderRadius: 16,
                    background: bg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24,
                  }}>
                    <Icon size={28} color={color} />
                  </div>
                  <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, color: 'var(--kraft-900)' }}>{title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--kraft-600)', lineHeight: 1.6, marginBottom: 20 }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontWeight: 600, fontSize: 14 }}>
                    Explore <ArrowRight size={14} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY NIRMALYAM ══════════════════ */}
      <section className="section-padding" style={{
        background: 'linear-gradient(135deg, var(--kraft-100) 0%, var(--kraft-50) 100%)',
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 72, alignItems: 'center' }}>
            {/* Left */}
            <div>
              <div className="section-label">Why Choose Us</div>
              <h2 className="section-title">Why Nirmalyam?</h2>
              <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.7, marginBottom: 36 }}>
                Commitment to quality, sustainability, and your brand's growth. We've spent years
                perfecting the balance between artisanal quality and industrial scalability.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {features.map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{
                    background: 'white',
                    borderRadius: 'var(--radius-md)',
                    padding: 20,
                    boxShadow: 'var(--shadow-sm)',
                    border: '1px solid var(--kraft-100)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'default',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  >
                    <div style={{
                      width: 40, height: 40,
                      borderRadius: 10,
                      background: 'rgba(22,163,74,0.1)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      marginBottom: 12,
                    }}>
                      <Icon size={18} color="var(--eco-600)" />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--kraft-900)', marginBottom: 6 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--kraft-500)', lineHeight: 1.5 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right – decorative visual */}
            <div style={{ position: 'relative' }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--kraft-800) 0%, var(--kraft-600) 100%)',
                borderRadius: 'var(--radius-xl)',
                padding: 48,
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute',
                  top: -20, right: -20,
                  width: 200, height: 200,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.05)',
                }} />
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <Leaf size={40} color="var(--eco-400)" style={{ marginBottom: 16 }} />
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, marginBottom: 12 }}>
                    Crafting a Plastic-Free Tomorrow
                  </h3>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)', marginBottom: 28 }}>
                    Nirmalyam Krafts began with a simple yet powerful mission: to prove that high-end commerce
                    doesn't need to cost the earth.
                  </p>
                  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    {[
                      { val: '2018', label: 'Founded' },
                      { val: '3+', label: 'States' },
                      { val: '50+', label: 'Product SKUs' },
                    ].map(s => (
                      <div key={s.label}>
                        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--kraft-300)' }}>{s.val}</div>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Eco tag floating */}
              <div className="anim-float" style={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                background: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '16px 20px',
                boxShadow: 'var(--shadow-lg)',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}>
                <div style={{
                  width: 40, height: 40,
                  borderRadius: 10,
                  background: 'rgba(74,222,128,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Recycle size={18} color="var(--eco-600)" />
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--kraft-900)' }}>Eco Impact</div>
                  <div style={{ fontSize: 12, color: 'var(--eco-600)' }}>100% Plastic Free ✓</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .why-grid { grid-template-columns: 1fr !important; }
          }
        `}</style>
      </section>

      {/* ══════════════════ STATS ══════════════════ */}
      <section style={{
        background: 'linear-gradient(160deg, var(--kraft-950) 0%, var(--kraft-900) 100%)',
        padding: '72px 24px',
      }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 40, textAlign: 'center' }}>
            {stats.map(({ value, suffix, prefix, label, icon: Icon }) => (
              <div key={label}>
                <Icon size={28} color="var(--eco-500)" style={{ marginBottom: 12 }} />
                <div style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 36,
                  fontWeight: 700,
                  color: 'var(--kraft-200)',
                  marginBottom: 6,
                }}>
                  <Counter to={value} suffix={suffix} prefix={prefix || ''} />
                </div>
                <div style={{ fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ PRODUCT PREVIEW GRID ══════════════════ */}
      <section className="section-padding" style={{ background: 'var(--kraft-50)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Our Products</div>
            <h2 className="section-title">Premium Paper Packaging</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              From everyday retail bags to luxury boutique packaging — crafted for brands that care.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {[
              { name: 'Luxury Retail Bags', cat: 'Luxury', desc: 'Premium finish for fashion boutiques and high-end gifting.', color: 'var(--gold-500)' },
              { name: 'Food & Bakery Bags', cat: 'F&B', desc: 'Oil-resistant kraft bags perfect for cloud kitchens and bakeries.', color: 'var(--eco-500)' },
              { name: 'Eco-Pouches', cat: 'Ecocraft', desc: 'Modern stand-up pouches for snacks, nuts, and organic dry goods.', color: 'var(--kraft-500)' },
              { name: 'Flat Handle Bags', cat: 'Ecocraft', desc: 'Sturdy, economical solutions for retail and supermarket needs.', color: 'var(--eco-600)' },
              { name: 'Industrial Kraft Rolls', cat: 'Industrial', desc: 'Bulk rolls designed for protection during shipping and industrial use.', color: 'var(--kraft-600)' },
              { name: 'Custom Brand Mailers', cat: 'Custom', desc: 'Secure, branded kraft mailers that elevate the unboxing experience.', color: 'var(--gold-400)' },
            ].map(({ name, cat, desc, color }) => (
              <div key={name} className="product-card" style={{ padding: 28 }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{
                  height: 140,
                  background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 20,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${color}22`,
                }}>
                  <Package size={48} color={color} strokeWidth={1.5} />
                </div>
                <span className="tag-chip" style={{ marginBottom: 8 }}>{cat}</span>
                <h3 style={{ fontSize: 17, fontWeight: 600, color: 'var(--kraft-900)', margin: '8px 0 8px' }}>{name}</h3>
                <p style={{ fontSize: 13, color: 'var(--kraft-500)', lineHeight: 1.55 }}>{desc}</p>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/products" className="btn-primary" style={{ padding: '16px 44px', fontSize: 15 }}>
              <span>View All Products</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section className="section-padding" style={{
        background: 'linear-gradient(135deg, var(--kraft-100) 0%, var(--kraft-50) 100%)',
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label">Testimonials</div>
            <h2 className="section-title">What Our Clients Say</h2>
          </div>

          <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative' }}>
            <div className="glass-card" style={{ padding: 48, textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
                {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                  <Star key={i} size={18} fill="var(--gold-500)" color="var(--gold-500)" />
                ))}
              </div>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 22,
                lineHeight: 1.65,
                color: 'var(--kraft-800)',
                marginBottom: 32,
                fontStyle: 'italic',
              }}>
                {testimonials[activeTestimonial].text}
              </p>
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--kraft-900)' }}>
                {testimonials[activeTestimonial].name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--kraft-500)', marginTop: 4 }}>
                {testimonials[activeTestimonial].role}
              </div>
            </div>

            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 32 }}>
              <button onClick={prev} style={{
                width: 44, height: 44,
                borderRadius: '50%',
                border: '1.5px solid var(--kraft-300)',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--kraft-600)'; e.currentTarget.style.background = 'var(--kraft-100)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--kraft-300)'; e.currentTarget.style.background = 'white'; }}
              >
                <ChevronLeft size={18} color="var(--kraft-700)" />
              </button>
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                  width: i === activeTestimonial ? 32 : 10,
                  height: 10,
                  borderRadius: 5,
                  background: i === activeTestimonial ? 'var(--kraft-700)' : 'var(--kraft-300)',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                }} />
              ))}
              <button onClick={next} style={{
                width: 44, height: 44,
                borderRadius: '50%',
                border: '1.5px solid var(--kraft-300)',
                background: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--kraft-600)'; e.currentTarget.style.background = 'var(--kraft-100)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--kraft-300)'; e.currentTarget.style.background = 'white'; }}
              >
                <ChevronRight size={18} color="var(--kraft-700)" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      <section style={{
        background: 'linear-gradient(135deg, var(--eco-800) 0%, var(--eco-700) 100%)',
        padding: '80px 24px',
        textAlign: 'center',
      }}>
        <div className="container">
          <div className="eco-badge" style={{ background: 'rgba(255,255,255,0.15)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', marginBottom: 20 }}>
            <Leaf size={12} /> Start Your Eco Journey
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: 600,
            color: 'white',
            marginBottom: 16,
          }}>
            Looking for custom packaging for your business?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 36, maxWidth: 520, margin: '0 auto 36px' }}>
            Get a free custom quote from our experts — usually within 2 business hours.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '16px 40px',
              background: 'white',
              color: 'var(--eco-700)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 700,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              Request a Free Quote <ArrowRight size={16} />
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '15px 32px',
              background: 'transparent',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.4)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
              fontSize: 15,
              textDecoration: 'none',
              transition: 'all 0.3s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.background = 'transparent'; }}
            >
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
