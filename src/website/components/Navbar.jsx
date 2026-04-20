import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, ShoppingBag, User, ChevronDown, MessageCircle } from 'lucide-react';

const navLinks = [
  { label: 'Home', to: '/' },
  {
    label: 'Products',
    to: '/products',
    children: [
      { label: 'Ecocraft Bags', to: '/products/ecocraft' },
      { label: 'F&B Gourmet Bags', to: '/products/fnb' },
      { label: 'Luxury Bags', to: '/products/luxury' },
    ],
  },
  // { label: 'Design Your Product', to: '/design' },
  { label: 'About', to: '/about' },
  { label: 'Sustainable Solutions', to: '/sustainability' },
  { label: 'Contact', to: '/contact' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setProductsOpen(false);
  }, [location]);

  const isHome = location.pathname === '/';

  return (
    <>
      <nav
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'background 0.4s ease, box-shadow 0.4s ease, padding 0.3s ease',
          background: scrolled
            ? 'rgba(253, 249, 243, 0.96)'
            : isHome
              ? 'transparent'
              : 'rgba(253, 249, 243, 0.96)',
          backdropFilter: scrolled || !isHome ? 'blur(20px)' : 'none',
          boxShadow: scrolled ? 'var(--shadow-sm)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(192, 148, 87, 0.15)' : 'none',
          padding: scrolled ? '10px 0' : '18px 0',
        }}
      >
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 20px' : '0 40px',
          maxWidth: '1440px', // Standard desktop max-width for better focus
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{
              width: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              background: 'linear-gradient(135deg, #000000 0%, #1a1208 100%)',
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
              flexShrink: 0
            }}>
              <Leaf size={isMobile ? 18 : 22} color="white" />
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap'
            }}>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isMobile ? '20px' : '26px',
                fontWeight: 900,
                color: scrolled || !isHome ? '#000000' : isHome ? (isMobile ? '#000000' : '#ffffff') : '#000000',
                textShadow: !scrolled && isHome && !isMobile ? '0 2px 8px rgba(0,0,0,0.6)' : 'none',
                lineHeight: 1,
                letterSpacing: '-0.01em'
              }}>
                Nirmalyam Krafts
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} className="desktop-nav">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} style={{ position: 'relative' }}
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <NavLink
                    to={link.to}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 5,
                      padding: '8px 14px',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '15px',
                      fontWeight: 700,
                      textDecoration: 'none',
                      color: scrolled || !isHome
                        ? isActive ? 'var(--eco-700)' : 'var(--kraft-800)'
                        : isActive ? 'var(--eco-400)' : 'white',
                      textShadow: !scrolled && isHome ? '0 2px 8px rgba(0,0,0,0.8)' : 'none',
                      background: isActive
                        ? scrolled || !isHome ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.12)'
                        : 'transparent',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    })}
                  >
                    {link.label}
                    <ChevronDown size={12} style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                  </NavLink>
                  {productsOpen && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      background: 'white',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--kraft-100)',
                      overflow: 'hidden',
                      minWidth: 180,
                      zIndex: 100,
                      animation: 'fadeInUp 0.2s ease',
                    }}>
                      {link.children.map((child) => (
                        <Link
                          key={child.label}
                          to={child.to}
                          style={{
                            display: 'block',
                            padding: '10px 18px',
                            textDecoration: 'none',
                            fontSize: '14px',
                            color: 'var(--kraft-800)',
                            fontFamily: "'Inter', sans-serif",
                            transition: 'background 0.2s',
                          }}
                          onMouseEnter={e => e.target.style.background = 'var(--kraft-50)'}
                          onMouseLeave={e => e.target.style.background = 'transparent'}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  style={({ isActive }) => ({
                    padding: '8px 14px',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '15px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    color: scrolled || !isHome
                      ? isActive ? 'var(--eco-700)' : 'var(--kraft-800)'
                      : isActive ? 'var(--eco-400)' : 'white',
                    textShadow: !scrolled && isHome ? '0 2px 8px rgba(0,0,0,0.8)' : 'none',
                    background: isActive
                      ? scrolled || !isHome ? 'rgba(22,163,74,0.06)' : 'rgba(255,255,255,0.12)'
                      : 'transparent',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  })}
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            <Link to="/contact#contact-form" className="btn-primary" style={{
              padding: isMobile ? '10px 16px' : '14px 32px',
              fontSize: isMobile ? '13px' : '16px',
              borderRadius: '100px',
              background: 'var(--eco-600)',
              boxShadow: '0 8px 20px rgba(34, 197, 94, 0.2)',
              fontWeight: 700
            }}>
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Consult Expert</span>
              <MessageCircle size={isMobile ? 20 : 18} style={{ marginLeft: isMobile ? 0 : 10 }} />
            </Link>

            {/* Hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="mobile-menu-btn"
              style={{
                display: 'none',
                padding: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: scrolled || !isHome || isMobile ? 'var(--kraft-900)' : 'white',
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 999,
          background: 'rgba(14,9,4,0.6)',
          backdropFilter: 'blur(4px)',
        }} onClick={() => setMobileOpen(false)}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              height: '100%',
              width: 300,
              background: 'var(--kraft-50)',
              boxShadow: 'var(--shadow-xl)',
              padding: '80px 24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              animation: 'slideInLeft 0.3s ease',
            }}
          >
            {navLinks.map((link) => (
              <NavLink
                key={link.label}
                to={link.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '18px 24px',
                  borderRadius: '18px',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '20px',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: isActive ? 'var(--eco-700)' : 'var(--kraft-950)',
                  background: isActive ? 'rgba(22,163,74,0.1)' : 'white',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--eco-200)' : 'var(--kraft-100)',
                  transition: 'all 0.3s ease',
                  boxShadow: isActive ? '0 10px 20px rgba(22,163,74,0.06)' : 'none'
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 1024px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
