import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react'; // FormEvent was correctly typed already
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import api from '../../lib/api'; // Corrected path
import type { Child } from '../../types'; // Corrected paths and types
import type { IParentVaccineOption, IParentRegionOption } from '../../types';
import { Button } from '../../components/ui/Button'; // Corrected path
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'; // Corrected path
import { Input } from '../../components/ui/Input'; // Corrected path
import { Label } from '../../components/ui/Label'; // Corrected path
import { Select } from '../../components/ui/Select'; // Corrected path
import { Spinner } from '../../components/ui/Spinner'; // Corrected path
import { getErrorMessage, formatDate } from '../../lib/utils'; // Corrected path
import { CalendarPlus, AlertTriangle, CheckCircle, User, Syringe as VaccineIcon, MapPin } from 'lucide-react';

const ScheduleVaccinationPage: React.FC = () => {
  const [children, setChildren] = useState<Child[]>([]); // Use base Child type
  const [vaccines, setVaccines] = useState<IParentVaccineOption[]>([]);
  const [regions, setRegions] = useState<IParentRegionOption[]>([]);

  const [selectedChild, setSelectedChild] = useState('');
  const [selectedVaccine, setSelectedVaccine] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [scheduleDate, setScheduleDate] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const preselectedChildId = searchParams.get('childId');
    if (preselectedChildId) {
      setSelectedChild(preselectedChildId);
    }

    const fetchData = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        const [childrenRes, vaccinesRes, regionsRes] = await Promise.all([
          api.get<Child[]>('/parent/children'), // API returns array of Child
          api.get<IParentVaccineOption[]>('/vaccines'),
          api.get<IParentRegionOption[]>('/regions'),
        ]);
        setChildren(childrenRes.data);
        setVaccines(vaccinesRes.data);
        setRegions(regionsRes.data);

        if (childrenRes.data.length === 0) {
            setMessage({ type: 'info', text: 'You need to add a child first before scheduling a vaccination.' });
        }

      } catch (err: unknown) {
        setMessage({ type: 'error', text: `Failed to load data: ${getErrorMessage(err)}` });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    if (!selectedChild || !selectedVaccine || !selectedRegion || !scheduleDate) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      setIsSubmitting(false);
      return;
    }
     // Date validation: Ensure scheduleDate is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Remove time part for comparison
    const chosenDate = new Date(scheduleDate);

    if (chosenDate < today) {
        setMessage({ type: 'error', text: 'Cannot schedule a vaccination in the past.' });
        setIsSubmitting(false);
        return;
    }

    try {
      await api.post('/parent/schedule', {
        child: selectedChild,
        vaccine: selectedVaccine,
        region: selectedRegion,
        date: scheduleDate,
      });
      setMessage({ type: 'success', text: 'Vaccination scheduled successfully! It is now pending admin approval.' });
      setTimeout(() => {
        navigate('/parent/vaccinations');
      }, 2500);
    } catch (err: unknown) { // Use unknown for error type
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center space-x-3">
            <CalendarPlus className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">Schedule Vaccination</h1>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Vaccination Details</CardTitle>
          <CardDescription>Select child, vaccine, region, and date for the vaccination.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
             <div className={`mb-4 p-3 rounded-md flex items-center text-sm ${
                message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' :
                message.type === 'error' ? 'bg-red-100 border border-red-400 text-red-700' :
                'bg-blue-100 border border-blue-400 text-blue-700' // for info
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : 
               message.type === 'error' ? <AlertTriangle className="w-5 h-5 mr-2" /> :
               <AlertTriangle className="w-5 h-5 mr-2" /> 
              }
              {message.text}
            </div>
          )}

          {children.length === 0 && !isLoading ? (
            <div className="text-center p-4">
              <p className="text-slate-600">You need to add a child first.</p>
              <Link to="/parent/add-child">
                <Button className="mt-2">Add Child</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="child"><User className="inline w-4 h-4 mr-1" /> Select Child</Label>
                <Select
                  id="child"
                  options={children.map(c => ({ value: c._id, label: c.name }))}
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  placeholder="-- Select a Child --"
                  required
                  disabled={children.length === 0}
                />
              </div>

              <div>
                <Label htmlFor="vaccine"><VaccineIcon className="inline w-4 h-4 mr-1" /> Select Vaccine</Label>
                <Select
                  id="vaccine"
                  options={vaccines.map(v => ({ value: v._id, label: v.name }))}
                  value={selectedVaccine}
                  onChange={(e) => setSelectedVaccine(e.target.value)}
                  placeholder="-- Select a Vaccine --"
                  required
                  disabled={vaccines.length === 0 || isLoading}
                />
                 {vaccines.length === 0 && !isLoading && <p className="text-xs text-red-500 mt-1">No vaccines available. Admin may need to add them.</p>}
              </div>

              <div>
                <Label htmlFor="region"><MapPin className="inline w-4 h-4 mr-1" /> Select Region</Label>
                <Select
                  id="region"
                  options={regions.map(r => ({ value: r._id, label: r.name }))}
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  placeholder="-- Select a Region --"
                  required
                  disabled={regions.length === 0 || isLoading}
                />
                {regions.length === 0 && !isLoading && <p className="text-xs text-red-500 mt-1">No regions available. Admin may need to add them.</p>}
              </div>

              <div>
                <Label htmlFor="date"><CalendarPlus className="inline w-4 h-4 mr-1" /> Select Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  required
                  min={formatDate(new Date().toString(), 'yyyy-MM-dd')} 
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isSubmitting} disabled={isSubmitting || children.length === 0 || isLoading}>
                <CalendarPlus className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Scheduling...' : 'Schedule Vaccination'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleVaccinationPage;