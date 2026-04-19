import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Check, AlertCircle, Plus, Minus, ShieldCheck } from 'lucide-react';
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
    
    // Handle scroll to form if hash is present
    if (location.hash === '#contact-form') {
      setTimeout(() => {
        const element = document.getElementById('contact-form');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

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
    <div style={{ minHeight: '100vh', paddingTop: isMobile ? 60 : 80, background: 'white' }}>
      {/* ── Page Hero: Cinematic Atmosphere ── */}
      <div className="page-hero" style={{
        backgroundImage: 'url(/images/generated/contact_hero_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: isMobile ? '450px' : '550px',
        display: 'flex',
        alignItems: 'center',
        marginTop: isMobile ? -60 : -80,
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(26, 18, 8, 1) 0%, rgba(26, 18, 8, 0.7) 40%, transparent 100%)',
          zIndex: 0
        }} />
        
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="anim-fade-up" style={{ textAlign: isMobile || isTablet ? 'center' : 'left' }}>
            <div className="section-label" style={{ 
              color: 'var(--eco-400)', 
              marginBottom: 16,
              letterSpacing: '0.3em',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>Get In Touch</div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(40px, 9vw, 84px)',
              color: 'white',
              fontWeight: 600,
              marginBottom: 24,
              lineHeight: 1.05,
              textShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              Your Vision,<br />
              <span style={{ color: 'var(--kraft-300)' }}>Our Craftsmanship</span>
            </h1>
            <p style={{
              fontSize: 'clamp(17px, 2.5vw, 22px)',
              color: 'rgba(255,255,255,0.9)',
              maxWidth: 620,
              lineHeight: 1.7,
              margin: isMobile || isTablet ? '0 auto' : '0',
              fontWeight: 400
            }}>
              Connect with India's leading sustainable packaging experts. From custom dimensions to high-end finishes, we build the bags that define your brand.
            </p>
          </div>
        </div>
      </div>

      {/* ── Contact Channels: Floating Experience ── */}
      <section style={{ 
        background: 'white',
        marginTop: -60,
        position: 'relative',
        zIndex: 10,
        paddingBottom: 60
      }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', 
            gap: 24 
          }}>
            {contacts.map(({ icon: Icon, title, value, sub, href, color, bg }, i) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="anim-fade-up"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  display: 'flex', flexDirection: 'column', gap: 16,
                  padding: '32px 24px', background: 'white',
                  borderRadius: 'var(--radius-xl)', 
                  border: '1px solid var(--kraft-100)',
                  textDecoration: 'none', transition: 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  if(!isMobile) {
                    e.currentTarget.style.transform = 'translateY(-12px)';
                    e.currentTarget.style.borderColor = color;
                    e.currentTarget.style.boxShadow = `0 30px 60px ${color}15`;
                  }
                }}
                onMouseLeave={(e) => {
                  if(!isMobile) {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.borderColor = 'var(--kraft-100)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.05)';
                  }
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '20px', background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto', transition: 'all 0.3s'
                }} className="card-icon-container">
                  <Icon size={28} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 13, color: 'var(--kraft-500)', lineHeight: 1.5 }}>{sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Engagement Section: Split Layout ── */}
      <section className="section-padding nature-section" style={{ background: 'var(--kraft-50)' }}>
        <div className="nature-layer-wood" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1.1fr 0.9fr', 
            gap: isMobile ? 48 : 80,
            alignItems: 'stretch'
          }}>
            {/* --- Form Column --- */}
            <div className="anim-fade-up">
              <div id="contact-form" style={{
                background: 'white',
                padding: isMobile ? '40px 24px' : '56px 64px',
                borderRadius: 'var(--radius-2xl)',
                boxShadow: 'var(--shadow-2xl)',
                border: '1px solid var(--kraft-100)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Decorative Accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: 0, right: 0, height: 6,
                  background: 'linear-gradient(90deg, var(--eco-500), var(--kraft-600))'
                }} />

                {submitted ? (
                  <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <div style={{
                      width: 80, height: 80, borderRadius: '50%',
                      background: 'var(--eco-500)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      margin: '0 auto 32px',
                      boxShadow: '0 20px 40px rgba(34, 197, 94, 0.25)'
                    }}>
                      <Check size={40} color="white" />
                    </div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: 'var(--kraft-950)', marginBottom: 16 }}>Message Sent</h2>
                    <p style={{ color: 'var(--kraft-600)', fontSize: 18, marginBottom: 40, lineHeight: 1.6 }}>
                      Thank you for choosing Nirmalyam. An expert consultant will review your specifications and reach out within 60 minutes.
                    </p>
                    <button onClick={handleReset} className="btn-primary" style={{ margin: '0 auto' }}>Send Another Inquiry</button>
                  </div>
                ) : (
                  <>
                    <div style={{ marginBottom: 40 }}>
                      <h2 style={{ 
                        fontFamily: "'Playfair Display', serif", 
                        fontSize: isMobile ? 36 : 42, 
                        color: 'var(--kraft-950)', 
                        marginBottom: 12,
                        letterSpacing: '-0.02em'
                      }}>
                        Consult an Expert
                      </h2>
                      <p style={{ fontSize: 16, color: 'var(--kraft-500)', maxWidth: 450, lineHeight: 1.6 }}>
                        Tell us about your brand requirements. We provide complimentary technical consulting and sample kits for serious inquiries.
                      </p>
                    </div>

                    {error && (
                      <div className="anim-shake" style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '16px 20px', marginBottom: 32,
                        background: '#fef2f2', border: '1px solid #fee2e2',
                        borderRadius: '12px', color: '#dc2626', fontSize: 14,
                        fontWeight: 600
                      }}>
                        <AlertCircle size={18} />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 28 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                        <div className="input-group">
                          <label className="input-label">Full Name</label>
                          <input className="contact-input" name="name" placeholder="E.g. Siddharth Malhotra" value={form.name} onChange={handleChange} required />
                        </div>
                        <div className="input-group">
                          <label className="input-label">Corporate Email</label>
                          <input className="contact-input" name="email" type="email" placeholder="name@company.com" value={form.email} onChange={handleChange} required />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                        <div className="input-group">
                          <label className="input-label">Contact Number</label>
                          <input className="contact-input" name="phone" placeholder="+91 00000 00000" value={form.phone} onChange={handleChange} />
                        </div>
                        <div className="input-group">
                          <label className="input-label">Business Name</label>
                          <input className="contact-input" name="business_name" placeholder="Brand / Company Name" value={form.business_name} onChange={handleChange} />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 24 }}>
                        <div className="input-group">
                          <label className="input-label">Product of Interest</label>
                          <select className="contact-input select-styled" name="product_category" value={form.product_category} onChange={handleChange}>
                            {PRODUCT_OPTIONS.map(({ value, label }) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </div>
                        <div className="input-group">
                          <label className="input-label">Est. Monthly Volume</label>
                          <input className="contact-input" name="quantity" type="number" placeholder="Min. 100 recommended" value={form.quantity} onChange={handleChange} />
                        </div>
                      </div>

                      <div className="input-group">
                        <label className="input-label">Project Details</label>
                        <textarea className="contact-input" name="requirement" placeholder="Share specific dimensions, colors, or timeline needs..." value={form.requirement} onChange={handleChange} rows={4} style={{ minHeight: 140, resize: 'none', padding: '16px' }} />
                      </div>

                      <button type="submit" className="btn-primary" disabled={loading} style={{ 
                        width: '100%', 
                        padding: '20px', 
                        justifyContent: 'center', 
                        fontSize: 18,
                        boxShadow: '0 15px 30px rgba(26, 18, 8, 0.15)'
                      }}>
                        {loading ? 'Processing Your Request...' : 'Initialize Consultation'} <Send size={20} />
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* --- Information Column: Cinematic Info --- */}
            <div className="anim-fade-up-slow" style={{ display: 'flex', flexDirection: 'column' }}>
               <div style={{ 
                 position: 'relative', 
                 borderRadius: 'var(--radius-2xl)', 
                 overflow: 'hidden',
                 height: isMobile ? '400px' : '500px',
                 marginBottom: 48,
                 boxShadow: 'var(--shadow-xl)'
               }}>
                 <img 
                   src="/images/generated/contact_consulting.png" 
                   alt="Nirmalyam Consulting" 
                   style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                 />
                 <div style={{
                   position: 'absolute',
                   inset: 0,
                   background: 'linear-gradient(to top, rgba(26, 18, 8, 0.9) 0%, transparent 60%)',
                   display: 'flex',
                   flexDirection: 'column',
                   justifyContent: 'flex-end',
                   padding: 40
                 }}>
                   <div style={{ color: 'var(--kraft-300)', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', fontSize: 12, marginBottom: 12 }}>Manufacturing Excellence</div>
                   <h3 style={{ color: 'white', fontSize: 24, fontWeight: 700, lineHeight: 1.3 }}>"We don't just supply bags; we architect unboxing experiences that drive customer loyalty."</h3>
                 </div>
               </div>

               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 32, marginBottom: 48 }}>
                 {[
                   { label: 'Consultation', value: '1 Business Hour', icon: Clock },
                   { label: 'Global Standard', value: 'ISO 9001:2015', icon: ShieldCheck },
                   { label: 'Logistics', value: 'PAN India Fleet', icon: Send },
                 ].map(({ label, value, icon: Icon }) => (
                   <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                     <div style={{ width: 48, height: 48, borderRadius: 12, background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                       <Icon size={22} color="var(--kraft-600)" />
                     </div>
                     <div>
                       <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--kraft-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                       <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--kraft-950)' }}>{value}</div>
                     </div>
                   </div>
                 ))}
               </div>

               <div style={{ 
                 background: 'var(--kraft-950)', 
                 padding: '40px', 
                 borderRadius: 'var(--radius-2xl)', 
                 color: 'white',
                 position: 'relative',
                 overflow: 'hidden'
               }}>
                 <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'var(--kraft-500)', opacity: 0.1, borderRadius: '50%', filter: 'blur(60px)' }} />
                 <h3 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Regional Support Hours</h3>
                 <div style={{ display: 'grid', gap: 16 }}>
                    {[
                      { d: 'Mon - Fri', t: '9:00 AM - 7:00 PM (IST)', status: 'Active' },
                      { d: 'Sat', t: '10:00 AM - 4:00 PM (IST)', status: 'Limited' },
                    ].map(item => (
                      <div key={item.d} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 12 }}>
                        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)' }}>{item.d}</span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{item.t}</div>
                          <div style={{ fontSize: 10, color: item.status === 'Active' ? 'var(--eco-400)' : 'var(--kraft-400)', fontWeight: 800, textTransform: 'uppercase' }}>● {item.status}</div>
                        </div>
                      </div>
                    ))}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Help Center: FAQ Experience ── */}
      <section className="section-padding" style={{ background: 'white' }}>
        <div className="container" style={{ maxWidth: 900 }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
             <div className="section-label" style={{ marginBottom: 16 }}>Concierge</div>
             <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: isMobile ? 36 : 48, color: 'var(--kraft-950)', marginBottom: 20 }}>Tailored Solutions FAQ</h2>
             <p style={{ color: 'var(--kraft-500)', fontSize: 18 }}>Everything you need to know about starting your sustainable journey.</p>
          </div>

          <div style={{ display: 'grid', gap: 20 }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ 
                background: 'var(--kraft-50)', 
                borderRadius: '24px', 
                border: '1px solid var(--kraft-100)', 
                overflow: 'hidden',
                transition: 'all 0.3s'
              }}>
                <button 
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{ width: '100%', padding: isMobile ? '24px' : '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 24 }}
                >
                  <span style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: 'var(--kraft-950)', lineHeight: 1.4 }}>{faq.q}</span>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: '14px', 
                    background: openFaq === i ? 'var(--kraft-900)' : 'white', 
                    color: openFaq === i ? 'white' : 'var(--kraft-900)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    transition: 'all 0.3s',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    {openFaq === i ? <Minus size={20} /> : <Plus size={20} />}
                  </div>
                </button>
                <div style={{ maxHeight: openFaq === i ? 300 : 0, opacity: openFaq === i ? 1 : 0, overflow: 'hidden', transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                  <div style={{ padding: '0 40px 40px', color: 'var(--kraft-600)', lineHeight: 1.8, fontSize: 16, borderTop: '1px solid var(--kraft-100)', paddingTop: 24 }}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <style>{`
        .input-group { display: flex; flexDirection: column; gap: 10px; }
        .input-label { fontSize: 13px; fontWeight: 800; textTransform: uppercase; letterSpacing: 0.1em; color: var(--kraft-800); }
        .contact-input {
          width: 100%;
          padding: 18px 24px;
          background: var(--kraft-50);
          border: 1px solid var(--kraft-100);
          border-radius: 16px;
          font-size: 16px;
          font-weight: 500;
          color: var(--kraft-950);
          transition: all 0.3s ease;
          outline: none;
        }
        .contact-input:focus {
          background: white;
          border-color: var(--kraft-600);
          box-shadow: 0 0 0 4px rgba(192, 148, 87, 0.1);
        }
        .contact-input::placeholder { color: var(--kraft-300); }
        .select-styled { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23C09457' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 20px center; padding-right: 50px; }
      `}</style>
    </div>
  );
}
