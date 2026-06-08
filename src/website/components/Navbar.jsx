import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, ShoppingBag, User, ChevronDown, ArrowRight } from 'lucide-react';

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
      {/* Top Banner for Affordability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '40px',
        background: 'linear-gradient(135deg, #15803d 0%, #166534 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: isMobile ? '11px' : '13px',
        fontWeight: 700,
        zIndex: 1001,
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        padding: '0 12px',
        boxSizing: 'border-box',
        transition: 'transform 0.3s ease',
        transform: scrolled ? 'translateY(-40px)' : 'translateY(0)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center', textAlign: 'center' }}>
          <span style={{ background: '#f59e0b', color: '#1e1b4b', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>Lowest Price Guarantee</span>
          <span>India's Most Affordable Custom Kraft Bags — Direct Wholesale Factory Rates!</span>
        </div>
      </div>

      <nav
        style={{
          position: 'fixed',
          top: scrolled ? 0 : '40px',
          left: 0,
          right: 0,
          zIndex: 1000,
          transition: 'top 0.3s ease, background 0.4s ease, box-shadow 0.4s ease, padding 0.3s ease',
          background: scrolled
            ? 'rgba(253, 249, 243, 0.96)'
            : 'rgba(253, 249, 243, 0.96)',
          backdropFilter: 'blur(20px)',
          boxShadow: scrolled ? 'var(--shadow-sm)' : '0 1px 3px rgba(0,0,0,0.05)',
          borderBottom: '1px solid rgba(192, 148, 87, 0.15)',
          padding: scrolled ? '6px 0' : '8px 0',
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
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none', flexShrink: 0 }}>
            <img 
              src="/Nirmalyam_Logo-removebg-preview.png" 
              alt="Nirmalyam Krafts Logo" 
              style={{ 
                height: isMobile ? '64px' : '88px', 
                width: 'auto', 
                objectFit: 'contain',
                transition: 'all 0.3s ease'
              }} 
            />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: isMobile ? '18px' : '24px',
              fontWeight: 700,
              color: 'var(--kraft-950)',
              letterSpacing: '-0.5px',
              display: isMobile ? 'none' : 'block'
            }}>
              Nirmalyam Krafts
            </span>
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
                      color: isActive ? 'var(--eco-700)' : 'var(--kraft-800)',
                      textShadow: 'none',
                      background: isActive
                        ? 'rgba(22,163,74,0.06)' 
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
                    color: isActive ? 'var(--eco-700)' : 'var(--kraft-800)',
                    textShadow: 'none',
                    background: isActive
                      ? 'rgba(22,163,74,0.06)' 
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

            {!isMobile && (
              <Link to="/contact#contact-form" style={{
                padding: '12px 28px',
                fontSize: '15px',
                borderRadius: '100px',
                background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
                color: 'white',
                boxShadow: '0 4px 16px rgba(26, 18, 8, 0.25)',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                transition: 'all 0.3s ease',
                border: '2px solid rgba(255, 255, 255, 0.6)',
              }}>
                Get a Quote
                <ArrowRight size={16} />
              </Link>
            )}

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
              width: 300,
              background: 'var(--kraft-50)',
              boxShadow: 'var(--shadow-xl)',
              padding: '80px 24px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              animation: 'slideInLeft 0.3s ease',
              border: '1px solid rgba(192, 148, 87, 0.2)',
              borderRight: 'none',
              borderTop: 'none',
              borderBottomLeftRadius: '24px',
            }}
          >
            {navLinks.map((link) => (
              link.children ? (
                <div key={link.label}>
                  {/* Products toggle */}
                  <button
                    onClick={() => setProductsOpen(!productsOpen)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '16px 20px',
                      borderRadius: '14px',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '17px',
                      fontWeight: 700,
                      color: location.pathname.startsWith('/products') ? 'var(--eco-700)' : 'var(--kraft-950)',
                      background: location.pathname.startsWith('/products') ? 'rgba(22,163,74,0.1)' : 'white',
                      border: '1px solid',
                      borderColor: location.pathname.startsWith('/products') ? 'var(--eco-200)' : 'var(--kraft-100)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {link.label}
                    <ChevronDown size={16} style={{ 
                      transform: productsOpen ? 'rotate(180deg)' : 'none', 
                      transition: 'transform 0.3s',
                      color: 'var(--kraft-400)'
                    }} />
                  </button>
                  {/* Sub-menu */}
                  <div style={{
                    maxHeight: productsOpen ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease',
                  }}>
                    <div style={{ 
                      padding: '8px 0 4px 12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                    }}>
                      {link.children.map((child) => (
                        <NavLink
                          key={child.label}
                          to={child.to}
                          style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            padding: '12px 16px',
                            borderRadius: '10px',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '15px',
                            fontWeight: 600,
                            textDecoration: 'none',
                            color: isActive ? 'var(--eco-700)' : 'var(--kraft-700)',
                            background: isActive ? 'rgba(22,163,74,0.06)' : 'transparent',
                            transition: 'all 0.2s ease',
                            borderLeft: isActive ? '3px solid var(--eco-500)' : '3px solid transparent',
                          })}
                        >
                          <ShoppingBag size={14} />
                          {child.label}
                        </NavLink>
                      ))}
                      <NavLink
                        to="/products"
                        end
                        style={({ isActive }) => ({
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '12px 16px',
                          borderRadius: '10px',
                          fontFamily: "'Inter', sans-serif",
                          fontSize: '14px',
                          fontWeight: 700,
                          textDecoration: 'none',
                          color: 'var(--kraft-500)',
                          transition: 'all 0.2s ease',
                          borderLeft: '3px solid transparent',
                        })}
                      >
                        View All Products →
                      </NavLink>
                    </div>
                  </div>
                </div>
              ) : (
                <NavLink
                  key={link.label}
                  to={link.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderRadius: '14px',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '17px',
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
              )
            ))}

            {/* Mobile CTA */}
            <Link
              to="/contact#contact-form"
              onClick={() => setMobileOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '16px 20px',
                borderRadius: '14px',
                background: 'linear-gradient(135deg, #1a1208 0%, #3d2e1a 100%)',
                color: 'white',
                fontWeight: 700,
                fontSize: '17px',
                textDecoration: 'none',
                marginTop: 8,
                border: '1px solid rgba(192, 148, 87, 0.3)',
              }}
            >
              Get a Quote <ArrowRight size={18} />
            </Link>
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
