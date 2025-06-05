import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { ROLES } from './constants';

// Layout
import { PageLayout } from './components/layout/PageLayout';

// Common Pages
import Homepage from './pages/common/HomePage';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ProfilePage from './pages/common/ProfilePage';
import NotFoundPage from './pages/common/NotFoundPage';

// ProtectedRoute and Role Specific Pages
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Parent Pages
import ParentDashboardPage from './pages/parent/ParentDashboardPage';
import AddChildPage from './pages/parent/AddChildPage';
import ViewChildrenPage from './pages/parent/ViewChildrenPage';
import ScheduleVaccinationPage from './pages/parent/ScheduleVaccinationPage';
import ViewParentSchedulesPage from './pages/parent/ViewParentSchedulesPage';

// Doctor Pages
import DoctorDashboardPage from './pages/doctor/DoctorDashboardPage';
import ViewDoctorSchedulesPage from './pages/doctor/ViewDoctorSchedulesPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import ReviewSchedulesPage from './pages/admin/ReviewSchedulesPage';
import ManageUsersPage from './pages/admin/ManageUsersPage';
import CreateDoctorPage from './pages/admin/CreateDoctorPage';
import ManageVaccinesPage from './pages/admin/ManageVaccinesPage';
import ManageRegionsPage from './pages/admin/ManageRegionsPage';
import ManageVenuesPage from './pages/admin/ManageVenuesPage';
import ManageSchedulesPage from './pages/admin/ManageSchedulesPage'; // For deleting schedules by admin

function App() {
  const { user, isLoading } = useAuth();

  if (isLoading && !user) { // Only show global spinner if initial auth check is happening
      // You might want a more sophisticated loading screen
      return (
        <div className="flex items-center justify-center h-screen bg-slate-100">
          <div className="spinner w-16 h-16"></div> {/* Uses global.css spinner style */}
        </div>
      );
  }


  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<PageLayout><Homepage /></PageLayout>} />
      <Route path="/login" element={<LoginPage />} /> 
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes - common to all authenticated users */}
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Parent Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.PARENT]} />}>
        <Route path="/parent/dashboard" element={<ParentDashboardPage />} />
        <Route path="/parent/children" element={<ViewChildrenPage />} />
        <Route path="/parent/add-child" element={<AddChildPage />} />
        <Route path="/parent/schedule-vaccination" element={<ScheduleVaccinationPage />} />
        <Route path="/parent/vaccinations" element={<ViewParentSchedulesPage />} />
      </Route>

      {/* Doctor Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.DOCTOR]} />}>
        <Route path="/doctor/dashboard" element={<DoctorDashboardPage />} />
        <Route path="/doctor/schedules" element={<ViewDoctorSchedulesPage />} />
      </Route>

      {/* Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/review-schedules" element={<ReviewSchedulesPage />} />
        <Route path="/admin/manage-users" element={<ManageUsersPage />} />
        <Route path="/admin/create-doctor" element={<CreateDoctorPage />} />
        <Route path="/admin/manage-vaccines" element={<ManageVaccinesPage />} />
        <Route path="/admin/manage-regions" element={<ManageRegionsPage />} />
        <Route path="/admin/manage-venues" element={<ManageVenuesPage />} />
        <Route path="/admin/manage-schedules" element={<ManageSchedulesPage />} />
        {/* Redirect admin from base /admin to /admin/dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
      
      {/* Redirect authenticated users from login/register */}
       <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
       <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />

      {/* Fallback for Not Found */}
      <Route path="*" element={<PageLayout><NotFoundPage /></PageLayout>} />
    </Routes>
  );
}

export default App;