import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ShieldCheck, Scale, AlertTriangle, Handshake, Ban, Mail, ArrowRight, ChevronRight } from 'lucide-react';

const termsSections = [
  {
    id: 'acceptance', icon: Handshake, title: 'Acceptance of Terms',
    content: [
      { subtitle: 'Agreement to Terms', text: 'By accessing or using the Nirmalyam Krafts website, placing an order, or engaging with our services, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website or services.' },
      { subtitle: 'Eligibility', text: 'You must be at least 18 years of age or the legal age of majority in your jurisdiction to use our services. By using our website, you represent and warrant that you meet this requirement and have the legal capacity to enter into binding agreements.' },
      { subtitle: 'Modifications', text: 'Nirmalyam Krafts reserves the right to update or modify these Terms of Service at any time without prior notice. Your continued use of the website after changes are posted constitutes your acceptance of the revised terms.' }
    ]
  },
  {
    id: 'orders-pricing', icon: FileText, title: 'Orders & Pricing',
    content: [
      { subtitle: 'Order Placement', text: 'All orders placed through our website or via direct communication are subject to acceptance by Nirmalyam Krafts. We reserve the right to refuse or cancel any order for reasons including product availability, pricing errors, or suspected fraudulent activity.' },
      { subtitle: 'Pricing & Payment', text: 'All prices listed on our website are in Indian Rupees (INR) unless otherwise stated. Prices are subject to change without notice. For custom and bulk orders, pricing will be provided via a formal quotation. Payment must be received before production begins.' },
      { subtitle: 'Custom Orders', text: 'Custom packaging orders require a minimum order quantity (MOQ) as specified during the quotation process. Once a custom order is confirmed and production has commenced, it cannot be cancelled or modified. Design proofs must be approved in writing before production begins.' }
    ]
  },
  {
    id: 'intellectual-property', icon: ShieldCheck, title: 'Intellectual Property',
    content: [
      { subtitle: 'Our Content', text: 'All content on the Nirmalyam Krafts website—including text, graphics, logos, images, product designs, and software—is the property of Nirmalyam Krafts and is protected by Indian and international copyright, trademark, and intellectual property laws.' },
      { subtitle: 'Limited License', text: 'You are granted a limited, non-exclusive, non-transferable license to access and use our website for personal or business purchasing purposes. You may not reproduce, distribute, modify, or commercially exploit any content without our prior written consent.' },
      { subtitle: 'Your Content', text: 'When you submit designs, logos, or artwork for custom orders, you represent that you own or have the necessary rights to use such content. You grant Nirmalyam Krafts a non-exclusive license to use your submitted content solely for fulfilling your order.' }
    ]
  },
  {
    id: 'liability', icon: AlertTriangle, title: 'Limitation of Liability',
    content: [
      { subtitle: 'Service Disclaimer', text: 'Our website and services are provided on an "as is" and "as available" basis. While we strive for accuracy, Nirmalyam Krafts makes no warranties regarding the completeness, reliability, or accuracy of the information, products, or services offered.' },
      { subtitle: 'Liability Cap', text: 'To the maximum extent permitted by law, Nirmalyam Krafts shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services. Our total liability shall not exceed the amount paid by you for the specific order.' },
      { subtitle: 'Force Majeure', text: 'Nirmalyam Krafts shall not be held liable for any delay or failure to perform obligations due to circumstances beyond our reasonable control, including natural disasters, pandemics, government actions, or supply chain disruptions.' }
    ]
  },
  {
    id: 'prohibited-uses', icon: Ban, title: 'Prohibited Uses',
    content: [
      { subtitle: 'Restricted Activities', text: 'You may not use our website for any unlawful purpose, to solicit others to perform unlawful acts, to violate any regulations, to infringe upon our intellectual property rights, to harass or discriminate, or to submit false or misleading information.' },
      { subtitle: 'Technical Restrictions', text: "You agree not to attempt to gain unauthorized access to our systems, introduce malware, use automated tools to scrape data, interfere with the website's security features, or engage in any activity that disrupts our services." },
      { subtitle: 'Consequences', text: 'Violation of these terms may result in immediate termination of your access to our website and services, cancellation of pending orders, and potential legal action. We reserve the right to report suspected illegal activities to the appropriate authorities.' }
    ]
  },
  {
    id: 'governing-law', icon: Scale, title: 'Governing Law & Disputes',
    content: [
      { subtitle: 'Applicable Law', text: 'These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts in Kerala, India.' },
      { subtitle: 'Dispute Resolution', text: 'In the event of any dispute, we encourage you to first contact us directly for an amicable resolution. If unresolved, both parties agree to submit to binding arbitration in accordance with the Arbitration and Conciliation Act, 1996.' },
      { subtitle: 'Severability', text: 'If any provision of these Terms is found to be unenforceable or invalid, that provision shall be limited or eliminated to the minimum extent necessary, and the remaining provisions shall continue in full force and effect.' }
    ]
  }
];

const tocItems = termsSections.map(s => ({ id: s.id, title: s.title }));

export default function TermsOfService() {
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
    <div className="site-page-container" style={{ minHeight: '100vh', background: 'var(--kraft-50)' }}>
      {/* Hero */}
      <div className="page-hero" style={{
        position: 'relative', minHeight: isMobile ? '400px' : isTablet ? '420px' : '480px',
        display: 'flex', alignItems: 'center', padding: isMobile ? '100px 0 60px' : '120px 0 80px'
      }}>
        <div style={{ position: 'absolute', top: '15%', right: '8%', width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, background: 'radial-gradient(circle, rgba(192,168,117,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '5%', width: isMobile ? 150 : 300, height: isMobile ? 150 : 300, background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div className="eco-badge" style={{ marginBottom: 24, background: 'rgba(192,148,87,0.2)', color: 'var(--kraft-100)', borderColor: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }}>
              <Scale size={14} /> Fair & Transparent
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 72px)', color: 'white', fontWeight: 600, marginBottom: 24, lineHeight: 1.1 }}>
              Terms of <span style={{ color: 'var(--kraft-300)' }}>Service</span>
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
              Clear terms that govern our partnership. We believe in transparency and mutual respect in every business relationship.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 24, fontWeight: 500 }}>Last updated: June 1, 2026</p>
          </div>
        </div>
      </div>

      {/* TOC */}
      <section style={{ padding: isMobile ? '48px 0 0' : '64px 0 0' }}>
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
            {termsSections.map((section, sIdx) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="anim-fade-up" style={{ animationDelay: `${sIdx * 0.1}s`, marginBottom: sIdx < termsSections.length - 1 ? (isMobile ? 48 : 64) : 0, scrollMarginTop: 120 }}>
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
                  {sIdx < termsSections.length - 1 && <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--kraft-200), transparent)', marginTop: isMobile ? 48 : 64 }} />}
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
              Questions About Our <br /><span className="text-gradient">Terms?</span>
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 18, color: 'rgba(255,255,255,0.6)', maxWidth: 550, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Our team is happy to clarify any aspect of our Terms of Service. Don't hesitate to reach out.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(22,163,74,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.3)'; }}
              >Contact Us <ArrowRight size={18} /></Link>
              <a href="mailto:legal@nirmalyamkrafts.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
              ><Mail size={18} /> Email Legal Team</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
