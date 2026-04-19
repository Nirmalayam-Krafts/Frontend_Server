import { Link } from 'react-router-dom';
import { Leaf, TreePine, Droplets, Truck, Recycle, Check, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

/* ── Green Print steps ── */
const greenPrint = [
  { icon: TreePine, title: 'Ethical Sourcing', desc: 'We source kraft paper from managed forests where for every tree harvested, three are planted.', image: '/images/generated/managed_forest.png' },
  { icon: Droplets, title: 'Non-Toxic Printing', desc: 'Our presses run exclusively on soy and water-based inks that contain zero heavy metals or harmful VOCs.', image: '/images/generated/eco_inks.png' },
  { icon: Truck, title: 'Efficient Transit', desc: 'Bags are packed in optimised kraft cartons, eliminating transit plastics completely while reducing volumetric weight.', image: '/images/generated/step_efficient_transit_1775638398608.png' },
  { icon: Recycle, title: '100% Compostable', desc: 'Once the bag\'s lifespan concludes, it returns safely to the earth within 90 days without leaving microplastics.', image: '/images/generated/step_compostable_1775638415138.png' },
];

/* ── Laws & Benefits ── */
const legalLaws = [
  { title: 'Plastic Waste Management (2022)', desc: 'Strict ban on single-use plastics in India, mandating shifts to biodegradable alternatives like paper.' },
  { title: 'EPR Compliance', desc: 'Extended Producer Responsibility ensures brands take responsibility for the lifecycle of their packaging.' },
  { title: 'Green Procurement Policy', desc: 'Government-backed mandates for corporate sectors to adopt sustainable and eco-friendly packaging.' }
];

const paperBenefits = [
  { title: '90 Day Biodegradation', desc: 'Breaks down naturally without leaving microplastics, returning nutrients to the soil.' },
  { icon: Recycle, title: 'Infinite Recyclability', desc: 'Paper fibers can be recycled up to 7 times, making it a circular economy champion.' },
  { title: 'Renewable Resource', desc: 'Sourced from FSC forests, ensuring a net-positive impact on global tree cover.' },
  { title: 'Premium Branding', desc: 'Offers a tactile, luxurious feel that plastic simply cannot replicate.' }
];

/* ── Success Stories ── */
const caseStudies = [
  {
    client: 'Boutique Bloom',
    transformation: '100% Plastic to Paper Transition',
    result: '15% increase in premium brand perception and 2 tons of plastic eliminated annually.',
    features: ['Enhanced Customer Unboxing', 'Sustainable Luxury Branding', 'Zero-Plastic Packaging'],
    image: '/images/generated/colorful_bags_branded_v2.png'
  },
  {
    client: 'Urban Organics',
    transformation: 'Eco-Friendly Fulfillment',
    result: 'Reduced logistical carbon footprint by 22% through optimized kraft carton transit.',
    features: ['Reduced Volumetric Weight', 'Biodegradable Fillers', 'Circular Supply Chain'],
    image: '/images/generated/case_study_2.png'
  }
];

export default function Sustainability() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, background: 'var(--kraft-50)' }}>
      {/* ── Page Hero ── */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/forest_hero.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '450px' : isTablet ? '500px' : '650px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '80px var(--container-gutter) 60px' : '100px var(--container-gutter)'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile 
            ? 'linear-gradient(to bottom, rgba(2, 28, 13, 0.95) 0%, rgba(2, 28, 13, 0.7) 60%, transparent 100%)'
            : 'linear-gradient(to right, rgba(2, 28, 13, 0.98) 0%, rgba(2, 28, 13, 0.75) 50%, transparent 100%)',
          zIndex: 0
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className="anim-fade-up" style={{ textAlign: isMobile || isTablet ? 'center' : 'left' }}>
            <div className="eco-badge" style={{ 
              marginBottom: 24, 
              background: 'rgba(74, 222, 128, 0.1)', 
              color: 'var(--eco-400)', 
              borderColor: 'rgba(74, 222, 128, 0.2)',
              margin: isMobile || isTablet ? '0 auto 24px' : '0 0 24px'
            }}>
              Our Green Commitment
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(42px, 8vw, 84px)',
              color: 'white',
              fontWeight: 600,
              marginBottom: 32,
              lineHeight: 1.05
            }}>
              Sustainability in <br />
              <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, var(--eco-400), var(--eco-600))' }}>Every Fiber</span>
            </h1>
            <p style={{
              fontSize: isMobile ? '18px' : '22px',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 720,
              lineHeight: 1.8,
              margin: isMobile || isTablet ? '0 auto' : '0'
            }}>
              {isMobile ? "Discover how our 'Green Print' is reshaping the future of packaging through circular resource management." : 
              "We don't just make bags; we engineer environmental solutions. Discover how our 'Green Print' is reshaping the future of packaging through circular resource management."}
            </p>
          </div>
        </div>
      </div>

      <div style={{ height: 40 }} />

      {/* ── SECTION: THE PAPER ADVANTAGE (BENEFITS) ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-50)', 
        position: 'relative',
        padding: isMobile ? '100px var(--container-gutter)' : '140px var(--container-gutter)',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div className="nature-layer-leaf" style={{ opacity: 0.05 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 64 : 100 }}>
            <div className="section-label">Proven Impact</div>
            <h2 className="section-title" style={{ fontSize: isMobile ? '36px' : '56px', marginBottom: 24 }}>The Paper Advantage</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: isMobile ? '18px' : '20px', maxWidth: 800 }}>
              Why shifting to high-grade kraft paper is the single most effective brand move for the planet.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
            gap: 24 
          }}>
            {paperBenefits.map((benefit, idx) => (
              <div key={idx} className="glass-card" style={{ 
                padding: '48px 32px', 
                border: '1px solid var(--kraft-100)',
                background: 'white',
                boxShadow: 'var(--shadow-lg)',
                transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                textAlign: 'center',
                borderRadius: 'var(--radius-2xl)'
              }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-12px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-2xl)';
                  e.currentTarget.style.borderColor = 'var(--eco-200)';
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  e.currentTarget.style.borderColor = 'var(--kraft-100)';
                }
              }}
              >
                <div style={{ 
                  width: 64, height: 64, 
                  background: 'var(--eco-50)', 
                  borderRadius: '16px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 24,
                  margin: '0 auto 24px'
                }}>
                  {benefit.icon ? <benefit.icon size={30} color="var(--eco-600)" /> : <Leaf size={30} color="var(--eco-600)" />}
                </div>
                <h4 style={{ fontSize: 22, fontWeight: 800, color: 'var(--kraft-950)', marginBottom: 16 }}>{benefit.title}</h4>
                <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.7 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 40 }} />

      {/* ── SECTION: SUSTAINABILITY (GREEN PRINT) ── */}
      <section className="section-padding nature-section" id="green-print" style={{ 
        background: 'var(--eco-950)', 
        color: 'white',
        padding: isMobile ? '100px 0' : '160px 0',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div className="nature-layer-wood" style={{ opacity: 0.06 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 64 : 100, padding: '0 var(--container-gutter)' }}>
            <div className="section-label" style={{ color: 'var(--eco-400)' }}>Engineering Purity</div>
            <h2 className="section-title" style={{ color: 'white', fontSize: isMobile ? '36px' : '56px', marginBottom: 24 }}>The Green Print</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto', fontSize: isMobile ? '18px' : '22px' }}>
              Full lifecycle transparency. From managed forests to fertile soil.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
            gap: 32,
            padding: isMobile ? '0 var(--container-gutter)' : '0 40px'
          }}>
            {greenPrint.map(({ icon: Icon, title, desc, image }, i) => (
              <div key={title} className="anim-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-2xl)',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.4s ease'
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ height: isMobile ? 180 : 280, overflow: 'hidden' }}>
                    <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  </div>
                  <div style={{ padding: '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 44, height: 44, background: 'rgba(74, 222, 128, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Icon size={22} color="var(--eco-400)" />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--eco-400)', letterSpacing: '0.15em' }}>STEP 0{i + 1}</span>
                    </div>
                    <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12, color: 'white' }}>{title}</h3>
                    <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 40 }} />

      {/* ── SECTION: LAWS & COMPLIANCE ── */}
      <section className="section-padding" style={{ 
        background: 'white',
        padding: isMobile ? '100px var(--container-gutter)' : '160px var(--container-gutter)',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 60 : 120, 
            alignItems: 'center', 
            textAlign: isMobile || isTablet ? 'center' : 'left' 
          }}>
            <div className="anim-fade-up">
              <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Legal Readiness</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? '36px' : '56px', marginBottom: 28 }}>The Path to <br/>Plastic-Free</h2>
              <p className="section-subtitle" style={{ marginBottom: 48, fontSize: '20px', margin: isMobile || isTablet ? '0 auto 48px' : '0 0 48px' }}>
                Environmental regulations are evolving rapidly. We partner with brands to ensure 100% compliance with local and global mandates.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                {legalLaws.map((law, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: 24, textAlign: 'left' }}>
                    <div style={{ 
                      width: 52, height: 52, flexShrink: 0,
                      background: 'var(--eco-50)', borderRadius: '14px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={26} color="var(--eco-600)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 22, fontWeight: 800, color: 'var(--kraft-950)', marginBottom: 8 }}>{law.title}</h4>
                      <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.7 }}>{law.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="anim-fade-up-slow" style={{ order: isMobile || isTablet ? -1 : 1 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-20px',
                  background: 'var(--eco-50)',
                  borderRadius: 'var(--radius-3xl)',
                  zIndex: -1
                }} />
                <img src="/images/generated/laws_eco.png" alt="Eco Laws" style={{ width: '100%', borderRadius: 'var(--radius-2xl)', boxShadow: 'var(--shadow-2xl)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 40 }} />

      {/* ── SECTION: SUCCESS STORIES ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-950)', 
        color: 'white',
        padding: isMobile ? '100px var(--container-gutter)' : '160px 0',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 64 : 100, padding: '0 var(--container-gutter)' }}>
            <div className="section-label" style={{ color: 'var(--eco-400)' }}>Proof of Concept</div>
            <h2 className="section-title" style={{ color: 'white', fontSize: isMobile ? '40px' : '64px', marginBottom: 24 }}>Success Stories</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto', fontSize: isMobile ? '18px' : '22px' }}>
              Real-world transformations where sustainability met commercial success.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', 
            gap: isMobile ? 48 : 40,
            padding: isMobile ? '0' : '0 40px'
          }}>
            {caseStudies.map((item, idx) => (
              <div key={idx} className="anim-fade-up" style={{ animationDelay: `${idx * 0.2}s` }}>
                <div style={{ 
                  borderRadius: 'var(--radius-3xl)', 
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.5s',
                  height: '100%'
                }}>
                  <div style={{ height: isMobile ? 300 : 450, overflow: 'hidden', position: 'relative' }}>
                    <img src={item.image} alt={item.client} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', top: 24, left: 24, padding: '8px 20px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)', borderRadius: '100px', color: 'white', fontSize: 12, fontWeight: 700, letterSpacing: '0.1em' }}>
                      CLIENT: {item.client.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ padding: isMobile ? '32px' : '60px' }}>
                    <h3 style={{ fontSize: isMobile ? 28 : 36, fontWeight: 700, color: 'white', marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>{item.transformation}</h3>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 32 }}>
                      {item.features.map((feature, fidx) => (
                        <div key={fidx} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 8, height: 8, background: 'var(--eco-400)', borderRadius: '50%' }} />
                          <span style={{ fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ 
                      padding: '32px', 
                      background: 'rgba(74, 222, 128, 0.08)', 
                      borderRadius: '24px', 
                      borderLeft: '6px solid var(--eco-500)',
                      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.2)'
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--eco-400)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: '0.2em' }}>Key Result</div>
                      <p style={{ fontSize: 18, color: 'white', fontWeight: 600, fontStyle: 'italic', lineHeight: 1.6 }}>
                        "{item.result}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: isMobile ? '120px 0' : '180px 0',
        textAlign: 'center',
        background: 'var(--ink-950)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/generated/cta_forest_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(14,9,4,0.9))',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '1440px' }}>
          <div className="anim-fade-up">
            <div className="eco-badge" style={{ marginBottom: 24, background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.2)' }}>Sustainable Future</div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 6vw, 72px)',
              color: 'white',
              marginBottom: 40,
              fontWeight: 600,
              lineHeight: 1.1
            }}>
              Ready to Upgrade to <br />
              <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, var(--eco-400), #fbbf24)' }}>Sustainable Luxury?</span>
            </h2>
            <Link to="/contact#contact-form" className="btn-primary" style={{ padding: '22px 64px', fontSize: '18px', borderRadius: '100px' }}>
              Request a Custom Quote <ArrowRight size={22} style={{ marginLeft: 12 }} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
