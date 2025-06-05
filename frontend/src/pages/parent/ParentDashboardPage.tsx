import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';
import type { IParentDashboardStats } from '../../types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
// Added ShieldQuestion for pending icon
import { Users, PlusCircle, CalendarDays, ListChecks, LayoutDashboard, ShieldQuestion } from 'lucide-react';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../lib/utils';

const ParentDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [dashboardStats, setDashboardStats] = useState<IParentDashboardStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  const fetchParentDashboardStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);
    try {
      const response = await api.get<IParentDashboardStats>('/parent/dashboard-stats');
      setDashboardStats(response.data);
    } catch (err) {
      setStatsError(getErrorMessage(err));
      console.error("Failed to fetch parent dashboard stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchParentDashboardStats();
  }, [fetchParentDashboardStats]);

  const getStatValue = (key: keyof IParentDashboardStats): string | React.ReactElement => {
    if (isLoadingStats) return <Spinner size="sm" className="h-5 w-5 inline-block" />;
    if (statsError || !dashboardStats) return "N/A";
    const value = dashboardStats[key];
    return value !== undefined ? value.toString() : "0";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <LayoutDashboard className="w-8 h-8 text-cyan-600" />
        <h1 className="text-3xl font-bold text-slate-800">Parent Dashboard</h1>
      </div>
      <p className="text-slate-600 text-lg">
        Welcome back, <span className="font-semibold">{user?.name || "Parent"}!</span> Manage your children's vaccinations and schedules here.
      </p>

      {statsError && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md my-4" role="alert">
            {/* ... error display ... */}
        </div>
      )}

      {/* Adjusted grid to potentially accommodate 4 cards or to wrap nicely */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"> 
        {/* Quick Actions Card - occupies more space if lg:grid-cols-4 used or stack appropriately */}
        <Card className="hover:shadow-lg transition-shadow md:col-span-1 lg:col-span-1"> {/* Spanning if fewer items overall */}
          <CardHeader>
            <CardTitle className="flex items-center"><PlusCircle className="w-5 h-5 mr-2 text-cyan-600" /> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link to="/parent/add-child">
              <Button variant="outline" className="w-full justify-start text-left">
                <Users className="w-4 h-4 mr-2" /> Add New Child
              </Button>
            </Link>
            <Link to="/parent/schedule-vaccination">
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarDays className="w-4 h-4 mr-2" /> Schedule Vaccination
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* My Children Summary */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><Users className="w-5 h-5 mr-2 text-purple-600" /> My Children</CardTitle>
            <CardDescription>View and manage your children's profiles.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-purple-600">{getStatValue('childrenCount')}</p> 
            <p className="text-slate-500">Registered Children</p>
            <Link to="/parent/children" className="mt-3 inline-block">
                <Button size="sm" className="bg-purple-600 hover:bg-purple-700">View Children</Button>
            </Link>
          </CardContent>
        </Card>

        {/* Upcoming Vaccinations */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center"><ListChecks className="w-5 h-5 mr-2 text-teal-600"/> Upcoming Vaccinations</CardTitle>
            <CardDescription>Admin-approved & scheduled appointments.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-teal-600">{getStatValue('upcomingVaccinations')}</p>
            <p className="text-slate-500">Upcoming Approved Schedules</p>
             <Link to="/parent/vaccinations?filter=scheduled" className="mt-3 inline-block">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">View Approved</Button>
            </Link>
          </CardContent>
        </Card>

        {/* *** NEW CARD for Pending Approval *** */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <ShieldQuestion className="w-5 h-5 mr-2 text-yellow-600" /> Pending Approval
            </CardTitle>
            <CardDescription>Schedules awaiting admin review.</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-3xl font-bold text-yellow-600">{getStatValue('pendingApproval')}</p>
            <p className="text-slate-500">Schedules Pending</p>
            <Link to="/parent/vaccinations?filter=pending_approval" className="mt-3 inline-block">
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">View Pending</Button>
            </Link>
          </CardContent>
        </Card>

      </div>

      <div className="mt-8">
         {/* ... Notifications card ... */}
      </div>
    </div>
  );
};

export default ParentDashboardPage;