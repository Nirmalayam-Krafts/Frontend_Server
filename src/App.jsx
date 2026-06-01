import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";

/* Website */
import Navbar from "./website/components/Navbar";
import Footer from "./website/components/Footer";
import Home from "./website/pages/Home";
import Products from "./website/pages/Products";
import About from "./website/pages/About";
import Sustainability from "./website/pages/Sustainability";
import Contact from "./website/pages/Contact";
import ProductCategory from "./website/pages/ProductCategory";
import FloatingWidgets from "./website/components/FloatingWidgets";
import NotFound from "./website/pages/NotFound";
import PrivacyPolicy from "./website/pages/PrivacyPolicy";
import TermsOfService from "./website/pages/TermsOfService";
import ReturnsPolicy from "./website/pages/ReturnsPolicy";
import ShippingTerms from "./website/pages/ShippingTerms";
import AccessibilityPage from "./website/pages/AccessibilityPage";
import { Toaster } from "react-hot-toast";

/* Dashboard */
import Dashboard from "./Dashboard/pages/dashboard/Dashboard";
import Leads from "./Dashboard/pages/leads/Leads";
import Inventory from "./Dashboard/pages/inventory/Inventory";
import Orders from "./Dashboard/pages/orders/Orders";
import Finance from "./Dashboard/pages/finance/Finance";
import Analytics from "./Dashboard/pages/analytics/Analytics";
import Settings from "./Dashboard/pages/settings/Settings";
import Login from "./Dashboard/auth/Login";
import Signup from "./Dashboard/auth/Signup";

/* Store + UI */
import { useUIStore } from "./Dashboard/store";
import { Toast } from "./Dashboard/components/ui";

/* Protected Route */
import ProtectedRoute from "./ProtectedRoute";
import RawMaterial from "./Dashboard/pages/inventory/RawMaterial";
import Product from "./Dashboard/pages/inventory/product";

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const id = hash.replace("#", "");
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      } else {
        // Fallback for slower page mounts
        const timer = setTimeout(() => {
          const el = document.getElementById(id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 200);
        return () => clearTimeout(timer);
      }
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname, hash]);

  return null;
}

function AppLayout() {
  const { pathname } = useLocation();
  const notification = useUIStore((state) => state.notification);

  const dashboardRoutes = [
    "/dashboard",
    "/dashboard/login",
    "/dashboard/signup",
    "/leads",
    "/inventory",
    "/orders",
    "/finance",
    "/analytics",
    "/settings",
    "/rawmaterial",
    "/Product"
  ];

  const isDashboardRoute = dashboardRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <ScrollToTop />

      {!isDashboardRoute && <Navbar />}

      <main>
        <Routes>
          {/* Website Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:categoryId" element={<ProductCategory />} />
          <Route path="/about" element={<About />} />
          <Route path="/sustainability" element={<Sustainability />} />
          <Route path="/contact" element={<Contact />} />
          {/* <Route path="/design" element={<DesignYourProduct />} /> */}

          {/* Auth Routes */}
          <Route path="/dashboard/login" element={<Login />} />
          <Route path="/dashboard/signup" element={<Signup />} />

          {/* Policy / Extra Pages */}
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/returns" element={<ReturnsPolicy />} />
          <Route path="/shipping" element={<ShippingTerms />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/accessibility" element={<AccessibilityPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leads"
            element={
              <ProtectedRoute>
                <Leads />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Inventory />
              </ProtectedRoute>
            }
          />
          <Route
            path="/rawmaterial"
            element={
              <ProtectedRoute>
                <RawMaterial />
              </ProtectedRoute>
            }
          />
          <Route
            path="/Product"
            element={
              <ProtectedRoute>
                <Product />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/finance"
            element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isDashboardRoute && <Footer />}
      {!isDashboardRoute && <FloatingWidgets />}

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
  return <AppLayout />;
}