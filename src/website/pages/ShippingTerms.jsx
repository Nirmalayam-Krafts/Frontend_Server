import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Package, MapPin, Clock, Globe, ShieldCheck, Mail, ArrowRight, ChevronRight } from 'lucide-react';

const shippingSections = [
  {
    id: 'domestic', icon: Truck, title: 'Domestic Shipping',
    content: [
      { subtitle: 'Standard Delivery', text: 'Standard domestic shipping is available across all pin codes in India. Delivery typically takes 5-7 business days from the date of dispatch. Orders are processed within 1-2 business days after payment confirmation, and you will receive tracking details via email and SMS.' },
      { subtitle: 'Express Delivery', text: 'Express delivery is available for select metro cities including Mumbai, Delhi, Bangalore, Chennai, Kolkata, and Hyderabad. Express orders are delivered within 2-3 business days. An additional express shipping fee applies and will be calculated at checkout.' },
      { subtitle: 'Shipping Charges', text: 'Standard shipping is complimentary for orders above ₹5,000. For orders below this threshold, a flat shipping fee of ₹149 applies. Express shipping charges vary by destination and order weight, and are displayed at checkout before payment.' }
    ]
  },
  {
    id: 'international', icon: Globe, title: 'International Shipping',
    content: [
      { subtitle: 'Coverage', text: 'We ship to over 30 countries worldwide including the United States, United Kingdom, Canada, Australia, UAE, Singapore, and across the European Union. International shipping availability may vary based on destination country regulations and customs requirements.' },
      { subtitle: 'Delivery Timeline', text: 'International shipments typically take 10-21 business days depending on the destination country, customs clearance, and local postal service efficiency. Express international shipping (5-7 business days) is available for select countries at additional cost.' },
      { subtitle: 'Duties & Taxes', text: 'International orders may be subject to import duties, taxes, and customs fees imposed by the destination country. These charges are the responsibility of the buyer and are not included in the shipping cost or product price displayed on our website.' }
    ]
  },
  {
    id: 'bulk-orders', icon: Package, title: 'Bulk & Wholesale Shipping',
    content: [
      { subtitle: 'Volume Shipping', text: 'For bulk orders exceeding 1,000 units, we offer customized shipping solutions including freight forwarding, palletized shipping, and door-to-door delivery. Shipping costs for bulk orders are calculated based on volume, weight, and destination.' },
      { subtitle: 'Dedicated Logistics', text: 'Wholesale clients benefit from our partnerships with leading logistics providers. We offer dedicated pickup scheduling, consolidated shipments, and priority handling to ensure your bulk orders arrive on time and in perfect condition.' },
      { subtitle: 'Warehousing', text: 'For recurring orders, we offer warehousing and scheduled dispatch services. Store your packaging inventory at our facility and schedule deliveries as needed, reducing storage costs and ensuring just-in-time availability for your business.' }
    ]
  },
  {
    id: 'tracking', icon: MapPin, title: 'Order Tracking',
    content: [
      { subtitle: 'Real-Time Tracking', text: 'Every shipment comes with a unique tracking number sent to your registered email and phone number. Track your order in real-time through our website or directly on the logistics partner\'s platform. Status updates include dispatch, in-transit, out for delivery, and delivered.' },
      { subtitle: 'Delivery Notifications', text: 'You will receive automated notifications at key stages of delivery: when your order is dispatched, when it reaches the nearest distribution hub, when it is out for delivery, and upon successful delivery. All notifications are sent via email and SMS.' },
      { subtitle: 'Delivery Issues', text: 'If your tracking shows no movement for more than 5 business days (domestic) or 14 business days (international), please contact our support team immediately. We will coordinate with the logistics partner to locate your shipment and provide a resolution.' }
    ]
  },
  {
    id: 'packaging-care', icon: ShieldCheck, title: 'Packaging & Handling',
    content: [
      { subtitle: 'Eco-Friendly Packaging', text: 'True to our sustainability commitment, all shipments are packed using recyclable and biodegradable materials. We use kraft paper cushioning, cornstarch packing peanuts, and recycled cardboard boxes to protect your order during transit.' },
      { subtitle: 'Quality Protection', text: 'Each product is individually wrapped and secured to prevent damage during transportation. Fragile items receive additional protective layers. Our packaging is designed to withstand the rigors of domestic and international shipping.' },
      { subtitle: 'Delivery Conditions', text: 'Please inspect your package upon delivery. If the outer packaging appears damaged, note it with the delivery person and photograph the package before opening. Report any transit damage to us within 48 hours of delivery for prompt resolution.' }
    ]
  },
  {
    id: 'policies', icon: Clock, title: 'Shipping Policies',
    content: [
      { subtitle: 'Processing Time', text: 'Standard orders are processed within 1-2 business days. Custom and printed orders require additional production time of 7-14 business days before dispatch. Business days exclude weekends and public holidays. You will be notified once your order is dispatched.' },
      { subtitle: 'Address Accuracy', text: 'Please ensure your shipping address is complete and accurate. Nirmalyam Krafts is not responsible for delays or non-delivery due to incorrect or incomplete address information. Address changes after dispatch may not be possible and could incur additional charges.' },
      { subtitle: 'Undeliverable Packages', text: 'If a package is returned to us due to an incorrect address, failed delivery attempts, or refusal, we will contact you to arrange re-shipment. Additional shipping charges will apply for re-dispatch. Unclaimed packages will be held for 30 days before being processed as abandoned.' }
    ]
  }
];

const tocItems = shippingSections.map(s => ({ id: s.id, title: s.title }));

export default function ShippingTerms() {
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
        <div style={{ position: 'absolute', top: '20%', right: '10%', width: isMobile ? 200 : 400, height: isMobile ? 200 : 400, background: 'radial-gradient(circle, rgba(192,168,117,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(60px)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: isMobile ? 150 : 300, height: isMobile ? 150 : 300, background: 'radial-gradient(circle, rgba(22,163,74,0.12) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', pointerEvents: 'none' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div className="eco-badge" style={{ marginBottom: 24, background: 'rgba(192,148,87,0.2)', color: 'var(--kraft-100)', borderColor: 'rgba(255,255,255,0.2)', margin: '0 auto 24px' }}>
              <Truck size={14} /> Reliable Delivery
            </div>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(36px, 6vw, 72px)', color: 'white', fontWeight: 600, marginBottom: 24, lineHeight: 1.1 }}>
              Shipping <span style={{ color: 'var(--kraft-300)' }}>Terms</span>
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '20px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
              From our workshop to your doorstep—delivered with the same care we put into crafting every product, using eco-friendly packaging throughout.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 24, fontWeight: 500 }}>Last updated: June 1, 2026</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <section style={{ padding: isMobile ? '48px 0' : '64px 0' }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { value: '₹5K+', label: 'Free Shipping' },
              { value: '30+', label: 'Countries' },
              { value: '2-7', label: 'Days Domestic' },
              { value: '100%', label: 'Eco Packaging' }
            ].map((item, i) => (
              <div key={i} className="anim-fade-up" style={{ animationDelay: `${i * 0.1}s`, background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px 16px', border: '1px solid var(--kraft-100)', textAlign: 'center', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--eco-700)', marginBottom: 4 }}>{item.value}</div>
                <div style={{ fontSize: 13, color: 'var(--kraft-500)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{item.label}</div>
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
            {shippingSections.map((section, sIdx) => {
              const Icon = section.icon;
              return (
                <div key={section.id} id={section.id} className="anim-fade-up" style={{ animationDelay: `${sIdx * 0.1}s`, marginBottom: sIdx < shippingSections.length - 1 ? (isMobile ? 48 : 64) : 0, scrollMarginTop: 120 }}>
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
                  {sIdx < shippingSections.length - 1 && <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, var(--kraft-200), transparent)', marginTop: isMobile ? 48 : 64 }} />}
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
              Questions About <br /><span className="text-gradient">Shipping?</span>
            </h2>
            <p style={{ fontSize: isMobile ? 16 : 18, color: 'rgba(255,255,255,0.6)', maxWidth: 550, margin: '0 auto 40px', lineHeight: 1.7 }}>
              Our logistics team is ready to assist with shipping queries, bulk order delivery, and international shipment planning.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/contact" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)', color: 'white', border: '2px solid rgba(255,255,255,0.5)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease', boxShadow: '0 8px 24px rgba(22,163,74,0.3)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(22,163,74,0.4)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0) scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(22,163,74,0.3)'; }}
              >Contact Us <ArrowRight size={18} /></Link>
              <a href="mailto:shipping@nirmalyamkrafts.com" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: isMobile ? '12px 28px' : '16px 36px', fontSize: isMobile ? '14px' : '15px', fontWeight: 700, background: 'transparent', color: 'white', border: '2px solid rgba(255,255,255,0.3)', borderRadius: '100px', textDecoration: 'none', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; e.currentTarget.style.background = 'transparent'; }}
              ><Mail size={18} /> Email Shipping Team</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
