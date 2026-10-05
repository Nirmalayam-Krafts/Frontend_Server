import { Link } from 'react-router-dom';
import { Leaf, Heart, Globe, Users, Award, ArrowRight, Mail, Phone, Check, Info, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import PagePopup from '../components/PagePopup';
import SEOHead from '../components/SEOHead';
import { SITE_URL } from '../config/seoConfig';

const Linkedin = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

/* ── Values ── */
const values = [
  { icon: Leaf, title: 'Artisanal Craft', desc: 'Each fold and crease is meticulously inspected by our artisans, ensuring a flawless finish for high-end retail.' },
  { icon: Globe, title: 'Earth-First Ethos', desc: 'Sourcing FSC-certified papers, soy-based inks, and organic adhesives to maintain a zero-toxicity production loop.' },
  { icon: Users, title: 'Partner Centric', desc: 'We don\'t just supply bags; we partner with your brand to conceptualize structural packaging that elevates your unboxing experience.' },
];

/* ── Visionaries ── */
const visionaries = [
  {
    name: 'Mahesh Nair',
    role: 'Co-Founder & Director',
    image: '/images/founders/mahesh_nair.jpg',
    linkedin: 'https://www.linkedin.com/in/mahesh-nair-8334aa107?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    paragraphs: [
      'Mahesh Nair is the Co Founder and Director at Nirmalyam Krafts Pvt Ltd.',
      'Before starting Nirmalyam Krafts, Mahesh Nair worked as a distinguished HR leader with over two decades of expertise in steering transformative business initiatives, talent management, and enterprise integration. He has a rare blend of visionary strategy and empathetic leadership.',
      'Throughout his illustrious career spanning leadership roles at Cleareye.ai, Atos & Mphasis he has successfully spearheaded large-scale location consolidations, engineered company-wide competency frameworks, and championed employee-first cultures. At Nirmalyam Krafts, Mahesh champions operational excellence, bridging human potential with business objectives to cultivate a resilient, high-performing workforce poised for sustainable success.',
      'Mahesh deeply aligns his vision with eco-conscious stewardship, championing environmental sustainability and green manufacturing practices to protect our planet while driving enduring, responsible business success.',
      'Mahesh is a Post Graduate in Business Management from SIBM and also an alumnus of Cambridge University Global Talent program.',
      'He is settled in Pune, Maharashtra where he lives with his wife and daughter.'
    ]
  },
  {
    name: 'Satish Nair',
    role: 'Co-Founder & Director',
    image: '/images/founders/satish_nair.jpg',
    linkedin: null,
    paragraphs: [
      'Satish Nair is the Co-Founder and Director of Nirmalyam Krafts Pvt. Ltd., driven by an entrepreneurial vision and a strong foundation in business operations and management.',
      'His experience with Kapstone Cybersecurity, Mphasis, and NECC Logistics has given him valuable expertise in logistics, administration, and project management, shaping his practical and results-oriented approach to business. He now brings this experience to building and growing Nirmalyam Krafts, with a focus on sustainable business development, innovation, and long-term value creation.',
      'Born and raised in Pune, Satish comes from a small, close-knit family and holds a B.Com degree. He is married and settled in Pune with his wife and daughter. He values family, continuous learning, and personal growth, and believes in embracing new opportunities and challenges.'
    ]
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
  const [selectedLeader, setSelectedLeader] = useState(null);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'About Nirmalyam Krafts | Paper Bag Manufacturer in Pune',
    url: `${SITE_URL}/about`,
    description: 'Learn about Nirmalyam Krafts, a premier eco-friendly paper bag manufacturer and kraft packaging supplier based in Pune, Maharashtra.',
    mainEntity: {
      '@type': 'Organization',
      name: 'Nirmalyam Krafts Private Ltd',
      url: SITE_URL,
      founder: [
        {
          '@type': 'Person',
          name: 'Mahesh Nair',
          jobTitle: 'Co-Founder & Director',
        },
        {
          '@type': 'Person',
          name: 'Satish Nair',
          jobTitle: 'Co-Founder & Director',
        },
      ],
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Survey No 53, Gatha Mandir Bypass Rd, Yelwadi',
        addressLocality: 'Pune',
        addressRegion: 'Maharashtra',
        postalCode: '412109',
        addressCountry: 'India',
      },
    },
  };

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedLeader(null);
      }
    };
    if (selectedLeader) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedLeader]);

  return (
    <div className="site-page-container" style={{ minHeight: '100vh', background: 'var(--kraft-50)' }}>
      <SEOHead routeKey="/about" schema={[aboutSchema]} />

      {/* ── Page Hero ── */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/about_hero_wood.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '500px' : isTablet ? '550px' : '650px',
        display: 'flex',
        alignItems: 'center',
        paddingTop: isMobile ? 'calc(var(--header-height, 80px) + 20px)' : 'calc(var(--header-height, 108px) + 60px)',
        paddingBottom: isMobile ? '60px' : '100px',
        paddingLeft: 'var(--container-gutter)',
        paddingRight: 'var(--container-gutter)'
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
                fontSize: 'clamp(38px, 6vw, 76px)',
                color: 'white',
                fontWeight: 600,
                marginBottom: 28,
                lineHeight: 1.1
              }}>
                About Nirmalyam Krafts<br />
                <span style={{ color: '#4ade80', fontSize: '0.65em', display: 'block', marginTop: '12px' }}>
                  Paper Bag Manufacturer in Pune, India
                </span>
              </h1>
              <p style={{
                fontSize: isMobile ? '18px' : '22px',
                color: 'rgba(255,255,255,0.9)',
                maxWidth: isMobile || isTablet ? '100%' : 680,
                lineHeight: 1.8,
                margin: isMobile || isTablet ? '0 auto' : '0'
              }}>
                {isMobile ? "India's premier eco-friendly paper bag manufacturer — exceptional durability, wholesale factory rates, and zero plastic." :
                  "Pioneers in high-strength, eco-friendly paper bags. We partner with retail and food brands across Maharashtra and India to provide commercial-grade sustainable packaging at direct factory pricing."}
              </p>
            </div>

            <div className="anim-float" style={{
              position: 'relative',
              width: isMobile ? '100%' : '100%',
              maxWidth: isMobile || isTablet ? 'none' : '640px',
              margin: isMobile || isTablet ? '60px auto 0' : '0'
            }}>
              <img
                src="/images/new/VibrantCOlers.webp"
                alt="Nirmalyam Krafts Paper Bag Manufacturing Factory & Products Pune"
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
                  src="/images/new/TYPES.webp"
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
        padding: isMobile ? '80px 0' : '140px 0',
        marginBottom: isMobile ? 40 : 60
      }}>
        <div style={{ padding: isMobile ? '0 var(--container-gutter)' : '0 40px' }}>
          <div style={{ textAlign: 'center', marginBottom: isMobile ? 48 : 80 }}>
            <div className="section-label" style={{ margin: '0 auto 12px' }}>Leadership</div>
            <h2 className="section-title" style={{ fontSize: isMobile ? '38px' : '60px' }}>The Visionaries</h2>
            <p className="section-subtitle" style={{ margin: '0 auto', fontSize: isMobile ? '16px' : '19px', maxWidth: 800 }}>
              The architects driving Bharat's transition to circular packaging economies and sustainable enterprise leadership.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 32 : 36,
            maxWidth: '860px',
            margin: '0 auto'
          }}>
            {visionaries.map((owner, idx) => (
              <div key={idx} className="anim-fade-up" style={{
                animationDelay: `${idx * 0.2}s`,
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                borderRadius: 'var(--radius-3xl)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--kraft-200)',
                transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-2xl)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
              }}
              >
                {/* Crisp Portrait Photo: 4/5 Aspect Ratio so Full Blazer and Shoulders Are Visible */}
                <div style={{
                  width: '100%',
                  aspectRatio: '4 / 5',
                  overflow: 'hidden',
                  background: 'var(--kraft-100)',
                }}>
                  <img
                    src={owner.image}
                    alt={`${owner.name} - ${owner.role} at Nirmalyam Krafts Paper Bags Pune`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'top center',
                      transition: 'transform 0.5s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                  />
                </div>

                <div style={{
                  padding: isMobile ? '28px 20px' : '36px 32px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  flex: 1,
                  justifyContent: 'space-between',
                  background: 'white'
                }}>
                  <div>
                    <h3 style={{ fontSize: isMobile ? 26 : 32, fontWeight: 700, color: 'var(--kraft-950)', marginBottom: 6, fontFamily: "'Playfair Display', serif" }}>
                      {owner.name}
                    </h3>
                    <div style={{ color: 'var(--kraft-600)', fontWeight: 600, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 24 }}>
                      {owner.role}
                    </div>
                  </div>

                  {/* Dual Action: Read Bio pill + LinkedIn circle button (if available) */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, width: '100%', paddingTop: 6 }}>
                    <button
                      onClick={() => setSelectedLeader(owner)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 10,
                        background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
                        color: 'white',
                        padding: isMobile ? '11px 22px' : '13px 28px',
                        borderRadius: '100px',
                        fontSize: 14,
                        fontWeight: 600,
                        border: '1px solid rgba(255,255,255,0.15)',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        boxShadow: 'var(--shadow-sm)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'scale(1.03)';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #15803d 0%, #166534 100%)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.background = 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                    >
                      <span>Read Bio</span>
                      <Info size={16} color="#4ade80" />
                    </button>

                    {owner.linkedin && (
                      <a
                        href={owner.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Connect with ${owner.name} on LinkedIn`}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          background: 'var(--eco-600)',
                          color: 'white',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'all 0.3s ease',
                          boxShadow: 'var(--shadow-sm)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.08)';
                          e.currentTarget.style.background = 'var(--eco-700)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.background = 'var(--eco-600)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                        }}
                      >
                        <Linkedin size={18} />
                      </a>
                    )}
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
                  src="/images/new/VibrantCOlers.webp" 
                  alt="Quality Assurance - Nirmalyam Kraft Colorful Bags" 
                  style={{
                    width: '100%',
                    display: 'block',
                    transition: 'transform 0.7s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                {/* <div style={{
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
                </div> */}
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
        paddingTop: isMobile ? '100px' : '140px',
        paddingBottom: isMobile ? '120px' : '160px',
        paddingLeft: 'var(--container-gutter)',
        paddingRight: 'var(--container-gutter)',
        textAlign: 'center',
        background: 'var(--ink-950)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: isMobile ? '450px' : '500px',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/dark_kraft_cta_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4
        }} />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(14,9,4,0.4) 0%, transparent 30%, transparent 70%, rgba(14,9,4,0.7) 100%)',
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
            <Link to="/contact#contact-channels" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: isMobile ? '12px 28px' : '16px 40px',
              fontSize: isMobile ? '14px' : '16px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
              color: 'white',
              border: '2px solid rgba(255,255,255,0.5)',
              borderRadius: '100px',
              textDecoration: 'none',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
              e.currentTarget.style.borderColor = 'white';
              e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
            }}
            >
              Get a Quote <ArrowRight size={isMobile ? 18 : 22} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BIO MODAL (Cleareye Pattern + Nirmalyam Krafts Theme) ── */}
      {selectedLeader && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            background: 'rgba(14, 9, 4, 0.75)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isMobile ? '16px' : '24px',
            animation: 'fadeIn 0.25s ease'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLeader(null);
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: isMobile ? '24px' : '36px',
              maxWidth: '780px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 60px rgba(0,0,0,0.35)',
              border: '1px solid var(--kraft-200)',
              position: 'relative',
              animation: 'fadeInUp 0.3s ease',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Top Banner (Dark ink luxury gradient + eco green accents) */}
            <div
              style={{
                background: 'linear-gradient(135deg, #1a1208 0%, #2d2617 50%, #1a1208 100%)',
                padding: isMobile ? '24px 20px' : '32px 40px',
                color: 'white',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: isMobile ? 16 : 24,
                borderTopLeftRadius: isMobile ? '24px' : '36px',
                borderTopRightRadius: isMobile ? '24px' : '36px',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedLeader(null)}
                aria-label="Close bio"
                style={{
                  position: 'absolute',
                  top: isMobile ? 16 : 24,
                  right: isMobile ? 16 : 24,
                  width: 38,
                  height: 38,
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#4ade80',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#4ade80';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <X size={20} />
              </button>

              {/* Founder Thumbnail */}
              <div
                style={{
                  width: isMobile ? 72 : 96,
                  height: isMobile ? 72 : 96,
                  borderRadius: '18px',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid rgba(255, 255, 255, 0.25)',
                  boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
                  background: '#2d2617'
                }}
              >
                <img
                  src={selectedLeader.image}
                  alt={selectedLeader.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
                />
              </div>

              {/* Name & Title */}
              <div style={{ paddingRight: 40 }}>
                <h3
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: isMobile ? 22 : 28,
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: 4,
                    lineHeight: 1.2
                  }}
                >
                  {selectedLeader.name}
                </h3>
                <p
                  style={{
                    color: 'var(--eco-400)',
                    fontSize: isMobile ? 13 : 15,
                    fontWeight: 600,
                    letterSpacing: '0.05em'
                  }}
                >
                  {selectedLeader.role}
                </p>
              </div>
            </div>

            {/* Scrollable Body Content */}
            <div
              style={{
                padding: isMobile ? '24px 20px' : '36px 40px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
                background: 'white'
              }}
            >
              {selectedLeader.paragraphs.map((p, pIdx) => (
                <p
                  key={pIdx}
                  style={{
                    color: 'var(--kraft-800)',
                    fontSize: isMobile ? 15 : 16,
                    lineHeight: 1.8,
                    margin: 0
                  }}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Modal Footer (only if leader has LinkedIn) */}
            {selectedLeader.linkedin && (
              <div
                style={{
                  padding: isMobile ? '16px 20px' : '20px 40px',
                  background: 'var(--kraft-50)',
                  borderTop: '1px solid var(--kraft-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  borderBottomLeftRadius: isMobile ? '24px' : '36px',
                  borderBottomRightRadius: isMobile ? '24px' : '36px'
                }}
              >
                <a
                  href={selectedLeader.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    color: 'var(--eco-700)',
                    textDecoration: 'none',
                    transition: 'color 0.2s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--eco-800)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--eco-700)'}
                >
                  <span>Connect on LinkedIn</span>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: 'var(--eco-600)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Linkedin size={14} />
                  </div>
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════ PAGE POPUP ══════════════════ */}
      <PagePopup pageType="about" />

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
