import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { Select } from '../../components/ui/Select';
import { getErrorMessage, formatDate } from '../../lib/utils';
import { UserPlus, AlertTriangle, CheckCircle } from 'lucide-react'; // Users for Gender
import { GENDERS } from '../../constants';

const AddChildPage: React.FC = () => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const genderOptions = [
    { value: GENDERS.MALE, label: 'Male' },
    { value: GENDERS.FEMALE, label: 'Female' },
    { value: GENDERS.OTHER, label: 'Other' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsLoading(true);

    if (!name || !dob || !gender) {
      setMessage({ type: 'error', text: 'Please fill in all fields.' });
      setIsLoading(false);
      return;
    }

    // DOB validation: Ensure DOB is not in the future
    const dateOfBirth = new Date(dob);
    const today = new Date();
    today.setHours(0,0,0,0); // Compare dates only

    if (dateOfBirth > today) {
        setMessage({type: 'error', text: 'Date of birth cannot be in the future.'});
        setIsLoading(false);
        return;
    }


    try {
      await api.post('/parent/add-child', { name, dob, gender });
      setMessage({ type: 'success', text: 'Child added successfully! Redirecting...' });
      setTimeout(() => {
        navigate('/parent/children');
      }, 1500);
    } catch (err: unknown) {
      setMessage({ type: 'error', text: getErrorMessage(err) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex items-center space-x-3">
            <UserPlus className="w-8 h-8 text-cyan-600" />
            <h1 className="text-3xl font-bold text-slate-800">Add New Child</h1>
        </div>

      <Card>
        <CardHeader>
          <CardTitle>Child's Information</CardTitle>
          <CardDescription>Enter the details of your child below.</CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`mb-4 p-3 rounded-md flex items-center text-sm ${
                message.type === 'success' ? 'bg-green-100 border border-green-400 text-green-700' 
                                          : 'bg-red-100 border border-red-400 text-red-700'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
              {message.text}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Child's full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dob">Date of Birth</Label>
              <Input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                max={formatDate(new Date().toString(), 'yyyy-MM-dd')} // Prevent future dates
              />
            </div>
            <div>
              <Label htmlFor="gender">Gender</Label>
              <Select
                id="gender"
                options={genderOptions}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                placeholder="Select gender"
                required
              />
            </div>
            <Button type="submit" className="w-full" isLoading={isLoading} size="lg">
              <UserPlus className="w-4 h-4 mr-2" />
              {isLoading ? 'Adding Child...' : 'Add Child'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddChildPage;