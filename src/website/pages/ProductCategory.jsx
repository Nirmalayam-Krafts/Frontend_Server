import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Leaf, 
  Coffee, 
  Crown, 
  Droplets,
  Zap,
  Phone,
  CheckCircle2,
  ChevronRight,
  Award,
  Heart,
  Scale,
  Layers,
  Printer,
  Package,
  Settings,
  FileText,
  Weight
} from 'lucide-react';

const categoryData = {
  ecocraft: {
    title: 'Custom Printed Brown Kraft Bag',
    image: '/images/products/ecocraft.png',
    minOrder: '500 UNITS',
    description: 'Our signature brown kraft bags combine industrial-grade durability with a refined, tactile aesthetic.',
    longDescription: 'Crafted from sustainably sourced FSC-certified fibers, these bags are designed to elevate your brand\'s presence while honoring the planet.',
    bullets: [
      { label: 'FSC Certified', icon: CheckCircle2 },
      { label: 'Biodegradable', icon: Leaf },
      { label: 'Holds up to 12kg', icon: Zap },
      { label: 'Soy-based Inks', icon: Droplets }
    ],
    specs: [
      { label: 'Material', value: 'FSC Kraft Paper', icon: Layers },
      { label: 'Weight Range', icon: Weight, value: '100 - 140 GSM' },
      { label: 'Handle Types', icon: Settings, value: 'Twisted, Flat, Die-cut' },
      { label: 'Printing', value: 'Soy Inks, 6 Colors', icon: Printer },
      { label: 'Capacity', value: '3kg - 12kg', icon: Scale },
      { label: 'Min Order', icon: Package, value: '500 units' }
    ],
    gallery: [
      { 
        title: 'Natural Brown Kraft', 
        desc: 'The classic raw sustainable aesthetic',
        image: '/images/generated/natural_brown_kraft_gallery_1775487935111.png'
      },
      { 
        title: 'Bleached White Utility', 
        desc: 'Clean, crisp premium finish',
        image: '/images/generated/bleached_white_kraft_gallery_1775487963327.png'
      },
      { 
        title: 'Custom Brand Print', 
        desc: 'High-fidelity brand realization',
        image: '/images/generated/custom_printed_kraft_gallery_1775487996087.png'
      }
    ]
  },
  fnb: {
    title: 'F&B Gourmet Paper Bag',
    image: '/images/products/fnb.png',
    minOrder: '1000 UNITS',
    description: 'Specialized grease-resistant packaging for the food and beverage industry.',
    longDescription: 'Developed for restaurateurs, our F&B line features food-grade barriers that resist oil and moisture without plastic laminates. Perfect for hot takeaways.',
    bullets: [
      { label: 'FDA Approved', icon: CheckCircle2 },
      { label: 'Grease Resistant', icon: Droplets },
      { label: 'Steam Vented', icon: Zap },
      { label: 'Compostable', icon: Leaf }
    ],
    specs: [
      { label: 'Material', value: 'Oil-Resistant Paper', icon: Layers },
      { label: 'Weight Range', value: '70 - 110 GSM', icon: Weight },
      { label: 'Features', value: 'Leak-proof, V-base', icon: Settings },
      { label: 'Certification', value: 'FDA, BPI Approved', icon: ShieldCheck },
      { label: 'Safety', value: 'PFAS & Chlorine-Free', icon: CheckCircle2 },
      { label: 'Min Order', value: '1,000 units', icon: Package }
    ],
    gallery: [
      { 
        title: 'Pastry Sleeves', 
        desc: 'Grease-proof artisan solutions',
        image: '/images/generated/fnb_pastry_sleeves_1775488776952.png'
      },
      { 
        title: 'Wide-Base Takeaway', 
        desc: 'Engineered for restaurant delivery',
        image: '/images/generated/fnb_wide_base_takeaway_1775488815145.png'
      },
      { 
        title: 'Secure Delivery Pouch', 
        desc: 'Tamper-evident food security',
        image: '/images/generated/fnb_delivery_pouch_1775488853812.png'
      }
    ]
  },
  luxury: {
    title: 'Luxury Premium Kraft Bag',
    image: '/images/products/luxury.png',
    minOrder: '200 UNITS',
    description: 'High-thickness boards and exquisite finishes that redefine paper packaging.',
    longDescription: 'Our Luxury collection represents the pinnacle of sustainable packaging. Heavyweight boards provide a rigid silhouette, hand-finished with cotton ribbon handles.',
    bullets: [
      { label: 'Extra Thick Board', icon: Crown },
      { label: 'Ribbon Handles', icon: Heart },
      { label: 'Foil Stamping', icon: Award },
      { label: 'Hand Finished', icon: CheckCircle2 }
    ],
    specs: [
      { label: 'Material', value: 'Art Board / Double Kraft', icon: Layers },
      { label: 'Weight Range', value: '200 - 350 GSM', icon: Weight },
      { label: 'Handles', value: 'Silk / Satin Ribbon', icon: Heart },
      { label: 'Finishing', value: 'UV / Foil Stamping', icon: Award },
      { label: 'Extra Detail', value: 'Eyelet reinforced', icon: Settings },
      { label: 'Min Order', value: '200 units', icon: Package }
    ],
    gallery: [
      { 
        title: 'Matt Black & Gold', 
        desc: 'Signature high-fashion aesthetic',
        image: '/images/generated/luxury_matt_black_gold_1775488897962.png'
      },
      { 
        title: 'Textured Ivory Silk', 
        desc: 'Micro-textured premium unboxing',
        image: '/images/generated/luxury_textured_ivory_1775488944535.png'
      },
      { 
        title: 'Forest Green Satin', 
        desc: 'Satin-lined exquisite finishing',
        image: '/images/generated/luxury_forest_green_satin_1775488988571.png'
      }
    ]
  }
};

export default function ProductCategory() {
  const { categoryId } = useParams();
  const data = categoryData[categoryId];

  if (!data) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Category Not Found
    </div>
  );

  const whatsappMessage = `Hi Nirmalyam Krafts, I'm interested in the ${data.title} collection. Could you please share the price list and sample details?`;
  const whatsappUrl = `https://wa.me/919900000000?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kraft-50)' }}>
      {/* ── Fixed Quote Bar ── */}
      <div style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: '90%',
        maxWidth: 720,
        background: '#F3F1ED',
        borderRadius: 'var(--radius-3xl)',
        padding: '10px 10px 10px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
        border: '1px solid rgba(0,0,0,0.05)',
        animation: 'quoteFadeUp 0.5s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            width: 52, height: 52,
            borderRadius: '50%',
            overflow: 'hidden',
            background: '#FFD7C4',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <img src={data.image} alt="" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--eco-700)', letterSpacing: '0.05em' }}>STARTING FROM {data.minOrder}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--kraft-950)' }}>{data.title}</div>
          </div>
        </div>
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#1F4013',
            color: 'white',
            padding: '14px 28px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            transition: 'all 0.3s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#152b0d'}
          onMouseLeave={e => e.currentTarget.style.background = '#1F4013'}
        >
          <Phone size={18} fill="white" /> Get Best Price on WhatsApp
        </a>
      </div>

      {/* ── Main Content ── */}
      <div style={{ paddingTop: 110, paddingBottom: 80 }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 8, 
            fontSize: 12, 
            fontWeight: 600, 
            color: 'var(--kraft-400)', 
            marginBottom: 32,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={14} />
            <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
            <ChevronRight size={14} />
            <span style={{ color: 'var(--eco-600)' }}>{data.title}</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 64, alignItems: 'start' }} className="category-hero-grid">
            {/* Image Section */}
            <div style={{ position: 'sticky', top: 120 }}>
              <div style={{
                borderRadius: 'var(--radius-3xl)',
                overflow: 'hidden',
                aspectRatio: '1',
                boxShadow: 'var(--shadow-2xl)',
                background: 'white',
                border: '1px solid var(--kraft-100)',
                padding: 40
              }}>
                <img src={data.image} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            </div>

            {/* Product Details Section */}
            <div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
                <div style={{ background: '#CC9966', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                  ECO-FRIENDLY
                </div>
                <div style={{ background: '#996633', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 11, fontWeight: 700, letterSpacing: '0.05em' }}>
                  100% RECYCLABLE
                </div>
              </div>
              
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 4vw, 48px)', color: 'var(--kraft-950)', marginBottom: 24, lineHeight: 1.1, fontWeight: 700 }}>
                {data.title}
              </h1>
              
              <p style={{ fontSize: 18, color: 'var(--kraft-600)', lineHeight: 1.6, marginBottom: 40 }}>
                {data.description} {data.longDescription}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 48 }}>
                <a href={whatsappUrl} style={{ 
                  flex: 1, 
                  padding: '18px 24px', 
                  background: '#2D5A27', 
                  color: 'white',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 10,
                  textDecoration: 'none',
                  fontWeight: 700,
                  fontSize: 16,
                  transition: 'background 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#1F4013'}
                onMouseLeave={e => e.currentTarget.style.background = '#2D5A27'}
                >
                   <Phone size={18} fill="white" /> WhatsApp Us
                </a>
                <Link to="/contact" style={{ 
                  flex: 1, 
                  padding: '18px 24px', 
                  background: '#EAE5D8', 
                  color: '#1F4013', 
                  borderRadius: 'var(--radius-lg)', 
                  textDecoration: 'none', 
                  fontWeight: 700,
                  fontSize: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                  transition: 'background 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DED9C8'}
                onMouseLeave={e => e.currentTarget.style.background = '#EAE5D8'}
                >
                   <Zap size={18} /> Request Quote
                </Link>
              </div>

              {/* Bullet Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px 32px', marginBottom: 64 }}>
                {data.bullets.map((bullet, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'rgba(45,90,39,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <bullet.icon size={20} color="#2D5A27" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--kraft-800)' }}>{bullet.label}</span>
                  </div>
                ))}
              </div>

               {/* Premium 3x2 Technical Specifications Grid */}
               <div className="anim-fade-up" style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 800, 
                    color: '#CC9966', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.2em' 
                  }}>
                    Tech Specs
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--kraft-100), transparent)' }} />
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(3, 1fr)', 
                  gap: 12
                }}>
                  {data.specs.map((spec, i) => (
                    <div 
                      key={spec.label} 
                      style={{ 
                        background: 'white', 
                        padding: '16px 14px', 
                        borderRadius: 'var(--radius-xl)', 
                        border: '1px solid var(--kraft-100)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 8,
                        animationDelay: `${i * 0.1}s`
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.06)';
                        e.currentTarget.style.borderColor = 'var(--kraft-200)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                        e.currentTarget.style.borderColor = 'var(--kraft-100)';
                      }}
                    >
                      <div style={{ 
                        width: 28, 
                        height: 28, 
                        borderRadius: '6px', 
                        background: 'rgba(45,90,39,0.04)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--eco-600)'
                      }}>
                        <spec.icon size={14} strokeWidth={2.5} />
                      </div>
                      
                      <div style={{ 
                        fontSize: 14, 
                        fontWeight: 700, 
                        color: 'var(--kraft-900)',
                        lineHeight: 1.2,
                        letterSpacing: '-0.01em'
                      }}>
                        {spec.value}
                      </div>
                      
                      <div style={{ 
                        fontSize: 9, 
                        fontWeight: 800, 
                        color: 'var(--kraft-400)', 
                        textTransform: 'uppercase', 
                        letterSpacing: '0.08em' 
                      }}>
                        {spec.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Experience Section ── */}
      <section className="section-padding" style={{ background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Gallery</div>
            <h2 className="section-title">The {data.title} Experience</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 32 }} className="gallery-grid">
            {data.gallery.map((item, i) => (
              <div key={i}>
                <div style={{ 
                  borderRadius: 'var(--radius-2xl)', 
                  overflow: 'hidden', 
                  aspectRatio: '1', 
                  background: 'var(--kraft-50)',
                  marginBottom: 20,
                  border: '1px solid var(--kraft-100)',
                  position: 'relative'
                }}>
                  <img 
                    src={item.image} 
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.63s var(--transition-main)'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <h4 style={{ fontSize: 18, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 4 }}>{item.title}</h4>
                <p style={{ fontSize: 15, color: 'var(--kraft-500)', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section className="section-padding" style={{ background: 'var(--kraft-50)' }}>
        <div className="container">
          <div style={{
            background: 'var(--kraft-950)',
            borderRadius: 'var(--radius-3xl)',
            padding: '80px 0px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at center, rgba(22,163,74,0.1) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: 24, position: 'relative' }}>
              Elevate Your Brand Today
            </h2>
            <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.6)', maxWidth: 600, margin: '0 auto 48px', position: 'relative' }}>
              Join hundreds of premium brands that trust Nirmalyam Krafts for their sustainable packaging needs.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', position: 'relative' }} className="cta-buttons">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
                background: 'var(--eco-500)',
                color: 'white',
                padding: '18px 40px',
                borderRadius: 'var(--radius-full)',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                Inquire Wholesale Pricing
              </a>
              <Link to="/contact" style={{
                padding: '18px 40px',
                borderRadius: 'var(--radius-full)',
                border: '1px solid rgba(255,255,255,0.2)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 700,
                fontSize: 16,
                transition: 'all 0.3s'
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                Book Consultation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes quoteFadeUp {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        @media (max-width: 991px) {
          .category-hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .gallery-grid { grid-template-columns: 1fr !important; }
          .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
          .cta-buttons > * { text-align: center !important; }
        }
      `}</style>
    </div>
  );
}
