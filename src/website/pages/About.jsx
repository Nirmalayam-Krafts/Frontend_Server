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
    <div style={{ minHeight: '100vh', paddingTop: 80, background: 'var(--kraft-50)' }}>

      {/* ── Page Hero ── */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/about_hero_wood.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '500px' : isTablet ? '550px' : '650px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '100px var(--container-gutter) 60px' : '140px var(--container-gutter) 100px'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile
            ? 'linear-gradient(to bottom, rgba(20, 14, 6, 0.95) 0%, rgba(20, 14, 6, 0.8) 50%, rgba(20, 14, 6, 0.6) 100%)'
            : 'linear-gradient(to right, rgba(20, 14, 6, 0.98) 0%, rgba(20, 14, 6, 0.85) 40%, rgba(20, 14, 6, 0.2) 100%)',
          zIndex: 0
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className={isMobile || isTablet ? "flex flex-col" : "responsive-grid"} style={{
            gap: isMobile ? 40 : isTablet ? 80 : 120,
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
                fontSize: 'clamp(42px, 7vw, 84px)',
                color: 'white',
                fontWeight: 600,
                marginBottom: 28,
                lineHeight: 1.05
              }}>
                Artisanal Spirit,<br />
                <span style={{ color: 'var(--kraft-300)' }}>Future-Proof Purity</span>
              </h1>
              <p style={{
                fontSize: isMobile ? '18px' : '22px',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: isMobile || isTablet ? '100%' : 680,
                lineHeight: 1.8,
                margin: isMobile || isTablet ? '0 auto' : '0'
              }}>
                {isMobile ? "Pioneers in premium packaging — luxury that honors our earth through meticulous craftsmanship." :
                  "Pioneers in premium, zero-waste packaging. We believe true luxury shouldn't cost the earth, but rather honor its preservation through meticulous craftsmanship."}
              </p>
            </div>

            <div className="anim-float" style={{
              position: 'relative',
              width: isMobile ? '100%' : '100%',
              maxWidth: isMobile || isTablet ? 'none' : '640px',
              margin: isMobile || isTablet ? '60px auto 0' : '0'
            }}>
              <img
                src="/images/generated/about_hero_branded.png"
                alt="Nirmalyam Kraft Artisan Collection"
                style={{
                  width: '100%',
                  borderRadius: 'var(--radius-2xl)',
                  boxShadow: '0 50px 100px rgba(0,0,0,0.7)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={{ height: 40 }} /> {/* Spacer */}

      {/* ── SECTION: OUR PHILOSOPHY ── */}
      <section className="section-padding" style={{
        background: 'white',
        position: 'relative',
        padding: isMobile ? '100px var(--container-gutter)' : '160px var(--container-gutter)',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 80 : 140,
            alignItems: 'center',
            textAlign: isMobile || isTablet ? 'center' : 'left'
          }}>
            <div className="anim-fade-up-slow" style={{ order: isMobile || isTablet ? 1 : 0 }}>
              <div style={{ position: 'relative', maxWidth: isMobile || isTablet ? 'none' : '620px', margin: '0 auto' }}>
                <div style={{
                  position: 'absolute',
                  inset: isMobile ? '-15px' : '-25px',
                  background: 'var(--kraft-50)',
                  borderRadius: 'var(--radius-3xl)',
                  zIndex: -1
                }} />
                <img
                  src="/images/generated/artisan_nirmalyam_kraft.png"
                  alt="Artisan Crafting Nirmalyam Kraft Bag"
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-2xl)',
                    boxShadow: 'var(--shadow-2xl)',
                  }}
                />
                <div className="glass-card anim-float" style={{
                  position: 'absolute',
                  bottom: isMobile ? '-10px' : '-20px',
                  right: isMobile ? '12px' : '-40px',
                  transform: 'none',
                  padding: isMobile ? '16px 20px' : '24px 32px',
                  width: isMobile ? '240px' : '280px',
                  maxWidth: isMobile ? '85%' : 'none',
                  borderRadius: 'var(--radius-xl)',
                  zIndex: 2,
                  background: 'var(--kraft-950)',
                  color: 'white',
                  boxShadow: '0 20px 40px rgba(58, 36, 16, 0.4)',
                  textAlign: 'center'
                }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: isMobile ? 14 : 18,
                    lineHeight: 1.4,
                    marginBottom: 10
                  }}>
                    "Purity is not an objective, it is our origin."
                  </p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--eco-400)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                    — The Nirmalyam Vow
                  </p>
                </div>
              </div>
            </div>

            <div className="anim-fade-up" style={{ order: isMobile || isTablet ? 0 : 1 }}>
              <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Our Philosophy</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? '36px' : '56px', marginBottom: 32 }}>Luxury through a <br /><span className="text-gradient">Green lens</span></h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 24 : 32 }}>
                <p style={{ fontSize: isMobile ? 18 : 20, color: 'var(--kraft-900)', lineHeight: 1.8, fontWeight: 500 }}>
                  Founded on the Sanskrit principle of 'Nirmalyam'—the sacred purity of offerings—we began with a single mission: to infuse corporate gifting and retail with environmental integrity.
                </p>
                <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--kraft-600)', lineHeight: 1.8 }}>
                  Our journey is rooted in the belief that packaging is the first handshake between a brand and its customer. We ensure that contact is sustainable, tactile, and unforgettable, replacing single-use plastics with masterpieces of kraft engineering.
                </p>
                <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: isMobile || isTablet ? 'center' : 'flex-start', gap: 16 }}>
                  <div style={{ width: 44, height: 44, background: 'var(--eco-50)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={24} color="var(--eco-600)" />
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--kraft-950)', fontSize: 18 }}>100% Plastic-Free Lifecycle</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 10 }} /> {/* Spacer */}

      {/* ── SECTION: THE VISIONARIES ── */}
      <section className="section-padding" style={{
        background: 'var(--kraft-50)',
        padding: isMobile ? '100px 0' : '160px 0',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div style={{ padding: isMobile ? '0 var(--container-gutter)' : '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 64 : 100 }}>
            <div className="section-label" style={{ margin: '0 auto 12px' }}>Leadership</div>
            <h2 className="section-title" style={{ fontSize: isMobile ? '40px' : '64px' }}>The Visionaries</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: isMobile ? '18px' : '20px', maxWidth: 800 }}>
              The architects driving Bharat's transition to circular packaging economies.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 32 : 40,
            maxWidth: '1600px',
            margin: '0 auto'
          }}>
            {visionaries.map((owner, idx) => (
              <div key={idx} className="anim-fade-up" style={{
                animationDelay: `${idx * 0.25}s`,
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: 'var(--radius-3xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--kraft-100)',
              }}>
                <div style={{
                  width: '100%',
                  height: isMobile ? 300 : 500,
                  overflow: 'hidden',
                }}>
                  <img src={owner.image} alt={owner.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>
                <div style={{
                  padding: isMobile ? '32px 24px' : '48px'
                }}>
                  <div className="eco-badge" style={{ marginBottom: 16, background: 'var(--eco-50)', color: 'var(--eco-600)', border: 'none' }}>Founder & Visionary</div>
                  <h3 style={{ fontSize: isMobile ? 32 : 40, fontWeight: 700, color: 'var(--kraft-950)', marginBottom: 12, fontFamily: "'Playfair Display', serif" }}>{owner.name}</h3>
                  <div style={{ color: 'var(--kraft-500)', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 24 }}>{owner.role}</div>
                  <p style={{ fontSize: isMobile ? 16 : 18, color: 'var(--kraft-600)', lineHeight: 1.8, marginBottom: 32 }}>{owner.desc}</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <a href={`mailto:${owner.email}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--kraft-900)', textDecoration: 'none', fontSize: 14, fontWeight: 700, background: 'var(--kraft-50)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--kraft-100)', justifyContent: 'center' }}>
                      <Mail size={16} color="var(--eco-600)" />
                      Email
                    </a>
                    <a href={`tel:${owner.phone}`} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--kraft-900)', textDecoration: 'none', fontSize: 14, fontWeight: 700, background: 'var(--kraft-50)', padding: '12px 20px', borderRadius: '12px', border: '1px solid var(--kraft-100)', justifyContent: 'center' }}>
                      <Phone size={16} color="var(--eco-600)" />
                      Phone
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ height: 40 }} /> {/* Spacer */}

      {/* ── SECTION: QUALITY PILLARS ── */}
      <section className="section-padding" style={{
        background: 'white',
        padding: isMobile ? '100px var(--container-gutter)' : '160px var(--container-gutter)',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '55% 45%',
            gap: isMobile ? 60 : 100,
            alignItems: 'center',
            textAlign: isMobile || isTablet ? 'center' : 'left'
          }}>
            <div className="anim-fade-up-slow" style={{ order: isMobile || isTablet ? 1 : 0 }}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 'var(--radius-3xl)', boxShadow: 'var(--shadow-2xl)' }}>
                <img 
                  src="/images/generated/quality_nirmalyam_branded.png" 
                  alt="Quality Assurance - Nirmalyam Kraft Colorful Bags" 
                  style={{
                    width: '100%',
                    display: 'block',
                    transition: 'transform 0.7s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <div style={{
                  position: 'absolute',
                  top: isMobile ? 12 : 32,
                  right: isMobile ? 12 : 32,
                  background: 'var(--kraft-950)',
                  color: 'white',
                  padding: isMobile ? '10px 20px' : '18px 40px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: isMobile ? 11 : 14,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  boxShadow: 'var(--shadow-2xl)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.1)'
                }}>
                  <div style={{ width: 10, height: 10, background: '#fbbf24', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
                  ISO 9001:2015 Certified
                </div>
              </div>
            </div>

            <div className="anim-fade-up" style={{ order: isMobile || isTablet ? 0 : 1 }}>
              <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Standard of Excellence</div>
              <h2 className="section-title" style={{ fontSize: isMobile ? '40px' : '64px', marginBottom: 28, lineHeight: 1.1 }}>Consistent <br /><span className="text-gradient">Perfection</span></h2>
              <p className="section-subtitle" style={{
                marginBottom: isMobile ? 40 : 60,
                fontSize: '20px',
                margin: isMobile || isTablet ? '0 auto 40px' : '0 0 60px',
                maxWidth: 650,
                lineHeight: 1.8,
                color: 'var(--kraft-700)'
              }}>
                Every single bag that leaves our production floor undergoes a meticulous 12-point quality check, ensuring your brand's integrity is protected in every detail.
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
                gap: 24
              }}>
                {qualityPillars.map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{
                    background: 'var(--kraft-50)',
                    padding: '32px',
                    borderRadius: '24px',
                    border: '1px solid var(--kraft-100)',
                    transition: 'all 0.4s ease',
                    textAlign: isMobile ? 'center' : 'left'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.transform = 'translateY(-10px)';
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = 'var(--eco-200)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.background = 'var(--kraft-50)';
                      e.currentTarget.style.borderColor = 'var(--kraft-100)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: 48,
                      height: 48,
                      background: 'white',
                      borderRadius: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 20,
                      boxShadow: 'var(--shadow-sm)',
                      margin: (isMobile || isTablet) ? '0 auto 20px' : '0 0 20px'
                    }}>
                      <Icon size={24} color="var(--eco-600)" />
                    </div>
                    <h4 style={{ fontWeight: 800, fontSize: 18, color: 'var(--kraft-950)', marginBottom: 10 }}>{title}</h4>
                    <p style={{ fontSize: 15, color: 'var(--kraft-600)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ height: 60 }} /> {/* Spacer */}

      {/* ── CTA ── */}
      <section style={{
        padding: isMobile ? '120px var(--container-gutter)' : '180px var(--container-gutter)',
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
              lineHeight: 1.1,
              fontWeight: 600,
            }}>
              Join the Nirmalyam <br /><span className="text-gradient">Eco-Legacy</span>
            </h2>
            <Link to="/contact" className="btn-primary" style={{ padding: '22px 64px', fontSize: '18px', borderRadius: '100px' }}>
              Consult an Expert <ArrowRight size={22} style={{ marginLeft: 12 }} />
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.5); opacity: 0.5; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
