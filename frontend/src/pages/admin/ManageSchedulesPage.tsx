import React, { useEffect, useState, useCallback } from 'react';
import api from '../../lib/api';
import type { IAdminFullScheduleView } from '../../types'; // Ensure this type expects populated fields
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage, formatDate, capitalize } from '../../lib/utils';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/AlertDialog";
import { Trash2, CalendarX, AlertTriangle, Info, RotateCcw } from 'lucide-react';
import { VACCINATION_STATUSES } from '../../constants';
import { Select } from '../../components/ui/Select';
import { Label } from '../../components/ui/Label';

const DELETABLE_STATUSES: IAdminFullScheduleView['status'][] = [
    VACCINATION_STATUSES.COMPLETED as IAdminFullScheduleView['status'],
    VACCINATION_STATUSES.CANCELLED as IAdminFullScheduleView['status'],
    VACCINATION_STATUSES.MISSED as IAdminFullScheduleView['status'],
    VACCINATION_STATUSES.REJECTED_BY_ADMIN as IAdminFullScheduleView['status']
];

type FilterStatusOption = IAdminFullScheduleView['status'] | 'all' | 'all_deletable';

const statusFilterOptions: {value: FilterStatusOption, label: string}[] = [
    { value: 'all', label: 'Show All Schedules' },
    { value: 'all_deletable', label: 'All Deletable Statuses' },
    { value: VACCINATION_STATUSES.COMPLETED as FilterStatusOption, label: 'Completed' },
    { value: VACCINATION_STATUSES.CANCELLED as FilterStatusOption, label: 'Cancelled by Parent' },
    { value: VACCINATION_STATUSES.MISSED as FilterStatusOption, label: 'Missed by Parent/System' },
    { value: VACCINATION_STATUSES.REJECTED_BY_ADMIN as FilterStatusOption, label: 'Rejected by Admin' },
    { value: VACCINATION_STATUSES.SCHEDULED as FilterStatusOption, label: 'Scheduled (Approved)' },
    { value: VACCINATION_STATUSES.PENDING_APPROVAL as FilterStatusOption, label: 'Pending Admin Approval' },
];


const ManageSchedulesPage: React.FC = () => {
  const [allSchedules, setAllSchedules] = useState<IAdminFullScheduleView[]>([]);
  const [filteredSchedules, setFilteredSchedules] = useState<IAdminFullScheduleView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [statusFilter, setStatusFilter] = useState<FilterStatusOption>('all_deletable');


  const fetchSchedules = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionMessage(null);
    try {
      // IMPORTANT: Ensure '/admin/vaccinations/all-details' endpoint returns fully populated objects
      // for child, vaccine, parent, doctor (with at least _id and name).
      const response = await api.get<IAdminFullScheduleView[]>('/admin/vaccinations/all-details');
      setAllSchedules(response.data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()));
    } catch (err) {
      setError(getErrorMessage(err));
      console.error("Error fetching schedules:", err); // Log the actual error
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);
  
  useEffect(() => {
    let currentSchedules = [...allSchedules];
    if (statusFilter === 'all') {
      // no status filter
    } else if (statusFilter === 'all_deletable') {
      currentSchedules = currentSchedules.filter(s => DELETABLE_STATUSES.includes(s.status));
    } else {
      currentSchedules = currentSchedules.filter(s => s.status === statusFilter);
    }
    setFilteredSchedules(currentSchedules);
  }, [allSchedules, statusFilter]);


  const handleDeleteSchedule = async (scheduleId: string, scheduleIdentifier: string) => {
    setActionMessage(null);
    const scheduleToDelete = allSchedules.find(s => s._id === scheduleId);
    if (!scheduleToDelete) return;

    if (!DELETABLE_STATUSES.includes(scheduleToDelete.status)) {
        setActionMessage({type: 'error', text: `Schedule cannot be deleted. Status is "${capitalize(scheduleToDelete.status)}". Only completed, cancelled, missed, or rejected schedules can be deleted.`});
        return;
    }

    try {
      await api.delete(`/admin/vaccination/${scheduleId}`); 
      setActionMessage({type: 'success', text: `Schedule for "${scheduleIdentifier}" deleted successfully.`});
      setAllSchedules(prev => prev.filter(s => s._id !== scheduleId));
    } catch (err) {
      setActionMessage({type: 'error', text: getErrorMessage(err)});
    }
  };


  if (isLoading && allSchedules.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center space-x-3">
            <CalendarX className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">Manage & Delete Schedules</h1>
        </div>
        <CardDescription>
            View all vaccination schedules and delete entries that are completed, cancelled, missed, or rejected by admin to maintain system cleanliness.
        </CardDescription>

      {error && (
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error</p>
            <p>{error}</p>
            <Button onClick={fetchSchedules} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
                <RotateCcw className="w-4 h-4 mr-2"/> Retry
            </Button>
        </div>
      )}
      {actionMessage && (
        <div className={`p-3 rounded-md text-sm mb-4 ${actionMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {actionMessage.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Schedules</CardTitle>
           <div className="pt-4">
             <Label htmlFor="statusFilter" className="sr-only">Filter by status</Label>
             <Select
                id="statusFilter"
                options={statusFilterOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as FilterStatusOption)}
                className="max-w-sm"
             />
          </div>
        </CardHeader>
        <CardContent>
          {filteredSchedules.length === 0 && !isLoading ? (
            <div className="text-center py-10">
                <Info className="w-16 h-16 text-slate-400 mx-auto mb-4"/>
                <p className="text-xl text-slate-600">No schedules found matching your criteria.</p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Child</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Vaccine</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Parent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doctor</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredSchedules.map(schedule => {
                    const isDeletable = DELETABLE_STATUSES.includes(schedule.status);
                    
                    // Defensive access to nested properties
                    const childName = schedule.child?.name || 'N/A (Child Missing)';
                    const vaccineName = schedule.vaccine?.name || 'N/A (Vaccine Missing)';
                    const parentName = schedule.parent?.name || 'N/A (Parent Missing)';
                    const doctorName = schedule.doctor?.name ? `Dr. ${schedule.doctor.name}` : 'N/A (Doctor Missing)';

                    const scheduleIdentifier = `${vaccineName} for ${childName} on ${formatDate(schedule.date, 'P')}`;
                    
                    return (
                    <tr key={schedule._id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-slate-700">{childName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{vaccineName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{formatDate(schedule.date, 'PP')}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                             schedule.status === VACCINATION_STATUSES.COMPLETED ? 'bg-green-100 text-green-700' :
                             schedule.status === VACCINATION_STATUSES.CANCELLED ? 'bg-slate-200 text-slate-600' :
                             schedule.status === VACCINATION_STATUSES.MISSED ? 'bg-orange-100 text-orange-700' :
                             schedule.status === VACCINATION_STATUSES.REJECTED_BY_ADMIN ? 'bg-red-100 text-red-600' :
                             schedule.status === VACCINATION_STATUSES.SCHEDULED ? 'bg-blue-100 text-blue-700' :
                             schedule.status === VACCINATION_STATUSES.PENDING_APPROVAL ? 'bg-yellow-100 text-yellow-700' :
                             'bg-gray-100 text-gray-700'
                        }`}>
                          {capitalize(schedule.status.replace('_', ' '))}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{parentName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500">{doctorName}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        {isDeletable ? (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="destructive" size="sm" title="Delete Schedule">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the schedule: <br/>
                                  <strong>{scheduleIdentifier}</strong>? <br/>
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteSchedule(schedule._id, scheduleIdentifier)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete Schedule
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        ) : (
                           <Button variant="ghost" size="sm" disabled title="Not deletable based on status">
                                <Trash2 className="w-4 h-4 text-slate-300" />
                            </Button>
                        )}
                      </td>
                    </tr>
                    );
                })}
                </tbody>
              </table>
          </div>
          )}
        </CardContent>
         {filteredSchedules.length > 0 && <CardFooter className="text-sm text-slate-500">
                Showing {filteredSchedules.length} of {allSchedules.length} total schedules.
         </CardFooter>}
      </Card>
    </div>
  );
};

export default ManageSchedulesPage;