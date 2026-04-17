import { Link } from 'react-router-dom';
import { Leaf, TreePine, Droplets, Truck, Recycle, Check, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

/* ── Green Print steps ── */
const greenPrint = [
  { icon: TreePine, title: 'Ethical Sourcing', desc: 'We source kraft paper from managed forests where for every tree harvested, three are planted.', image: '/images/generated/step_ethical_sourcing_1775638363093.png' },
  { icon: Droplets, title: 'Non-Toxic Printing', desc: 'Our presses run exclusively on soy and water-based inks that contain zero heavy metals or harmful VOCs.', image: '/images/generated/step_nontoxic_printing_1775638380421.png' },
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

/* ── Case Studies ── */
const caseStudies = [
  {
    client: 'Boutique Bloom',
    transformation: '100% Plastic to Paper Transition',
    result: '15% increase in premium brand perception and 2 tons of plastic eliminated annually.',
    image: '/images/generated/case_study.png'
  },
  {
    client: 'Urban Organics',
    transformation: 'Eco-Friendly Fulfillment',
    result: 'Reduced logistical carbon footprint by 22% through optimized kraft carton transit.',
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
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      {/* ── Page Hero ── */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/about_hero_bags.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '400px' : isTablet ? '450px' : '500px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '60px var(--container-gutter) 40px' : '80px var(--container-gutter)'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile 
            ? 'linear-gradient(to bottom, rgba(2, 28, 13, 0.98) 0%, rgba(2, 28, 13, 0.8) 60%, transparent 100%)'
            : 'linear-gradient(to right, rgba(2, 28, 13, 0.98) 0%, rgba(2, 28, 13, 0.85) 50%, transparent 100%)',
          zIndex: 0
        }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
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
              fontSize: 'clamp(36px, 8vw, 76px)',
              color: 'white',
              fontWeight: 600,
              marginBottom: 24,
              lineHeight: 1.1
            }}>
              Sustainability in <br />
              <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, var(--eco-400), var(--eco-500))' }}>Every Fiber</span>
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '19px',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 620,
              lineHeight: 1.8,
              margin: isMobile || isTablet ? '0 auto' : '0'
            }}>
              {isMobile ? "Discover how our 'Green Print' is reshaping the future of packaging through circular resource management." : 
              "We don't just make bags; we engineer environmental solutions. Discover how our 'Green Print' is reshaping the future of packaging through circular resource management."}
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION: THE PAPER ADVANTAGE (BENEFITS) ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-50)', 
        position: 'relative',
        padding: isMobile ? '64px var(--container-gutter)' : '100px var(--container-gutter)'
      }}>
        <div className="nature-layer-leaf" style={{ opacity: 0.05 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 80 }}>
            <div className="section-label">Proven Impact</div>
            <h2 className="section-title" style={{ fontSize: isMobile ? '32px' : '48px' }}>The Paper Advantage</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: isMobile ? '16px' : '18px', maxWidth: 700 }}>
              Why shifting to high-grade kraft paper is the single most effective brand move for the planet.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', 
            gap: isMobile ? 12 : 32 
          }}>
            {paperBenefits.map((benefit, idx) => (
              <div key={idx} className="glass-card" style={{ 
                padding: isMobile ? '20px' : '40px', 
                border: '1px solid var(--kraft-100)',
                background: 'white',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                textAlign: isMobile || isTablet ? 'center' : 'left'
              }}
              onMouseEnter={e => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(-10px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }
              }}
              onMouseLeave={e => {
                if (!isMobile) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }
              }}
              >
                <div style={{ 
                  width: isMobile ? 40 : 56, height: isMobile ? 40 : 56, 
                  background: 'var(--eco-50)', 
                  borderRadius: '14px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: isMobile ? 12 : 20,
                  margin: isMobile || isTablet ? '0 auto 12px' : '0 0 20px'
                }}>
                  {benefit.icon ? <benefit.icon size={isMobile ? 20 : 26} color="var(--eco-600)" /> : <Leaf size={isMobile ? 20 : 26} color="var(--eco-600)" />}
                </div>
                <h4 style={{ fontSize: isMobile ? 14 : 20, fontWeight: 700, color: 'var(--kraft-950)', marginBottom: 12 }}>{benefit.title}</h4>
                <p style={{ fontSize: isMobile ? 11 : 15, color: 'var(--kraft-600)', lineHeight: 1.6 }}>{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: SUSTAINABILITY (GREEN PRINT) ── */}
      <section className="section-padding nature-section" id="green-print" style={{ 
        background: 'var(--eco-950)', 
        color: 'white',
        padding: isMobile ? '64px 0' : '100px 0'
      }}>
        <div className="nature-layer-wood" style={{ opacity: 0.06 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 80 }}>
            <div className="section-label" style={{ color: 'var(--eco-400)' }}>Engineering Purity</div>
            <h2 className="section-title" style={{ color: 'white', fontSize: isMobile ? '32px' : '48px' }}>The Green Print</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.7)', margin: '0 auto', fontSize: isMobile ? '16px' : '18px' }}>
              Full lifecycle transparency. From managed forests to fertile soil.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', 
            gap: isMobile ? 12 : 32 
          }}>
            {greenPrint.map(({ icon: Icon, title, desc, image }, i) => (
              <div key={title} className="anim-fade-up" style={{ animationDelay: `${i * 0.15}s` }}>
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 'var(--radius-xl)',
                  overflow: 'hidden',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  <div style={{ height: isMobile ? 120 : 220, overflow: 'hidden' }}>
                    <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  </div>
                  <div style={{ padding: isMobile ? '16px' : '40px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: isMobile ? 10 : 16 }}>
                      <div style={{ width: isMobile ? 28 : 36, height: isMobile ? 28 : 36, background: 'rgba(74, 222, 128, 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Icon size={isMobile ? 14 : 18} color="var(--eco-400)" />
                      </div>
                      <span style={{ fontSize: isMobile ? 9 : 11, fontWeight: 800, color: 'var(--eco-400)', letterSpacing: '0.1em' }}>0{i + 1}</span>
                    </div>
                    <h3 style={{ fontSize: isMobile ? 14 : 20, fontWeight: 700, marginBottom: 8, color: 'white' }}>{title}</h3>
                    <p style={{ fontSize: isMobile ? 11 : 15, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: LAWS & COMPLIANCE ── */}
      <section className="section-padding" style={{ 
        background: 'white',
        padding: isMobile ? '64px var(--container-gutter)' : '100px var(--container-gutter)'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? 48 : isTablet ? 60 : 100, 
            alignItems: 'center', 
            textAlign: isMobile || isTablet ? 'center' : 'left' 
          }}>
            <div className="anim-fade-up">
              <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Legal Readiness</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? '32px' : '48px' }}>The Path to Plastic-Free</h2>
              <p className="section-subtitle" style={{ marginBottom: isMobile ? 32 : 48, margin: isMobile || isTablet ? '0 auto 32px' : '0 0 48px' }}>
                Environmental regulations are evolving rapidly. We partner with brands to ensure 100% compliance with local and global mandates.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 24 : 32 }}>
                {legalLaws.map((law, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: isMobile ? 16 : 24, textAlign: 'left' }}>
                    <div style={{ 
                      width: 44, height: 44, flexShrink: 0,
                      background: 'var(--eco-50)', borderRadius: '12px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                      <Check size={20} color="var(--eco-600)" />
                    </div>
                    <div>
                      <h4 style={{ fontSize: isMobile ? 17 : 19, fontWeight: 700, color: 'var(--kraft-950)', marginBottom: 6 }}>{law.title}</h4>
                      <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--kraft-600)', lineHeight: 1.6 }}>{law.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="anim-fade-up-slow" style={{ order: isMobile || isTablet ? -1 : 1 }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute',
                  inset: '-15px',
                  background: 'var(--eco-50)',
                  borderRadius: 'var(--radius-xl)',
                  zIndex: -1
                }} />
                <img src="/images/generated/laws_eco.png" alt="Eco Laws" style={{ width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-xl)' }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: CASE STUDIES ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-950)', 
        color: 'white',
        padding: isMobile ? '64px var(--container-gutter)' : '100px var(--container-gutter)'
      }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 80 }}>
            <div className="section-label" style={{ color: 'var(--eco-400)' }}>Proof of Concept</div>
            <h2 className="section-title" style={{ color: 'white', fontSize: isMobile ? '32px' : '48px' }}>Success Stories</h2>
            <p className="section-subtitle" style={{ color: 'rgba(255,255,255,0.6)', margin: '0 auto', fontSize: isMobile ? '16px' : '18px' }}>
              Real-world transformations where sustainability met commercial success.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', 
            gap: isMobile ? 32 : 48 
          }}>
            {caseStudies.map((item, idx) => (
              <div key={idx} className="anim-fade-up" style={{ animationDelay: `${idx * 0.2}s` }}>
                <div style={{ 
                  borderRadius: 'var(--radius-2xl)', 
                  overflow: 'hidden',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  transition: 'all 0.5s',
                  height: '100%'
                }}>
                  <div style={{ height: isMobile ? 240 : 320, overflow: 'hidden', position: 'relative' }}>
                    <img src={item.image} alt={item.client} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 16, left: 16, padding: '6px 16px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', borderRadius: '20px', color: 'white', fontSize: 10, fontWeight: 700 }}>
                      CLIENT: {item.client.toUpperCase()}
                    </div>
                  </div>
                  <div style={{ padding: isMobile ? '32px' : '40px' }}>
                    <h3 style={{ fontSize: isMobile ? 22 : 26, fontWeight: 700, color: 'white', marginBottom: 20 }}>{item.transformation}</h3>
                    <div style={{ 
                      padding: isMobile ? '20px' : '24px', 
                      background: 'rgba(74, 222, 128, 0.05)', 
                      borderRadius: 'var(--radius-lg)', 
                      borderLeft: '4px solid var(--eco-500)'
                    }}>
                      <p style={{ fontSize: isMobile ? 15 : 17, color: 'var(--eco-300)', fontWeight: 500, fontStyle: 'italic', lineHeight: 1.6 }}>
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
        padding: isMobile ? '80px 0' : '100px 0',
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
          opacity: 0.4
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="anim-fade-up">
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 60px)',
              color: 'white',
              marginBottom: 32,
              fontWeight: 600
            }}>
              Ready to Upgrade to <br />
              <span style={{ color: 'var(--eco-400)' }}>Sustainable Luxury?</span>
            </h2>
            <Link to="/contact" className="btn-primary" style={{ padding: isMobile ? '18px 48px' : '22px 64px', fontSize: isMobile ? 14 : 16 }}>
              Get Your Solution <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
