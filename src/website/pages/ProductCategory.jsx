import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
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
    id: 'ecocraft',
    title: 'Ecocraft Collection',
    image: '/images/collection_ecocraft_vibrant.png',
    minOrder: '500 UNITS',
    color: '#4ade80',
    description: 'Our signature high-strength kraft bags combine industrial-grade durability with a refined, tactile aesthetic.',
    longDescription: 'Crafted from sustainably sourced FSC-certified fibers, these bags are designed to elevate your brand\'s presence while honoring the planet. Featuring premium twisted paper handles and reinforced bottoms.',
    bullets: [
      { label: 'FSC Certified', icon: CheckCircle2 },
      { label: 'Biodegradable', icon: Leaf },
      { label: 'Holds up to 12kg', icon: Zap },
      { label: 'Soy-based Inks', icon: Droplets }
    ],
    specs: [
      { label: 'Material', value: 'High-Tensile Kraft', icon: Layers },
      { label: 'Weight Range', icon: Weight, value: '100 - 140 GSM' },
      { label: 'Handle Types', icon: Settings, value: 'Twisted / Flat' },
      { label: 'Printing', value: 'Up to 6 Colors', icon: Printer },
      { label: 'Capacity', value: '3kg - 12kg', icon: Scale },
      { label: 'Texture', icon: ShieldCheck, value: 'Matte Fiber' }
    ],
    gallery: [
      { title: 'Vibrant Series', desc: 'Modern colorful branding', image: '/images/generated/ecocraft_gallery_1.png' },
      { title: 'Retail Excellence', desc: 'High-volume branded carry', image: '/images/generated/ecocraft_gallery_2.png' },
      { title: 'Sustainable Craft', desc: 'Eco-conscious perfection', image: '/images/generated/ecocraft_gallery_3.png' }
    ]
  },
  fnb: {
    id: 'fnb',
    title: 'F&B Gourmet Bags',
    image: '/images/collection_fnb_vibrant.png',
    minOrder: '1000 UNITS',
    color: '#f59e0b',
    description: 'Specialized grease-resistant and moisture-controlled packaging for the food and beverage industry.',
    longDescription: 'Developed for restaurateurs, our F&B line features food-grade barriers that resist oil and moisture without plastic laminates. Perfect for cloud kitchens and bakeries.',
    bullets: [
      { label: 'FDA Approved', icon: CheckCircle2 },
      { label: 'Grease Resistant', icon: Droplets },
      { label: 'Moisture Barrier', icon: Zap },
      { label: 'Eco-Ink Safe', icon: Leaf }
    ],
    specs: [
      { label: 'Material', value: 'Greaseproof Paper', icon: Layers },
      { label: 'Weight Range', value: '70 - 110 GSM', icon: Weight },
      { label: 'Features', value: 'Oil-Resistant', icon: Settings },
      { label: 'Certification', value: 'FDA Approved', icon: ShieldCheck },
      { label: 'Food Safe', value: 'PFAS-Free', icon: CheckCircle2 },
      { label: 'Min Order', value: '1,000 units', icon: Package }
    ],
    gallery: [
      { title: 'Gourmet Carry', desc: 'Premium restaurant solutions', image: '/images/generated/fnb_gallery_1.png' },
      { title: 'Pristine White collection', desc: 'Crisp & Clean finish', image: '/images/generated/fnb_gallery_2.png' },
      { title: 'Bakery Special', desc: 'Vibrant artisanal branding', image: '/images/generated/fnb_gallery_3.png' }
    ]
  },
  luxury: {
    id: 'luxury',
    title: 'Luxury Kraft Bags',
    image: '/images/collection_luxury_vibrant.png',
    minOrder: '200 UNITS',
    color: '#c09457',
    description: 'High-thickness boards and exquisite finishes that redefine paper packaging.',
    longDescription: 'Our Luxury collection represents the pinnacle of sustainable packaging. Heavyweight boards provide a rigid silhouette, hand-finished with cotton ribbon handles and custom foiling.',
    bullets: [
      { label: 'Extra Thick Board', icon: Crown },
      { label: 'Ribbon Handles', icon: Heart },
      { label: 'Foil Stamping', icon: Award },
      { label: 'Premium Finish', icon: CheckCircle2 }
    ],
    specs: [
      { label: 'Material', value: 'Premium Art Board', icon: Layers },
      { label: 'Weight Range', value: '200 - 350 GSM', icon: Weight },
      { label: 'Handles', value: 'Satin / Cotton', icon: Heart },
      { label: 'Finishing', value: 'UV / Gold Foil', icon: Award },
      { label: 'Refinement', value: 'Hand-Finished', icon: Settings },
      { label: 'Min Order', value: '200 units', icon: Package }
    ],
    gallery: [
      { title: 'Luxury Retail', desc: 'High-fashion unboxing', image: '/images/generated/luxury_gallery_1.png' },
      { title: 'Artisanal Finish', desc: 'Hand-crafted excellence', image: '/images/generated/luxury_gallery_2.png' },
      { title: 'Colorful Premium', desc: 'Signature luxury palette', image: '/images/generated/luxury_gallery_3.png' }
    ]
  },
  pouches: {
    id: 'pouches',
    title: 'Eco-Pouches',
    image: '/images/prod_pouches_paper.png',
    minOrder: '500 UNITS',
    color: '#1a4a2e',
    description: 'Modern stand-up pouches with a premium matte paper texture for dry goods.',
    longDescription: 'Our Eco-Pouches use a specialized paper-based laminate that provides a high-moisture barrier while maintaining a beautiful biological feel. Perfect for coffee, snacks, and nuts.',
    bullets: [
      { label: 'Resealable Zip', icon: Zap },
      { label: 'Stand-up Base', icon: CheckCircle2 },
      { label: 'High Barrier', icon: ShieldCheck },
      { label: 'Matte Texture', icon: Layers }
    ],
    specs: [
      { label: 'Material', value: 'Paper + Bio-Film', icon: Layers },
      { label: 'Closure', value: 'Press-to-Close', icon: Settings },
      { label: 'Barrier', value: 'Aroma-Proof', icon: ShieldCheck },
      { label: 'Capacity', value: '100g - 2kg', icon: Scale },
      { label: 'Certification', value: 'Sustainably Sourced', icon: Leaf },
      { label: 'Min Order', value: '500 units', icon: Package }
    ],
    gallery: [
      { title: 'Stand-up Pouch', desc: 'Retail-ready design', image: '/images/prod_pouches_paper.png' },
      { title: 'Organic Feel', desc: 'Natural matte finish', image: '/images/eco_pouches_paper_grid.png' },
      { title: 'Window Option', desc: 'Product visibility', image: '/images/prod_pouches_paper.png' }
    ]
  },
  'flat-handle': {
    id: 'flat-handle',
    title: 'Flat Handle Bags',
    image: '/images/prod_flat_paper.png',
    minOrder: '2000 UNITS',
    color: '#145c38',
    description: 'Sturdy, economical retail solutions with a visible natural paper fiber texture.',
    longDescription: 'The Flat Handle range is engineered for high-volume retail environments where strength and cost-efficiency are paramount. Features reinforced flat handles for maximum comfort.',
    bullets: [
      { label: 'Load Optimized', icon: Weight },
      { label: 'Natural Kraft', icon: Leaf },
      { label: 'Internal Reinforcement', icon: ShieldCheck },
      { label: 'Recyclable Handle', icon: CheckCircle2 }
    ],
    specs: [
      { label: 'Material', value: 'Heavy Virgin Kraft', icon: Layers },
      { label: 'Handle', value: 'Recycled Flat Paper', icon: Settings },
      { label: 'Load Test', value: 'Up to 10kg', icon: Scale },
      { label: 'Base', value: 'Block-Bottomed', icon: Package },
      { label: 'Finish', value: 'Natural Matte', icon: Zap },
      { label: 'Min Order', value: '2,000 units', icon: Package }
    ],
    gallery: [
      { title: 'Supermarket Carry', desc: 'High-volume solution', image: '/images/prod_flat_paper.png' },
      { title: 'Retail Primary', desc: 'Cost-effective packaging', image: '/images/flat_handle_bags_paper_grid.png' },
      { title: 'Bulk Capacity', desc: 'Engineered for strength', image: '/images/prod_flat_paper.png' }
    ]
  },
  industrial: {
    id: 'industrial',
    title: 'Industrial Kraft Rolls',
    image: '/images/prod_rolls_paper.png',
    minOrder: '5 UNITS',
    color: '#4a3728',
    description: 'Heavy-duty industrial rolls designed for maximum protection and shipping.',
    longDescription: 'Our industrial-grade kraft paper rolls are manufactured for superior tensile strength and puncture resistance. Ideal for inter-city shipping and bulk item protection.',
    bullets: [
      { label: 'Extra Duty', icon: ShieldCheck },
      { label: 'Puncture Proof', icon: Zap },
      { label: 'Moisture Safe', icon: Droplets },
      { label: '100% Recycled', icon: Leaf }
    ],
    specs: [
      { label: 'GSM Range', value: '120 - 240 GSM', icon: Weight },
      { label: 'Width', value: 'Up to 2 meters', icon: Scale },
      { label: 'Tensile Strength', value: 'Industrial Grade', icon: Zap },
      { label: 'Composition', value: 'Recycled Kraft', icon: Layers },
      { label: 'Application', value: 'Bulk Shipping', icon: Settings },
      { label: 'Min Order', value: '5 Large Rolls', icon: Package }
    ],
    gallery: [
      { title: 'Bulk Protection', desc: 'Secure industrial wrapping', image: '/images/industrial_rolls_paper_grid.png' },
      { title: 'High GSM Roll', desc: 'Superior tensile strength', image: '/images/prod_rolls_paper.png' },
      { title: 'Custom Length', desc: 'Tailored for logistics', image: '/images/prod_rolls_paper.png' }
    ]
  }
};

export default function ProductCategory() {
  const { categoryId } = useParams();
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const data = categoryData[categoryId];

  if (!data) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      Category Not Found
    </div>
  );

  const whatsappMessage = `Hi Nirmalyam Krafts, I'm interested in the ${data.title} collection. Could you please share the price list and sample details?`;
  const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kraft-50)' }}>
      {/* ── Fixed Quote Bar ── */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 12 : 32,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        width: isMobile ? '94%' : '90%',
        maxWidth: 720,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRadius: isMobile ? '20px' : '32px',
        padding: isMobile ? '10px 14px' : '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)',
        border: '1px solid rgba(255,255,255,0.5)',
        animation: 'quoteFadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 12 : 20 }}>
          <div style={{
            width: isMobile ? 44 : 60, 
            height: isMobile ? 44 : 60,
            borderRadius: '16px',
            overflow: 'hidden',
            background: 'white',
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}>
            <img src={data.image} alt="" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: data.color, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Min Order: {data.minOrder}</div>
            <div style={{ fontSize: isMobile ? 15 : 20, fontWeight: 800, color: 'var(--kraft-950)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{data.title}</div>
          </div>
        </div>
        <Link 
          to="/contact#contact-form"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            background: 'var(--kraft-950)',
            color: 'white',
            padding: isMobile ? '12px 20px' : '16px 32px',
            borderRadius: isMobile ? '14px' : '20px',
            fontWeight: 800,
            fontSize: isMobile ? 13 : 16,
            textDecoration: 'none',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            marginLeft: 12
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {isMobile ? 'Request Quote' : 'Request Wholesale Quote'} <ArrowRight size={18} />
        </Link>
      </div>

      {/* ── Main Content ── */}
      <div style={{ paddingTop: isMobile ? 100 : 120, paddingBottom: isMobile ? 60 : 100 }}>
        <div className="container">
          {/* Breadcrumbs */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            gap: 8, 
            fontSize: 11, 
            fontWeight: 700, 
            color: 'var(--kraft-600)', 
            marginBottom: isMobile ? 24 : 40,
            textTransform: 'uppercase',
            letterSpacing: '0.12em'
          }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>Home</Link>
            <ChevronRight size={12} strokeWidth={3} />
            <Link to="/products" style={{ color: 'inherit', textDecoration: 'none' }}>Products</Link>
            <ChevronRight size={12} strokeWidth={3} />
            <span style={{ color: 'var(--eco-600)' }}>{data.title}</span>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 0.8fr', 
            gap: isMobile ? 40 : 80, 
            alignItems: 'start' 
          }} className="category-hero-grid">
            {/* Image Section */}
            <div style={{ position: isMobile || isTablet ? 'relative' : 'sticky', top: 120 }}>
              <div style={{
                borderRadius: isMobile ? '32px' : '48px',
                overflow: 'hidden',
                aspectRatio: isMobile ? '4/3' : '1',
                boxShadow: '0 40px 80px -20px rgba(58, 36, 16, 0.15)',
                background: 'white',
                border: '1px solid var(--kraft-100)',
                padding: isMobile ? 24 : 60,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative'
              }}>
                {/* Decorative Pattern behind bag */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: 'radial-gradient(var(--kraft-100) 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                  opacity: 0.3
                }} />
                <img src={data.image} alt={data.title} style={{ width: '100%', height: '100%', objectFit: 'contain', position: 'relative', zIndex: 1 }} />
              </div>
            </div>

            {/* Product Details Section */}
            <div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
                <div style={{ background: '#CC9966', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>
                  PREMIUM QUALITY
                </div>
                <div style={{ background: '#1F4013', padding: '6px 14px', borderRadius: 'var(--radius-full)', color: 'white', fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>
                  SUSTAINABLE CHOICE
                </div>
              </div>
              
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', color: 'var(--kraft-950)', marginBottom: isMobile ? 16 : 24, lineHeight: 1.25, fontWeight: 800 }}>
                {data.title}
              </h1>
              
              <p style={{ fontSize: isMobile ? 16 : 19, color: 'var(--kraft-600)', lineHeight: 1.7, marginBottom: 40 }}>
                {data.description} {data.longDescription}
              </p>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexWrap: isMobile ? 'wrap' : 'nowrap', gap: 16, marginBottom: 48 }}>
                <Link to="/contact#contact-form" style={{ 
                  flex: 1.5, 
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '18px 24px' : '22px 32px', 
                  background: 'var(--kraft-950)', 
                  color: 'white',
                  borderRadius: '20px',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: 12,
                  textDecoration: 'none',
                  fontWeight: 800,
                  fontSize: isMobile ? 16 : 18,
                  transition: 'all 0.3s',
                  boxShadow: '0 20px 40px -10px rgba(0,0,0,0.2)'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#000'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--kraft-950)'}
                >
                   Get Wholesale Price <ArrowRight size={20} />
                </Link>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{ 
                  flex: 1, 
                  minWidth: isMobile ? '100%' : 'auto',
                  padding: isMobile ? '18px 24px' : '22px 32px', 
                  background: 'white', 
                  color: 'var(--kraft-950)', 
                  borderRadius: '20px', 
                  textDecoration: 'none', 
                  fontWeight: 800,
                  fontSize: isMobile ? 16 : 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 12,
                  border: '1px solid var(--kraft-200)',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--kraft-50)'}
                onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                   <Phone size={18} fill="currentColor" /> WhatsApp
                </a>
              </div>

              {/* Bullet Grid */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: isMobile ? 12 : '20px 24px', 
                marginBottom: isMobile ? 40 : 64 
              }}>
                {data.bullets.map((bullet, i) => (
                  <div key={i} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: isMobile ? 8 : 14,
                    background: 'rgba(255,255,255,0.5)',
                    padding: isMobile ? '10px 10px' : '12px 16px',
                    borderRadius: '16px',
                    border: '1px solid rgba(0,0,0,0.03)'
                  }}>
                    <div style={{ 
                      width: 36, 
                      height: 36, 
                      borderRadius: '12px', 
                      background: 'rgba(45,90,39,0.08)', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <bullet.icon size={18} color="#2D5A27" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--kraft-800)', lineHeight: 1.2 }}>{bullet.label}</span>
                  </div>
                ))}
              </div>

               {/* Premium 3x2 Technical Specifications Grid */}
               <div className="anim-fade-up" style={{ marginTop: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                  <span style={{ 
                    fontSize: 12, 
                    fontWeight: 800, 
                    color: '#CC9966', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.24em' 
                  }}>
                    Technical Specifications
                  </span>
                  <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, var(--kraft-200), transparent)' }} />
                </div>
                
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', 
                  gap: isMobile ? 12 : 16
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
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: isMobile ? 12 : 32 
          }} className="gallery-grid">
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
                    className="gallery-img"
                  />
                  {/* Hover Overlay */}
                  <div className="gallery-overlay" style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0,
                    transition: 'opacity 0.3s ease',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Link to="/contact#contact-form" style={{
                      padding: '12px 24px',
                      background: 'white',
                      color: 'var(--kraft-950)',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: 'none',
                      transform: 'translateY(20px)',
                      transition: 'transform 0.3s ease'
                    }}>
                      Get a Quote
                    </Link>
                  </div>
                </div>
                <h4 style={{ fontSize: isMobile ? 12 : 18, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 4, textAlign: 'center' }}>{item.title}</h4>
                <p style={{ fontSize: isMobile ? 10 : 15, color: 'var(--kraft-500)', lineHeight: 1.5, textAlign: 'center', display: isMobile ? 'none' : 'block' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Bottom ── */}
      <section className="section-padding" style={{ background: 'var(--kraft-50)', paddingTop: 0 }}>
        <div className="container">
          <div style={{
            background: 'var(--kraft-950)',
            borderRadius: isMobile ? '32px' : '48px',
            padding: isMobile ? '64px 24px' : '100px 48px',
            textAlign: 'center',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.2)'
          }}>
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'radial-gradient(circle at center, rgba(34,197,94,0.15) 0%, transparent 70%)',
              pointerEvents: 'none'
            }} />
            
            <Leaf size={isMobile ? 48 : 64} color="var(--eco-500)" style={{ marginBottom: 32, opacity: 0.8 }} />

            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 5vw, 56px)', marginBottom: 24, position: 'relative', lineHeight: 1.1 }}>
              Elevate Your Packaging<br/>Experience Today
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 20, color: 'rgba(255,255,255,0.6)', maxWidth: 700, margin: '0 auto 48px', position: 'relative', lineHeight: 1.6 }}>
              Join hundreds of high-end brands that trust Nirmalyam Krafts for their premium, eco-luxury sustainable packaging soulutions.
            </p>
            <div style={{ 
              display: 'flex', 
              flexDirection: isMobile ? 'column' : 'row',
              gap: 16, 
              justifyContent: 'center', 
              position: 'relative',
              maxWidth: 500,
              margin: '0 auto'
            }} className="cta-buttons">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" style={{
                background: 'var(--eco-600)',
                color: 'white',
                padding: '18px 32px',
                borderRadius: '20px',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 16,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <Phone size={20} fill="white" /> Wholesale Inquiry
              </a>
              <Link to="/contact#contact-form" style={{
                padding: '18px 32px',
                borderRadius: '20px',
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: 'white',
                textDecoration: 'none',
                fontWeight: 800,
                fontSize: 16,
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.12)';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
              >
                <Zap size={20} /> Request Custom Quote
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
          .cta-buttons { flex-direction: column !important; align-items: stretch !important; }
          .cta-buttons > * { text-align: center !important; }
        }
        .gallery-grid div:hover .gallery-overlay {
          opacity: 1 !important;
        }
        .gallery-grid div:hover .gallery-overlay a {
          transform: translateY(0) !important;
        }
        .gallery-grid div:hover .gallery-img {
          transform: scale(1.1) !important;
        }
      `}</style>
    </div>
  );
}
