import React, { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import api from '../../lib/api';
import type { Vaccine as IVaccineType } from '../../types'; // Using the interface from types/index.ts
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Textarea } from '../../components/ui/Textarea';
import { Spinner } from '../../components/ui/Spinner';
import { getErrorMessage } from '../../lib/utils';
import { PlusCircle, Trash2, Edit3, AlertTriangle, XCircle, RotateCcw, Pill, ChevronsUpDown } from 'lucide-react';
// Assuming you'll use basic AlertDialog similar to ManageUsersPage or build one
// For now, standard window.confirm for delete confirmation.
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/AlertDialog";


const ManageVaccinesPage: React.FC = () => {
  const [vaccines, setVaccines] = useState<IVaccineType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [listMessage, setListMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Form state for adding/editing vaccine
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<IVaccineType | null>(null);
  const [vaccineName, setVaccineName] = useState('');
  const [description, setDescription] = useState('');
  const [doses, setDoses] = useState<number | string>(1);
  const [minAge, setMinAge] = useState<number | string>('');
  const [maxAge, setMaxAge] = useState<number | string | undefined>(undefined); // string for input, number for submit
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);


  const fetchVaccines = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setListMessage(null);
    try {
      const response = await api.get<IVaccineType[]>('/vaccines'); // Using assumed /vaccines GET endpoint
      setVaccines(response.data.sort((a,b) => a.name.localeCompare(b.name)));
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVaccines();
  }, [fetchVaccines]);

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingForm(true);
    setFormMessage(null);

    if (!vaccineName || doses === '' || minAge === '') {
      setFormMessage({ type: 'error', text: 'Name, Doses, and Minimum Age are required.' });
      setIsSubmittingForm(false);
      return;
    }

    const numDoses = parseInt(String(doses), 10);
    const numMinAge = parseInt(String(minAge), 10);
    const numMaxAge = (maxAge !== undefined && String(maxAge).trim() !== '') ? parseInt(String(maxAge), 10) : undefined;

     if (numDoses <= 0) {
      setFormMessage({type: 'error', text: 'Doses must be a positive number.'});
      setIsSubmittingForm(false);
      return;
    }
     if (numMinAge < 0) {
      setFormMessage({type: 'error', text: 'Minimum age must be a non-negative number.'});
      setIsSubmittingForm(false);
      return;
    }
    if (numMaxAge !== undefined && (numMaxAge < numMinAge)) { // Simpler check, backend validates NaN
      setFormMessage({type: 'error', text: 'Maximum age cannot be less than minimum age.'});
      setIsSubmittingForm(false);
      return;
    }

    const payload = {
      name: vaccineName,
      description: description || undefined,
      doses: numDoses,
      minAgeInMonths: numMinAge,
      maxAgeInMonths: numMaxAge,
    };

        try {
      if (editingVaccine && editingVaccine._id) { // Check for _id too
        // ----- MAKE THE ACTUAL API CALL FOR UPDATE -----
        const response = await api.put(`/admin/vaccine/${editingVaccine._id}`, payload);
        setFormMessage({ type: 'success', text: `Vaccine "${response.data.name}" updated successfully.` });
      } else {
        const response = await api.post('/admin/vaccine', payload);
        setFormMessage({ type: 'success', text: `Vaccine "${response.data.name}" added successfully.` });
      }
      resetForm(); // This also calls setIsFormOpen(false)
      fetchVaccines(); // Re-fetch to show updated list
    } catch (err) { // TypeScript infers 'unknown' type for catch variable
      setFormMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleEdit = (vaccine: IVaccineType) => {
    setEditingVaccine(vaccine);
    setVaccineName(vaccine.name);
    setDescription(vaccine.description || '');
    setDoses(vaccine.doses);
    setMinAge(vaccine.minAgeInMonths);
    setMaxAge(vaccine.maxAgeInMonths !== undefined ? vaccine.maxAgeInMonths : '');
    setIsFormOpen(true);
    setFormMessage(null);
  };

  const resetForm = () => {
    setEditingVaccine(null);
    setVaccineName('');
    setDescription('');
    setDoses(1);
    setMinAge('');
    setMaxAge('');
    setIsFormOpen(false);
    // setFormMessage(null); // Keep form message for success indication
  };

  const handleDeleteVaccine = async (vaccineId: string, vaccineName: string) => {
    // Basic confirmation for now, replace with AlertDialog later if desired
    if (!window.confirm(`Are you sure you want to delete vaccine: ${vaccineName}? This might affect existing schedules.`)) {
      return;
    }
    setListMessage(null);
    try {
      await api.delete(`/admin/vaccine/${vaccineId}`);
      setListMessage({ type: 'success', text: `Vaccine "${vaccineName}" deleted.`});
      fetchVaccines(); // Re-fetch
    } catch (err) {
      setListMessage({type: 'error', text: getErrorMessage(err)});
    }
  };

  if (isLoading && vaccines.length === 0) {
    return <div className="flex justify-center items-center h-64"><Spinner size="lg" /></div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center space-x-3">
          <Pill className="w-8 h-8 text-cyan-600" />
          <h1 className="text-3xl font-bold text-slate-800">Manage Vaccines</h1>
        </div>
        <Button size="lg" onClick={() => { resetForm(); setIsFormOpen(true); setEditingVaccine(null); }}>
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Vaccine
        </Button>
      </div>

      {isFormOpen && (
        <Card className="mb-6 transition-all duration-300 ease-in-out">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle>{editingVaccine ? 'Edit Vaccine' : 'Add New Vaccine'}</CardTitle>
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
                <Label htmlFor="vaccineName">Vaccine Name*</Label>
                <Input id="vaccineName" value={vaccineName} onChange={e => setVaccineName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={description} onChange={e => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="doses">Doses Required*</Label>
                  <Input id="doses" type="number" value={doses} onChange={e => setDoses(e.target.value)} min="1" required />
                </div>
                <div>
                  <Label htmlFor="minAge">Min. Age (months)*</Label>
                  <Input id="minAge" type="number" value={minAge} onChange={e => setMinAge(e.target.value)} min="0" placeholder="e.g., 2 for 2 months" required/>
                </div>
                <div>
                  <Label htmlFor="maxAge">Max. Age (months)</Label>
                  <Input id="maxAge" type="number" value={maxAge === undefined ? '' : maxAge} onChange={e => setMaxAge(e.target.value)} min="0" placeholder="Optional, e.g., 6" />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                 <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                 <Button type="submit" isLoading={isSubmittingForm}>
                    {isSubmittingForm ? (editingVaccine ? 'Updating...' : 'Adding...') : (editingVaccine ? 'Save Changes' : 'Add Vaccine')}
                 </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold flex items-center"><AlertTriangle className="mr-2"/>Error Loading Vaccines</p>
            <p>{error}</p>
             <Button onClick={fetchVaccines} variant="outline" size="sm" className="mt-2 border-red-300 text-red-600 hover:bg-red-50">
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
          <CardTitle>Available Vaccines</CardTitle>
          <CardDescription>List of all vaccines in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          {vaccines.length === 0 && !isLoading ? (
            <div className="text-center py-10">
                <Pill className="w-16 h-16 text-slate-400 mx-auto mb-4 opacity-50"/>
                <p className="text-xl text-slate-600">No vaccines found.</p>
                <p className="text-sm text-slate-500">Click "Add New Vaccine" to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Doses</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        <ChevronsUpDown className="inline w-4 h-4 mr-1"/> Age (Months)
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Description</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {vaccines.map(vaccine => (
                    <tr key={vaccine._id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{vaccine.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{vaccine.doses}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {vaccine.minAgeInMonths}mo {vaccine.maxAgeInMonths ? `- ${vaccine.maxAgeInMonths}mo` : '+'}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate" title={vaccine.description}>{vaccine.description || 'N/A'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(vaccine)} title="Edit">
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteVaccine(vaccine._id, vaccine.name)} title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </Button>
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

export default ManageVaccinesPage;