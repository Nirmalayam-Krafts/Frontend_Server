import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Coffee, Crown, ShieldCheck, Zap, Globe, MessageSquare, Play, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const categories = [
  {
    id: 'ecocraft',
    title: 'Ecocraft Collection',
    subtitle: 'Sustainable Everyday Packaging',
    description: 'Our flagship line of high-strength kraft paper bags. Perfect for retail, boutiques, and eco-conscious brands looking for durability and natural aesthetics.',
    image: '/images/collection_ecocraft_vibrant.png',
    videoStill: '/images/generated/video_ecocraft.png',
    color: '#4ade80',
    features: ['100-140 GSM Kraft', 'Twisted Paper Handles', 'Eco-friendly Glues'],
  },
  {
    id: 'fnb',
    title: 'F&B Gourmet Bags',
    subtitle: 'Safe for Food, Kind to Earth',
    description: 'Specialized grease-resistant and moisture-controlled packaging for the food and beverage industry. Designed to keep freshness in and plastics out.',
    image: '/images/collection_fnb_vibrant.png',
    videoStill: '/images/generated/video_fnb.png',
    color: '#f59e0b',
    features: ['FDA Approved Paper', 'Moisture Barrier Coating', 'Heat Resistant'],
  },
  {
    id: 'luxury',
    title: 'Luxury Kraft Bags',
    subtitle: 'Premium Unboxing experience',
    description: 'Elevate your brand with our luxury collection. High-thickness boards, premium textures, and exquisite finishes that redefine paper packaging.',
    image: '/images/collection_luxury_vibrant.png',
    videoStill: '/images/generated/video_luxury.png',
    color: '#c09457',
    features: ['200+ GSM Premium Board', 'Custom Foiling Options', 'Cotton Ribbon Handles'],
  }
];

export default function Products() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [activeVideo, setActiveVideo] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  return (
    <div style={{ minHeight: '100vh', paddingTop: isMobile ? 60 : 80, background: 'white' }}>
      {/* ── Page Hero ── */}
      {/* ... keep hero as is ... */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/products_hero_branded_new.png)',
        backgroundSize: 'cover',
        backgroundPosition: isMobile ? 'center' : 'center right',
        position: 'relative',
        minHeight: isMobile ? '450px' : '550px',
        display: 'flex',
        alignItems: 'center',
        marginTop: isMobile ? -60 : -80,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(26, 18, 8, 0.95) 0%, rgba(26, 18, 8, 0.6) 40%, rgba(26, 18, 8, 0.2) 100%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : 'minmax(0, 1.2fr) minmax(0, 1fr)',
            gap: isMobile ? 32 : 80,
            alignItems: 'center'
          }}>
            <div className="anim-fade-up" style={{ width: '100%' }}>
              <div className="section-label" style={{
                color: 'var(--eco-400)',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                textAlign: isMobile || isTablet ? 'center' : 'left',
                width: '100%',
                marginBottom: 16
              }}>Our Collections</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(32px, 8vw, 64px)',
                color: 'white',
                fontWeight: 600,
                marginBottom: 20,
                lineHeight: 1.1,
                textShadow: '0 4px 12px rgba(0,0,0,0.4)',
                textAlign: isMobile || isTablet ? 'center' : 'left'
              }}>
                Exceptional Packaging,<br />
                <span style={{ color: 'var(--kraft-300)' }}>Zero Plastic Waste</span>
              </h1>
              <p style={{
                fontSize: 'clamp(16px, 2vw, 19px)',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: isMobile || isTablet ? '100%' : 580,
                lineHeight: 1.7,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                textAlign: isMobile || isTablet ? 'center' : 'left',
                margin: isMobile || isTablet ? '0 auto' : '0'
              }}>
                Explore our curated collections designed to meet the rigorous demands of modern commerce while staying true to our earth-first philosophy.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Cards ── */}
      <section className="section-padding nature-section" style={{ paddingTop: 20 }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="anim-fade-up product-category-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : (i % 2 === 0 ? '1.2fr 0.8fr' : '0.8fr 1.2fr'),
                  gridAutoRows: 'auto',
                  gap: 0,
                  alignItems: 'stretch',
                  background: 'white',
                  borderRadius: isMobile ? 'var(--radius-xl)' : 'var(--radius-2xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--kraft-100)',
                  transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  minHeight: isMobile ? 'auto' : '550px',
                  position: 'relative',
                  animationDelay: `${i * 0.15}s`
                }}
              >
                {/* --- IMAGE / VIDEO SECTION --- */}
                <div
                  className="product-gallery-item"
                  style={{
                    order: isMobile ? 1 : (i % 2 === 0 ? 1 : 2),
                    height: isMobile ? '400px' : 'auto',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* The Cinematic "Video" Still */}
                  <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={e => {
                    const img = e.currentTarget.querySelector('.story-img');
                    if (img) img.style.transform = 'scale(1.1) translateX(10px)';
                  }}
                  onMouseLeave={e => {
                    const img = e.currentTarget.querySelector('.story-img');
                    if (img) img.style.transform = 'scale(1)';
                  }}
                  >
                    <img
                      className="story-img"
                      src={cat.videoStill}
                      alt={`${cat.title} Cinematic Story`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 8s ease'
                      }}
                    />


                  </div>

                  {/* "Get a Quote" Overlay */}
                  <Link to="/contact#contact-form" className="gallery-quote-btn" style={{ textDecoration: 'none', color: 'white' }}>
                    <MessageSquare size={isMobile ? 24 : 32} style={{ marginBottom: 4 }} />
                    <span style={{
                      fontSize: isMobile ? 18 : 22,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                      color: 'white'
                    }}>Get a Quote</span>
                    <p style={{
                      fontSize: isMobile ? 12 : 14,
                      opacity: 0.8,
                      margin: 0
                    }}>Click to inquire about {cat.title}</p>
                  </Link>

                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.6))',
                    pointerEvents: 'none',
                    zIndex: 1
                  }} />
                </div>

                {/* Content Section */}
                <div style={{
                  order: isMobile ? 2 : (i % 2 === 0 ? 2 : 1),
                  padding: isMobile ? '24px 20px' : isTablet ? '40px 48px' : '64px 80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1,
                  textAlign: isMobile ? 'center' : 'left'
                }}>
                  {/* Decorative Background Glow */}
                  <div style={{
                    position: 'absolute',
                    top: '20%',
                    left: '10%',
                    width: '60%',
                    height: '60%',
                    background: `radial-gradient(circle, ${cat.color}15 0%, transparent 70%)`,
                    filter: 'blur(50px)',
                    zIndex: -1,
                    pointerEvents: 'none'
                  }} />

                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: isMobile ? 11 : 14,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: cat.color,
                    marginBottom: isMobile ? 8 : 16
                  }}>
                    {cat.subtitle}
                  </div>
                  <h2 style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: isMobile ? '28px' : isTablet ? '40px' : '56px',
                    color: 'var(--kraft-950)',
                    fontWeight: 700,
                    marginBottom: isMobile ? 12 : 24,
                    lineHeight: 1.1
                  }}>
                    {cat.title}
                  </h2>
                  <p style={{
                    fontSize: isMobile ? 14 : 19,
                    color: 'var(--kraft-700)',
                    lineHeight: 1.7,
                    marginBottom: isMobile ? 20 : 32,
                    maxWidth: isMobile ? '100%' : '95%'
                  }}>
                    {cat.description}
                  </p>

                  <div style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: isMobile ? 6 : 16,
                    marginBottom: isMobile ? 24 : 48,
                    justifyContent: isMobile ? 'center' : 'flex-start'
                  }}>
                    {cat.features.map(f => (
                      <div key={f} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        background: 'var(--kraft-50)',
                        padding: isMobile ? '5px 10px' : '12px 24px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: isMobile ? 11 : 16,
                        fontWeight: 600,
                        color: 'var(--kraft-800)',
                        border: '1px solid var(--kraft-100)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                      }}>
                        <ShieldCheck size={isMobile ? 12 : 14} color="var(--eco-500)" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div style={{ textAlign: isMobile ? 'center' : 'left' }}>
                    <Link
                      to={`/products/${cat.id}`}
                      className="btn-primary"
                      style={{
                        padding: isMobile ? '14px 28px' : '20px 48px',
                        fontSize: isMobile ? 13 : 17,
                        width: isMobile ? '100%' : 'auto',
                        justifyContent: 'center',
                        boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span>Explore Collection</span>
                      <ArrowRight size={isMobile ? 16 : 22} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="nature-section" style={{
        background: 'var(--kraft-950)',
        color: 'white',
        padding: isMobile ? '32px 0' : '96px 0'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/tree-texture.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr 1fr' : 'repeat(3, 1fr)',
            gap: isMobile ? 32 : 40
          }}>
            <div style={{ textAlign: 'center', padding: isMobile ? '0 4px' : '0' }}>
              <div style={{ width: isMobile ? 40 : 64, height: isMobile ? 40 : 64, background: 'rgba(255,255,255,0.05)', borderRadius: isMobile ? 12 : 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Zap size={isMobile ? 18 : 28} color="var(--eco-400)" />
              </div>
              <h3 style={{ fontSize: isMobile ? 12 : 20, fontWeight: 600, marginBottom: isMobile ? 4 : 12 }}>Bulk Manufacturing</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? 9 : 14 }}>Capacity to produce 100k+ bags per month.</p>
            </div>
            <div style={{ textAlign: 'center', padding: isMobile ? '0 4px' : '0' }}>
              <div style={{ width: isMobile ? 40 : 64, height: isMobile ? 40 : 64, background: 'rgba(255,255,255,0.05)', borderRadius: isMobile ? 12 : 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Globe size={isMobile ? 18 : 28} color="var(--eco-400)" />
              </div>
              <h3 style={{ fontSize: isMobile ? 12 : 20, fontWeight: 600, marginBottom: isMobile ? 4 : 12 }}>PAN India Delivery</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? 9 : 14 }}>Zero-plastic packaging anywhere in India.</p>
            </div>
            <div style={{ textAlign: 'center', padding: isMobile ? '0 4px' : '0', gridColumn: 'auto' }}>
              <div style={{ width: isMobile ? 40 : 64, height: isMobile ? 40 : 64, background: 'rgba(255,255,255,0.05)', borderRadius: isMobile ? 12 : 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <ShieldCheck size={isMobile ? 18 : 28} color="var(--eco-400)" />
              </div>
              <h3 style={{ fontSize: isMobile ? 12 : 20, fontWeight: 600, marginBottom: isMobile ? 4 : 12 }}>Quality Assured</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: isMobile ? 9 : 14 }}>FSC certified papers and soy-based inks.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
