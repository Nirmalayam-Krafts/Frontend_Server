import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Coffee, Crown, ShieldCheck, Zap, Globe } from 'lucide-react';

const categories = [
  {
    id: 'ecocraft',
    title: 'Ecocraft Collection',
    subtitle: 'Sustainable Everyday Packaging',
    description: 'Our flagship line of high-strength kraft paper bags. Perfect for retail, boutiques, and eco-conscious brands looking for durability and natural aesthetics.',
    image: '/images/products/ecocraft.png',
    color: 'var(--eco-600)',
    features: ['100-140 GSM Kraft', 'Twisted Paper Handles', 'Eco-friendly Glues'],
  },
  {
    id: 'fnb',
    title: 'F&B Gourmet',
    subtitle: 'Safe for Food, Kind to Earth',
    description: 'Specialized grease-resistant and moisture-controlled packaging for the food and beverage industry. Designed to keep freshness in and plastics out.',
    image: '/images/products/fnb.png',
    color: 'var(--kraft-700)',
    features: ['FDA Approved Paper', 'Moisture Barrier Coating', 'Heat Resistant'],
  },
  {
    id: 'luxury',
    title: 'Luxury Kraft',
    subtitle: 'Premium Unboxing experience',
    description: 'Elevate your brand with our luxury collection. High-thickness boards, premium textures, and exquisite finishes that redefine paper packaging.',
    image: '/images/products/luxury.png',
    color: 'var(--kraft-900)',
    features: ['200+ GSM Premium Board', 'Custom Foiling Options', 'Cotton Ribbon Handles'],
  }
];

export default function Products() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, background: 'white' }}>
      {/* ── Page Hero ── */}
      <div className="page-hero" style={{ 
        backgroundImage: 'url(/images/generated/products_hero_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
        position: 'relative',
        minHeight: '550px',
        display: 'flex',
        alignItems: 'center',
        marginTop: -80, // Offset root padding to keep hero full-bleed
        overflow: 'hidden'
      }}>
        {/* Dark overlay for readability - shifted left to show the bag on the right */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(26, 18, 8, 0.95) 0%, rgba(26, 18, 8, 0.6) 40%, rgba(26, 18, 8, 0.2) 100%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr)', 
            gap: 80, 
            alignItems: 'center' 
          }}>
            <div className="anim-fade-up">
              <div className="section-label" style={{ color: 'var(--eco-400)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Our Collections</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(36px, 6vw, 64px)',
                color: 'white',
                fontWeight: 600,
                marginBottom: 20,
                lineHeight: 1.1,
                textShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                Exceptional Packaging,<br />
                <span style={{ color: 'var(--kraft-300)' }}>Zero Plastic Waste</span>
              </h1>
              <p style={{ 
                fontSize: 'clamp(16px, 2vw, 19px)', 
                color: 'rgba(255,255,255,0.9)', 
                maxWidth: 580, 
                lineHeight: 1.7,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)' 
              }}>
                Explore our curated collections designed to meet the rigorous demands of modern commerce while staying true to our earth-first philosophy.
              </p>
            </div>

            {/* Empty right column: Background image already shows the bag on the right */}
            <div className="hidden lg:block h-full w-full" />
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
                  gridTemplateColumns: i % 2 === 0 ? '1.2fr 0.8fr' : '0.8fr 1.2fr', 
                  gap: 0,
                  alignItems: 'stretch', // Ensure image fills height
                  background: 'white',
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  boxShadow: 'var(--shadow-xl)',
                  border: '1px solid var(--kraft-100)',
                  transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  minHeight: '550px',
                  position: 'relative',
                  animationDelay: `${i * 0.15}s`
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-15px)';
                  e.currentTarget.style.boxShadow = '0 50px 100px rgba(26, 18, 8, 0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
              >
                {/* Image Section */}
                <div style={{ 
                  order: i % 2 === 0 ? 1 : 2,
                  height: '100%',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <img 
                    src={cat.image} 
                    alt={cat.title} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      transition: 'transform 1s cubic-bezier(0.2, 0, 0, 1)'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.15)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.4))'
                  }} />
                </div>

                {/* Content Section */}
                <div style={{ 
                  order: i % 2 === 0 ? 2 : 1,
                  padding: '64px 80px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  position: 'relative',
                  zIndex: 1
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
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '0.25em',
                    textTransform: 'uppercase',
                    color: cat.color,
                    marginBottom: 16
                  }}>
                    {cat.subtitle}
                  </div>
                  <h2 style={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: 'clamp(42px, 5vw, 56px)', 
                    color: 'var(--kraft-950)',
                    fontWeight: 700,
                    marginBottom: 24,
                    lineHeight: 1.1
                  }}>
                    {cat.title}
                  </h2>
                  <p style={{ 
                    fontSize: 19, 
                    color: 'var(--kraft-700)', 
                    lineHeight: 1.8, 
                    marginBottom: 40,
                    maxWidth: '95%'
                  }}>
                    {cat.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 48 }}>
                    {cat.features.map(f => (
                      <div key={f} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        background: 'var(--kraft-50)',
                        padding: '12px 24px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 16,
                        fontWeight: 600,
                        color: 'var(--kraft-800)',
                        border: '1px solid var(--kraft-100)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.02)'
                      }}>
                        <ShieldCheck size={18} color="var(--eco-500)" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <div>
                    <Link 
                      to={`/products/${cat.id}`} 
                      className="btn-primary"
                      style={{ 
                        padding: '20px 48px',
                        fontSize: 17,
                        boxShadow: '0 15px 30px rgba(0,0,0,0.1)'
                      }}
                    >
                      <span>Explore Collection</span>
                      <ArrowRight size={22} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Wholesale Section ── */}
      <section className="section-padding nature-section" style={{ background: 'var(--kraft-950)', color: 'white' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 40 }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.05)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Zap size={28} color="var(--eco-400)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Bulk Manufacturing</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Capacity to produce 100k+ bags per month with consistent quality control.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.05)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Globe size={28} color="var(--eco-400)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>PAN India Delivery</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>Optimized logistics to deliver zero-plastic packaging anywhere in India.</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.05)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <ShieldCheck size={28} color="var(--eco-400)" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>Quality Assured</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>FSC certified papers and soy-based inks for true sustainability.</p>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 991px) {
          .product-category-row {
            grid-template-columns: 1fr !important;
            min-height: auto !important;
          }
          .product-category-row > div {
            order: initial !important;
          }
          .product-category-row img {
            height: 350px !important;
          }
           .product-category-row > div:last-child {
            padding: 40px 0px !important;
          }
        }
      `}</style>
    </div>
  );
}
