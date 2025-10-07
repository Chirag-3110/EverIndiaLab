import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import User from "./pages/Users/User";
import Property from "./pages/Property/Property";
import Tickets from "./pages/Tickets/Tickets";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ProtectedRoute from "./context/ProtectedRoute";
import Convention from "./pages/Convention/Convention";
import CMSPage from "./pages/CMS/CMS";
import LabManagement from "./pages/Labmanagement/LabManagement";
import CategoryManagement from "./pages/CategoryManagement/CategoryManagement";
import UpdateProfile from "./pages/Profile/UpdateProfile";
import ContactPage from "./pages/ContactPage/ContactPage";
import Labs from "./pages/Labmanagement/Labs";
import LabDetail from "./pages/Labmanagement/LabDetail";
import TestFormManager from "./pages/Labmanagement/TestFormManager";
import Staff from "./pages/Staff/Staff";
import Mail from "./pages/Email/Mail";
import SiteSetting from "./pages/SiteSetting/SiteSetting";
import FaqAdminPage from "./pages/FaqAdmin/FaqAdminPage";

export default function App() {
  return (
    <Router>
      <ScrollToTop />

      <Routes>
        {/* Public routes */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/reset-password" element={<ForgotPassword />} />

        {/* Protected routes nested inside AppLayout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route index path="/" element={<Home />} />
          <Route
            index
            path="/category-management"
            element={<CategoryManagement />}
          />
          <Route index path="/users" element={<User />} />
          <Route index path="/Staff" element={<Staff />} />
          <Route index path="/labs" element={<Labs />} />
          <Route path="/labs/:id" element={<LabDetail />} />
          <Route index path="/lab-management" element={<LabManagement />} />
          <Route index path="/test-form" element={<TestFormManager />} />
          <Route index path="/profile-management" element={<UpdateProfile />} />
          <Route index path="/cms" element={<CMSPage />} />
          <Route index path="/contact" element={<ContactPage />} />
          <Route index path="/email-logs" element={<Mail />} />
          <Route index path="/site-settings" element={<SiteSetting />} />
          <Route index path="/faq" element={<FaqAdminPage />} />

          <Route index path="/property" element={<Property />} />
          <Route index path="/convention" element={<Convention />} />

          <Route index path="/tickets" element={<Tickets />} />

          {/* Others Page */}
          <Route path="/profile" element={<UserProfiles />} />
          <Route path="/blank" element={<Blank />} />

          {/* Forms */}
          <Route path="/form-elements" element={<FormElements />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
