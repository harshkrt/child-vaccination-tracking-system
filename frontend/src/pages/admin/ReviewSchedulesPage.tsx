import React, { useEffect, useState } from 'react';
import api from '../../lib/api';
import type { IPendingSchedule } from '../../types'; // Assuming types are defined here
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage, formatDate, capitalize } from '../../lib/utils';
import { AlertTriangle, CheckCircle, FileQuestion, AlertCircle, ShieldAlert, UserCheck, ShieldCheck } from 'lucide-react';
// import { VACCINATION_STATUSES } from '../../constants';


const ReviewSchedulesPage: React.FC = () => {
  const [schedules, setSchedules] = useState<IPendingSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionStates, setActionStates] = useState<Record<string, { loading: boolean; message?: string; type?: 'success' | 'error' }>>({});

  const fetchPendingSchedules = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<IPendingSchedule[]>('/admin/vaccinations/pending');
      setSchedules(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingSchedules();
  }, []);

  const handleReviewAction = async (scheduleId: string, decision: 'approve' | 'reject') => {
    setActionStates(prev => ({ ...prev, [scheduleId]: { loading: true } }));
    try {
      await api.put(`/admin/vaccination/${scheduleId}/review`, { decision });
      setActionStates(prev => ({
        ...prev,
        [scheduleId]: { loading: false, message: `Schedule ${decision === 'approve' ? 'approved' : 'rejected'} successfully.`, type: 'success' }
      }));
      // Refresh list or remove the item locally
      setSchedules(prevSchedules => prevSchedules.filter(s => s._id !== scheduleId));
      if (schedules.length === 1) { // If it was the last one
          fetchPendingSchedules(); // Re-fetch to show "no pending" message or new ones
      }
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setActionStates(prev => ({
        ...prev,
        [scheduleId]: { loading: false, message: `Failed to ${decision} schedule: ${errorMessage}`, type: 'error' }
      }));
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error Fetching Schedules</p>
          <p>{error}</p>
          <Button onClick={fetchPendingSchedules} className="mt-2">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <FileQuestion className="w-8 h-8 text-cyan-600" />
        <h1 className="text-3xl font-bold text-slate-800">Review Vaccination Schedules</h1>
      </div>
      <p className="text-slate-600">
        Review vaccination schedules that are pending approval. Ensure the child's age aligns with the vaccine's recommended age range.
      </p>

      {schedules.length === 0 && !isLoading && (
        <Card>
            <CardContent className="p-10 text-center">
                <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-4"/>
                <p className="text-xl font-semibold text-slate-700">All Clear!</p>
                <p className="text-slate-500">There are no vaccination schedules currently pending approval.</p>
            </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {schedules.map(schedule => {
          const childAge = schedule.childAgeInMonthsAtVaccination;
          const minAge = schedule.vaccine.minAgeInMonths;
          const maxAge = schedule.vaccine.maxAgeInMonths;
          let ageAlert: { type: 'success' | 'warning' | 'error'; message: string } | null = null;

          if (childAge !== null) {
            if (childAge < minAge) {
              ageAlert = { type: 'error', message: `Child (${childAge}mo) is younger than recommended minimum age (${minAge}mo).` };
            } else if (maxAge !== undefined && childAge > maxAge) {
              ageAlert = { type: 'error', message: `Child (${childAge}mo) is older than recommended maximum age (${maxAge}mo).` };
            } else if (maxAge !== undefined && childAge >= minAge && childAge <= maxAge) {
              ageAlert = { type: 'success', message: `Child's age (${childAge}mo) is within recommended range (${minAge}-${maxAge}mo).` };
            } else { // No maxAge defined, and child is >= minAge
              ageAlert = { type: 'success', message: `Child's age (${childAge}mo) meets minimum requirement of ${minAge}mo (no maximum specified).` };
            }
          } else {
            ageAlert = { type: 'warning', message: "Could not calculate child's age at vaccination."}
          }
          
          const currentActionState = actionStates[schedule._id];

          return (
            <Card key={schedule._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center">
                  {schedule.vaccine.name} for {schedule.child.name}
                </CardTitle>
                <CardDescription>Scheduled for: {formatDate(schedule.date, 'PPp')}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 flex-grow">
                {ageAlert && (
                  <div className={`p-2 rounded-md text-xs flex items-start ${
                    ageAlert.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                    ageAlert.type === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                    'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {ageAlert.type === 'error' && <ShieldAlert className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0"/>}
                    {ageAlert.type === 'warning' && <AlertCircle className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0"/>}
                    {ageAlert.type === 'success' && <UserCheck className="w-4 h-4 mr-1.5 mt-0.5 flex-shrink-0"/>}
                    <span>{ageAlert.message}</span>
                  </div>
                )}

                <ul className="text-sm text-slate-600 space-y-1.5">
                  <li><strong>Child DOB:</strong> {formatDate(schedule.child.dob)} ({schedule.child.gender ? capitalize(schedule.child.gender) : 'N/A'})</li>
                  <li><strong>Child Age at Vaccination:</strong> {childAge !== null ? `${childAge} months` : 'N/A'}</li>
                  <li><strong>Vaccine Age Range:</strong> {minAge}mo {maxAge ? `- ${maxAge}mo` : '+'}</li>
                  <li><strong>Parent:</strong> {schedule.parent.name} ({schedule.parent.email})</li>
                  <li><strong>Doctor:</strong> Dr. {schedule.doctor.name}</li>
                  <li><strong>Venue:</strong> {schedule.venue.name} ({schedule.region.name})</li>
                  <li><strong>Status:</strong> <span className="px-2 py-0.5 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">{capitalize(schedule.status.replace('_', ' '))}</span></li>
                </ul>
                 {currentActionState?.message && (
                    <p className={`text-xs ${currentActionState.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                      {currentActionState.message}
                    </p>
                  )}
              </CardContent>
              <CardFooter className="flex justify-end space-x-2 border-t pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleReviewAction(schedule._id, 'reject')}
                  isLoading={currentActionState?.loading && actionStates[schedule._id]?.loading} // ensure correct loading check
                  disabled={currentActionState?.loading || currentActionState?.type === 'success'}
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <AlertTriangle className="w-4 h-4 mr-1.5" /> Reject
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleReviewAction(schedule._id, 'approve')}
                  isLoading={currentActionState?.loading && actionStates[schedule._id]?.loading}
                  disabled={currentActionState?.loading || currentActionState?.type === 'success'}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSchedulesPage;