import React, { useEffect, useState, useCallback } from 'react'; // Added useState, useEffect, useCallback
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api'; // For fetching stats
import type { IDoctorDashboardStats } from '../../types'; // Import the new type
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { CalendarDays, CheckCircle, LayoutDashboard, List, RotateCcw, AlertTriangle } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner'; // For loading state
import { getErrorMessage } from '../../lib/utils'; // For error messages

const DoctorDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<IDoctorDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchDoctorDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const response = await api.get<IDoctorDashboardStats>('/doctor/dashboard-stats');
      setDashboardStats(response.data);
    } catch (err) {
      setStatsError(getErrorMessage(err));
      console.error("Failed to fetch doctor dashboard stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctorDashboardStats();
  }, [fetchDoctorDashboardStats]);

const getStatValue = (key: keyof IDoctorDashboardStats): string | React.ReactElement => {
    if (isLoadingStats) return <Spinner size="sm" className="h-5 w-5 inline-block" />;
    if (statsError || !dashboardStats) return "N/A"; // Return string for N/A
    const value = dashboardStats[key];
    return value !== undefined ? value.toString() : "0"; // Ensure value exists before toString
  };   


  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <LayoutDashboard className="w-8 h-8 text-cyan-600" />
        <h1 className="text-3xl font-bold text-slate-800">Doctor Dashboard</h1>
      </div>
      <p className="text-slate-600 text-lg">
        Welcome, <span className="font-semibold">{user?.name || "Doctor"}!</span> Manage your vaccination appointments.
      </p>

      {statsError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error Fetching Dashboard Data</p>
            <p>{statsError}</p>
            <Button onClick={fetchDoctorDashboardStats} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
                <RotateCcw className="w-4 h-4 mr-2"/> Retry
            </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><CalendarDays className="w-5 h-5 mr-2 text-blue-600" /> Today's Appointments</CardTitle>
            <CardDescription>Vaccinations scheduled for today.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-blue-600">{getStatValue('todaysAppointments')}</p>
            <p className="text-slate-500">Appointments Today</p>
            <Link to="/doctor/schedules?filter=today" className="mt-3 inline-block">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">View Today's List</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Vaccinations This Week */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><CheckCircle className="w-5 h-5 mr-2 text-green-600" /> Vaccinations This Week</CardTitle>
            <CardDescription>Overview of vaccinations completed this week.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-green-600">{getStatValue('completedThisWeek')}</p>
            <p className="text-slate-500">Completed This Week</p>
            <Link to="/doctor/schedules?filter=completed_this_week" className="mt-3 inline-block">
                <Button size="sm" className="bg-green-600 hover:bg-green-700">View History</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

       <div className="mt-6">
         <Link to="/doctor/schedules">
          <Button variant="default" size="lg" className="flex items-center">
             <List className="w-5 h-5 mr-2" />
            View All Vaccination Schedules
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default DoctorDashboardPage;