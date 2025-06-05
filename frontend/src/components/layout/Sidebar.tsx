import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants';
import { LogOut, UserCircle, LayoutDashboard, PlusCircle, List, Users, Stethoscope, Syringe, CalendarPlus, Home, FileQuestion, Trash2, CheckSquare, BarChart } from 'lucide-react';
import { Button } from '../ui/Button';

interface NavItemProps {
  to: string;
  icon: React.ElementType;
  label: string;
  exact?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, exact = false }) => (
  <NavLink
    to={to}
    end={exact} // NavLink `end` prop for exact match on parent routes if needed
    className={({ isActive }) =>
      `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
      ${isActive
        ? 'bg-cyan-700 text-white shadow-md'
        : 'text-cyan-100 hover:bg-cyan-600 hover:text-white'
      }`
    }
  >
    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
    <span className="truncate">{label}</span>
  </NavLink>
);

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    // Consider calling an API endpoint for logout if available
    // await api.post('/auth/logout');
    logout();
    navigate('/login');
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-cyan-800 text-white flex flex-col shadow-2xl z-30">
      {/* Logo/Header */}
      <div className="flex items-center justify-center h-20 border-b border-cyan-700/50">
        <Link to="/" className="text-2xl font-bold text-white flex items-center">
          <Syringe className="w-8 h-8 mr-2 text-cyan-300" />
          VaxTracker
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem to="/" icon={Home} label="Homepage" exact />
        
        {user && <NavItem to="/profile" icon={UserCircle} label="My Profile" />}

        {user?.role === ROLES.PARENT && (
          <>
            <p className="px-3 pt-4 pb-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Parent Menu</p>
            <NavItem to="/parent/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/parent/children" icon={Users} label="My Children" />
            <NavItem to="/parent/add-child" icon={PlusCircle} label="Add Child" />
            <NavItem to="/parent/schedule-vaccination" icon={CalendarPlus} label="Schedule Vaccination" />
            <NavItem to="/parent/vaccinations" icon={List} label="View Schedules" />
          </>
        )}

        {user?.role === ROLES.DOCTOR && (
          <>
            <p className="px-3 pt-4 pb-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Doctor Menu</p>
            <NavItem to="/doctor/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/doctor/schedules" icon={List} label="Vaccination Schedules" />
          </>
        )}

        {user?.role === ROLES.ADMIN && (
          <>
            <p className="px-3 pt-4 pb-1 text-xs font-semibold text-cyan-400 uppercase tracking-wider">Admin Menu</p>
            <NavItem to="/admin/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem to="/admin/review-schedules" icon={FileQuestion} label="Review Schedules" />
            <NavItem to="/admin/manage-users" icon={Users} label="Manage Users" />
            <NavItem to="/admin/create-doctor" icon={Stethoscope} label="Create Doctor" />
            <NavItem to="/admin/manage-vaccines" icon={Syringe} label="Manage Vaccines" />
            <NavItem to="/admin/manage-regions" icon={BarChart} label="Manage Regions" />
            <NavItem to="/admin/manage-venues" icon={CheckSquare} label="Manage Venues" />
            <NavItem to="/admin/manage-schedules" icon={Trash2} label="Delete Schedules" />
          </>
        )}
      </nav>

      {/* Footer/User Info */}
      <div className="p-4 border-t border-cyan-700/50">
        {user ? (
          <div className="flex flex-col items-center">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full flex items-center justify-start text-cyan-100 hover:bg-cyan-700 hover:text-white"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
             <NavItem to="/login" icon={LogOut} label="Login" />
             <NavItem to="/register" icon={UserCircle} label="Register" />
          </div>
        )}
      </div>
    </div>
  );
};

export { Sidebar };