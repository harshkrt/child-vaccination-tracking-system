import React, { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import api from '../../lib/api'; // Using alias
import type { IRegionAdminView, DoctorOption, VenueOption, FullUserType } from '../../types'; // Using alias, added FullUserType
import { Button } from '../../components/ui/Button'; // Using alias
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card'; // Using alias
import { Input } from '../../components/ui/Input'; // Using alias
import { Label } from '../../components/ui/Label'; // Using alias
import { Select } from '../../components/ui/Select'; // Using alias
import { Spinner } from '../../components/ui/Spinner'; // Using alias
import { getErrorMessage } from '../../lib/utils'; // Using alias
import { MapPin, PlusCircle, Trash2, Edit3, AlertTriangle, XCircle, RotateCcw, User as DoctorIcon, Building } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/AlertDialog";


const ManageRegionsPage: React.FC = () => {
  const [regions, setRegions] = useState<IRegionAdminView[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]); // DoctorOption: {_id, name}
  const [venues, setVenues] = useState<VenueOption[]>([]);   // VenueOption: {_id, name}
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFormData, setIsLoadingFormData] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [listMessage, setListMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<IRegionAdminView | null>(null);
  const [regionName, setRegionName] = useState('');
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedVenueId, setSelectedVenueId] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  const fetchRegions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setListMessage(null);
    try {
      // IMPORTANT: Ensure backend route GET /admin/regions exists and populates doctor & venue names
      const response = await api.get<IRegionAdminView[]>('/admin/regions'); 
      if (Array.isArray(response.data)) {
        setRegions(
          response.data.sort((a, b) => {
            const nameA = a.name || ""; 
            const nameB = b.name || ""; 
            return nameA.localeCompare(nameB);
          })
        );
      } else {
        console.error("API response for /admin/regions is not an array:", response.data);
        setRegions([]); 
        setError("Received invalid data format for regions.");
      }
    } catch (err: unknown) {
      setError(`Failed to fetch regions. Admin may need to create the GET /admin/regions endpoint. Error: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFormDropdownData = useCallback(async () => {
    setIsLoadingFormData(true);
    setFormMessage(null); // Clear previous form messages
    try {
      const [usersResponse, venuesResponse] = await Promise.all([
        api.get<FullUserType[]>('/admin/users'), // This endpoint exists
        api.get<VenueOption[]>('/admin/venues-list') // IMPORTANT: Ensure backend route GET /admin/venues-list exists
      ]);

      if (Array.isArray(usersResponse.data)) {
        const doctorUsers = usersResponse.data
          .filter(user => user.role === 'doctor')
          .sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        setDoctors(doctorUsers.map(doc => ({ _id: doc._id, name: doc.name })));
      } else {
        console.error("API response for /admin/users is not an array:", usersResponse.data);
        setDoctors([]);
        setFormMessage({type: 'error', text: "Received invalid data for users/doctors."})
      }
      
      if(Array.isArray(venuesResponse.data)) {
        setVenues(venuesResponse.data.sort((a, b) => (a.name || "").localeCompare(b.name || "")));
      } else {
        console.error("API response for /admin/venues-list is not an array:", venuesResponse.data);
        setVenues([]);
        setFormMessage({type: 'error', text: "Received invalid data for venues. Admin may need to create the GET /admin/venues-list endpoint."})
      }

    } catch (err: unknown) {
      setFormMessage({type: 'error', text: `Failed to load doctors/venues: ${getErrorMessage(err)}`});
    } finally {
        setIsLoadingFormData(false);
    }
  }, []);


  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  useEffect(() => {
    if (isFormOpen) {
        fetchFormDropdownData();
    }
  }, [isFormOpen, fetchFormDropdownData]);


  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    setFormMessage(null);

    if (!regionName || !selectedDoctorId || !selectedVenueId) {
      setFormMessage({ type: 'error', text: 'Region Name, Doctor, and Venue are required.' });
      setIsSubmittingForm(false);
      return;
    }

    const payload = {
      name: regionName,
      doctor: selectedDoctorId,
      venue: selectedVenueId,
    };

    try {
      if (editingRegion) {
        // IMPORTANT: Backend needs a PUT /admin/region/:id endpoint for this to work
        // For now, this is a SIMULATED update:
        // await api.put(`/admin/region/${editingRegion._id}`, payload); 
        setFormMessage({ type: 'success', text: `Region "${regionName}" update simulated. Backend PUT endpoint needed.` });
        
        const updatedDoctorInfo = doctors.find(d => d._id === selectedDoctorId) || (typeof editingRegion.doctor === 'object' ? editingRegion.doctor : { _id: selectedDoctorId, name: 'Unknown Doctor' });
        const updatedVenueInfo = venues.find(v => v._id === selectedVenueId) || (typeof editingRegion.venue === 'object' ? editingRegion.venue : { _id: selectedVenueId, name: 'Unknown Venue' });

        setRegions(regions.map(r => r._id === editingRegion._id ? {
            ...editingRegion, 
            name: regionName,
            doctor: updatedDoctorInfo, 
            venue: updatedVenueInfo,
         } : r).sort((a, b) => a.name.localeCompare(b.name)));
         resetForm(); // Close form, clear fields

      } else {
        await api.post('/admin/region', payload); // This endpoint exists
        setFormMessage({ type: 'success', text: `Region "${regionName}" added successfully.` });
        resetForm(); 
        fetchRegions(); 
      }
    } catch (err: unknown) {
      setFormMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEdit = (region: IRegionAdminView) => {
    setEditingRegion(region);
    setRegionName(region.name);
    // Handle if doctor/venue is already an object or just an ID string
    setSelectedDoctorId(typeof region.doctor === 'string' ? region.doctor : region.doctor._id);
    setSelectedVenueId(typeof region.venue === 'string' ? region.venue : region.venue._id);
    setIsFormOpen(true);
    setFormMessage(null);
    if (!isFormOpen) fetchFormDropdownData(); // Fetch if form wasn't already open
  };

  const resetForm = () => {
    setEditingRegion(null);
    setRegionName('');
    setSelectedDoctorId('');
    setSelectedVenueId('');
    setIsFormOpen(false); 
    setFormMessage(null);
  };

  const handleDeleteRegion = async (regionId: string, name: string) => {
    setListMessage(null);
    try {
      await api.delete(`/admin/region/${regionId}`); // Uses new backend DELETE endpoint
      setRegions(prevRegions => prevRegions.filter(r => r._id !== regionId));
      setListMessage({type: 'success', text: `Region "${name}" deleted successfully.`});
    } catch (err) {
        setListMessage({type: 'error', text: `Failed to delete region "${name}": ${getErrorMessage(err)}`});
    }
  };
  
  const getDoctorName = (doctorData: DoctorOption | string | undefined): string => {
    if (!doctorData) return 'N/A';
    if (typeof doctorData === 'string') { 
      return doctors.find(d => d._id === doctorData)?.name || doctorData;
    }
    return doctorData.name || 'Unnamed Doctor'; 
  };

  const getVenueName = (venueData: VenueOption | string | undefined): string => {
    if (!venueData) return 'N/A';
    if (typeof venueData === 'string') { 
      return venues.find(v => v._id === venueData)?.name || venueData;
    }
    return venueData.name || 'Unnamed Venue';
  };


  if (isLoading && regions.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <MapPin className="w-8 h-8 text-cyan-600" />
          <h1 className="text-3xl font-bold text-slate-800">Manage Regions</h1>
        </div>
        <Button size="lg" onClick={() => { resetForm(); setEditingRegion(null); setIsFormOpen(true); }}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Region
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>{editingRegion ? 'Edit Region' : 'Add New Region'}</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm}><XCircle className="w-5 h-5"/></Button>
            </div>
          </CardHeader>
          <CardContent>
            {formMessage && (
              <div className={`mb-4 p-3 rounded-md text-sm ${formMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {formMessage.text}
              </div>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <Label htmlFor="regionName">Region Name*</Label>
                <Input id="regionName" value={regionName} onChange={e => setRegionName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="selectedDoctorId"><DoctorIcon className="inline w-4 h-4 mr-1"/> Assign Doctor*</Label>
                <Select id="selectedDoctorId" value={selectedDoctorId} 
                        onChange={e => setSelectedDoctorId(e.target.value)} required
                        disabled={isLoadingFormData || doctors.length === 0}
                        options={doctors.map(d => ({value: d._id, label: d.name || "Unnamed Doctor"}))}
                        placeholder={isLoadingFormData ? "Loading doctors..." : doctors.length === 0 ? "No doctors available" : "-- Select a Doctor --"}
                />
                {doctors.length === 0 && !isLoadingFormData && <p className="text-xs text-red-500 mt-1">No doctors available. Create a doctor first.</p>}
              </div>
              <div>
                <Label htmlFor="selectedVenueId"><Building className="inline w-4 h-4 mr-1"/> Assign Venue*</Label>
                <Select id="selectedVenueId" value={selectedVenueId} 
                        onChange={e => setSelectedVenueId(e.target.value)} required
                        disabled={isLoadingFormData || venues.length === 0}
                        options={venues.map(v => ({value: v._id, label: v.name || "Unnamed Venue"}))}
                        placeholder={isLoadingFormData ? "Loading venues..." : venues.length === 0 ? "No venues available" : "-- Select a Venue --"}
                />
                 {venues.length === 0 && !isLoadingFormData && <p className="text-xs text-red-500 mt-1">No venues available. Create a venue first.</p>}
              </div>
               <div className="flex justify-end space-x-2">
                 <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                 <Button type="submit" isLoading={isSubmittingForm || isLoadingFormData}>
                    {isSubmittingForm ? (editingRegion ? 'Updating...' : 'Adding...') : (editingRegion ? 'Save Changes' : 'Add Region')}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error Loading Regions</p>
            <p>{error}</p>
             <Button onClick={fetchRegions} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
                <RotateCcw className="w-4 h-4 mr-2"/> Retry
            </Button>
        </div>
      )}
      {listMessage && (
        <div className={`p-3 rounded-md text-sm ${listMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {listMessage.text}
        </div>
      )}


      <Card>
        <CardHeader>
          <CardTitle>Available Regions</CardTitle>
          <CardDescription>List of vaccination regions.</CardDescription>
        </CardHeader>
        <CardContent>
           {regions.length === 0 && !isLoading ? (
             <div className="text-center py-10">
                <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50"/>
                <p className="text-xl text-slate-600">No regions found.</p>
                <p className="text-sm text-slate-500">Click "Add New Region" to create one.</p>
            </div>
           ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Region Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Doctor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Assigned Venue</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {regions.map(region => (
                    <tr key={region._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{region.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getDoctorName(region.doctor)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{getVenueName(region.venue)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(region)} title="Edit Region">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm" title="Delete Region"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Are you sure you want to delete region: <strong>{region.name}</strong>? This action cannot be undone and may affect schedules.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteRegion(region._id, region.name)} className="bg-red-600 hover:bg-red-700">
                                    Delete Region
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
           )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageRegionsPage;