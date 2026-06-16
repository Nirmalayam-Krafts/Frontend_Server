import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { X, Mail, Phone, User, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

// Helper to check if the route is one of the allowed pages for the promotional popup
const isAllowedPage = (path) => {
  if (path === '/about') return true;
  if (path === '/sustainability') return true;
  if (path === '/contact') return true;
  if (path === '/products') return true;
  if (path.startsWith('/products/')) return true;
  return false;
};

export default function PromotionalPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { pathname } = useLocation();

  useEffect(() => {
    // If not on an allowed subpage, keep closed and do not start a timer
    if (!isAllowedPage(pathname)) {
      setIsOpen(false);
      return;
    }

    // Reset popup states when navigating to a new allowed page
    setIsOpen(false);
    setSubmitted(false);
    setError('');

    // Time-delay trigger: appears 6 seconds after loading the route
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 6000);

    return () => clearTimeout(timer);
  }, [pathname]);

  // Handle Escape key to close the modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closePopup();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const closePopup = () => {
    setIsOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    // For phone number, only allow numeric digits
    const nextValue = name === 'phone' ? value.replace(/\D/g, '') : value;
    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    const name = formData.name.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();

    if (!name || !email || !phone) {
      setError('Please fill in all fields.');
      return;
    }

    if (name.length < 2) {
      setError('Name must be at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (phone.length < 7 || phone.length > 15) {
      setError('Phone number must be between 7 and 15 digits.');
      return;
    }

    setLoading(true);

    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      const payload = {
        name,
        email,
        phone,
        business_name: 'Promotional Pop-up Lead',
        product_category: 'Ecocraft Bags',
        quantity: '100',
        requirement: 'Lead captured from the global promotional popup. Customer has requested a sample kit and discount code.',
      };

      const response = await axios.post(`${apiBaseUrl}/leads`, { payload });
      
      if (response.data && response.data.success === false) {
        setError(response.data.message || 'Something went wrong. Please try again.');
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Lead submission failed:', err);
      setError('Unable to reach the server. Please try again or email Hello@nirmalyamkrafts.com.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={closePopup}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        background: 'rgba(14, 9, 4, 0.45)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        padding: '40px 20px',
        overflowY: 'auto',
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#fdf9f3',
          width: '100%',
          maxWidth: '480px',
          borderRadius: '24px',
          boxShadow: '0 25px 50px -12px rgba(26, 18, 8, 0.25), 0 0 40px rgba(192, 148, 87, 0.1)',
          border: '1px solid rgba(192, 148, 87, 0.2)',
          position: 'relative',
          overflow: 'hidden',
          padding: '40px 32px',
          fontFamily: "'Inter', sans-serif",
          boxSizing: 'border-box',
          animation: 'scaleUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          margin: 'auto',
        }}
      >
        {/* Top Decorative Line */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, height: '6px',
          background: 'linear-gradient(90deg, var(--eco-500, #22c55e), var(--kraft-600, #c09457))'
        }} />

        {/* Close Button */}
        <button
          onClick={closePopup}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'white',
            border: '1px solid rgba(192, 148, 87, 0.2)',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--kraft-800, #3d2e1a)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            transition: 'all 0.2s ease',
            zIndex: 10,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fcf8f2';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              background: 'rgba(22, 163, 74, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 24px',
              color: 'var(--eco-600, #16a34a)'
            }}>
              <CheckCircle2 size={40} />
            </div>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '28px',
              fontWeight: 700,
              color: 'var(--kraft-950, #1a1208)',
              marginBottom: '12px'
            }}>
              Inquiry Received!
            </h3>
            <p style={{
              fontSize: '15px',
              color: 'var(--kraft-600, #8b5e3c)',
              lineHeight: 1.6,
              marginBottom: '28px'
            }}>
              Thank you for choosing Nirmalyam. Your 10% discount code and details about our sample kits have been queued to your email/phone!
            </p>
            <button
              onClick={closePopup}
              style={{
                padding: '14px 36px',
                borderRadius: '100px',
                border: 'none',
                background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(26, 18, 8, 0.2)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              Continue Browsing
            </button>
          </div>
        ) : (
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(22, 163, 74, 0.1)',
              padding: '6px 14px',
              borderRadius: '100px',
              marginBottom: '20px'
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--eco-600, #16a34a)' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--eco-700, #15803d)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Exclusive Offer
              </span>
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--kraft-950, #1a1208)',
              lineHeight: 1.2,
              marginBottom: '10px'
            }}>
              Unlock Premium Eco-Packaging
            </h3>
            
            <p style={{
              fontSize: '14px',
              color: 'var(--kraft-600, #8b5e3c)',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              Get <strong>10% off</strong> your first wholesale order and receive a complimentary packaging sample kit.
            </p>

            {error && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fef2f2',
                border: '1px solid #fee2e2',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#dc2626',
                fontSize: '13px',
                fontWeight: 600,
                marginBottom: '20px'
              }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--kraft-300, #c09457)' }} />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Full Name"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(192, 148, 87, 0.3)',
                    background: 'white',
                    fontSize: '14px',
                    color: 'var(--kraft-950, #1a1208)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--kraft-600, #c09457)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(192, 148, 87, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(192, 148, 87, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--kraft-300, #c09457)' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Corporate Email"
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(192, 148, 87, 0.3)',
                    background: 'white',
                    fontSize: '14px',
                    color: 'var(--kraft-950, #1a1208)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--kraft-600, #c09457)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(192, 148, 87, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(192, 148, 87, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--kraft-300, #c09457)' }} />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Contact Number (digits only)"
                  required
                  maxLength={15}
                  inputMode="numeric"
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 44px',
                    borderRadius: '12px',
                    border: '1.5px solid rgba(192, 148, 87, 0.3)',
                    background: 'white',
                    fontSize: '14px',
                    color: 'var(--kraft-950, #1a1208)',
                    outline: 'none',
                    boxSizing: 'border-box',
                    transition: 'all 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--kraft-600, #c09457)';
                    e.target.style.boxShadow = '0 0 0 3px rgba(192, 148, 87, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(192, 148, 87, 0.3)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '15px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
                  color: 'white',
                  fontWeight: 700,
                  fontSize: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: loading ? 'wait' : 'pointer',
                  boxShadow: '0 8px 16px rgba(26, 18, 8, 0.15)',
                  transition: 'all 0.3s ease',
                  marginTop: '6px',
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(26, 18, 8, 0.25)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(26, 18, 8, 0.15)';
                }}
              >
                {loading ? 'Securing Offer...' : 'Get My 10% Discount'}
                <Send size={16} />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Global CSS injection for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleUp {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
