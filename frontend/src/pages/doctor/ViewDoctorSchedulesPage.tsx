import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import type { IDoctorSchedule } from '../../types';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage, formatDate, capitalize, getAge } from '../../lib/utils';
import { CalendarCheck, AlertTriangle, ListFilter, CheckSquare, Info, ShieldQuestion, CheckCircle2, XCircle, RotateCcw, Syringe, Building } from 'lucide-react';
import { VACCINATION_STATUSES } from '../../constants';
import { Select } from '../../components/ui/Select';
import { Input } from '../../components/ui/Input';


// Status badge styling (similar to parent's view, can be centralized)
const getStatusBadgeStyle = (status: IDoctorSchedule['status']): string => {
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
        return 'bg-red-100 text-red-800 border border-red-300 line-through opacity-70';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-300';
    }
};

const StatusIcon = ({ status }: { status: IDoctorSchedule['status'] }) => {
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

type FilterStatus = IDoctorSchedule['status'] | 'all_upcoming' | 'all';

const ViewDoctorSchedulesPage: React.FC = () => {
  const [allSchedules, setAllSchedules] = useState<IDoctorSchedule[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<IDoctorSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, { loading: boolean; message?: string; type?: 'success' | 'error' }>>({});
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(VACCINATION_STATUSES.SCHEDULED as FilterStatus); // Default to 'scheduled'
  const [dateFilter, setDateFilter] = useState<string>(formatDate(new Date(), 'yyyy-MM-dd')); // Default to today

  const filterOptions: { value: FilterStatus; label: string }[] = [
    { value: 'all_upcoming', label: 'All Upcoming (Scheduled)' },
    { value: VACCINATION_STATUSES.SCHEDULED as FilterStatus, label: 'Scheduled (for selected date)' },
    { value: VACCINATION_STATUSES.COMPLETED as FilterStatus, label: 'Completed' },
    { value: VACCINATION_STATUSES.MISSED as FilterStatus, label: 'Missed' },
    { value: VACCINATION_STATUSES.CANCELLED as FilterStatus, label: 'Cancelled by Parent' },
    { value: VACCINATION_STATUSES.REJECTED_BY_ADMIN as FilterStatus, label: 'Rejected by Admin'},
    { value: 'all' as FilterStatus, label: 'Show All My Schedules' },
  ];

  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<IDoctorSchedule[]>('/doctor/vaccinations');
      setAllSchedules(response.data.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())); // Sort by date ascending
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  useEffect(() => {
    let currentSchedules = [...allSchedules];
    const selectedDate = new Date(dateFilter);
    selectedDate.setHours(0,0,0,0);

    if (statusFilter === 'all') {
      // No filter, show all
    } else if (statusFilter === 'all_upcoming') {
      currentSchedules = currentSchedules.filter(s => s.status === VACCINATION_STATUSES.SCHEDULED && new Date(s.date) >= new Date());
    } else {
      // Filter by specific status
      currentSchedules = currentSchedules.filter(s => s.status === statusFilter);
      // If the status is 'scheduled', also filter by the selected date
      if (statusFilter === VACCINATION_STATUSES.SCHEDULED) {
          currentSchedules = currentSchedules.filter(s => {
              const scheduleDate = new Date(s.date);
              scheduleDate.setHours(0,0,0,0);
              return scheduleDate.getTime() === selectedDate.getTime();
          });
      }
    }
    setFilteredSchedules(currentSchedules);
  }, [allSchedules, statusFilter, dateFilter]);


  const handleCompleteVaccination = async (scheduleId: string) => {
    setActionStates(prev => ({ ...prev, [scheduleId]: { loading: true } }));
    try {
      await api.put(`/doctor/complete-vaccination/${scheduleId}`); // Backend path matches your provided backend
       setActionStates(prev => ({
        ...prev,
        [scheduleId]: { loading: false, message: `Vaccination marked as completed.`, type: 'success' }
      }));
      // Update local state
      setAllSchedules(prevSchedules =>
        prevSchedules.map(s =>
          s._id === scheduleId ? { ...s, status: VACCINATION_STATUSES.COMPLETED as IDoctorSchedule['status'] } : s
        )
      );
    } catch (err) {
        const errorMessage = getErrorMessage(err);
         setActionStates(prev => ({
            ...prev,
            [scheduleId]: { loading: false, message: `Failed: ${errorMessage}`, type: 'error' }
        }));
    }
  };


  if (isLoading && allSchedules.length === 0) { // Show spinner only on initial load
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
        <div className="flex items-center space-x-3">
            <CalendarCheck className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">My Vaccination Schedules</h1>
        </div>

      {/* Filters */}
      <Card>
        <CardHeader>
            <CardTitle className="text-lg flex items-center"><ListFilter className="w-5 h-5 mr-2" /> Filters</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <Select
                    id="statusFilter"
                    options={filterOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
                />
            </div>
             <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">
                    {statusFilter === VACCINATION_STATUSES.SCHEDULED ? "View Scheduled for Date" : "Select Date (for context)"}
                </label>
                 <Input
                    id="dateFilter"
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                 />
            </div>
        </CardContent>
      </Card>

      {filteredSchedules.length === 0 ? (
         <Card>
            <CardContent className="p-10 text-center">
                <Info className="w-16 h-16 text-slate-400 mx-auto mb-4"/>
                <p className="text-xl font-semibold text-slate-700">No Schedules Found</p>
                <p className="text-slate-500">There are no schedules matching your current filter criteria.</p>
            </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredSchedules.map(schedule => {
             const currentActionState = actionStates[schedule._id];
             const canComplete = schedule.status === VACCINATION_STATUSES.SCHEDULED;

            return (
            <Card key={schedule._id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                    <CardTitle className="text-lg">
                        <Syringe className="w-5 h-5 mr-1.5 inline-block text-cyan-600" />
                        {schedule.vaccine.name} for {schedule.child.name}
                    </CardTitle>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-flex items-center ${getStatusBadgeStyle(schedule.status)}`}>
                        <StatusIcon status={schedule.status} />
                        {capitalize(schedule.status.replace('_', ' '))}
                    </span>
                </div>
                 <CardDescription>Scheduled on: {formatDate(schedule.date, 'PPp')}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-slate-600 space-y-1.5 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
                    <p><strong className="font-medium text-slate-700">Child:</strong> {schedule.child.name} ({getAge(schedule.child.dob)}, {capitalize(schedule.child.gender)})</p>
                    <p><strong className="font-medium text-slate-700">DOB:</strong> {formatDate(schedule.child.dob, 'PPP')}</p>
                    <p><strong className="font-medium text-slate-700">Parent:</strong> {schedule.parent.name} ({schedule.parent.email})</p>
                    <p><strong className="font-medium text-slate-700">Venue:</strong> <Building className="inline w-4 h-4 mr-1"/>{schedule.venue.name} ({schedule.region.name})</p>
                </div>
                {schedule.vaccine.description && <p className="mt-1 italic text-xs">Vaccine note: {schedule.vaccine.description}</p>}
                
                 {currentActionState?.message && (
                    <p className={`mt-2 text-xs ${currentActionState.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {currentActionState.message}
                    </p>
                )}
              </CardContent>
              {canComplete && (
                <CardFooter className="bg-slate-50/50 px-6 py-3">
                    <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleCompleteVaccination(schedule._id)}
                        isLoading={currentActionState?.loading}
                        disabled={currentActionState?.loading || currentActionState?.type === 'success'}
                    >
                        <CheckSquare className="w-4 h-4 mr-1.5" /> Mark as Completed
                    </Button>
                </CardFooter>
              )}
              {(schedule.status === VACCINATION_STATUSES.PENDING_APPROVAL || schedule.status === VACCINATION_STATUSES.REJECTED_BY_ADMIN) && (
                <CardFooter className={`px-6 py-2 text-xs ${schedule.status === VACCINATION_STATUSES.PENDING_APPROVAL ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                  <Info className="w-4 h-4 mr-1.5 flex-shrink-0"/> This schedule is currently <span className="font-semibold">{schedule.status.replace('_',' ')}</span> and cannot be actioned by you yet.
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

export default ViewDoctorSchedulesPage;