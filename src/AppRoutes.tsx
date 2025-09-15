// src/AppRoutes.tsx
import { Routes, Route } from "react-router-dom";
import App from "./App";

// Public
import PixMemoHome from "./pages/PixMemoHome";
import PhotographersPage from "./pages/photographers";
import PhotographerPage from "./pages/photographer_[id]";
import BookingPage from "./pages/booking";
import TrackPhotographerPage from "./pages/track_[id]";

// Checkout
import CheckoutStripePage from "./pages/checkout_stripe";
import CheckoutP24Page from "./pages/checkout_p24";
import PaymentSuccessPage from "./pages/payment_success";
import PaymentErrorPage from "./pages/payment_error";

// Auth & dashboards
import LoginPage from "./pages/auth/login";
import RegisterPhotographerPage from "./pages/auth/register_photographer";
import PhotographerDashboardPage from "./pages/dashboard/photographer";
import AdminDashboardPage from "./pages/dashboard/admin";
import ProtectedRoute from "./components/ProtectedRoute";

// Legal & misc
import LegalPage from "./pages/legal/LegalPage";
import NotFound from "./pages/NotFound";

// client
import ClientBookingsPage from "./pages/client/bookings";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<App />}>
        {/* Public */}
        <Route index element={<PixMemoHome />} />
        <Route path="photographers" element={<PhotographersPage />} />
        <Route path="photographer/:id" element={<PhotographerPage />} />
        <Route path="booking" element={<BookingPage />} />
        <Route path="track/:id" element={<TrackPhotographerPage />} />

        {/* Checkout */}
        <Route path="checkout/stripe" element={<CheckoutStripePage />} />
        <Route path="checkout/p24" element={<CheckoutP24Page />} />
        <Route path="payment/success" element={<PaymentSuccessPage />} />
        <Route path="payment/error" element={<PaymentErrorPage />} />

        {/* Auth */}
        <Route path="auth/login" element={<LoginPage />} />
        <Route path="auth/register-photographer" element={<RegisterPhotographerPage />} />
        <Route path="client/bookings" element={<ClientBookingsPage />} />

        {/* Legal */}
        <Route path="legal/:doc" element={<LegalPage />} />

        {/* Dashboards (protected) */}
        <Route element={<ProtectedRoute allow={["photographer"]} />}>
          <Route path="dashboard/photographer" element={<PhotographerDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute allow={["admin"]} />}>
          <Route path="dashboard/admin" element={<AdminDashboardPage />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
