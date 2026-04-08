import { useState, useEffect } from 'react';
import { MessageCircle, MapPin, X, ChevronRight, ChevronLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const carouselImages = [
  {
    src: '/images/products/ecocraft.png',
    title: 'Ecocraft Collection',
    desc: 'Sustainable Everyday Packaging'
  },
  {
    src: '/images/products/luxury.png',
    title: 'Luxury Kraft',
    desc: 'Premium Unboxing Experience'
  },
  {
    src: '/images/products/fnb.png',
    title: 'F&B Gourmet',
    desc: 'Safe for Food, Kind to Earth'
  }
];

export default function FloatingWidgets() {
  const [showWelcome, setShowWelcome] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Show on every refresh
    const timer = setTimeout(() => {
      setShowWelcome(true);
    }, 2000); // Show after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll logic for carousel
  useEffect(() => {
    if (showWelcome) {
      const interval = setInterval(() => {
        nextSlide();
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showWelcome, currentIndex]);

  const closeWelcome = () => {
    setShowWelcome(false);
    localStorage.setItem('nirmalyam_welcome_seen', 'true');
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % carouselImages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + carouselImages.length) % carouselImages.length);
  };

  return (
    <>
      {/* ── Directions FAB (Bottom Left) ── */}
      <a
        href="https://maps.google.com/?q=Nirmalyam+Krafts+Bengaluru"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          left: isMobile ? '16px' : '24px',
          zIndex: 99,
          width: isMobile ? '48px' : '56px',
          height: isMobile ? '48px' : '56px',
          background: 'white',
          borderRadius: isMobile ? '12px' : '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          padding: isMobile ? '8px' : '10px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
        }}
      >
        <img 
          src="https://upload.wikimedia.org/wikipedia/commons/a/aa/Google_Maps_icon_%282020%29.svg" 
          alt="Google Maps" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </a>

      {/* ── WhatsApp FAB (Bottom Right) ── */}
      <a
        href="https://wa.me/919876543210"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          right: isMobile ? '16px' : '24px',
          zIndex: 99,
          height: isMobile ? '48px' : '56px',
          width: isMobile ? '48px' : 'auto',
          padding: isMobile ? '0' : '0 24px',
          background: '#25D366',
          borderRadius: isMobile ? '50%' : '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          color: 'white',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.05) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4)';
        }}
      >
        <MessageCircle size={isMobile ? 24 : 24} fill="white" />
        {!isMobile && <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: '0.02em' }}>WhatsApp</span>}
      </a>

      {/* ── Welcome Promo Modal (Bottom Right) ── */}
      {showWelcome && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '80px' : '100px',
          left: isMobile ? '50%' : 'auto',
          right: isMobile ? 'auto' : '24px',
          transform: isMobile ? 'translateX(-50%)' : 'none',
          zIndex: 100,
          width: isMobile ? 'calc(100vw - 32px)' : '420px',
          background: 'white',
          borderRadius: isMobile ? '20px' : '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          animation: isMobile ? 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)' : 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        }}>
          <style>
            {`
              @keyframes slideInRight {
                from { transform: translateX(120%) scale(0.9); opacity: 0; }
                to { transform: translateX(0) scale(1); opacity: 1; }
              }
              @keyframes fadeUp {
                from { transform: translate(-50%, 40px); opacity: 0; }
                to { transform: translate(-50%, 0); opacity: 1; }
              }
            `}
          </style>

          <button
            onClick={closeWelcome}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              zIndex: 10,
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              border: 'none',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)'
            }}
          >
            <X size={18} />
          </button>

          <div style={{ position: 'relative', height: isMobile ? '160px' : '220px', overflow: 'hidden' }}>
            {carouselImages.map((img, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: currentIndex === i ? 1 : 0,
                  transition: 'opacity 0.6s ease-in-out',
                }}
              >
                <img src={img.src} alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)'
                }} />
                <div style={{
                  position: 'absolute',
                  bottom: '16px',
                  left: '16px',
                  color: 'white'
                }}>
                  <div style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{img.title}</div>
                  <div style={{ fontSize: 11, opacity: 0.8 }}>{img.desc}</div>
                </div>
              </div>
            ))}

            <button onClick={prevSlide} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={nextSlide} style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer' }}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div style={{ padding: isMobile ? '20px' : '24px' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, color: '#1a1208', marginBottom: isMobile ? 8 : 12 }}>
              Eco-Luxury Packaging
            </h3>
            <p style={{ fontSize: isMobile ? 13 : 14, color: '#6f5b46', lineHeight: 1.6, marginBottom: isMobile ? 16 : 20 }}>
              Specializing in <strong>Ecocraft</strong>, <strong>Luxury Kraft</strong>, and <strong>F&B Gourmet</strong> collections. 
              {isMobile ? '' : ' Custom branding available for all sizes.'}
            </p>

            <div style={{
              background: '#fffaf4',
              border: '1px solid #efe3d5',
              borderRadius: '12px',
              padding: isMobile ? '10px 14px' : '12px 16px',
              marginBottom: isMobile ? 16 : 20,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <ShoppingBag size={isMobile ? 18 : 20} color="#8b5e34" />
              <div>
                <div style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: '#8b5e34', textTransform: 'uppercase' }}>Minimum Order</div>
                <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: '#1a1208' }}>Starting from just 100 Units</div>
              </div>
            </div>

            <Link
              to="/products"
              onClick={closeWelcome}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '14px',
                background: 'linear-gradient(180deg, #16a34a 0%, #15803d 100%)',
                color: 'white',
                borderRadius: '12px',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 15,
                boxShadow: '0 8px 20px rgba(22, 163, 74, 0.2)'
              }}
            >
              Explore Collections <ChevronRight size={18} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
