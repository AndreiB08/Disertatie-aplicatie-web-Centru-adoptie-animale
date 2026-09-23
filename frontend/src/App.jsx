import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import NavBar from "./components/navbar/navbar.jsx";
import Footer from "./components/footer/footer.jsx";
import Home from "./pages/home/home.jsx";
import NotFound from "./pages/notFound/notFound.jsx";
import Pets from "./pages/pets/pets.jsx";
import PetDetails from "./pages/petDetails/petDetails.jsx";
import About from "./pages/aboutUs/aboutUs.jsx";
import LocationPage from "./pages/location/location.jsx";
import Contact from "./pages/contact/contact.jsx";
import PrivacyPolicy from "./pages/privacyPolicy/privacyPolicy.jsx";
import Login from "./pages/login/login.jsx";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import Staff from "./pages/staff/staff.jsx";
import Account from "./pages/account/account.jsx";
import "./App.css";
import TermsAndConditions from "./pages/termsAndConditions/termsAndConditions.jsx";


const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = ["/login"].includes(location.pathname);
  const hideFooterForAdmin = location.pathname.startsWith("/admin");

  return (
    <>
      {!hideLayout && <NavBar />}
      <div className="main-content">{children}</div>
      {!hideLayout && !hideFooterForAdmin && <Footer />}
    </>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<Pets />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/about" element={<About />} />
          <Route path="/location" element={<LocationPage />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="terms" element={<TermsAndConditions />} />
          <Route path="*" element={<NotFound />} />

          <Route path="/login" element={<Login />} />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/pets"
            element={
              <ProtectedRoute>
                <Pets />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/employees"
            element={
              <ProtectedRoute>
                <Staff />
              </ProtectedRoute>
            }
          />
          <Route path="/admin/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;