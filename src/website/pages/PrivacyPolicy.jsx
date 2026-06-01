import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, Lock, Database, UserCheck, Globe, Mail, ArrowRight, ChevronRight } from 'lucide-react';

/* ── Policy Sections ── */
const policySections = [
  {
    id: 'information-collection',
    icon: Database,
    title: 'Information We Collect',
    content: [
      {
        subtitle: 'Personal Information',
        text: 'When you place an order, request a quote, or contact us, we may collect your name, email address, phone number, shipping address, billing address, and company details. This information is essential for processing your orders and delivering our premium kraft packaging products.'
      },
      {
        subtitle: 'Business Information',
        text: 'For wholesale and B2B clients, we collect business name, GST/tax identification numbers, trade licenses, and authorized contact person details to facilitate bulk orders and maintain compliance with applicable trade regulations.'
      },
      {
        subtitle: 'Usage Data',
        text: 'We automatically collect certain information when you visit our website, including your IP address, browser type, device information, pages visited, and time spent on each page. This data helps us improve your browsing experience and optimize our website performance.'
      }
    ]
  },
  {
    id: 'how-we-use',
    icon: Eye,
    title: 'How We Use Your Information',
    content: [
      {
        subtitle: 'Order Fulfillment',
        text: 'Your personal and shipping details are used to process, manufacture, and deliver your custom kraft packaging orders. We use your contact information to send order confirmations, production updates, shipping notifications, and delivery receipts.'
      },
      {
        subtitle: 'Customer Communication',
        text: 'We may use your email or phone number to respond to inquiries, provide customer support, share product catalogs, send promotional offers (with your consent), and notify you about new sustainable packaging innovations.'
      },
      {
        subtitle: 'Website Improvement',
        text: 'Usage data and analytics help us understand how visitors interact with our website, enabling us to enhance user experience, optimize product listings, and improve our design tool features.'
      }
    ]
  },
  {
    id: 'data-protection',
    icon: Lock,
    title: 'Data Protection & Security',
    content: [
      {
        subtitle: 'Encryption & Storage',
        text: 'All sensitive information, including payment details and personal data, is encrypted using industry-standard SSL/TLS protocols. Your data is stored on secure servers with restricted access, regular backups, and advanced firewall protection.'
      },
      {
        subtitle: 'Payment Security',
        text: 'We do not store your complete credit/debit card information on our servers. All payment processing is handled by PCI-DSS compliant third-party payment gateways that adhere to the highest security standards.'
      },
      {
        subtitle: 'Employee Access',
        text: 'Access to your personal information is limited to authorized employees who require it for specific business operations. All team members are bound by strict confidentiality agreements and undergo regular data protection training.'
      }
    ]
  },
  {
    id: 'sharing',
    icon: UserCheck,
    title: 'Information Sharing',
    content: [
      {
        subtitle: 'Third-Party Service Providers',
        text: 'We may share your information with trusted partners who assist us in operating our website, conducting business, or servicing you—including shipping carriers, payment processors, and cloud hosting providers. These partners are contractually obligated to keep your information confidential.'
      },
      {
        subtitle: 'Legal Requirements',
        text: 'We may disclose your information when required by law, to comply with legal proceedings, enforce our site policies, or protect the rights, property, and safety of Nirmalyam Krafts and its customers.'
      },
      {
        subtitle: 'No Sale of Data',
        text: 'Nirmalyam Krafts never sells, trades, or rents your personal identification information to third parties for marketing purposes. Your trust is foundational to our business, and we treat your data with the same care we put into our sustainable packaging.'
      }
    ]
  },
  {
    id: 'your-rights',
    icon: Globe,
    title: 'Your Rights & Choices',
    content: [
      {
        subtitle: 'Access & Correction',
        text: 'You have the right to access, update, or correct your personal information at any time. You can do this by logging into your account, or by contacting our support team directly.'
      },
      {
        subtitle: 'Data Deletion',
        text: 'You may request the deletion of your personal data from our systems, subject to any legal retention requirements. We will process your request within 30 business days and confirm the deletion via email.'
      },
      {
        subtitle: 'Marketing Opt-Out',
        text: 'You can opt out of receiving promotional communications at any time by clicking the "unsubscribe" link in our emails or by contacting us directly. Please note that transactional communications related to your orders will continue.'
      }
    ]
  }
];

/* ── Table of Contents ── */
const tocItems = policySections.map(s => ({ id: s.id, title: s.title }));

export default function PrivacyPolicy() {
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

      {/* ── Page Hero ── */}
      <div className="page-hero" style={{
        position: 'relative',
        minHeight: isMobile ? '400px' : isTablet ? '420px' : '480px',
        display: 'flex',
        alignItems: 'center',
        padding: isMobile ? '100px 0 60px' : '120px 0 80px'
      }}>
        {/* Decorative gradient orbs */}
        <div style={{
          position: 'absolute',
          top: '20%',
          right: '10%',
          width: isMobile ? 200 : 400,
          height: isMobile ? 200 : 400,
          background: 'radial-gradient(circle, rgba(22, 163, 74, 0.15) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '5%',
          width: isMobile ? 150 : 300,
          height: isMobile ? 150 : 300,
          background: 'radial-gradient(circle, rgba(192, 168, 117, 0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          pointerEvents: 'none'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, maxWidth: '1440px' }}>
          <div className="anim-fade-up" style={{ textAlign: 'center', maxWidth: 800, margin: '0 auto' }}>
            <div className="eco-badge" style={{
              marginBottom: 24,
              background: 'rgba(192, 148, 87, 0.2)',
              color: 'var(--kraft-100)',
              borderColor: 'rgba(255,255,255,0.2)',
              margin: '0 auto 24px'
            }}>
              <Shield size={14} />
              Your Data, Our Responsibility
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(36px, 6vw, 72px)',
              color: 'white',
              fontWeight: 600,
              marginBottom: 24,
              lineHeight: 1.1
            }}>
              Privacy <span style={{ color: 'var(--kraft-300)' }}>Policy</span>
            </h1>
            <p style={{
              fontSize: isMobile ? '16px' : '20px',
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.8,
              maxWidth: 650,
              margin: '0 auto'
            }}>
              At Nirmalyam Krafts, we value your privacy as much as we value sustainability. This policy outlines how we collect, use, and protect your information.
            </p>
            <p style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.4)',
              marginTop: 24,
              fontWeight: 500
            }}>
              Last updated: June 1, 2026
            </p>
          </div>
        </div>
      </div>

      {/* ── Table of Contents ── */}
      <section style={{
        padding: isMobile ? '48px 0 0' : '64px 0 0',
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div className="glass-card anim-fade-up" style={{
            padding: isMobile ? '28px 24px' : '40px 48px',
            borderRadius: 'var(--radius-xl)',
            maxWidth: 900,
            margin: '0 auto',
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid var(--kraft-200)'
          }}>
            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? 20 : 24,
              color: 'var(--kraft-950)',
              marginBottom: 20,
              fontWeight: 700
            }}>
              Quick Navigation
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: 12
            }}>
              {tocItems.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '14px 20px',
                    background: 'var(--kraft-50)',
                    border: '1px solid var(--kraft-100)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textAlign: 'left',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 15,
                    color: 'var(--kraft-800)',
                    fontWeight: 600
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = 'var(--eco-400)';
                    e.currentTarget.style.transform = 'translateX(6px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'var(--kraft-50)';
                    e.currentTarget.style.borderColor = 'var(--kraft-100)';
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: 'var(--eco-600)',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 13,
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {idx + 1}
                  </span>
                  {item.title}
                  <ChevronRight size={16} style={{ marginLeft: 'auto', opacity: 0.4 }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Policy Content Sections ── */}
      <section style={{
        padding: isMobile ? '48px 0 80px' : '80px 0 120px',
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            {policySections.map((section, sIdx) => {
              const Icon = section.icon;
              return (
                <div
                  key={section.id}
                  id={section.id}
                  className="anim-fade-up"
                  style={{
                    animationDelay: `${sIdx * 0.1}s`,
                    marginBottom: sIdx < policySections.length - 1 ? (isMobile ? 48 : 64) : 0,
                    scrollMarginTop: 120
                  }}
                >
                  {/* Section Header */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    marginBottom: 32
                  }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)',
                      borderRadius: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 8px 24px rgba(22, 163, 74, 0.25)',
                      flexShrink: 0
                    }}>
                      <Icon size={24} color="white" />
                    </div>
                    <div>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        letterSpacing: '0.15em',
                        textTransform: 'uppercase',
                        color: 'var(--eco-600)'
                      }}>
                        Section {sIdx + 1}
                      </span>
                      <h2 style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: isMobile ? 24 : 32,
                        fontWeight: 700,
                        color: 'var(--kraft-950)',
                        lineHeight: 1.2,
                        margin: 0
                      }}>
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  {/* Section Content Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    {section.content.map((item, cIdx) => (
                      <div
                        key={cIdx}
                        style={{
                          background: 'white',
                          borderRadius: 'var(--radius-lg)',
                          padding: isMobile ? '28px 24px' : '36px 40px',
                          border: '1px solid var(--kraft-100)',
                          transition: 'all 0.4s ease',
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.borderColor = 'var(--kraft-300)';
                          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                          e.currentTarget.style.transform = 'translateY(-4px)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.borderColor = 'var(--kraft-100)';
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >

                        <h4 style={{
                          fontWeight: 700,
                          fontSize: isMobile ? 17 : 19,
                          color: 'var(--kraft-950)',
                          marginBottom: 12,
                          fontFamily: "'Inter', sans-serif"
                        }}>
                          {item.subtitle}
                        </h4>
                        <p style={{
                          fontSize: isMobile ? 15 : 16,
                          color: 'var(--kraft-600)',
                          lineHeight: 1.8,
                          margin: 0
                        }}>
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Divider between sections */}
                  {sIdx < policySections.length - 1 && (
                    <div style={{
                      height: 1,
                      background: 'linear-gradient(90deg, transparent, var(--kraft-200), transparent)',
                      marginTop: isMobile ? 48 : 64
                    }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Cookie Notice ── */}
      <section style={{
        padding: isMobile ? '60px 0' : '80px 0',
        background: 'white'
      }}>
        <div className="container" style={{ maxWidth: '1440px' }}>
          <div style={{
            maxWidth: 900,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: 32
          }}>
            <div className="anim-fade-up" style={{
              background: 'var(--kraft-50)',
              borderRadius: 'var(--radius-xl)',
              padding: isMobile ? '32px 24px' : '40px',
              border: '1px solid var(--kraft-100)'
            }}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--kraft-950)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20
              }}>
                <Globe size={22} color="var(--kraft-300)" />
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--kraft-950)',
                marginBottom: 12
              }}>
                Cookie Policy
              </h3>
              <p style={{
                fontSize: 15,
                color: 'var(--kraft-600)',
                lineHeight: 1.7,
                margin: 0
              }}>
                We use essential cookies to ensure our website functions properly. Analytics cookies help us understand how you use our site. You can manage your cookie preferences through your browser settings at any time.
              </p>
            </div>

            <div className="anim-fade-up delay-200" style={{
              background: 'var(--kraft-50)',
              borderRadius: 'var(--radius-xl)',
              padding: isMobile ? '32px 24px' : '40px',
              border: '1px solid var(--kraft-100)'
            }}>
              <div style={{
                width: 44, height: 44,
                background: 'var(--kraft-950)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 20
              }}>
                <Shield size={22} color="var(--kraft-300)" />
              </div>
              <h3 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 22,
                fontWeight: 700,
                color: 'var(--kraft-950)',
                marginBottom: 12
              }}>
                Policy Updates
              </h3>
              <p style={{
                fontSize: 15,
                color: 'var(--kraft-600)',
                lineHeight: 1.7,
                margin: 0
              }}>
                We may update this Privacy Policy periodically to reflect changes in our practices or applicable laws. Any significant changes will be communicated via email to registered users and prominently displayed on our website.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA / Contact Section ── */}
      <section style={{
        paddingTop: isMobile ? '80px' : '120px',
        paddingBottom: isMobile ? '100px' : '140px',
        textAlign: 'center',
        background: 'var(--ink-950)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(160deg, rgba(45,38,23,0.95) 0%, rgba(14,9,4,0.98) 100%)',
          zIndex: 0
        }} />
        {/* Decorative pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          pointerEvents: 'none',
          zIndex: 1
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 2, maxWidth: '1440px' }}>
          <div className="anim-fade-up">
            <div style={{
              width: 64, height: 64,
              background: 'rgba(255,255,255,0.08)',
              borderRadius: 20,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 28px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <Mail size={28} color="var(--eco-400)" />
            </div>
            <h2 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(28px, 5vw, 48px)',
              color: 'white',
              marginBottom: 20,
              lineHeight: 1.15,
              fontWeight: 600
            }}>
              Questions About Your <br />
              <span className="text-gradient">Privacy?</span>
            </h2>
            <p style={{
              fontSize: isMobile ? 16 : 18,
              color: 'rgba(255,255,255,0.6)',
              maxWidth: 550,
              margin: '0 auto 40px',
              lineHeight: 1.7
            }}>
              Our data protection team is here to help. Reach out for any concerns regarding your personal data.
            </p>
            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link to="/contact" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: isMobile ? '12px 28px' : '16px 36px',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--eco-600) 0%, var(--eco-700) 100%)',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.5)',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
                boxShadow: '0 8px 24px rgba(22, 163, 74, 0.3)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px) scale(1.03)';
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(22, 163, 74, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(22, 163, 74, 0.3)';
              }}
              >
                Contact Us <ArrowRight size={18} />
              </Link>
              <a href="mailto:privacy@nirmalyamkrafts.com" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                padding: isMobile ? '12px 28px' : '16px 36px',
                fontSize: isMobile ? '14px' : '15px',
                fontWeight: 700,
                background: 'transparent',
                color: 'white',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: '100px',
                textDecoration: 'none',
                transition: 'all 0.3s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
                e.currentTarget.style.background = 'transparent';
              }}
              >
                <Mail size={18} /> Email Privacy Team
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
