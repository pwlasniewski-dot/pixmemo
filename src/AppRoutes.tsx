import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import PhotographerDashboardPage from "./pages/dashboard/photographer";
// Strony klienta
import PixMemoHome from "./pages/PixMemoHome";
import PhotographersPage from "./pages/photographers";
import PhotographerPage from "./pages/photographer_[id]";
import BookingPage from "./pages/booking";

// Checkout / płatności
import CheckoutStripePage from "./pages/checkout_stripe";
import CheckoutP24Page from "./pages/checkout_p24";
import PaymentSuccessPage from "./pages/payment_success";
import PaymentErrorPage from "./pages/payment_error";

// (Placeholdery — uzupełnimy później)
const LoginPage = () => <div>Logowanie (placeholder)</div>;
const RegisterPhotographerPage = () => <div>Rejestracja fotografa (placeholder)</div>;

export default function AppRoutes() {
  return (
    <BrowserRouter basename="/pixmemo">
      <Routes>
        <Route element={<App />}>
          {/* Landing */}
          <Route index element={<PixMemoHome />} />

          {/* Klient */}
          <Route path="photographers" element={<PhotographersPage />} />
          <Route path="photographer/:id" element={<PhotographerPage />} />
          <Route path="booking" element={<BookingPage />} />

          {/* Płatności */}
          <Route path="checkout/stripe" element={<CheckoutStripePage />} />
          <Route path="checkout/p24" element={<CheckoutP24Page />} />
          <Route path="payment/success" element={<PaymentSuccessPage />} />
          <Route path="payment/error" element={<PaymentErrorPage />} />

          {/* Auth (na później) */}
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/register-photographer" element={<RegisterPhotographerPage />} />
          <Route path="dashboard/photographer" element={<PhotographerDashboardPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
