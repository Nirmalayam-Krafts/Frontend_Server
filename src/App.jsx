import { BrowserRouter, Routes, Route } from 'react-router-dom';

/* Layout */
import Navbar from './website/components/Navbar';
import Footer from './website/components/Footer';

/* Website Pages */
import Home from './website/pages/Home';
import Products from './website/pages/Products';
import About from './website/pages/About';
import Contact from './website/pages/Contact';
import AccountSpace from './website/pages/AccountSpace';
import DesignYourProduct from './website/pages/DesignYourProduct';
import NotFound from './website/pages/NotFound';

/* Admin */
import AdminPlaceholder from './admin/AdminPlaceholder';

/* Scroll to top on navigation */
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [pathname]);
  return null;
}

/* Pages that should NOT show the website navbar / footer */
const fullscreenRoutes = ['/admin'];

function Layout() {
  const { pathname } = useLocation();
  const isFullscreen = fullscreenRoutes.some(r => pathname.startsWith(r));

  return (
    <>
      <ScrollToTop />
      {!isFullscreen && <Navbar />}
      <main>
        <Routes>
          {/* ── Website ── */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/account" element={<AccountSpace />} />
          <Route path="/design" element={<DesignYourProduct />} />

          {/* ── Policy stubs (redirect to about for now) ── */}
          <Route path="/privacy" element={<NotFound />} />
          <Route path="/returns" element={<NotFound />} />
          <Route path="/shipping" element={<NotFound />} />
          <Route path="/terms" element={<NotFound />} />

          {/* ── Admin ── */}
          <Route path="/admin/*" element={<AdminPlaceholder />} />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isFullscreen && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
