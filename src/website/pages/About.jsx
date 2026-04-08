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
  { icon: TreePine, title: 'Ethical Sourcing', desc: 'We source kraft paper from managed forests where for every tree harvested, three are planted.', image: '/images/generated/step_ethical_sourcing_1775638363093.png' },
  { icon: Droplets, title: 'Non-Toxic Printing', desc: 'Our presses run exclusively on soy and water-based inks that contain zero heavy metals or harmful VOCs.', image: '/images/generated/step_nontoxic_printing_1775638380421.png' },
  { icon: Truck, title: 'Efficient Transit', desc: 'Bags are packed in optimised kraft cartons, eliminating transit plastics completely while reducing volumetric weight.', image: '/images/generated/step_efficient_transit_1775638398608.png' },
  { icon: Recycle, title: '100% Compostable', desc: 'Once the bag\'s lifespan concludes, it returns safely to the earth within 90 days without leaving microplastics.', image: '/images/generated/step_compostable_1775638415138.png' },
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


      {/* ── Our Philosophy (Values Section) ── */}
      <section className="section-padding nature-section" style={{ background: 'var(--kraft-50)', overflow: 'hidden' }}>
        <div className="nature-layer-wood" style={{ opacity: 0.03 }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: 60,
            alignItems: 'center'
          }}>

            {/* Left Column: Visual & Quote (Driven by Design reference) */}
            <div className="anim-fade-up-slow" style={{ position: 'relative', width: '100%', maxWidth: '480px', margin: '0 auto' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <img
                  src="/images/generated/about_philosophy_feature_1775591345213.png"
                  alt="Sustainable Handcrafting"
                  style={{
                    width: '100%',
                    display: 'block',
                    borderRadius: 'var(--radius-lg)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '8px solid white',
                  }}
                />

                {/* Floating Quote Box */}
                <div className="glass-card anim-float" style={{
                  position: 'absolute',
                  bottom: '-10%',
                  right: '-10%',
                  padding: '40px',
                  maxWidth: '340px',
                  borderRadius: 'var(--radius-md)',
                  zIndex: 2
                }}>
                  <p style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: 18,
                    color: 'var(--kraft-950)',
                    lineHeight: 1,
                    marginBottom: 16
                  }}>
                    "We believe every fold tells a story of craftsmanship, and every bag represents a commitment to our planet's future."
                  </p>
                  <p style={{
                    fontSize: 12,
                    fontWeight: 700,
                    letterSpacing: '0.1em',
                    color: 'var(--kraft-500)',
                    textTransform: 'uppercase'
                  }}>
                    Anjali Nair <span style={{ fontWeight: 400, color: 'var(--kraft-300)' }}>— Founder</span>
                  </p>
                </div>

                {/* Decorative background element behind image */}
                <div style={{
                  position: 'absolute',
                  bottom: -20,
                  left: -20,
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  background: 'var(--eco-100)',
                  borderRadius: 'var(--radius-lg)',
                  zIndex: -1,
                  opacity: 0.4
                }} />
              </div>
            </div>

            {/* Right Column: Values Content */}
            <div className="anim-fade-up">
              <div className="section-label">Who We Are</div>
              <h2 className="section-title">Luxury reimagined through a Green lens</h2>
              <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.75, marginBottom: 40 }}>
                Today, we stand as a beacon for sustainable retail, helping thousands of brands transition
                from plastic to premium paper packaging without compromising on their brand's visual identity.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.75 }}>
                  Every product that leaves our facility is a testament to our dedication to preserving the planet. By choosing Nirmalyam Krafts, you are not just selecting a packaging supplier; you are partnering with a movement towards a cleaner, greener earth.
                </p>
                <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.75 }}>
                  Our team of expert designers and craftsmen work tirelessly to ensure that structural integrity and aesthetic appeal go hand-in-hand. From concept to creation, we infuse sustainability into every step of the journey, ensuring your brand story is told responsibly.
                </p>
                <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.75 }}>
                  We believe that luxury and sustainability are not mutually exclusive. Through innovative techniques and carefully selected materials, we deliver an unboxing experience that delights your customers and respects our environment.
                </p>
              </div>
            </div>
          </div>

          {/* Premium Value Cards Grid */}
          <div className="values-grid">
            {[
              {
                title: "Artisanal Craft",
                desc: "Each fold and crease is meticulously inspected by our artisans, ensuring a flawless finish for high-end retail.",
                image: "/images/generated/value_artisanal_bg_1775593537038.png"
              },
              {
                title: "Earth-First Ethos",
                desc: "Sourcing FSC-certified papers, soy-based inks, and organic adhesives to maintain a zero-toxicity production loop.",
                image: "/images/generated/value_earth_bg_1775593576211.png"
              },
              {
                title: "Partner Centric",
                desc: "We don't just supply bags; we partner with your brand to conceptualize structural packaging that elevates your unboxing experience.",
                image: "/images/generated/value_partner_bg_1775593617346.png"
              }
            ].map((value, idx) => (
              <div key={idx} className="value-feature-card anim-fade-up" style={{ animationDelay: `${idx * 0.2}s` }}>
                <div
                  className="bg-img"
                  style={{ backgroundImage: `url(${value.image})` }}
                />
                <div className="overlay" />
                <div className="content">
                  <h3 className="value-title">{value.title}</h3>
                  <p className="value-desc">{value.desc}</p>
                </div>
              </div>
            ))}
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 28 }}>
            {greenPrint.map(({ icon: Icon, title, desc, image }, i) => (
              <div key={title} style={{
                background: 'white',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--kraft-100)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                display: 'flex',
                flexDirection: 'column'
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--eco-500)';
                  e.currentTarget.style.transform = 'translateY(-6px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  const img = e.currentTarget.querySelector('.step-video-sim');
                  if (img) img.style.transform = 'scale(1.1)';
                  const iconwrap = e.currentTarget.querySelector('.play-btn');
                  if (iconwrap) {
                    iconwrap.style.background = 'var(--eco-600)';
                    iconwrap.children[0].style.borderLeftColor = 'white';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--kraft-100)';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  const img = e.currentTarget.querySelector('.step-video-sim');
                  if (img) img.style.transform = 'scale(1)';
                  const iconwrap = e.currentTarget.querySelector('.play-btn');
                  if (iconwrap) {
                    iconwrap.style.background = 'rgba(255,255,255,0.9)';
                    iconwrap.children[0].style.borderLeftColor = 'var(--eco-600)';
                  }
                }}
              >
                {/* Simulated "Video" container */}
                <div style={{
                  width: '100%',
                  height: '180px',
                  overflow: 'hidden',
                  position: 'relative',
                  borderBottom: '1px solid var(--kraft-100)'
                }}>
                   {/* Play button overlay */}
                   <div style={{
                     position: 'absolute',
                     inset: 0,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                     zIndex: 2,
                     pointerEvents: 'none',
                     background: 'rgba(0,0,0,0.15)'
                   }}>
                     <div className="play-btn" style={{
                       width: 48, height: 48, 
                       background: 'rgba(255,255,255,0.9)', 
                       borderRadius: '50%',
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                       backdropFilter: 'blur(4px)',
                       transition: 'all 0.3s ease'
                     }}>
                       <div style={{ 
                         width: 0, height: 0, 
                         borderTop: '7px solid transparent', 
                         borderBottom: '7px solid transparent', 
                         borderLeft: '12px solid var(--eco-600)', 
                         marginLeft: 4,
                         transition: 'all 0.3s ease'
                       }} />
                     </div>
                   </div>
                   <img 
                     src={image} 
                     alt={`${title} Video Preview`}
                     className="step-video-sim"
                     style={{
                       width: '100%',
                       height: '100%',
                       objectFit: 'cover',
                       transition: 'transform 8s ease-out',
                       transform: 'scale(1)'
                     }}
                   />
                </div>
                
                <div style={{ padding: '28px 24px', flexGrow: 1, position: 'relative' }}>
                  <div style={{
                    width: 48, height: 48,
                    borderRadius: 14,
                    background: 'var(--eco-50)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 16,
                    border: '1px solid var(--eco-100)'
                  }}>
                    <Icon size={20} color="var(--eco-600)" />
                  </div>
                  
                  <div style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'var(--eco-600)',
                    marginBottom: 10,
                  }}>
                    Step {i + 1}
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 12, lineHeight: 1.3 }}>{title}</h3>
                  <p style={{ fontSize: 15, color: 'var(--kraft-500)', lineHeight: 1.65 }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Quality ── */}
      <section className="section-padding nature-section" style={{
        background: 'white',
        position: 'relative'
      }}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.2fr)', 
            gap: 100, 
            alignItems: 'center' 
          }}>
            
            <div className="anim-fade-up-slow">
              <div style={{ position: 'relative' }}>
                <img 
                  src="/images/generated/quality_standards_feature.png" 
                  alt="Quality Assurance" 
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-xl)',
                    boxShadow: 'var(--shadow-xl)',
                    border: '10px solid var(--kraft-50)'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: -30,
                  right: -30,
                  width: 140,
                  height: 140,
                  background: 'var(--kraft-500)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  textAlign: 'center',
                  padding: 20,
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  boxShadow: 'var(--shadow-lg)',
                  border: '4px solid white',
                  animation: 'float 6s ease-in-out infinite'
                }}>
                  Premium<br />Standards
                </div>
              </div>
            </div>

            <div className="anim-fade-up">
              <div className="section-label">Excellence Guaranteed</div>
              <h2 className="section-title">Consistent Quality</h2>
              <p className="section-subtitle" style={{ marginBottom: 48 }}>
                We believe that every piece of packaging is a promise. We adhere to stringent ISO-grade checks ensuring every bag performs flawlessly and represents your brand with distinction.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {qualityPillars.map(({ icon: Icon, title, desc }) => (
                  <div key={title} style={{
                    background: 'var(--kraft-50)',
                    padding: 32,
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--kraft-100)',
                    transition: 'all 0.3s ease'
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = 'var(--eco-500)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--kraft-50)';
                      e.currentTarget.style.borderColor = 'var(--kraft-100)';
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ 
                      width: 44, height: 44, 
                      background: 'white', 
                      borderRadius: 12, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      marginBottom: 16,
                      boxShadow: 'var(--shadow-sm)'
                    }}>
                      <Icon size={20} color="var(--eco-600)" />
                    </div>
                    <h4 style={{ fontWeight: 700, fontSize: 16, color: 'var(--kraft-900)', marginBottom: 10 }}>{title}</h4>
                    <p style={{ fontSize: 13, color: 'var(--kraft-500)', lineHeight: 1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="nature-section" style={{
        padding: '120px 0',
        textAlign: 'center',
        background: 'var(--ink-950)',
        position: 'relative'
      }}>
        {/* Immersive background image with Ken Burns effect */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/images/generated/cta_forest_bg.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          animation: 'kenBurns 30s linear infinite alternate',
          opacity: 0.6
        }} />

        {/* Floating Leaves Overlay */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 10}%`,
            width: 20 + Math.random() * 20,
            height: 20 + Math.random() * 20,
            animation: `drift ${15 + Math.random() * 15}s linear infinite`,
            animationDelay: `${Math.random() * 10}s`,
            opacity: 0,
            pointerEvents: 'none'
          }}>
            <Leaf color="var(--eco-400)" size={32} style={{ filter: 'blur(1px)' }} />
          </div>
        ))}

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to bottom, rgba(14, 9, 4, 0.7), rgba(14, 9, 4, 0.3), rgba(14, 9, 4, 0.7))',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2 }}>
          <div className="anim-fade-up">
            <div style={{
              width: 80, height: 80,
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 32px',
              border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <Leaf size={40} color="var(--eco-400)" className="animate-leaf-float" />
            </div>
            
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 6vw, 64px)',
              color: 'white',
              marginBottom: 20,
              lineHeight: 1.1,
              fontWeight: 600,
              textShadow: '0 4px 12px rgba(0,0,0,0.4)'
            }}>
              Ready to Go <span style={{ color: 'var(--eco-400)' }}>Plastic-Free?</span>
            </h2>
            
            <p style={{ 
              fontSize: 'clamp(18px, 2vw, 22px)', 
              color: 'rgba(255,255,255,0.9)', 
              marginBottom: 48, 
              maxWidth: 700, 
              margin: '0 auto 48px',
              lineHeight: 1.6,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Join 12,000+ brands that trust Nirmalyam for sustainable, premium packaging. Elevate your brand while protecting our planet.
            </p>
            
            <Link to="/contact" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              padding: '20px 56px',
              background: 'white',
              color: 'var(--ink-950)',
              borderRadius: 'var(--radius-full)',
              fontWeight: 800,
              fontSize: 16,
              textDecoration: 'none',
              transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}
              onMouseEnter={e => { 
                e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)'; 
                e.currentTarget.style.boxShadow = '0 30px 60px rgba(0,0,0,0.4)'; 
                e.currentTarget.style.background = 'var(--eco-500)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={e => { 
                e.currentTarget.style.transform = 'none'; 
                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.2)'; 
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.color = 'var(--ink-950)';
              }}
            >
              Start Your Eco-Journey <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
