import { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Leaf, Menu, X, ShoppingBag, User, ChevronDown } from 'lucide-react';

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
          padding: '0 var(--container-gutter)', // Consistent side padding
          maxWidth: '1800px' // Wider reach for elite feel
        }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, var(--kraft-800) 0%, var(--kraft-600) 100%)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Leaf size={18} color="var(--kraft-100)" />
            </div>
            <div>
              <div style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: 700,
                color: scrolled || !isHome ? 'var(--kraft-950)' : 'white',
                textShadow: !scrolled && isHome ? '0 2px 10px rgba(26, 18, 8, 0.3)' : 'none',
                lineHeight: 1,
              }}>
                Nirmalyam
              </div>
              <div style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: '10px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: scrolled || !isHome ? 'var(--eco-600)' : 'rgba(255,255,255,0.75)',
              }}>
                Krafts
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} style={{ position: 'relative' }}
                  onMouseEnter={() => setProductsOpen(true)}
                  onMouseLeave={() => setProductsOpen(false)}
                >
                  <NavLink
                    to={link.to}
                    style={({ isActive }) => ({
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-full)',
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      fontWeight: 500,
                      textDecoration: 'none',
                      color: scrolled || !isHome
                        ? isActive ? 'var(--eco-700)' : 'var(--kraft-800)'
                        : isActive ? 'var(--eco-400)' : 'rgba(255,255,255,0.9)',
                      textShadow: !scrolled && isHome ? '0 1px 12px rgba(26, 18, 8, 0.4)' : 'none',
                      background: isActive
                        ? scrolled || !isHome ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.1)'
                        : 'transparent',
                      transition: 'all 0.2s',
                    })}
                  >
                    {link.label}
                    <ChevronDown size={14} style={{ transform: productsOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
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
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: scrolled || !isHome
                      ? isActive ? 'var(--eco-700)' : 'var(--kraft-800)'
                      : isActive ? 'var(--eco-400)' : 'rgba(255,255,255,0.9)',
                    background: isActive
                      ? scrolled || !isHome ? 'rgba(22,163,74,0.08)' : 'rgba(255,255,255,0.1)'
                      : 'transparent',
                    transition: 'all 0.2s',
                  })}
                >
                  {link.label}
                </NavLink>
              )
            )}
          </div>

          {/* Right Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

            <Link to="/contact" className="btn-primary" style={{
              padding: isMobile ? '8px 12px' : '9px 22px',
              fontSize: isMobile ? '12px' : '13px'
            }}>
              <span style={{ display: isMobile ? 'none' : 'inline' }}>Get a Quote</span>
              <ShoppingBag size={isMobile ? 18 : 14} />
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
                color: scrolled || !isHome ? 'var(--kraft-900)' : 'white',
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
                  display: 'block',
                  padding: '14px 16px',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '16px',
                  fontWeight: 500,
                  textDecoration: 'none',
                  color: isActive ? 'var(--eco-700)' : 'var(--kraft-800)',
                  background: isActive ? 'rgba(22,163,74,0.08)' : 'transparent',
                  transition: 'all 0.2s',
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
