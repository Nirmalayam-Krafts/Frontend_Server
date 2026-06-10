import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, PackageCheck, Clock, AlertCircle, CheckCircle, Truck, Mail, ArrowRight, ChevronRight } from 'lucide-react';

const returnsSections = [
  {
    id: 'eligibility', icon: CheckCircle, title: 'Return Eligibility',
    content: [
      { subtitle: 'Standard Products', text: 'Unused and unopened standard kraft bags and packaging products may be returned within 15 days of delivery. Items must be in their original condition with all tags, labels, and packaging intact. Products that have been used, washed, or altered in any way are not eligible for return.' },
      { subtitle: 'Custom & Branded Orders', text: 'Due to the personalized nature of custom-printed and branded packaging, these items cannot be returned or exchanged unless they arrive with manufacturing defects, printing errors not matching the approved proof, or damage during transit.' },
      { subtitle: 'Bulk & Wholesale Orders', text: 'Bulk orders exceeding 500 units are subject to a restocking fee of 15% of the order value. Returns for bulk orders must be initiated within 7 days of delivery and require prior authorization from our customer service team.' }
    ]
  },
  {
    id: 'process', icon: RotateCcw, title: 'Return Process',
    content: [
      { subtitle: 'Initiating a Return', text: 'To start a return, contact our customer service team at returns@nirmalyamkrafts.com or call us during business hours. Provide your order number, photos of the product, and reason for return. Our team will respond within 24 hours with a Return Merchandise Authorization (RMA) number.' },
      { subtitle: 'Packaging & Shipping', text: 'Once your return is approved, securely package the items in their original packaging. Include the RMA number on the outside of the package. Ship the items to the address provided by our team. We recommend using a trackable shipping method for your protection.' },
      { subtitle: 'Inspection & Processing', text: 'Upon receiving your return, our quality team will inspect the items within 3-5 business days. You will be notified via email once the inspection is complete and your return has been accepted or if any issues are identified.' }
    ]
  },
  {
    id: 'refunds', icon: PackageCheck, title: 'Refunds',
    content: [
      { subtitle: 'Refund Method', text: 'Approved refunds will be processed to the original payment method used during purchase. Credit/debit card refunds typically appear within 7-10 business days. Bank transfers may take up to 14 business days depending on your financial institution.' },
      { subtitle: 'Partial Refunds', text: 'Partial refunds may be granted in cases where items show signs of use, are returned after the 15-day window but within 30 days, or are missing original packaging. The refund amount will be determined after inspection and communicated to you before processing.' },
      { subtitle: 'Non-Refundable Items', text: 'Shipping charges, express delivery fees, and any customization fees are non-refundable. Gift cards, sample kits, and clearance items marked as "final sale" are also excluded from our refund policy.' }
    ]
  },
  {
    id: 'defective', icon: AlertCircle, title: 'Defective & Damaged Items',
    content: [
      { subtitle: 'Reporting Defects', text: 'If you receive defective or damaged products, please report the issue within 48 hours of delivery. Include clear photographs showing the defect or damage, along with your order number. We take quality issues very seriously and will prioritize your case.' },
      { subtitle: 'Resolution Options', text: 'For verified defective items, we offer a full replacement at no additional cost, a complete refund including original shipping charges, or store credit with a 10% bonus value. The choice is yours, and we aim to resolve all defect claims within 5 business days.' },
      { subtitle: 'Quality Guarantee', text: 'Every Nirmalyam Krafts product undergoes a 12-point quality inspection before shipping. In the rare event of a quality lapse, we take full responsibility and ensure you receive products that meet our premium standards.' }
    ]
  },
  {
    id: 'exchanges', icon: Truck, title: 'Exchanges',
    content: [
      { subtitle: 'Exchange Policy', text: 'We offer exchanges for standard products within 15 days of delivery. Exchanges are subject to product availability. If the desired replacement is of higher value, you will be charged the difference. If lower, a store credit for the balance will be issued.' },
      { subtitle: 'Exchange Process', text: 'To request an exchange, follow the same process as returns. Once your original item is received and inspected, the replacement will be shipped within 3-5 business days. You will receive tracking information for the replacement shipment.' },
      { subtitle: 'Size & Specification Changes', text: 'If you need a different size or specification of the same product, we are happy to facilitate an exchange at no additional shipping cost for the first exchange. Subsequent exchanges may incur standard shipping charges.' }
    ]
  }
];

const tocItems = returnsSections.map(s => ({ id: s.id, title: s.title }));

export default function ReturnsPolicy() {
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
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, background: 'radial-gradient(circle, rgba(22,163,74,0.15) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: isMobile ? 150 : 300, height: isMobile ? 150 : 300, background: 'radial-gradient(circle, rgba(192,168,117,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div className="eco-badge" style={{ marginBottom: 24, background: 'rgba(192,148,87,0.2)', color: 'var(--kraft-100)', borderColor: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }}>
              <RotateCcw size={14} /> Hassle-Free Returns
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 72px)', color: 'white', fontWeight: 600, marginBottom: 24, lineHeight: 1.1 }}>
              Returns <span style={{ color: 'var(--kraft-300)' }}>Policy</span>
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
              Your satisfaction is our priority. We offer a straightforward returns process that reflects the same care we put into crafting our packaging.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 24, fontWeight: 500 }}>Last updated: June 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Quick Highlights */}
      <section style={{ padding: isMobile ? '48px 0' : '64px 0' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: Clock, label: '15-Day Window', desc: 'For standard products' },
              { icon: PackageCheck, label: 'Free Returns', desc: 'On defective items' },
              { icon: RotateCcw, label: 'Easy Exchanges', desc: 'Quick replacement process' }
            ].map((item, i) => (
              <div key={i} className="anim-fade-up" style={{ animationDelay: `${i * 0.15}s`, background: 'white', borderRadius: 'var(--radius-lg)', padding: isMobile ? '24px 20px' : '28px 32px', border: '1px solid var(--kraft-100)', textAlign: 'center', transition: 'all 0.3s ease' }}
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
      <section style={{ padding: '0 0 0' }}>
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
            {returnsSections.map((section, sIdx) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="anim-fade-up" style={{ animationDelay: `${sIdx * 0.1}s`, marginBottom: sIdx < returnsSections.length - 1 ? (isMobile ? 48 : 64) : 0, scrollMarginTop: 120 }}>
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
                  {sIdx < returnsSections.length - 1 && <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--kraft-200), transparent)', marginTop: isMobile ? 48 : 64 }} />}
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
              Need to Return <br /><span className="text-gradient">Something?</span>
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 18, color: 'rgba(255,255,255,0.6)', maxWidth: 550, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Our customer care team will guide you through every step of the return process.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(22,163,74,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.3)'; }}
              >Contact Us <ArrowRight size={18} /></Link>
              <a href="mailto:returns@nirmalyamkrafts.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
              ><Mail size={18} /> Email Returns Team</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
