import React, { useEffect, useState, useCallback } from 'react'; // Added useState, useEffect, useCallback
import type { JSX } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api'; // For fetching stats
import type { IAdminDashboardStats } from '../../types'; // Import the new type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Users, Stethoscope, Syringe, BarChart3, Home, Trash2, FileQuestion, LayoutDashboard, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner'; // For loading state
import { getErrorMessage } from '../../lib/utils'; // For error messages

// Initial structure for stats, will be updated with fetched data
const initialStatsDisplayConfig = [
  { key: 'pendingSchedules', title: 'Pending Schedules', icon: FileQuestion, color: 'text-amber-600', link: '/admin/review-schedules' },
  { key: 'totalUsers', title: 'Total Users', icon: Users, color: 'text-blue-600', link: '/admin/manage-users' },
  { key: 'totalDoctors', title: 'Total Doctors', icon: Stethoscope, color: 'text-green-600', link: '/admin/manage-users?role=doctor' },
  { key: 'totalVaccines', title: 'Total Vaccines', icon: Syringe, color: 'text-red-600', link: '/admin/manage-vaccines' },
  { key: 'totalRegions', title: 'Regions', icon: BarChart3, color: 'text-purple-600', link: '/admin/manage-regions' },
  { key: 'totalVenues', title: 'Venues', icon: Home, color: 'text-indigo-600', link: '/admin/manage-venues' },
];


const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<IAdminDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const response = await api.get<IAdminDashboardStats>('/admin/dashboard-stats');
      setDashboardStats(response.data);
    } catch (err) {
      setStatsError(getErrorMessage(err));
      console.error("Failed to fetch dashboard stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  // Helper to get stat value or show spinner/error
  const getStatValue = (key: keyof IAdminDashboardStats): string | JSX.Element => {
    if (isLoadingStats) return <Spinner size="sm" className="h-5 w-5 inline-block" />;
    if (statsError || !dashboardStats) return "N/A";
    return dashboardStats[key]?.toString() ?? "0";
  };
  
  const getPendingSchedulesValue = (): string => {
     if (isLoadingStats || !dashboardStats) return "...";
     return dashboardStats.pendingSchedules?.toString() ?? "0";
  }

  return (
    <div className="p-6 space-y-6">
        <div className="flex items-center space-x-3">
            <LayoutDashboard className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        </div>
        <p className="text-slate-600 text-lg">
            Welcome, <span className="font-semibold">{user?.name || "Admin"}!</span> Overview of the VaxTracker system.
        </p>

      {statsError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error Fetching Stats</p>
            <p>{statsError}</p>
            <Button onClick={fetchDashboardStats} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
                <RotateCcw className="w-4 h-4 mr-2"/> Retry
            </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {initialStatsDisplayConfig.map((statConfig) => (
          <Link to={statConfig.link} key={statConfig.title}>
            <Card className="hover:shadow-xl transition-shadow duration-300 ease-in-out transform hover:-translate-y-1">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{statConfig.title}</CardTitle>
                <statConfig.icon className={`w-6 h-6 ${statConfig.color}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${statConfig.color}`}>{getStatValue(statConfig.key as keyof IAdminDashboardStats)}</div>
                <p className="text-xs text-slate-500">Click to manage</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><FileQuestion className="w-5 h-5 mr-2 text-cyan-600"/> Quick Access: Approvals</CardTitle>
            <CardDescription>Manage pending vaccination schedule approvals.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/review-schedules">
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700">
                Review Schedules
              </Button>
            </Link>
            <p className="text-xs text-slate-500 mt-2 text-center">
                There are <span className="font-bold text-amber-600">{getPendingSchedulesValue()}</span> schedules awaiting review.
            </p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center"><Trash2 className="w-5 h-5 mr-2 text-red-600" /> Quick Access: Data Cleanup</CardTitle>
            <CardDescription>Manage old or invalid vaccination schedules.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin/manage-schedules">
              <Button variant="destructive" className="w-full">
                Delete Schedules
              </Button>
            </Link>
             <p className="text-xs text-slate-500 mt-2 text-center">Cleanup completed, missed, or rejected entries.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;