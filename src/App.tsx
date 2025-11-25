import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import ForgotPassword from "./pages/AuthPages/ForgotPassword";
import ProtectedRoute from "./context/ProtectedRoute";
import CategoryManagement from "./pages/CategoryManagement/CategoryManagement";
import UpdateProfile from "./pages/Profile/UpdateProfile";
import TestFormManager from "./pages/Labmanagement/TestFormManager";
import Staff from "./pages/Staff/Staff";
import PackageList from "./pages/PackageManagement/PackageList";
import PackageForm from "./pages/PackageManagement/PackageForm";
import PackageAssign from "./pages/PackageManagement/PackageAssign";
import AssignTestForm from "./pages/Labmanagement/AssignTestFrom";
import BookingList from "./pages/BookingManagement/BookingList";
import BookingDetails from "./pages/BookingManagement/BookingDetails";
import Inquiry from "./pages/Inquiry/Inquiry";
import EmployeeStaffManagement from "./pages/EmployeeStaffManagement/EmployeeStaffManagement";

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
          />{" "}
          {/* Staff Management */}
          <Route index path="/Staff" element={<Staff />} />
          <Route
            index
            path="/employee-staff"
            element={<EmployeeStaffManagement />}
          />
          {/* Test Management */}
          <Route index path="/test-form" element={<TestFormManager />} />
          <Route
            index
            path="/test-form/assign"
            element={<AssignTestForm />}
          />{" "}
          {/* Packages Management */}
          <Route index path="/packages" element={<PackageList />} />
          <Route index path="/packages/new" element={<PackageForm />} />
          <Route path="/packages/assign" element={<PackageAssign />} />
          {/* Booking Management */}
          <Route index path="/booking-list" element={<BookingList />} />
          <Route
            index
            path="/booking/details/:id"
            element={<BookingDetails />}
          />
          <Route index path="/profile-management" element={<UpdateProfile />} />
          <Route index path="/inquiry" element={<Inquiry />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
