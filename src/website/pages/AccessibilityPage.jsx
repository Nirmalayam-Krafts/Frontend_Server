import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Accessibility as AccessibilityIcon, Eye, Ear, MousePointer, Monitor, MessageCircle, Mail, ArrowRight, ChevronRight } from 'lucide-react';

const accessibilitySections = [
  {
    id: 'commitment', icon: AccessibilityIcon, title: 'Our Commitment',
    content: [
      { subtitle: 'Inclusive Design Philosophy', text: 'Nirmalyam Krafts is committed to ensuring that our website is accessible to all users, including people with disabilities. We believe that every individual deserves equal access to information about our sustainable packaging products and services.' },
      { subtitle: 'Standards We Follow', text: 'We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at the AA level. These guidelines are developed by the World Wide Web Consortium (W3C) and represent the international standard for web accessibility.' },
      { subtitle: 'Continuous Improvement', text: 'Accessibility is an ongoing effort. We regularly review and update our website to identify and address accessibility barriers. Our development team undergoes periodic accessibility training to stay current with best practices and emerging standards.' }
    ]
  },
  {
    id: 'visual', icon: Eye, title: 'Visual Accessibility',
    content: [
      { subtitle: 'Color Contrast', text: 'We maintain sufficient color contrast ratios throughout our website to ensure text and interactive elements are readable for users with low vision or color blindness. Our design system uses carefully selected color combinations that meet WCAG AA contrast requirements.' },
      { subtitle: 'Text Scaling', text: 'Our website supports browser-based text resizing up to 200% without loss of content or functionality. All text is set in relative units to ensure proper scaling. Users can also use their browser zoom functionality to increase or decrease page magnification.' },
      { subtitle: 'Alternative Text', text: 'All meaningful images on our website include descriptive alternative text (alt attributes) that convey the purpose and content of each image to screen reader users. Decorative images are appropriately marked to be ignored by assistive technologies.' }
    ]
  },
  {
    id: 'navigation', icon: MousePointer, title: 'Navigation & Interaction',
    content: [
      { subtitle: 'Keyboard Navigation', text: 'Our website is fully navigable using a keyboard alone. All interactive elements—including links, buttons, forms, and menus—can be accessed and operated using Tab, Enter, Space, and Arrow keys. Visible focus indicators highlight the currently focused element.' },
      { subtitle: 'Skip Navigation', text: 'We provide skip navigation links at the top of each page, allowing keyboard and screen reader users to bypass repetitive content and jump directly to the main content area. This improves navigation efficiency for assistive technology users.' },
      { subtitle: 'Consistent Layout', text: 'Our website maintains a consistent navigation structure and layout across all pages. This predictability helps users with cognitive disabilities orient themselves and find information efficiently. All pages follow the same structural hierarchy.' }
    ]
  },
  {
    id: 'assistive', icon: Monitor, title: 'Assistive Technology Support',
    content: [
      { subtitle: 'Screen Reader Compatibility', text: 'Our website is tested with popular screen readers including NVDA, JAWS, and VoiceOver. We use semantic HTML elements, ARIA landmarks, and proper heading hierarchy to ensure content is presented logically and navigably for screen reader users.' },
      { subtitle: 'Forms & Input', text: 'All form fields include associated labels, clear instructions, and meaningful error messages. Required fields are clearly indicated both visually and programmatically. Form validation messages are announced to screen readers and provide specific guidance for correction.' },
      { subtitle: 'Media Accessibility', text: 'Video content on our website includes captions where applicable. We strive to provide text alternatives for all multimedia content. Animations and auto-playing content can be paused or stopped by the user to prevent distraction or discomfort.' }
    ]
  },
  {
    id: 'feedback', icon: MessageCircle, title: 'Feedback & Support',
    content: [
      { subtitle: 'Report Barriers', text: 'If you encounter any accessibility barriers while using our website, we want to hear from you. Please contact our accessibility team with details about the issue, including the page URL, your browser and assistive technology, and a description of the problem.' },
      { subtitle: 'Alternative Access', text: 'If you are unable to access any content or feature on our website due to a disability, please contact us. We will work to provide the information in an alternative format or assist you in completing your desired task through an accessible means.' },
      { subtitle: 'Response Commitment', text: 'We aim to respond to all accessibility feedback within 2 business days. For urgent accessibility issues that prevent you from completing a purchase or accessing critical information, please call us directly for immediate assistance.' }
    ]
  }
];

const tocItems = accessibilitySections.map(s => ({ id: s.id, title: s.title }));

export default function AccessibilityPage() {
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, background: 'var(--kraft-50)' }}>
      {/* Hero */}
      <div className="page-hero" style={{
        position: 'relative', minHeight: isMobile ? '400px' : isTablet ? '420px' : '480px',
        display: 'flex', alignItems: 'center', padding: isMobile ? '100px 0 60px' : '120px 0 80px'
      }}>
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: isMobile ? 150 : 300, height: isMobile ? 150 : 300, background: 'radial-gradient(circle, rgba(192,168,117,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div className="eco-badge" style={{ marginBottom: 24, background: 'rgba(192,148,87,0.2)', color: 'var(--kraft-100)', borderColor: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }}>
              <AccessibilityIcon size={14} /> Inclusive By Design
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 72px)', color: 'white', fontWeight: 600, marginBottom: 24, lineHeight: 1.1 }}>
              Accessibility <span style={{ color: 'var(--kraft-300)' }}>Statement</span>
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
              We are committed to making our website accessible to everyone, ensuring that all users can explore our sustainable packaging solutions with ease.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 24, fontWeight: 500 }}>Last updated: June 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <section style={{ padding: isMobile ? '48px 0' : '64px 0' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: Eye, label: 'Visual', desc: 'High contrast' },
              { icon: MousePointer, label: 'Keyboard', desc: 'Full navigation' },
              { icon: Monitor, label: 'Screen Readers', desc: 'ARIA support' },
              { icon: Ear, label: 'WCAG 2.1', desc: 'AA compliant' }
            ].map((item, i) => (
              <div key={i} className="anim-fade-up" style={{ animationDelay: `${i * 0.1}s`, background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 16px', border: '1px solid var(--kraft-100)', textAlign: 'center', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ width: 48, height: 48, background: 'var(--kraft-50)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <item.icon size={24} color="var(--eco-600)" />
                </div>
                <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--kraft-950)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, color: 'var(--kraft-500)' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TOC */}
      <section>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div className="glass-card anim-fade-up" style={{ padding: isMobile ? '28px 24px' : '40px 48px', borderRadius: 'var(--radius-xl)', maxWidth: 900, margin: '0 auto', background: 'rgba(255,255,255,0.85)', border: '1px solid var(--kraft-200)' }}>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 20 : 24, color: 'var(--kraft-950)', marginBottom: 20, fontWeight: 700 }}>Quick Navigation</h3>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)', gap: 12 }}>
              {tocItems.map((item, idx) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'var(--kraft-50)', border: '1px solid var(--kraft-100)', borderRadius: 'var(--radius-md)', cursor: 'pointer', transition: 'all 0.3s ease', textAlign: 'left', fontFamily: "'Inter', sans-serif", fontSize: 15, color: 'var(--kraft-800)', fontWeight: 600 }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = 'var(--eco-400)'; e.currentTarget.style.transform = 'translateX(6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--kraft-50)'; e.currentTarget.style.borderColor = 'var(--kraft-100)'; e.currentTarget.style.transform = 'translateX(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <span style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--eco-600)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</span>
                  {item.title}
                  <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: isMobile ? '48px 0 80px' : '80px 0 120px' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {accessibilitySections.map((section, sIdx) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="anim-fade-up" style={{ animationDelay: `${sIdx * 0.1}s`, marginBottom: sIdx < accessibilitySections.length - 1 ? (isMobile ? 48 : 64) : 0, scrollMarginTop: 120 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
                    <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(22,163,74,0.25)', flexShrink: 0 }}>
                      <Icon size={24} color="white" />
                    </div>
                    <div>
                      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--eco-600)' }}>Section {sIdx + 1}</span>
                      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 24 : 32, fontWeight: 700, color: 'var(--kraft-950)', lineHeight: 1.2, margin: 0 }}>{section.title}</h2>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {section.content.map((item, cIdx) => (
                      <div key={cIdx} style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: isMobile ? '28px 24px' : '36px 40px', border: '1px solid var(--kraft-100)', transition: 'all 0.4s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--kraft-300)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--kraft-100)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        <h4 style={{ fontWeight: 700, fontSize: isMobile ? 17 : 19, color: 'var(--kraft-950)', marginBottom: 12 }}>{item.subtitle}</h4>
                        <p style={{ fontSize: isMobile ? 15 : 16, color: 'var(--kraft-600)', lineHeight: 1.8, margin: 0 }}>{item.text}</p>
                      </div>
                    ))}
                  </div>
                  {sIdx < accessibilitySections.length - 1 && <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--kraft-200), transparent)', marginTop: isMobile ? 48 : 64 }} />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ paddingTop: isMobile ? '80px' : '120px', paddingBottom: isMobile ? '100px' : '140px', textAlign: 'center', background: 'var(--ink-950)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, rgba(45,38,23,0.95) 0%, rgba(14,9,4,0.98) 100%)', zIndex: 0 }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")", pointerEvents: 'none', zIndex: 1 }} />
        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '1440px' }}>
          <div className="anim-fade-up">
            <div style={{ width: 64, height: 64, background: 'rgba(255,255,255,0.08)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Mail size={28} color="var(--eco-400)" />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 48px)', color: 'white', marginBottom: 20, lineHeight: 1.15, fontWeight: 600 }}>
              Accessibility <br /><span className="text-gradient">Feedback?</span>
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 18, color: 'rgba(255,255,255,0.6)', maxWidth: 550, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Help us improve. Report accessibility barriers and we will work promptly to address them.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(22,163,74,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.3)'; }}
              >Contact Us <ArrowRight size={18} /></Link>
              <a href="mailto:accessibility@nirmalyamkrafts.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
              ><Mail size={18} /> Report an Issue</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
