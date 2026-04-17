import { Link } from 'react-router-dom';
import { Leaf, Heart, Globe, Users, Award, ArrowRight, Mail, Phone, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

/* ── Values ── */
const values = [
  { icon: Leaf, title: 'Artisanal Craft', desc: 'Each fold and crease is meticulously inspected by our artisans, ensuring a flawless finish for high-end retail.' },
  { icon: Globe, title: 'Earth-First Ethos', desc: 'Sourcing FSC-certified papers, soy-based inks, and organic adhesives to maintain a zero-toxicity production loop.' },
  { icon: Users, title: 'Partner Centric', desc: 'We don\'t just supply bags; we partner with your brand to conceptualize structural packaging that elevates your unboxing experience.' },
];

/* ── Visionaries ── */
const visionaries = [
  {
    name: 'Rajesh Nair',
    role: 'Managing Director',
    email: 'rajesh@nirmalyamkrafts.com',
    phone: '+91 98765 43210',
    desc: 'With over 20 years of experience in sustainable manufacturing, Rajesh leads the vision of making plastic-free packaging accessible to all.',
    image: '/images/generated/owner_1.png'
  },
  {
    name: 'Anjali Nair',
    role: 'Creative Director',
    email: 'anjali@nirmalyamkrafts.com',
    phone: '+91 98765 43211',
    desc: 'Anjali is the creative force behind our premium designs, ensuring that sustainability never comes at the cost of brand elegance.',
    image: '/images/generated/owner_2.png'
  }
];

/* ── Quality pillars ── */
const qualityPillars = [
  { icon: Award, title: 'Consistent Quality', desc: 'ISO-grade quality checks from paper thickness tolerance to handle tensile strength.' },
  { icon: Heart, title: 'Precision Branding', desc: 'Your Pantone colors are replicated with minimal variance across our automated die-cut offset machines.' },
  { icon: Leaf, title: 'Reliable Timelines', desc: 'Our robust production pipeline ensures you receive your packaging exactly when promised.' },
  { icon: Globe, title: 'Wholesale Economics', desc: 'Direct manufacturer pricing means you bypass middleman margins and enjoy volume discounts immediately.' },
];

export default function About() {
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
        backgroundImage: 'url(/images/generated/about_hero_wood.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '450px' : isTablet ? '480px' : '520px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '80px var(--container-gutter) 40px' : isTablet ? '90px var(--container-gutter) 50px' : '100px var(--container-gutter) 40px'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile 
            ? 'linear-gradient(to bottom, rgba(20, 14, 6, 0.95) 0%, rgba(20, 14, 6, 0.8) 50%, rgba(20, 14, 6, 0.6) 100%)'
            : 'linear-gradient(to right, rgba(20, 14, 6, 0.98) 0%, rgba(20, 14, 6, 0.85) 40%, rgba(20, 14, 6, 0.4) 100%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className={isMobile || isTablet ? "flex flex-col" : "responsive-grid"} style={{
            gap: isMobile ? 32 : isTablet ? 60 : 100,
            alignItems: 'center',
            textAlign: isMobile || isTablet ? 'center' : 'left'
          }}>
            <div className="anim-fade-up">
              <div className="eco-badge" style={{ 
                marginBottom: 24, 
                background: 'rgba(192, 148, 87, 0.2)', 
                color: 'var(--kraft-100)', 
                borderColor: 'rgba(255,255,255,0.2)',
                margin: isMobile || isTablet ? '0 auto 24px' : '0 0 24px'
              }}>
                Established Excellence
              </div>
              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(36px, 6vw, 64px)',
                color: 'white',
                fontWeight: 600,
                marginBottom: 24,
                lineHeight: 1.15
              }}>
                Artisanal Spirit,<br />
                <span style={{ color: 'var(--kraft-300)' }}>Future-Proof Purity</span>
              </h1>
              <p style={{
                fontSize: isMobile ? '16px' : '19px',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: isMobile || isTablet ? '100%' : 620,
                lineHeight: 1.8,
                margin: isMobile || isTablet ? '0 auto' : '0'
              }}>
                {isMobile ? "Pioneers in premium packaging — luxury that honors our earth through meticulous craftsmanship." : 
                "Pioneers in premium, zero-waste packaging. We believe true luxury shouldn't cost the earth, but rather honor its preservation through meticulous craftsmanship."}
              </p>
            </div>

            <div className="anim-float" style={{ 
              position: 'relative',
              width: isMobile ? '90%' : isTablet ? '70%' : '100%',
              maxWidth: isMobile || isTablet ? 'none' : '520px',
              margin: isMobile || isTablet ? '40px auto 0' : '0 auto 0 auto'
            }}>
              <img
                src="/images/generated/about_hero_bags.png"
                alt="Premium Sustainable Packaging"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-xl)',
                  boxShadow: '0 40px 80px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION: OUR PHILOSOPHY ── */}
      <section className="section-padding" style={{ 
        background: 'white', 
        position: 'relative',
        padding: isMobile ? '64px var(--container-gutter)' : isTablet ? '80px var(--container-gutter)' : '100px var(--container-gutter)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 60 : isTablet ? 80 : 100,
            alignItems: 'center',
            textAlign: isMobile || isTablet ? 'center' : 'left'
          }}>
            <div className="anim-fade-up-slow" style={{ order: isMobile || isTablet ? 1 : 0 }}>
              <div style={{ position: 'relative', maxWidth: isMobile || isTablet ? 'none' : '480px', margin: '0 auto' }}>
                <div style={{
                  position: 'absolute',
                  inset: isMobile ? '-10px' : '-15px',
                  background: 'var(--kraft-50)',
                  borderRadius: 'var(--radius-xl)',
                  zIndex: -1
                }} />
                <img
                  src="/images/generated/about_philosophy_feature_1775591345213.png"
                  alt="Craftsmanship"
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                  }}
                />
                <div className="glass-card anim-float" style={{
                  position: 'absolute',
                  bottom: isMobile ? '-15px' : '-30px',
                  right: isMobile ? '12px' : '-30px',
                  transform: 'none',
                  padding: isMobile ? '20px 24px' : '40px',
                  width: isMobile ? '280px' : '320px',
                  maxWidth: isMobile ? '85%' : 'none',
                  borderRadius: 'var(--radius-xl)',
                  zIndex: 2,
                  background: 'var(--kraft-950)',
                  color: 'white',
                  boxShadow: '0 30px 60px rgba(58, 36, 16, 0.3)',
                  textAlign: isMobile ? 'left' : 'center'
                }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: isMobile ? 18 : 22,
                    lineHeight: 1.4,
                    marginBottom: 16
                  }}>
                    "Purity is not an objective, it is our origin."
                  </p>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--eco-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    — The Nirmalyam Vow
                  </p>
                </div>
              </div>
            </div>

            <div className="anim-fade-up" style={{ order: isMobile || isTablet ? 0 : 1 }}>
              <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Our Philosophy</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? '32px' : isTablet ? '40px' : '48px' }}>Luxury through a Green lens</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 20 : 28 }}>
                <p style={{ fontSize: isMobile ? 16 : 17, color: 'var(--kraft-900)', lineHeight: 1.8, fontWeight: 500 }}>
                  Founded on the Sanskrit principle of 'Nirmalyam'—the sacred purity of offerings—we began with a single mission: to infuse corporate gifting and retail with environmental integrity.
                </p>
                <p style={{ fontSize: isMobile ? 16 : 17, color: 'var(--kraft-600)', lineHeight: 1.8 }}>
                  Our journey is rooted in the belief that packaging is the first handshake between a brand and its customer. We ensure that contact is sustainable, tactile, and unforgettable, replacing single-use plastics with masterpieces of kraft engineering.
                </p>
                <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', justifyContent: isMobile || isTablet ? 'center' : 'flex-start' }}>
                  <Check size={20} color="var(--eco-600)" style={{ marginRight: 12 }} />
                  <span style={{ fontWeight: 700, color: 'var(--kraft-950)' }}>100% Plastic-Free Lifecycle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: THE VISIONARIES ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-50)',
        padding: isMobile ? '64px var(--container-gutter)' : isTablet ? '80px var(--container-gutter)' : '120px var(--container-gutter)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 80 }}>
            <div className="section-label" style={{ margin: '0 auto 12px' }}>Leadership</div>
            <h2 className="section-title" style={{ fontSize: isMobile ? '32px' : isTablet ? '40px' : '48px' }}>The Visionaries</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: isMobile ? '16px' : '18px', maxWidth: 700 }}>
              The architects driving Bharat's transition to circular packaging economies.
            </p>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : 'repeat(2, 1fr)', 
            gap: isMobile ? 24 : 40,
            maxWidth: isTablet ? 600 : '1100px',
            margin: '0 auto'
          }}>
            {visionaries.map((owner, idx) => (
              <div key={idx} className="anim-fade-up" style={{ animationDelay: `${idx * 0.25}s` }}>
                <div style={{ 
                  borderRadius: 'var(--radius-2xl)', 
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: isMobile ? 'column' : 'row',
                  background: 'white',
                  boxShadow: 'var(--shadow-lg)',
                  height: '100%',
                  border: '1px solid var(--kraft-100)'
                }}>
                  <div style={{ 
                    width: isMobile ? '100%' : '45%', 
                    height: isMobile ? 240 : isTablet ? 320 : 'auto', 
                    overflow: 'hidden' 
                  }}>
                    <img src={owner.image} alt={owner.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <div style={{ 
                    width: isMobile ? '100%' : '55%', 
                    padding: isMobile ? '24px' : isTablet ? '40px' : '40px 32px' 
                  }}>
                    <h3 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: 'var(--kraft-950)', marginBottom: 8 }}>{owner.name}</h3>
                    <div style={{ color: 'var(--eco-600)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 16 }}>{owner.role}</div>
                    <p style={{ fontSize: isMobile ? 14 : 15, color: 'var(--kraft-600)', lineHeight: 1.7, marginBottom: 20 }}>{owner.desc}</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <a href={`mailto:${owner.email}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--kraft-900)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                        <div style={{ width: 28, height: 28, background: 'var(--kraft-50)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Mail size={12} color="var(--kraft-500)" />
                        </div>
                        {owner.email}
                      </a>
                      <a href={`tel:${owner.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--kraft-900)', textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>
                        <div style={{ width: 28, height: 28, background: 'var(--kraft-50)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Phone size={12} color="var(--kraft-500)" />
                        </div>
                        {owner.phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: QUALITY PILLARS ── */}
      <section className="section-padding" style={{ 
        background: 'white',
        padding: isMobile ? '64px var(--container-gutter)' : isTablet ? '80px var(--container-gutter)' : '120px var(--container-gutter)'
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 48 : isTablet ? 60 : 80,
            alignItems: 'center',
            textAlign: isMobile || isTablet ? 'center' : 'left'
          }}>
            <div className="anim-fade-up-slow" style={{ order: isMobile || isTablet ? 1 : 0 }}>
              <div style={{ position: 'relative' }}>
                <img 
                  src="/images/generated/quality_standards_feature.png" 
                  alt="Quality Assurance" 
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '1px solid var(--kraft-100)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: isMobile ? 12 : 24,
                  right: isMobile ? 12 : 24,
                  background: 'var(--eco-600)',
                  color: 'white',
                  padding: isMobile ? '8px 16px' : '14px 28px',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: isMobile ? 10 : 13,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  boxShadow: 'var(--shadow-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}>
                  <Award size={isMobile ? 14 : 18} />
                  ISO 9001:2015
                </div>
              </div>
            </div>

            <div className="anim-fade-up" style={{ order: isMobile || isTablet ? 0 : 1 }}>
              <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Standard of Excellence</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? '32px' : isTablet ? '40px' : '48px' }}>Consistent Perfection</h2>
              <p className="section-subtitle" style={{ 
                marginBottom: isMobile ? 32 : 48, 
                fontSize: isMobile ? '16px' : '18px',
                margin: isMobile || isTablet ? '0 auto 32px' : '0 0 48px',
                maxWidth: 600
              }}>
                Every bag that leaves our production floor undergoes a 12-point quality check, protecting your brand's integrity in every detail.
              </p>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)', 
                gap: isMobile ? 12 : 20 
              }}>
                {qualityPillars.map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{
                    background: 'var(--kraft-50)',
                    padding: isMobile ? '16px' : '28px',
                    borderRadius: '20px',
                    border: '1px solid var(--kraft-100)',
                    transition: 'all 0.3s',
                    textAlign: isMobile ? 'center' : 'left'
                  }}
                  onMouseEnter={e => { if(!isMobile) e.currentTarget.style.borderColor = 'var(--kraft-300)'; }}
                  onMouseLeave={e => { if(!isMobile) e.currentTarget.style.borderColor = 'var(--kraft-100)'; }}
                  >
                    <div style={{ 
                      width: isMobile ? 28 : 32, 
                      height: isMobile ? 28 : 32, 
                      background: 'white', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      marginBottom: isMobile ? 12 : 16, 
                      boxShadow: 'var(--shadow-sm)', 
                      margin: isMobile || isTablet ? '0 auto 12px' : '0 0 16px' 
                    }}>
                      <Icon size={isMobile ? 14 : 16} color="var(--eco-600)" />
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: isMobile ? 13 : 17, color: 'var(--kraft-950)', marginBottom: 6 }}>{title}</h4>
                    <p style={{ fontSize: isMobile ? 11 : 14, color: 'var(--kraft-600)', lineHeight: 1.5 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        padding: isMobile ? '80px var(--container-gutter)' : '120px var(--container-gutter)',
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
          opacity: 0.5
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, transparent, rgba(14,9,4,0.8))',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="anim-fade-up">
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 56px)',
              color: 'white',
              marginBottom: 32,
              lineHeight: 1.1,
              fontWeight: 600,
            }}>
              Join the Nirmalyam <br /><span className="text-gradient">Eco-Legacy</span>
            </h2>
            <Link to="/contact" className="btn-primary" style={{ padding: isMobile ? '18px 48px' : '22px 64px', fontSize: isMobile ? '14px' : '16px' }}>
              Consult an Expert <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
