import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/**
 * PagePopup Component - Contextual Designs & Message
 * Displays distinct contextual popup layouts (non-centered, interactive styles) with WhatsApp buttons
 */
export default function PagePopup({ pageType = 'home' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isSmallMobile = windowWidth < 480;
  const isTablet = windowWidth < 1024;

  // Define popup content based on page type with layout type
  const popupConfigs = {
    home: {
      title: 'Get Your Custom Quote',
      message: "Let's discuss your sustainable packaging needs. Chat with us on WhatsApp!",
      image: '/images/generated/popup_bags_branded_new.webp',
      accentColor: '#c09457',
      delay: 3000,
      layout: 'corner_bubble',
    },
    products: {
      title: 'Explore Our Collections',
      message: 'Discover the perfect eco-friendly packaging for your brand. Chat with our team!',
      image: '/images/newGen/BOTTOMV.jpeg',
      accentColor: '#4ade80',
      delay: 3000,
      layout: 'bottom_floating_bar',
    },
    about: {
      title: 'Learn Our Story',
      message: "Passionate about sustainable manufacturing? Let's connect and share our journey.",
      image: '/images/generated/about_hero_wood.webp',
      accentColor: '#22c55e',
      delay: 3000,
      layout: 'left_slide_panel',
    },
    contact: {
      title: 'Reach Out Today',
      message: 'Questions about our services? Chat directly with our team on WhatsApp!',
      image: '/images/generated/contact_bg.png',
      accentColor: '#c09457',
      delay: 3000,
      layout: 'system_notification',
    },
    sustainability: {
      title: 'Go Green Together',
      message: "Ready to eliminate plastic waste? Let's create a sustainable solution for you.",
      image: '/images/eco_cta_bg.webp',
      accentColor: '#22c55e',
      delay: 3000,
      layout: 'organic_corner_card',
    },
    designyourproduct: {
      title: 'Design Your Perfect Pack',
      message: "Our designers are ready to bring your vision to life. Let's chat!",
      image: '/images/generated/design_bg.png',
      accentColor: '#c09457',
      delay: 3000,
      layout: 'creative_interactive_widget',
    },
  };

  const config = popupConfigs[pageType] || popupConfigs.home;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, config.delay);

    return () => clearTimeout(timer);
  }, [config.delay]);

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  const whatsappUrl = "https://wa.me/919049001299?text=Hi%20Nirmalyam%20Krafts!";

  // 1. Home Page: corner_bubble layout (Bottom-Left Corner Card with Expandable Pulse)
  if (config.layout === 'corner_bubble') {
    return (
      <div
        className="nirmalyam-corner-bubble-wrapper"
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          left: isMobile ? '16px' : '24px',
          zIndex: 99999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {isCollapsed ? (
          /* Pulsing Chat Icon Bubble */
          <button
            onClick={() => setIsCollapsed(false)}
            style={{
              width: isMobile ? '56px' : '64px',
              height: isMobile ? '56px' : '64px',
              borderRadius: '50%',
              background: '#25D366',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4)',
              cursor: 'pointer',
              animation: 'nirmalyamPulse 2s infinite',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            title="Chat with us"
          >
            <WhatsAppIcon size={isMobile ? 24 : 28} />
          </button>
        ) : (
          /* Expandable Premium Card */
          <div
            style={{
              background: 'rgba(26, 18, 8, 0.95)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              width: isSmallMobile ? '260px' : isMobile ? '280px' : isTablet ? '290px' : '300px',
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)',
              overflowY: 'auto',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
              animation: 'nirmalyamPopIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              position: 'relative',
              color: 'white',
            }}
          >
            {/* Close / Collapse Options */}
            <div
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                display: 'flex',
                gap: '6px',
                zIndex: 10,
              }}
            >
              <button
                onClick={() => setIsCollapsed(true)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  cursor: 'pointer',
                  fontWeight: '600',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
              >
                Minimize
              </button>
              <button
                onClick={handleClose}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.15)',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)')}
              >
                <X size={10} color="white" />
              </button>
            </div>

            {/* Mini Header Image */}
            <div style={{ height: isMobile ? '70px' : '85px', overflow: 'hidden', position: 'relative' }}>
              <img
                src={config.image}
                alt="Chat support"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to bottom, transparent 20%, rgba(26, 18, 8, 0.95) 100%)',
                }}
              />
            </div>

            {/* Text & Button */}
            <div style={{ padding: isMobile ? '10px 14px 14px' : '14px 16px 16px' }}>
              <span
                style={{
                  color: config.accentColor,
                  fontSize: isMobile ? '9px' : '10px',
                  textTransform: 'uppercase',
                  fontWeight: '700',
                  letterSpacing: '1px',
                }}
              >
                Direct Factory Pricing
              </span>
              <h3
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: isMobile ? '14px' : '16px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '4px 0 6px 0',
                  lineHeight: '1.2',
                }}
              >
                {config.title}
              </h3>
              <p
                style={{
                  fontSize: isMobile ? '11px' : '12px',
                  color: '#bdae9e',
                  lineHeight: '1.4',
                  margin: isMobile ? '0 0 12px 0' : '0 0 16px 0',
                }}
              >
                {config.message}
              </p>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: isMobile ? '8px 12px' : '10px 16px',
                  background: '#25D366',
                  color: 'white',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: '700',
                  fontSize: isMobile ? '12px' : '13px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.35)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.25)';
                }}
              >
                <WhatsAppIcon size={14} /> Chat on WhatsApp
              </a>
            </div>
          </div>
        )}

        <style>{`
          @keyframes nirmalyamPopIn {
            from {
              opacity: 0;
              transform: scale(0.8) translateY(20px);
            }
            to {
              opacity: 1;
              transform: scale(1) translateY(0);
            }
          }
          @keyframes nirmalyamPulse {
            0% {
              box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.4);
            }
            70% {
              box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
            }
            100% {
              box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
            }
          }
        `}</style>
      </div>
    );
  }

  // 2. Products Page: bottom_floating_bar layout (Floating Bottom Banner)
  if (config.layout === 'bottom_floating_bar') {
    return (
      <div
        className="nirmalyam-bottom-floating-bar-wrapper"
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 48px)',
          maxWidth: '760px',
          zIndex: 99999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
            padding: isMobile ? '10px 14px' : '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            animation: 'nirmalyamSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Left info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '10px' : '14px', flex: 1 }}>
            <div
              style={{
                width: isMobile ? '36px' : '44px',
                height: isMobile ? '36px' : '44px',
                borderRadius: '8px',
                overflow: 'hidden',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              }}
            >
              <img
                src={config.image}
                alt="Product thumbnail"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: isMobile ? '9px' : '10px',
                    fontWeight: '700',
                    color: '#c09457',
                    background: '#FAF6F0',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    textTransform: 'uppercase',
                  }}
                >
                  Factory wholesale
                </span>
              </div>
              <h4 style={{ margin: '2px 0 0 0', fontSize: isMobile ? '13px' : '15px', fontWeight: '700', color: '#1a1208' }}>
                {config.title}
              </h4>
              <p
                className="bottom-bar-desc-text"
                style={{ margin: 0, fontSize: isMobile ? '11px' : '12px', color: '#6e5d4f', fontWeight: '500' }}
              >
                {config.message}
              </p>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: isMobile ? '8px 12px' : '9px 16px',
                background: '#25D366',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: isMobile ? '11px' : '13px',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <WhatsAppIcon size={isMobile ? 12 : 14} /> Chat Now
            </a>
            <button
              onClick={handleClose}
              style={{
                width: isMobile ? '28px' : '32px',
                height: isMobile ? '28px' : '32px',
                borderRadius: '8px',
                background: 'rgba(0,0,0,0.04)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(0,0,0,0.04)')}
            >
              <X size={isMobile ? 12 : 14} color="#1a1208" />
            </button>
          </div>
        </div>

        <style>{`
          @keyframes nirmalyamSlideUp {
            from {
              opacity: 0;
              transform: translateY(40px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (max-width: 768px) {
            .nirmalyam-bottom-floating-bar-wrapper {
              bottom: 16px !important;
              left: 16px !important;
              transform: none !important;
              width: calc(100vw - 32px) !important;
              maxWidth: none !important;
            }
            .bottom-bar-desc-text {
              display: none !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // 3. About Page: left_slide_panel layout (Left Edge Slide-in Drawer)
  if (config.layout === 'left_slide_panel') {
    return (
      <div
        className="nirmalyam-left-slide-wrapper"
        style={{
          position: 'fixed',
          top: isMobile ? 'auto' : '50%',
          bottom: isMobile ? '16px' : 'auto',
          left: isMobile ? '16px' : '24px',
          transform: isMobile ? 'none' : 'translateY(-50%)',
          zIndex: 99999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            background: '#FAF6F0',
            borderLeft: isMobile ? 'none' : '4px solid #c09457',
            borderBottom: isMobile ? '4px solid #c09457' : 'none',
            borderRadius: isMobile ? '16px' : '0 16px 16px 0',
            width: isSmallMobile ? '260px' : isMobile ? '280px' : '280px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)',
            overflowY: 'auto',
            boxShadow: '8px 8px 32px rgba(26, 18, 8, 0.12)',
            padding: isMobile ? '16px 20px' : '24px',
            position: 'relative',
            animation: 'nirmalyamSlideInLeft 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              background: 'rgba(26, 18, 8, 0.04)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(26, 18, 8, 0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(26, 18, 8, 0.04)')}
          >
            <X size={14} color="#1a1208" />
          </button>

          <span
            style={{
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: '700',
              color: '#c09457',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              display: 'block',
              marginBottom: '6px',
            }}
          >
            Our Story
          </span>
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '700',
              color: '#1a1208',
              margin: '0 0 6px 0',
              lineHeight: '1.2',
            }}
          >
            {config.title}
          </h3>
          <p
            style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#6e5d4f',
              lineHeight: '1.5',
              margin: isMobile ? '0 0 14px 0' : '0 0 20px 0',
              fontWeight: '500',
            }}
          >
            {config.message}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: isMobile ? '10px 14px' : '12px 16px',
              background: '#25D366',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: isMobile ? '12px' : '13px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 10px rgba(37, 211, 102, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 10px rgba(37, 211, 102, 0.15)';
            }}
          >
            <WhatsAppIcon size={16} /> Contact Our Team
          </a>
        </div>

        <style>{`
          @keyframes nirmalyamSlideInLeft {
            from {
              opacity: 0;
              transform: translateX(-40px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @media (max-width: 768px) {
            .nirmalyam-left-slide-wrapper {
              top: auto !important;
              bottom: 16px !important;
              left: 16px !important;
              transform: none !important;
              width: calc(100vw - 32px) !important;
            }
            .nirmalyam-left-slide-wrapper > div {
              width: 100% !important;
              border-radius: 16px !important;
              border-left: none !important;
              border-bottom: 4px solid #c09457 !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // 4. Contact Page: system_notification layout (Top-Right Floating Toast)
  if (config.layout === 'system_notification') {
    return (
      <div
        className="nirmalyam-system-notification-wrapper"
        style={{
          position: 'fixed',
          top: isMobile ? '16px' : '24px',
          right: isMobile ? '16px' : '24px',
          zIndex: 99999,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            borderRadius: '14px',
            width: isSmallMobile ? '260px' : isMobile ? '280px' : isTablet ? '290px' : '340px',
            maxWidth: 'calc(100vw - 32px)',
            padding: isMobile ? '10px 14px' : '12px 16px',
            position: 'relative',
            animation: 'nirmalyamSlideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div
                style={{
                  background: '#25D366',
                  width: '18px',
                  height: '18px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <WhatsAppIcon size={11} />
              </div>
              <span style={{ fontSize: isMobile ? '10px' : '11px', fontWeight: '600', color: '#8e8e93', letterSpacing: '0.5px' }}>
                NIRMALYAM SUPPORT
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: isMobile ? '10px' : '11px', color: '#8e8e93' }}>now</span>
              <button
                onClick={handleClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                <X size={12} color="#8e8e93" />
              </button>
            </div>
          </div>

          {/* Body content */}
          <div style={{ marginBottom: '10px' }}>
            <h4 style={{ margin: '0 0 2px 0', fontSize: isMobile ? '13px' : '14px', fontWeight: '700', color: '#1c1c1e' }}>
              {config.title}
            </h4>
            <p style={{ margin: 0, fontSize: isMobile ? '11px' : '13px', color: '#3a3a3c', lineHeight: '1.4' }}>
              {config.message}
            </p>
          </div>

          {/* iOS-like Action Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              padding: isMobile ? '6px' : '8px',
              background: '#25D366',
              color: 'white',
              borderRadius: '8px',
              fontSize: isMobile ? '11px' : '13px',
              fontWeight: '700',
              textDecoration: 'none',
              textAlign: 'center',
              boxShadow: '0 2px 8px rgba(37, 211, 102, 0.15)',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#20ba59')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#25D366')}
          >
            Reply on WhatsApp
          </a>
        </div>

        <style>{`
          @keyframes nirmalyamSlideDown {
            from {
              opacity: 0;
              transform: translateY(-30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @media (max-width: 768px) {
            .nirmalyam-system-notification-wrapper {
              top: 16px !important;
              right: 16px !important;
              width: calc(100vw - 32px) !important;
            }
            .nirmalyam-system-notification-wrapper > div {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // 5. Sustainability Page: organic_corner_card layout (Bottom-Right Nature Card)
  if (config.layout === 'organic_corner_card') {
    return (
      <div
        className="nirmalyam-organic-card-wrapper"
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          right: isMobile ? '16px' : '24px',
          zIndex: 99999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #18331a 0%, #0c1a0d 100%)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '24px 8px 24px 24px',
            width: isSmallMobile ? '260px' : isMobile ? '280px' : isTablet ? '290px' : '300px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)',
            overflowY: 'auto',
            boxShadow: '0 16px 40px rgba(12, 26, 13, 0.35)',
            padding: isMobile ? '16px 20px' : '24px',
            position: 'relative',
            color: 'white',
            animation: 'nirmalyamSlideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={14} color="white" />
          </button>

          {/* Leaf detail accent */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#4ade80',
              fontSize: isMobile ? '10px' : '11px',
              fontWeight: '700',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginBottom: '8px',
            }}
          >
            <span style={{ fontSize: '14px' }}>🌿</span> ECO-FRIENDLY
          </div>

          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '16px' : '20px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 6px 0',
              lineHeight: '1.2',
            }}
          >
            {config.title}
          </h3>

          <p
            style={{
              fontSize: isMobile ? '12px' : '13px',
              color: '#a9bfa9',
              lineHeight: '1.5',
              margin: isMobile ? '0 0 14px 0' : '0 0 20px 0',
              fontWeight: '500',
            }}
          >
            {config.message}
          </p>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: isMobile ? '10px 16px' : '12px 20px',
              background: '#ffffff',
              color: '#0c1a0d',
              borderRadius: '12px',
              textDecoration: 'none',
              fontWeight: '700',
              fontSize: isMobile ? '12px' : '13px',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(255, 255, 255, 0.15)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 255, 255, 0.15)';
            }}
          >
            <WhatsAppIcon size={16} /> Go Green Now
          </a>
        </div>

        <style>{`
          @keyframes nirmalyamSlideInRight {
            from {
              opacity: 0;
              transform: translateX(40px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          @media (max-width: 768px) {
            .nirmalyam-organic-card-wrapper {
              bottom: 16px !important;
              right: 16px !important;
              width: calc(100vw - 32px) !important;
            }
            .nirmalyam-organic-card-wrapper > div {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    );
  }

  // 6. Design Your Product Page: creative_interactive_widget layout (Bottom-Right Glassmorphic Card)
  if (config.layout === 'creative_interactive_widget') {
    return (
      <div
        className="nirmalyam-creative-widget-wrapper"
        style={{
          position: 'fixed',
          bottom: isMobile ? '16px' : '24px',
          right: isMobile ? '16px' : '24px',
          zIndex: 99999,
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <div
          style={{
            background: '#121212',
            border: '1px solid #c09457',
            borderRadius: '16px',
            width: isSmallMobile ? '260px' : isMobile ? '280px' : isTablet ? '290px' : '320px',
            maxWidth: 'calc(100vw - 32px)',
            maxHeight: isMobile ? 'calc(100vh - 120px)' : 'calc(100vh - 80px)',
            overflowY: 'auto',
            boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
            padding: isMobile ? '16px 20px' : '22px',
            position: 'relative',
            color: 'white',
            animation: 'nirmalyamSlideInRight 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Creative ribbon label */}
          <div
            style={{
              position: 'absolute',
              top: '-10px',
              left: isMobile ? '16px' : '20px',
              background: '#c09457',
              color: '#121212',
              fontSize: isMobile ? '8px' : '9px',
              fontWeight: '800',
              textTransform: 'uppercase',
              padding: '2px 8px',
              borderRadius: '4px',
              letterSpacing: '1px',
              boxShadow: '0 2px 6px rgba(192, 148, 87, 0.3)',
            }}
          >
            Creative Studio
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
          >
            <X size={12} color="white" />
          </button>

          <div style={{ marginTop: '6px' }}>
            <h3
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isMobile ? '15px' : '19px',
                fontWeight: '700',
                color: '#ffffff',
                margin: '0 0 6px 0',
                lineHeight: '1.2',
              }}
            >
              {config.title}
            </h3>
            <p
              style={{
                fontSize: isMobile ? '12px' : '13px',
                color: '#a0a0a0',
                lineHeight: '1.5',
                margin: isMobile ? '0 0 14px 0' : '0 0 18px 0',
                fontWeight: '500',
              }}
            >
              {config.message}
            </p>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: isMobile ? '10px 16px' : '12px 20px',
                background: '#c09457',
                color: '#121212',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: isMobile ? '12px' : '13px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(192, 148, 87, 0.2)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.background = '#d0a467';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(192, 148, 87, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.background = '#c09457';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(192, 148, 87, 0.2)';
              }}
            >
              <WhatsAppIcon size={16} /> Start Designing
            </a>
          </div>
        </div>

        <style>{`
          @media (max-width: 768px) {
            .nirmalyam-creative-widget-wrapper {
              bottom: 16px !important;
              right: 16px !important;
              width: calc(100vw - 32px) !important;
            }
            .nirmalyam-creative-widget-wrapper > div {
              width: 100% !important;
            }
          }
        `}</style>
      </div>
    );
  }

  return null;
}
