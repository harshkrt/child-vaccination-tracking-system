// src/pages/parent/ViewParentSchedulesPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api'; // Using alias
import type { IParentSchedule } from '../../types'; // Using alias
import { Button } from '../../components/ui/Button'; // Using alias
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card'; // Using alias
import { Spinner } from '../../components/ui/Spinner'; // Using alias
import { Link } from 'react-router-dom';
import { getErrorMessage, formatDate, capitalize } from '../../lib/utils'; // Using alias
import { CalendarCheck, AlertTriangle, ListChecks, Trash2, PlusCircle, Info, ShieldQuestion, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { VACCINATION_STATUSES } from '../../constants'; // Using alias

// Helper to get Tailwind classes for status badges
const getStatusBadgeStyle = (status: IParentSchedule['status']): string => {
    switch (status) {
      case VACCINATION_STATUSES.PENDING_APPROVAL:
        return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
      case VACCINATION_STATUSES.SCHEDULED:
        return 'bg-blue-100 text-blue-800 border border-blue-300';
      case VACCINATION_STATUSES.COMPLETED:
        return 'bg-green-100 text-green-800 border border-green-300';
      case VACCINATION_STATUSES.CANCELLED:
        return 'bg-slate-100 text-slate-700 border border-slate-300 line-through';
      case VACCINATION_STATUSES.MISSED:
        return 'bg-orange-100 text-orange-800 border border-orange-300';
      case VACCINATION_STATUSES.REJECTED_BY_ADMIN:
        return 'bg-red-100 text-red-800 border border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
};

const StatusIcon = ({ status }: { status: IParentSchedule['status'] }) => {
    switch (status) {
        case VACCINATION_STATUSES.PENDING_APPROVAL: return <ShieldQuestion className="w-4 h-4 mr-1.5 text-yellow-600" />;
        case VACCINATION_STATUSES.SCHEDULED: return <CalendarCheck className="w-4 h-4 mr-1.5 text-blue-600" />;
        case VACCINATION_STATUSES.COMPLETED: return <CheckCircle2 className="w-4 h-4 mr-1.5 text-green-600" />;
        case VACCINATION_STATUSES.CANCELLED: return <XCircle className="w-4 h-4 mr-1.5 text-slate-500" />;
        case VACCINATION_STATUSES.MISSED: return <AlertTriangle className="w-4 h-4 mr-1.5 text-orange-600" />;
        case VACCINATION_STATUSES.REJECTED_BY_ADMIN: return <XCircle className="w-4 h-4 mr-1.5 text-red-600" />;
        default: return <Info className="w-4 h-4 mr-1.5 text-gray-600" />;
    }
}

const ViewParentSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<IParentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, { loading: boolean; message?: string; type?: 'success' | 'error' }>>({});


  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<IParentSchedule[]>('/parent/vaccination');
      // console.log('Fetched schedules raw:', response.data); // For debugging
      setSchedules(response.data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleCancelVaccination = async (scheduleId: string) => {
     setActionStates(prev => ({ ...prev, [scheduleId]: { loading: true } }));
    try {
      await api.delete(`/parent/cancel-vaccination/${scheduleId}`);
      setActionStates(prev => ({
        ...prev,
        [scheduleId]: { loading: false, message: `Schedule cancelled successfully.`, type: 'success' }
      }));
      setSchedules(prevSchedules =>
        prevSchedules.map(s =>
          s._id === scheduleId ? { ...s, status: VACCINATION_STATUSES.CANCELLED as IParentSchedule['status'] } : s
        )
      );
    } catch (err: unknown) {
        const errorMessage = getErrorMessage(err);
         setActionStates(prev => ({
            ...prev,
            [scheduleId]: { loading: false, message: `Failed to cancel schedule: ${errorMessage}`, type: 'error' }
        }));
    }
  };


  if (isLoading && schedules.length === 0) { // Show loader only if schedules are not yet loaded at all
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
     return (
       <div className="p-6 text-center">
         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative flex flex-col items-center" role="alert">
            <AlertTriangle className="w-12 h-12 mb-2 text-red-500" />
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">{error}</span>
            <Button onClick={fetchSchedules} className="mt-3"><RotateCcw className="w-4 h-4 mr-2" /> Retry</Button>
          </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
            <ListChecks className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">My Vaccination Schedules</h1>
        </div>
        <Link to="/parent/schedule-vaccination">
            <Button size="lg">
                <PlusCircle className="w-5 h-5 mr-2" /> Schedule New
            </Button>
        </Link>
      </div>

      {schedules.length === 0 && !isLoading ? ( // Show "No Schedules" only if not loading and schedules array is empty
        <Card>
            <CardContent className="p-10 text-center">
                <CalendarCheck className="w-16 h-16 text-slate-400 mx-auto mb-4"/>
                <p className="text-xl font-semibold text-slate-700">No Schedules Found</p>
                <p className="text-slate-500">You haven't scheduled any vaccinations yet.</p>
                <Link to="/parent/schedule-vaccination" className="mt-4 inline-block">
                    <Button>Schedule a Vaccination</Button>
                </Link>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schedules.map(schedule => {
            const currentActionState = actionStates[schedule._id];
            const canCancel = [VACCINATION_STATUSES.SCHEDULED, VACCINATION_STATUSES.PENDING_APPROVAL].includes(schedule.status);
            
            return (
            <Card key={schedule._id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-800">
                        {schedule.vaccine?.name || 'N/A Vaccine'} for {schedule.child?.name || 'N/A Child'}
                    </CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusBadgeStyle(schedule.status)}`}>
                        <StatusIcon status={schedule.status} />
                        {capitalize(schedule.status?.replace('_', ' ') || 'Unknown Status')}
                    </span>
                </div>
                 <CardDescription>Scheduled on: {schedule.date ? formatDate(schedule.date, 'PPp') : 'N/A Date'}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1.5 pt-0"> {/* Increased spacing slightly */}
                <p><strong>Doctor:</strong> {schedule.doctor?.name || 'N/A Doctor'}</p>
                <p><strong>Venue:</strong> {schedule.venue?.name || 'N/A Venue'} ({schedule.region?.name || 'N/A Region'})</p>
                <p><strong>Child's DOB:</strong> {schedule.child?.dob ? formatDate(schedule.child.dob, 'PPP') : 'N/A DOB'}</p>
                
                {currentActionState?.message && (
                    <p className={`mt-2 text-xs font-medium ${currentActionState.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {currentActionState.message}
                    </p>
                )}
              </CardContent>
              {canCancel && (
                <CardFooter className="bg-slate-50/50 px-6 py-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 focus:ring-red-400"
                        onClick={() => handleCancelVaccination(schedule._id)}
                        isLoading={currentActionState?.loading}
                        disabled={currentActionState?.loading || !!currentActionState?.type} // Disable if loading or action already processed
                    >
                        <Trash2 className="w-4 h-4 mr-1.5" /> Cancel Schedule
                    </Button>
                </CardFooter>
              )}
               {schedule.status === VACCINATION_STATUSES.REJECTED_BY_ADMIN && (
                  <CardFooter className="bg-red-50/30 px-6 py-3 text-xs text-red-700 flex items-start"> {/* Ensure text is readable */}
                    <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0 text-red-600"/> {/* Increased icon size slightly */}
                    <span>This schedule was rejected by the admin. Please check child's age and vaccine criteria before rescheduling.</span>
                  </CardFooter>
                )}
            </Card>
          );
        })}
        </div>
      )}
    </div>
  );
};

export default ViewParentSchedulesPage;