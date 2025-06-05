import React, { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import api from '../../lib/api';
import type { Venue as IVenueType } from '../../types'; // Using your IVenueType
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage, formatDate } from '../../lib/utils';
import { Building, PlusCircle, Trash2, Edit3, AlertTriangle, XCircle, RotateCcw } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../components/ui/AlertDialog";


const ManageVenuesPage: React.FC = () => {
  const [venues, setVenues] = useState<IVenueType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [listMessage, setListMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<IVenueType | null>(null);
  const [venueName, setVenueName] = useState('');
  const [venueContact, setVenueContact] = useState('');
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);


  const fetchVenues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setListMessage(null);
    try {
      // IMPORTANT: Ensure backend GET /admin/venues-list exists
      const response = await api.get<IVenueType[]>('/admin/venues-list'); 
      setVenues(response.data.sort((a,b) => (a.name || "").localeCompare(b.name || "")));
    } catch (err) {
      setError(`Failed to fetch venues. Admin may need to create GET /admin/venues-list. Error: ${getErrorMessage(err)}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVenues();
  }, [fetchVenues]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    setFormMessage(null);

    if (!venueName || !venueContact) {
      setFormMessage({ type: 'error', text: 'Venue Name and Contact information are required.' });
      setIsSubmittingForm(false);
      return;
    }

    const payload = {
      name: venueName,
      contact: venueContact,
    };

    try {
      if (editingVenue) {
        // IMPORTANT: Backend needs a PUT /admin/venue/:id endpoint
        // await api.put(`/admin/venue/${editingVenue._id}`, payload);
        setFormMessage({ type: 'success', text: `Venue "${venueName}" update simulated. Backend PUT endpoint needed.` });
        setVenues(venues.map(v => v._id === editingVenue._id ? {...editingVenue, ...payload } : v).sort((a,b) => a.name.localeCompare(b.name)));
        resetForm();
      } else {
        await api.post('/admin/venue', payload); // This endpoint exists
        setFormMessage({ type: 'success', text: `Venue "${venueName}" added successfully.` });
        resetForm();
        fetchVenues(); 
      }
    } catch (err) {
      setFormMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEdit = (venue: IVenueType) => {
    setEditingVenue(venue);
    setVenueName(venue.name);
    setVenueContact(venue.contact);
    setIsFormOpen(true);
    setFormMessage(null);
  };

  const resetForm = () => {
    setEditingVenue(null);
    setVenueName('');
    setVenueContact('');
    setIsFormOpen(false);
    setFormMessage(null);
  };

  const handleDeleteVenue = async (venueId: string, name: string) => {
    setListMessage(null);
    try {
      await api.delete(`/admin/venue/${venueId}`); // Uses new backend DELETE endpoint
      setVenues(venues.filter(v => v._id !== venueId));
      setListMessage({ type: 'success', text: `Venue "${name}" deleted successfully.`});
    } catch (err) {
      setListMessage({type: 'error', text: `Failed to delete venue "${name}": ${getErrorMessage(err)}`});
    }
  };

  if (isLoading && venues.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <Building className="w-8 h-8 text-cyan-600" />
          <h1 className="text-3xl font-bold text-slate-800">Manage Venues</h1>
        </div>
        <Button size="lg" onClick={() => { resetForm(); setEditingVenue(null); setIsFormOpen(true); }}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Venue
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6">
           <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>{editingVenue ? 'Edit Venue' : 'Add New Venue'}</CardTitle>
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
                <Label htmlFor="venueName">Venue Name*</Label>
                <Input id="venueName" value={venueName} onChange={e => setVenueName(e.target.value)} placeholder="e.g., City Clinic Downtown" required />
              </div>
              <div>
                <Label htmlFor="venueContact">Contact Information* (Address/Phone)</Label>
                <Textarea id="venueContact" value={venueContact} onChange={e => setVenueContact(e.target.value)} placeholder="123 Main St, Anytown, USA / (555) 123-4567" required rows={3} />
              </div>
              <div className="flex justify-end space-x-2">
                 <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                 <Button type="submit" isLoading={isSubmittingForm}>
                    {isSubmittingForm ? (editingVenue ? 'Updating...' : 'Adding...') : (editingVenue ? 'Save Changes' : 'Add Venue')}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error Loading Venues</p>
            <p>{error}</p>
            <Button onClick={fetchVenues} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
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
          <CardTitle>Available Venues</CardTitle>
          <CardDescription>List of all vaccination venues.</CardDescription>
        </CardHeader>
        <CardContent>
          {venues.length === 0 && !isLoading ? (
            <div className="text-center py-10">
                <Building className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50"/>
                <p className="text-xl text-slate-600">No venues found.</p>
                <p className="text-sm text-slate-500">Click "Add New Venue" to create one.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Venue Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Contact Info</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Added On</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {venues.map(venue => (
                    <tr key={venue._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{venue.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs md:max-w-md" title={venue.contact}>
                        <p className="truncate">{venue.contact}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{venue.createdAt ? formatDate(venue.createdAt, 'PP') : 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(venue)} title="Edit Venue">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                               <Button variant="destructive" size="sm" title="Delete Venue"><Trash2 className="w-4 h-4" /></Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
                                    <AlertDialogDescription>
                                    Are you sure you want to delete venue: <strong>{venue.name}</strong>? This action cannot be undone and may affect regions.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteVenue(venue._id, venue.name)} className="bg-red-600 hover:bg-red-700">
                                    Delete Venue
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

export default ManageVenuesPage;