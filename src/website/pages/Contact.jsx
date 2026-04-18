import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Check, AlertCircle, Plus, Minus } from 'lucide-react';
import { useAuthContext } from '../../context/Adminauth';
import { useQueryClient } from '@tanstack/react-query';

/* ── Quick info cards ── */
const contacts = [
  {
    icon: Mail,
    title: 'Email Us',
    value: 'hello@nirmalyamkrafts.com',
    sub: 'We reply within 1 business hour',
    href: 'mailto:hello@nirmalyamkrafts.com',
    color: 'var(--eco-600)',
    bg: 'rgba(22,163,74,0.08)',
  },
  {
    icon: Phone,
    title: 'Call Us',
    value: '+91 98765 43210',
    sub: 'Mon – Sat, 9 AM – 7 PM IST',
    href: 'tel:+919876543210',
    color: 'var(--kraft-600)',
    bg: 'rgba(192,148,87,0.1)',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    value: 'Chat for Instant Quote',
    sub: 'Usually replies in under 5 minutes',
    href: 'https://wa.me/919876543210',
    color: '#25d366',
    bg: 'rgba(37,211,102,0.08)',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    value: 'Regional Distribution Hub',
    sub: 'Pune & Mumbai, Maharashtra, India',
    href: 'https://maps.google.com/?q=Nirmalyam+Krafts',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
  },
];

/* ── FAQ ── */
const faqs = [
  {
    q: 'What is the minimum order quantity (MOQ)?',
    a: 'Our MOQ starts at just 50–100 units — making us accessible for small businesses and first-time buyers. For luxury bags, MOQ starts at 100 units depending on the variant.',
  },
  {
    q: 'How long does production take?',
    a: 'Standard orders are fulfilled in 7–10 business days after artwork approval. Rush orders (3–5 days) are available at a small premium.',
  },
  {
    q: 'Do you support custom sizes and prints?',
    a: 'Absolutely! All our products are fully customisable — sizes, handle types, print colours (Pantone matched), finishes, and more.',
  },
  {
    q: 'Do you deliver pan-India?',
    a: 'Yes, we deliver to all 28 states and 8 union territories of India. Bulk order freight is often subsidised or free above certain thresholds.',
  },
  {
    q: 'Can I get samples before placing a bulk order?',
    a: 'Yes, we provide paid sample kits (₹499 – ₹1,499 depending on product type) that are adjusted against your first bulk order.',
  },
];

const PRODUCT_OPTIONS = [
  { value: '', label: 'Select a product...' },
  { value: 'Ecocraft Bags', label: 'Ecocraft Bags' },
  { value: 'F&B Gourmet Bags', label: 'F&B Gourmet Bags' },
  { value: 'Luxury Bags', label: 'Luxury Kraft Bags' },
];

const INITIAL_FORM = {
  name: '', email: '', phone: '', business_name: '',
  product_category: '', quantity: '', requirement: '', location_area: '',
};

const LOCATION_OPTIONS = [
  { value: '', label: 'Select your area...' },
  { label: '--- Pune Regions ---', value: '', disabled: true },
  { value: 'Baner, Pune', label: 'Baner' },
  { value: 'Aundh, Pune', label: 'Aundh' },
  { value: 'Kothrud, Pune', label: 'Kothrud' },
  { value: 'Hinjewadi, Pune', label: 'Hinjewadi' },
  { value: 'Viman Nagar, Pune', label: 'Viman Nagar' },
  { value: 'Wakad, Pune', label: 'Wakad' },
  { value: 'Hadapsar, Pune', label: 'Hadapsar / Magarpatta' },
  { value: 'Kalyani Nagar, Pune', label: 'Kalyani Nagar' },
  { label: '--- Mumbai Regions ---', value: '', disabled: true },
  { value: 'Andheri, Mumbai', label: 'Andheri (East/West)' },
  { value: 'Bandra, Mumbai', label: 'Bandra / BKC' },
  { value: 'Borivali, Mumbai', label: 'Borivali' },
  { value: 'Ghatkopar, Mumbai', label: 'Ghatkopar' },
  { value: 'Powai, Mumbai', label: 'Powai' },
  { value: 'South Mumbai', label: 'South Mumbai / Colaba' },
  { value: 'Thane', label: 'Thane / Mulund' },
  { value: 'Navi Mumbai', label: 'Navi Mumbai / Vashi' },
];

export default function Contact() {
  const { axiosInstance } = useAuthContext();
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  
  const location = useLocation();
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  useEffect(() => {
    if (location.state?.name || location.state?.email) {
      setForm(prev => ({
        ...prev,
        name: location.state.name || prev.name,
        email: location.state.email || prev.email
      }));
    }
  }, [location.state]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim() || undefined,
        business_name: form.business_name.trim() || undefined,
        product_category: form.product_category || undefined,
        quantity: form.quantity.trim() || undefined,
        requirement: form.requirement.trim() || undefined,
      };

      const { data } = await axiosInstance.post(`/leads`, {
        payload
      });
      if (data.success === false) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
      queryClient.invalidateQueries({
        queryKey: ['getAllLeadsData']
      });
    } catch {
      setError('Unable to reach the server. Please try WhatsApp or email directly.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setError('');
    setForm(INITIAL_FORM);
  };

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>
      {/* ── Page Hero ── */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/contact_hero_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '350px' : isTablet ? '400px' : '450px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '60px 0 40px' : '80px 0'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: isMobile 
            ? 'linear-gradient(to bottom, rgba(26, 18, 8, 1) 0%, rgba(26, 18, 8, 0.8) 60%, transparent 100%)'
            : 'linear-gradient(to right, rgba(26, 18, 8, 0.98) 0%, rgba(26, 18, 8, 0.85) 50%, transparent 100%)',
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
              Connect with Nirmalyam
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 8vw, 76px)',
              color: 'white',
              fontWeight: 600,
              marginBottom: 24,
              lineHeight: 1.1
            }}>
              Let's Build Your <br />
              <span className="text-gradient" style={{ backgroundImage: 'linear-gradient(to right, var(--eco-400), var(--eco-300))' }}>Legacy in Paper</span>
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '19px',
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 580,
              lineHeight: 1.8,
              margin: isMobile || isTablet ? '0 auto' : '0'
            }}>
              Whether you need a custom quote, technical specifications, or a sustainability audit, our specialists are ready to help.
            </p>
          </div>
        </div>
      </div>

      {/* ── SECTION: CONTACT CARDS ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-50)',
        padding: isMobile ? '64px 0' : '80px 0'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : isTablet ? '1fr 1fr' : 'repeat(4, 1fr)', 
            gap: isMobile ? 12 : 32 
          }}>
            {contacts.map(({ icon: Icon, title, value, sub, href, color, bg }, i) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="anim-fade-up glass-card"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  display: 'flex', flexDirection: 'column', gap: isMobile ? 10 : 16,
                  padding: isMobile ? '16px' : '40px', background: 'white',
                  borderRadius: 'var(--radius-lg)', border: '1px solid var(--kraft-100)',
                  textDecoration: 'none', transition: 'all 0.4s',
                  boxShadow: 'var(--shadow-sm)',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if(!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-8px)';
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                  }
                }}
                onMouseLeave={(e) => {
                  if(!isMobile) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--kraft-100)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }
                }}
              >
                <div style={{
                  width: isMobile ? 40 : 56, height: isMobile ? 40 : 56, borderRadius: 12, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto'
                }}>
                  <Icon size={isMobile ? 20 : 26} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: isMobile ? 9 : 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color, marginBottom: isMobile ? 4 : 8 }}>{title}</div>
                  <div style={{ fontSize: isMobile ? 13 : 18, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 2, wordBreak: 'break-all' }}>{value}</div>
                  <div style={{ fontSize: isMobile ? 11 : 14, color: 'var(--kraft-500)', lineHeight: 1.5 }}>{sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION: FORM & INFO ── */}
      <section className="section-padding" style={{ 
        background: 'white',
        padding: isMobile ? '64px 0' : '100px 0'
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1.2fr 1fr', 
            gap: isMobile ? 48 : isTablet ? 60 : 80,
            alignItems: 'start'
          }}>
            {/* Form Column */}
            <div className="anim-fade-up">
              {submitted ? (
                <div className="glass-card" style={{
                  textAlign: 'center', padding: isMobile ? '48px 20px' : '80px 40px',
                  borderRadius: 'var(--radius-xl)', border: '2px solid var(--eco-500)',
                  background: 'var(--kraft-50)'
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: '50%',
                    background: 'var(--eco-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                  }}>
                    <Check size={32} color="white" />
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--kraft-950)', marginBottom: 16 }}>
                    Request Received!
                  </h3>
                  <p style={{ color: 'var(--kraft-600)', fontSize: 16, marginBottom: 32 }}>
                    Our team will contact you shortly to discuss your tailored packaging solution.
                  </p>
                  <button onClick={handleReset} className="btn-primary">Send Another Inquiry</button>
                </div>
              ) : (
                <div className="glass-card" style={{
                  padding: isMobile ? '32px 24px' : '48px 40px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--kraft-50)',
                  border: '1px solid var(--kraft-100)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <div style={{ marginBottom: 32 }}>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 32 : 36, color: 'var(--kraft-950)', marginBottom: 8 }}>
                      Request a Quote
                    </h2>
                    <p style={{ fontSize: 15, color: 'var(--kraft-500)' }}>
                      Complete the form and our experts will build your custom roadmap.
                    </p>
                  </div>

                  {error && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '16px 20px', marginBottom: 32,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 14,
                    }}>
                      <AlertCircle size={18} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 24 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label className="section-label" style={{ fontSize: 13, margin: 0, color: 'var(--kraft-900)', fontWeight: 800 }}>Full Name *</label>
                        <input className="contact-input" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required style={{ color: 'var(--kraft-950)', fontWeight: 600 }} />
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label className="section-label" style={{ fontSize: 13, margin: 0, color: 'var(--kraft-900)', fontWeight: 800 }}>Email *</label>
                        <input className="contact-input" name="email" type="email" placeholder="john@company.com" value={form.email} onChange={handleChange} required style={{ color: 'var(--kraft-950)', fontWeight: 600 }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label className="section-label" style={{ fontSize: 13, margin: 0, color: 'var(--kraft-900)', fontWeight: 800 }}>Phone</label>
                        <input className="contact-input" name="phone" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} style={{ color: 'var(--kraft-950)', fontWeight: 600 }} />
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label className="section-label" style={{ fontSize: 13, margin: 0, color: 'var(--kraft-900)', fontWeight: 800 }}>Company</label>
                        <input className="contact-input" name="business_name" placeholder="Logistics PVT LTD" value={form.business_name} onChange={handleChange} style={{ color: 'var(--kraft-950)', fontWeight: 600 }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20 }}>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label className="section-label" style={{ fontSize: 12, margin: 0, color: 'var(--kraft-950)', fontWeight: 800 }}>Product Category</label>
                        <select className="contact-input" name="product_category" value={form.product_category} onChange={handleChange} style={{ color: 'var(--kraft-950)', fontWeight: 600 }}>
                          {PRODUCT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'grid', gap: 8 }}>
                        <label className="section-label" style={{ fontSize: 12, margin: 0, color: 'var(--kraft-950)', fontWeight: 800 }}>Target Quantity</label>
                        <input className="contact-input" name="quantity" type="number" placeholder="Min 100" value={form.quantity} onChange={handleChange} style={{ color: 'var(--kraft-950)', fontWeight: 600 }} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gap: 8 }}>
                      <label className="section-label" style={{ fontSize: 12, margin: 0, color: 'var(--kraft-950)', fontWeight: 800 }}>Business Location (Pune/Mumbai)</label>
                      <select className="contact-input" name="location_area" value={form.location_area} onChange={handleChange} style={{ color: 'var(--kraft-950)', fontWeight: 600 }}>
                        {LOCATION_OPTIONS.map((opt, i) => (
                          <option key={i} value={opt.value} disabled={opt.disabled}>{opt.label}</option>
                        ))}
                      </select>
                    </div>

                    <div style={{ display: 'grid', gap: 8 }}>
                      <label className="section-label" style={{ fontSize: 12, margin: 0, color: 'var(--kraft-950)', fontWeight: 800 }}>Tell us about your requirements</label>
                      <textarea className="contact-input" name="requirement" placeholder="Size, print details, special finishes, timeline, etc." value={form.requirement} onChange={handleChange} rows={4} style={{ minHeight: 120, resize: 'none', color: 'var(--kraft-950)', fontWeight: 600 }} />
                    </div>

                    <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', padding: 18, justifyContent: 'center', fontSize: 16 }}>
                      {loading ? 'Processing...' : 'Send Inquiry'} <Send size={18} />
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Info Column */}
            <div className="anim-fade-up-slow" style={{ display: 'grid', gap: 40 }}>
               <div>
                 <div className="section-label" style={{ margin: isMobile || isTablet ? '0 auto 12px' : '0 0 12px' }}>Operational Excellence</div>
                 <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 32 : 40, color: 'var(--kraft-950)', marginBottom: 24, textAlign: isMobile || isTablet ? 'center' : 'left' }}>
                  Manufacturing <br /> Precision at Scale
                 </h2>
                 <p style={{ fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.7, textAlign: isMobile || isTablet ? 'center' : 'left' }}>
                  With a production capacity of 50,000+ units daily, we balance artisanal care with industrial efficiency.
                 </p>
               </div>

               <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                 {[
                   { label: 'Avg Quote Time', value: '1 Business Hour', icon: Clock },
                   { label: 'Production', value: '7-10 Business Days', icon: Send },
                   { label: 'Quality Check', value: '12-Point Audit', icon: Check },
                 ].map(({ label, value, icon: Icon }) => (
                   <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                     <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--kraft-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                       <Icon size={20} color="var(--kraft-600)" />
                     </div>
                     <div>
                       <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--kraft-400)', textTransform: 'uppercase' }}>{label}</div>
                       <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--kraft-900)' }}>{value}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <div style={{ 
                 background: 'var(--ink-950)', 
                 padding: isMobile ? '32px' : '40px', 
                 borderRadius: 'var(--radius-xl)', 
                 color: 'white' 
               }}>
                 <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Working Hours</h3>
                 <div style={{ display: 'grid', gap: 12 }}>
                    {[
                      { d: 'Mon - Fri', t: '9:00 AM - 7:00 PM' },
                      { d: 'Sat', t: '10:00 AM - 4:00 PM' },
                      { d: 'Sun', t: 'Support via WhatsApp' },
                    ].map(item => (
                      <div key={item.d} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 10 }}>
                        <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)' }}>{item.d}</span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{item.t}</span>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SECTION: FAQ ── */}
      <section className="section-padding" style={{ 
        background: 'var(--kraft-50)',
        padding: isMobile ? '64px 0' : '100px 0'
      }}>
        <div className="container" style={{ maxWidth: 850 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
             <div className="section-label">Help Center</div>
             <h2 className="section-title" style={{ fontSize: isMobile ? 32 : 42 }}>Common Inquiries</h2>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'white', borderRadius: '16px', border: '1px solid var(--kraft-100)', overflow: 'hidden' }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: '24px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 20 }}
                >
                  <span style={{ fontSize: isMobile ? 16 : 18, fontWeight: 700, color: 'var(--kraft-950)' }}>{faq.q}</span>
                  <div style={{ width: 28, height: 28, borderRadius: '8px', background: openFaq === i ? 'var(--kraft-900)' : 'var(--kraft-50)', color: openFaq === i ? 'white' : 'var(--kraft-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {openFaq === i ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <div style={{ maxHeight: openFaq === i ? 200 : 0, opacity: openFaq === i ? 1 : 0, overflow: 'hidden', transition: 'all 0.4s ease-in-out' }}>
                  <div style={{ padding: '0 32px 32px', color: 'var(--kraft-600)', lineHeight: 1.7, fontSize: 15 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <style>{`
        .contact-input {
          width: 100%;
          padding: 16px 20px;
          background: white;
          border: 2px solid var(--kraft-200);
          border-radius: 16px;
          font-size: 16px;
          transition: all 0.3s ease;
          outline: none;
        }
        .contact-input:focus {
          border-color: var(--eco-600);
          box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.1);
        }
        .contact-input::placeholder {
          color: var(--kraft-300);
        }
      `}</style>
    </div>
  );
}
