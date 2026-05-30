import { useState, useEffect } from 'react';
import { MapPin, X, ChevronRight, ChevronLeft, ChevronUp, ShoppingBag } from 'lucide-react';

/* ── WhatsApp SVG icon ── */
function WhatsAppIcon({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
import { Link } from 'react-router-dom';

const carouselImages = [
  {
    src: '/images/generated/ecocraft_vibrant_branded.png',
    title: 'Ecocraft Collection',
    desc: 'Sustainable Everyday Packaging'
  },
  {
    src: '/images/generated/luxury_vibrant_branded.png',
    title: 'Luxury Kraft',
    desc: 'Premium Unboxing Experience'
  },
  {
    src: '/images/generated/popup_bags_branded_new.png',
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

  // Show "Go to Top" only after scrolling
  const [showGoTop, setShowGoTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => setShowGoTop(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* ── Go to Top (Mobile only) ── */}
      {isMobile && showGoTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            position: 'fixed',
            bottom: '180px',
            right: '22px',
            zIndex: 99,
            width: '44px',
            height: '44px',
            background: 'var(--kraft-950)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            border: '2px solid rgba(192, 148, 87, 0.4)',
            animation: 'fadeInUp 0.3s ease',
          }}
        >
          <ChevronUp size={20} />
        </button>
      )}

      {/* ── Google Maps FAB ── */}
      <a
        href="https://maps.google.com/?q=Nirmalyam+Krafts+Bengaluru"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: isMobile ? '120px' : '116px',
          right: isMobile ? '16px' : '24px',
          zIndex: 99,
          width: isMobile ? '56px' : '56px',
          height: isMobile ? '56px' : '56px',
          background: 'white',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          padding: '12px',
          border: '2px solid rgba(192, 148, 87, 0.3)',
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

      {/* ── WhatsApp FAB ── */}
      <a
        href="https://wa.me/15551790437?text=Hi%20"
        target="_blank"
        rel="noreferrer"
        style={{
          position: 'fixed',
          bottom: isMobile ? '48px' : '44px',
          right: isMobile ? '16px' : '24px',
          zIndex: 99,
          width: isMobile ? '56px' : '56px',
          height: isMobile ? '56px' : '56px',
          background: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
          cursor: 'pointer',
          textDecoration: 'none',
          border: '2px solid rgba(255, 255, 255, 0.5)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(37, 211, 102, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 211, 102, 0.4)';
        }}
      >
        <WhatsAppIcon size={isMobile ? 26 : 26} />
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
