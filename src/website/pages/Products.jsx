import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Check, Ruler, Layers, Tag } from 'lucide-react';

/* ── Product Data ── */
const ecoCraftVariants = [
  {
    name: 'Apparel & Textiles',
    specs: ['Size: 12" × 16" × 4"', 'Handles: Twisted Paper', 'Print: Dual Tone Offset'],
    moq: '500 units',
    color: 'var(--eco-600)',
  },
  {
    name: 'Cosmetics & Small Retail',
    specs: ['Size: 8" × 10" × 3"', 'Handles: Die-Cut', 'Print: Single Color Base'],
    moq: '500 units',
    color: 'var(--eco-600)',
  },
  {
    name: 'Groceries & Heavy Duty',
    specs: ['Size: 14" × 14" × 8"', 'Handles: Flat Paper Tape', 'Print: Flexo Logo'],
    moq: '500 units',
    color: 'var(--eco-600)',
  },
];

const fnbVariants = [
  { name: 'Café Takeaway Bags', specs: ['Grease-resistant lining', 'Folded top closure', 'Recycled kraft base'], moq: '500 units' },
  { name: 'Bakery Boxes Bags', specs: ['Oil-proof inner coating', 'Custom print outside', 'Reinforced base fold'], moq: '500 units' },
  { name: 'Cloud Kitchen Mailers', specs: ['Insulated inner paper', 'Tamper-evident seal', 'Branding on all sides'], moq: '500 units' },
];

const luxuryVariants = [
  { name: 'Boutique Gift Bags', specs: ['300 GSM ivory board', 'Ribbon handle', 'UV spot coating'], moq: '250 units', premium: true },
  { name: 'Jewelry Packaging', specs: ['Embossed logo option', 'Magnetic flap closure', 'Velvet inner lining'], moq: '100 units', premium: true },
  { name: 'Haute Couture Bags', specs: ['Horizontal orientation', 'Gold foil stamping', '400 GSM matte board'], moq: '250 units', premium: true },
];

/* ── Tab component ── */
function ProductTab({ id, title, icon: Icon, color, description, variants, materialNote }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  return (
    <div id={id} style={{ scrollMarginTop: 100 }}>
      {/* Section hero band */}
      <div style={{
        background: `linear-gradient(135deg, var(--kraft-950) 0%, var(--kraft-800) 100%)`,
        borderRadius: 'var(--radius-xl)',
        padding: '56px 48px',
        marginBottom: 40,
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${color}33`,
      }}>
        <div style={{
          position: 'absolute', top: -40, right: -40,
          width: 200, height: 200,
          borderRadius: '50%',
          background: `${color}10`,
        }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 56, height: 56,
              borderRadius: 14,
              background: `${color}20`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `1px solid ${color}40`,
            }}>
              <Icon size={24} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: color, fontWeight: 700, marginBottom: 4 }}>
                Product Collection
              </div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'white', fontWeight: 600 }}>{title}</h2>
            </div>
          </div>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', maxWidth: 600, lineHeight: 1.65 }}>{description}</p>
        </div>
      </div>

      {/* Variant cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24, marginBottom: 16 }}>
        {variants.map((v, i) => (
          <div key={v.name}
            style={{
              background: 'white',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              border: `1.5px solid ${hoveredIdx === i ? color : 'var(--kraft-100)'}`,
              transition: 'all 0.35s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              transform: hoveredIdx === i ? 'translateY(-6px)' : 'none',
              boxShadow: hoveredIdx === i ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
              cursor: 'default',
            }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {/* Visual placeholder */}
            <div style={{
              height: 160,
              background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: `1px solid ${color}15`,
            }}>
              <Package size={56} color={color} strokeWidth={1.2} style={{ opacity: 0.7 }} />
            </div>

            {/* Content */}
            <div style={{ padding: '24px 28px' }}>
              {v.premium && (
                <span style={{
                  display: 'inline-block',
                  padding: '3px 10px',
                  background: 'linear-gradient(135deg, var(--gold-500), var(--kraft-500))',
                  color: 'white',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  marginBottom: 8,
                }}>Premium</span>
              )}
              <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--kraft-900)', marginBottom: 16 }}>{v.name}</h3>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                {v.specs.map(s => (
                  <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--kraft-600)' }}>
                    <Check size={14} color="var(--eco-500)" />
                    {s}
                  </li>
                ))}
              </ul>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid var(--kraft-100)',
              }}>
                <div>
                  <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--kraft-400)' }}>Min. Order</div>
                  <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--kraft-800)' }}>{v.moq}</div>
                </div>
                <Link to="/contact" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 18px',
                  background: `${color}15`,
                  color: color,
                  borderRadius: 'var(--radius-full)',
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: `1px solid ${color}30`,
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = color; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = `${color}15`; e.currentTarget.style.color = color; }}
                >
                  Quote <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Material note */}
      {materialNote && (
        <div style={{
          background: 'var(--kraft-50)',
          border: '1px solid var(--kraft-200)',
          borderRadius: 'var(--radius-md)',
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14,
          marginTop: 16,
        }}>
          <Layers size={18} color="var(--kraft-500)" style={{ marginTop: 2, flexShrink: 0 }} />
          <p style={{ fontSize: 14, color: 'var(--kraft-600)', lineHeight: 1.6 }}>{materialNote}</p>
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const tabs = ['ecocraft', 'fnb', 'luxury'];
  const [activeTab, setActiveTab] = useState('ecocraft');

  const tabMeta = {
    ecocraft: { label: 'Ecocraft Bags', color: 'var(--eco-600)' },
    fnb: { label: 'F&B Gourmet', color: '#f59e0b' },
    luxury: { label: 'Luxury Bags', color: 'var(--gold-500)' },
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--kraft-50)', paddingTop: 80 }}>

      {/* Page Hero */}
      <div className="page-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ color: 'var(--eco-400)' }}>Our Collections</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 68px)',
            color: 'white',
            fontWeight: 600,
            marginBottom: 18,
          }}>
            Premium Paper Packaging
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.7)', maxWidth: 560, lineHeight: 1.65 }}>
            Discover our collection of premium, sustainable paper packaging crafted
            with precision and care for the planet.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            {[
              { icon: Tag, text: 'FSC Certified' },
              { icon: Ruler, text: 'Custom Sizes' },
              { icon: Package, text: 'Low MOQ 500 units' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-full)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: 13,
                color: 'rgba(255,255,255,0.85)',
              }}>
                <Icon size={14} /> {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky tab nav */}
      <div style={{
        position: 'sticky',
        top: 70,
        zIndex: 50,
        background: 'rgba(253,249,243,0.96)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--kraft-200)',
        padding: '0 24px',
      }}>
        <div className="container" style={{ display: 'flex', gap: 4, padding: '8px 0' }}>
          {tabs.map(t => (
            <button key={t} onClick={() => {
              setActiveTab(t);
              document.getElementById(t)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} style={{
              padding: '10px 24px',
              borderRadius: 'var(--radius-full)',
              border: 'none',
              fontFamily: "'Inter', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s',
              background: activeTab === t ? tabMeta[t].color : 'transparent',
              color: activeTab === t ? 'white' : 'var(--kraft-700)',
            }}>
              {tabMeta[t].label}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="container" style={{ padding: '64px 24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 80 }}>

          <ProductTab
            id="ecocraft"
            title="Ecocraft Bags"
            icon={Package}
            color="var(--eco-600)"
            description="Durable, highly-customizable packaging engineered for daily retail. An economical yet premium alternative to standard polythene bags."
            variants={ecoCraftVariants}
            materialNote="Our standard 120 GSM kraft provides the perfect balance of flexibility and tear-resistance. Base material: Virgin Kraft Paper | Handles: Twisted Paper Cord | Adhesive: Natural Starch Glue."
          />

          <ProductTab
            id="fnb"
            title="F&B Gourmet Bags"
            icon={Package}
            color="#f59e0b"
            description="Engineered for temperature resilience, stackability, and leak-protection. The preferred choice for elite bakeries and cloud kitchens."
            variants={fnbVariants}
            materialNote="All F&B bags feature a grease-resistant inner coating and are certified food-safe. Perfect for items with moisture content up to 35g/m² vapor resistance standards."
          />

          <ProductTab
            id="luxury"
            title="Luxury Bags"
            icon={Package}
            color="var(--gold-500)"
            description="High-grammage boards, exquisite finishes, and textured ribbons. Unrivaled unboxing elegance for jewelry, electronics, and haute couture."
            variants={luxuryVariants}
            materialNote="Luxury line uses 250–400 GSM ivory board with UV spot and foil stamping options. All ribbon handles are satin-finish. Custom Pantone color matching available."
          />
        </div>
      </div>

      {/* Bottom CTA */}
      <section style={{
        background: 'white',
        borderTop: '1px solid var(--kraft-100)',
        padding: '64px 24px',
        textAlign: 'center',
      }}>
        <div className="container">
          <h2 className="section-title" style={{ fontSize: 36, marginBottom: 14 }}>All orders are quoted custom based on volume.</h2>
          <p className="section-subtitle" style={{ margin: '0 auto 36px' }}>
            No pricing displayed — get a personalised quote from our team. We usually respond within 1 business hour.
          </p>
          <Link to="/contact" className="btn-primary" style={{ padding: '16px 44px', fontSize: 15 }}>
            <span>Request a Custom Quote</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
