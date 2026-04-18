import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight, Leaf, Recycle, Package, Zap,
  Star, ChevronLeft, ChevronRight, Award, Shield,
  TrendingUp, Users, X, MessageCircle, Send, MapPin
} from 'lucide-react';
import { KraftBagSVG } from '../components/KraftsBags';

/* ── WhatsApp SVG icon ── */
function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
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

const testimonials = [
  {
    name: 'Sarah Merchant',
    location: 'Mumbai, MH',
    role: 'Boutique Owner',
    image: '/images/avatar_1.png',
    text: '"The print quality on our custom bags exceeded expectations. Our customers frequently compliment the premium feel, which perfectly aligns with our brand\'s eco-conscious values."',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    location: 'Pune, MH',
    role: 'Bakery Founder',
    image: '/images/avatar_2.png',
    text: '"Finally found a supplier that understands the needs of a small bakery. The low MOQ and fast turnaround helped us manage our inventory easily without large upfront costs."',
    rating: 5,
  },
  {
    name: 'Aditi Sharma',
    location: 'Bangalore, KA',
    role: 'Corporate Manager',
    image: '/images/avatar_3.png',
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
    image: '/images/collection_ecocraft_vibrant.png',
    color: '#4ade80',
    bg: '#f0fdf4',
    to: '/products#ecocraft',
  },
  {
    title: 'F&B Gourmet Bags',
    desc: 'Premium carry bags specifically designed for cafes, restaurants, and gourmet food brands.',
    icon: Zap,
    image: '/images/collection_fnb_vibrant.png',
    color: '#f59e0b',
    bg: '#fffbeb',
    to: '/products#fnb',
  },
  {
    title: 'Luxury Bags',
    desc: 'High-finish, elegant packaging for premium retail, jewelry, and exclusive gifting.',
    icon: Award,
    image: '/images/collection_luxury_vibrant.png',
    color: '#c09457',
    bg: '#fdf9f3',
    to: '/products#luxury',
  },
];

/* ── Why Nirmalyam Redesign Data ── */
const whyCards = [
  {
    id: 1,
    title: '12,000+',
    label: 'Indian Brands Joined',
    image: '/images/why_brands.png',
    video: 'https://player.vimeo.com/external/494252666.sd.mp4?s=40428d009265f242e82500c4c454e963&profile_id=165',
    icon: Users,
    accent: 'var(--eco-600)'
  },
  {
    id: 2,
    title: '100%',
    label: 'On-Time Delivery',
    image: '/images/why_delivery.png',
    video: 'https://player.vimeo.com/external/459389133.sd.mp4?s=183f3f3f6111a43a6d4e2d27f8d6f5c80&profile_id=165',
    icon: Shield,
    accent: 'var(--kraft-500)'
  },
  {
    id: 3,
    title: 'Artisanal',
    label: 'Craftsmanship Heritage',
    image: '/images/why_artisans.png',
    video: 'https://player.vimeo.com/external/517090025.sd.mp4?s=1a491f69201a4f028682e75e92701742&profile_id=165',
    icon: Star,
    accent: '#f59e0b'
  },
  {
    id: 4,
    title: 'Vibrant',
    label: 'Colorful Collections',
    image: '/images/why_vibrant.png',
    video: 'https://player.vimeo.com/external/371433846.sd.mp4?s=231da6469cf3680e92743846d03f0b24&profile_id=165',
    icon: TrendingUp,
    accent: '#ec4899'
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupName, setPopupName] = useState('');
  const [popupEmail, setPopupEmail] = useState('');
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── 6-second popup timer + Reveal Observer ── */
  useEffect(() => {
    const timer = setTimeout(() => setPopupOpen(true), 12000); // 12 seconds

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.15 });

    const revealed = document.querySelectorAll('.anim-reveal');
    revealed.forEach(el => observer.observe(el));

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, []);

  // Auto-slide testimonials
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial(prev => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const handlePopupSubmit = (e) => {
    e.preventDefault();
    if (!popupName || !popupEmail) return;

    // Redirect to contact page with data
    navigate('/contact', {
      state: {
        name: popupName,
        email: popupEmail
      }
    });

    setPopupOpen(false);
    setPopupName('');
    setPopupEmail('');
  };

  const prev = () => setActiveTestimonial(p => (p - 1 + testimonials.length) % testimonials.length);
  const next = () => setActiveTestimonial(p => (p + 1) % testimonials.length);

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ══════════════════ HERO ══════════════════ */}
      <section style={{
        minHeight: isMobile ? '700px' : '95vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        paddingTop: isMobile ? 80 : 0
      }}>
        {/* Main Background Image - Colorful bags hanging from tree */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/luxury_hero.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }} />

        {/* Sophisticated Overlays */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile 
            ? 'linear-gradient(to bottom, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, transparent 60%, rgba(255,255,255,1) 100%)'
            : 'linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 30%, rgba(255,255,255,0.4) 50%, transparent 100%)',
          zIndex: 1,
        }} />

        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          alignItems: 'center',
          gap: 48
        }}>
          {/* Left Side: Content Box */}
          <div className="anim-fade-up">
            <div style={{
               display: 'inline-flex',
               alignItems: 'center',
               gap: 8,
               padding: '8px 20px',
               borderRadius: '100px',
               border: '1px solid var(--eco-600)',
               color: 'var(--eco-700)',
               fontSize: 12,
               fontWeight: 700,
               letterSpacing: '0.15em',
               textTransform: 'uppercase',
               background: 'rgba(34, 197, 94, 0.05)',
               marginBottom: 24,
            }}>
              <Leaf size={14} /> Sustainable Solutions
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '24px' : '36px',
              fontWeight: 600,
              color: 'var(--kraft-900)',
              marginBottom: 8,
              lineHeight: 1.2
            }}>
              The Future of Eco Packaging
            </h2>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 6vw, 84px)',
              fontWeight: 900,
              color: 'var(--kraft-950)',
              marginBottom: 20,
              lineHeight: 0.95,
              letterSpacing: '-1px'
            }}>
              Nirmalyam Kraft
            </h1>

            <p style={{
              fontSize: isMobile ? 17 : 20,
              fontWeight: 600,
              color: 'var(--kraft-800)',
              marginBottom: 16,
              lineHeight: 1.4,
              maxWidth: 580
            }}>
              Elevating brands through sustainable craftsmanship. <br />
              <span style={{ color: 'var(--eco-600)' }}>Pure. Bold. Zero-waste.</span>
            </p>

            <p style={{
              fontSize: isMobile ? 14 : 16,
              color: 'var(--kraft-600)',
              marginBottom: 40,
              lineHeight: 1.6,
              maxWidth: 500,
              fontWeight: 500
            }}>
              Specializing in ITC ECF paperboards and eco-friendly specialty papers. 
              We deliver high-performance packaging that ensures your products stay fresh and sustainably stunning.
            </p>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
              <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '18px 36px',
                background: '#25D366',
                color: 'white',
                borderRadius: '100px',
                fontSize: 17,
                fontWeight: 700,
                textDecoration: 'none',
                boxShadow: '0 10px 30px rgba(37,211,102,0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px) scale(1.02)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
              >
                <WhatsAppIcon size={22} />
                Chat on WhatsApp
              </a>

              <Link to="/contact" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '17px 36px',
                background: 'white',
                border: '2px solid var(--kraft-200)',
                color: 'var(--kraft-900)',
                borderRadius: '100px',
                fontSize: 17,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--kraft-400)'; e.currentTarget.style.background = 'var(--kraft-50)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--kraft-200)'; e.currentTarget.style.background = 'white'; }}
              >
                Get a Quote
              </Link>
            </div>
          </div>

          {/* Right Side: 3D Bag Animation */}
          <div style={{ 
            display: 'flex', 
            justifyContent: isMobile ? 'center' : 'flex-end', 
            alignItems: 'center',
            width: '100%',
            marginTop: isMobile ? 32 : 0
          }}>
            <KraftBagSVG />
          </div>
        </div>

        {/* Wave bottom transition */}
        <div style={{ position: 'absolute', bottom: -2, left: 0, width: '100%', zIndex: 3, pointerEvents: 'none' }}>
           <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
             <path d="M0 120H1440V50C1320 100 1080 100 840 50C600 0 360 0 120 50C80 66 40 83 0 100V120Z" fill="white" />
           </svg>
        </div>
      </section>

      {/* ══════════════════ TAGLINE & LOGOS SECTION ══════════════════ */}
      <section style={{
        background: 'linear-gradient(to bottom, var(--kraft-50) 0%, #fff 100%)',
        padding: isMobile ? '20px 0 40px' : '24px 0 40px',
        borderBottom: '1px solid var(--kraft-100)',
        position: 'relative',
        zIndex: 10,
        overflow: 'hidden'
      }}>
        {/* Subtle background glow */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '60%',
          height: '80%',
          background: 'radial-gradient(circle, rgba(122, 74, 30, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 10 }}>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              justifyContent: 'center',
              alignItems: 'start',
              gap: isMobile ? '32px 16px' : '48px',
            }}
          >
            {/* Make in India */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'default',
              }}
            >
              <div style={{ marginBottom: 20 }}>
                <motion.img
                  src="/images/make_in_india_lion.png"
                  alt="Make in India"
                  style={{ height: isMobile ? 48 : 80, width: 'auto' }}
                  whileHover={{ scale: 1.1 }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 800,
                  color: '#7a4a1e',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>AUTHENTIC</span>
                <span style={{
                  fontSize: isMobile ? '16px' : '22px',
                  fontWeight: 900,
                  color: '#1a1208',
                  fontFamily: "'Playfair Display', serif"
                }}>MAKE IN INDIA</span>
              </div>
            </motion.div>

            {/* Recycle Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'default'
              }}
            >
              <motion.div
                style={{ marginBottom: 20 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                whileHover={{ scale: 1.15 }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Recycle001.svg"
                  alt="Recycle"
                  style={{ height: isMobile ? 40 : 64, width: 'auto' }}
                />
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 800,
                  color: '#166534',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>CIRCULAR</span>
                <span style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: 900,
                  color: '#1a1208',
                  fontFamily: "'Playfair Display', serif"
                }}>RECYCLE INDIA</span>
              </div>
            </motion.div>

            {/* Plastic Free Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'default'
              }}
            >
              <motion.div
                style={{
                  width: isMobile ? 56 : 90, 
                  height: isMobile ? 56 : 90,
                  borderRadius: '24px',
                  background: 'rgba(34, 197, 94, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20
                }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ backgroundColor: 'rgba(34, 197, 94, 0.15)', scale: 1.1 }}
              >
                <Leaf size={isMobile ? 28 : 44} color="#166534" />
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 800,
                  color: '#166534',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>ECO-FRIENDLY</span>
                <span style={{
                  fontSize: isMobile ? '16px' : '20px',
                  fontWeight: 900,
                  color: '#1a1208',
                  fontFamily: "'Playfair Display', serif"
                }}>100% PLASTIC-FREE</span>
              </div>
            </motion.div>

            {/* Location Card */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                cursor: 'default'
              }}
            >
              <motion.div
                style={{
                  width: isMobile ? 56 : 90, 
                  height: isMobile ? 56 : 90,
                  borderRadius: '24px',
                  background: 'rgba(139, 94, 52, 0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20
                }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ backgroundColor: 'rgba(139, 94, 52, 0.15)', scale: 1.1 }}
              >
                <MapPin size={isMobile ? 28 : 44} color="#8b5e34" />
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span style={{
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 800,
                  color: '#8b5e34',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  opacity: 0.8
                }}>REGION PRIDE</span>
                <span style={{
                  fontSize: isMobile ? '16px' : '18px',
                  fontWeight: 900,
                  color: '#1a1208',
                  fontFamily: "'Playfair Display', serif"
                }}>BEST IN PUNE</span>
              </div>
            </motion.div>
          </motion.div>
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
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ CATEGORIES ══════════════════ */}
      <section
        className="section-padding nature-section"
        style={{
          backgroundImage: 'url(/images/collections-bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Readability Overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(252, 250, 247, 0.88)',
          zIndex: 0
        }} />

        <div className="nature-layer-wood" style={{ zIndex: 1 }} />
        <div className="nature-layer-leaf" style={{ zIndex: 1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div className="section-label" style={{ fontSize: 13, letterSpacing: '0.2em' }}>Our Collections</div>
            <h2 className="section-title" style={{ fontSize: 'clamp(40px, 7vw, 72px)', marginBottom: 24 }}>Packaging That Speaks</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: 22, maxWidth: 750 }}>
              Discover our range of sustainable packaging solutions, meticulously crafted
              to elevate your brand while protecting the planet.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 28 }}>
            {categories.map(({ title, desc, icon: Icon, image, color, bg, to }) => (
              <Link
                key={title}
                to={to}
                style={{ textDecoration: 'none' }}
              >
                <div className="product-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = color}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--kraft-100)'}
                >
                  <div style={{ height: 280, overflow: 'hidden', position: 'relative' }}>
                    <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: 20, left: 20,
                      width: 52, height: 52,
                      borderRadius: 14,
                      background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <Icon size={24} color={color} />
                    </div>
                  </div>
                  <div style={{ padding: '32px 32px 40px' }}>
                    <h3 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, color: 'var(--kraft-900)', fontFamily: "'Playfair Display', serif" }}>{title}</h3>
                    <p style={{ fontSize: 18, color: 'var(--kraft-600)', lineHeight: 1.7, marginBottom: 24 }}>{desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color, fontWeight: 700, fontSize: 17 }}>
                      Explore <ArrowRight size={18} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ WHY NIRMALYAM (REDESIGNED) ══════════════════ */}
      <section
        className="why-nirmalyam-section anim-reveal"
        style={{
          background: 'linear-gradient(rgba(58, 36, 16, 0.88), rgba(58, 36, 16, 0.92)), url("/images/why_factory_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden',
          padding: isMobile ? '80px 16px' : '140px 24px',
          marginTop: -1
        }}
      >
        {/* Decorative backdrop glow */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '60%',
          background: 'radial-gradient(circle at center, rgba(34,197,94,0.12) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Centered Header */}
          <div style={{ textAlign: 'center', marginBottom: 64 }} className="anim-fade-up">
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(34,197,94,0.15)',
              padding: '10px 24px',
              borderRadius: 100,
              marginBottom: 24,
              border: '1px solid rgba(34,197,94,0.3)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--eco-500)' }} />
              <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--eco-400)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Why Choose Nirmalyam
              </span>
            </div>

            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 6vw, 56px)',
              color: 'white',
              marginBottom: 24,
              fontWeight: 700,
              lineHeight: 1.1
            }}>
              Why Nirmalyam?
            </h2>

            <p style={{
              fontSize: 18,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 750,
              margin: '0 auto',
              lineHeight: 1.8
            }}>
              Commitment to quality, sustainability, and your brand's growth. We've spent years
              perfecting the balance between artisanal quality and industrial scalability.
            </p>
          </div>

          {/* 4-Card Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fit, minmax(clamp(260px, 45%, 320px), 1fr))',
            gap: isMobile ? 12 : 28
          }}>
            {whyCards.map((card, idx) => (
              <div
                key={card.id}
                className="why-card"
                style={{
                  height: isMobile ? 240 : 460,
                  borderRadius: isMobile ? 16 : 28,
                  overflow: 'hidden',
                  position: 'relative',
                  cursor: 'default',
                  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  animation: `fadeInUp 0.8s ease forwards ${idx * 0.15}s`,
                  opacity: 0,
                  transform: 'translateY(40px)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}
              >
                  {/* Video/Image Background */}
                  <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
                    {card.video ? (
                      <video
                        src={card.video}
                        autoPlay
                        muted
                        loop
                        playsInline
                        poster={card.image}
                        className="why-card-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    ) : (
                      <img
                        src={card.image}
                        alt={card.label}
                        className="why-card-img"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      />
                    )}
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)',
                    zIndex: 1
                  }} />
                </div>

                {/* Glass Plate */}
                <div style={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  right: 20,
                  padding: isMobile ? '16px' : '24px',
                  background: 'rgba(255,255,255,0.08)',
                  backdropFilter: 'blur(25px) saturate(160%)',
                  WebkitBackdropFilter: 'blur(25px) saturate(160%)',
                  borderRadius: isMobile ? 12 : 20,
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  zIndex: 2,
                  transition: 'background 0.3s, transform 0.3s'
                }} className="glass-plate">
                  <div>
                    <div style={{
                      fontSize: isMobile ? 20 : 34,
                      fontWeight: 700,
                      color: 'white',
                      marginBottom: 4,
                      fontFamily: "'Playfair Display', serif",
                      letterSpacing: '-0.02em'
                    }}>
                      {card.title}
                    </div>
                    <div style={{
                      fontSize: isMobile ? 10 : 14,
                      color: 'rgba(255,255,255,0.7)',
                      fontWeight: 600,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase'
                    }}>
                      {card.label}
                    </div>
                  </div>

                  {/* Circular Icon Badge */}
                  <div style={{
                    width: isMobile ? 32 : 48,
                    height: isMobile ? 32 : 48,
                    borderRadius: '50%',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    transition: 'transform 0.3s'
                  }} className="icon-badge">
                    <card.icon size={isMobile ? 16 : 22} color={card.accent || "#0a0f0c"} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          .why-card:hover {
            transform: translateY(-12px);
            box-shadow: 0 30px 60px rgba(0,0,0,0.6), 0 0 30px rgba(34,197,94,0.08);
            border-color: rgba(255,255,255,0.2);
          }
          .why-card:hover .why-card-img {
            transform: scale(1.1);
          }
          .why-card:hover .glass-plate {
            background: rgba(255,255,255,0.18);
            transform: translateY(-2px);
          }
          .why-card:hover .icon-badge {
            transform: rotate(-10deg) scale(1.15);
          }
          
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(40px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .anim-reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.8s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .anim-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
          }

          @media (min-width: 1024px) {
            .product-grid-3x3 {
              grid-template-columns: repeat(3, 1fr) !important;
            }
          }

          .wa-product-btn:hover {
            transform: scale(1.1);
            background: #128C7E !important;
            box-shadow: 0 6px 20px rgba(37, 211, 102, 0.4) !important;
          }

          .product-card:hover .prod-img {
            transform: scale(1.08);
          }
        `}</style>
      </section>

      {/* ── CTA: About Factory ── */}
      <section style={{
        background: '#fff9f2',
        padding: isMobile ? '60px 24px' : '80px 0',
        borderBottom: '1px solid var(--kraft-100)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle noise texture or pattern could go here */}
        <div className="container" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 32 : 80, textAlign: isMobile ? 'center' : 'left' }}>
          <div style={{ maxWidth: 640 }}>
            <div className="section-label" style={{ marginBottom: 12, fontSize: 12 }}>Behind the Scenes</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, color: 'var(--kraft-950)', marginBottom: 16, lineHeight: 1.2 }}>Craftsmanship at Scale</h3>
            <p style={{ fontSize: isMobile ? 15 : 18, color: 'var(--kraft-600)', lineHeight: 1.7 }}>
              Discover the precision and passion that goes into every Nirmalyam product at our state-of-the-art facility. From raw fiber to finished luxury.
            </p>
          </div>
          <Link to="/about" className="btn-secondary" style={{ padding: '16px 40px', minWidth: 220, justifyContent: 'center', fontSize: 15, background: 'white', border: '1px solid var(--kraft-200)', boxShadow: 'var(--shadow-sm)' }}>
            Know about us <ArrowRight size={18} />
          </Link>
        </div>
      </section>


      {/* ══════════════════ PRODUCT PREVIEW GRID ══════════════════ */}
      <section className="section-padding nature-section" style={{ background: 'var(--kraft-50)' }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }} className="anim-fade-up">
            <div className="section-label" style={{ letterSpacing: '0.2em' }}>Our Products</div>
            <h2 className="section-title">Premium Paper Packaging</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', opacity: 0.85 }}>
              Precision-crafted sustainable solutions designed to elevate your brand's unboxing experience.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: isMobile ? 8 : 32
          }} className="product-grid-3x3">
            {[
              { name: 'Luxury Retail Bags', cat: 'Luxury', desc: 'Premium finish for fashion boutiques and high-end gifting.', color: '#c09457', image: '/images/prod_luxury.png' },
              { name: 'Food & Bakery Bags', cat: 'F&B', desc: 'Oil-resistant kraft bags perfect for cloud kitchens and bakeries.', color: '#f59e0b', image: '/images/prod_fnb.png' },
              { name: 'Eco-Pouches', cat: 'Ecocraft', desc: 'Modern stand-up pouches for snacks, nuts, and organic dry goods.', color: '#1a4a2e', image: '/images/prod_pouches.png' },
              { name: 'Flat Handle Bags', cat: 'Ecocraft', desc: 'Sturdy, economical solutions for retail and supermarket needs.', color: '#145c38', image: '/images/prod_flat.png' },
              { name: 'Industrial Kraft Rolls', cat: 'Industrial', desc: 'Bulk rolls designed for protection during shipping and industrial use.', color: '#4a3728', image: '/images/prod_rolls.png' },
              { name: 'Custom Brand Mailers', cat: 'Custom', desc: 'Secure, branded kraft mailers that elevate the unboxing experience.', color: '#ec4899', image: '/images/prod_mailers.png' },
            ].map(({ name, cat, desc, color, image }, idx) => (
              <div key={name} className="product-card anim-reveal"
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  animationDelay: `${idx * 0.1}s`,
                  position: 'relative'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-10px)'; e.currentTarget.style.boxShadow = 'var(--shadow-xl)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
              >
                <div style={{
                  height: isMobile ? 180 : 280,
                  background: `linear-gradient(135deg, ${color}12 0%, ${color}05 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderBottom: `1px solid ${color}15`,
                  position: 'relative'
                }}>
                  <img src={image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }} className="prod-img" />

                  {/* WhatsApp Floating Button */}
                  <a
                    href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hi Nirmalyam Krafts! I'm interested in ${name}. Could you provide more details?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      position: 'absolute',
                      right: 20,
                      bottom: 20,
                      width: 52,
                      height: 52,
                      background: '#25D366',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.3)',
                      transition: 'all 0.3s ease',
                      zIndex: 2
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="wa-product-btn"
                  >
                    <WhatsAppIcon size={26} />
                  </a>
                </div>
                <div style={{ padding: isMobile ? '20px 16px' : '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <span className="tag-chip" style={{ background: `${color}12`, color: color, fontSize: 13, padding: '6px 14px', fontWeight: 600, letterSpacing: '0.05em' }}>{cat}</span>
                  </div>
                  <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>{name}</h3>
                  <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.6 }}>{desc}</p>
                </div>
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

      {/* ── CTA: Sustainability ── */}
      <section style={{
        background: 'var(--eco-50)',
        padding: isMobile ? '60px 24px' : '80px 0',
        borderBottom: '1px solid var(--eco-100)',
        position: 'relative'
      }}>
        <div className="nature-layer-leaf" style={{ opacity: 0.03 }} />
        <div className="container" style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'center', gap: isMobile ? 32 : 80, textAlign: isMobile ? 'center' : 'left', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 640 }}>
            <div className="section-label" style={{ marginBottom: 12, fontSize: 12, color: 'var(--eco-600)' }}>Environmental Impact</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 28 : 36, color: 'var(--eco-950)', marginBottom: 16, lineHeight: 1.2 }}>Pioneering a Circular Economy</h3>
            <p style={{ fontSize: isMobile ? 15 : 18, color: 'var(--eco-700)', lineHeight: 1.7 }}>
              Our commitment to the planet goes beyond products. Explore how we're leading the waste-free transformation across India.
            </p>
          </div>
          <Link to="/sustainability" className="btn-secondary" style={{ padding: '16px 40px', minWidth: 220, justifyContent: 'center', fontSize: 15, borderColor: 'var(--eco-200)', color: 'var(--eco-800)', background: 'white', boxShadow: 'var(--shadow-sm)' }}>
            Our Sustainability <Leaf size={18} />
          </Link>
        </div>
      </section>

      {/* ══════════════════ TESTIMONIALS ══════════════════ */}
      <section id="testimonials" style={{
        position: 'relative',
        padding: '120px 24px',
        overflow: 'hidden',
        background: '#fafaf8',
      }}>
        {/* Wood Texture Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(var(--kraft-200) 0.5px, transparent 0.5px)',
          backgroundSize: '32px 32px',
          opacity: 0.5,
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label" style={{
              color: 'var(--kraft-600)',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              fontSize: '14px',
              fontWeight: 800
            }}>
              Testimonials
            </div>
            <h2 className="section-title" style={{
              color: 'var(--kraft-950)',
              fontSize: 'clamp(36px, 5vw, 64px)',
              fontWeight: 800,
              letterSpacing: '-1px',
              marginBottom: 16
            }}>
              The Nirmalyam <span style={{ color: 'var(--eco-600)' }}>Legacy</span>
            </h2>
            <div style={{
              width: 80,
              height: 4,
              background: 'var(--eco-600)',
              margin: '0 auto',
              borderRadius: 2
            }} />
          </div>

          <div style={{
            maxWidth: 1400,
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? 500 : 700,
            paddingTop: 80
          }}>
            {/* Main Slider Area */}
            {testimonials.map((t, idx) => {
              const isActive = idx === activeTestimonial;
              const isPrev = idx === (activeTestimonial - 1 + testimonials.length) % testimonials.length;
              const isNext = idx === (activeTestimonial + 1) % testimonials.length;

              if (!isActive && !isPrev && !isNext) return null;

              let offset = '0';
              let scale = 1;
              let opacity = 1;
              let zIndex = 2;
              let blur = '0px';

              if (isPrev) {
                offset = '-110%';
                scale = 0.8;
                opacity = 0.3;
                zIndex = 1;
                blur = '4px';
              } else if (isNext) {
                offset = '110%';
                scale = 0.8;
                opacity = 0.3;
                zIndex = 1;
                blur = '4px';
              }

              return (
                <div key={idx} style={{
                  position: 'absolute',
                  width: '100%',
                  maxWidth: isMobile ? 'calc(100% - 32px)' : 850,
                  transform: `translateX(${offset}) scale(${scale})`,
                  opacity,
                  zIndex,
                  filter: `blur(${blur})`,
                  transition: 'all 0.8s cubic-bezier(0.23, 1, 0.32, 1)',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}>
                  <div className="glass-card" style={{
                    padding: isMobile ? '60px 24px 40px' : '100px 80px 80px',
                    textAlign: 'center',
                    background: 'white',
                    border: '1px solid var(--kraft-200)',
                    boxShadow: '0 40px 100px -20px rgba(58, 36, 16, 0.15)',
                    borderRadius: 64,
                    color: 'var(--kraft-950)',
                    position: 'relative'
                  }}>
                    {/* Floating Profile Image */}
                    <div style={{
                      width: isMobile ? 100 : 160,
                      height: isMobile ? 100 : 160,
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: '8px solid white',
                      overflow: 'hidden',
                      boxShadow: '0 25px 50px rgba(0,0,0,0.1)',
                      background: 'var(--kraft-100)',
                      zIndex: 10
                    }}>
                      <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ marginBottom: 32 }}>
                      <div style={{ fontSize: isMobile ? 26 : 40, fontWeight: 800, color: 'var(--kraft-950)' }}>{t.name}</div>
                      <div style={{ fontSize: isMobile ? 16 : 20, color: 'var(--kraft-500)', fontWeight: 600, marginTop: 12 }}>
                        {t.role} • {t.location}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 40 }}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={isMobile ? 24 : 32} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>

                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: isMobile ? 24 : 38,
                      lineHeight: 1.4,
                      color: 'var(--kraft-900)',
                      fontStyle: 'italic',
                      fontWeight: 500
                    }}>
                      {t.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Navigation Buttons */}
            {!isMobile && (
              <>
                <button onClick={prev} style={{
                  position: 'absolute',
                  left: -120,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 84, height: 84,
                  borderRadius: '50%',
                  background: 'white',
                  border: '1px solid var(--kraft-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--kraft-900)',
                  transition: 'all 0.3s',
                  zIndex: 10,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--eco-600)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--kraft-900)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                  <ChevronLeft size={40} />
                </button>

                <button onClick={next} style={{
                  position: 'absolute',
                  right: -120,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 84, height: 84,
                  borderRadius: '50%',
                  background: 'white',
                  border: '1px solid var(--kraft-200)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--kraft-900)',
                  transition: 'all 0.3s',
                  zIndex: 10,
                  boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--eco-600)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = 'var(--kraft-900)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
                >
                  <ChevronRight size={40} />
                </button>
              </>
            )}
          </div>


          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 64 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 40 : 12,
                height: 12,
                borderRadius: 6,
                background: i === activeTestimonial ? 'var(--eco-600)' : 'var(--kraft-200)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              }} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ CTA ══════════════════ */}
      {/* ══════════════════ CTA ══════════════════ */}
      <section style={{
        position: 'relative',
        padding: '100px 24px',
        textAlign: 'center',
        overflow: 'hidden',
        background: '#153a15', // Fallback
      }}>
        {/* Tree Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/images/eco_cta_bg.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.65,
          zIndex: 0
        }} />

        {/* Dark Overlay for contrast */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4), rgba(0,0,0,0.6))',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="eco-badge" style={{
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            borderColor: 'rgba(255,255,255,0.4)',
            color: 'white',
            marginBottom: 24,
            padding: '8px 20px',
            fontSize: 14
          }}>
            <Leaf size={14} /> Start Your Eco Journey
          </div>
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(32px, 5vw, 64px)',
            fontWeight: 700,
            color: 'white',
            marginBottom: 24,
            lineHeight: 1.1
          }}>
            Looking for custom packaging <br /> for your business?
          </h2>
          <p style={{
            fontSize: 18,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 32,
            maxWidth: 600,
            margin: '0 auto 32px',
            lineHeight: 1.5
          }}>
            Get a free custom quote from our experts — usually within 2 business hours.
            Sustainable choices made simple.
          </p>
          <div style={{
            display: 'flex',
            gap: 20,
            justifyContent: 'center',
            flexWrap: 'wrap',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center'
          }}>
            <Link to="/contact" className="btn-primary" style={{
              minWidth: isMobile ? '100%' : 260,
              padding: '18px 32px',
              fontSize: 16,
              background: 'var(--kraft-600)',
              justifyContent: 'center'
            }}>
              Request a Free Quote <ArrowRight size={18} />
            </Link>
            <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer" className="btn-secondary" style={{
              minWidth: isMobile ? '100%' : 260,
              padding: '17px 32px',
              fontSize: 16,
              color: 'white',
              borderColor: 'rgba(255,255,255,0.4)',
              justifyContent: 'center'
            }}>
              Chat on WhatsApp <WhatsAppIcon size={18} />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}