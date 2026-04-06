import { use, useState } from 'react';
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
  const queryClient = useQueryClient()
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

  return (
    <div style={{ minHeight: '100vh', paddingTop: 80 }}>

      {/* ── Page Hero ── */}
      <div className="page-hero">
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="section-label" style={{ color: 'var(--eco-400)' }}>Get In Touch</div>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(36px, 6vw, 68px)',
            color: 'white',
            fontWeight: 600,
            marginBottom: 18,
          }}>
            Let's Create Something<br />Extraordinary Together
          </h1>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.72)', maxWidth: 540, lineHeight: 1.65 }}>
            Connect with our manufacturing experts for custom paper packaging solutions
            that honour the Earth and elevate your brand.
          </p>
        </div>
      </div>

      {/* ── Contact Cards ── */}
      <section className="nature-section" style={{ background: 'var(--kraft-50)', padding: '64px 24px' }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {contacts.map(({ icon: Icon, title, value, sub, href, color, bg }) => (
              <a
                key={title}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', gap: 12,
                  padding: '28px 24px', background: 'white',
                  borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--kraft-100)',
                  textDecoration: 'none', transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.borderColor = color;
                  e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--kraft-100)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{
                  width: 48, height: 48, borderRadius: 12, background: bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={22} color={color} />
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color }}>{title}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--kraft-900)', lineHeight: 1.4 }}>{value}</div>
                <div style={{ fontSize: 12, color: 'var(--kraft-500)', lineHeight: 1.4 }}>{sub}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Main Form + Info ── */}
      <section className="nature-section" style={{ background: 'white', padding: '80px 24px', borderTop: '1px solid var(--kraft-100)' }}>
        <div className="nature-layer-wood" style={{ opacity: 0.03 }} />
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 72, alignItems: 'start', position: 'relative', zIndex: 1 }}>

          {/* Left: Info */}
          <div>
            <div className="section-label" style={{ marginBottom: 12 }}>Working Hours</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, color: 'var(--kraft-950)', marginBottom: 20 }}>
              When to Reach Us
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 36 }}>
              {[
                { days: 'Monday – Friday', time: '9:00 AM – 7:00 PM IST' },
                { days: 'Saturday', time: '10:00 AM – 4:00 PM IST' },
                { days: 'SRequest a Quoteunday', time: 'Closed (WhatsApp queries accepted)' },
              ].map(({ days, time }) => (
                <div key={days} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '14px 18px', background: 'var(--kraft-50)',
                  borderRadius: 'var(--radius-md)', border: '1px solid var(--kraft-100)',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--kraft-800)' }}>{days}</span>
                  <span style={{ fontSize: 14, color: 'var(--kraft-500)' }}>{time}</span>
                </div>
              ))}
            </div>

            <div style={{
              background: 'linear-gradient(135deg, var(--kraft-800), var(--kraft-600))',
              borderRadius: 'var(--radius-lg)', padding: '28px 32px', color: 'white',
            }}>
              <Clock size={24} color="var(--kraft-300)" style={{ marginBottom: 12 }} />
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>Quick Response Guarantee</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.65 }}>
                All quote requests are acknowledged within{' '}
                <strong style={{ color: 'var(--kraft-200)' }}>1 business hour</strong>.
                WhatsApp responses are typically under 5 minutes during working hours.
              </p>
            </div>
          </div>

          {/* Right: Form */}
          <div>
            {submitted ? (
              <div style={{
                textAlign: 'center', padding: 64, background: 'var(--kraft-50)',
                borderRadius: 'var(--radius-xl)', border: '1.5px solid var(--eco-500)',
              }}>
                <div style={{
                  width: 72, height: 72, borderRadius: '50%',
                  background: 'rgba(22,163,74,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 24px',
                }}>
                  <Check size={32} color="var(--eco-600)" />
                </div>
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: 'var(--kraft-900)', marginBottom: 10 }}>
                  Quote Request Submitted!
                </h3>
                <p style={{ color: 'var(--kraft-600)', fontSize: 15 }}>
                  Our team will contact you within 1 business hour.
                </p>
                <button
                  onClick={handleReset}
                  style={{
                    marginTop: 28, padding: '12px 32px',
                    borderRadius: 'var(--radius-full)', background: 'var(--eco-600)',
                    color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14,
                  }}
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                style={{
                  background: 'var(--kraft-50)', borderRadius: 'var(--radius-xl)',
                  padding: '40px 44px', border: '1px solid var(--kraft-100)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, color: 'var(--kraft-900)', marginBottom: 8 }}>
                  Request a Quote
                </h3>
                <p style={{ fontSize: 14, color: 'var(--kraft-500)', marginBottom: 28 }}>
                  Fill in your details and we'll get back to you with a tailored solution.
                </p>

                {/* Error banner */}
                {error && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px', marginBottom: 20,
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: 'var(--radius-md)', color: '#dc2626', fontSize: 14,
                  }}>
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  {[
                    { name: 'name', label: 'Full Name *', placeholder: 'Sarah Merchant', required: true },
                    { name: 'email', label: 'Email Address *', placeholder: 'sarah@brand.com', type: 'email', required: true },
                    { name: 'phone', label: 'Phone Number', placeholder: '+91 98765 43210' },
                    { name: 'business_name', label: 'Company / Brand Name', placeholder: 'My Brand Co.' },
                  ].map(({ name, label, placeholder, type = 'text', required }) => (
                    <div key={name}>
                      <label style={{
                        display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)',
                        marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {label}
                      </label>
                      <input
                        className="input-field"
                        name={name}
                        type={type}
                        placeholder={placeholder}
                        value={form[name]}
                        onChange={handleChange}
                        required={required}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
                  <div>
                    <label style={{
                      display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)',
                      marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      Product Interest
                    </label>
                    <select
                      className="input-field"
                      name="product_category"
                      value={form.product_category}
                      onChange={handleChange}
                      style={{ cursor: 'pointer' }}
                    >
                      {PRODUCT_OPTIONS.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{
                      display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)',
                      marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      Estimated Quantity (units)
                    </label>
                    <input
                      className="input-field"
                      name="quantity"
                      type="number"
                      placeholder="e.g. 500"
                      value={form.quantity}
                      onChange={handleChange}
                      min="50"
                    />
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <label style={{
                    display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--kraft-700)',
                    marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    Additional Requirements
                  </label>
                  <textarea
                    className="input-field"
                    name="requirement"
                    placeholder="Describe size requirements, print colours, special finishes, timeline, etc."
                    value={form.requirement}
                    onChange={handleChange}
                    rows={4}
                    style={{ resize: 'vertical', minHeight: 100 }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{ marginTop: 24, width: '100%', justifyContent: 'center', padding: '15px', fontSize: 15 }}
                  disabled={loading}
                >
                  {loading ? 'Sending…' : (
                    <>
                      <span>Submit Quote Request</span>
                      <Send size={16} />
                    </>
                  )}
                </button>

                <p style={{ fontSize: 12, color: 'var(--kraft-400)', textAlign: 'center', marginTop: 14 }}>
                  By submitting, you agree to our{' '}
                  <a href="/privacy" style={{ color: 'var(--kraft-600)' }}>Privacy Policy</a>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="section-padding nature-section" style={{ background: 'var(--kraft-50)' }}>
        <div className="nature-layer-wood" />
        <div className="nature-layer-leaf" />
        <div className="container" style={{ maxWidth: 760, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-label">Support</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
          </div>

          {faqs.map((faq, i) => (
            <div
              key={i}
              style={{
                background: 'white', borderRadius: 'var(--radius-lg)',
                border: `1.5px solid ${openFaq === i ? 'var(--eco-500)' : 'var(--kraft-100)'}`,
                marginBottom: 12, overflow: 'hidden', transition: 'border-color 0.25s',
              }}
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '20px 24px',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif", fontSize: 15, fontWeight: 600,
                  color: 'var(--kraft-900)', textAlign: 'left', gap: 16,
                }}
              >
                {faq.q}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: openFaq === i ? 'var(--eco-600)' : 'var(--kraft-100)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, transition: 'background 0.25s', fontSize: 18,
                  color: openFaq === i ? 'white' : 'var(--kraft-600)',
                }}>
                  {openFaq === i ? '−' : '+'}
                </div>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 24px 20px', fontSize: 14, color: 'var(--kraft-600)', lineHeight: 1.7 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
