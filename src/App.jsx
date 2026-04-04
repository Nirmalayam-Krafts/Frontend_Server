import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

/* Website */
import Navbar from "./website/components/Navbar";
import Footer from "./website/components/Footer";
import Home from "./website/pages/Home";
import Products from "./website/pages/Products";
import About from "./website/pages/About";
import Contact from "./website/pages/Contact";
import ProductCategory from "./website/pages/ProductCategory";
import DesignYourProduct from "./website/pages/DesignYourProduct";
import NotFound from "./website/pages/NotFound";

/* Dashboard */
import Dashboard from "./Dashboard/pages/dashboard/Dashboard";
import Leads from "./Dashboard/pages/leads/Leads";
import Inventory from "./Dashboard/pages/inventory/Inventory";
import Orders from "./Dashboard/pages/orders/Orders";
import Finance from "./Dashboard/pages/finance/Finance";
import Analytics from "./Dashboard/pages/analytics/Analytics";
import Settings from "./Dashboard/pages/settings/Settings";

/* Store + UI */
import { useUIStore } from "./Dashboard/store";
import { Toast } from "./Dashboard/components/ui";

/* Scroll to top on route change */
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);

  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const notification = useUIStore((state) => state.notification);

  /* Hide website navbar/footer on dashboard pages */
  const dashboardRoutes = [
    "/dashboard",
    "/leads",
    "/inventory",
    "/orders",
    "/finance",
    "/analytics",
    "/settings",
  ];

  const isDashboardRoute = dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      <ScrollToTop />

      {!isDashboardRoute && <Navbar />}

      <main>
        <Routes>
          {/* Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:categoryId" element={<ProductCategory />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/design" element={<DesignYourProduct />} />

          {/* Policy / Extra Pages */}
          <Route path="/privacy" element={<NotFound />} />
          <Route path="/returns" element={<NotFound />} />
          <Route path="/shipping" element={<NotFound />} />
          <Route path="/terms" element={<NotFound />} />

          {/* Dashboard Routes */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}

      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => useUIStore.setState({ notification: null })}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}