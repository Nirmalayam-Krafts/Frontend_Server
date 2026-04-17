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
    image: '/collection-ecocraft.png',
    color: '#4ade80',
    bg: '#f0fdf4',
    to: '/products#ecocraft',
  },
  {
    title: 'F&B Gourmet Bags',
    desc: 'Premium carry bags specifically designed for cafes, restaurants, and gourmet food brands.',
    icon: Zap,
    image: '/collection-fnb.png',
    color: '#f59e0b',
    bg: '#fffbeb',
    to: '/products#fnb',
  },
  {
    title: 'Luxury Bags',
    desc: 'High-finish, elegant packaging for premium retail, jewelry, and exclusive gifting.',
    icon: Award,
    image: '/collection-luxury.png',
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
    label: 'Brands Served',
    image: '/images/why_quality.png',
    icon: Users,
    accent: 'var(--kraft-500)'
  },
  {
    id: 2,
    title: '100%',
    label: 'Recyclable Process',
    image: '/images/why_recyclable.png',
    icon: Recycle,
    accent: 'var(--eco-500)'
  },
  {
    id: 3,
    title: '99%',
    label: 'On-Time Delivery',
    image: '/images/why_printing.png',
    icon: Shield,
    accent: 'var(--kraft-400)'
  },
  {
    id: 4,
    title: '500 Units',
    label: 'Small Batch MOQ',
    image: '/images/why_moq.png',
    icon: Package,
    accent: 'var(--eco-600)'
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
        minHeight: '80vh',
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
            linear-gradient(to bottom, rgba(58, 38, 14, 0.45) 0%, transparent 35%),
            linear-gradient(to right, rgba(255, 253, 245, 0.92) 0%, rgba(255, 253, 245, 0.75) 40%, rgba(88, 56, 25, 0.05) 75%, transparent 100%),
            linear-gradient(to top, rgba(253, 249, 243, 1) 0%, transparent 25%)
          `,
          zIndex: 1,
        }} />

        {/* Subtle tree background layer */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/tree-texture.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }} />

        {/* Content */}
        <div className="container" style={{
          position: 'relative',
          zIndex: 1,
          padding: isMobile ? '100px 0px 20px' : '80px 0px 30px',
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr',
          gap: isMobile ? 24 : 32,
          alignItems: 'center',
          textAlign: isMobile ? 'center' : 'left'
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
              fontSize: 'clamp(32px, 5.5vw, 72px)',
              fontWeight: 800,
              color: '#1a1208',
              lineHeight: 1.1,
              marginBottom: 18,
              textAlign: isMobile ? 'center' : 'left'
            }}>
              The Future of<br />
              <span style={{ color: '#7a4a1e' }}>Eco Packaging</span>
            </h1>

            <p style={{
              fontSize: isMobile ? 15 : 16,
              color: '#4a3c2a',
              lineHeight: 1.75,
              maxWidth: 440,
              marginBottom: 36,
              margin: isMobile ? '0 auto 36px' : '0 0 36px',
              textAlign: isMobile ? 'center' : 'left'
            }}>
              Transforming Indian retail with premium, custom-printed kraft paper solutions.
              Elevate your brand sustainably with Nirmalyam Krafts.
            </p>

            {/* CTA buttons */}
            <div style={{
              display: 'flex',
              gap: 14,
              flexWrap: 'wrap',
              justifyContent: isMobile ? 'center' : 'flex-start'
            }}>
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
                <span>Chat on WhatsApp</span>
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
                <span>Get a Quote</span>
              </Link>
            </div>
          </div>

          {/* Right — floating bag image */}
          <KraftBagSVG />
        </div>

        {/* Wave divider */}
        <div style={{ position: 'absolute', bottom: -1, left: 0, right: 0 }}>
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 30C1200 -10 960 70 720 30C480 -10 240 70 0 30L0 60Z" fill="var(--kraft-50)" />
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
                  staggerChildren: 0.12
                }
              }
            }}
            style={{
              display: isMobile ? 'grid' : 'flex',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'none',
              gridAutoRows: isMobile ? 'minmax(80px, 1fr)' : 'auto',
              justifyContent: 'center',
              alignItems: 'stretch',
              gap: isMobile ? '10px' : 'clamp(12px, 2vw, 24px)',
              flexWrap: isMobile ? 'nowrap' : 'wrap'
            }}
          >
            {/* Make in India */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? 4 : 16,
                padding: isMobile ? '10px' : '12px 28px',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(12px)',
                borderRadius: isMobile ? 12 : 24,
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'default',
                textAlign: 'center'
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 15px 35px rgba(122, 74, 30, 0.08)',
                borderColor: 'rgba(122, 74, 30, 0.2)'
              }}
            >
              <motion.img
                src="/images/make_in_india_lion.png"
                alt="Make in India"
                style={{ height: isMobile ? 24 : 48, width: 'auto', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                animate={{
                  filter: ['drop-shadow(0 2px 4px rgba(0,0,0,0.1))', 'drop-shadow(0 4px 8px rgba(122, 74, 30, 0.2))', 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))']
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{
                  fontSize: isMobile ? 8 : 10,
                  fontWeight: 800,
                  color: '#7a4a1e',
                  letterSpacing: '0.25em',
                  textTransform: 'uppercase',
                  marginBottom: 2
                }}>AUTHENTIC</span>
                <span style={{
                  fontSize: isMobile ? 13 : 18,
                  fontWeight: 900,
                  color: '#1a1208',
                  letterSpacing: '0.05em',
                  fontFamily: "'Playfair Display', serif"
                }}>MAKE IN INDIA</span>
              </div>
            </motion.div>

            {/* Recycle India */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isMobile ? 'center' : 'flex-start',
                gap: isMobile ? 8 : 12,
                padding: isMobile ? '10px 12px' : '12px 24px',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(12px)',
                borderRadius: isMobile ? 20 : 24,
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'default'
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 15px 35px rgba(22, 101, 52, 0.08)',
                borderColor: 'rgba(22, 101, 52, 0.2)'
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/4/44/Recycle001.svg"
                  alt="Recycle"
                  style={{ height: isMobile ? 18 : 28, width: 'auto', opacity: 0.9 }}
                />
              </motion.div>
              <span style={{ fontSize: isMobile ? 9 : 13, fontWeight: 700, color: '#2d1a06', letterSpacing: '0.12em' }}>RECYCLE INDIA</span>
            </motion.div>

            {/* Plastic Free */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? 4 : 12,
                padding: isMobile ? '10px' : '12px 24px',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(12px)',
                borderRadius: isMobile ? 12 : 24,
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'default',
                textAlign: 'center'
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 15px 35px rgba(22, 163, 74, 0.08)',
                borderColor: 'rgba(22, 163, 74, 0.2)'
              }}
            >
              <motion.div
                style={{
                  width: isMobile ? 28 : 36, height: isMobile ? 28 : 36,
                  borderRadius: 10,
                  background: 'rgba(22,163,74,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Leaf size={isMobile ? 14 : 20} color="#166534" />
              </motion.div>
              <span style={{ fontSize: isMobile ? 9 : 13, fontWeight: 700, color: '#166534', letterSpacing: '0.12em' }}>100% PLASTIC-FREE</span>
            </motion.div>

            {/* Pune Pride */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isMobile ? 4 : 12,
                padding: isMobile ? '10px' : '12px 24px',
                background: 'rgba(255, 255, 255, 0.45)',
                backdropFilter: 'blur(12px)',
                borderRadius: isMobile ? 12 : 24,
                border: '1px solid rgba(255, 255, 255, 0.7)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
                cursor: 'default',
                textAlign: 'center'
              }}
              whileHover={{
                scale: 1.05,
                y: -5,
                boxShadow: '0 15px 35px rgba(139, 94, 52, 0.08)',
                borderColor: 'rgba(139, 94, 52, 0.2)'
              }}
            >
              <motion.div
                style={{
                  width: isMobile ? 28 : 36, height: isMobile ? 28 : 36,
                  borderRadius: 10,
                  background: 'rgba(139,94,52,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <MapPin size={isMobile ? 18 : 20} color="#8b5e34" />
              </motion.div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: isMobile ? 7 : 9, fontWeight: 800, color: '#8b5e34', letterSpacing: '0.1em' }}>BEST ECO-FRIENDLY</span>
                <span style={{ fontSize: isMobile ? 11 : 13, fontWeight: 700, color: '#2d1a06', letterSpacing: '0.1em' }}>PRODUCTS IN PUNE</span>
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
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="section-label">Our Collections</div>
            <h2 className="section-title">Packaging That Speaks</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
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
                  <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                    <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{
                      position: 'absolute',
                      top: 16, left: 16,
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      backdropFilter: 'blur(4px)',
                    }}>
                      <Icon size={20} color={color} />
                    </div>
                  </div>
                  <div style={{ padding: '24px 32px 32px' }}>
                    <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 10, color: 'var(--kraft-900)' }}>{title}</h3>
                    <p style={{ fontSize: 15, color: 'var(--kraft-600)', lineHeight: 1.6, marginBottom: 20 }}>{desc}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color, fontWeight: 600, fontSize: 14 }}>
                      Explore <ArrowRight size={14} />
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
                {/* Background Image with Hover Scale */}
                <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
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
              { name: 'Luxury Retail Bags', cat: 'Luxury', desc: 'Premium finish for fashion boutiques and high-end gifting.', color: 'var(--gold-500)', image: '/product-luxury-retail.png' },
              { name: 'Food & Bakery Bags', cat: 'F&B', desc: 'Oil-resistant kraft bags perfect for cloud kitchens and bakeries.', color: 'var(--eco-500)', image: '/product-food-bakery.png' },
              { name: 'Eco-Pouches', cat: 'Ecocraft', desc: 'Modern stand-up pouches for snacks, nuts, and organic dry goods.', color: 'var(--kraft-500)', image: '/product-eco-pouches.png' },
              { name: 'Flat Handle Bags', cat: 'Ecocraft', desc: 'Sturdy, economical solutions for retail and supermarket needs.', color: 'var(--eco-600)', image: '/product-flat-handle.png' },
              { name: 'Industrial Kraft Rolls', cat: 'Industrial', desc: 'Bulk rolls designed for protection during shipping and industrial use.', color: 'var(--kraft-600)', image: '/product-industrial-rolls.png' },
              { name: 'Custom Brand Mailers', cat: 'Custom', desc: 'Secure, branded kraft mailers that elevate the unboxing experience.', color: 'var(--gold-400)', image: '/product-custom-mailers.png' },
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
                  height: isMobile ? 100 : 220,
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
                      right: 16,
                      bottom: 16,
                      width: 44,
                      height: 44,
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
                    <WhatsAppIcon size={22} />
                  </a>
                </div>
                <div style={{ padding: isMobile ? '12px 8px' : '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span className="tag-chip" style={{ background: `${color}12`, color: color, fontSize: isMobile ? 8 : 12, padding: isMobile ? '2px 6px' : '4px 10px' }}>{cat}</span>
                  </div>
                  <h3 style={{ fontSize: isMobile ? 10 : 19, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: isMobile ? 2 : 10 }}>{name}</h3>
                  <p style={{ fontSize: isMobile ? 8 : 14, color: 'var(--kraft-600)', lineHeight: 1.3, display: isMobile ? '-webkit-box' : 'block', WebkitLineClamp: isMobile ? 2 : 'none', WebkitBoxOrient: isMobile ? 'vertical' : 'none', overflow: isMobile ? 'hidden' : 'visible' }}>{desc}</p>
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
        padding: '80px 24px',
        overflow: 'hidden',
        background: '#3a2410',
      }}>
        {/* Wood Texture Background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url("/images/testimonials_bg_wood.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.9,
          zIndex: 0
        }} />

        {/* Overlay for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(58, 36, 16, 0.4), rgba(58, 36, 16, 0.7))',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="section-label" style={{
              color: 'white',
              letterSpacing: '2px',
              textTransform: 'uppercase',
              fontSize: '12px'
            }}>
              Testimonials
            </div>
            <h2 className="section-title" style={{
              color: 'white',
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              letterSpacing: '-0.5px',
              textShadow: '0 10px 30px rgba(0,0,0,0.3)',
              marginBottom: 12
            }}>
              The Nirmalyam <span style={{ color: 'var(--eco-400)' }}>Legacy</span>
            </h2>
            <div style={{
              width: 60,
              height: 4,
              background: 'var(--eco-500)',
              margin: '0 auto 24px',
              borderRadius: 2
            }} />
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: 'clamp(15px, 1.1vw, 18px)',
              maxWidth: 600,
              margin: '0 auto',
              lineHeight: 1.5,
              fontStyle: 'italic',
              fontWeight: 400
            }}>
              Rooted in Quality, Driven by Purpose — Sustainable kraft solutions trusted by leading brands across India.
            </p>
          </div>

          <div style={{
            maxWidth: 1200,
            margin: '0 auto',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? 380 : 420, // Reduced height
            paddingTop: isMobile ? 30 : 40  // Reduced room
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
                offset = '-105%';
                scale = 0.85;
                opacity = 0.4;
                zIndex = 1;
                blur = '2px';
              } else if (isNext) {
                offset = '105%';
                scale = 0.85;
                opacity = 0.4;
                zIndex = 1;
                blur = '2px';
              }

              return (
                <div key={idx} style={{
                  position: 'absolute',
                  width: '100%',
                  maxWidth: isMobile ? 'calc(100% - 32px)' : 580,
                  transform: `translateX(${offset}) scale(${scale})`,
                  opacity,
                  zIndex,
                  filter: `blur(${blur})`,
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  pointerEvents: isActive ? 'auto' : 'none',
                }}>
                  <div className="glass-card" style={{
                    padding: '48px 32px 32px', // Compact padding
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.08)',
                    backdropFilter: 'blur(30px)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                    borderRadius: 32,
                    color: 'white',
                    position: 'relative'
                  }}>
                    {/* Floating Profile Image */}
                    <div style={{
                      width: 70,
                      height: 70,
                      position: 'absolute',
                      top: 0,
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      borderRadius: '50%',
                      border: '3px solid rgba(255,255,255,0.2)',
                      overflow: 'hidden',
                      boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                      background: 'var(--kraft-100)',
                      zIndex: 10
                    }}>
                      <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 20, fontWeight: 700 }}>{t.name}</div>
                      <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>
                        {t.role} • {t.location}
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: 4, marginBottom: 24 }}>
                      {Array.from({ length: t.rating }).map((_, i) => (
                        <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                      ))}
                    </div>

                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 18,
                      lineHeight: 1.5,
                      color: 'rgba(255,255,255,0.95)',
                      fontStyle: 'italic',
                    }}>
                      {t.text}
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Navigation Buttons */}
            <button onClick={prev} style={{
              position: 'absolute',
              left: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56, height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.3s',
              zIndex: 10
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--eco-500)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            >
              <ChevronLeft size={24} />
            </button>

            <button onClick={next} style={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 56, height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'all 0.3s',
              zIndex: 10
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--eco-500)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-50%) scale(1)'; }}
            >
              <ChevronRight size={24} />
            </button>
          </div>

          {/* Dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 48 }}>
            {testimonials.map((_, i) => (
              <button key={i} onClick={() => setActiveTestimonial(i)} style={{
                width: i === activeTestimonial ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === activeTestimonial ? 'var(--eco-500)' : 'rgba(255,255,255,0.3)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s',
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