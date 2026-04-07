import { Link } from 'react-router-dom';
import { Leaf, TreePine, Droplets, Truck, Recycle, Heart, Globe, Users, Award, ArrowRight, Check } from 'lucide-react';

/* ── Values ── */
const values = [
  { icon: Leaf, title: 'Artisanal Craft', desc: 'Each fold and crease is meticulously inspected by our artisans, ensuring a flawless finish for high-end retail.' },
  { icon: Globe, title: 'Earth-First Ethos', desc: 'Sourcing FSC-certified papers, soy-based inks, and organic adhesives to maintain a zero-toxicity production loop.' },
  { icon: Users, title: 'Partner Centric', desc: 'We don\'t just supply bags; we partner with your brand to conceptualize structural packaging that elevates your unboxing experience.' },
];

/* ── Green Print steps ── */
const greenPrint = [
  { icon: TreePine, title: 'Ethical Sourcing', desc: 'We source kraft paper from managed forests where for every tree harvested, three are planted.' },
  { icon: Droplets, title: 'Non-Toxic Printing', desc: 'Our presses run exclusively on soy and water-based inks that contain zero heavy metals or harmful VOCs.' },
  { icon: Truck, title: 'Efficient Transit', desc: 'Bags are packed in optimised kraft cartons, eliminating transit plastics completely while reducing volumetric weight.' },
  { icon: Recycle, title: '100% Compostable', desc: 'Once the bag\'s lifespan concludes, it returns safely to the earth within 90 days without leaving microplastics.' },
];

/* ── Quality pillars ── */
const qualityPillars = [
  { icon: Award, title: 'Consistent Quality', desc: 'ISO-grade quality checks from paper thickness tolerance to handle tensile strength.' },
  { icon: Heart, title: 'Precision Branding', desc: 'Your Pantone colors are replicated with minimal variance across our automated die-cut offset machines.' },
  { icon: Leaf, title: 'Reliable Timelines', desc: 'Our robust production pipeline ensures you receive your packaging exactly when promised.' },
  { icon: Globe, title: 'Wholesale Economics', desc: 'Direct manufacturer pricing means you bypass middleman margins and enjoy volume discounts immediately.' },
];

export default function About() {
  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>

      {/* ── Page Hero ── */}
      <div className="page-hero" style={{ 
        backgroundImage: 'url(/images/generated/about_hero_wood.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Dark overlay for readability */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(26, 18, 8, 0.9) 0%, rgba(26, 18, 8, 0.7) 45%, rgba(26, 18, 8, 0.4) 100%)',
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
              <div className="section-label" style={{ color: 'var(--eco-400)', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>About Nirmalyam Krafts</div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(36px, 6vw, 64px)',
                color: 'white',
                fontWeight: 600,
                marginBottom: 20,
                lineHeight: 1.1,
                textShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                Rooted in Tradition,<br />
                <span style={{ color: 'var(--kraft-300)' }}>Driven by Innovation</span>
              </h1>
              <p style={{ 
                fontSize: 'clamp(16px, 2vw, 19px)', 
                color: 'rgba(255,255,255,0.9)', 
                maxWidth: 580, 
                lineHeight: 1.7,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)' 
              }}>
                We are pioneers in crafting premium, sustainable packaging solutions. 
                We believe true luxury does not harm the environment, but preserves it for the next generation.
              </p>
            </div>

            {/* Product Hero Image */}
            <div className="hidden lg:block anim-float" style={{ position: 'relative', perspective: '1000px' }}>
              <div style={{
                position: 'absolute',
                inset: '-10%',
                background: 'radial-gradient(circle, rgba(192, 148, 87, 0.15) 0%, transparent 70%)',
                filter: 'blur(30px)',
                zIndex: -1
              }} />
              <img 
                src="/images/generated/about_hero_bags.png" 
                alt="Premium Sustainable Packaging"
                className="mission-image-glow"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transform: 'rotate(-1deg)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Mission ── */}
      <section className="section-padding nature-section" style={{ background: 'var(--kraft-50)' }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 72, alignItems: 'center' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 48, alignItems: 'center' }}>
              {/* Mission Image with Animation */}
              <div className="animate-mission-float hidden lg:block" style={{ 
                position: 'relative', 
                width: 320,
                borderRadius: 'var(--radius-xl)',
                flexShrink: 0
              }}>
                <div className="mission-image-glow" />
                <img 
                  src="/images/generated/about_mission_bag_dynamic_1775488029249.png" 
                  alt="Sustainable Kraft Bag"
                  style={{ 
                    width: '100%', 
                    borderRadius: 'var(--radius-xl)', 
                    boxShadow: '0 30px 60px -12px rgba(62, 57, 46, 0.2)',
                    position: 'relative',
                    zIndex: 1,
                    border: '1px solid rgba(255,255,255,0.4)'
                  }} 
                />
                <div className="animate-leaf-float" style={{ position: 'absolute', top: -30, right: -20, zIndex: 2, opacity: 0.8 }}>
                  <div style={{ width: 60, height: 60, background: 'var(--eco-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)', border: '1px solid var(--eco-100)' }}>
                    <Leaf size={28} color="var(--eco-600)" fill="rgba(22,163,74,0.1)" />
                  </div>
                </div>
              </div>

              <div>
                <div className="section-label">Our Mission</div>
                <h2 className="section-title">Crafting a Plastic-Free Tomorrow</h2>
                <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.75, marginBottom: 28 }}>
                  Nirmalyam Krafts began with a simple yet powerful mission: to prove that high-end commerce
                  doesn't need to cost the earth. We've spent years perfecting the balance between artisanal
                  quality and industrial scalability.
                </p>
                <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.75, marginBottom: 36 }}>
                  Today, we stand as a beacon for sustainable retail, helping thousands of brands transition
                  from plastic to premium paper packaging without compromising on their brand's visual identity.
                </p>
                <Link to="/contact" className="btn-primary">
                  <span>Partner With Us</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>

            {/* Values cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {values.map(({ icon: Icon, title, desc }) => (
                <div key={title} style={{
                  display: 'flex',
                  gap: 20,
                  background: 'white',
                  borderRadius: 'var(--radius-lg)',
                  padding: '24px 28px',
                  border: '1px solid var(--kraft-100)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                >
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 12,
                    background: 'rgba(22,163,74,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={20} color="var(--eco-600)" />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: 16, color: 'var(--kraft-900)', marginBottom: 6 }}>{title}</h4>
                    <p style={{ fontSize: 14, color: 'var(--kraft-500)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Green Print (Sustainability) ── */}
      <section className="section-padding nature-section" id="sustainability" style={{ background: 'var(--kraft-50)' }}>
        <div className="nature-layer-wood" style={{ opacity: 0.05 }} />
        <div className="nature-layer-leaf" style={{ opacity: 0.02 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Our Green Print</div>
            <h2 className="section-title">Transparency in Every Fiber</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              Discover how our manufacturing process gives back to nature at every step.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 28 }}>
            {greenPrint.map(({ icon: Icon, title, desc }, i) => (
              <div key={title} style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                padding: 32,
                border: '1px solid var(--kraft-100)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--eco-500)';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--kraft-100)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: -16, right: -16,
                  width: 72, height: 72,
                  borderRadius: '50%',
                  background: 'rgba(22,163,74,0.06)',
                }} />
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: 'rgba(22,163,74,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <Icon size={22} color="var(--eco-600)" />
                </div>
                <div style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: 'var(--eco-600)',
                  marginBottom: 8,
                }}>
                  Step {i + 1}
                </div>
                <h3 style={{ fontSize: 19, fontWeight: 600, color: 'var(--kraft-900)', marginBottom: 12 }}>{title}</h3>
                <p style={{ fontSize: 14, color: 'var(--kraft-500)', lineHeight: 1.65 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quality ── */}
      <section className="section-padding nature-section" style={{
        background: 'linear-gradient(135deg, var(--kraft-100) 0%, var(--kraft-50) 100%)',
      }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-label">Standards</div>
            <h2 className="section-title">Consistent Quality</h2>
            <p className="section-subtitle" style={{ margin: '0 auto' }}>
              We adhere to stringent ISO-grade quality checks ensuring every bag performs flawlessly.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {qualityPillars.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex',
                gap: 16,
                background: 'white',
                borderRadius: 'var(--radius-md)',
                padding: '24px 24px',
                border: '1px solid var(--kraft-100)',
              }}>
                <Check size={20} color="var(--eco-500)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 15, color: 'var(--kraft-900)', marginBottom: 6 }}>{title}</h4>
                  <p style={{ fontSize: 13, color: 'var(--kraft-500)', lineHeight: 1.6 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="nature-section" style={{
        background: 'linear-gradient(135deg, var(--eco-800), var(--eco-700))',
        padding: '72px 0px',
        textAlign: 'center',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/tree-texture.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15,
          mixBlendMode: 'overlay',
          pointerEvents: 'none',
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <Leaf size={40} color="white" style={{ marginBottom: 20, opacity: 0.7 }} />
          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(28px, 4vw, 48px)',
            color: 'white',
            marginBottom: 14,
          }}>
            Ready to Go Plastic-Free?
          </h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.8)', marginBottom: 36, maxWidth: 500, margin: '0 auto 36px' }}>
            Join 12,000+ brands that trust Nirmalyam for sustainable, premium packaging.
          </p>
          <Link to="/contact" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '16px 44px',
            background: 'white',
            color: 'var(--eco-700)',
            borderRadius: 'var(--radius-full)',
            fontWeight: 700,
            fontSize: 15,
            textDecoration: 'none',
            transition: 'all 0.3s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            Start Your Journey <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
