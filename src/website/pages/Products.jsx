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
    <div style={{ minHeight: '100vh', paddingTop: 40, background: 'var(--kraft-50)' }}>
      {/* ── Header Section ── */}
      <section className="section-padding nature-section" style={{ paddingTop: 40, paddingBottom: 20 }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 800 }}>
            <div className="section-label">Our Collections</div>
            <h1 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: 'clamp(40px, 6vw, 64px)', 
              color: 'var(--kraft-950)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: 24
            }}>
              Exceptional Packaging,<br />
              <span style={{ color: 'var(--eco-600)' }}>Zero Plastic Waste.</span>
            </h1>
            <p style={{ fontSize: 18, color: 'var(--kraft-600)', lineHeight: 1.6, maxWidth: 600 }}>
              Explore our curated collections designed to meet the rigorous demands of modern commerce while staying true to our earth-first philosophy.
            </p>
          </div>
        </div>
      </section>

      {/* ── Category Cards ── */}
      <section className="section-padding nature-section" style={{ paddingTop: 20 }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 64 }}>
            {categories.map((cat, i) => (
              <div key={cat.id} style={{
                display: 'grid',
                gridTemplateColumns: i % 2 === 0 ? '1.2fr 0.8fr' : '0.8fr 1.2fr',
                gap: 64,
                alignItems: 'center',
                background: 'white',
                borderRadius: 'var(--radius-2xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--kraft-100)',
                minHeight: 500,
              }}
              className="product-category-row"
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
                      transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3))'
                  }} />
                </div>

                {/* Content Section */}
                <div style={{ 
                  order: i % 2 === 0 ? 2 : 1,
                  padding: '48px 64px',
                }}>
                  <div style={{ 
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: cat.color,
                    marginBottom: 12
                  }}>
                    {cat.subtitle}
                  </div>
                  <h2 style={{ 
                    fontFamily: "'Playfair Display', serif", 
                    fontSize: 'clamp(32px, 4vw, 42px)', 
                    color: 'var(--kraft-950)',
                    fontWeight: 700,
                    marginBottom: 20
                  }}>
                    {cat.title}
                  </h2>
                  <p style={{ 
                    fontSize: 16, 
                    color: 'var(--kraft-600)', 
                    lineHeight: 1.7, 
                    marginBottom: 32 
                  }}>
                    {cat.description}
                  </p>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 40 }}>
                    {cat.features.map(f => (
                      <div key={f} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        background: 'var(--kraft-50)',
                        padding: '8px 16px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: 13,
                        fontWeight: 600,
                        color: 'var(--kraft-700)',
                        border: '1px solid var(--kraft-100)'
                      }}>
                        <ShieldCheck size={14} color="var(--eco-500)" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <Link 
                    to={`/products/${cat.id}`} 
                    className="btn-primary"
                    style={{ padding: '16px 36px' }}
                  >
                    <span>View Collection Details</span>
                    <ArrowRight size={18} />
                  </Link>
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
            padding: 40px 32px !important;
          }
        }
      `}</style>
    </div>
  );
}
