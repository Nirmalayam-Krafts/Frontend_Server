import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, MessageCircle, Clock, Send, Check, AlertCircle } from 'lucide-react';
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
    value: 'Plot 42, Industrial Area Phase II',
    sub: 'Bengaluru, Karnataka 560066, India',
    href: 'https://maps.google.com/?q=Nirmalyam+Krafts+Bengaluru',
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
  product_category: '', quantity: '', requirement: '',
};

export default function Contact() {
  const { axiosInstance } = useAuthContext()
  const [form, setForm] = useState(INITIAL_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(null);
  const location = useLocation();
  const queryClient = useQueryClient();
  
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
      if (data.success == false) {
        setError(data.message || 'Something went wrong. Please try again.');
        return;
      }
      setSubmitted(true);
      queryClient.invalidateQueries({
        queryKey: ['getAllLeadsData']
      })
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

const LeafParticles = () => (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 1 }}>
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${Math.random() * 100}%`,
            left: `${-10 - Math.random() * 20}%`,
            width: '20px',
            height: '20px',
            background: 'rgba(74, 222, 128, 0.2)',
            borderRadius: '50% 0 50% 0',
            animation: `drift ${15 + Math.random() * 15}s linear infinite`,
            animationDelay: `${-Math.random() * 20}s`,
            transform: `rotate(${Math.random() * 360}deg)`,
          }}
        />
      ))}
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80, overflowX: 'hidden' }}>

      {/* ── Page Hero ── */}
      <div className="page-hero" style={{ 
        backgroundImage: 'url(/images/generated/contact_hero_bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        minHeight: '500px',
        display: 'flex',
        alignItems: 'center',
        padding: '120px 0'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to right, rgba(26, 18, 8, 0.98) 0%, rgba(26, 18, 8, 0.85) 50%, rgba(26, 18, 8, 0.4) 100%)',
          zIndex: 0
        }} />

        <LeafParticles />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="anim-fade-up">
            <div className="section-label" style={{ color: 'var(--eco-400)' }}>Get In Touch</div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 8vw, 72px)',
              color: 'white',
              fontWeight: 600,
              marginBottom: 20,
              lineHeight: 1.1,
              textShadow: '0 4px 12px rgba(0,0,0,0.5)'
            }}>
              Let's Create Something<br />
              <span style={{ color: 'var(--kraft-300)' }}>Extraordinary Together</span>
            </h1>
            <p style={{ 
              fontSize: 'clamp(16px, 2vw, 20px)', 
              color: 'rgba(255,255,255,0.8)', 
              maxWidth: 600, 
              lineHeight: 1.7,
              textShadow: '0 2px 4px rgba(0,0,0,0.3)'
            }}>
              Connect with our manufacturing experts for custom paper packaging solutions
              that honour the Earth and elevate your brand's presence.
            </p>
          </div>
        </div>
      </div>

      {/* ── Contact Cards ── */}
      <section className="nature-section" style={{ background: 'var(--kraft-50)', padding: '80px 0px' }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
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
                  padding: '40px 32px', background: 'white',
                  borderRadius: 'var(--radius-lg)', border: '1px solid var(--kraft-100)',
                  textDecoration: 'none', transition: 'all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)',
                  boxShadow: 'var(--shadow-sm)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = 'var(--shadow-xl)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--kraft-100)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'transform 0.4s ease'
                }}>
                  <Icon size={26} color={color} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color, marginBottom: 8 }}>{title}</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--kraft-900)', marginBottom: 4 }}>{value}</div>
                  <div style={{ fontSize: 14, color: 'var(--kraft-500)', lineHeight: 1.5 }}>{sub}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Layout (Form + Working Hours) ── */}
      <section style={{ background: 'white', padding: '100px 0', position: 'relative' }}>
        <div className="container">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: 80, 
            alignItems: 'start' 
          }}>
            
            {/* Left Column: Form */}
            <div className="anim-fade-up">
              {submitted ? (
                <div className="glass-card" style={{
                  textAlign: 'center', padding: '80px 40px',
                  borderRadius: 'var(--radius-xl)', border: '2px solid var(--eco-500)',
                  background: 'var(--kraft-50)'
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'var(--eco-500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: '0 8px 24px rgba(34, 197, 94, 0.3)'
                  }}>
                    <Check size={40} color="white" />
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'var(--kraft-950)', marginBottom: 16 }}>
                    Request Received!
                  </h3>
                  <p style={{ color: 'var(--kraft-600)', fontSize: 17, marginBottom: 32 }}>
                    Our team will contact you within 1 business hour to discuss your tailored solution.
                  </p>
                  <button
                    onClick={handleReset}
                    className="btn-primary"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <div className="glass-card" style={{
                  padding: '48px 40px',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--kraft-50)',
                  border: '1px solid var(--kraft-100)',
                  boxShadow: 'var(--shadow-lg)'
                }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, color: 'var(--kraft-950)', marginBottom: 8 }}>
                    Request a Quote
                  </h2>
                  <p style={{ fontSize: 16, color: 'var(--kraft-500)', marginBottom: 40 }}>
                    Provide your requirements and our experts will build your custom roadmap.
                  </p>

                  {error && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '16px 20px', marginBottom: 32,
                      background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                      borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 15,
                    }}>
                      <AlertCircle size={20} />
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    <div className="contact-form-grid">
                      <div className="form-group">
                        <label className="section-label" style={{ fontSize: 10 }}>Full Name *</label>
                        <input
                          className="input-field"
                          name="name"
                          placeholder="Sarah Merchant"
                          value={form.name}
                          onChange={handleChange}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label className="section-label" style={{ fontSize: 10 }}>Email Address *</label>
                        <input
                          className="input-field"
                          name="email"
                          type="email"
                          placeholder="sarah@brand.com"
                          value={form.email}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </div>

                    <div className="contact-form-grid">
                      <div className="form-group">
                        <label className="section-label" style={{ fontSize: 10 }}>Phone Number</label>
                        <input
                          className="input-field"
                          name="phone"
                          placeholder="+91 98765 43210"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="form-group">
                        <label className="section-label" style={{ fontSize: 10 }}>Business Name</label>
                        <input
                          className="input-field"
                          name="business_name"
                          placeholder="My Brand Co."
                          value={form.business_name}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="contact-form-grid">
                      <div className="form-group">
                        <label className="section-label" style={{ fontSize: 10 }}>Product Interest</label>
                        <select
                          className="input-field"
                          name="product_category"
                          value={form.product_category}
                          onChange={handleChange}
                        >
                          {PRODUCT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="section-label" style={{ fontSize: 10 }}>Est. Quantity</label>
                        <input
                          className="input-field"
                          name="quantity"
                          type="number"
                          placeholder="Min 100"
                          value={form.quantity}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="section-label" style={{ fontSize: 10 }}>Specific Requirements</label>
                      <textarea
                        className="input-field"
                        name="requirement"
                        placeholder="Size, print details, special finishes, timeline, etc."
                        value={form.requirement}
                        onChange={handleChange}
                        rows={4}
                        style={{ minHeight: 120, resize: 'none' }}
                      />
                    </div>

                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={loading}
                      style={{ 
                        width: '100%', 
                        padding: '18px', 
                        fontSize: 16, 
                        justifyContent: 'center',
                        marginTop: 10
                      }}
                    >
                      {loading ? 'Processing...' : (
                        <>
                          <span>Submit Request</span>
                          <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Experience & Hours */}
            <div className="anim-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="section-label">Trust & Timing</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 40, color: 'var(--kraft-950)', marginBottom: 24, lineHeight: 1.2 }}>
                Manufacturing<br /> Excellence at Speed
              </h2>
              <p style={{ fontSize: 17, color: 'var(--kraft-600)', lineHeight: 1.7, marginBottom: 40 }}>
                With a production capacity of over 50,000 bags per day, we balance artisanal precision with industrial speed. Our team is ready to scale your vision.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 56 }}>
                {[
                  { label: 'Standard Quote Time', value: '1 Business Hour', icon: Clock },
                  { label: 'Sample Turnaround', value: '2-3 Business Days', icon: Check },
                  { label: 'Production Timeline', value: '7-10 Days (Avg)', icon: Send },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--kraft-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={20} color="var(--kraft-600)" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--kraft-400)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{label}</div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--kraft-800)' }}>{value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dark-glass" style={{
                padding: '40px',
                borderRadius: 'var(--radius-lg)',
                color: 'white'
              }}>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24, fontFamily: "'Playfair Display', serif" }}>Working Hours</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {[
                    { days: 'Mon – Fri', time: '9:00 AM – 7:00 PM' },
                    { days: 'Saturday', time: '10:00 AM – 4:00 PM' },
                    { days: 'Sunday', time: 'Closed (Support via WhatsApp)' },
                  ].map(({ days, time }) => (
                    <div key={days} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--kraft-200)' }}>{days}</span>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="section-padding nature-section" style={{ 
        background: 'var(--kraft-50)',
        backgroundImage: 'url(/images/generated/faq_backdrop.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 0'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(253, 249, 243, 0.85)',
          zIndex: 0
        }} />
        
        <div className="container" style={{ maxWidth: 900, position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-label">Common Queries</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          <div style={{ display: 'grid', gap: 16 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="anim-fade-up"
                style={{
                  animationDelay: `${i * 0.1}s`,
                  background: 'white', borderRadius: 'var(--radius-lg)',
                  border: `1.5px solid ${openFaq === i ? 'var(--eco-500)' : 'var(--kraft-100)'}`,
                  overflow: 'hidden', transition: 'all 0.4s ease',
                  boxShadow: openFaq === i ? '0 10px 30px -10px rgba(58, 36, 16, 0.15)' : 'var(--shadow-sm)'
                }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', padding: '28px 32px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif", fontSize: 17, fontWeight: 600,
                    color: 'var(--kraft-900)', textAlign: 'left', gap: 20,
                  }}
                >
                  {faq.q}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: openFaq === i ? 'var(--eco-600)' : 'var(--kraft-100)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, transition: 'all 0.3s ease',
                    color: openFaq === i ? 'white' : 'var(--kraft-600)',
                  }}>
                    {openFaq === i ? <AlertCircle size={18} style={{ transform: 'rotate(180deg)' }} /> : <Clock size={18} />}
                  </div>
                </button>
                <div style={{ 
                  maxHeight: openFaq === i ? '500px' : '0',
                  transition: 'all 0.5s cubic-bezier(0.165, 0.84, 0.44, 1)',
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '0 32px 32px', fontSize: 16, color: 'var(--kraft-600)', lineHeight: 1.8 }}>
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
